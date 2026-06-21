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

  // Bloquear scroll del body cuando el menú está abierto
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  // Detectar sesión y tipo de usuario (alumno / escuela)
  useEffect(() => {
    let active = true
    const sb = createClient()

    sb.auth.getUser().then(async ({ data: { user } }) => {
      if (!active) return
      if (!user) { setAuth({ status: 'guest' }); return }

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

    // Mantener sincronizado si se loguea/desloguea en otra pestaña o acción
    const { data: listener } = sb.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) setAuth({ status: 'guest' })
    })

    return () => { active = false; listener.subscription.unsubscribe() }
  }, [])

  // Cerrar el dropdown del avatar al hacer click afuera (botón o el dropdown en portal)
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

  // Recalcular posición del dropdown si se hace scroll/resize mientras está abierto
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

  const isLoggedIn = auth.status === 'alumno' || auth.status === 'escuela'

  // ── Avatar (círculo alumno / cuadrado escuela) — versión desktop con dropdown ──
  function DesktopAvatar() {
    if (auth.status !== 'alumno' && auth.status !== 'escuela') return null
    const isEscuela = auth.status === 'escuela'
    return (
      <>
        <button ref={btnRef} onClick={toggleMenu} aria-label="Mi cuenta" aria-expanded={menuOpen}
          style={{
            width: 36, height: 36,
            borderRadius: isEscuela ? 6 : '50%',
            background: isEscuela ? 'rgba(200,169,110,0.12)' : 'var(--crimson)',
            border: '1px solid rgba(200,169,110,0.35)',
            color: isEscuela ? 'var(--gold)' : '#fff',
            fontFamily: isEscuela ? 'var(--font-jp)' : 'var(--font-body)',
            fontSize: isEscuela ? 17 : 13,
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            overflow: 'hidden', flexShrink: 0,
          }}>
          {auth.status === 'alumno'
            ? (auth.avatarUrl
                ? <img src={auth.avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : auth.initials)
            : auth.kanji}
        </button>

        {/* Portal directo a <body>: así el dropdown nunca queda atrapado detrás
            de elementos con z-index propio (mapas, modales, etc.) en páginas
            donde el nav usa position:relative en vez de fixed. */}
        {menuOpen && menuPos && typeof document !== 'undefined' && createPortal(
          <div ref={dropdownRef} style={{
            position: 'fixed', top: menuPos.top, right: menuPos.right, minWidth: 190,
            background: '#0d0b0b', border: '1px solid rgba(200,169,110,0.18)',
            borderRadius: 6, overflow: 'hidden', zIndex: 99999,
            boxShadow: '0 8px 28px rgba(0,0,0,0.45)',
          }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(200,169,110,0.1)', fontSize: 12, color: 'rgba(250,248,244,0.4)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {auth.status === 'alumno' ? auth.firstName : auth.name}
            </div>
            <Link href={auth.status === 'alumno' ? '/panel' : '/dashboard'} onClick={() => setMenuOpen(false)}
              style={{ display: 'block', padding: '11px 16px', fontSize: 13, color: 'rgba(250,248,244,0.85)', textDecoration: 'none' }}>
              {auth.status === 'alumno' ? 'Mi panel' : 'Mi dashboard'}
            </Link>
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

  // ── Bloque equivalente para el menú mobile ──
  function MobileAuthBlock() {
    if (auth.status !== 'alumno' && auth.status !== 'escuela') {
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
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 4px 10px' }}>
          <div style={{
            width: 34, height: 34, flexShrink: 0,
            borderRadius: isEscuela ? 6 : '50%',
            background: isEscuela ? 'rgba(200,169,110,0.12)' : 'var(--crimson)',
            border: '1px solid rgba(200,169,110,0.35)',
            color: isEscuela ? 'var(--gold)' : '#fff',
            fontFamily: isEscuela ? 'var(--font-jp)' : 'var(--font-body)',
            fontSize: isEscuela ? 16 : 13, fontWeight: 600,
            display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
          }}>
            {auth.status === 'alumno'
              ? (auth.avatarUrl ? <img src={auth.avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : auth.initials)
              : auth.kanji}
          </div>
          <span style={{ fontSize: 13, color: 'rgba(250,248,244,0.75)' }}>
            {auth.status === 'alumno' ? auth.firstName : auth.name}
          </span>
        </div>
        <Link href={auth.status === 'alumno' ? '/panel' : '/dashboard'} onClick={() => setOpen(false)}
          style={{ display: 'block', padding: '13px', textAlign: 'center', fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#0e0c0b', background: '#c8a96e', borderRadius: 3, textDecoration: 'none' }}>
          {auth.status === 'alumno' ? 'Mi panel' : 'Mi dashboard'}
        </Link>
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

        {/* Links desktop */}
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

        {/* Botón hamburguesa */}
        <button className="etd-nav-hamburger"
          onClick={() => setOpen(p => !p)}
          aria-label={open ? 'Cerrar menu' : 'Abrir menu'}
          aria-expanded={open}>
          <span className={`etd-ham-bar ${open ? 'etd-ham-open-1' : ''}`} />
          <span className={`etd-ham-bar ${open ? 'etd-ham-open-2' : ''}`} />
          <span className={`etd-ham-bar ${open ? 'etd-ham-open-3' : ''}`} />
        </button>
      </nav>

      {/* Menú mobile — solo en DOM cuando está abierto, evita cualquier overflow */}
      {open && (
        <div
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Panel oscuro del menú */}
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: '#0d0b0b',
              paddingTop: 'var(--nav-h)',
              borderBottom: '1px solid rgba(200,169,110,0.15)',
            }}
          >
            {NAV_LINKS.map(({ label, href }) => (
              <Link key={href} href={href}
                onClick={() => setOpen(false)}
                style={{
                  display: 'block',
                  padding: '18px 24px',
                  fontSize: '13px',
                  fontWeight: 600,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: isActive(href) ? '#c8a96e' : 'rgba(250,248,244,0.85)',
                  borderBottom: '1px solid rgba(200,169,110,0.07)',
                  textDecoration: 'none',
                }}>
                {label}
              </Link>
            ))}
            <div style={{ padding: '16px 24px 24px' }}>
              <MobileAuthBlock />
            </div>
          </div>

          {/* Overlay semitransparente — tap para cerrar */}
          <div
            onClick={() => setOpen(false)}
            style={{ flex: 1, background: 'rgba(0,0,0,0.65)' }}
          />
        </div>
      )}
    </>
  )
}
