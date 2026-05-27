import Link from 'next/link'

export default function NotFound() {
  return (
    <main style={{ minHeight:'100vh', background:'var(--ink)', display:'flex', alignItems:'center', justifyContent:'center', padding:20, position:'relative', overflow:'hidden' }}>

      {/* Grid de fondo */}
      <div style={{ position:'absolute', inset:0, backgroundImage:'repeating-linear-gradient(0deg,transparent,transparent 59px,rgba(200,169,110,0.03) 59px,rgba(200,169,110,0.03) 60px),repeating-linear-gradient(90deg,transparent,transparent 59px,rgba(200,169,110,0.03) 59px,rgba(200,169,110,0.03) 60px)', pointerEvents:'none' }} />
      <div style={{ position:'absolute', left:0, top:0, bottom:0, width:3, background:'linear-gradient(to bottom,transparent,var(--crimson) 20%,var(--crimson-bright) 80%,transparent)', pointerEvents:'none' }} />

      <div style={{ position:'relative', zIndex:1, textAlign:'center', maxWidth:500 }}>

        {/* Logo */}
        <Link href="/" style={{ display:'inline-flex', alignItems:'center', gap:10, marginBottom:48, textDecoration:'none' }}>
          <span style={{ fontFamily:'var(--font-jp)', fontSize:22, color:'var(--crimson-bright)' }}>武</span>
          <span style={{ fontFamily:'var(--font-display)', fontSize:18, fontWeight:600, color:'var(--parchment)', letterSpacing:'0.07em' }}>EncuentraTuDojo</span>
        </Link>

        {/* Kanji 404 */}
        <div style={{ fontFamily:'var(--font-jp)', fontSize:'clamp(80px,20vw,140px)', lineHeight:1, color:'rgba(200,169,110,0.12)', marginBottom:8, userSelect:'none' }}>
          無
        </div>

        <div style={{ fontFamily:'var(--font-display)', fontSize:'clamp(28px,6vw,42px)', fontWeight:300, color:'var(--parchment)', lineHeight:1.1, marginBottom:12 }}>
          Página no encontrada
        </div>

        <p style={{ fontSize:15, fontWeight:300, color:'rgba(250,248,244,0.4)', lineHeight:1.7, marginBottom:36 }}>
          El camino que buscás no existe o fue movido. Volvé al inicio o buscá tu escuela de artes marciales.
        </p>

        <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
          <Link href="/" style={{ display:'inline-flex', alignItems:'center', gap:8, background:'var(--crimson)', color:'#fff', padding:'12px 24px', borderRadius:3, textDecoration:'none', fontSize:13, fontWeight:500, textTransform:'uppercase', letterSpacing:'0.1em' }}>
            ← Volver al inicio
          </Link>
          <Link href="/buscador" style={{ display:'inline-flex', alignItems:'center', gap:8, background:'rgba(200,169,110,0.1)', color:'var(--gold)', border:'1px solid rgba(200,169,110,0.2)', padding:'12px 24px', borderRadius:3, textDecoration:'none', fontSize:13, fontWeight:500, textTransform:'uppercase', letterSpacing:'0.1em' }}>
            Buscar escuelas
          </Link>
        </div>

      </div>
    </main>
  )
}
