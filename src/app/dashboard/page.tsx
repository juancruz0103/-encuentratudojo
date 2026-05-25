'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { COMMISSION_TIERS } from '@/types/database'
import type { CommissionTier } from '@/types/database'

function calcTier(n: number): { tier: CommissionTier; rate: number; fee: number; min: number; max: number } {
  if (n <= 0)   return { tier:'sin_alumnos', rate:0,    fee:0,                    min:0,   max:40   }
  if (n <= 40)  return { tier:'pequeño',     rate:1.20, fee:+(n*1.20).toFixed(2), min:1,   max:40   }
  if (n <= 100) return { tier:'media',       rate:1.00, fee:+(n*1.00).toFixed(2), min:41,  max:100  }
  if (n <= 200) return { tier:'grande',      rate:0.80, fee:+(n*0.80).toFixed(2), min:101, max:200  }
  if (n <= 400) return { tier:'premium',     rate:0.65, fee:+(n*0.65).toFixed(2), min:201, max:400  }
  return               { tier:'multisede',   rate:0.50, fee:+(n*0.50).toFixed(2), min:401, max:999  }
}

const SECTIONS = ['overview','leads','anuncios','metricas','comision','perfil'] as const
type Section = typeof SECTIONS[number]

const SECTION_LABELS: Record<Section, string> = {
  overview: 'Resumen', leads: 'Mis leads', anuncios: 'Anuncios',
  metricas: 'Métricas', comision: 'Mi comisión', perfil: 'Perfil'
}

const NAV_ICONS: Record<Section, string> = {
  overview:'▦', leads:'◎', anuncios:'✦', metricas:'↗', comision:'$', perfil:'◉'
}

export default function DashboardPage() {
  const [section, setSection]   = useState<Section>('overview')
  const [school, setSchool]     = useState<any>(null)
  const [events, setEvents]     = useState<any[]>([])
  const [loading, setLoading]   = useState(true)
  const [user, setUser]         = useState<any>(null)

  useEffect(() => {
    const sb = createClient()
    sb.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { window.location.href = '/auth'; return }
      setUser(user)
      // Cargar escuela del dueño
      const { data: sc } = await sb.from('schools')
        .select('*, discipline:disciplines(*), subcats:school_subcats(name), instructors:instructors(*)')
        .eq('owner_id', user.id).single()
      setSchool(sc)
      // Cargar eventos de contacto (tracking)
      if (sc) {
        const { data: ev } = await sb.from('contact_events')
          .select('*').eq('school_id', sc.id).order('created_at', { ascending: false }).limit(20)
        setEvents(ev ?? [])
      }
      setLoading(false)
    })
  }, [])

  if (loading) return (
    <div style={{ minHeight:'100vh', background:'var(--ink)', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ fontFamily:'var(--font-jp)', fontSize:56, color:'rgba(200,169,110,0.2)', marginBottom:16 }}>武</div>
        <div style={{ color:'rgba(250,248,244,0.3)', fontSize:14 }}>Cargando tu dashboard...</div>
      </div>
    </div>
  )

  // Si no tiene escuela registrada
  if (!school) return (
    <div style={{ minHeight:'100vh', background:'var(--ink)', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ textAlign:'center', maxWidth:440, padding:32 }}>
        <div style={{ fontFamily:'var(--font-jp)', fontSize:56, color:'rgba(200,169,110,0.2)', marginBottom:16 }}>武</div>
        <div style={{ fontFamily:'var(--font-display)', fontSize:28, color:'var(--parchment)', marginBottom:8 }}>No tenés una escuela registrada</div>
        <p style={{ color:'rgba(250,248,244,0.4)', fontSize:14, lineHeight:1.7, marginBottom:24 }}>
          Tu cuenta es de tipo escuela pero todavía no registraste ningún dojo. Completá el registro para aparecer en el directorio.
        </p>
        <Link href="/registro" style={{ display:'inline-block', background:'var(--crimson)', color:'#fff', padding:'12px 28px', borderRadius:3, textDecoration:'none', fontSize:12, textTransform:'uppercase', letterSpacing:'0.1em' }}>
          Registrar mi escuela →
        </Link>
      </div>
    </div>
  )

  const comm = calcTier(school.student_count ?? 0)
  const tierInfo = COMMISSION_TIERS[comm.tier]
  const progress = comm.max > comm.min
    ? Math.round(((school.student_count - comm.min) / (comm.max - comm.min)) * 100)
    : 100

  // Contar eventos de contacto
  const countWA  = events.filter(e => e.event_type === 'whatsapp_click').length
  const countTR  = events.filter(e => e.event_type === 'trial_confirmed').length
  const countEM  = events.filter(e => e.event_type === 'email_click').length
  const countPV  = events.filter(e => e.event_type === 'profile_view').length

  const discColor = school.discipline?.color ?? '#8b1a1a'

  return (
    <div style={{ display:'flex', minHeight:'100vh', background:'var(--parchment-dark)' }}>

      {/* SIDEBAR */}
      <div style={{ width:220, background:'var(--ink)', borderRight:'1px solid rgba(200,169,110,0.08)', display:'flex', flexDirection:'column', flexShrink:0, position:'sticky', top:0, height:'100vh', overflowY:'auto' }}>

        {/* Logo */}
        <div style={{ padding:'20px 20px 0' }}>
          <Link href="/" style={{ display:'flex', alignItems:'center', gap:8, textDecoration:'none', marginBottom:20 }}>
            <span style={{ fontFamily:'var(--font-jp)', fontSize:18, color:'var(--crimson-bright)' }}>武</span>
            <span style={{ fontFamily:'var(--font-display)', fontSize:14, color:'var(--parchment)', letterSpacing:'0.06em' }}>EncuentraTuDojo</span>
          </Link>
          {/* Info escuela */}
          <div style={{ padding:'14px 0', borderTop:'1px solid rgba(200,169,110,0.08)', borderBottom:'1px solid rgba(200,169,110,0.08)', marginBottom:16 }}>
            <div style={{ width:40, height:40, borderRadius:4, background:`${discColor}22`, border:`1px solid ${discColor}44`, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'var(--font-jp)', fontSize:20, color:discColor, marginBottom:8 }}>
              {school.kanji}
            </div>
            <div style={{ fontSize:13, fontWeight:500, color:'var(--parchment)', lineHeight:1.3, marginBottom:2 }}>{school.name}</div>
            <div style={{ fontSize:11, color:'rgba(250,248,244,0.3)' }}>{school.discipline?.label} · {school.city}</div>
            <div style={{ marginTop:6, display:'inline-block', fontSize:9, fontWeight:600, letterSpacing:'0.12em', textTransform:'uppercase',
              color: school.status === 'active' ? '#2ecc71' : 'var(--gold)',
              border: `1px solid ${school.status === 'active' ? 'rgba(46,204,113,0.3)' : 'rgba(200,169,110,0.3)'}`,
              padding:'2px 7px', borderRadius:2 }}>
              {school.status === 'active' ? '● Activa' : '○ Pendiente'}
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex:1, padding:'8px 12px' }}>
          {SECTIONS.map(s => (
            <button key={s} onClick={() => setSection(s)}
              style={{ display:'flex', alignItems:'center', gap:10, width:'100%', padding:'10px 12px', marginBottom:2, borderRadius:4, border:'none', cursor:'pointer', fontFamily:'var(--font-body)', fontSize:13, textAlign:'left', transition:'all 0.15s',
                background: section === s ? 'rgba(200,169,110,0.1)' : 'transparent',
                color: section === s ? 'var(--gold)' : 'rgba(250,248,244,0.4)' }}>
              <span style={{ fontSize:12, width:16, textAlign:'center', flexShrink:0 }}>{NAV_ICONS[s]}</span>
              {SECTION_LABELS[s]}
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div style={{ padding:'12px 20px', borderTop:'1px solid rgba(200,169,110,0.08)' }}>
          <button
            onClick={async () => { await createClient().auth.signOut(); window.location.href = '/' }}
            style={{ fontSize:12, color:'rgba(250,248,244,0.3)', background:'none', border:'none', cursor:'pointer', fontFamily:'var(--font-body)', textAlign:'left' }}>
            Cerrar sesión
          </button>
        </div>
      </div>

      {/* MAIN */}
      <div style={{ flex:1, overflowY:'auto' }}>

        {/* Topbar */}
        <div style={{ padding:'16px 32px', borderBottom:'1px solid rgba(122,92,58,0.1)', background:'#fff', display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:50 }}>
          <div>
            <div style={{ fontFamily:'var(--font-display)', fontSize:22, fontWeight:400, color:'var(--ink)' }}>
              {SECTION_LABELS[section]}
            </div>
          </div>
          <Link href={`/escuela/${school.slug}`} style={{ fontSize:11, textTransform:'uppercase', letterSpacing:'0.1em', color:'var(--crimson)', border:'1px solid rgba(139,26,26,0.2)', padding:'6px 14px', borderRadius:3, textDecoration:'none' }}>
            Ver mi perfil público →
          </Link>
        </div>

        <div style={{ padding:32 }}>

          {/* ═══ OVERVIEW ═══ */}
          {section === 'overview' && (
            <div>
              {/* Stats rápidas */}
              <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:24 }}>
                {[
                  { label:'Rating',        val: school.rating || '—',        sub:'promedio',          color:'var(--gold)' },
                  { label:'Reseñas',       val: school.review_count || 0,    sub:'recibidas',         color:'var(--crimson)' },
                  { label:'Contactos ETD', val: events.length,               sub:'por la plataforma', color:'#2ecc71' },
                  { label:'Alumnos',       val: school.student_count || 0,   sub:'declarados',        color:'#2e86c1' },
                ].map((s, i) => (
                  <div key={i} style={{ background:'#fff', border:'1px solid rgba(122,92,58,0.1)', borderRadius:'var(--radius)', padding:'20px 20px' }}>
                    <div style={{ fontSize:11, textTransform:'uppercase', letterSpacing:'0.1em', color:'var(--wood-light)', marginBottom:6 }}>{s.label}</div>
                    <div style={{ fontFamily:'var(--font-display)', fontSize:32, fontWeight:600, color:s.color, lineHeight:1 }}>{s.val}</div>
                    <div style={{ fontSize:11, color:'var(--wood-light)', marginTop:4 }}>{s.sub}</div>
                  </div>
                ))}
              </div>

              {/* Contactos llegados por la app */}
              <div style={{ background:'#fff', border:'1px solid rgba(122,92,58,0.1)', borderRadius:'var(--radius)', overflow:'hidden', marginBottom:20 }}>
                <div style={{ padding:'16px 20px', borderBottom:'1px solid rgba(122,92,58,0.08)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                  <div style={{ fontFamily:'var(--font-display)', fontSize:18, fontWeight:400, color:'var(--ink)' }}>
                    Contactos llegados por <em style={{ color:'var(--crimson)' }}>EncuentraTuDojo</em>
                  </div>
                  <span style={{ fontSize:11, color:'var(--gold)', background:'rgba(200,169,110,0.1)', padding:'4px 10px', borderRadius:12 }}>
                    {events.length} total
                  </span>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:0 }}>
                  {[
                    { label:'WhatsApp',    count: countWA, icon:'💬', color:'#25d366' },
                    { label:'Trials',      count: countTR, icon:'📅', color:'var(--crimson)' },
                    { label:'Email',       count: countEM, icon:'✉️',  color:'#2e86c1' },
                    { label:'Visitas',     count: countPV, icon:'👁',  color:'var(--gold)' },
                  ].map((m, i) => (
                    <div key={i} style={{ padding:'20px', borderRight: i < 3 ? '1px solid rgba(122,92,58,0.08)' : 'none', textAlign:'center' }}>
                      <div style={{ fontSize:24, marginBottom:8 }}>{m.icon}</div>
                      <div style={{ fontFamily:'var(--font-display)', fontSize:28, fontWeight:600, color:m.color, lineHeight:1 }}>{m.count}</div>
                      <div style={{ fontSize:11, color:'var(--wood-light)', marginTop:4, textTransform:'uppercase', letterSpacing:'0.08em' }}>{m.label}</div>
                    </div>
                  ))}
                </div>
                {/* Últimos eventos */}
                {events.length > 0 ? (
                  <div style={{ borderTop:'1px solid rgba(122,92,58,0.08)' }}>
                    <div style={{ padding:'12px 20px', fontSize:11, textTransform:'uppercase', letterSpacing:'0.1em', color:'var(--wood-light)' }}>Últimos contactos</div>
                    {events.slice(0,6).map((ev, i) => {
                      const meta: Record<string, { label:string; icon:string; color:string }> = {
                        whatsapp_click:    { label:'WhatsApp',          icon:'💬', color:'#25d366' },
                        trial_confirmed:   { label:'Clase trial',       icon:'📅', color:'var(--crimson)' },
                        trial_started:     { label:'Trial iniciado',    icon:'🔔', color:'var(--gold)' },
                        email_click:       { label:'Email',             icon:'✉️',  color:'#2e86c1' },
                        profile_view:      { label:'Visita al perfil',  icon:'👁',  color:'var(--wood-light)' },
                      }
                      const m = meta[ev.event_type] ?? { label: ev.event_type, icon:'◎', color:'var(--wood-light)' }
                      return (
                        <div key={ev.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 20px', borderTop:'1px solid rgba(122,92,58,0.04)' }}>
                          <div style={{ width:32, height:32, borderRadius:'50%', background:`${m.color}22`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, flexShrink:0 }}>{m.icon}</div>
                          <div style={{ flex:1 }}>
                            <span style={{ fontSize:13, fontWeight:500, color:'var(--ink)' }}>Alumno llegó vía </span>
                            <strong style={{ color:m.color, fontSize:13 }}>{m.label}</strong>
                            <span style={{ fontSize:11, color:'var(--wood-light)', display:'block' }}>
                              {new Date(ev.created_at).toLocaleString('es-AR', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' })}
                            </span>
                          </div>
                          <div style={{ fontSize:9, textTransform:'uppercase', letterSpacing:'0.1em', color:m.color, border:`1px solid ${m.color}44`, padding:'3px 8px', borderRadius:2, flexShrink:0 }}>ETD</div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div style={{ padding:'32px', textAlign:'center', borderTop:'1px solid rgba(122,92,58,0.08)' }}>
                    <div style={{ fontSize:13, color:'var(--wood-light)', lineHeight:1.7 }}>
                      Cuando un alumno te contacte desde la plataforma, aparecerá acá en tiempo real.
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ═══ COMISIÓN ═══ */}
          {section === 'comision' && (
            <div>
              {/* Hero */}
              <div style={{ background:'var(--ink)', border:'1px solid rgba(200,169,110,0.2)', borderRadius:'var(--radius)', padding:24, marginBottom:20 }}>
                <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', flexWrap:'wrap', gap:16, marginBottom:20 }}>
                  <div>
                    <div style={{ fontSize:10, textTransform:'uppercase', letterSpacing:'0.14em', color:'var(--gold)', marginBottom:6 }}>Tu comisión mensual</div>
                    <div style={{ fontFamily:'var(--font-display)', fontSize:36, color:'var(--parchment)', lineHeight:1 }}>
                      ${comm.fee.toFixed(2)} <span style={{ fontSize:16, color:'rgba(250,248,244,0.4)' }}>USD</span>
                    </div>
                    <div style={{ fontSize:13, color:'rgba(250,248,244,0.4)', marginTop:6 }}>
                      {school.student_count} alumnos × ${comm.rate.toFixed(2)} USD · <span style={{ color:'var(--gold)' }}>{tierInfo?.label}</span>
                    </div>
                  </div>
                </div>
                {/* Barra de progreso en el rango */}
                <div style={{ marginBottom:6, display:'flex', justifyContent:'space-between' }}>
                  <span style={{ fontSize:11, color:'rgba(250,248,244,0.35)' }}>Posición en el rango</span>
                  <span style={{ fontSize:11, color:'rgba(250,248,244,0.35)' }}>{school.student_count} / {comm.max} alumnos</span>
                </div>
                <div style={{ height:6, background:'rgba(250,248,244,0.08)', borderRadius:3, overflow:'hidden' }}>
                  <div style={{ height:'100%', width:`${Math.min(progress,100)}%`, background:'linear-gradient(90deg,var(--gold),var(--gold-bright))', borderRadius:3, transition:'width .5s' }} />
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:10, color:'rgba(250,248,244,0.2)', marginTop:4 }}>
                  <span>{comm.min} alumnos</span>
                  <span>Próximo rango: {comm.max + 1}+ alumnos</span>
                </div>
              </div>

              {/* Tabla de rangos */}
              <div style={{ background:'#fff', border:'1px solid rgba(122,92,58,0.1)', borderRadius:'var(--radius)', overflow:'hidden' }}>
                <div style={{ padding:'14px 20px', borderBottom:'1px solid rgba(122,92,58,0.08)', fontFamily:'var(--font-display)', fontSize:18, color:'var(--ink)' }}>Todos los rangos</div>
                <table style={{ width:'100%', borderCollapse:'collapse' }}>
                  <thead>
                    <tr style={{ background:'var(--parchment-dark)' }}>
                      {['Rango','Alumnos','Fee / alumno','Fee mensual'].map((h,i) => (
                        <th key={i} style={{ padding:'10px 16px', fontSize:11, textAlign: i > 1 ? 'right' : 'left', fontWeight:500, color:'var(--wood-light)', textTransform:'uppercase', letterSpacing:'0.08em' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(COMMISSION_TIERS).filter(([k]) => k !== 'sin_alumnos' && k !== 'franquicia').map(([key, t]) => (
                      <tr key={key} style={{ borderTop:'1px solid rgba(122,92,58,0.06)', background: comm.tier === key ? 'rgba(200,169,110,0.06)' : 'transparent' }}>
                        <td style={{ padding:'10px 16px', fontSize:13, fontWeight: comm.tier === key ? 600 : 400, color:'var(--ink)' }}>
                          {t.label} {comm.tier === key && <span style={{ fontSize:9, background:'var(--gold)', color:'var(--ink)', padding:'2px 6px', borderRadius:2, marginLeft:6, verticalAlign:'middle' }}>TU RANGO</span>}
                        </td>
                        <td style={{ padding:'10px 16px', fontSize:13, color:'var(--ink-soft)' }}>{t.range}</td>
                        <td style={{ padding:'10px 16px', fontSize:13, textAlign:'right', fontWeight: comm.tier === key ? 600 : 400, color:'var(--ink)' }}>${t.rate.toFixed(2)} USD</td>
                        <td style={{ padding:'10px 16px', fontSize:13, textAlign:'right', color:'var(--ink-soft)' }}>
                          ${(t.rate * parseInt(t.range.split('–')[0]?.replace('+','') ?? '0')).toFixed(0)} – ${t.range.includes('+') ? '∞' : (t.rate * parseInt(t.range.split('–')[1] ?? '0')).toFixed(0)}
                        </td>
                      </tr>
                    ))}
                    <tr style={{ borderTop:'1px solid rgba(122,92,58,0.06)', background:'var(--parchment-dark)' }}>
                      <td colSpan={4} style={{ padding:'12px 16px', fontSize:12, color:'var(--wood-light)' }}>
                        ¿Tenés 3 o más sedes?{' '}
                        <a href="mailto:hola@encuentratudojo.com" style={{ color:'var(--crimson)' }}>Contactanos para un acuerdo especial →</a>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ═══ LEADS ═══ */}
          {section === 'leads' && (
            <div style={{ background:'#fff', border:'1px solid rgba(122,92,58,0.1)', borderRadius:'var(--radius)', overflow:'hidden' }}>
              <div style={{ padding:'16px 20px', borderBottom:'1px solid rgba(122,92,58,0.08)' }}>
                <div style={{ fontFamily:'var(--font-display)', fontSize:18, fontWeight:400, color:'var(--ink)' }}>Leads y contactos recibidos</div>
                <div style={{ fontSize:12, color:'var(--wood-light)', marginTop:4 }}>Solo se muestran los contactos que llegaron a través de EncuentraTuDojo</div>
              </div>
              {events.length === 0 ? (
                <div style={{ padding:'60px 20px', textAlign:'center' }}>
                  <div style={{ fontFamily:'var(--font-jp)', fontSize:48, color:'rgba(122,92,58,0.15)', marginBottom:12 }}>無</div>
                  <div style={{ fontSize:14, color:'var(--wood-light)' }}>Todavía no recibiste leads por la plataforma.</div>
                </div>
              ) : (
                <table style={{ width:'100%', borderCollapse:'collapse' }}>
                  <thead>
                    <tr style={{ background:'var(--parchment-dark)' }}>
                      {['Tipo','Fecha','Fuente'].map((h,i) => (
                        <th key={i} style={{ padding:'10px 16px', fontSize:11, textAlign:'left', fontWeight:500, color:'var(--wood-light)', textTransform:'uppercase', letterSpacing:'0.08em' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {events.map((ev, i) => {
                      const labels: Record<string, string> = {
                        whatsapp_click:'WhatsApp', trial_confirmed:'Clase trial reservada',
                        trial_started:'Trial iniciado', email_click:'Email', profile_view:'Visita al perfil'
                      }
                      return (
                        <tr key={ev.id} style={{ borderTop:'1px solid rgba(122,92,58,0.06)' }}>
                          <td style={{ padding:'12px 16px', fontSize:13, color:'var(--ink)', fontWeight:500 }}>{labels[ev.event_type] ?? ev.event_type}</td>
                          <td style={{ padding:'12px 16px', fontSize:12, color:'var(--wood-light)' }}>
                            {new Date(ev.created_at).toLocaleString('es-AR', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' })}
                          </td>
                          <td style={{ padding:'12px 16px' }}>
                            <span style={{ fontSize:10, textTransform:'uppercase', letterSpacing:'0.1em', color:'var(--gold)', border:'1px solid rgba(200,169,110,0.3)', padding:'3px 8px', borderRadius:2 }}>ETD</span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* ═══ ANUNCIOS ═══ */}
          {section === 'anuncios' && (
            <div>
              <div style={{ background:'#fff', border:'1px solid rgba(122,92,58,0.1)', borderRadius:'var(--radius)', padding:24 }}>
                <div style={{ fontFamily:'var(--font-display)', fontSize:18, fontWeight:400, color:'var(--ink)', marginBottom:8 }}>Mis anuncios en el tablero</div>
                <p style={{ fontSize:13, color:'var(--wood-light)', lineHeight:1.7, marginBottom:20 }}>
                  Publicá torneos, eventos, promociones y novedades que aparecen en el tablero comunitario visible para todos los usuarios.
                </p>
                <Link href="/tablero" style={{ display:'inline-flex', alignItems:'center', gap:8, background:'var(--crimson)', color:'#fff', padding:'10px 20px', borderRadius:3, textDecoration:'none', fontSize:12, textTransform:'uppercase', letterSpacing:'0.1em' }}>
                  Ver tablero comunitario →
                </Link>
              </div>
            </div>
          )}

          {/* ═══ MÉTRICAS ═══ */}
          {section === 'metricas' && (
            <div style={{ background:'#fff', border:'1px solid rgba(122,92,58,0.1)', borderRadius:'var(--radius)', padding:32, textAlign:'center' }}>
              <div style={{ fontFamily:'var(--font-jp)', fontSize:48, color:'rgba(122,92,58,0.15)', marginBottom:12 }}>統</div>
              <div style={{ fontFamily:'var(--font-display)', fontSize:22, color:'var(--ink)', marginBottom:8 }}>Métricas avanzadas</div>
              <p style={{ fontSize:13, color:'var(--wood-light)', lineHeight:1.7 }}>Gráficos de visitas, leads y conversiones. Próximamente.</p>
            </div>
          )}

          {/* ═══ PERFIL ═══ */}
          {section === 'perfil' && (
            <div style={{ background:'#fff', border:'1px solid rgba(122,92,58,0.1)', borderRadius:'var(--radius)', padding:32 }}>
              <div style={{ fontFamily:'var(--font-display)', fontSize:18, fontWeight:400, color:'var(--ink)', marginBottom:20 }}>Datos de la escuela</div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
                {[
                  { label:'Nombre', val: school.name },
                  { label:'Disciplina', val: school.discipline?.label },
                  { label:'Ciudad', val: school.city },
                  { label:'Barrio', val: school.neighborhood },
                  { label:'Teléfono', val: school.phone },
                  { label:'WhatsApp', val: school.whatsapp },
                  { label:'Email', val: school.email },
                  { label:'Instagram', val: school.instagram },
                  { label:'Alumnos declarados', val: school.student_count },
                  { label:'Comisión mensual', val: `$${comm.fee.toFixed(2)} USD` },
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
