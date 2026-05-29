import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const SUPABASE_URL      = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SERVICE_ROLE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST(req: NextRequest) {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: (s) => s.forEach(({ name, value, options }) => cookieStore.set(name, value, options)) } }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  // Obtener la escuela del dueño
  const { data: school } = await supabase.from('schools').select('id').eq('owner_id', user.id).single()
  if (!school) return NextResponse.json({ error: 'Escuela no encontrada' }, { status: 404 })

  const formData = await req.formData()
  const file = formData.get('file') as File
  if (!file) return NextResponse.json({ error: 'No se recibió archivo' }, { status: 400 })

  // Validar tipo y tamaño
  if (!file.type.startsWith('image/')) return NextResponse.json({ error: 'Solo se permiten imágenes' }, { status: 400 })
  if (file.size > 5 * 1024 * 1024) return NextResponse.json({ error: 'Máximo 5MB por foto' }, { status: 400 })

  // Subir a Supabase Storage usando service role
  const fileName = `schools/${school.id}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`
  const fileBuffer = await file.arrayBuffer()

  const uploadRes = await fetch(
    `${SUPABASE_URL}/storage/v1/object/school-photos/${fileName}`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Content-Type': file.type,
        'x-upsert': 'false',
      },
      body: fileBuffer,
    }
  )

  if (!uploadRes.ok) {
    const err = await uploadRes.text()
    // Si el bucket no existe, lo creamos
    if (err.includes('Bucket not found') || err.includes('bucket')) {
      await fetch(`${SUPABASE_URL}/storage/v1/bucket`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${SERVICE_ROLE_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: 'school-photos', name: 'school-photos', public: true }),
      })
      // Reintentar
      const retry = await fetch(
        `${SUPABASE_URL}/storage/v1/object/school-photos/${fileName}`,
        { method: 'POST', headers: { 'Authorization': `Bearer ${SERVICE_ROLE_KEY}`, 'Content-Type': file.type }, body: fileBuffer }
      )
      if (!retry.ok) return NextResponse.json({ error: 'Error al subir la foto' }, { status: 500 })
    } else {
      return NextResponse.json({ error: 'Error al subir la foto: ' + err }, { status: 500 })
    }
  }

  const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/school-photos/${fileName}`

  // Guardar en la tabla de fotos
  const { data: photo, error: dbErr } = await supabase.from('school_photos').insert({
    school_id: school.id,
    url: publicUrl,
    sort_order: 0,
  }).select().single()

  if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 500 })

  return NextResponse.json({ url: publicUrl, photo })
}

export async function DELETE(req: NextRequest) {
  const { photoId } = await req.json()

  const cookieStore = await cookies()
  const supabase = createServerClient(
    SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: (s) => s.forEach(({ name, value, options }) => cookieStore.set(name, value, options)) } }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  await supabase.from('school_photos').delete().eq('id', photoId)
  return NextResponse.json({ ok: true })
}
