'use client'

import { useState } from 'react'
import Link from 'next/link'

const TIPO_META: Record<string, { kanji:string; label:string; color:string }> = {
  torneo:  { kanji:'武', label:'Torneo',         color:'#8b4a8b' },
  evento:  { kanji:'祭', label:'Evento',          color:'#2e86c1' },
  promo:   { kanji:'春', label:'Promoción',       color:'#c0392b' },
  clase:   { kanji:'道', label:'Clase especial',  color:'#d4720a' },
  novedad: { kanji:'新', label:'Novedad',          color:'#27ae60' },
  otro:    { kanji:'他', label:'Otro',             color:'#c8a96e' },
}

const FILTROS = [
  { id:'todos',   label:'Todos' },
  { id:'torneo',  label:'Torneos' },
  { id:'evento',  label:'Eventos' },
  { id:'promo',   label:'Promociones' },
  { id:'clase',   label:'Clases especiales' },
  { id:'novedad', label:'Novedades' },
]

export default function TableroClient({
  announcements, topSchools
}: {
  announcements: any[]; topSchools: any[]
}) {
  const [filtro, setFiltro]   = useState('todos')
  const [search, setSearch]   = useState('')

  const filtered = announcements.filter(a => {
    const matchFiltro = filtro === 'todos' || a.type === filtro
    const matchSearch = !search || a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.school?.name?.toLowerCase().includes(search.toLowerCase())
    return matchFiltro && matchSearch
  })

  const prem = filtered.filter(a => a.school?.premium)
  const std  = filtered.filter(a => !a.school?.premium)

  return (
    <div style={{ maxWidth:1400, margin:'0 auto', padding:'0 clamp(16px, 4vw, 64px) 80px', overflowX:'hidden' }}>

      {/* BARRA FILTROS — tabs arriba, buscador abajo */}
      <div className='etd-tablero-filtros' style={{ position:'sticky', top:'var(--nav-h)', zIndex:100, background:'rgba(14,12,11,0.97)', backdropFilter:'blur(8px)', borderBottom:'1px solid rgba(200,169,110,0.08)', marginLeft:'clamp(-16px,-4vw,-64px)', marginRight:'clamp(-16px,-4vw,-64px)', padding:'0 clamp(16px,4vw,64px)' }}>
        {/* Fila 1: filtros */}
        <div style={{ display:'flex', overflow:'auto', borderBottom:'1px solid rgba(200,169,110,0.06)' }}>
          {FILTROS.map(f => (
            <button key={f.id} onClick={() => setFiltro(f.id)}
              style={{ padding:'13px 18px', fontSize:12, fontWeight:500, letterSpacing:'0.08em', textTransform:'uppercase', background:'transparent', border:'none', cursor:'pointer', fontFamily:'var(--font-body)', whiteSpace:'nowrap', transition:'all 0.2s',
                color: filtro === f.id ? 'var(--gold)' : 'rgba(250,248,244,0.35)',
                borderBottom: filtro === f.id ? '2px solid var(--gold)' : '2px solid transparent' }}>
              {f.label}
            </button>
          ))}
        </div>
        {/* Fila 2: buscador */}
        <div style={{ padding:'10px 0' }}>
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Buscar anuncio o escuela..."
            style={{ width:'100%', maxWidth:360, padding:'8px 14px', fontSize:13, background:'rgba(250,248,244,0.06)', border:'1px solid rgba(200,169,110,0.15)', borderRadius:3, color:'var(--parchment)', fontFamily:'var(--font-body)', outline:'none' }}
          />
        </div>
      </div>

      {/* LAYOUT */}
      <div className='etd-tablero-layout' style={{ display:'grid', gridTemplateColumns:'min(100%, 1fr) 300px', gap:32, alignItems:'start', paddingTop:32 }}>

        {/* FEED */}
        <div>
          {filtered.length === 0 ? (
            <div style={{ textAlign:'center', padding:'80px 20px' }}>
              <div style={{ fontFamily:'var(--font-jp)', fontSize:56, color:'rgba(200,169,110,0.1)', marginBottom:14 }}>無</div>
              <div style={{ fontFamily:'var(--font-display)', fontSize:22, color:'rgba(250,248,244,0.3)', marginBottom:8 }}>Sin anuncios</div>
              <div style={{ fontSize:13, color:'rgba(250,248,244,0.2)' }}>
                {search ? `No hay resultados para "${search}"` : 'No hay anuncios en esta categoría.'}
              </div>
            </div>
          ) : (
            <>
              {/* Destacados */}
              {prem.length > 0 && (
                <div style={{ marginBottom:28 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:14 }}>
                    <span style={{ fontSize:9, color:'rgba(200,169,110,0.5)', letterSpacing:'0.2em', textTransform:'uppercase' }}>⭐ Escuelas destacadas</span>
                    <div style={{ flex:1, height:1, background:'rgba(200,169,110,0.1)' }} />
                    <span style={{ fontSize:10, color:'rgba(200,169,110,0.3)' }}>{prem.length}</span>
                  </div>
                  <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                    {prem.map(a => <AnuncioCard key={a.id} ann={a} premium />)}
                  </div>
                </div>
              )}

              {/* Estándar */}
              <div>
                <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:14 }}>
                  <span style={{ fontSize:9, color:'rgba(200,169,110,0.5)', letterSpacing:'0.2em', textTransform:'uppercase' }}>
                    {prem.length > 0 ? 'Más anuncios' : 'Todos los anuncios'}
                  </span>
                  <div style={{ flex:1, height:1, background:'rgba(200,169,110,0.1)' }} />
                  <span style={{ fontSize:10, color:'rgba(200,169,110,0.3)' }}>{std.length}</span>
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                  {std.map(a => <AnuncioCard key={a.id} ann={a} />)}
                </div>
              </div>
            </>
          )}
        </div>

        {/* SIDEBAR */}
        <div className='etd-tablero-sidebar' style={{ position:'sticky', top:'calc(var(--nav-h) + 56px)' }}>

          {/* Escuelas activas */}
          <div style={{ background:'rgba(250,248,244,0.03)', border:'1px solid rgba(200,169,110,0.08)', borderRadius:'var(--radius)', overflow:'hidden', marginBottom:16 }}>
            <div style={{ padding:'12px 18px', borderBottom:'1px solid rgba(200,169,110,0.07)' }}>
              <span style={{ fontSize:11, fontWeight:500, letterSpacing:'0.1em', textTransform:'uppercase', color:'rgba(200,169,110,0.6)' }}>Escuelas más activas</span>
            </div>
            {topSchools.map((s: any, i: number) => (
              <Link key={s.id} href={`/escuela/${s.slug}`}
                style={{ display:'flex', alignItems:'center', gap:12, padding:'11px 18px', borderBottom:'1px solid rgba(200,169,110,0.05)', textDecoration:'none', transition:'background 0.15s' }}>
                <span style={{ fontFamily:'var(--font-display)', fontSize:18, fontWeight:600, color: i < 3 ? 'var(--gold)' : 'rgba(200,169,110,0.2)', width:20, textAlign:'center' }}>{i+1}</span>
                <div style={{ width:34, height:34, borderRadius:3, background:'rgba(200,169,110,0.07)', border:'1px solid rgba(200,169,110,0.1)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'var(--font-jp)', fontSize:15, color:'rgba(200,169,110,0.5)' }}>{s.kanji}</div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:13, fontWeight:500, color:'var(--parchment)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{s.name}</div>
                  <div style={{ fontSize:10, color:'rgba(250,248,244,0.3)' }}>{s.discipline?.label}</div>
                </div>
              </Link>
            ))}
          </div>

          {/* CTA registrar escuela */}
          <div style={{ background:'linear-gradient(135deg,#1a0e0e,#0e0c0b)', border:'1px solid rgba(200,169,110,0.2)', borderRadius:'var(--radius)', padding:'20px 18px', textAlign:'center' }}>
            <div style={{ fontFamily:'var(--font-display)', fontSize:20, fontWeight:400, color:'var(--parchment)', marginBottom:6 }}>¿Tenés una escuela?</div>
            <div style={{ fontSize:12, color:'rgba(250,248,244,0.4)', lineHeight:1.6, marginBottom:16 }}>Publicá tus torneos y eventos para toda la comunidad de artes marciales.</div>
            <Link href="/registro" style={{ display:'block', background:'var(--gold)', color:'var(--ink)', fontSize:11, fontWeight:500, letterSpacing:'0.1em', textTransform:'uppercase', padding:11, borderRadius:3, textDecoration:'none' }}>
              Registrar mi escuela →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

function AnuncioCard({ ann, premium }: { ann: any; premium?: boolean }) {
  const t = TIPO_META[ann.type] ?? TIPO_META.otro
  const school = ann.school

  if (premium) {
    return (
      <div style={{ background:'linear-gradient(135deg,#1a0e0e,#0e0c0b)', border:'1px solid rgba(200,169,110,0.25)', borderRadius:'var(--radius)', overflow:'hidden', position:'relative' }}>
        <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:'linear-gradient(90deg,transparent,var(--gold),var(--gold-bright),var(--gold),transparent)' }} />
        <div className='etd-anuncio-premium-grid' style={{ display:'grid', gridTemplateColumns:'min(160px, 35%) 1fr' }}>
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'24px 16px', borderRight:'1px solid rgba(200,169,110,0.1)', background:'rgba(200,169,110,0.04)', gap:8 }}>
            <div style={{ width:44, height:44, borderRadius:4, background:'rgba(200,169,110,0.1)', border:'1px solid rgba(200,169,110,0.2)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'var(--font-jp)', fontSize:20, color:'var(--gold)' }}>{school?.kanji}</div>
            <div style={{ fontSize:12, fontWeight:500, color:'rgba(250,248,244,0.6)', textAlign:'center', lineHeight:1.3 }}>{school?.name}</div>
            <div style={{ fontSize:9, fontWeight:600, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--ink)', background:'var(--gold)', padding:'3px 8px', borderRadius:2 }}>⭐ Destacada</div>
          </div>
          <div style={{ padding:'22px 26px' }}>
            <div style={{ display:'inline-flex', alignItems:'center', gap:6, fontSize:10, fontWeight:500, letterSpacing:'0.12em', textTransform:'uppercase', color:t.color, border:`1px solid ${t.color}33`, padding:'4px 10px', borderRadius:2, marginBottom:10 }}>
              <span style={{ fontFamily:'var(--font-jp)', fontSize:12 }}>{t.kanji}</span> {t.label}
            </div>
            <div style={{ fontFamily:'var(--font-display)', fontSize:22, fontWeight:400, color:'var(--parchment)', marginBottom:8, lineHeight:1.2 }}>{ann.title}</div>
            <div style={{ fontSize:13, fontWeight:300, color:'rgba(250,248,244,0.5)', lineHeight:1.6, marginBottom:14 }}>{ann.description?.slice(0,160)}{ann.description?.length > 160 ? '…' : ''}</div>
            <div style={{ display:'flex', gap:14, flexWrap:'wrap', marginBottom:14 }}>
              {ann.date_start && <span style={{ fontSize:12, color:'rgba(250,248,244,0.4)', display:'flex', alignItems:'center', gap:4 }}>📅 {ann.date_start}</span>}
              {ann.location   && <span style={{ fontSize:12, color:'rgba(250,248,244,0.4)', display:'flex', alignItems:'center', gap:4 }}>📍 {ann.location}</span>}
              {ann.time_info  && <span style={{ fontSize:12, color:'rgba(250,248,244,0.4)', display:'flex', alignItems:'center', gap:4 }}>🕐 {ann.time_info}</span>}
              {ann.enrollment && <span style={{ fontSize:12, color:'rgba(250,248,244,0.4)', display:'flex', alignItems:'center', gap:4 }}>🎫 {ann.enrollment}</span>}
            </div>
            <Link href={`/escuela/${school?.slug}`}
              style={{ display:'inline-flex', alignItems:'center', gap:6, fontSize:11, fontWeight:500, letterSpacing:'0.08em', textTransform:'uppercase', color:'var(--ink)', background:'var(--gold)', padding:'8px 18px', borderRadius:3, textDecoration:'none' }}>
              Ver escuela →
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='etd-anuncio-std-grid' style={{ background:'rgba(250,248,244,0.03)', border:'1px solid rgba(200,169,110,0.08)', borderRadius:'var(--radius)', display:'grid', gridTemplateColumns:'min(90px, 25%) 1fr', overflow:'hidden', transition:'border-color 0.2s' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', padding:'16px 12px', borderRight:'1px solid rgba(200,169,110,0.07)', background:'rgba(14,12,11,0.4)' }}>
        <div style={{ width:40, height:40, borderRadius:4, background:'rgba(200,169,110,0.08)', border:`1px solid ${t.color}44`, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'var(--font-jp)', fontSize:18, color:t.color }}>
          {school?.kanji || t.kanji}
        </div>
      </div>
      <div style={{ padding:'14px 18px' }}>
        <div style={{ display:'inline-flex', alignItems:'center', gap:5, fontSize:9, fontWeight:500, letterSpacing:'0.1em', textTransform:'uppercase', color:`${t.color}99`, border:`1px solid ${t.color}33`, padding:'3px 8px', borderRadius:2, marginBottom:6 }}>
          <span style={{ fontFamily:'var(--font-jp)', fontSize:11 }}>{t.kanji}</span>{t.label}
        </div>
        <div style={{ fontSize:15, fontWeight:500, color:'var(--parchment)', marginBottom:4, lineHeight:1.3 }}>{ann.title}</div>
        <div style={{ fontSize:12, fontWeight:300, color:'rgba(250,248,244,0.4)', lineHeight:1.5, marginBottom:8 }}>{ann.description?.slice(0,100)}{ann.description?.length > 100 ? '…' : ''}</div>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:8 }}>
          <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
            {ann.date_start && <span style={{ fontSize:11, color:'rgba(250,248,244,0.3)' }}>📅 {ann.date_start}</span>}
            {ann.school?.name && <span style={{ fontSize:11, color:'rgba(250,248,244,0.3)' }}>🏫 {ann.school.name}</span>}
          </div>
          <Link href={`/escuela/${ann.school?.slug}`}
            style={{ fontSize:10, textTransform:'uppercase', letterSpacing:'0.1em', color:'var(--gold)', border:'1px solid rgba(200,169,110,0.2)', padding:'5px 12px', borderRadius:2, textDecoration:'none' }}>
            Ver más →
          </Link>
        </div>
      </div>
    </div>
  )
}
