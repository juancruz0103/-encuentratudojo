import { getPublicAnnouncements, getTopSchools } from '@/lib/supabase/public'
import Link from 'next/link'
import TableroClient from './client'

export default async function TableroPage() {
  const [ann, sc] = await Promise.all([
    getPublicAnnouncements(),
    getTopSchools(5),
  ])

  return (
    <main style={{ background: 'var(--ink)', minHeight: '100vh' }}>

      {/* NAV */}
      <nav className="etd-nav">
        <Link href="/" className="etd-nav-logo">
          <span className="etd-nav-kanji">武</span>
          <span className="etd-nav-name">EncuentraTuDojo</span>
        </Link>
        <div className="etd-nav-links">
          <Link href="/buscador" className="etd-nav-link">Buscador</Link>
          <Link href="/tablero"  className="etd-nav-link" style={{ color: 'var(--gold)' }}>Tablero</Link>
          <Link href="/auth"     className="etd-nav-cta">Ingresar</Link>
        </div>
      </nav>

      {/* HERO */}
      <div style={{ paddingTop: 'var(--nav-h)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position:'absolute', inset:0, backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 59px,rgba(200,169,110,0.03) 59px,rgba(200,169,110,0.03) 60px),repeating-linear-gradient(90deg,transparent,transparent 59px,rgba(200,169,110,0.03) 59px,rgba(200,169,110,0.03) 60px)', pointerEvents:'none' }} />
        <div style={{ position:'absolute', right:0, top:'50%', transform:'translateY(-50%) translateX(40%)', maxWidth:'100%', fontFamily:'var(--font-jp)', fontSize:300, color:'rgba(200,169,110,0.03)', lineHeight:1, pointerEvents:'none', userSelect:'none' }}>武道</div>
        <div style={{ maxWidth:1400, margin:'0 auto', padding:'60px 64px 48px', position:'relative', zIndex:1 }}>
          <div className="etd-eyebrow"><div className="etd-eyebrow-line" /><span className="etd-eyebrow-text">Comunidad de artes marciales</span></div>
          <h1 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(36px,5vw,64px)', fontWeight:300, color:'var(--parchment)', lineHeight:0.95, letterSpacing:'-0.02em', marginBottom:16 }}>
            Tablero <em style={{ fontStyle:'italic', color:'var(--crimson-bright)' }}>comunitario</em>
          </h1>
          <p style={{ fontSize:15, fontWeight:300, color:'rgba(250,248,244,0.4)', lineHeight:1.7, maxWidth:560, marginBottom:32 }}>
            Torneos, eventos, promociones y novedades de las escuelas de artes marciales de Argentina.
          </p>
          <div style={{ display:'flex', gap:40, paddingTop:24, borderTop:'1px solid rgba(200,169,110,0.08)' }}>
            {[{ n: ann.length, l:'Anuncios activos' }, { n: sc.length, l:'Escuelas' }, { n:'4.821', l:'Usuarios' }].map(s => (
              <div key={s.l}>
                <div style={{ fontFamily:'var(--font-display)', fontSize:28, fontWeight:600, color:'var(--parchment)', lineHeight:1 }}>{s.n}</div>
                <div style={{ fontSize:10, color:'rgba(250,248,244,0.35)', letterSpacing:'0.12em', textTransform:'uppercase', marginTop:3 }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Parte interactiva — Client Component */}
      <TableroClient announcements={ann} topSchools={sc} />

      {/* FOOTER */}
      <footer className="etd-footer">
        <div className="etd-footer-inner">
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <span className="etd-nav-kanji">武</span>
            <span style={{ fontFamily:'var(--font-display)', color:'rgba(250,248,244,0.4)', fontSize:16 }}>EncuentraTuDojo</span>
          </div>
          <p style={{ fontSize:11, color:'rgba(250,248,244,0.15)' }}>© 2025 EncuentraTuDojo</p>
        </div>
      </footer>
    </main>
  )
}
