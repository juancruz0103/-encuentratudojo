import { getPublicSchoolBySlug, getPublicSchools, getPublicSchoolSchedules } from '@/lib/supabase/public'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import SchoolProfileClient from './client'

export async function generateStaticParams() {
  const schools = await getPublicSchools()
  return schools.map((s: any) => ({ slug: s.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const school = await getPublicSchoolBySlug(slug)
  if (!school) return { title: 'Escuela no encontrada' }
  return {
    title: `${school.name} — ${school.discipline?.label} en ${school.neighborhood}`,
    description: school.description,
  }
}

export default async function SchoolPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const school = await getPublicSchoolBySlug(slug)
  if (!school) notFound()
  const schedules = await getPublicSchoolSchedules(school.id)
  return <SchoolProfileClient school={school} schedules={schedules ?? []} />
}
