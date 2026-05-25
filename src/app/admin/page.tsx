'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function AdminPage() {
  const [stats, setStats]   = useState<any>(null)
  const [schools, setSchools] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [section, setSection] = useState<'overview'|'escuelas'|'revenue'>('overview')

  useEffect(() => {
    const sb = createClient()
    sb.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { window.location.href = '/auth'; return }
      // Verificar que es admin
      const { data: prof } = await sb.from('users').select('type').eq('id', user.id).single()
      if (prof?.type !== 'admin') { window.location.href = '/'; return }

      // Cargar stats
      const [{ count: totalSchools }, { count: activeSchools }, { count: totalEvents }] = await Promise.all([
        sb.from('schools').select('*', { count:'exact', head:true }),
        sb.from('schools').select('*', { count:'exact', head:true }).eq('status','active'),
        sb.from('contact_events').select('*', { count:'exact', head:true }),
      ])

      // Revenue total
      const { data: revenueData } = await sb.from('schools').select('monthly_fee_usd, status').eq('status','active')
      const totalRevenue = revenueData?.reduce((sum: number, s: any) => sum + (parseFloat(s.monthly_fee_usd) || 0), 0) ?? 0

      setStats({ totalSchools, activeSchools, totalEvents, totalRevenue })

      // Cargar escuelas para gestión
      const { data: sc } = await sb.from('schools')
        .select('*, discipline:disciplines(label), owner:users(email, first_name, last_name)')
        .order('created_at', { ascending: false })
        .limit(50)
      setSchools(sc ?? [])
      setLoading(false)
    })
  }, [])

  async function approveSchool(id: number) {
    const sb = createClient()
    await sb.from('schools').update({ status:'active', verified:true }).eq('id', id)
    setSchools(prev => prev.map(s => s.id === id ? { ...s, status:'active', verified:true } : s))
  }
  async function suspendSchool(id: number) {
    const sb = createClient()
    await sb.from('schools').update({ status:'suspended' }).eq('id', id)
    setSchools(prev => prev.map(s => s.id === id ? { ...s, status:'suspended' } : s))
  }

  if (loading) return (
    <div style={{ minHeight:'100vh', background:'var(--ink)', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ fontFamily:'var(--font-jp)', fontSize:56, color:'rgba(200,169,110,0.2)', marginBottom:16 }}>武</div>
        <div style={{ color:'rgba(250,248,244,0.3)', fontSize:14 }}>Cargando panel de administración...</div>
      </div>
    </div>
  )

  const pending = schools.filter(s => s.status === 'pending')
  const active  = schools.filter(s => s.status === 'active')

  return (
    <div style={{ display:'flex', minHeight:'100vh', background:'var(--parchment-dark)' }}>

      {/* SIDEBAR */}
      <div style={{ width:220, background:'var(--ink)', display:'flex', flexDirection:'column', flexShrink:0, position:'sticky', top:0, height:'100vh' }}>
        <div style={{ padding:'20px' }}>
          <Link href="/" style={{ display:'flex', alignItems:'center', gap:8, textDecoration:'none', marginBottom:20 }}>
            <span style={{ fontFamily:'var(--font-jp)', fontSize:18, color:'var(--crimson-bright)' }}>武</span>
            <span style={{ fontFamily:'var(--font-display)', fontSize:14, color:'var(--parchment)', letterSpacing:'0.06em' }}>Admin</span>
          </Link>
          <div style={{ padding:'10px 12px', background:'rgba(192,57,43,0.15)', borderRadius:4, border:'1px solid rgba(192,57,43,0.3)', marginBottom:16 }}>
            <div style={{ fontSize:10, textTransform:'uppercase', letterSpacing:'0.1em', color:'var(--crimson-bright)', fontWeight:600 }}>Panel de administración</div>
          </div>
        </div>
        <nav style={{ flex:1, padding:'8px 12px' }}>
          {([['overview','Resumen'], ['escuelas','Escuelas'], ['revenue','Revenue']] as const).map(([s, label]) => (
            <button key={s} onClick={() => setSection(s)}
              style={{ display:'flex', alignItems:'center', gap:10, width:'100%', padding:'10px 12px', marginBottom:2, borderRadius:4, border:'none', cursor:'pointer', fontFamily:'var(--font-body)', fontSize:13, textAlign:'left', transition:'all 0.15s',
                background: section === s ? 'rgba(200,169,110,0.1)' : 'transparent',
                color: section === s ? 'var(--gold)' : 'rgba(250,248,244,0.4)' }}>
              {label}
            </button>
          ))}
        </nav>
        <div style={{ padding:'12px 20px', borderTop:'1px solid rgba(200,169,110,0.08)' }}>
          <button onClick={async () => { await createClient().auth.signOut(); window.location.href = '/' }}
            style={{ fontSize:12, color:'rgba(250,248,244,0.3)', background:'none', border:'none', cursor:'pointer', fontFamily:'var(--font-body)' }}>
            Cerrar sesión
          </button>
        </div>
      </div>

      {/* MAIN */}
      <div style={{ flex:1, overflowY:'auto' }}>
        <div style={{ padding:'16px 32px', borderBottom:'1px solid rgba(122,92,58,0.1)', background:'#fff', position:'sticky', top:0, zIndex:50 }}>
          <div style={{ fontFamily:'var(--font-display)', fontSize:22, fontWeight:400, color:'var(--ink)' }}>
            {{ overview:'Resumen general', escuelas:'Gestión de escuelas', revenue:'Revenue' }[section]}
          </div>
        </div>

        <div style={{ padding:32 }}>

          {/* OVERVIEW */}
          {section === 'overview' && (
            <div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:24 }}>
                {[
                  { label:'Escuelas totales',  val: stats?.totalSchools ?? 0,          color:'var(--ink)' },
                  { label:'Escuelas activas',   val: stats?.activeSchools ?? 0,         color:'#2ecc71' },
                  { label:'Pendientes aprob.', val: pending.length,                    color:'var(--gold)' },
                  { label:'Revenue mensual',   val: `$${(stats?.totalRevenue ?? 0).toFixed(0)} USD`, color:'var(--crimson)' },
                ].map((s,i) => (
                  <div key={i} style={{ background:'#fff', border:'1px solid rgba(122,92,58,0.1)', borderRadius:'var(--radius)', padding:'20px' }}>
                    <div style={{ fontSize:11, textTransform:'uppercase', letterSpacing:'0.1em', color:'var(--wood-light)', marginBottom:6 }}>{s.label}</div>
                    <div style={{ fontFamily:'var(--font-display)', fontSize:28, fontWeight:600, color:s.color }}>{s.val}</div>
                  </div>
                ))}
              </div>

              {/* Pendientes de aprobación */}
              {pending.length > 0 && (
                <div style={{ background:'#fff', border:'1px solid rgba(200,169,110,0.3)', borderRadius:'var(--radius)', overflow:'hidden', marginBottom:20 }}>
                  <div style={{ padding:'14px 20px', borderBottom:'1px solid rgba(200,169,110,0.15)', background:'rgba(200,169,110,0.06)', display:'flex', alignItems:'center', gap:10 }}>
                    <span style={{ fontSize:14 }}>⏳</span>
                    <span style={{ fontSize:14, fontWeight:500, color:'var(--ink)' }}>Escuelas pendientes de aprobación ({pending.length})</span>
                  </div>
                  {pending.map(sc => (
                    <div key={sc.id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 20px', borderTop:'1px solid rgba(122,92,58,0.06)', gap:16 }}>
                      <div>
                        <div style={{ fontSize:14, fontWeight:500, color:'var(--ink)' }}>{sc.name}</div>
                        <div style={{ fontSize:12, color:'var(--wood-light)' }}>{sc.discipline?.label} · {sc.city} · {sc.owner?.email}</div>
                        <div style={{ fontSize:11, color:'var(--wood-light)', marginTop:2 }}>{sc.student_count} alumnos · ${sc.monthly_fee_usd} USD/mes</div>
                      </div>
                      <div style={{ display:'flex', gap:8, flexShrink:0 }}>
                        <button onClick={() => approveSchool(sc.id)}
                          style={{ padding:'6px 16px', background:'#2ecc71', color:'#fff', border:'none', borderRadius:3, cursor:'pointer', fontSize:12, fontFamily:'var(--font-body)', fontWeight:500 }}>
                          Aprobar
                        </button>
                        <button onClick={() => suspendSchool(sc.id)}
                          style={{ padding:'6px 16px', background:'transparent', color:'var(--crimson)', border:'1px solid rgba(139,26,26,0.3)', borderRadius:3, cursor:'pointer', fontSize:12, fontFamily:'var(--font-body)' }}>
                          Rechazar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ESCUELAS */}
          {section === 'escuelas' && (
            <div style={{ background:'#fff', border:'1px solid rgba(122,92,58,0.1)', borderRadius:'var(--radius)', overflow:'hidden' }}>
              <div style={{ padding:'14px 20px', borderBottom:'1px solid rgba(122,92,58,0.08)' }}>
                <div style={{ fontFamily:'var(--font-display)', fontSize:18, color:'var(--ink)' }}>Todas las escuelas ({schools.length})</div>
              </div>
              <table style={{ width:'100%', borderCollapse:'collapse' }}>
                <thead>
                  <tr style={{ background:'var(--parchment-dark)' }}>
                    {['Escuela','Disciplina','Alumnos','Fee/mes','Estado','Acción'].map((h,i) => (
                      <th key={i} style={{ padding:'10px 16px', fontSize:11, textAlign:'left', fontWeight:500, color:'var(--wood-light)', textTransform:'uppercase', letterSpacing:'0.08em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {schools.map((sc,i) => {
                    const stateColors: Record<string,string> = { active:'#2ecc71', pending:'var(--gold)', suspended:'var(--crimson)' }
                    return (
                      <tr key={sc.id} style={{ borderTop:'1px solid rgba(122,92,58,0.06)' }}>
                        <td style={{ padding:'12px 16px' }}>
                          <div style={{ fontSize:13, fontWeight:500, color:'var(--ink)' }}>{sc.name}</div>
                          <div style={{ fontSize:11, color:'var(--wood-light)' }}>{sc.city}</div>
                        </td>
                        <td style={{ padding:'12px 16px', fontSize:13, color:'var(--ink-soft)' }}>{sc.discipline?.label}</td>
                        <td style={{ padding:'12px 16px', fontSize:13, color:'var(--ink-soft)' }}>{sc.student_count}</td>
                        <td style={{ padding:'12px 16px', fontSize:13, fontWeight:500, color:'var(--crimson)' }}>${sc.monthly_fee_usd}</td>
                        <td style={{ padding:'12px 16px' }}>
                          <span style={{ fontSize:11, fontWeight:500, color: stateColors[sc.status] ?? 'var(--wood-light)', textTransform:'capitalize' }}>{sc.status}</span>
                        </td>
                        <td style={{ padding:'12px 16px', display:'flex', gap:6 }}>
                          {sc.status === 'pending' && (
                            <button onClick={() => approveSchool(sc.id)} style={{ padding:'4px 10px', background:'#2ecc71', color:'#fff', border:'none', borderRadius:2, cursor:'pointer', fontSize:11, fontFamily:'var(--font-body)' }}>Aprobar</button>
                          )}
                          {sc.status === 'active' && (
                            <button onClick={() => suspendSchool(sc.id)} style={{ padding:'4px 10px', background:'transparent', color:'var(--crimson)', border:'1px solid rgba(139,26,26,0.2)', borderRadius:2, cursor:'pointer', fontSize:11, fontFamily:'var(--font-body)' }}>Suspender</button>
                          )}
                          <Link href={`/escuela/${sc.slug}`} style={{ padding:'4px 10px', color:'var(--gold)', border:'1px solid rgba(200,169,110,0.2)', borderRadius:2, fontSize:11, textDecoration:'none' }}>Ver</Link>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* REVENUE */}
          {section === 'revenue' && (
            <div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16, marginBottom:20 }}>
                {[
                  { label:'Revenue mensual total', val:`$${(stats?.totalRevenue ?? 0).toFixed(2)} USD`, color:'var(--crimson)' },
                  { label:'Escuelas activas pagantes', val: active.length, color:'#2ecc71' },
                  { label:'Promedio por escuela', val: active.length > 0 ? `$${((stats?.totalRevenue ?? 0) / active.length).toFixed(2)} USD` : '—', color:'var(--gold)' },
                ].map((s,i) => (
                  <div key={i} style={{ background:'#fff', border:'1px solid rgba(122,92,58,0.1)', borderRadius:'var(--radius)', padding:'24px' }}>
                    <div style={{ fontSize:11, textTransform:'uppercase', letterSpacing:'0.1em', color:'var(--wood-light)', marginBottom:8 }}>{s.label}</div>
                    <div style={{ fontFamily:'var(--font-display)', fontSize:28, fontWeight:600, color:s.color }}>{s.val}</div>
                  </div>
                ))}
              </div>
              {/* Revenue por escuela */}
              <div style={{ background:'#fff', border:'1px solid rgba(122,92,58,0.1)', borderRadius:'var(--radius)', overflow:'hidden' }}>
                <div style={{ padding:'14px 20px', borderBottom:'1px solid rgba(122,92,58,0.08)', fontFamily:'var(--font-display)', fontSize:18, color:'var(--ink)' }}>Detalle por escuela</div>
                <table style={{ width:'100%', borderCollapse:'collapse' }}>
                  <thead>
                    <tr style={{ background:'var(--parchment-dark)' }}>
                      {['Escuela','Alumnos','Tier','Fee mensual'].map((h,i) => (
                        <th key={i} style={{ padding:'10px 16px', fontSize:11, textAlign: i > 1 ? 'right' : 'left', fontWeight:500, color:'var(--wood-light)', textTransform:'uppercase', letterSpacing:'0.08em' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {active.sort((a:any,b:any) => b.monthly_fee_usd - a.monthly_fee_usd).map((sc:any) => (
                      <tr key={sc.id} style={{ borderTop:'1px solid rgba(122,92,58,0.06)' }}>
                        <td style={{ padding:'10px 16px', fontSize:13, color:'var(--ink)', fontWeight:500 }}>{sc.name}</td>
                        <td style={{ padding:'10px 16px', fontSize:13, color:'var(--ink-soft)' }}>{sc.student_count}</td>
                        <td style={{ padding:'10px 16px', fontSize:13, color:'var(--ink-soft)', textAlign:'right', textTransform:'capitalize' }}>{sc.commission_tier}</td>
                        <td style={{ padding:'10px 16px', fontSize:13, fontWeight:600, color:'var(--crimson)', textAlign:'right' }}>${sc.monthly_fee_usd}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
