'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import NavBar from '@/components/NavBar'
import { trackContactEvent } from '@/lib/supabase/public'
import type { School } from '@/types/database'

const SLOTS = [
  { dia:'Lunes',     hora:'09:00', libre:true  },
  { dia:'Lunes',     hora:'18:00', libre:true  },
  { dia:'Martes',    hora:'10:00', libre:false },
  { dia:'Martes',    hora:'19:00', libre:true  },
  { dia:'Miércoles', hora:'09:00', libre:true  },
  { dia:'Miércoles', hora:'18:30', libre:true  },
  { dia:'Jueves',    hora:'10:00', libre:true  },
  { dia:'Jueves',    hora:'19:00', libre:false },
  { dia:'Viernes',   hora:'09:00', libre:true  },
  { dia:'Viernes',   hora:'18:00', libre:true  },
  { dia:'Sábado',    hora:'10:00', libre:true  },
  { dia:'Sábado',    hora:'11:00', libre:true  },
]

const FEATURES = [
  'Clase trial disponible',
  'Sin contrato de permanencia',
  'Consultá horarios y disponibilidad',
  'Cuota familiar disponible',
]

export default function SchoolProfileClient({ school }: { school: School }) {
  const [modal, setModal]     = useState(false)
  const [step, setStep]       = useState(1)
  const [slotIdx, setSlotIdx] = useState<number | null>(null)
  const [form, setForm]       = useState({ nombre:'', apellido:'', email:'', tel:'', nivel:'principiante' })
  const [success, setSuccess] = useState(false)
  const [isFav, setIsFav]     = useState(false)

  // Leer favoritos de localStorage al montar
  useEffect(() => {
    try {
      const favs: number[] = JSON.parse(localStorage.getItem('etd_favoritos') || '[]')
      setIsFav(favs.includes(school.id))
    } catch {}
  }, [school.id])

  function toggleFav() {
    try {
      const favs: number[] = JSON.parse(localStorage.getItem('etd_favoritos') || '[]')
      const next = isFav ? favs.filter(id => id !== school.id) : [...favs, school.id]
      localStorage.setItem('etd_favoritos', JSON.stringify(next))
      setIsFav(!isFav)
    } catch {}
  }

  const discColor = school.discipline?.color ?? '#8b1a1a'

  const quickInfo = [
    { label:'Ubicación',       val:`${school.neighborhood}, ${school.city}` },
    { label:'Teléfono',        val: school.phone },
    { label:'Fundada',         val: school.founded_year ? String(school.founded_year) : '' },
    { label:'Certificaciones', val: school.certifications },
    { label:'Cupos',           val: school.available_spots },
  ].filter(r => r.val && r.val !== '—' && r.val !== '')

  const stats = [
    { val: school.stat1_val, label: school.stat1_label },
    { val: school.stat2_val, label: school.stat2_label },
    { val: school.stat3_val, label: school.stat3_label },
  ].filter(s => s.val)

  const confirmRows = [
    { label:'Escuela', val: school.name },
    { label:'Alumno',  val: `${form.nombre} ${form.apellido}`.trim() },
    { label:'Email',   val: form.email },
    { label:'Turno',   val: slotIdx !== null ? `${SLOTS[slotIdx].dia} ${SLOTS[slotIdx].hora}` : '—' },
    { label:'Nivel',   val: form.nivel },
  ]

  const STEP_LABELS = ['Tus datos', 'Elegí horario', 'Confirmación']

  function handleWA() {
    trackContactEvent(school.id, 'whatsapp_click', { school_name: school.name })
    const msg = encodeURIComponent('Hola! Vi tu escuela en EncuentraTuDojo y me interesa más información.')
    window.open(`https://wa.me/${school.whatsapp}?text=${msg}`, '_blank')
  }

  function confirmarReserva() {
    if (slotIdx === null) return
    trackContactEvent(school.id, 'trial_confirmed', { slot: SLOTS[slotIdx], nivel: form.nivel })
    const reserva = {
      id: 'res-' + Date.now(), escuela: school.name, escuelaId: school.id,
      disc: school.discipline?.label,
      nombre: `${form.nombre} ${form.apellido}`.trim(),
      email: form.email, slot: `${SLOTS[slotIdx].dia} ${SLOTS[slotIdx].hora}`,
      nivel: form.nivel, estado: 'pendiente',
      fecha: new Date().toLocaleDateString('es-AR', { day:'2-digit', month:'short', year:'numeric' }),
      timestamp: Date.now(),
    }
    try {
      const prev = JSON.parse(sessionStorage.getItem('etd_reservas') || '[]')
      sessionStorage.setItem('etd_reservas', JSON.stringify([reserva, ...prev]))
    } catch {}
    setSuccess(true)
  }

  return (
    <main style={{ minHeight:'100vh', background:'var(--parchment)' }}>

      {/* NAV */}
<NavBar activeLink="/buscador" />

      {/* COVER */}
      <div style={{ paddingTop:'var(--nav-h)', background:`linear-gradient(135deg, ${discColor}33, #0e0c0b)`, position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', inset:0, background:'rgba(14,12,11,0.6)' }} />
        <div style={{ position:'relative', zIndex:1, maxWidth:1200, margin:'0 auto', padding:'60px 48px 48px' }}>

          {/* Breadcrumb */}
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
            <Link href="/" style={{ fontSize:11, color:'rgba(250,248,244,0.3)', textDecoration:'none' }}>Inicio</Link>
            <span style={{ color:'rgba(250,248,244,0.2)' }}>›</span>
            <Link href={`/buscador?disciplina=${school.discipline_id}`} style={{ fontSize:11, color:'rgba(250,248,244,0.3)', textDecoration:'none' }}>
              {school.discipline?.label}
            </Link>
            <span style={{ color:'rgba(250,248,244,0.2)' }}>›</span>
            <span style={{ fontSize:11, color:'rgba(250,248,244,0.5)' }}>{school.name}</span>
          </div>

          {/* Badge disciplina */}
          <div style={{ display:'inline-flex', alignItems:'center', gap:8, fontSize:10, textTransform:'uppercase', letterSpacing:'0.14em', color:'#fff', background:discColor, padding:'4px 12px', borderRadius:2, marginBottom:14 }}>
            <span style={{ fontFamily:'var(--font-jp)', fontSize:14 }}>{school.discipline?.kanji}</span>
            {school.discipline?.label}
          </div>

          <h1 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(32px,5vw,64px)', fontWeight:300, color:'var(--parchment)', lineHeight:1, letterSpacing:'-0.02em', marginBottom:16 }}>
            {school.name}
          </h1>

          {/* Meta */}
          <div style={{ display:'flex', alignItems:'center', gap:20, flexWrap:'wrap' }}>
            <span style={{ fontSize:14, color:'var(--gold)' }}>
              {'★'.repeat(Math.round(school.rating || 0))}
              {'☆'.repeat(5 - Math.round(school.rating || 0))}
              {' '}{school.rating}{' '}
              <span style={{ color:'rgba(250,248,244,0.35)' }}>({school.review_count})</span>
            </span>
            <span style={{ fontSize:13, color:'rgba(250,248,244,0.45)' }}>📍 {school.neighborhood}, {school.city}</span>
            {school.founded_year && <span style={{ fontSize:13, color:'rgba(250,248,244,0.45)' }}>🕐 Desde {school.founded_year}</span>}
            {school.verified && (
              <span style={{ fontSize:10, textTransform:'uppercase', letterSpacing:'0.1em', color:'#2ecc71', border:'1px solid rgba(46,204,113,0.3)', padding:'3px 8px', borderRadius:2 }}>
                ✓ Verificada
              </span>
            )}
            {/* Botón favorito */}
            <button
              onClick={toggleFav}
              title={isFav ? 'Quitar de favoritos' : 'Guardar en favoritos'}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: isFav ? 'rgba(192,57,43,0.15)' : 'rgba(250,248,244,0.08)',
                border: `1px solid ${isFav ? 'rgba(192,57,43,0.4)' : 'rgba(250,248,244,0.2)'}`,
                borderRadius: 20, padding: '5px 14px', cursor: 'pointer',
                fontSize: 12, color: isFav ? '#e74c3c' : 'rgba(250,248,244,0.6)',
                fontFamily: 'var(--font-body)', fontWeight: 500,
                transition: 'all 0.2s',
              }}>
              {isFav ? '❤️' : '🤍'} {isFav ? 'Guardada' : 'Guardar'}
            </button>
          </div>
        </div>
      </div>

      {/* LAYOUT */}
      <div className="etd-profile-layout">

        {/* Columna principal */}
        <div>

          {/* Descripción */}
          <div className="etd-section-card">
            <div className="etd-section-card-header">
              <span className="etd-section-card-title">Sobre la escuela</span>
              <span style={{ fontFamily:'var(--font-jp)', fontSize:28, opacity:.15, color:discColor }}>{school.kanji}</span>
            </div>
            <div className="etd-section-card-body">
              <p style={{ color:'var(--ink-soft)', lineHeight:1.75, fontSize:15, marginBottom:16 }}>{school.description}</p>
              {school.description2 && (
                <p style={{ color:'var(--ink-soft)', lineHeight:1.75, fontSize:15 }}>{school.description2}</p>
              )}
              {stats.length > 0 && (
                <div style={{ display:'grid', gridTemplateColumns:`repeat(${stats.length},1fr)`, gap:20, marginTop:24, paddingTop:20, borderTop:'1px solid rgba(122,92,58,0.08)' }}>
                  {stats.map((s, i) => (
                    <div key={`stat-${i}`} style={{ textAlign:'center' }}>
                      <div style={{ fontFamily:'var(--font-display)', fontSize:36, fontWeight:600, color:'var(--crimson)', lineHeight:1 }}>{s.val}</div>
                      <div style={{ fontSize:11, color:'var(--wood-light)', textTransform:'uppercase', letterSpacing:'0.1em', marginTop:4 }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Disciplinas */}
          {school.subcats && school.subcats.length > 0 && (
            <div className="etd-section-card">
              <div className="etd-section-card-header">
                <span className="etd-section-card-title">Disciplinas y clases</span>
              </div>
              <div className="etd-section-card-body">
                <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                  <span key="disc-main" style={{ fontSize:12, fontWeight:500, padding:'6px 14px', borderRadius:12, color:'#fff', background:discColor }}>
                    {school.discipline?.kanji} {school.discipline?.label}
                  </span>
                  {school.subcats
                    .sort((a, b) => a.sort_order - b.sort_order)
                    .map(sc => (
                      <span key={`sc-${sc.id}`} style={{ fontSize:12, padding:'6px 14px', borderRadius:12, border:'1px solid rgba(139,26,26,0.15)', color:'var(--crimson)', background:'var(--crimson-pale)' }}>
                        {sc.name}
                      </span>
                    ))}
                </div>
              </div>
            </div>
          )}

          {/* Instructores */}
          {school.instructors && school.instructors.length > 0 && (
            <div className="etd-section-card">
              <div className="etd-section-card-header">
                <span className="etd-section-card-title">Instructores</span>
              </div>
              <div className="etd-section-card-body">
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
                  {school.instructors
                    .sort((a, b) => a.sort_order - b.sort_order)
                    .map(inst => (
                      <div key={`inst-${inst.id}`} style={{ display:'flex', alignItems:'center', gap:12 }}>
                        <div style={{ width:40, height:40, borderRadius:'50%', background:`linear-gradient(135deg,${discColor},#0e0c0b)`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:600, color:'#fff', flexShrink:0 }}>
                          {inst.initials}
                        </div>
                        <div>
                          <div style={{ fontSize:14, fontWeight:500, color:'var(--ink)' }}>{inst.name}</div>
                          <div style={{ fontSize:12, color:'var(--wood-light)' }}>{inst.grade}</div>
                          <div style={{ fontSize:10, color:'rgba(122,92,58,0.5)' }}>{inst.cert}</div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Sidebar */}
        <div>
          {/* CTA */}
          <div className="etd-cta-card">
            <div style={{ padding:'14px 20px', borderBottom:'1px solid rgba(200,169,110,0.1)' }}>
              <div style={{ display:'flex', alignItems:'center', gap:8, fontSize:12, color:'#2ecc71' }}>
                <div style={{ width:8, height:8, borderRadius:'50%', background:'#2ecc71', flexShrink:0 }} />
                Abierto ahora
              </div>
            </div>
            <div style={{ padding:'18px 20px 20px' }}>
              <div style={{ fontSize:11, color:'rgba(250,248,244,0.35)', marginBottom:16 }}>
                {FEATURES.map(f => (
                  <div key={`feat-${f}`} style={{ display:'flex', alignItems:'center', gap:8, lineHeight:2 }}>
                    <span style={{ color:'var(--gold)', flexShrink:0 }}>✓</span>
                    {f}
                  </div>
                ))}
              </div>
              <button
                onClick={() => { setModal(true); setStep(1); setSuccess(false); setSlotIdx(null) }}
                style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, width:'100%', background:'var(--crimson)', color:'#fff', fontSize:11, textTransform:'uppercase', letterSpacing:'0.1em', fontWeight:500, padding:14, borderRadius:3, border:'none', cursor:'pointer', marginBottom:10, fontFamily:'var(--font-body)' }}>
                📅 Reservar clase trial
              </button>
              <button
                onClick={handleWA}
                style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, width:'100%', background:'#25d366', color:'#fff', fontSize:11, textTransform:'uppercase', letterSpacing:'0.1em', fontWeight:500, padding:14, borderRadius:3, border:'none', cursor:'pointer', marginBottom:10, fontFamily:'var(--font-body)' }}>
                💬 Consultar por WhatsApp
              </button>
              <a
                href={`mailto:${school.email}`}
                onClick={() => trackContactEvent(school.id, 'email_click', { school_name: school.name })}
                style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, width:'100%', background:'transparent', color:'rgba(250,248,244,0.5)', fontSize:11, textTransform:'uppercase', letterSpacing:'0.1em', fontWeight:500, padding:14, borderRadius:3, border:'1px solid rgba(250,248,244,0.15)', cursor:'pointer', fontFamily:'var(--font-body)', textDecoration:'none' }}>
                ✉ Enviar mensaje
              </a>
            </div>
          </div>

          {/* Quick info */}
          <div className="etd-section-card" style={{ marginTop:16 }}>
            {quickInfo.map((row, i) => (
              <div key={`info-${i}`} style={{ display:'flex', justifyContent:'space-between', padding:'11px 20px', borderBottom: i < quickInfo.length - 1 ? '1px solid rgba(122,92,58,0.06)' : 'none', fontSize:13 }}>
                <span style={{ color:'var(--wood-light)' }}>{row.label}</span>
                <span style={{ color:'var(--ink)', fontWeight:500 }}>{row.val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MODAL RESERVA */}
      {modal && (
        <div
          style={{ position:'fixed', inset:0, background:'rgba(14,12,11,0.75)', zIndex:999, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}
          onClick={e => { if (e.target === e.currentTarget) setModal(false) }}>
          <div style={{ background:'var(--parchment)', borderRadius:'var(--radius)', width:'100%', maxWidth:480, maxHeight:'90vh', overflow:'auto', boxShadow:'0 24px 80px rgba(0,0,0,0.6)' }}>

            {/* Header */}
            <div style={{ padding:'18px 24px', borderBottom:'1px solid rgba(122,92,58,0.1)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <span style={{ fontFamily:'var(--font-display)', fontSize:20, fontWeight:400 }}>Reservar clase trial</span>
              <button onClick={() => setModal(false)} style={{ background:'none', border:'none', fontSize:24, cursor:'pointer', color:'var(--wood-light)', lineHeight:1, fontFamily:'var(--font-body)' }}>×</button>
            </div>

            {/* Stepper */}
            <div style={{ display:'flex', alignItems:'center', padding:'12px 24px', borderBottom:'1px solid rgba(122,92,58,0.08)' }}>
              {STEP_LABELS.map((s, i) => (
                <div key={`step-${i}`} style={{ display:'flex', alignItems:'center', flex:1 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <div style={{
                      width:24, height:24, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:600,
                      background: success || i+1 < step ? 'var(--success-bright)' : i+1 === step ? 'var(--crimson)' : 'var(--parchment-dark)',
                      color: (success || i+1 <= step) ? '#fff' : 'var(--wood-light)',
                    }}>
                      {(success || i+1 < step) ? '✓' : i+1}
                    </div>
                    <span style={{ fontSize:11, color: i+1 === step ? 'var(--ink)' : 'var(--wood-light)', fontWeight: i+1 === step ? 500 : 400 }}>{s}</span>
                  </div>
                  {i < STEP_LABELS.length - 1 && <div style={{ flex:1, height:1, background:'rgba(122,92,58,0.15)', margin:'0 8px' }} />}
                </div>
              ))}
            </div>

            <div style={{ padding:24 }}>
              {success ? (
                <div style={{ textAlign:'center', padding:'16px 0' }}>
                  <div style={{ fontSize:48, marginBottom:12 }}>✓</div>
                  <div style={{ fontFamily:'var(--font-display)', fontSize:24, marginBottom:8 }}>¡Reserva confirmada!</div>
                  <p style={{ color:'var(--wood-light)', fontSize:14, lineHeight:1.6, marginBottom:20 }}>
                    <strong>{school.name}</strong> recibió tu solicitud.
                    Te contactarán a <strong>{form.email}</strong> en las próximas 24hs.
                  </p>
                  <div style={{ display:'flex', gap:10, justifyContent:'center' }}>
                    <button onClick={() => setModal(false)} style={{ padding:'10px 20px', background:'var(--parchment-dark)', border:'1px solid rgba(122,92,58,0.2)', borderRadius:3, cursor:'pointer', fontFamily:'var(--font-body)', fontSize:12 }}>
                      Cerrar
                    </button>
                    <Link href="/panel" style={{ padding:'10px 20px', background:'var(--crimson)', color:'#fff', borderRadius:3, fontSize:12, textDecoration:'none' }}>
                      Ver mis reservas →
                    </Link>
                  </div>
                </div>

              ) : step === 1 ? (
                <div>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:12 }}>
                    <div className="etd-form-field">
                      <label className="etd-form-label">Nombre *</label>
                      <input className="etd-form-input" value={form.nombre} onChange={e => setForm({...form, nombre:e.target.value})} placeholder="Martín" />
                    </div>
                    <div className="etd-form-field">
                      <label className="etd-form-label">Apellido</label>
                      <input className="etd-form-input" value={form.apellido} onChange={e => setForm({...form, apellido:e.target.value})} placeholder="González" />
                    </div>
                  </div>
                  <div className="etd-form-field">
                    <label className="etd-form-label">Email *</label>
                    <input className="etd-form-input" type="email" value={form.email} onChange={e => setForm({...form, email:e.target.value})} placeholder="tu@email.com" />
                  </div>
                  <div className="etd-form-field">
                    <label className="etd-form-label">Teléfono</label>
                    <input className="etd-form-input" value={form.tel} onChange={e => setForm({...form, tel:e.target.value})} placeholder="+54 9 11..." />
                  </div>
                  <div className="etd-form-field">
                    <label className="etd-form-label">Nivel</label>
                    <select className="etd-form-input" value={form.nivel} onChange={e => setForm({...form, nivel:e.target.value})}>
                      <option value="principiante">Principiante — nunca practiqué</option>
                      <option value="intermedio">Intermedio — tengo experiencia</option>
                      <option value="avanzado">Avanzado</option>
                    </select>
                  </div>
                  <button
                    onClick={() => {
                      if (!form.nombre.trim() || !form.email.trim()) return
                      trackContactEvent(school.id, 'trial_started', { school_name: school.name })
                      setStep(2)
                    }}
                    className="etd-btn-submit">
                    Siguiente — Elegir horario →
                  </button>
                </div>

              ) : step === 2 ? (
                <div>
                  <p style={{ fontSize:13, color:'var(--wood-light)', marginBottom:14 }}>Seleccioná el turno que mejor te venga:</p>
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8, marginBottom:16 }}>
                    {SLOTS.map((slot, i) => (
                      <button key={`slot-${i}`}
                        disabled={!slot.libre}
                        onClick={() => setSlotIdx(i)}
                        style={{ padding:'10px 6px', border:`1px solid ${slotIdx === i ? 'var(--crimson)' : 'rgba(122,92,58,0.18)'}`, borderRadius:4, background: slotIdx === i ? 'var(--crimson-pale)' : 'var(--parchment)', cursor: slot.libre ? 'pointer' : 'not-allowed', opacity: slot.libre ? 1 : 0.4, fontFamily:'var(--font-body)', fontSize:12, color: slotIdx === i ? 'var(--crimson)' : 'var(--ink-soft)', lineHeight:1.4, textAlign:'center' }}>
                        {slot.dia}<br /><strong>{slot.hora}</strong>
                        {!slot.libre && <><br /><span style={{ fontSize:9 }}>Ocupado</span></>}
                      </button>
                    ))}
                  </div>
                  <div style={{ display:'flex', gap:10 }}>
                    <button onClick={() => setStep(1)} style={{ padding:'12px 20px', background:'var(--parchment-dark)', border:'1px solid rgba(122,92,58,0.2)', borderRadius:3, cursor:'pointer', fontFamily:'var(--font-body)', fontSize:12 }}>← Volver</button>
                    <button onClick={() => slotIdx !== null && setStep(3)} disabled={slotIdx === null} className="etd-btn-submit" style={{ flex:1, opacity: slotIdx === null ? 0.5 : 1 }}>Ver confirmación →</button>
                  </div>
                </div>

              ) : (
                <div>
                  <div style={{ background:'var(--parchment-dark)', borderRadius:6, padding:'16px 20px', marginBottom:16 }}>
                    {confirmRows.map((row, i) => (
                      <div key={`confirm-${i}`} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom: i < confirmRows.length - 1 ? '1px solid rgba(122,92,58,0.07)' : 'none', fontSize:13 }}>
                        <span style={{ color:'var(--wood-light)' }}>{row.label}</span>
                        <span style={{ color:'var(--ink)', fontWeight:500 }}>{row.val}</span>
                      </div>
                    ))}
                  </div>
                  <p style={{ fontSize:12, color:'var(--wood-light)', lineHeight:1.6, marginBottom:16 }}>
                    La escuela recibirá tus datos y te contactará en menos de 24hs. El pago se realiza directamente en el dojo.
                  </p>
                  <div style={{ display:'flex', gap:10 }}>
                    <button onClick={() => setStep(2)} style={{ padding:'12px 20px', background:'var(--parchment-dark)', border:'1px solid rgba(122,92,58,0.2)', borderRadius:3, cursor:'pointer', fontFamily:'var(--font-body)', fontSize:12 }}>← Volver</button>
                    <button onClick={confirmarReserva} className="etd-btn-submit" style={{ flex:1 }}>✓ Confirmar reserva</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
