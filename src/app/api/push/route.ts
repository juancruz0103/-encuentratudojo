import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const VAPID_PUBLIC  = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY!
const SUPABASE_URL  = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SERVICE_KEY   = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Guardar suscripción push
export async function POST(req: NextRequest) {
  const body = await req.json()
  const { action, subscription, schoolId } = body

  const cookieStore = await cookies()
  const supabase = createServerClient(
    SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: (s) => s.forEach(({ name, value, options }) => cookieStore.set(name, value, options)) } }
  )
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  if (action === 'subscribe') {
    // Guardar suscripción en Supabase
    await supabase.from('push_subscriptions').upsert({
      user_id:   user.id,
      school_id: schoolId,
      endpoint:  subscription.endpoint,
      p256dh:    subscription.keys.p256dh,
      auth:      subscription.keys.auth,
    }, { onConflict: 'endpoint' })
    return NextResponse.json({ ok: true })
  }

  if (action === 'unsubscribe') {
    await supabase.from('push_subscriptions')
      .delete().eq('user_id', user.id).eq('endpoint', subscription.endpoint)
    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ error: 'Acción inválida' }, { status: 400 })
}

// Enviar notificación push a todas las suscripciones de una escuela
export async function PUT(req: NextRequest) {
  const body = await req.json()
  const { schoolId, title, message } = body

  // Obtener todas las suscripciones de la escuela
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/push_subscriptions?school_id=eq.${schoolId}`,
    { headers: { 'apikey': SERVICE_KEY, 'Authorization': `Bearer ${SERVICE_KEY}` } }
  )
  const subs = await res.json()
  if (!Array.isArray(subs) || subs.length === 0) return NextResponse.json({ sent: 0 })

  // Enviar push a cada suscripción usando la Web Push API manual
  const payload = JSON.stringify({ title, body: message, icon: '/icons/icon-192.svg', badge: '/icons/icon-192.svg' })

  let sent = 0
  for (const sub of subs) {
    try {
      // Web Push requiere firma VAPID — simplificado para demo
      const pushRes = await fetch(sub.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'TTL': '60' },
        body: payload,
      })
      if (pushRes.ok) sent++
    } catch {}
  }

  return NextResponse.json({ sent, total: subs.length })
}
