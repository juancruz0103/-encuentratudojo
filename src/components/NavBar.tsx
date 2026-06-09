'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

const NAV_LINKS = [
  { label: 'Buscador',      href: '/buscador' },
  { label: 'Tablero',       href: '/tablero'  },
  { label: 'Comparar',      href: '/comparar' },
  { label: 'Para Escuelas', href: '/registro' },
]

interface NavBarProps {
  activeLink?: string
  /** Usar position:relative en vez de fixed (buscador usa layout flex-column) */
  relative?: boolean
}

export default function NavBar({ activeLink, relative }: NavBarProps) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  const isActive = (href: string) =>
    activeLink ? activeLink === href : pathname?.startsWith(href)

  return (
    <>
      {/* NAV */}
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

      {/* Overlay — solo si está abierto */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 9998,
          }}
        />
      )}

      {/* Menú mobile — siempre en el DOM, controlado por transform */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 9999,
          background: '#0a0808',
          paddingTop: 'var(--nav-h)',
          transform: open ? 'translateY(0)' : 'translateY(-100%)',
          transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1)',
          borderBottom: '1px solid rgba(200,169,110,0.15)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {NAV_LINKS.map(({ label, href }) => (
          <Link
            key={href}
            href={href}
            onClick={() => setOpen(false)}
            style={{
              display: 'block',
              padding: '16px 24px',
              fontSize: '13px',
              fontWeight: 500,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: isActive(href) ? 'var(--gold)' : 'rgba(250,248,244,0.8)',
              borderBottom: '1px solid rgba(200,169,110,0.06)',
              textDecoration: 'none',
            }}
          >
            {label}
          </Link>
        ))}
        <Link
          href="/auth"
          onClick={() => setOpen(false)}
          style={{
            display: 'block',
            margin: '16px 24px',
            padding: '14px',
            textAlign: 'center',
            fontSize: '12px',
            fontWeight: 500,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'var(--ink)',
            background: 'var(--gold)',
            borderRadius: '3px',
            textDecoration: 'none',
          }}
        >
          Ingresar
        </Link>
      </div>
    </>
  )
}
