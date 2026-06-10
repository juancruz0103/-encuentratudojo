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

export default function NavBar({ activeLink, relative }: { activeLink?: string; relative?: boolean }) {
  const [open, setOpen] = useState(false)
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
          <Link href="/auth" className="etd-nav-cta">Ingresar</Link>
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
