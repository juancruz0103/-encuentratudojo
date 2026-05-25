// Cliente para queries públicas — fetch directo a REST API de Supabase
// No requiere autenticación, siempre funciona con anon key

const URL_BASE = process.env.NEXT_PUBLIC_SUPABASE_URL!
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const headers = {
  'apikey':        ANON_KEY,
  'Authorization': `Bearer ${ANON_KEY}`,
  'Content-Type':  'application/json',
  'Accept':        'application/json',
}

export async function fetchPublic(table: string, params: string = '') {
  const url = `${URL_BASE}/rest/v1/${table}?${params}`
  const res = await fetch(url, { headers, next: { revalidate: 60 } })
  if (!res.ok) {
    console.error(`fetchPublic [${table}]:`, await res.text())
    return []
  }
  return res.json()
}

// Registrar evento de contacto (tracking de clicks)
export async function trackContactEvent(
  schoolId: number,
  eventType: 'whatsapp_click' | 'email_click' | 'trial_started' | 'trial_confirmed' | 'profile_view',
  meta: Record<string, any> = {}
) {
  try {
    await fetch(`${URL_BASE}/rest/v1/contact_events`, {
      method: 'POST',
      headers: { ...headers, 'Prefer': 'return=minimal' },
      body: JSON.stringify({ school_id: schoolId, event_type: eventType, source: 'etd', meta }),
    })
  } catch (e) {
    // No bloquear la UX si falla el tracking
    console.warn('trackContactEvent error:', e)
  }
}

// ── Escuelas ──
export async function getPublicSchools() {
  return fetchPublic('schools', [
    'select=*,discipline:disciplines(*),subcats:school_subcats(name,sort_order)',
    'status=eq.active',
    'order=premium.desc,rating.desc',
  ].join('&'))
}

export async function getPublicSchoolBySlug(slug: string) {
  const data = await fetchPublic('schools', [
    'select=*,discipline:disciplines(*),subcats:school_subcats(name,sort_order),instructors:instructors(initials,name,grade,cert,sort_order)',
    `slug=eq.${slug}`,
    'status=eq.active',
    'limit=1',
  ].join('&'))
  return data[0] ?? null
}

// ── Disciplinas ──
export async function getPublicDisciplines() {
  return fetchPublic('disciplines', 'select=*&order=sort_order')
}

// ── Anuncios ──
export async function getPublicAnnouncements() {
  return fetchPublic('announcements', [
    'select=*,school:schools(id,name,slug,kanji,premium,discipline_id)',
    'status=eq.activo',
    'order=created_at.desc',
    'limit=20',
  ].join('&'))
}

// ── Top escuelas para sidebar ──
export async function getTopSchools(limit = 5) {
  return fetchPublic('schools', [
    `select=id,name,slug,kanji,premium,student_count,commission_tier,discipline_id,discipline:disciplines(label,color)`,
    'status=eq.active',
    'order=premium.desc,lead_count.desc',
    `limit=${limit}`,
  ].join('&'))
}
