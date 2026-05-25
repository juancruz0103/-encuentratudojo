'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Suspense } from 'react'

function ConfirmContent() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const token_hash = searchParams.get('token_hash')
    const type       = searchParams.get('type') as any
    const next       = searchParams.get('next') ?? '/'

    if (!token_hash || !type) {
      setStatus('error')
      setMessage('Link inválido. Por favor solicitá uno nuevo.')
      return
    }

    const sb = createClient()
    sb.auth.verifyOtp({ token_hash, type }).then(async ({ data, error }) => {
      if (error) {
        setStatus('error')
        setMessage(error.message === 'Token has expired or is invalid'
          ? 'El link expiró. Los links de confirmación son válidos por 24 horas.'
          : error.message)
        return
      }

      setStatus('success')

      // Redirigir según tipo de usuario
      const userType = data.user?.user_metadata?.type
      setTimeout(() => {
        if (userType === 'escuela') router.push('/dashboard')
        else if (userType === 'admin') router.push('/admin')
        else router.push('/panel')
      }, 2000)
    })
  }, [searchParams, router])

  return (
    <div style={{ minHeight:'100vh', background:'var(--ink)', display:'flex', alignItems:'center', justifyContent:'center', padding:20, position:'relative', overflow:'hidden' }}>
      {/* Fondo */}
      <div style={{ position:'absolute', inset:0, backgroundImage:'repeating-linear-gradient(0deg,transparent,transparent 59px,rgba(200,169,110,0.03) 59px,rgba(200,169,110,0.03) 60px),repeating-linear-gradient(90deg,transparent,transparent 59px,rgba(200,169,110,0.03) 59px,rgba(200,169,110,0.03) 60px)', pointerEvents:'none' }} />
      <div style={{ position:'absolute', left:0, top:0, bottom:0, width:3, background:'linear-gradient(to bottom,transparent,var(--crimson) 20%,var(--crimson-bright) 80%,transparent)', pointerEvents:'none' }} />

      <div style={{ position:'relative', zIndex:1, textAlign:'center', maxWidth:440 }}>
        <Link href="/" style={{ display:'inline-flex', alignItems:'center', gap:10, marginBottom:32, textDecoration:'none' }}>
          <span style={{ fontFamily:'var(--font-jp)', fontSize:24, color:'var(--crimson-bright)' }}>武</span>
          <span style={{ fontFamily:'var(--font-display)', fontSize:20, fontWeight:600, color:'var(--parchment)', letterSpacing:'0.07em' }}>EncuentraTuDojo</span>
        </Link>

        <div style={{ background:'var(--parchment)', borderRadius:'var(--radius)', padding:'40px 32px', boxShadow:'0 24px 80px rgba(0,0,0,0.5)' }}>

          {status === 'loading' && (
            <>
              <div style={{ fontFamily:'var(--font-jp)', fontSize:48, color:'rgba(122,92,58,0.2)', marginBottom:16, animation:'pulse 1.5s infinite' }}>武</div>
              <div style={{ fontFamily:'var(--font-display)', fontSize:22, color:'var(--ink)', marginBottom:8 }}>Verificando tu cuenta...</div>
              <p style={{ fontSize:13, color:'var(--wood-light)' }}>Por favor esperá un momento.</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div style={{ fontSize:56, marginBottom:16 }}>✓</div>
              <div style={{ fontFamily:'var(--font-display)', fontSize:26, color:'var(--ink)', marginBottom:8 }}>¡Cuenta verificada!</div>
              <p style={{ fontSize:13, color:'var(--wood-light)', lineHeight:1.7, marginBottom:20 }}>
                Tu cuenta fue confirmada exitosamente. En un momento te redirigimos a tu panel.
              </p>
              <div style={{ fontSize:11, color:'var(--wood-light)' }}>Redirigiendo...</div>
            </>
          )}

          {status === 'error' && (
            <>
              <div style={{ fontSize:48, marginBottom:16 }}>⚠️</div>
              <div style={{ fontFamily:'var(--font-display)', fontSize:22, color:'var(--ink)', marginBottom:8 }}>Link inválido</div>
              <p style={{ fontSize:13, color:'var(--wood-light)', lineHeight:1.7, marginBottom:24 }}>{message}</p>
              <div style={{ display:'flex', gap:10, justifyContent:'center', flexWrap:'wrap' }}>
                <Link href="/auth" style={{ padding:'10px 20px', background:'var(--crimson)', color:'#fff', borderRadius:3, textDecoration:'none', fontSize:12, textTransform:'uppercase', letterSpacing:'0.1em' }}>
                  Volver al login
                </Link>
                <Link href="/" style={{ padding:'10px 20px', background:'var(--parchment-dark)', color:'var(--ink)', borderRadius:3, textDecoration:'none', fontSize:12, border:'1px solid rgba(122,92,58,0.2)' }}>
                  Ir al inicio
                </Link>
              </div>
            </>
          )}
        </div>
      </div>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:.3} 50%{opacity:.8} }
      `}</style>
    </div>
  )
}

export default function ConfirmPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight:'100vh', background:'var(--ink)', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <div style={{ fontFamily:'var(--font-jp)', fontSize:48, color:'rgba(200,169,110,0.2)' }}>武</div>
      </div>
    }>
      <ConfirmContent />
    </Suspense>
  )
}
