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

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

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
          <Link href="/auth" className="etd-nav-cta">Ingresar</Link>
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
        <div onClick={() => setOpen(false)}
          style={{ position:'fixed', top:0, left:0, width:'100%', height:'100%',
            zIndex:9999, display:'flex', flexDirection:'column' }}>
          <div onClick={e => e.stopPropagation()}
            style={{ background:'#0d0b0b', paddingTop:'var(--nav-h)',
              borderBottom:'1px solid rgba(200,169,110,0.15)', flexShrink:0 }}>
            {NAV_LINKS.map(({ label, href }) => (
              <Link key={href} href={href} onClick={() => setOpen(false)}
                style={{ display:'block', padding:'18px 24px', fontSize:'13px',
                  fontWeight:600, letterSpacing:'0.1em', textTransform:'uppercase',
                  color: isActive(href) ? '#c8a96e' : 'rgba(250,248,244,0.85)',
                  borderBottom:'1px solid rgba(200,169,110,0.07)', textDecoration:'none' }}>
                {label}
              </Link>
            ))}
            <div style={{ padding:'16px 24px 24px' }}>
              <Link href="/auth" onClick={() => setOpen(false)}
                style={{ display:'block', padding:'15px', textAlign:'center',
                  fontSize:'12px', fontWeight:700, letterSpacing:'0.12em',
                  textTransform:'uppercase', color:'#0e0c0b', background:'#c8a96e',
                  borderRadius:'3px', textDecoration:'none' }}>
                Ingresar
              </Link>
            </div>
          </div>
          <div style={{ flex:1, background:'rgba(0,0,0,0.65)' }} />
        </div>
      )}
    </>
  )
}
