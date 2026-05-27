import { NextRequest, NextResponse } from 'next/server'

const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET
const SUPABASE_URL           = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY   = process.env.SUPABASE_SERVICE_ROLE_KEY!

async function supabaseAdmin(table: string, method: string, body: any, match?: string) {
  const url = `${SUPABASE_URL}/rest/v1/${table}${match ? `?${match}` : ''}`
  await fetch(url, {
    method,
    headers: {
      'apikey': SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal',
    },
    body: JSON.stringify(body),
  })
}

export async function POST(req: NextRequest) {
  const body      = await req.text()
  const signature = req.headers.get('stripe-signature') ?? ''

  // En producción verificar la firma del webhook
  // Por ahora procesamos sin verificación (agregar stripe npm para verificar)

  let event: any
  try {
    event = JSON.parse(body)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const schoolId = event.data?.object?.metadata?.school_id

  switch (event.type) {
    case 'checkout.session.completed':
    case 'invoice.paid':
      // Pago exitoso — marcar escuela como activa y guardar stripe_customer_id
      if (schoolId) {
        await supabaseAdmin('schools', 'PATCH',
          { status: 'active', stripe_subscription_active: true },
          `id=eq.${schoolId}`
        )
      }
      break

    case 'invoice.payment_failed':
    case 'customer.subscription.deleted':
      // Pago fallido o suscripción cancelada
      if (schoolId) {
        await supabaseAdmin('schools', 'PATCH',
          { stripe_subscription_active: false },
          `id=eq.${schoolId}`
        )
      }
      break
  }

  return NextResponse.json({ received: true })
}
