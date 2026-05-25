import { createClient } from '@/lib/supabase/server'
import type { School, SearchFilters } from '@/types/database'

// ── Obtener todas las escuelas activas con disciplina y subcats ──
export async function getSchools(filters?: Partial<SearchFilters>) {
  const supabase = await createClient()

  let query = supabase
    .from('schools')
    .select(`
      *,
      discipline:disciplines(*),
      subcats:school_subcats(id, name, sort_order)
    `)
    .eq('status', 'active')
    .order('premium', { ascending: false })
    .order('rating', { ascending: false })

  if (filters?.discipline) {
    query = query.eq('discipline_id', filters.discipline)
  }

  if (filters?.query) {
    query = query.or(
      `name.ilike.%${filters.query}%,` +
      `neighborhood.ilike.%${filters.query}%,` +
      `city.ilike.%${filters.query}%,` +
      `description.ilike.%${filters.query}%`
    )
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching schools:', error)
    return []
  }

  return data as School[]
}

// ── Obtener una escuela por slug ──
export async function getSchoolBySlug(slug: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('schools')
    .select(`
      *,
      discipline:disciplines(*),
      subcats:school_subcats(id, name, sort_order),
      instructors:instructors(id, initials, name, grade, cert, sort_order)
    `)
    .eq('slug', slug)
    .eq('status', 'active')
    .single()

  if (error) {
    console.error('Error fetching school:', error)
    return null
  }

  return data as School
}

// ── Obtener escuela por ID ──
export async function getSchoolById(id: number) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('schools')
    .select(`
      *,
      discipline:disciplines(*),
      subcats:school_subcats(id, name, sort_order),
      instructors:instructors(id, initials, name, grade, cert, sort_order)
    `)
    .eq('id', id)
    .single()

  if (error) return null
  return data as School
}

// ── Obtener escuelas premium para la homepage ──
export async function getFeaturedSchools(limit = 6) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('schools')
    .select(`
      *,
      discipline:disciplines(*),
      subcats:school_subcats(id, name, sort_order)
    `)
    .eq('status', 'active')
    .eq('premium', true)
    .order('rating', { ascending: false })
    .limit(limit)

  if (error) return []
  return data as School[]
}

// ── Obtener escuela del usuario logueado (para dashboard) ──
export async function getMySchool(ownerId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('schools')
    .select(`
      *,
      discipline:disciplines(*),
      subcats:school_subcats(id, name, sort_order),
      instructors:instructors(id, initials, name, grade, cert, sort_order)
    `)
    .eq('owner_id', ownerId)
    .single()

  if (error) return null
  return data as School
}
