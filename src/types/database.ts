// ══════════════════════════════════════════════
// TIPOS DE LA BASE DE DATOS — EncuentraTuDojo
// Modelo: comisión por alumnos (v2)
// ══════════════════════════════════════════════

export type UserType      = 'alumno' | 'escuela' | 'admin'
export type SchoolStatus  = 'pending' | 'active' | 'suspended'
export type CommissionTier = 'sin_alumnos' | 'pequeño' | 'media' | 'grande' | 'premium' | 'multisede' | 'franquicia'
export type LeadType      = 'contacto' | 'favorito' | 'trial' | 'inscripcion' | 'mensaje'
export type LeadStatus    = 'nuevo' | 'contactado' | 'convertido' | 'completado'
export type BookingStatus = 'pendiente' | 'confirmada' | 'completada' | 'cancelada'
export type AnnouncementType   = 'promo' | 'evento' | 'novedad' | 'clase' | 'torneo' | 'otro'
export type AnnouncementStatus = 'activo' | 'borrador' | 'pausado'
export type ContactEventType   = 'whatsapp_click' | 'email_click' | 'trial_started' | 'trial_confirmed' | 'profile_view'

// ── Usuarios ──
export interface User {
  id:           string
  type:         UserType
  first_name:   string
  last_name:    string
  email:        string
  city:         string
  neighborhood: string
  avatar_url:   string | null
  created_at:   string
  updated_at:   string
}

// ── Disciplinas ──
export interface Discipline {
  id:         string
  label:      string
  kanji:      string
  color:      string
  sort_order: number
}

// ── Escuelas ──
export interface School {
  id:              number
  owner_id:        string | null
  name:            string
  slug:            string
  discipline_id:   string
  description:     string
  description2:    string
  address:         string
  city:            string
  neighborhood:    string
  postal_code:     string
  province:        string
  lat:             number | null
  lng:             number | null
  phone:           string
  whatsapp:        string
  email:           string
  instagram:       string
  website:         string
  founded_year:    number | null
  kanji:           string
  verified:        boolean
  premium:         boolean          // destacado visualmente (puede mantenerse)
  status:          SchoolStatus
  // ── Modelo de comisión ──
  student_count:   number           // alumnos declarados al registrarse
  commission_tier: CommissionTier   // calculado automáticamente por la DB
  monthly_fee_usd: number           // fee mensual en USD (calculado)
  is_franchise:    boolean          // franquicia — acuerdo especial
  franchise_note:  string
  // ── Métricas ──
  rating:          number
  review_count:    number
  lead_count:      number
  // ── Info pública ──
  stat1_val:       string
  stat1_label:     string
  stat2_val:       string
  stat2_label:     string
  stat3_val:       string
  stat3_label:     string
  certifications:  string
  available_spots: string
  created_at:      string
  updated_at:      string
  // ── Relaciones (joins) ──
  discipline?:     Discipline
  subcats?:        SchoolSubcat[]
  instructors?:    Instructor[]
}

// ── Tiers de comisión — info útil para mostrar ──
export const COMMISSION_TIERS: Record<CommissionTier, {
  label: string; range: string; rate: number; color: string
}> = {
  sin_alumnos: { label: 'Sin alumnos',   range: '0',        rate: 0,    color: '#888780' },
  pequeño:     { label: 'Dojo pequeño',  range: '1 – 40',   rate: 0.30, color: '#888780' },
  media:       { label: 'Escuela media', range: '41 – 100', rate: 0.25, color: '#185FA5' },
  grande:      { label: 'Academia grande', range: '101 – 200', rate: 0.20, color: '#3B6D11' },
  premium:     { label: 'Centro premium',  range: '201 – 400', rate: 0.15, color: '#BA7517' },
  multisede:   { label: 'Multi-sede',      range: '401+',      rate: 0.10, color: '#A32D2D' },
  franquicia:  { label: 'Franquicia',      range: 'Acuerdo especial', rate: 0, color: '#C8A96E' },
}

// ── Subcategorías ──
export interface SchoolSubcat {
  id:         number
  school_id:  number
  name:       string
  sort_order: number
}

// ── Instructores ──
export interface Instructor {
  id:         number
  school_id:  number
  initials:   string
  name:       string
  grade:      string
  cert:       string
  sort_order: number
}

// ── Leads ──
export interface Lead {
  id:          string
  school_id:   number
  user_id:     string | null
  type:        LeadType
  status:      LeadStatus
  source:      string   // 'whatsapp' | 'mensaje' | 'trial' | 'favorito' | 'directo'
  source_page: string
  name:        string
  email:       string
  phone:       string
  note:        string
  created_at:  string
}

// ── Eventos de contacto (tracking) ──
export interface ContactEvent {
  id:         number
  school_id:  number
  user_id:    string | null
  event_type: ContactEventType
  source:     string
  meta:       Record<string, any>
  created_at: string
}

// ── Reservas ──
export interface Booking {
  id:         string
  school_id:  number
  user_id:    string | null
  name:       string
  email:      string
  phone:      string
  level:      string
  slot_day:   string
  slot_time:  string
  note:       string
  status:     BookingStatus
  created_at: string
  updated_at: string
  school?:    Pick<School, 'id' | 'name' | 'slug' | 'discipline_id' | 'kanji'>
}

// ── Reseñas ──
export interface Review {
  id:         string
  school_id:  number
  user_id:    string | null
  author:     string
  rating:     number
  text:       string
  reported:   boolean
  created_at: string
}

// ── Favoritos ──
export interface Favorite {
  id:         number
  user_id:    string
  school_id:  number
  created_at: string
  school?:    Pick<School, 'id' | 'name' | 'slug' | 'discipline_id' | 'kanji' | 'neighborhood' | 'city' | 'rating' | 'review_count' | 'verified' | 'premium'>
}

// ── Anuncios ──
export interface Announcement {
  id:          number
  school_id:   number
  type:        AnnouncementType
  status:      AnnouncementStatus
  title:       string
  description: string
  date_start:  string | null
  date_end:    string | null
  location:    string
  time_info:   string
  enrollment:  string
  url:         string
  views:       number
  clicks:      number
  created_at:  string
  updated_at:  string
  school?:     Pick<School, 'id' | 'name' | 'slug' | 'kanji' | 'premium' | 'discipline_id'>
}

// ── Filtros del buscador ──
export interface SearchFilters {
  query:      string
  discipline: string | null
  subcats:    string[]
  sort:       'relevancia' | 'rating' | 'alumnos'
}
