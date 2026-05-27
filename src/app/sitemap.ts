import { MetadataRoute } from 'next'

const BASE_URL = 'https://encuentratudojo.vercel.app'
const SUPABASE_URL  = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Páginas estáticas
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL,             lastModified: new Date(), changeFrequency: 'daily',   priority: 1.0 },
    { url: `${BASE_URL}/buscador`, lastModified: new Date(), changeFrequency: 'daily',   priority: 0.9 },
    { url: `${BASE_URL}/tablero`,  lastModified: new Date(), changeFrequency: 'daily',   priority: 0.8 },
    { url: `${BASE_URL}/auth`,     lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/registro`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
  ]

  // Páginas dinámicas — una por cada escuela
  let schoolPages: MetadataRoute.Sitemap = []
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/schools?select=slug,updated_at&status=eq.active`,
      { headers: { 'apikey': SUPABASE_ANON, 'Authorization': `Bearer ${SUPABASE_ANON}` } }
    )
    const schools = await res.json()
    schoolPages = schools.map((s: { slug: string; updated_at: string }) => ({
      url:             `${BASE_URL}/escuela/${s.slug}`,
      lastModified:    new Date(s.updated_at),
      changeFrequency: 'weekly' as const,
      priority:        0.8,
    }))
  } catch (e) {
    console.error('Sitemap error:', e)
  }

  return [...staticPages, ...schoolPages]
}
