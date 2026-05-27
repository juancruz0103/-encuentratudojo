import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const STRIPE_SECRET = process.env.STRIPE_SECRET_KEY
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://encuentratudojo.vercel.app'

export async function POST(req: NextRequest) {
  if (!STRIPE_SECRET) {
    return NextResponse.json({ error: 'Stripe no configurado' }, { status: 500 })
  }

  // Verificar autenticación
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: (s) => s.forEach(({ name, value, options }) => cookieStore.set(name, value, options)) } }
  )
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  // Obtener la escuela del usuario
  const { data: school } = await supabase
    .from('schools')
    .select('id, name, student_count, monthly_fee_usd, commission_tier')
    .eq('owner_id', user.id)
    .single()

  if (!school) return NextResponse.json({ error: 'Escuela no encontrada' }, { status: 404 })

  const feeUsd = parseFloat(school.monthly_fee_usd)
  if (feeUsd <= 0) return NextResponse.json({ error: 'Fee inválido' }, { status: 400 })

  // Crear Checkout Session en Stripe
  const params = new URLSearchParams({
    'mode': 'subscription',
    'payment_method_types[]': 'card',
    'line_items[0][price_data][currency]': 'usd',
    'line_items[0][price_data][product_data][name]': `EncuentraTuDojo — ${school.name}`,
    'line_items[0][price_data][product_data][description]': `Comisión mensual: ${school.student_count} alumnos × tarifa ${school.commission_tier}`,
    'line_items[0][price_data][recurring][interval]': 'month',
    'line_items[0][price_data][unit_amount]': String(Math.round(feeUsd * 100)), // en centavos
    'line_items[0][quantity]': '1',
    'success_url': `${APP_URL}/dashboard?payment=success`,
    'cancel_url': `${APP_URL}/dashboard?payment=cancelled`,
    'metadata[school_id]': String(school.id),
    'metadata[user_id]': user.id,
    'customer_email': user.email ?? '',
  })

  const res = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${STRIPE_SECRET}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  })

  const session = await res.json()
  if (!res.ok) return NextResponse.json({ error: session.error?.message }, { status: 400 })

  return NextResponse.json({ url: session.url })
}
