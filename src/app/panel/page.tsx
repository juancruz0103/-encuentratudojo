'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

const SECTIONS = ['overview','reservas','favoritos','perfil'] as const
type Section = typeof SECTIONS[number]
const SECTION_LABELS: Record<Section,string> = { overview:'Resumen', reservas:'Mis reservas', favoritos:'Favoritos', perfil:'Mi perfil' }

export default function PanelPage() {
  const [section, setSection] = useState<Section>('overview')
  const [user, setUser]       = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  // Reservas del sessionStorage (demo) + Supabase
  const [reservas, setReservas] = useState<any[]>([])

  useEffect(() => {
    const sb = createClient()
    sb.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { window.location.href = '/auth'; return }
      setUser(user)
      const { data: prof } = await sb.from('users').select('*').eq('id', user.id).single()
      setProfile(prof)
      // Cargar reservas desde Supabase
      const { data: bookings } = await sb.from('bookings')
        .select('*, school:schools(id,name,slug,kanji,discipline_id,discipline:disciplines(label,color))')
        .eq('user_id', user.id).order('created_at', { ascending: false })
      // Combinar con sessionStorage (demo)
      const fromStorage = (() => { try { return JSON.parse(sessionStorage.getItem('etd_reservas') || '[]') } catch { return [] } })()
      setReservas([...(bookings ?? []), ...fromStorage])
      setLoading(false)
    })
  }, [])

  if (loading) return (
    <div style={{ minHeight:'100vh', background:'var(--ink)', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ fontFamily:'var(--font-jp)', fontSize:56, color:'rgba(200,169,110,0.2)', marginBottom:16 }}>武</div>
        <div style={{ color:'rgba(250,248,244,0.3)', fontSize:14 }}>Cargando tu panel...</div>
      </div>
    </div>
  )

  const nombre = profile ? `${profile.first_name} ${profile.last_name}`.trim() : user?.email ?? 'Alumno'
  const initials = nombre.split(' ').map((w: string) => w[0]).join('').slice(0,2).toUpperCase()

  return (
    <div style={{ display:'flex', minHeight:'100vh', background:'var(--parchment-dark)' }}>

      {/* SIDEBAR */}
      <div style={{ width:220, background:'var(--ink)', display:'flex', flexDirection:'column', flexShrink:0, position:'sticky', top:0, height:'100vh' }}>
        <div style={{ padding:'20px' }}>
          <Link href="/" style={{ display:'flex', alignItems:'center', gap:8, textDecoration:'none', marginBottom:20 }}>
            <span style={{ fontFamily:'var(--font-jp)', fontSize:18, color:'var(--crimson-bright)' }}>武</span>
            <span style={{ fontFamily:'var(--font-display)', fontSize:14, color:'var(--parchment)', letterSpacing:'0.06em' }}>EncuentraTuDojo</span>
          </Link>
          {/* Avatar */}
          <div style={{ display:'flex', alignItems:'center', gap:12, padding:'14px 0', borderTop:'1px solid rgba(200,169,110,0.08)', borderBottom:'1px solid rgba(200,169,110,0.08)', marginBottom:16 }}>
            <div style={{ width:40, height:40, borderRadius:'50%', background:'var(--crimson)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, fontWeight:600, color:'#fff', flexShrink:0 }}>{initials}</div>
            <div>
              <div style={{ fontSize:13, fontWeight:500, color:'var(--parchment)', lineHeight:1.3 }}>{nombre}</div>
              <div style={{ fontSize:11, color:'rgba(250,248,244,0.3)' }}>Alumno</div>
            </div>
          </div>
        </div>
        <nav style={{ flex:1, padding:'8px 12px' }}>
          {SECTIONS.map(s => (
            <button key={s} onClick={() => setSection(s)}
              style={{ display:'flex', alignItems:'center', gap:10, width:'100%', padding:'10px 12px', marginBottom:2, borderRadius:4, border:'none', cursor:'pointer', fontFamily:'var(--font-body)', fontSize:13, textAlign:'left', transition:'all 0.15s',
                background: section === s ? 'rgba(200,169,110,0.1)' : 'transparent',
                color: section === s ? 'var(--gold)' : 'rgba(250,248,244,0.4)' }}>
              {SECTION_LABELS[s]}
            </button>
          ))}
        </nav>
        <div style={{ padding:'12px 20px', borderTop:'1px solid rgba(200,169,110,0.08)' }}>
          <Link href="/buscador" style={{ display:'block', fontSize:11, textTransform:'uppercase', letterSpacing:'0.1em', color:'var(--gold)', background:'rgba(200,169,110,0.1)', padding:'8px 12px', borderRadius:3, textDecoration:'none', textAlign:'center', marginBottom:8 }}>
            Buscar escuelas →
          </Link>
          <button onClick={async () => { await createClient().auth.signOut(); window.location.href = '/' }}
            style={{ fontSize:12, color:'rgba(250,248,244,0.3)', background:'none', border:'none', cursor:'pointer', fontFamily:'var(--font-body)', width:'100%', textAlign:'left' }}>
            Cerrar sesión
          </button>
        </div>
      </div>

      {/* MAIN */}
      <div style={{ flex:1, overflowY:'auto' }}>
        <div style={{ padding:'16px 32px', borderBottom:'1px solid rgba(122,92,58,0.1)', background:'#fff', position:'sticky', top:0, zIndex:50 }}>
          <div style={{ fontFamily:'var(--font-display)', fontSize:22, fontWeight:400, color:'var(--ink)' }}>{SECTION_LABELS[section]}</div>
        </div>

        <div style={{ padding:32 }}>

          {/* OVERVIEW */}
          {section === 'overview' && (
            <div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16, marginBottom:24 }}>
                {[
                  { label:'Reservas', val: reservas.length, color:'var(--crimson)' },
                  { label:'Confirmadas', val: reservas.filter((r:any) => (r.status ?? r.estado) === 'confirmada').length, color:'#2ecc71' },
                  { label:'Pendientes', val: reservas.filter((r:any) => (r.status ?? r.estado) === 'pendiente').length, color:'var(--gold)' },
                ].map((s,i) => (
                  <div key={i} style={{ background:'#fff', border:'1px solid rgba(122,92,58,0.1)', borderRadius:'var(--radius)', padding:'20px' }}>
                    <div style={{ fontSize:11, textTransform:'uppercase', letterSpacing:'0.1em', color:'var(--wood-light)', marginBottom:6 }}>{s.label}</div>
                    <div style={{ fontFamily:'var(--font-display)', fontSize:36, fontWeight:600, color:s.color }}>{s.val}</div>
                  </div>
                ))}
              </div>
              <div style={{ background:'#fff', border:'1px solid rgba(122,92,58,0.1)', borderRadius:'var(--radius)', padding:24, textAlign:'center' }}>
                <div style={{ fontFamily:'var(--font-jp)', fontSize:36, color:'rgba(122,92,58,0.15)', marginBottom:12 }}>道</div>
                <div style={{ fontFamily:'var(--font-display)', fontSize:20, color:'var(--ink)', marginBottom:8 }}>¿Buscás una escuela?</div>
                <p style={{ fontSize:13, color:'var(--wood-light)', marginBottom:16 }}>Explorá el directorio y reservá tu clase trial.</p>
                <Link href="/buscador" style={{ display:'inline-block', background:'var(--crimson)', color:'#fff', padding:'10px 24px', borderRadius:3, textDecoration:'none', fontSize:12, textTransform:'uppercase', letterSpacing:'0.1em' }}>
                  Buscar escuelas →
                </Link>
              </div>
            </div>
          )}

          {/* RESERVAS */}
          {section === 'reservas' && (
            <div style={{ background:'#fff', border:'1px solid rgba(122,92,58,0.1)', borderRadius:'var(--radius)', overflow:'hidden' }}>
              <div style={{ padding:'16px 20px', borderBottom:'1px solid rgba(122,92,58,0.08)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <div style={{ fontFamily:'var(--font-display)', fontSize:18, color:'var(--ink)' }}>Mis reservas</div>
                <Link href="/buscador" style={{ fontSize:11, color:'var(--crimson)', border:'1px solid rgba(139,26,26,0.2)', padding:'5px 12px', borderRadius:3, textDecoration:'none' }}>+ Nueva reserva</Link>
              </div>
              {reservas.length === 0 ? (
                <div style={{ padding:'60px 20px', textAlign:'center' }}>
                  <div style={{ fontFamily:'var(--font-jp)', fontSize:48, color:'rgba(122,92,58,0.15)', marginBottom:12 }}>無</div>
                  <div style={{ fontSize:14, color:'var(--wood-light)', marginBottom:16 }}>Todavía no hiciste ninguna reserva.</div>
                  <Link href="/buscador" style={{ fontSize:12, color:'var(--crimson)', border:'1px solid rgba(139,26,26,0.2)', padding:'8px 18px', borderRadius:3, textDecoration:'none' }}>Buscar escuelas →</Link>
                </div>
              ) : (
                <table style={{ width:'100%', borderCollapse:'collapse' }}>
                  <thead>
                    <tr style={{ background:'var(--parchment-dark)' }}>
                      {['Escuela','Turno','Nivel','Estado','Acción'].map((h,i) => (
                        <th key={i} style={{ padding:'10px 16px', fontSize:11, textAlign:'left', fontWeight:500, color:'var(--wood-light)', textTransform:'uppercase', letterSpacing:'0.08em' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {reservas.map((r: any, i: number) => {
                      const estado = r.status ?? r.estado ?? 'pendiente'
                      const escuela = r.school?.name ?? r.escuela ?? '—'
                      const turno = r.slot_day ? `${r.slot_day} ${r.slot_time}` : r.slot ?? '—'
                      const stateColors: Record<string,string> = { pendiente:'var(--gold)', confirmada:'#2ecc71', completada:'var(--wood-light)', cancelada:'var(--crimson)' }
                      return (
                        <tr key={r.id ?? i} style={{ borderTop:'1px solid rgba(122,92,58,0.06)' }}>
                          <td style={{ padding:'12px 16px', fontSize:13, fontWeight:500, color:'var(--ink)' }}>{escuela}</td>
                          <td style={{ padding:'12px 16px', fontSize:12, color:'var(--ink-soft)' }}>{turno}</td>
                          <td style={{ padding:'12px 16px', fontSize:12, color:'var(--ink-soft)' }}>{r.level ?? r.nivel ?? '—'}</td>
                          <td style={{ padding:'12px 16px' }}>
                            <span style={{ fontSize:11, fontWeight:500, color: stateColors[estado] ?? 'var(--wood-light)', textTransform:'capitalize' }}>{estado}</span>
                          </td>
                          <td style={{ padding:'12px 16px' }}>
                            {r.school?.slug && (
                              <Link href={`/escuela/${r.school.slug}`} style={{ fontSize:11, color:'var(--crimson)', textDecoration:'none' }}>Ver escuela</Link>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* FAVORITOS */}
          {section === 'favoritos' && (
            <div style={{ background:'#fff', border:'1px solid rgba(122,92,58,0.1)', borderRadius:'var(--radius)', padding:32, textAlign:'center' }}>
              <div style={{ fontFamily:'var(--font-jp)', fontSize:48, color:'rgba(122,92,58,0.15)', marginBottom:12 }}>心</div>
              <div style={{ fontFamily:'var(--font-display)', fontSize:22, color:'var(--ink)', marginBottom:8 }}>Escuelas favoritas</div>
              <p style={{ fontSize:13, color:'var(--wood-light)', marginBottom:16 }}>Guardá escuelas desde el buscador para verlas acá.</p>
              <Link href="/buscador" style={{ display:'inline-block', background:'var(--crimson)', color:'#fff', padding:'10px 24px', borderRadius:3, textDecoration:'none', fontSize:12, textTransform:'uppercase', letterSpacing:'0.1em' }}>
                Explorar escuelas →
              </Link>
            </div>
          )}

          {/* PERFIL */}
          {section === 'perfil' && profile && (
            <div style={{ background:'#fff', border:'1px solid rgba(122,92,58,0.1)', borderRadius:'var(--radius)', padding:32 }}>
              <div style={{ fontFamily:'var(--font-display)', fontSize:18, color:'var(--ink)', marginBottom:20 }}>Mi perfil</div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
                {[
                  { label:'Nombre', val: profile.first_name },
                  { label:'Apellido', val: profile.last_name },
                  { label:'Email', val: profile.email },
                  { label:'Ciudad', val: profile.city || '—' },
                  { label:'Barrio', val: profile.neighborhood || '—' },
                ].map((row, i) => (
                  <div key={i} style={{ borderBottom:'1px solid rgba(122,92,58,0.08)', paddingBottom:12 }}>
                    <div style={{ fontSize:10, textTransform:'uppercase', letterSpacing:'0.1em', color:'var(--wood-light)', marginBottom:4 }}>{row.label}</div>
                    <div style={{ fontSize:14, color:'var(--ink)', fontWeight:500 }}>{row.val || '—'}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
