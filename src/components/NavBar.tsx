'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

interface NavBarProps {
  activeLink?: string
}

const NAV_LINKS = [
  { label: 'Buscador',      href: '/buscador'  },
  { label: 'Tablero',       href: '/tablero'   },
  { label: 'Comparar',      href: '/comparar'  },
  { label: 'Para Escuelas', href: '/registro'  },
]

export default function NavBar({ activeLink }: NavBarProps) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  const isActive = (href: string) =>
    activeLink ? activeLink === href : pathname?.startsWith(href)

  return (
    <>
      <nav className="etd-nav">
        {/* Logo */}
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

        {/* Botón hamburguesa (solo mobile) */}
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

      {/* Overlay mobile */}
      {open && (
        <div
          className="etd-mobile-overlay"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Menú mobile */}
      <div className={`etd-mobile-menu ${open ? 'etd-mobile-menu-open' : ''}`}>
        <div className="etd-mobile-menu-inner">
          {NAV_LINKS.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              className="etd-mobile-link"
              onClick={() => setOpen(false)}
              style={isActive(href) ? { color: 'var(--gold)' } : undefined}
            >
              {label}
            </Link>
          ))}
          <Link
            href="/auth"
            className="etd-mobile-cta"
            onClick={() => setOpen(false)}
          >
            Ingresar
          </Link>
        </div>
      </div>
    </>
  )
}
