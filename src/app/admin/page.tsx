'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

/* ─── helpers de estilo ─────────────────────────────────── */
const SIDEBAR_W = 220
const card = (extra?: object): React.CSSProperties => ({
  background: '#fff', border: '1px solid rgba(122,92,58,0.1)',
  borderRadius: 'var(--radius)', ...extra,
})
const th: React.CSSProperties = {
  padding: '10px 14px', fontSize: 11, textAlign: 'left', fontWeight: 500,
  color: 'var(--wood-light)', textTransform: 'uppercase', letterSpacing: '0.08em',
}
const td_ = (extra?: object): React.CSSProperties => ({
  padding: '11px 14px', fontSize: 13, verticalAlign: 'middle', ...extra,
})
const btn = (bg: string, color = '#fff', border?: string): React.CSSProperties => ({
  padding: '4px 11px', background: bg, color, border: border ?? 'none',
  borderRadius: 3, cursor: 'pointer', fontSize: 11, fontFamily: 'var(--font-body)',
  fontWeight: 500, whiteSpace: 'nowrap' as const,
})
const STATUS_COLORS: Record<string, string> = {
  active: '#2ecc71', activo: '#2ecc71',
  pending: '#c8a96e', pendiente: '#c8a96e',
  suspended: '#e74c3c', suspendido: '#e74c3c',
  pausado: '#e74c3c', borrador: '#999',
}
const pill = (status: string): React.CSSProperties => ({
  fontSize: 11, fontWeight: 600, textTransform: 'capitalize',
  color: STATUS_COLORS[status] ?? 'var(--wood-light)',
})

type Section = 'overview' | 'escuelas' | 'usuarios' | 'resenas' | 'anuncios' | 'revenue'

const NAV: [Section, string][] = [
  ['overview',  'Resumen'],
  ['escuelas',  'Escuelas'],
  ['usuarios',  'Usuarios'],
  ['resenas',   'Reseñas'],
  ['anuncios',  'Anuncios'],
  ['revenue',   'Revenue'],
]

export default function AdminPage() {
  const [section, setSection] = useState<Section>('overview')
  const [loading, setLoading]   = useState(true)
  const [stats,   setStats]     = useState<any>(null)
  const [schools, setSchools]   = useState<any[]>([])
  const [users,   setUsers]     = useState<any[]>([])
  const [reviews, setReviews]   = useState<any[]>([])
  const [anuncios, setAnuncios] = useState<any[]>([])

  useEffect(() => {
    const sb = createClient()
    sb.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { window.location.href = '/auth'; return }
      const { data: prof } = await sb.from('users').select('type').eq('id', user.id).single()
      if (prof?.type !== 'admin') { window.location.href = '/'; return }

      const [
        { count: totalSchools },
        { count: activeSchools },
        { count: totalUsers },
        { count: bannedUsers },
        { count: reportedReviews },
      ] = await Promise.all([
        sb.from('schools').select('*', { count: 'exact', head: true }),
        sb.from('schools').select('*', { count: 'exact', head: true }).eq('status', 'active'),
        sb.from('users').select('*', { count: 'exact', head: true }).neq('type', 'admin'),
        sb.from('users').select('*', { count: 'exact', head: true }).neq('type', 'admin'),  // unused slot — keeps tuple length
        sb.from('reviews').select('*', { count: 'exact', head: true }).eq('reported', true),
      ])

      const { data: revenueData } = await sb.from('schools').select('monthly_fee_usd, status').eq('status', 'active')
      const totalRevenue = revenueData?.reduce((s: number, r: any) => s + (parseFloat(r.monthly_fee_usd) || 0), 0) ?? 0

      setStats({ totalSchools, activeSchools, totalUsers, reportedReviews, totalRevenue })

      // Escuelas
      const { data: sc } = await sb.from('schools')
        .select('*, discipline:disciplines(label), owner:users(email, first_name, last_name)')
        .order('created_at', { ascending: false }).limit(50)
      setSchools(sc ?? [])

      // Usuarios (con ban status via RPC)
      const { data: usrs } = await sb.rpc('admin_get_users_with_ban_status')
      setUsers(usrs ?? [])

      // Reseñas
      const { data: revs } = await sb.from('reviews')
        .select('*, school:schools(name, slug)')
        .order('created_at', { ascending: false }).limit(100)
      setReviews(revs ?? [])

      // Anuncios
      const { data: ann } = await sb.from('announcements')
        .select('*, school:schools(name)')
        .order('created_at', { ascending: false }).limit(100)
      setAnuncios(ann ?? [])

      setLoading(false)
    })
  }, [])

  /* ─── acciones escuelas ───── */
  async function approveSchool(id: number) {
    await createClient().from('schools').update({ status: 'active', verified: true }).eq('id', id)
    setSchools(p => p.map(s => s.id === id ? { ...s, status: 'active', verified: true } : s))
  }
  async function suspendSchool(id: number) {
    await createClient().from('schools').update({ status: 'suspended' }).eq('id', id)
    setSchools(p => p.map(s => s.id === id ? { ...s, status: 'suspended' } : s))
  }
  async function reactivateSchool(id: number) {
    await createClient().from('schools').update({ status: 'active' }).eq('id', id)
    setSchools(p => p.map(s => s.id === id ? { ...s, status: 'active' } : s))
  }

  /* ─── acciones usuarios ───── */
  async function banUser(id: string) {
    await createClient().rpc('admin_set_user_banned', { target_user_id: id, banned: true })
    setUsers(p => p.map(u => u.id === id ? { ...u, banned: true } : u))
  }
  async function unbanUser(id: string) {
    await createClient().rpc('admin_set_user_banned', { target_user_id: id, banned: false })
    setUsers(p => p.map(u => u.id === id ? { ...u, banned: false } : u))
  }

  /* ─── acciones reseñas ───── */
  async function suspendReview(id: string) {
    await createClient().from('reviews').update({ suspended: true }).eq('id', id)
    setReviews(p => p.map(r => r.id === id ? { ...r, suspended: true } : r))
  }
  async function restoreReview(id: string) {
    await createClient().from('reviews').update({ suspended: false, reported: false }).eq('id', id)
    setReviews(p => p.map(r => r.id === id ? { ...r, suspended: false, reported: false } : r))
  }
  async function deleteReview(id: string) {
    if (!confirm('¿Eliminar esta reseña permanentemente?')) return
    await createClient().from('reviews').delete().eq('id', id)
    setReviews(p => p.filter(r => r.id !== id))
  }

  /* ─── acciones anuncios ───── */
  async function pauseAnuncio(id: number) {
    await createClient().from('announcements').update({ status: 'pausado' }).eq('id', id)
    setAnuncios(p => p.map(a => a.id === id ? { ...a, status: 'pausado' } : a))
  }
  async function activateAnuncio(id: number) {
    await createClient().from('announcements').update({ status: 'activo' }).eq('id', id)
    setAnuncios(p => p.map(a => a.id === id ? { ...a, status: 'activo' } : a))
  }
  async function deleteAnuncio(id: number) {
    if (!confirm('¿Eliminar este anuncio permanentemente?')) return
    await createClient().from('announcements').delete().eq('id', id)
    setAnuncios(p => p.filter(a => a.id !== id))
  }

  /* ─── loading ───────────── */
  if (loading) return (
    <div style={{ minHeight: '100vh', background: 'var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontFamily: 'var(--font-jp)', fontSize: 56, color: 'rgba(200,169,110,0.2)', marginBottom: 16 }}>武</div>
        <div style={{ color: 'rgba(250,248,244,0.3)', fontSize: 14 }}>Cargando panel de administración...</div>
      </div>
    </div>
  )

  const pending    = schools.filter(s => s.status === 'pending')
  const active     = schools.filter(s => s.status === 'active')
  const reportedRev = reviews.filter(r => r.reported && !r.suspended)

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--parchment-dark)' }}>

      {/* ── SIDEBAR ─────────────────────────────────────────── */}
      <div style={{ width: SIDEBAR_W, background: 'var(--ink)', display: 'flex', flexDirection: 'column', flexShrink: 0, position: 'sticky', top: 0, height: '100vh' }}>
        <div style={{ padding: '20px' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', marginBottom: 20 }}>
            <span style={{ fontFamily: 'var(--font-jp)', fontSize: 18, color: 'var(--crimson-bright)' }}>武</span>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 14, color: 'var(--parchment)', letterSpacing: '0.06em' }}>Admin</span>
          </Link>
          <div style={{ padding: '10px 12px', background: 'rgba(192,57,43,0.15)', borderRadius: 4, border: '1px solid rgba(192,57,43,0.3)', marginBottom: 16 }}>
            <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--crimson-bright)', fontWeight: 600 }}>Panel de administración</div>
          </div>
        </div>
        <nav style={{ flex: 1, padding: '8px 12px', overflowY: 'auto' }}>
          {NAV.map(([s, label]) => {
            const badge = s === 'escuelas' ? pending.length
              : s === 'resenas' ? reportedRev.length
              : 0
            return (
              <button key={s} onClick={() => setSection(s)}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '10px 12px', marginBottom: 2, borderRadius: 4, border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 13, textAlign: 'left', transition: 'all 0.15s', background: section === s ? 'rgba(200,169,110,0.1)' : 'transparent', color: section === s ? 'var(--gold)' : 'rgba(250,248,244,0.4)' }}>
                <span>{label}</span>
                {badge > 0 && <span style={{ fontSize: 10, background: 'var(--crimson)', color: '#fff', borderRadius: 999, padding: '1px 6px', fontWeight: 700 }}>{badge}</span>}
              </button>
            )
          })}
        </nav>
        <div style={{ padding: '12px 20px', borderTop: '1px solid rgba(200,169,110,0.08)' }}>
          <button onClick={async () => { await createClient().auth.signOut(); window.location.href = '/' }}
            style={{ fontSize: 12, color: 'rgba(250,248,244,0.3)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
            Cerrar sesión
          </button>
        </div>
      </div>

      {/* ── MAIN ────────────────────────────────────────────── */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {/* header sticky */}
        <div style={{ padding: '16px 32px', borderBottom: '1px solid rgba(122,92,58,0.1)', background: '#fff', position: 'sticky', top: 0, zIndex: 50 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 400, color: 'var(--ink)' }}>
            {{ overview: 'Resumen general', escuelas: 'Gestión de escuelas', usuarios: 'Gestión de usuarios', resenas: 'Gestión de reseñas', anuncios: 'Gestión de anuncios', revenue: 'Revenue' }[section]}
          </div>
        </div>

        <div style={{ padding: 32 }}>

          {/* ══ OVERVIEW ══════════════════════════════════════ */}
          {section === 'overview' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 14, marginBottom: 24 }}>
                {[
                  { label: 'Escuelas totales',   val: stats?.totalSchools ?? 0,      color: 'var(--ink)' },
                  { label: 'Escuelas activas',    val: stats?.activeSchools ?? 0,     color: '#2ecc71' },
                  { label: 'Pendientes aprob.',   val: pending.length,                color: 'var(--gold)' },
                  { label: 'Usuarios registrados',val: stats?.totalUsers ?? 0,        color: 'var(--ink)' },
                  { label: 'Revenue mensual',     val: `$${(stats?.totalRevenue ?? 0).toFixed(0)} USD`, color: 'var(--crimson)' },
                ].map((s, i) => (
                  <div key={i} style={{ ...card({ padding: '20px' }) }}>
                    <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--wood-light)', marginBottom: 6 }}>{s.label}</div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 600, color: s.color }}>{s.val}</div>
                  </div>
                ))}
              </div>

              {/* Pendientes de aprobación */}
              {pending.length > 0 && (
                <div style={{ ...card({ overflow: 'hidden', marginBottom: 20 }), border: '1px solid rgba(200,169,110,0.3)' }}>
                  <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(200,169,110,0.15)', background: 'rgba(200,169,110,0.06)', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 14 }}>⏳</span>
                    <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink)' }}>Escuelas pendientes de aprobación ({pending.length})</span>
                  </div>
                  {pending.map(sc => (
                    <div key={sc.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderTop: '1px solid rgba(122,92,58,0.06)', gap: 16 }}>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink)' }}>{sc.name}</div>
                        <div style={{ fontSize: 12, color: 'var(--wood-light)' }}>{sc.discipline?.label} · {sc.city} · {sc.owner?.email}</div>
                      </div>
                      <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                        <button onClick={() => approveSchool(sc.id)} style={btn('#2ecc71')}>Aprobar</button>
                        <button onClick={() => suspendSchool(sc.id)} style={btn('transparent', 'var(--crimson)', '1px solid rgba(139,26,26,0.3)')}>Rechazar</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Reseñas reportadas */}
              {reportedRev.length > 0 && (
                <div style={{ ...card({ overflow: 'hidden' }), border: '1px solid rgba(231,76,60,0.25)' }}>
                  <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(231,76,60,0.15)', background: 'rgba(231,76,60,0.05)', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 14 }}>🚨</span>
                    <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink)' }}>Reseñas reportadas ({reportedRev.length})</span>
                  </div>
                  {reportedRev.slice(0, 5).map(r => (
                    <div key={r.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', borderTop: '1px solid rgba(122,92,58,0.06)', gap: 16 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink)' }}>{r.author} · {r.school?.name}</div>
                        <div style={{ fontSize: 12, color: 'var(--wood-light)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.text}</div>
                      </div>
                      <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                        <button onClick={() => suspendReview(r.id)} style={btn('#e74c3c')}>Suspender</button>
                        <button onClick={() => restoreReview(r.id)} style={btn('transparent', '#2ecc71', '1px solid #2ecc71')}>Limpiar</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ══ ESCUELAS ══════════════════════════════════════ */}
          {section === 'escuelas' && (
            <div style={{ ...card({ overflow: 'hidden' }) }}>
              <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(122,92,58,0.08)' }}>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: 'var(--ink)' }}>Todas las escuelas ({schools.length})</span>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: 'var(--parchment-dark)' }}>
                      {['Escuela', 'Disciplina', 'Alumnos', 'Fee/mes', 'Estado', 'Acciones'].map((h, i) => (
                        <th key={i} style={th}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {schools.map(sc => (
                      <tr key={sc.id} style={{ borderTop: '1px solid rgba(122,92,58,0.06)' }}>
                        <td style={td_()}>
                          <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink)' }}>{sc.name}</div>
                          <div style={{ fontSize: 11, color: 'var(--wood-light)' }}>{sc.city}</div>
                        </td>
                        <td style={td_({ color: 'var(--ink-soft)' })}>{sc.discipline?.label}</td>
                        <td style={td_({ color: 'var(--ink-soft)' })}>{sc.student_count}</td>
                        <td style={td_({ fontWeight: 500, color: 'var(--crimson)' })}>${sc.monthly_fee_usd}</td>
                        <td style={td_()}><span style={pill(sc.status)}>{sc.status}</span></td>
                        <td style={td_()}>
                          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                            {sc.status === 'pending'   && <button onClick={() => approveSchool(sc.id)}    style={btn('#2ecc71')}>Aprobar</button>}
                            {sc.status === 'active'    && <button onClick={() => suspendSchool(sc.id)}    style={btn('transparent', 'var(--crimson)', '1px solid rgba(139,26,26,0.25)')}>Suspender</button>}
                            {sc.status === 'suspended' && <button onClick={() => reactivateSchool(sc.id)} style={btn('transparent', '#2ecc71', '1px solid #2ecc71')}>Reactivar</button>}
                            <Link href={`/escuela/${sc.slug}`} style={{ ...btn('transparent', 'var(--gold)', '1px solid rgba(200,169,110,0.25)'), textDecoration: 'none', display: 'inline-block' }}>Ver</Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ══ USUARIOS ══════════════════════════════════════ */}
          {section === 'usuarios' && (
            <div style={{ ...card({ overflow: 'hidden' }) }}>
              <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(122,92,58,0.08)' }}>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: 'var(--ink)' }}>Usuarios ({users.length})</span>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: 'var(--parchment-dark)' }}>
                      {['Usuario', 'Email', 'Tipo', 'Registrado', 'Estado', 'Acciones'].map((h, i) => (
                        <th key={i} style={th}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u.id} style={{ borderTop: '1px solid rgba(122,92,58,0.06)', opacity: u.banned ? 0.65 : 1 }}>
                        <td style={td_()}>
                          <div style={{ fontWeight: 500, color: 'var(--ink)' }}>{u.first_name} {u.last_name}</div>
                        </td>
                        <td style={td_({ color: 'var(--wood-light)', fontSize: 12 })}>{u.email}</td>
                        <td style={td_()}>
                          <span style={{ fontSize: 11, fontWeight: 600, textTransform: 'capitalize', color: u.type === 'escuela' ? 'var(--gold)' : 'var(--ink-soft)' }}>{u.type}</span>
                        </td>
                        <td style={td_({ color: 'var(--wood-light)', fontSize: 12 })}>
                          {new Date(u.created_at).toLocaleDateString('es-AR')}
                        </td>
                        <td style={td_()}>
                          <span style={pill(u.banned ? 'suspendido' : 'active')}>{u.banned ? 'Baneado' : 'Activo'}</span>
                        </td>
                        <td style={td_()}>
                          <div style={{ display: 'flex', gap: 5 }}>
                            {u.banned
                              ? <button onClick={() => unbanUser(u.id)} style={btn('transparent', '#2ecc71', '1px solid #2ecc71')}>Desbanear</button>
                              : <button onClick={() => banUser(u.id)}   style={btn('transparent', 'var(--crimson)', '1px solid rgba(139,26,26,0.25)')}>Banear</button>}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ══ RESEÑAS ═══════════════════════════════════════ */}
          {section === 'resenas' && (
            <div style={{ ...card({ overflow: 'hidden' }) }}>
              <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(122,92,58,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: 'var(--ink)' }}>Reseñas ({reviews.length})</span>
                <span style={{ fontSize: 12, color: 'var(--crimson)' }}>{reportedRev.length} reportadas</span>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
                  <thead>
                    <tr style={{ background: 'var(--parchment-dark)' }}>
                      {[['Autor','15%'], ['Escuela','18%'], ['Rating','12%'], ['Reseña','28%'], ['Estado','12%'], ['Acciones','15%']].map(([h,w], i) => (
                        <th key={i} style={{ ...th, width: w }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {reviews.map(r => (
                      <tr key={r.id} style={{ borderTop: '1px solid rgba(122,92,58,0.06)', opacity: r.suspended ? 0.55 : 1, background: r.reported && !r.suspended ? 'rgba(231,76,60,0.03)' : undefined }}>
                        <td style={td_({ fontWeight: 500, color: 'var(--ink)' })}>{r.author}</td>
                        <td style={td_({ fontSize: 12, color: 'var(--wood-light)' })}>
                          <Link href={`/escuela/${r.school?.slug}`} style={{ color: 'var(--gold)', textDecoration: 'none' }}>{r.school?.name}</Link>
                        </td>
                        <td style={td_({ color: 'var(--gold)', fontWeight: 600 })}>{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</td>
                        <td style={td_({ maxWidth: 240, width: 240 })}>
                          <div style={{ fontSize: 12, color: 'var(--ink-soft)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.text}</div>
                          <div style={{ display: 'flex', gap: 6, marginTop: 3 }}>
                            {r.reported   && <span style={{ fontSize: 10, color: '#e74c3c', fontWeight: 600 }}>🚨 REPORTADA</span>}
                            {r.suspended  && <span style={{ fontSize: 10, color: '#999', fontWeight: 600 }}>⏸ SUSPENDIDA</span>}
                          </div>
                        </td>
                        <td style={td_()}>
                          <span style={pill(r.suspended ? 'suspendido' : r.reported ? 'pendiente' : 'active')}>
                            {r.suspended ? 'Suspendida' : r.reported ? 'Reportada' : 'Activa'}
                          </span>
                        </td>
                        <td style={td_()}>
                          <div style={{ display: 'flex', gap: 5 }}>
                            {!r.suspended && <button onClick={() => suspendReview(r.id)}  style={btn('transparent', '#e74c3c', '1px solid rgba(231,76,60,0.3)')}>Suspender</button>}
                            {r.suspended  && <button onClick={() => restoreReview(r.id)}  style={btn('transparent', '#2ecc71', '1px solid #2ecc71')}>Restaurar</button>}
                            {r.reported   && !r.suspended && <button onClick={() => restoreReview(r.id)} style={btn('transparent', '#2ecc71', '1px solid #2ecc71')}>Limpiar</button>}
                            <button onClick={() => deleteReview(r.id)} style={btn('#e74c3c')}>Eliminar</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ══ ANUNCIOS ══════════════════════════════════════ */}
          {section === 'anuncios' && (
            <div style={{ ...card({ overflow: 'hidden' }) }}>
              <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(122,92,58,0.08)' }}>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: 'var(--ink)' }}>Anuncios del tablero ({anuncios.length})</span>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: 'var(--parchment-dark)' }}>
                      {['Título', 'Escuela', 'Tipo', 'Fecha', 'Estado', 'Acciones'].map((h, i) => (
                        <th key={i} style={th}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {anuncios.map(a => (
                      <tr key={a.id} style={{ borderTop: '1px solid rgba(122,92,58,0.06)', opacity: a.status === 'pausado' ? 0.55 : 1 }}>
                        <td style={td_({ fontWeight: 500, color: 'var(--ink)', maxWidth: 220 })}>
                          <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.title}</div>
                        </td>
                        <td style={td_({ fontSize: 12, color: 'var(--wood-light)' })}>{a.school?.name}</td>
                        <td style={td_({ fontSize: 12, textTransform: 'capitalize', color: 'var(--ink-soft)' })}>{a.type}</td>
                        <td style={td_({ fontSize: 12, color: 'var(--wood-light)' })}>{a.date_start ?? '—'}</td>
                        <td style={td_()}><span style={pill(a.status)}>{a.status}</span></td>
                        <td style={td_()}>
                          <div style={{ display: 'flex', gap: 5 }}>
                            {a.status !== 'pausado'
                              ? <button onClick={() => pauseAnuncio(a.id)}    style={btn('transparent', '#e74c3c', '1px solid rgba(231,76,60,0.3)')}>Pausar</button>
                              : <button onClick={() => activateAnuncio(a.id)} style={btn('transparent', '#2ecc71', '1px solid #2ecc71')}>Activar</button>}
                            <button onClick={() => deleteAnuncio(a.id)} style={btn('#e74c3c')}>Eliminar</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ══ REVENUE ═══════════════════════════════════════ */}
          {section === 'revenue' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 20 }}>
                {[
                  { label: 'Revenue mensual total',    val: `$${(stats?.totalRevenue ?? 0).toFixed(2)} USD`, color: 'var(--crimson)' },
                  { label: 'Escuelas activas pagantes', val: active.length,  color: '#2ecc71' },
                  { label: 'Promedio por escuela',      val: active.length > 0 ? `$${((stats?.totalRevenue ?? 0) / active.length).toFixed(2)} USD` : '—', color: 'var(--gold)' },
                ].map((s, i) => (
                  <div key={i} style={card({ padding: '24px' })}>
                    <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--wood-light)', marginBottom: 8 }}>{s.label}</div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 600, color: s.color }}>{s.val}</div>
                  </div>
                ))}
              </div>
              <div style={card({ overflow: 'hidden' })}>
                <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(122,92,58,0.08)', fontFamily: 'var(--font-display)', fontSize: 18, color: 'var(--ink)' }}>Detalle por escuela</div>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: 'var(--parchment-dark)' }}>
                      {['Escuela', 'Alumnos', 'Tier', 'Fee mensual'].map((h, i) => (
                        <th key={i} style={{ ...th, textAlign: i > 1 ? 'right' : 'left' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {active.sort((a: any, b: any) => b.monthly_fee_usd - a.monthly_fee_usd).map((sc: any) => (
                      <tr key={sc.id} style={{ borderTop: '1px solid rgba(122,92,58,0.06)' }}>
                        <td style={td_({ fontWeight: 500, color: 'var(--ink)' })}>{sc.name}</td>
                        <td style={td_({ color: 'var(--ink-soft)' })}>{sc.student_count}</td>
                        <td style={td_({ color: 'var(--ink-soft)', textAlign: 'right', textTransform: 'capitalize' })}>{sc.commission_tier}</td>
                        <td style={td_({ fontWeight: 600, color: 'var(--crimson)', textAlign: 'right' })}>${sc.monthly_fee_usd}</td>
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
