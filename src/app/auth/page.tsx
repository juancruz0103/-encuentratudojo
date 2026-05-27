'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn, signUp } from '@/lib/auth'
import Link from 'next/link'

function AuthContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [mode, setMode]       = useState<'login' | 'register'>('login')

  // Leer error del callback y redirect destino
  useEffect(() => {
    const err = searchParams.get('error')
    const msg = searchParams.get('message')
    if (err) setError(decodeURIComponent(err))
    if (msg) setSuccess(decodeURIComponent(msg))
  }, [searchParams])

  const redirectTo = searchParams.get('redirect') ?? ''
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [userType, setUserType] = useState<'alumno' | 'escuela'>('alumno')

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true); setError(null)
    const form     = e.currentTarget
    const email    = (form.elements.namedItem('email')    as HTMLInputElement).value
    const password = (form.elements.namedItem('password') as HTMLInputElement).value
    const { data, error } = await signIn(email, password)
    if (error) { setError('Email o contraseña incorrectos'); setLoading(false); return }
    const type = data.user?.user_metadata?.type
    const dest = redirectTo || (type === 'escuela' ? '/dashboard' : type === 'admin' ? '/admin' : '/panel')
    router.push(dest)
  }

  async function handleRegister(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true); setError(null)
    const form      = e.currentTarget
    const firstName = (form.elements.namedItem('firstName') as HTMLInputElement).value
    const lastName  = (form.elements.namedItem('lastName')  as HTMLInputElement).value
    const email     = (form.elements.namedItem('email')     as HTMLInputElement).value
    const password  = (form.elements.namedItem('password')  as HTMLInputElement).value
    const confirm   = (form.elements.namedItem('confirm')   as HTMLInputElement).value
    if (password !== confirm) { setError('Las contraseñas no coinciden'); setLoading(false); return }
    if (password.length < 8)  { setError('Mínimo 8 caracteres'); setLoading(false); return }
    const { error } = await signUp(email, password, firstName, lastName, userType)
    if (error) { setError('Error al crear la cuenta. Intentá de nuevo.'); setLoading(false); return }
    setSuccess(userType === 'escuela'
      ? '¡Cuenta creada! Revisá tu email para confirmar. Luego podrás registrar tu escuela.'
      : '¡Bienvenido! Revisá tu email para confirmar tu cuenta.')
    setLoading(false)
  }

  return (
    <div className="etd-auth-wrap" style={{ position: 'relative' }}>
      {/* Grid de fondo igual al hero */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: [
          'repeating-linear-gradient(0deg, transparent, transparent 59px, rgba(200,169,110,0.03) 59px, rgba(200,169,110,0.03) 60px)',
          'repeating-linear-gradient(90deg, transparent, transparent 59px, rgba(200,169,110,0.03) 59px, rgba(200,169,110,0.03) 60px)',
        ].join(','),
      }} />
      {/* Acento vertical izquierdo */}
      <div style={{
        position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, pointerEvents: 'none',
        background: 'linear-gradient(to bottom, transparent, var(--crimson) 20%, var(--crimson-bright) 80%, transparent)',
      }} />
      {/* Kanji de fondo */}
      <div style={{
        position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%) translateX(40%)', maxWidth: '100%',
        fontFamily: 'var(--font-jp)', fontSize: 360, lineHeight: 1,
        color: 'rgba(200,169,110,0.03)', pointerEvents: 'none', userSelect: 'none',
      }}>武道</div>
      {/* Kanji de fondo */}
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', overflow: 'hidden' }}>
        <span style={{ fontFamily: 'var(--font-jp)', fontSize: '400px', color: 'rgba(200,169,110,0.025)', lineHeight: 1, userSelect: 'none' }}>武</span>
      </div>

      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: '440px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
            <span className="etd-nav-kanji">武</span>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 600, color: 'var(--parchment)', letterSpacing: '0.07em' }}>EncuentraTuDojo</span>
          </Link>
        </div>

        <div className="etd-auth-card">
          {/* Tabs */}
          <div className="etd-auth-tabs">
            <button onClick={() => { setMode('login'); setError(null) }} className={`etd-auth-tab${mode === 'login' ? ' active' : ''}`}>Ingresar</button>
            <button onClick={() => { setMode('register'); setError(null) }} className={`etd-auth-tab${mode === 'register' ? ' active' : ''}`}>Registrarse</button>
          </div>

          <div className="etd-auth-body">
            {error && (
              <div style={{ marginBottom: '14px', padding: '10px 14px', background: 'rgba(139,26,26,0.08)', border: '1px solid rgba(139,26,26,0.2)', borderRadius: '3px', fontSize: '13px', color: 'var(--crimson)' }}>
                {error}
              </div>
            )}

            {success ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ fontSize: '40px', marginBottom: '12px' }}>🎉</div>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: '22px', color: 'var(--ink)', marginBottom: '8px' }}>¡Listo!</p>
                <p style={{ color: 'var(--wood-light)', fontSize: '14px', lineHeight: 1.6, marginBottom: '20px' }}>{success}</p>
                <Link href="/" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--crimson)' }}>← Volver al inicio</Link>
              </div>
            ) : mode === 'login' ? (
              <form onSubmit={handleLogin}>
                <div className="etd-form-field">
                  <label className="etd-form-label">Email</label>
                  <input name="email" type="email" required autoComplete="email" className="etd-form-input" placeholder="tu@email.com" />
                </div>
                <div className="etd-form-field">
                  <label className="etd-form-label">Contraseña</label>
                  <input name="password" type="password" required autoComplete="current-password" className="etd-form-input" placeholder="••••••••" />
                </div>
                <button type="submit" disabled={loading} className="etd-btn-submit">
                  {loading ? 'Ingresando...' : 'Ingresar'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegister}>
                {/* Tipo de cuenta */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
                  {(['alumno', 'escuela'] as const).map(type => (
                    <button key={type} type="button" onClick={() => setUserType(type)}
                      style={{ padding: '12px 8px', fontSize: '13px', fontWeight: 500, border: `1px solid ${userType === type ? 'var(--crimson)' : 'rgba(122,92,58,0.2)'}`, borderRadius: '3px', cursor: 'pointer', fontFamily: 'var(--font-body)', transition: 'all 0.18s', background: userType === type ? 'var(--crimson-pale)' : 'transparent', color: userType === type ? 'var(--crimson)' : 'var(--wood-light)' }}>
                      {type === 'alumno' ? '👤 Soy alumno' : '🏫 Tengo una escuela'}
                    </button>
                  ))}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div className="etd-form-field">
                    <label className="etd-form-label">Nombre *</label>
                    <input name="firstName" type="text" required className="etd-form-input" placeholder="Martín" />
                  </div>
                  <div className="etd-form-field">
                    <label className="etd-form-label">Apellido</label>
                    <input name="lastName" type="text" className="etd-form-input" placeholder="González" />
                  </div>
                </div>
                <div className="etd-form-field">
                  <label className="etd-form-label">Email *</label>
                  <input name="email" type="email" required autoComplete="email" className="etd-form-input" placeholder="tu@email.com" />
                </div>
                <div className="etd-form-field">
                  <label className="etd-form-label">Contraseña *</label>
                  <input name="password" type="password" required className="etd-form-input" placeholder="Mínimo 8 caracteres" />
                </div>
                <div className="etd-form-field">
                  <label className="etd-form-label">Confirmar contraseña *</label>
                  <input name="confirm" type="password" required className="etd-form-input" placeholder="Repetí tu contraseña" />
                </div>
                <button type="submit" disabled={loading} className="etd-btn-submit">
                  {loading ? 'Creando cuenta...' : 'Crear cuenta'}
                </button>
              </form>
            )}
          </div>
        </div>

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '12px', color: 'rgba(250,248,244,0.2)' }}>
          <Link href="/" style={{ color: 'rgba(250,248,244,0.3)' }}>← Volver al inicio</Link>
        </p>
      </div>
    </div>
  )
}

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight:'100vh', background:'var(--ink)', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <div style={{ fontFamily:'var(--font-jp)', fontSize:48, color:'rgba(200,169,110,0.2)' }}>武</div>
      </div>
    }>
      <AuthContent />
    </Suspense>
  )
}
