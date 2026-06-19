'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { COMMISSION_TIERS } from '@/types/database'
import type { CommissionTier } from '@/types/database'

function calcTier(n: number): { tier: CommissionTier; rate: number; fee: number } {
  if (n <= 0)   return { tier:'sin_alumnos', rate:0,    fee:0 }
  if (n <= 40)  return { tier:'pequeño',     rate:1.20, fee:+(n*1.20).toFixed(2) }
  if (n <= 100) return { tier:'media',       rate:1.00, fee:+(n*1.00).toFixed(2) }
  if (n <= 200) return { tier:'grande',      rate:0.80, fee:+(n*0.80).toFixed(2) }
  if (n <= 400) return { tier:'premium',     rate:0.65, fee:+(n*0.65).toFixed(2) }
  return        { tier:'multisede',          rate:0.50, fee:+(n*0.50).toFixed(2) }
}

export default function RegistroPage() {
  const [step, setStep]       = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string|null>(null)
  const [isFranchise, setIsFranchise] = useState(false)
  const [students, setStudents] = useState(70)
  const [loggedUser, setLoggedUser] = useState<{ id: string; email: string; firstName: string } | null>(null)
  const [form, setForm] = useState({
    schoolName:'', discipline:'karate', city:'', neighborhood:'', address:'',
    phone:'', whatsapp:'', email:'', instagram:'',
    firstName:'', lastName:'', userEmail:'', password:'', confirm:'',
  })

  const commission = calcTier(students)
  const tierInfo   = COMMISSION_TIERS[commission.tier]

  // Detectar si ya hay sesión activa
  useEffect(() => {
    const sb = createClient()
    sb.auth.getUser().then(({ data }) => {
      if (data.user) {
        setLoggedUser({
          id: data.user.id,
          email: data.user.email ?? '',
          firstName: data.user.user_metadata?.first_name ?? '',
        })
        // Pre-rellenar campos de cuenta con los datos del usuario logueado
        setForm(prev => ({
          ...prev,
          firstName: data.user!.user_metadata?.first_name ?? '',
          lastName:  data.user!.user_metadata?.last_name ?? '',
          userEmail: data.user!.email ?? '',
        }))
      }
    })
  }, [])

  async function handleSubmit() {
    setLoading(true); setError(null)
    const sb = createClient()
    let userId: string

    if (loggedUser) {
      // Usuario ya logueado — usar su ID directamente
      userId = loggedUser.id
    } else {
      // Usuario nuevo — crear cuenta
      if (form.password !== form.confirm) { setError('Las contraseñas no coinciden'); setLoading(false); return }
      if (form.password.length < 8) { setError('Mínimo 8 caracteres'); setLoading(false); return }
      const { data, error: authErr } = await sb.auth.signUp({
        email: form.userEmail,
        password: form.password,
        options: { data: { first_name: form.firstName, last_name: form.lastName, type: 'escuela' } }
      })
      if (authErr || !data.user) { setError(authErr?.message ?? 'Error al crear la cuenta'); setLoading(false); return }
      userId = data.user.id
    }

    // Crear la escuela en la DB
    const slug = form.schoolName.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')

    const { error: insertErr } = await sb.from('schools').insert({
      owner_id:     userId,
      name:         form.schoolName,
      slug:         slug + '-' + Date.now(),
      discipline_id: form.discipline,
      city:         form.city,
      neighborhood: form.neighborhood,
      address:      form.address,
      phone:        form.phone,
      whatsapp:     form.whatsapp.replace(/\D/g,''),
      email:        form.email,
      instagram:    form.instagram,
      student_count: students,
      is_franchise:  isFranchise,
      status:       'pending',
    })

    if (insertErr) { setError('Error al registrar la escuela: ' + insertErr.message); setLoading(false); return }

    setLoading(false)
    setStep(4) // Éxito
  }

  return (
    <main style={{ minHeight:'100vh', background:'var(--ink)', position:'relative', overflow:'hidden' }}>

      {/* Grid de fondo */}
      <div style={{ position:'absolute', inset:0, backgroundImage:'repeating-linear-gradient(0deg,transparent,transparent 59px,rgba(200,169,110,0.03) 59px,rgba(200,169,110,0.03) 60px),repeating-linear-gradient(90deg,transparent,transparent 59px,rgba(200,169,110,0.03) 59px,rgba(200,169,110,0.03) 60px)', pointerEvents:'none', zIndex:0 }} />

      {/* Acento izquierdo */}
      <div style={{ position:'absolute', left:0, top:0, bottom:0, width:3, background:'linear-gradient(to bottom,transparent,var(--crimson) 20%,var(--crimson-bright) 80%,transparent)', pointerEvents:'none', zIndex:0 }} />

      {/* Kanji de fondo */}
      <div style={{ position:'fixed', right:0, top:'50%', transform:'translateY(-50%) translateX(30%)', fontFamily:'var(--font-jp)', fontSize:'clamp(200px,30vw,400px)', lineHeight:1, color:'rgba(200,169,110,0.04)', pointerEvents:'none', userSelect:'none', zIndex:0 }}>武道</div>

      <nav className="etd-nav" style={{ position:'relative', zIndex:10 }}>
        <Link href="/" className="etd-nav-logo">
          <span className="etd-nav-kanji">武</span>
          <span className="etd-nav-name">EncuentraTuDojo</span>
        </Link>
        <Link href="/" className="etd-nav-back">← Volver</Link>
      </nav>

      <div style={{ position:'relative', zIndex:1, maxWidth:640, margin:'0 auto', padding:'calc(var(--nav-h) + 40px) clamp(16px,4vw,24px) 80px' }}>

        {/* Header */}
        <div style={{ textAlign:'center', marginBottom:40 }}>
          <div style={{ fontFamily:'var(--font-jp)', fontSize:48, color:'rgba(200,169,110,0.2)', marginBottom:12 }}>武</div>
          <h1 style={{ fontFamily:'var(--font-display)', fontSize:36, fontWeight:300, color:'var(--parchment)', lineHeight:1.1, marginBottom:8 }}>
            Registrá tu <em style={{ fontStyle:'italic', color:'var(--crimson-bright)' }}>escuela</em>
          </h1>
          <p style={{ fontSize:14, color:'rgba(250,248,244,0.4)', lineHeight:1.7 }}>
            Tu comisión se calcula automáticamente según la cantidad de alumnos. Sin contrato fijo.
          </p>
        </div>

        {/* Stepper */}
        <div style={{ display:'flex', alignItems:'center', marginBottom:36 }}>
          {['Datos de la escuela','Alumnos y comisión','Tu cuenta'].map((s,i) => (
            <div key={s} style={{ display:'flex', alignItems:'center', flex:1 }}>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <div style={{ width:28, height:28, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:600,
                  background: i+1 < step ? 'var(--success-bright)' : i+1 === step ? 'var(--crimson)' : 'rgba(250,248,244,0.1)',
                  color: i+1 <= step ? '#fff' : 'rgba(250,248,244,0.3)' }}>
                  {i+1 < step ? '✓' : i+1}
                </div>
                <span style={{ fontSize:11, color: i+1 === step ? 'var(--gold)' : 'rgba(250,248,244,0.3)', textTransform:'uppercase', letterSpacing:'0.1em' }}>{s}</span>
              </div>
              {i < 2 && <div style={{ flex:1, height:1, background:'rgba(250,248,244,0.1)', margin:'0 12px' }} />}
            </div>
          ))}
        </div>

        {error && step !== 3 && (
          <div style={{ padding:'10px 16px', background:'rgba(192,57,43,0.15)', border:'1px solid rgba(192,57,43,0.3)', borderRadius:4, color:'var(--crimson-bright)', fontSize:13, marginBottom:16 }}>
            {error}
          </div>
        )}

        <div style={{ background:'var(--parchment)', borderRadius:'var(--radius)', overflow:'hidden', boxShadow:'0 24px 80px rgba(0,0,0,0.5)', width:'100%' }}>

          {/* PASO 1 — Datos de la escuela */}
          {step === 1 && (
            <div style={{ padding:'clamp(20px,5vw,32px)' }}>
              <h2 style={{ fontFamily:'var(--font-display)', fontSize:22, fontWeight:400, marginBottom:20, color:'var(--ink)' }}>Datos de la escuela</h2>
              <div className="etd-form-field">
                <label className="etd-form-label">Nombre de la escuela *</label>
                <input className="etd-form-input" value={form.schoolName} onChange={e => setForm({...form, schoolName:e.target.value})} placeholder="Ej: Dragon Gate Dojo" />
              </div>
              <div className="etd-form-field">
                <label className="etd-form-label">Disciplina principal *</label>
                <select className="etd-form-input" value={form.discipline} onChange={e => setForm({...form, discipline:e.target.value})}>
                  {[['karate','Karate'],['taekwondo','Taekwondo'],['judo','Judo'],['kung-fu','Kung Fu'],['aikido','Aikido'],['hapkido','Hapkido'],['pakua','Pakua'],['kenjutsu','Kenjutsu']].map(([v,l]) => (
                    <option key={v} value={v}>{l}</option>
                  ))}
                </select>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(130px, 1fr))', gap:12 }}>
                <div className="etd-form-field"><label className="etd-form-label">Ciudad *</label><input className="etd-form-input" value={form.city} onChange={e => setForm({...form, city:e.target.value})} placeholder="Buenos Aires" /></div>
                <div className="etd-form-field"><label className="etd-form-label">Barrio *</label><input className="etd-form-input" value={form.neighborhood} onChange={e => setForm({...form, neighborhood:e.target.value})} placeholder="Palermo" /></div>
              </div>
              <div className="etd-form-field"><label className="etd-form-label">Dirección</label><input className="etd-form-input" value={form.address} onChange={e => setForm({...form, address:e.target.value})} placeholder="Av. Santa Fe 1234" /></div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(130px, 1fr))', gap:12 }}>
                <div className="etd-form-field"><label className="etd-form-label">Teléfono</label><input className="etd-form-input" value={form.phone} onChange={e => setForm({...form, phone:e.target.value})} placeholder="011 4444-5555" /></div>
                <div className="etd-form-field"><label className="etd-form-label">WhatsApp</label><input className="etd-form-input" value={form.whatsapp} onChange={e => setForm({...form, whatsapp:e.target.value})} placeholder="+54 9 11 1234-5678" /></div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(130px, 1fr))', gap:12 }}>
                <div className="etd-form-field"><label className="etd-form-label">Email de contacto</label><input className="etd-form-input" type="email" value={form.email} onChange={e => setForm({...form, email:e.target.value})} placeholder="info@escuela.com" /></div>
                <div className="etd-form-field"><label className="etd-form-label">Instagram</label><input className="etd-form-input" value={form.instagram} onChange={e => setForm({...form, instagram:e.target.value})} placeholder="@mi.escuela" /></div>
              </div>
              <button
                onClick={() => { if (!form.schoolName.trim() || !form.city.trim()) { setError('Completá nombre y ciudad'); return } setError(null); setStep(2) }}
                className="etd-btn-submit">
                Siguiente →
              </button>
            </div>
          )}

          {/* PASO 2 — Alumnos y comisión */}
          {step === 2 && (
            <div style={{ padding:'clamp(20px,5vw,32px)' }}>
              <h2 style={{ fontFamily:'var(--font-display)', fontSize:22, fontWeight:400, marginBottom:8, color:'var(--ink)' }}>Cantidad de alumnos</h2>
              <p style={{ fontSize:13, color:'var(--wood-light)', marginBottom:24, lineHeight:1.6 }}>
                Este dato determina tu comisión mensual. Podés actualizarlo en cualquier momento desde tu dashboard.
              </p>

              {/* Toggle franquicia */}
              <div style={{ display:'flex', alignItems:'center', gap:12, padding:'14px 16px', background:'var(--parchment-dark)', borderRadius:4, marginBottom:24, cursor:'pointer' }}
                onClick={() => setIsFranchise(!isFranchise)}>
                <div style={{ width:20, height:20, border:`2px solid ${isFranchise ? 'var(--gold)' : 'rgba(122,92,58,0.3)'}`, borderRadius:4, background: isFranchise ? 'var(--gold)' : 'transparent', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  {isFranchise && <span style={{ color:'var(--ink)', fontSize:12, fontWeight:700 }}>✓</span>}
                </div>
                <div>
                  <div style={{ fontSize:14, fontWeight:500, color:'var(--ink)' }}>Soy una franquicia o red multi-sede (3+ sedes)</div>
                  <div style={{ fontSize:12, color:'var(--wood-light)' }}>Hablaremos con vos para un acuerdo especial</div>
                </div>
              </div>

              {isFranchise ? (
                <div style={{ background:'rgba(200,169,110,0.08)', border:'1px solid rgba(200,169,110,0.2)', borderRadius:6, padding:20, textAlign:'center' }}>
                  <div style={{ fontFamily:'var(--font-jp)', fontSize:36, color:'var(--gold)', marginBottom:12 }}>武</div>
                  <div style={{ fontFamily:'var(--font-display)', fontSize:20, color:'var(--ink)', marginBottom:8 }}>Acuerdo especial para franquicias</div>
                  <p style={{ fontSize:13, color:'var(--wood-light)', lineHeight:1.7, marginBottom:16 }}>
                    Las redes con 3 o más sedes reciben condiciones personalizadas: tarifa por sede, dashboard unificado y soporte prioritario. Nuestro equipo se contactará con vos dentro de las 48hs.
                  </p>
                </div>
              ) : (
                <>
                  <div className="etd-form-field">
                    <label className="etd-form-label">Cantidad de alumnos activos *</label>
                    <input className="etd-form-input" type="number" min="1" value={students} onChange={e => setStudents(Math.max(1,+e.target.value))} />
                  </div>

                  {/* Preview comisión */}
                  <div style={{ background:'var(--ink)', borderRadius:6, padding:20, marginTop:4 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
                      <div>
                        <div style={{ fontSize:10, textTransform:'uppercase', letterSpacing:'0.14em', color:'var(--gold)', marginBottom:4 }}>Tu comisión mensual</div>
                        <div style={{ fontFamily:'var(--font-display)', fontSize:32, color:'var(--parchment)', lineHeight:1 }}>
                          ${commission.fee.toFixed(2)} <span style={{ fontSize:16, color:'rgba(250,248,244,0.4)' }}>USD</span>
                        </div>
                        <div style={{ fontSize:12, color:'rgba(250,248,244,0.4)', marginTop:4 }}>
                          {students} alumnos × ${commission.rate.toFixed(2)} — <span style={{ color:'var(--gold)' }}>{tierInfo?.label}</span>
                        </div>
                      </div>
                      <div style={{ textAlign:'right' }}>
                        <div style={{ fontSize:11, color:'rgba(250,248,244,0.4)', marginBottom:4 }}>Rango</div>
                        <div style={{ fontSize:13, fontWeight:500, color:'var(--parchment)' }}>{tierInfo?.range} alumnos</div>
                      </div>
                    </div>
                    <div style={{ fontSize:11, color:'rgba(250,248,244,0.25)', lineHeight:1.6 }}>
                      Sin contrato fijo · Se ajusta si cambiás el rango · Pagos mensuales en USD
                    </div>
                  </div>

                  {/* Tabla de rangos compacta */}
                  <div style={{ marginTop:16, fontSize:12 }}>
                    <div style={{ color:'var(--wood-light)', marginBottom:8, textTransform:'uppercase', letterSpacing:'0.1em', fontSize:10 }}>Todos los rangos</div>
                    {Object.entries(COMMISSION_TIERS).filter(([k]) => k !== 'sin_alumnos' && k !== 'franquicia').map(([key, t]) => (
                      <div key={key} style={{ display:'flex', justifyContent:'space-between', padding:'6px 10px', borderRadius:3, background: commission.tier === key ? 'rgba(200,169,110,0.1)' : 'transparent', border: commission.tier === key ? '1px solid rgba(200,169,110,0.2)' : '1px solid transparent' }}>
                        <span style={{ color: commission.tier === key ? 'var(--ink)' : 'var(--wood-light)', fontWeight: commission.tier === key ? 600 : 400 }}>{t.label} ({t.range})</span>
                        <span style={{ color: commission.tier === key ? 'var(--crimson)' : 'var(--wood-light)' }}>${t.rate.toFixed(2)}/alumno</span>
                      </div>
                    ))}
                  </div>
                </>
              )}

              <div style={{ display:'flex', gap:10, marginTop:24 }}>
                <button onClick={() => setStep(1)} style={{ padding:'12px 20px', background:'var(--parchment-dark)', border:'1px solid rgba(122,92,58,0.2)', borderRadius:3, cursor:'pointer', fontFamily:'var(--font-body)', fontSize:12 }}>← Volver</button>
                <button onClick={() => setStep(3)} className="etd-btn-submit" style={{ flex:1 }}>Siguiente →</button>
              </div>
            </div>
          )}

          {/* PASO 3 — Cuenta */}
          {step === 3 && (
            <div style={{ padding:'clamp(20px,5vw,32px)' }}>
              {loggedUser ? (
                // Ya está logueado — mostrar resumen y confirmar
                <>
                  <h2 style={{ fontFamily:'var(--font-display)', fontSize:22, fontWeight:400, marginBottom:8, color:'var(--ink)' }}>Tu cuenta</h2>
                  <p style={{ fontSize:13, color:'var(--wood-light)', marginBottom:20, lineHeight:1.6 }}>
                    La escuela quedará asociada a tu cuenta actual.
                  </p>
                  <div style={{ background:'var(--parchment-dark)', borderRadius:6, padding:'16px 20px', marginBottom:20 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid rgba(122,92,58,0.07)', fontSize:13 }}>
                      <span style={{ color:'var(--wood-light)' }}>Cuenta</span>
                      <span style={{ color:'var(--ink)', fontWeight:500 }}>{loggedUser.email}</span>
                    </div>
                    <div style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', fontSize:13 }}>
                      <span style={{ color:'var(--wood-light)' }}>Escuela</span>
                      <span style={{ color:'var(--ink)', fontWeight:500 }}>{form.schoolName}</span>
                    </div>
                  </div>
                  {error && (
                    <div style={{ padding:'10px 14px', background:'rgba(192,57,43,0.1)', border:'1px solid rgba(192,57,43,0.25)', borderRadius:4, color:'var(--crimson)', fontSize:13, marginBottom:16 }}>
                      {error}
                    </div>
                  )}
                  <div style={{ display:'flex', gap:10 }}>
                    <button onClick={() => setStep(2)} style={{ padding:'12px 20px', background:'var(--parchment-dark)', border:'1px solid rgba(122,92,58,0.2)', borderRadius:3, cursor:'pointer', fontFamily:'var(--font-body)', fontSize:12 }}>← Volver</button>
                    <button onClick={handleSubmit} disabled={loading} className="etd-btn-submit" style={{ flex:1 }}>
                      {loading ? 'Registrando...' : 'Registrar mi escuela'}
                    </button>
                  </div>
                </>
              ) : (
                // No está logueado — mostrar formulario de cuenta nueva
                <>
                  <h2 style={{ fontFamily:'var(--font-display)', fontSize:22, fontWeight:400, marginBottom:20, color:'var(--ink)' }}>Creá tu cuenta</h2>
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(130px, 1fr))', gap:12 }}>
                    <div className="etd-form-field"><label className="etd-form-label">Nombre *</label><input className="etd-form-input" value={form.firstName} onChange={e => setForm({...form, firstName:e.target.value})} placeholder="Martín" /></div>
                    <div className="etd-form-field"><label className="etd-form-label">Apellido</label><input className="etd-form-input" value={form.lastName} onChange={e => setForm({...form, lastName:e.target.value})} placeholder="González" /></div>
                  </div>
                  <div className="etd-form-field"><label className="etd-form-label">Email de la cuenta *</label><input className="etd-form-input" type="email" value={form.userEmail} onChange={e => setForm({...form, userEmail:e.target.value})} placeholder="tu@email.com" /></div>
                  <div className="etd-form-field"><label className="etd-form-label">Contraseña *</label><input className="etd-form-input" type="password" value={form.password} onChange={e => setForm({...form, password:e.target.value})} placeholder="Mínimo 8 caracteres" /></div>
                  <div className="etd-form-field"><label className="etd-form-label">Confirmar contraseña *</label><input className="etd-form-input" type="password" value={form.confirm} onChange={e => setForm({...form, confirm:e.target.value})} placeholder="Repetí tu contraseña" /></div>
                  {error && (
                    <div style={{ padding:'10px 14px', background:'rgba(192,57,43,0.1)', border:'1px solid rgba(192,57,43,0.25)', borderRadius:4, color:'var(--crimson)', fontSize:13, marginBottom:8 }}>
                      {error}
                    </div>
                  )}
                  <div style={{ display:'flex', gap:10, marginTop:8 }}>
                    <button onClick={() => setStep(2)} style={{ padding:'12px 20px', background:'var(--parchment-dark)', border:'1px solid rgba(122,92,58,0.2)', borderRadius:3, cursor:'pointer', fontFamily:'var(--font-body)', fontSize:12 }}>← Volver</button>
                    <button onClick={handleSubmit} disabled={loading} className="etd-btn-submit" style={{ flex:1 }}>
                      {loading ? 'Registrando...' : 'Registrar mi escuela'}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* PASO 4 — Éxito */}
          {step === 4 && (
            <div style={{ padding:40, textAlign:'center' }}>
              <div style={{ fontFamily:'var(--font-jp)', fontSize:56, color:'var(--gold)', marginBottom:16 }}>武</div>
              <div style={{ fontFamily:'var(--font-display)', fontSize:28, fontWeight:400, color:'var(--ink)', marginBottom:8 }}>¡Escuela registrada!</div>
              <p style={{ fontSize:14, color:'var(--wood-light)', lineHeight:1.7, marginBottom:24 }}>
                Revisá tu email para confirmar la cuenta. Una vez verificada, tu perfil será revisado por nuestro equipo en menos de 24hs.
              </p>
              <Link href="/auth" className="etd-btn-submit" style={{ display:'inline-block', textDecoration:'none', padding:'14px 32px' }}>
                Ir al login →
              </Link>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
