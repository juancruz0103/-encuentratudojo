'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function NavBar({ currentPath = '' }: { currentPath?: string }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <nav className="etd-nav">
        <Link href="/" className="etd-nav-logo" onClick={() => setOpen(false)}>
          <span className="etd-nav-kanji">武</span>
          <span className="etd-nav-name">EncuentraTuDojo</span>
        </Link>

        {/* Links desktop */}
        <div className={`etd-nav-links${open ? ' open' : ''}`}>
          <Link href="/buscador" className="etd-nav-link" onClick={() => setOpen(false)}>Buscador</Link>
          <Link href="/tablero"  className="etd-nav-link" onClick={() => setOpen(false)}>Tablero</Link>
          <Link href="/registro" className="etd-nav-link" onClick={() => setOpen(false)}>Registrar escuela</Link>
          <Link href="/auth"     className="etd-nav-cta"  onClick={() => setOpen(false)}>Ingresar</Link>
        </div>

        {/* Hamburguesa — solo mobile */}
        <button
          className="etd-nav-hamburger"
          onClick={() => setOpen(!open)}
          aria-label="Menú"
          style={{ display: 'none' }}
          // Se muestra via CSS en mobile
        >
          {open ? '✕' : '☰'}
        </button>
      </nav>

      {/* Overlay para cerrar */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.3)' }}
        />
      )}
    </>
  )
}
