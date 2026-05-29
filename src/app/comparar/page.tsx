'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import NavBar from '@/components/NavBar'

const SUPABASE_URL  = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const H = { 'apikey': SUPABASE_ANON, 'Authorization': `Bearer ${SUPABASE_ANON}` }

async function fetchSchool(slug: string) {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/schools?slug=eq.${slug}&status=eq.active&select=*,discipline:disciplines(*),subcats:school_subcats(name,sort_order),instructors:instructors(name,grade,sort_order)&limit=1`,
    { headers: H }
  )
  const data = await res.json()
  return Array.isArray(data) ? data[0] ?? null : null
}

async function fetchSchedules(schoolId: number) {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/class_schedules?school_id=eq.${schoolId}&order=sort_order`,
    { headers: H }
  )
  return res.json()
}

async function fetchAllSchools() {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/schools?status=eq.active&select=id,name,slug,kanji,discipline_id,neighborhood,city,discipline:disciplines(label,color)&order=name`,
    { headers: H }
  )
  return res.json()
}

// ── Fila de comparación ──
function CompareRow({ label, a, b, highlight }: { label: string; a: any; b: any; highlight?: boolean }) {
  const aStr = String(a ?? '—')
  const bStr = String(b ?? '—')
  const aBetter = highlight && a && b && parseFloat(aStr) > parseFloat(bStr)
  const bBetter = highlight && a && b && parseFloat(bStr) > parseFloat(aStr)

  return (
    <tr style={{ borderTop:'1px solid rgba(122,92,58,0.07)' }}>
      <td style={{ padding:'12px 16px', fontSize:12, fontWeight:500, color:'var(--wood-light)', textTransform:'uppercase', letterSpacing:'0.08em', background:'var(--parchment-dark)', width:160, verticalAlign:'middle' }}>
        {label}
      </td>
      <td style={{ padding:'12px 20px', fontSize:14, color: aBetter ? 'var(--crimson)' : 'var(--ink)', fontWeight: aBetter ? 600 : 400, textAlign:'center', background: aBetter ? 'rgba(139,26,26,0.04)' : 'transparent', verticalAlign:'middle' }}>
        {aStr}{aBetter && ' ✓'}
      </td>
      <td style={{ padding:'12px 20px', fontSize:14, color: bBetter ? 'var(--crimson)' : 'var(--ink)', fontWeight: bBetter ? 600 : 400, textAlign:'center', background: bBetter ? 'rgba(139,26,26,0.04)' : 'transparent', verticalAlign:'middle' }}>
        {bStr}{bBetter && ' ✓'}
      </td>
    </tr>
  )
}

function ComparadorContent() {
  const searchParams  = useSearchParams()
  const [allSchools,  setAllSchools]  = useState<any[]>([])
  const [schoolA,     setSchoolA]     = useState<any>(null)
  const [schoolB,     setSchoolB]     = useState<any>(null)
  const [schedulesA,  setSchedulesA]  = useState<any[]>([])
  const [schedulesB,  setSchedulesB]  = useState<any[]>([])
  const [slugA,       setSlugA]       = useState(searchParams.get('a') ?? '')
  const [slugB,       setSlugB]       = useState(searchParams.get('b') ?? '')
  const [loading,     setLoading]     = useState(false)

  // Cargar lista de todas las escuelas
  useEffect(() => {
    fetchAllSchools().then(data => { if (Array.isArray(data)) setAllSchools(data) })
  }, [])

  // Cargar escuelas cuando cambian los slugs
  useEffect(() => {
    if (!slugA && !slugB) return
    setLoading(true)
    Promise.all([
      slugA ? fetchSchool(slugA) : Promise.resolve(null),
      slugB ? fetchSchool(slugB) : Promise.resolve(null),
    ]).then(async ([a, b]) => {
      setSchoolA(a)
      setSchoolB(b)
      const [sa, sb] = await Promise.all([
        a ? fetchSchedules(a.id) : Promise.resolve([]),
        b ? fetchSchedules(b.id) : Promise.resolve([]),
      ])
      setSchedulesA(Array.isArray(sa) ? sa : [])
      setSchedulesB(Array.isArray(sb) ? sb : [])
      setLoading(false)
      // Actualizar URL
      const params = new URLSearchParams()
      if (slugA) params.set('a', slugA)
      if (slugB) params.set('b', slugB)
      window.history.replaceState({}, '', `/comparar?${params.toString()}`)
    })
  }, [slugA, slugB])

  const colorA = schoolA?.discipline?.color ?? '#8b1a1a'
  const colorB = schoolB?.discipline?.color ?? '#2e86c1'

  return (
    <main style={{ minHeight:'100vh', background:'var(--parchment-dark)' }}>
      <NavBar />

      {/* HEADER */}
      <div style={{ paddingTop:'var(--nav-h)', background:'var(--ink)', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', inset:0, backgroundImage:'repeating-linear-gradient(0deg,transparent,transparent 59px,rgba(200,169,110,0.03) 59px,rgba(200,169,110,0.03) 60px),repeating-linear-gradient(90deg,transparent,transparent 59px,rgba(200,169,110,0.03) 59px,rgba(200,169,110,0.03) 60px)', pointerEvents:'none' }} />
        <div style={{ maxWidth:1100, margin:'0 auto', padding:'40px 32px 40px', position:'relative', zIndex:1 }}>
          <div style={{ fontSize:10, textTransform:'uppercase', letterSpacing:'0.2em', color:'var(--gold)', marginBottom:8 }}>Comparador</div>
          <h1 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(28px,5vw,48px)', fontWeight:300, color:'var(--parchment)', lineHeight:1, marginBottom:8 }}>
            Comparar <em style={{ color:'var(--crimson-bright)', fontStyle:'italic' }}>escuelas</em>
          </h1>
          <p style={{ fontSize:14, color:'rgba(250,248,244,0.4)' }}>Seleccioná dos escuelas para ver sus diferencias lado a lado.</p>
        </div>
      </div>

      <div style={{ maxWidth:1100, margin:'0 auto', padding:'32px clamp(16px,3vw,32px) 80px' }}>

        {/* SELECTORES */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr auto 1fr', gap:16, alignItems:'center', marginBottom:28 }}>
          {/* Selector A */}
          <div style={{ background:'#fff', border:`2px solid ${colorA}`, borderRadius:'var(--radius)', padding:'12px 16px' }}>
            <div style={{ fontSize:10, textTransform:'uppercase', letterSpacing:'0.14em', color:colorA, marginBottom:6, fontWeight:600 }}>Escuela A</div>
            <select value={slugA} onChange={e => setSlugA(e.target.value)}
              style={{ width:'100%', border:'none', outline:'none', fontSize:14, fontFamily:'var(--font-body)', color:'var(--ink)', background:'transparent', cursor:'pointer' }}>
              <option value="">— Elegir escuela —</option>
              {allSchools.filter(s => s.slug !== slugB).map(s => (
                <option key={s.id} value={s.slug}>{s.kanji} {s.name} — {s.neighborhood}</option>
              ))}
            </select>
          </div>

          {/* VS */}
          <div style={{ fontFamily:'var(--font-display)', fontSize:24, fontWeight:600, color:'rgba(122,92,58,0.3)', textAlign:'center', padding:'0 8px' }}>VS</div>

          {/* Selector B */}
          <div style={{ background:'#fff', border:`2px solid ${colorB}`, borderRadius:'var(--radius)', padding:'12px 16px' }}>
            <div style={{ fontSize:10, textTransform:'uppercase', letterSpacing:'0.14em', color:colorB, marginBottom:6, fontWeight:600 }}>Escuela B</div>
            <select value={slugB} onChange={e => setSlugB(e.target.value)}
              style={{ width:'100%', border:'none', outline:'none', fontSize:14, fontFamily:'var(--font-body)', color:'var(--ink)', background:'transparent', cursor:'pointer' }}>
              <option value="">— Elegir escuela —</option>
              {allSchools.filter(s => s.slug !== slugA).map(s => (
                <option key={s.id} value={s.slug}>{s.kanji} {s.name} — {s.neighborhood}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Estado inicial */}
        {!slugA && !slugB && (
          <div style={{ background:'#fff', border:'1px solid rgba(122,92,58,0.1)', borderRadius:'var(--radius)', padding:'60px 32px', textAlign:'center' }}>
            <div style={{ fontFamily:'var(--font-jp)', fontSize:56, color:'rgba(122,92,58,0.1)', marginBottom:16 }}>比</div>
            <div style={{ fontFamily:'var(--font-display)', fontSize:22, color:'var(--ink)', marginBottom:8 }}>Seleccioná dos escuelas para comparar</div>
            <p style={{ fontSize:13, color:'var(--wood-light)', marginBottom:20 }}>Elegí una escuela en cada selector para ver la comparación completa.</p>
            <Link href="/buscador" style={{ fontSize:12, color:'var(--crimson)', border:'1px solid rgba(139,26,26,0.2)', padding:'8px 18px', borderRadius:3, textDecoration:'none' }}>
              Ir al buscador →
            </Link>
          </div>
        )}

        {loading && (
          <div style={{ padding:60, textAlign:'center', color:'var(--wood-light)' }}>
            <div style={{ fontFamily:'var(--font-jp)', fontSize:48, marginBottom:12, opacity:.3 }}>比</div>
            Cargando comparación...
          </div>
        )}

        {/* COMPARACIÓN */}
        {!loading && (schoolA || schoolB) && (
          <div style={{ background:'#fff', border:'1px solid rgba(122,92,58,0.1)', borderRadius:'var(--radius)', overflow:'hidden' }}>

            {/* Headers de las escuelas */}
            <div style={{ display:'grid', gridTemplateColumns:'160px 1fr 1fr' }}>
              <div style={{ background:'var(--parchment-dark)', padding:'16px' }} />

              {/* Escuela A */}
              <div style={{ background:`linear-gradient(135deg,${colorA}22,#fff)`, borderLeft:`3px solid ${colorA}`, padding:'20px 24px', borderBottom:'1px solid rgba(122,92,58,0.08)' }}>
                {schoolA ? (
                  <>
                    <div style={{ fontFamily:'var(--font-jp)', fontSize:36, color:colorA, marginBottom:6 }}>{schoolA.kanji}</div>
                    <div style={{ fontFamily:'var(--font-display)', fontSize:20, color:'var(--ink)', marginBottom:4, lineHeight:1.2 }}>{schoolA.name}</div>
                    <div style={{ fontSize:12, color:'var(--wood-light)', marginBottom:10 }}>{schoolA.neighborhood}, {schoolA.city}</div>
                    <Link href={`/escuela/${schoolA.slug}`}
                      style={{ fontSize:11, color:colorA, border:`1px solid ${colorA}44`, padding:'4px 10px', borderRadius:2, textDecoration:'none' }}>
                      Ver perfil →
                    </Link>
                  </>
                ) : (
                  <div style={{ color:'var(--wood-light)', fontSize:13 }}>Sin seleccionar</div>
                )}
              </div>

              {/* Escuela B */}
              <div style={{ background:`linear-gradient(135deg,${colorB}22,#fff)`, borderLeft:`3px solid ${colorB}`, padding:'20px 24px', borderBottom:'1px solid rgba(122,92,58,0.08)' }}>
                {schoolB ? (
                  <>
                    <div style={{ fontFamily:'var(--font-jp)', fontSize:36, color:colorB, marginBottom:6 }}>{schoolB.kanji}</div>
                    <div style={{ fontFamily:'var(--font-display)', fontSize:20, color:'var(--ink)', marginBottom:4, lineHeight:1.2 }}>{schoolB.name}</div>
                    <div style={{ fontSize:12, color:'var(--wood-light)', marginBottom:10 }}>{schoolB.neighborhood}, {schoolB.city}</div>
                    <Link href={`/escuela/${schoolB.slug}`}
                      style={{ fontSize:11, color:colorB, border:`1px solid ${colorB}44`, padding:'4px 10px', borderRadius:2, textDecoration:'none' }}>
                      Ver perfil →
                    </Link>
                  </>
                ) : (
                  <div style={{ color:'var(--wood-light)', fontSize:13 }}>Sin seleccionar</div>
                )}
              </div>
            </div>

            {/* Tabla de comparación */}
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <colgroup>
                <col style={{ width:160 }} />
                <col style={{ width:'50%' }} />
                <col style={{ width:'50%' }} />
              </colgroup>
              <tbody>

                {/* Sección: Información general */}
                <tr>
                  <td colSpan={3} style={{ padding:'10px 16px', background:'var(--parchment-dark)', fontSize:10, textTransform:'uppercase', letterSpacing:'0.14em', color:'var(--gold)', fontWeight:600 }}>
                    Información general
                  </td>
                </tr>
                <CompareRow label="Disciplina"   a={schoolA?.discipline?.label}  b={schoolB?.discipline?.label} />
                <CompareRow label="Ubicación"    a={schoolA ? `${schoolA.neighborhood}, ${schoolA.city}` : null} b={schoolB ? `${schoolB.neighborhood}, ${schoolB.city}` : null} />
                <CompareRow label="Fundada"      a={schoolA?.founded_year}       b={schoolB?.founded_year} />
                <CompareRow label="Estado"       a={schoolA?.verified ? '✓ Verificada' : 'No verificada'} b={schoolB?.verified ? '✓ Verificada' : 'No verificada'} />

                {/* Sección: Métricas */}
                <tr>
                  <td colSpan={3} style={{ padding:'10px 16px', background:'var(--parchment-dark)', fontSize:10, textTransform:'uppercase', letterSpacing:'0.14em', color:'var(--gold)', fontWeight:600 }}>
                    Calificaciones
                  </td>
                </tr>
                <CompareRow label="Rating"       a={schoolA?.rating}      b={schoolB?.rating}      highlight />
                <CompareRow label="Reseñas"      a={schoolA?.review_count} b={schoolB?.review_count} highlight />
                <CompareRow label="Alumnos"      a={schoolA?.student_count} b={schoolB?.student_count} highlight />

                {/* Sección: Contacto */}
                <tr>
                  <td colSpan={3} style={{ padding:'10px 16px', background:'var(--parchment-dark)', fontSize:10, textTransform:'uppercase', letterSpacing:'0.14em', color:'var(--gold)', fontWeight:600 }}>
                    Contacto
                  </td>
                </tr>
                <CompareRow label="WhatsApp"    a={schoolA?.whatsapp ? '✓ Disponible' : '—'} b={schoolB?.whatsapp ? '✓ Disponible' : '—'} />
                <CompareRow label="Instagram"   a={schoolA?.instagram || '—'} b={schoolB?.instagram || '—'} />
                <CompareRow label="Email"       a={schoolA?.email || '—'}     b={schoolB?.email || '—'} />

                {/* Sección: Clases */}
                <tr>
                  <td colSpan={3} style={{ padding:'10px 16px', background:'var(--parchment-dark)', fontSize:10, textTransform:'uppercase', letterSpacing:'0.14em', color:'var(--gold)', fontWeight:600 }}>
                    Clases disponibles
                  </td>
                </tr>
                <CompareRow
                  label="Subcats"
                  a={schoolA?.subcats?.length > 0 ? schoolA.subcats.map((s:any) => s.name).join(', ') : '—'}
                  b={schoolB?.subcats?.length > 0 ? schoolB.subcats.map((s:any) => s.name).join(', ') : '—'}
                />
                <CompareRow
                  label="Instructores"
                  a={schoolA?.instructors?.length ?? '—'}
                  b={schoolB?.instructors?.length ?? '—'}
                  highlight
                />
                <CompareRow
                  label="Horarios cargados"
                  a={schedulesA.length > 0 ? `${schedulesA.length} turnos` : 'No informados'}
                  b={schedulesB.length > 0 ? `${schedulesB.length} turnos` : 'No informados'}
                  highlight
                />

                {/* Sección: Descripción */}
                <tr>
                  <td colSpan={3} style={{ padding:'10px 16px', background:'var(--parchment-dark)', fontSize:10, textTransform:'uppercase', letterSpacing:'0.14em', color:'var(--gold)', fontWeight:600 }}>
                    Descripción
                  </td>
                </tr>
                <tr style={{ borderTop:'1px solid rgba(122,92,58,0.07)' }}>
                  <td style={{ padding:'12px 16px', fontSize:12, fontWeight:500, color:'var(--wood-light)', textTransform:'uppercase', letterSpacing:'0.08em', background:'var(--parchment-dark)', verticalAlign:'top' }}>Sobre la escuela</td>
                  <td style={{ padding:'14px 20px', fontSize:13, color:'var(--ink-soft)', lineHeight:1.7, verticalAlign:'top' }}>
                    {schoolA?.description ?? '—'}
                  </td>
                  <td style={{ padding:'14px 20px', fontSize:13, color:'var(--ink-soft)', lineHeight:1.7, borderLeft:'1px solid rgba(122,92,58,0.07)', verticalAlign:'top' }}>
                    {schoolB?.description ?? '—'}
                  </td>
                </tr>

              </tbody>
            </table>

            {/* CTAs finales */}
            {(schoolA || schoolB) && (
              <div style={{ display:'grid', gridTemplateColumns:'160px 1fr 1fr', borderTop:'1px solid rgba(122,92,58,0.08)' }}>
                <div style={{ background:'var(--parchment-dark)', padding:'20px 16px' }} />
                <div style={{ padding:'20px 24px' }}>
                  {schoolA && (
                    <Link href={`/escuela/${schoolA.slug}`}
                      style={{ display:'block', textAlign:'center', background:'var(--crimson)', color:'#fff', padding:'11px', borderRadius:3, textDecoration:'none', fontSize:12, textTransform:'uppercase', letterSpacing:'0.1em', fontWeight:500 }}>
                      Reservar en {schoolA.name.split(' ')[0]} →
                    </Link>
                  )}
                </div>
                <div style={{ padding:'20px 24px', borderLeft:'1px solid rgba(122,92,58,0.08)' }}>
                  {schoolB && (
                    <Link href={`/escuela/${schoolB.slug}`}
                      style={{ display:'block', textAlign:'center', background:'var(--crimson)', color:'#fff', padding:'11px', borderRadius:3, textDecoration:'none', fontSize:12, textTransform:'uppercase', letterSpacing:'0.1em', fontWeight:500 }}>
                      Reservar en {schoolB.name.split(' ')[0]} →
                    </Link>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  )
}

export default function ComparadorPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight:'100vh', background:'var(--ink)', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <div style={{ fontFamily:'var(--font-jp)', fontSize:48, color:'rgba(200,169,110,0.2)' }}>比</div>
      </div>
    }>
      <ComparadorContent />
    </Suspense>
  )
}
