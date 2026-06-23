'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { createClient } from '@/lib/supabase/client'

const NAV_LINKS = [
  { label: 'Buscador',      href: '/buscador' },
  { label: 'Tablero',       href: '/tablero'  },
  { label: 'Comparar',      href: '/comparar' },
  { label: 'Para Escuelas', href: '/registro' },
]

type AuthInfo =
  | { status: 'loading' }
  | { status: 'guest' }
  | { status: 'alumno'; initials: string; avatarUrl: string | null; firstName: string }
  | { status: 'escuela'; kanji: string; slug: string; name: string }
  | { status: 'admin'; initials: string; firstName: string }

export default function NavBar({ activeLink, relative }: { activeLink?: string; relative?: boolean }) {
  const [open, setOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [menuPos, setMenuPos] = useState<{ top: number; right: number } | null>(null)
  const [auth, setAuth] = useState<AuthInfo>({ status: 'loading' })
  const btnRef = useRef<HTMLButtonElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()

  const isActive = (href: string) =>
    activeLink ? activeLink === href : pathname?.startsWith(href)

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  useEffect(() => {
    let active = true
    const sb = createClient()

    sb.auth.getUser().then(async ({ data: { user } }) => {
      if (!active) return
      if (!user) { setAuth({ status: 'guest' }); return }

      // Detectar admin por app_metadata o user_metadata
      const appType = user.app_metadata?.type
      const metaType = user.user_metadata?.type
      if (appType === 'admin' || metaType === 'admin') {
        const name = user.user_metadata?.first_name || user.email?.split('@')[0] || 'Admin'
        setAuth({ status: 'admin', initials: 'AD', firstName: name })
        return
      }

      const { data: profile } = await sb.from('users')
        .select('type, first_name, last_name, avatar_url')
        .eq('id', user.id).single()

      if (!active) return
      if (!profile) { setAuth({ status: 'guest' }); return }

      if (profile.type === 'escuela') {
        const { data: school } = await sb.from('schools')
          .select('slug, kanji, name')
          .eq('owner_id', user.id).single()
        if (!active) return
        setAuth({
          status: 'escuela',
          kanji: school?.kanji || '武',
          slug: school?.slug || '',
          name: school?.name || 'Mi escuela',
        })
      } else {
        const initials = `${profile.first_name?.[0] ?? ''}${profile.last_name?.[0] ?? ''}`.toUpperCase() || 'U'
        setAuth({
          status: 'alumno',
          initials,
          avatarUrl: profile.avatar_url ?? null,
          firstName: profile.first_name || 'Mi cuenta',
        })
      }
    })

    const { data: listener } = sb.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) setAuth({ status: 'guest' })
    })

    return () => { active = false; listener.subscription.unsubscribe() }
  }, [])

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      const t = e.target as Node
      if (btnRef.current?.contains(t)) return
      if (dropdownRef.current?.contains(t)) return
      setMenuOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [])

  useEffect(() => {
    if (!menuOpen) return
    function reposition() {
      if (!btnRef.current) return
      const r = btnRef.current.getBoundingClientRect()
      setMenuPos({ top: r.bottom + 8, right: window.innerWidth - r.right })
    }
    window.addEventListener('scroll', reposition, true)
    window.addEventListener('resize', reposition)
    return () => {
      window.removeEventListener('scroll', reposition, true)
      window.removeEventListener('resize', reposition)
    }
  }, [menuOpen])

  function toggleMenu() {
    if (!menuOpen && btnRef.current) {
      const r = btnRef.current.getBoundingClientRect()
      setMenuPos({ top: r.bottom + 8, right: window.innerWidth - r.right })
    }
    setMenuOpen(p => !p)
  }

  async function handleLogout() {
    const sb = createClient()
    await sb.auth.signOut()
    setMenuOpen(false)
    setOpen(false)
    setAuth({ status: 'guest' })
    window.location.href = '/'
  }

  const isLoggedIn = auth.status === 'alumno' || auth.status === 'escuela' || auth.status === 'admin'

  function DesktopAvatar() {
    if (auth.status !== 'alumno' && auth.status !== 'escuela' && auth.status !== 'admin') return null
    const isEscuela = auth.status === 'escuela'
    const isAdmin   = auth.status === 'admin'

    const avatarStyle: React.CSSProperties = {
      width: 36, height: 36,
      borderRadius: isEscuela ? 6 : '50%',
      background: isAdmin ? 'rgba(139,26,26,0.25)' : isEscuela ? 'rgba(200,169,110,0.12)' : 'var(--crimson)',
      border: isAdmin ? '1px solid rgba(139,26,26,0.5)' : '1px solid rgba(200,169,110,0.35)',
      color: isAdmin ? 'var(--crimson-bright, #d9534f)' : isEscuela ? 'var(--gold)' : '#fff',
      fontFamily: isEscuela ? 'var(--font-jp)' : 'var(--font-body)',
      fontSize: isEscuela ? 17 : 12,
      fontWeight: 600,
      cursor: 'pointer',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      overflow: 'hidden', flexShrink: 0,
    }

    return (
      <>
        <button ref={btnRef} onClick={toggleMenu} aria-label="Mi cuenta" aria-expanded={menuOpen} style={avatarStyle}>
          {auth.status === 'alumno'
            ? (auth.avatarUrl
                ? <img src={auth.avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : auth.initials)
            : auth.status === 'escuela'
            ? auth.kanji
            : 'A'}
        </button>

        {menuOpen && menuPos && typeof document !== 'undefined' && createPortal(
          <div ref={dropdownRef} style={{
            position: 'fixed', top: menuPos.top, right: menuPos.right, minWidth: 190,
            background: '#0d0b0b', border: '1px solid rgba(200,169,110,0.18)',
            borderRadius: 6, overflow: 'hidden', zIndex: 99999,
            boxShadow: '0 8px 28px rgba(0,0,0,0.45)',
          }}>
            {/* Nombre */}
            <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(200,169,110,0.1)', fontSize: 12, color: 'rgba(250,248,244,0.4)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {auth.status === 'admin' ? 'Administrador' : auth.status === 'alumno' ? auth.firstName : auth.name}
            </div>

            {/* Link principal */}
            {auth.status === 'admin' ? (
              <Link href="/admin" onClick={() => setMenuOpen(false)}
                style={{ display: 'block', padding: '11px 16px', fontSize: 13, color: 'rgba(250,248,244,0.85)', textDecoration: 'none' }}>
                Panel de administración
              </Link>
            ) : (
              <Link href={auth.status === 'alumno' ? '/panel' : '/dashboard'} onClick={() => setMenuOpen(false)}
                style={{ display: 'block', padding: '11px 16px', fontSize: 13, color: 'rgba(250,248,244,0.85)', textDecoration: 'none' }}>
                {auth.status === 'alumno' ? 'Mi panel' : 'Mi dashboard'}
              </Link>
            )}

            {/* Ver perfil público (solo escuela) */}
            {auth.status === 'escuela' && auth.slug && (
              <Link href={`/escuela/${auth.slug}`} onClick={() => setMenuOpen(false)}
                style={{ display: 'block', padding: '11px 16px', fontSize: 13, color: 'rgba(250,248,244,0.85)', textDecoration: 'none' }}>
                Ver perfil público
              </Link>
            )}

            <button onClick={handleLogout}
              style={{ display: 'block', width: '100%', textAlign: 'left', padding: '11px 16px', fontSize: 13, color: 'var(--crimson-bright, #d9534f)', background: 'none', border: 'none', borderTop: '1px solid rgba(200,169,110,0.1)', cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
              Cerrar sesión
            </button>
          </div>,
          document.body
        )}
      </>
    )
  }

  function MobileAuthBlock() {
    if (auth.status !== 'alumno' && auth.status !== 'escuela' && auth.status !== 'admin') {
      return (
        <Link href="/auth" onClick={() => setOpen(false)}
          style={{
            display: 'block', padding: '15px',
            textAlign: 'center', fontSize: '12px',
            fontWeight: 700, letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: '#0e0c0b', background: '#c8a96e',
            borderRadius: '3px', textDecoration: 'none',
          }}>
          Ingresar
        </Link>
      )
    }
    const isEscuela = auth.status === 'escuela'
    const isAdmin   = auth.status === 'admin'
    const displayName = isAdmin ? 'Administrador' : isEscuela ? (auth as any).name : (auth as any).firstName

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 4px 10px' }}>
          <div style={{
            width: 34, height: 34, flexShrink: 0,
            borderRadius: isEscuela ? 6 : '50%',
            background: isAdmin ? 'rgba(139,26,26,0.25)' : isEscuela ? 'rgba(200,169,110,0.12)' : 'var(--crimson)',
            border: isAdmin ? '1px solid rgba(139,26,26,0.5)' : '1px solid rgba(200,169,110,0.35)',
            color: isAdmin ? 'var(--crimson-bright, #d9534f)' : isEscuela ? 'var(--gold)' : '#fff',
            fontFamily: isEscuela ? 'var(--font-jp)' : 'var(--font-body)',
            fontSize: isEscuela ? 16 : 12, fontWeight: 600,
            display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
          }}>
            {isAdmin ? 'A' : isEscuela ? (auth as any).kanji : (auth as any).avatarUrl
              ? <img src={(auth as any).avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : (auth as any).initials}
          </div>
          <span style={{ fontSize: 13, color: 'rgba(250,248,244,0.75)' }}>{displayName}</span>
        </div>

        <Link
          href={isAdmin ? '/admin' : isEscuela ? '/dashboard' : '/panel'}
          onClick={() => setOpen(false)}
          style={{ display: 'block', padding: '13px', textAlign: 'center', fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#0e0c0b', background: '#c8a96e', borderRadius: 3, textDecoration: 'none' }}>
          {isAdmin ? 'Panel de administración' : isEscuela ? 'Mi dashboard' : 'Mi panel'}
        </Link>

        {isEscuela && (auth as any).slug && (
          <Link href={`/escuela/${(auth as any).slug}`} onClick={() => setOpen(false)}
            style={{ display: 'block', padding: '12px', textAlign: 'center', fontSize: 12, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(250,248,244,0.7)', background: 'none', border: '1px solid rgba(250,248,244,0.15)', borderRadius: 3, textDecoration: 'none' }}>
            Ver perfil público
          </Link>
        )}

        <button onClick={handleLogout}
          style={{ padding: '12px', textAlign: 'center', fontSize: 12, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(250,248,244,0.55)', background: 'none', border: '1px solid rgba(250,248,244,0.15)', borderRadius: 3, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
          Cerrar sesión
        </button>
      </div>
    )
  }

  return (
    <>
      <nav className="etd-nav" style={relative ? { position: 'relative', flexShrink: 0 } : undefined}>
        <Link href="/" className="etd-nav-logo" onClick={() => setOpen(false)}>
          <span className="etd-nav-kanji">武</span>
          <span className="etd-nav-name">EncuentraTuDojo</span>
        </Link>

        <div className="etd-nav-links etd-nav-desktop">
          {NAV_LINKS.map(({ label, href }) => (
            <Link key={href} href={href} className="etd-nav-link"
              style={isActive(href) ? { color: 'var(--gold)' } : undefined}>
              {label}
            </Link>
          ))}
          {isLoggedIn
            ? <DesktopAvatar />
            : <Link href="/auth" className="etd-nav-cta">Ingresar</Link>}
        </div>

        <button className="etd-nav-hamburger"
          onClick={() => setOpen(p => !p)}
          aria-label={open ? 'Cerrar menu' : 'Abrir menu'}
          aria-expanded={open}>
          <span className={`etd-ham-bar ${open ? 'etd-ham-open-1' : ''}`} />
          <span className={`etd-ham-bar ${open ? 'etd-ham-open-2' : ''}`} />
          <span className={`etd-ham-bar ${open ? 'etd-ham-open-3' : ''}`} />
        </button>
      </nav>

      {open && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, display: 'flex', flexDirection: 'column' }}>
          <div onClick={e => e.stopPropagation()} style={{ position: 'relative', background: '#0d0b0b', paddingTop: 'var(--nav-h)', borderBottom: '1px solid rgba(200,169,110,0.15)' }}>
            <button onClick={() => setOpen(false)} aria-label="Cerrar menú"
              style={{ position: 'absolute', top: 0, right: 0, width: 'var(--nav-h)', height: 'var(--nav-h)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'rgba(250,248,244,0.85)', fontSize: 24, lineHeight: 1 }}>
              ✕
            </button>
            {NAV_LINKS.map(({ label, href }) => (
              <Link key={href} href={href} onClick={() => setOpen(false)}
                style={{ display: 'block', padding: '18px 24px', fontSize: '13px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: isActive(href) ? '#c8a96e' : 'rgba(250,248,244,0.85)', borderBottom: '1px solid rgba(200,169,110,0.07)', textDecoration: 'none' }}>
                {label}
              </Link>
            ))}
            <div style={{ padding: '16px 24px 24px' }}>
              <MobileAuthBlock />
            </div>
          </div>
          <div onClick={() => setOpen(false)} style={{ flex: 1, background: 'rgba(0,0,0,0.65)' }} />
        </div>
      )}
    </>
  )
}
