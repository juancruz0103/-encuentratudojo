'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'

const NAV_LINKS = [
  { label: 'Buscador',      href: '/buscador' },
  { label: 'Tablero',       href: '/tablero'  },
  { label: 'Comparar',      href: '/comparar' },
  { label: 'Para Escuelas', href: '/registro' },
]

interface NavBarProps {
  activeLink?: string
  relative?: boolean
}

export default function NavBar({ activeLink, relative }: NavBarProps) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  // Bloquear scroll del body cuando el menú está abierto
  useEffect(() => {
    if (!mounted) return
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open, mounted])

  const isActive = (href: string) =>
    activeLink ? activeLink === href : pathname?.startsWith(href)

  return (
    <>
      <nav
        className="etd-nav"
        style={relative ? { position: 'relative', flexShrink: 0 } : undefined}
      >
        <Link href="/" className="etd-nav-logo" onClick={() => setOpen(false)}>
          <span className="etd-nav-kanji">武</span>
          <span className="etd-nav-name">EncuentraTuDojo</span>
        </Link>

        {/* Links desktop */}
        <div className="etd-nav-links etd-nav-desktop">
          {NAV_LINKS.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              className="etd-nav-link"
              style={isActive(href) ? { color: 'var(--gold)' } : undefined}
            >
              {label}
            </Link>
          ))}
          <Link href="/auth" className="etd-nav-cta">Ingresar</Link>
        </div>

        {/* Botón hamburguesa */}
        <button
          className="etd-nav-hamburger"
          onClick={() => setOpen(prev => !prev)}
          aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={open}
        >
          <span className={`etd-ham-bar ${open ? 'etd-ham-open-1' : ''}`} />
          <span className={`etd-ham-bar ${open ? 'etd-ham-open-2' : ''}`} />
          <span className={`etd-ham-bar ${open ? 'etd-ham-open-3' : ''}`} />
        </button>
      </nav>

      {/* Overlay y menú — solo después de mount para evitar SSR issues */}
      {mounted && (
        <>
          {/* Overlay oscuro */}
          <div
            onClick={() => setOpen(false)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              background: 'rgba(0,0,0,0.6)',
              zIndex: 9998,
              opacity: open ? 1 : 0,
              pointerEvents: open ? 'auto' : 'none',
              transition: 'opacity 0.3s ease',
            }}
          />

          {/* Menú mobile */}
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              zIndex: 9999,
              background: '#0d0b0b',
              paddingTop: 'var(--nav-h)',
              transform: open ? 'translateY(0)' : 'translateY(-100%)',
              transition: 'transform 0.32s cubic-bezier(0.4,0,0.2,1)',
              borderBottom: '1px solid rgba(200,169,110,0.2)',
              boxShadow: open ? '0 8px 32px rgba(0,0,0,0.6)' : 'none',
            }}
          >
            {NAV_LINKS.map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                style={{
                  display: 'block',
                  padding: '18px 28px',
                  fontSize: '14px',
                  fontWeight: 600,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: isActive(href) ? '#c8a96e' : '#f5f3ef',
                  borderBottom: '1px solid rgba(200,169,110,0.08)',
                  textDecoration: 'none',
                  fontFamily: 'var(--font-body)',
                }}
              >
                {label}
              </Link>
            ))}
            <div style={{ padding: '20px 28px 28px' }}>
              <Link
                href="/auth"
                onClick={() => setOpen(false)}
                style={{
                  display: 'block',
                  padding: '16px',
                  textAlign: 'center',
                  fontSize: '13px',
                  fontWeight: 600,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: '#1a0f0f',
                  background: '#c8a96e',
                  borderRadius: '4px',
                  textDecoration: 'none',
                  fontFamily: 'var(--font-body)',
                }}
              >
                Ingresar
              </Link>
            </div>
          </div>
        </>
      )}
    </>
  )
}
