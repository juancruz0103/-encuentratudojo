import Link from 'next/link'
import NavBar from '@/components/NavBar'
import { getPublicSchools, getPublicDisciplines } from '@/lib/supabase/public'

export default async function HomePage() {
  const [schools, disciplines] = await Promise.all([
    getPublicSchools(),
    getPublicDisciplines(),
  ])

  const sc   = schools ?? []
  const disc = disciplines ?? []
  const prem = sc.filter((s: any) => s.premium).slice(0, 6)

  return (
    <main>
      {/* NAV */}
      <NavBar />

      {/* HERO */}
      <section className="etd-hero">
        <div className="etd-hero-grid" />
        <div className="etd-hero-kanji-bg">武道</div>
        <div className="etd-hero-accent" />
        <div className="etd-hero-inner" style={{ paddingTop: '120px', paddingBottom: '80px' }}>
          <div className="etd-eyebrow">
            <div className="etd-eyebrow-line" />
            <span className="etd-eyebrow-text">El camino comienza acá</span>
          </div>
          <h1 className="etd-hero-title" style={{ marginBottom: '28px' }}>
            Encontrá<br /><em>tu dojo</em>
          </h1>
          <p className="etd-hero-desc">
            El directorio más completo de escuelas de artes marciales en Argentina.{' '}
            <strong style={{ color: 'rgba(250,248,244,0.7)' }}>{sc.length} academias</strong> verificadas en{' '}
            <strong style={{ color: 'rgba(250,248,244,0.7)' }}>{disc.length} disciplinas</strong>.
          </p>

          {/* Buscador rápido */}
          <form action="/buscador" method="get" style={{ display: 'flex', gap: '10px', marginBottom: '32px', maxWidth: '520px' }}>
            <input name="q" placeholder="Karate en Palermo, Judo en Flores..."
              style={{ flex: 1, background: 'rgba(250,248,244,0.07)', border: '1px solid rgba(200,169,110,0.2)', borderRadius: '3px', padding: '14px 18px', fontSize: '14px', color: 'var(--parchment)', fontFamily: 'var(--font-body)', outline: 'none' }} />
            <button type="submit" className="etd-btn-primary" style={{ whiteSpace: 'nowrap' }}>Buscar →</button>
          </form>

          {/* Tags disciplinas */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '48px' }}>
            {disc.map((d: any) => (
              <Link key={d.id} href={`/buscador?disciplina=${d.id}`}
                style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(250,248,244,0.45)', border: '1px solid rgba(200,169,110,0.15)', padding: '5px 12px', borderRadius: '12px', transition: 'all 0.2s' }}>
                {d.label}
              </Link>
            ))}
          </div>

          <div className="etd-hero-stats">
            <div><div className="etd-hero-stat-num">{sc.length}</div><div className="etd-hero-stat-lbl">Escuelas activas</div></div>
            <div><div className="etd-hero-stat-num">{disc.length}</div><div className="etd-hero-stat-lbl">Disciplinas</div></div>
            <div><div className="etd-hero-stat-num">{sc.filter((s: any) => s.verified).length}</div><div className="etd-hero-stat-lbl">Verificadas</div></div>
            <div><div className="etd-hero-stat-num">4.821</div><div className="etd-hero-stat-lbl">Usuarios</div></div>
          </div>
        </div>
      </section>

      {/* DISCIPLINAS */}
      <div className="etd-disc-strip">
        <div className="etd-disc-strip-inner">
          {disc.map((d: any) => {
            const count = sc.filter((s: any) => s.discipline_id === d.id).length
            return (
              <Link key={d.id} href={`/buscador?disciplina=${d.id}`} className="etd-disc-item">
                <span className="etd-disc-kanji" style={{ color: d.color }}>{d.kanji}</span>
                <span className="etd-disc-label">{d.label}</span>
                <span className="etd-disc-count">{count} escuelas</span>
              </Link>
            )
          })}
        </div>
      </div>

      {/* ESCUELAS DESTACADAS */}
      <section className="etd-section">
        <div className="etd-section-header">
          <div>
            <div className="etd-section-eyebrow">Academias verificadas</div>
            <h2 className="etd-section-title">Escuelas <em>destacadas</em></h2>
          </div>
          <Link href="/buscador" className="etd-section-link">Ver todas ({sc.length}) →</Link>
        </div>
        <div className="etd-cards-grid">
          {prem.map((school: any, i: number) => (
            <Link key={school.id} href={`/escuela/${school.slug}`} className="etd-school-card etd-fade-up" style={{ animationDelay: `${i * 80}ms` }}>
              <div className="etd-card-cover" style={{ background: `linear-gradient(135deg, ${school.discipline?.color ?? '#8b1a1a'}33, #1a0e0e)` }}>
                <span className="etd-card-kanji">{school.kanji}</span>
                {school.premium && <span className="etd-card-badge-premium">Premium</span>}
              </div>
              <div className="etd-card-body">
                <div className="etd-card-disc" style={{ color: school.discipline?.color }}>{school.discipline?.kanji} {school.discipline?.label}</div>
                <div className="etd-card-name">{school.name}</div>
                <div className="etd-card-location">{school.neighborhood}, {school.city}</div>
                <div className="etd-card-footer">
                  <div className="etd-card-rating">★ {school.rating} <span>({school.review_count})</span></div>
                  <div className="etd-card-btn">Ver perfil</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA TABLERO */}
      <section style={{ background: 'var(--ink)', padding: 'clamp(40px,8vw,80px) 0', overflow: 'hidden' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 clamp(20px,5vw,64px)' }}>
          <div className="etd-tablero-cta-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'clamp(28px,5vw,60px)', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--gold)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '12px' }}>Comunidad marcial</div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(26px,5vw,40px)', fontWeight: 300, color: 'var(--parchment)', lineHeight: 1.1, marginBottom: '16px' }}>
                Tablero <em style={{ fontStyle: 'italic', color: 'var(--crimson-bright)' }}>comunitario</em>
              </h2>
              <p style={{ fontSize: 'clamp(14px,2vw,16px)', fontWeight: 300, color: 'rgba(250,248,244,0.45)', lineHeight: 1.7, marginBottom: '24px' }}>
                Torneos, eventos, clases especiales y novedades de todas las escuelas de Argentina.
              </p>
              <Link href="/tablero" className="etd-btn-primary">Ver tablero →</Link>
            </div>
            <div className="etd-tablero-cta-icons" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {[{ icon: '武', label: 'Torneos' }, { icon: '祭', label: 'Eventos' }, { icon: '春', label: 'Promociones' }, { icon: '道', label: 'Clases especiales' }].map(item => (
                <div key={item.label} style={{ background: 'rgba(250,248,244,0.04)', border: '1px solid rgba(200,169,110,0.1)', borderRadius: '6px', padding: 'clamp(14px,3vw,24px)', textAlign: 'center' }}>
                  <div style={{ fontFamily: 'var(--font-jp)', fontSize: 'clamp(26px,4vw,36px)', color: 'rgba(200,169,110,0.4)', marginBottom: '8px' }}>{item.icon}</div>
                  <div style={{ fontSize: 'clamp(10px,1.5vw,12px)', color: 'rgba(250,248,244,0.4)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CÓMO FUNCIONA */}
      <section style={{ background:'var(--parchment)', padding:'clamp(48px,8vw,80px) 0' }}>
        <div style={{ maxWidth:1400, margin:'0 auto', padding:'0 clamp(20px,5vw,64px)' }}>
          <div style={{ textAlign:'center', marginBottom:48 }}>
            <div className="etd-eyebrow" style={{ justifyContent:'center', marginBottom:12 }}>
              <div className="etd-eyebrow-line" /><span className="etd-eyebrow-text">Simple y sin compromiso</span><div className="etd-eyebrow-line" />
            </div>
            <h2 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(28px,5vw,42px)', fontWeight:300, color:'var(--ink)', lineHeight:1.1 }}>
              ¿Cómo <em style={{ fontStyle:'italic', color:'var(--crimson)' }}>funciona</em>?
            </h2>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))', gap:32 }}>
            {[
              { num:'01', kanji:'捜', title:'Buscá tu disciplina', desc:'Usá el buscador o el mapa interactivo para encontrar escuelas de karate, judo, taekwondo y más cerca de vos.' },
              { num:'02', kanji:'比', title:'Comparé opciones', desc:'Mirá los perfiles completos con horarios, instructores y reseñas. Comparé dos escuelas lado a lado para tomar la mejor decisión.' },
              { num:'03', kanji:'試', title:'Reservá una clase trial', desc:'Pedí tu clase trial directamente desde la plataforma. Sin pago previo, sin compromiso. La escuela te contacta en menos de 24hs.' },
              { num:'04', kanji:'道', title:'Empezá tu camino', desc:'Encontraste tu dojo. Ahora solo queda comenzar el entrenamiento y dar el primer paso en las artes marciales.' },
            ].map((s, i) => (
              <div key={i} style={{ position:'relative' }}>
                <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:16 }}>
                  <div style={{ fontFamily:'var(--font-display)', fontSize:13, fontWeight:600, color:'var(--crimson)', letterSpacing:'0.1em', opacity:0.5 }}>{s.num}</div>
                  <div style={{ height:1, flex:1, background:'rgba(139,26,26,0.1)' }} />
                  <div style={{ fontFamily:'var(--font-jp)', fontSize:28, color:'rgba(139,26,26,0.15)' }}>{s.kanji}</div>
                </div>
                <h3 style={{ fontFamily:'var(--font-display)', fontSize:20, fontWeight:400, color:'var(--ink)', marginBottom:10, lineHeight:1.2 }}>{s.title}</h3>
                <p style={{ fontSize:14, color:'var(--ink-soft)', lineHeight:1.75 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIOS */}
      <section style={{ background:'var(--ink)', padding:'clamp(48px,8vw,80px) 0', overflow:'hidden', position:'relative' }}>
        <div style={{ position:'absolute', right:0, top:'50%', transform:'translateY(-50%) translateX(30%)', fontFamily:'var(--font-jp)', fontSize:'clamp(180px,25vw,320px)', color:'rgba(200,169,110,0.04)', lineHeight:1, pointerEvents:'none' }}>信</div>
        <div style={{ maxWidth:1400, margin:'0 auto', padding:'0 clamp(20px,5vw,64px)', position:'relative', zIndex:1 }}>
          <div style={{ textAlign:'center', marginBottom:40 }}>
            <div className="etd-eyebrow" style={{ justifyContent:'center', marginBottom:12 }}>
              <div className="etd-eyebrow-line" /><span className="etd-eyebrow-text">Lo que dicen nuestros usuarios</span><div className="etd-eyebrow-line" />
            </div>
            <h2 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(26px,4vw,38px)', fontWeight:300, color:'var(--parchment)' }}>
              La comunidad <em style={{ fontStyle:'italic', color:'var(--gold)' }}>habla</em>
            </h2>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))', gap:20 }}>
            {[
              { texto:'"Encontré mi dojo en menos de 10 minutos. Reservé la clase trial y ahora llevo 8 meses entrenando Aikido."', autor:'Valentina R.', ciudad:'Caballito, Buenos Aires' },
              { texto:'"Como dueño de una escuela de Karate, en el primer mes ya teníamos 6 consultas nuevas que llegaron por la plataforma."', autor:'Sensei Pablo M.', ciudad:'Bushido Karate Dojo, San Telmo' },
              { texto:'"El comparador me ayudó a decidir entre dos escuelas de Taekwondo. Muy útil ver todo lado a lado."', autor:'Matías G.', ciudad:'Palermo, Buenos Aires' },
            ].map((t, i) => (
              <div key={i} style={{ background:'rgba(250,248,244,0.04)', border:'1px solid rgba(200,169,110,0.1)', borderRadius:'var(--radius)', padding:'24px 28px' }}>
                <div style={{ fontFamily:'var(--font-jp)', fontSize:32, color:'rgba(200,169,110,0.2)', marginBottom:12, lineHeight:1 }}>"</div>
                <p style={{ fontSize:14, color:'rgba(250,248,244,0.6)', lineHeight:1.8, marginBottom:20, fontStyle:'italic' }}>{t.texto}</p>
                <div style={{ borderTop:'1px solid rgba(200,169,110,0.1)', paddingTop:14 }}>
                  <div style={{ fontSize:13, fontWeight:500, color:'var(--parchment)' }}>{t.autor}</div>
                  <div style={{ fontSize:11, color:'rgba(250,248,244,0.35)', marginTop:2 }}>{t.ciudad}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section style={{ background:'var(--crimson)', padding:'clamp(40px,6vw,64px) 0' }}>
        <div style={{ maxWidth:700, margin:'0 auto', padding:'0 clamp(20px,5vw,48px)', textAlign:'center' }}>
          <div style={{ fontFamily:'var(--font-jp)', fontSize:40, color:'rgba(250,248,244,0.2)', marginBottom:8 }}>武</div>
          <h2 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(24px,4vw,36px)', fontWeight:300, color:'#fff', lineHeight:1.2, marginBottom:12 }}>
            Tu próximo dojo te está esperando
          </h2>
          <p style={{ fontSize:15, color:'rgba(250,248,244,0.7)', lineHeight:1.7, marginBottom:28 }}>
            19 escuelas de artes marciales en Argentina. Buscá la tuya gratis.
          </p>
          <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
            <Link href="/buscador" style={{ display:'inline-flex', alignItems:'center', gap:8, background:'#fff', color:'var(--crimson)', padding:'13px 28px', borderRadius:3, textDecoration:'none', fontSize:13, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.1em' }}>
              Buscar escuelas →
            </Link>
            <Link href="/registro" style={{ display:'inline-flex', alignItems:'center', gap:8, background:'transparent', color:'rgba(250,248,244,0.8)', padding:'13px 28px', borderRadius:3, textDecoration:'none', fontSize:13, fontWeight:500, textTransform:'uppercase', letterSpacing:'0.1em', border:'1px solid rgba(250,248,244,0.3)' }}>
              Tengo una escuela
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="etd-footer">
        <div className="etd-footer-inner">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span className="etd-nav-kanji">武</span>
            <span style={{ fontFamily: 'var(--font-display)', color: 'rgba(250,248,244,0.4)', fontSize: '16px' }}>EncuentraTuDojo</span>
          </div>
          <div style={{ display: 'flex', gap: '28px' }}>
            {[['Buscador', '/buscador'], ['Tablero', '/tablero'], ['Ingresar', '/auth']].map(([l, h]) => (
              <Link key={l} href={h} style={{ fontSize: '11px', color: 'rgba(250,248,244,0.25)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{l}</Link>
            ))}
          </div>
          <p style={{ fontSize: '11px', color: 'rgba(250,248,244,0.15)' }}>© 2025 EncuentraTuDojo</p>
        </div>
      </footer>
    </main>
  )
}
