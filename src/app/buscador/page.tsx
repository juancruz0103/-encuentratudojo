'use client'

import { useEffect, useState, useCallback, useRef, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import type { School, Discipline } from '@/types/database'
import Link from 'next/link'
import NavBar from '@/components/NavBar'

const DISC_COLORS: Record<string, string> = {
  taekwondo: '#c0392b', karate: '#8b1a1a', judo: '#4a3728',
  'kung-fu': '#b5451b', aikido: '#1a5276', hapkido: '#1e8449',
  pakua: '#6c3483', kenjutsu: '#2c3e50',
}

// Subcats por disciplina (igual que el HTML original)
const SUBCATS_BY_DISC: Record<string, string[]> = {
  taekwondo: ['Infantil','Juvenil','Adultos','Poomsae','Kyorugi','Hoshinsul','Defensa personal'],
  karate:    ['Infantil','Juvenil','Adultos','Kihon','Kata','Kumite','Bunkai','Defensa personal'],
  judo:      ['Infantil','Juvenil','Adultos','Randori','Ne-waza','Tachi-waza','Defensa personal','Preparación física'],
  'kung-fu': ['Infantil','Juvenil','Adultos','Shaolin','Wing Chun','Formas tradicionales','Armas','Tai Chi','Chi Kung','Defensa personal'],
  aikido:    ['Infantil','Juvenil','Adultos','Defensa personal','Caídas/Ukemi','Bokken','Jo'],
  hapkido:   ['Infantil','Juvenil','Adultos','Defensa personal','Luxaciones','Proyecciones','Combate/Sparring'],
  pakua:     ['Infantil','Juvenil','Adultos','Tai Chi','Armas tradicionales','Meditación','Chi Kung','Defensa personal'],
  kenjutsu:  ['Juvenil','Adultos','Kenjutsu básico','Kenjutsu avanzado','Iaijutsu','Katana tradicional','Historia samurái'],
}

// Filtros generales
const FILTROS_GENERALES = [
  { id:'gen-adultos',   label:'Clases para adultos',  fn: (s: School) => s.subcats?.some(sc => sc.name?.toLowerCase().includes('adulto')) ?? false },
  { id:'gen-infantil',  label:'Clases infantiles',     fn: (s: School) => s.subcats?.some(sc => sc.name?.toLowerCase().includes('infantil')) ?? false },
  { id:'gen-defensa',   label:'Defensa personal',      fn: (s: School) => s.subcats?.some(sc => sc.name?.toLowerCase().includes('defensa')) ?? false },
  { id:'gen-verificada',label:'Verificada',             fn: (s: School) => s.verified === true },
]

function BuscadorInner() {
  const [schools, setSchools]     = useState<School[]>([])
  const [disciplines, setDiscs]   = useState<Discipline[]>([])
  const [filtered, setFiltered]   = useState<School[]>([])
  const [query, setQuery]         = useState('')
  const [selDisc, setSelDisc]     = useState<string | null>(null)
  const [selSubcats, setSelSubcats] = useState<Set<string>>(new Set())
  const [selGeneral, setSelGeneral] = useState<Set<string>>(new Set())
  const [loading, setLoading]     = useState(true)
  const [selected, setSelected]   = useState<School | null>(null)
  const [showPanel, setShowPanel] = useState(false)
  const [isMobile, setIsMobile]   = useState(false)
  const [mounted, setMounted]     = useState(false)
  const searchParams = useSearchParams()
  const mapRef       = useRef<HTMLDivElement>(null)
  const mapInst      = useRef<any>(null)
  const markers      = useRef<any[]>([])
  const schoolsRef   = useRef<School[]>([])
  const leafletReady = useRef(false)

  useEffect(() => { schoolsRef.current = schools }, [schools])

  // ── Cargar datos ──
  useEffect(() => {
    const url  = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    const h    = { 'apikey': anon, 'Authorization': `Bearer ${anon}` }
    Promise.all([
      fetch(`${url}/rest/v1/schools?select=*,discipline:disciplines(*),subcats:school_subcats(name,sort_order)&status=eq.active&order=premium.desc,rating.desc`, { headers: h }).then(r => r.json()),
      fetch(`${url}/rest/v1/disciplines?select=*&order=sort_order`, { headers: h }).then(r => r.json()),
    ]).then(([sc, di]) => {
      const s = Array.isArray(sc) ? sc : []
      const d = Array.isArray(di) ? di : []
      setSchools(s); setFiltered(s); setDiscs(d); setLoading(false)
      if (leafletReady.current && mapInst.current) addMarkers(s, mapInst.current)
      // Leer disciplina desde URL al cargar
      const discParam = searchParams.get('disciplina')
      if (discParam) setSelDisc(discParam)
    }).catch(() => setLoading(false))
  }, [])

  // ── Mapa ──
  // Detectar mobile
  useEffect(() => {
    setMounted(true)
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => {
    if (!mapRef.current || mapInst.current) return
    const link = document.createElement('link')
    link.rel = 'stylesheet'; link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
    document.head.appendChild(link)
    const script = document.createElement('script')
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
    script.onload = () => { leafletReady.current = true; initMap() }
    document.head.appendChild(script)
  }, [])

  function initMap() {
    if (!mapRef.current || !(window as any).L) return
    const L = (window as any).L
    const map = L.map(mapRef.current, { center:[-34.61,-58.44], zoom:11, zoomControl:false, scrollWheelZoom:true })
    L.control.zoom({ position:'bottomright' }).addTo(map)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { attribution:'© CARTO © OSM', subdomains:'abcd', maxZoom:19 }).addTo(map)
    mapInst.current = map
    if (schoolsRef.current.length > 0) addMarkers(schoolsRef.current, map)
  }

  function addMarkers(list: School[], map?: any) {
    const L = (window as any).L
    const m = map || mapInst.current
    if (!L || !m) return
    markers.current.forEach(mk => m.removeLayer(mk))
    markers.current = []
    list.forEach(school => {
      if (!school.lat || !school.lng) return
      const color = DISC_COLORS[school.discipline_id] ?? '#8b1a1a'
      const icon = L.divIcon({
        html: `<svg width="32" height="40" viewBox="0 0 36 44" xmlns="http://www.w3.org/2000/svg">
          <path d="M18 0C8.06 0 0 8.06 0 18c0 12.56 16.2 24.08 16.91 24.57a1.8 1.8 0 002.18 0C19.8 42.08 36 30.56 36 18 36 8.06 27.94 0 18 0z" fill="${color}"/>
          <circle cx="18" cy="18" r="13" fill="rgba(0,0,0,0.2)"/>
          <text x="18" y="24" text-anchor="middle" fill="white" font-family="serif" font-size="13" font-weight="600">${school.kanji}</text>
        </svg>`,
        className:'', iconSize:[32,40], iconAnchor:[16,40], popupAnchor:[0,-40],
      })
      const marker = L.marker([school.lat, school.lng], { icon })
        .bindPopup(`
          <div style="padding:10px 14px;background:#0e0c0b;min-width:200px">
            <div style="font-size:9px;text-transform:uppercase;letter-spacing:.12em;color:${color};margin-bottom:4px">${school.discipline?.label ?? ''}</div>
            <div style="font-family:serif;font-size:15px;font-weight:600;color:#faf8f4;margin-bottom:2px">${school.name}</div>
            <div style="font-size:11px;color:rgba(250,248,244,0.4);margin-bottom:8px">${school.neighborhood}, ${school.city}</div>
            <div style="font-size:12px;color:#c8a96e;margin-bottom:10px">★ ${school.rating} <span style="color:rgba(250,248,244,0.3)">(${school.review_count})</span></div>
            <a href="/escuela/${school.slug}" style="display:block;text-align:center;background:#8b1a1a;color:#fff;font-size:10px;text-transform:uppercase;letter-spacing:.1em;padding:7px 14px;border-radius:3px;text-decoration:none">Ver perfil</a>
          </div>
        `, { className:'etd-map-popup' })
        .addTo(m)
      marker.on('click', () => setSelected(school))
      markers.current.push(marker)
    })
  }

  // ── Filtrar ──
  const applyFilters = useCallback((
    q: string, disc: string | null,
    subcats: Set<string>, general: Set<string>,
    list: School[]
  ) => {
    const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'')
    let result = list
    if (disc)     result = result.filter(s => s.discipline_id === disc)
    if (q)        result = result.filter(s => [s.name, s.neighborhood, s.city, s.discipline?.label ?? ''].some(f => norm(f).includes(norm(q))))
    if (subcats.size > 0) result = result.filter(s => [...subcats].some(sub => s.subcats?.some(sc => sc.name === sub)))
    if (general.size > 0) result = result.filter(s => [...general].every(gid => FILTROS_GENERALES.find(f => f.id === gid)?.fn(s)))
    setFiltered(result)
    if (mapInst.current) addMarkers(result)
  }, [])

  useEffect(() => {
    applyFilters(query, selDisc, selSubcats, selGeneral, schools)
  }, [query, selDisc, selSubcats, selGeneral, schools])

  function toggleSubcat(name: string) {
    setSelSubcats(prev => {
      const next = new Set(prev)
      next.has(name) ? next.delete(name) : next.add(name)
      return next
    })
  }
  function toggleGeneral(id: string) {
    setSelGeneral(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }
  function clearAll() {
    setSelDisc(null); setSelSubcats(new Set()); setSelGeneral(new Set()); setQuery('')
  }
  function flyTo(school: School) {
    if (!mapInst.current || !school.lat || !school.lng) return
    mapInst.current.flyTo([school.lat, school.lng], 15, { duration: 0.8 })
    setSelected(school)
  }

  const hasFilters = selDisc || selSubcats.size > 0 || selGeneral.size > 0 || query
  const currentSubcats = selDisc ? (SUBCATS_BY_DISC[selDisc] ?? []) : []
  const discColor = selDisc ? (DISC_COLORS[selDisc] ?? '#8b1a1a') : null

  return (
    <main style={{ height:'100vh', display:'flex', flexDirection:'column', overflow:'hidden' }}>

      {/* NAV */}
<NavBar activeLink="/buscador" relative />

      <div style={{ flex:1, display:'grid', gridTemplateColumns: (mounted && isMobile) ? '1fr' : '340px 1fr', overflow:'hidden', position:'relative' }}>

        {/* SIDEBAR — desktop siempre visible, mobile solo cuando showPanel=true */}
        {(!mounted || !isMobile || showPanel) && (
        <div style={{
          background:'var(--parchment)',
          borderRight:'1px solid rgba(122,92,58,0.1)',
          display:'flex', flexDirection:'column', overflow:'hidden',
          ...(mounted && isMobile ? {
            position:'fixed', top:0, left:0, right:0, bottom:0,
            zIndex: 500,
          } : {})
        }}>

          {/* Botón cerrar — solo mobile */}
          {mounted && isMobile && (
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 16px', background:'var(--ink)', flexShrink:0 }}>
              <span style={{ fontSize:12, fontWeight:600, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--parchment)' }}>☰ Filtros y lista</span>
              <button
                onClick={() => setShowPanel(false)}
                style={{ background:'none', border:'1px solid rgba(200,169,110,0.3)', borderRadius:20, color:'var(--parchment)', fontSize:12, padding:'6px 14px', cursor:'pointer', fontFamily:'var(--font-body)', fontWeight:600, letterSpacing:'0.08em' }}>
                ✕ Cerrar
              </button>
            </div>
          )}

          {/* Buscador */}
          <div style={{ padding:'14px 16px', borderBottom:'1px solid rgba(122,92,58,0.1)', flexShrink:0 }}>
            <div style={{ fontSize:15, fontFamily:'var(--font-display)', fontWeight:400, color:'var(--ink)', marginBottom:10 }}>Buscador</div>
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Nombre, ciudad, barrio..."
              style={{ width:'100%', border:'1px solid rgba(122,92,58,0.2)', borderRadius:3, padding:'8px 12px', fontSize:13, fontFamily:'var(--font-body)', outline:'none', background:'#fff', color:'var(--ink)', boxSizing:'border-box' }} />
            <div style={{ marginTop:8, fontSize:10, color:'var(--wood-light)', textTransform:'uppercase', letterSpacing:'0.06em', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <span>{loading ? 'Cargando...' : `${filtered.length} escuela${filtered.length !== 1 ? 's' : ''}`}</span>
              {hasFilters && (
                <button onClick={clearAll} style={{ fontSize:10, color:'var(--crimson)', background:'none', border:'none', cursor:'pointer', fontFamily:'var(--font-body)' }}>✕ Limpiar todo</button>
              )}
            </div>
          </div>

          {/* Filtro disciplinas */}
          <div style={{ padding:'10px 16px', borderBottom:'1px solid rgba(122,92,58,0.08)', flexShrink:0 }}>
            <div style={{ fontSize:9, textTransform:'uppercase', letterSpacing:'0.15em', color:'var(--wood-light)', marginBottom:7 }}>Disciplina</div>
            <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
              {disciplines.map(d => (
                <button key={d.id}
                  onClick={() => { setSelDisc(selDisc === d.id ? null : d.id); setSelSubcats(new Set()) }}
                  style={{ display:'flex', alignItems:'center', gap:5, padding:'4px 10px', fontSize:11, borderRadius:3, cursor:'pointer', fontFamily:'var(--font-body)', fontWeight:500, border:'none', transition:'all 0.15s',
                    background: selDisc === d.id ? d.color : 'transparent',
                    color: selDisc === d.id ? '#fff' : 'var(--ink-soft)',
                    outline: selDisc === d.id ? 'none' : `1px solid rgba(122,92,58,0.2)` }}>
                  <span style={{ fontFamily:'var(--font-jp)', fontSize:13, lineHeight:1 }}>{d.kanji}</span>
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* Subcats de la disciplina seleccionada */}
          {selDisc && currentSubcats.length > 0 && (
            <div style={{ padding:'10px 16px', borderBottom:'1px solid rgba(122,92,58,0.08)', flexShrink:0, background:'rgba(122,92,58,0.04)' }}>
              <div style={{ fontSize:9, textTransform:'uppercase', letterSpacing:'0.15em', color: discColor ?? 'var(--wood-light)', marginBottom:7, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <span>{disciplines.find(d => d.id === selDisc)?.label} — especialidades</span>
                {selSubcats.size > 0 && (
                  <button onClick={() => setSelSubcats(new Set())} style={{ fontSize:9, color:'var(--crimson)', background:'none', border:'none', cursor:'pointer', fontFamily:'var(--font-body)' }}>✕ limpiar</button>
                )}
              </div>
              <div style={{ display:'flex', flexWrap:'wrap', gap:5 }}>
                {currentSubcats.map(sub => (
                  <button key={sub} onClick={() => toggleSubcat(sub)}
                    style={{ padding:'3px 9px', fontSize:11, borderRadius:3, cursor:'pointer', fontFamily:'var(--font-body)', transition:'all 0.15s', border:'none',
                      background: selSubcats.has(sub) ? (discColor ?? 'var(--crimson)') : 'rgba(122,92,58,0.1)',
                      color: selSubcats.has(sub) ? '#fff' : 'var(--ink-soft)' }}>
                    {sub}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Filtros generales */}
          <div style={{ padding:'10px 16px', borderBottom:'1px solid rgba(122,92,58,0.08)', flexShrink:0 }}>
            <div style={{ fontSize:9, textTransform:'uppercase', letterSpacing:'0.15em', color:'var(--wood-light)', marginBottom:7 }}>Filtros generales</div>
            <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
              {FILTROS_GENERALES.map(f => (
                <button key={f.id} onClick={() => toggleGeneral(f.id)}
                  style={{ padding:'4px 10px', fontSize:11, borderRadius:3, cursor:'pointer', fontFamily:'var(--font-body)', transition:'all 0.15s',
                    background: selGeneral.has(f.id) ? 'var(--ink)' : 'transparent',
                    color: selGeneral.has(f.id) ? 'var(--gold)' : 'var(--ink-soft)',
                    border: `1px solid ${selGeneral.has(f.id) ? 'var(--ink)' : 'rgba(122,92,58,0.2)'}` }}>
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Lista escuelas */}
          <div style={{ flex:1, overflowY:'auto' }}>
            {loading ? (
              <div style={{ padding:32, textAlign:'center', color:'var(--wood-light)', fontSize:13 }}>
                <div style={{ fontFamily:'var(--font-jp)', fontSize:36, marginBottom:12, opacity:.3 }}>武</div>
                Cargando escuelas...
              </div>
            ) : filtered.length === 0 ? (
              <div style={{ padding:'40px 20px', textAlign:'center' }}>
                <div style={{ fontFamily:'var(--font-jp)', fontSize:48, color:'rgba(122,92,58,0.15)', marginBottom:12 }}>無</div>
                <div style={{ fontSize:14, color:'var(--wood-light)', marginBottom:8 }}>Sin resultados</div>
                <button onClick={clearAll} style={{ fontSize:12, color:'var(--crimson)', background:'none', border:'1px solid rgba(139,26,26,0.2)', padding:'6px 14px', borderRadius:3, cursor:'pointer', fontFamily:'var(--font-body)' }}>
                  Limpiar filtros
                </button>
              </div>
            ) : filtered.map((school, i) => {
              const color = DISC_COLORS[school.discipline_id] ?? '#8b1a1a'
              const isSel = selected?.id === school.id
              return (
                <div key={school.id} onClick={() => flyTo(school)}
                  style={{ padding:'12px 16px', borderBottom:'1px solid rgba(122,92,58,0.06)', cursor:'pointer', transition:'background 0.15s',
                    background: isSel ? 'rgba(139,26,26,0.05)' : 'transparent',
                    borderLeft: isSel ? `3px solid ${color}` : '3px solid transparent' }}>
                  <div style={{ display:'flex', alignItems:'flex-start', gap:10 }}>
                    <div style={{ width:32, height:32, borderRadius:4, background:`${color}22`, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'var(--font-jp)', fontSize:16, color, flexShrink:0 }}>
                      {school.kanji}
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:9, textTransform:'uppercase', letterSpacing:'0.1em', color, marginBottom:2 }}>{school.discipline?.label}</div>
                      <div style={{ fontSize:14, fontWeight:500, color:'var(--ink)', marginBottom:2, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{school.name}</div>
                      <div style={{ fontSize:11, color:'var(--wood-light)', marginBottom:4 }}>{school.neighborhood}, {school.city}</div>
                      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                        <span style={{ fontSize:11, color:'var(--gold)' }}>★ {school.rating} <span style={{ color:'var(--wood-light)' }}>({school.review_count})</span></span>
                        <Link href={`/escuela/${school.slug}`} onClick={e => e.stopPropagation()}
                          style={{ fontSize:9, textTransform:'uppercase', letterSpacing:'0.1em', color:'var(--crimson)', border:'1px solid rgba(139,26,26,0.2)', padding:'3px 8px', borderRadius:2, textDecoration:'none' }}>
                          Ver perfil
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
        )} {/* fin sidebar condicional */}

        {/* MAPA */}
        <div style={{ position:'relative', height:'100%', width:'100%' }}>
          <div ref={mapRef} style={{ height:'100%', width:'100%', background:'#0e0c0b' }} />

          {/* Botón mobile: Filtros y lista */}
          {mounted && isMobile && !showPanel && (
            <button
              onClick={() => setShowPanel(true)}
              style={{
                position:'absolute', bottom:80, left:'50%',
                transform:'translateX(-50%)',
                zIndex:400,
                background:'var(--ink)',
                color:'var(--parchment)',
                border:'1px solid rgba(200,169,110,0.3)',
                borderRadius:24,
                padding:'14px 28px',
                fontSize:13,
                fontWeight:600,
                letterSpacing:'0.1em',
                textTransform:'uppercase',
                cursor:'pointer',
                boxShadow:'0 4px 20px rgba(0,0,0,0.6)',
                display:'flex',
                alignItems:'center',
                gap:8,
                whiteSpace:'nowrap',
              }}>
              ☰ Filtros y lista
            </button>
          )}
        </div>
      </div>

      <style>{`
        .etd-map-popup .leaflet-popup-content-wrapper { background:#0e0c0b; border:1px solid rgba(200,169,110,0.2); border-radius:6px; padding:0; box-shadow:0 12px 40px rgba(0,0,0,0.5); }
        .etd-map-popup .leaflet-popup-content { margin:0; }
        .etd-map-popup .leaflet-popup-tip { background:#0e0c0b; }
        .leaflet-container { font-family:'DM Sans',sans-serif; }
      `}</style>
    </main>
  )
}

export default function BuscadorPage() {
  return (
    <Suspense fallback={
      <main style={{ height:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--parchment)' }}>
        <div style={{ textAlign:'center', color:'var(--wood-light)' }}>
          <div style={{ fontFamily:'var(--font-jp)', fontSize:48, marginBottom:12, opacity:.3 }}>武</div>
          <div style={{ fontSize:13 }}>Cargando buscador...</div>
        </div>
      </main>
    }>
      <BuscadorInner />
    </Suspense>
  )
}
