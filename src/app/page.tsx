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
      <section style={{ background: 'var(--ink)', padding: '48px 0' }}>
        <div className="etd-tablero-grid">
          <div>
            <div style={{ fontSize: '9px', color: 'var(--gold)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '12px' }}>Comunidad marcial</div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '40px', fontWeight: 300, color: 'var(--parchment)', lineHeight: 1.1, marginBottom: '16px' }}>
              Tablero <em style={{ fontStyle: 'italic', color: 'var(--crimson-bright)' }}>comunitario</em>
            </h2>
            <p style={{ fontSize: '15px', fontWeight: 300, color: 'rgba(250,248,244,0.45)', lineHeight: 1.7, marginBottom: '24px' }}>
              Torneos, eventos, clases especiales y novedades de todas las escuelas de Argentina.
            </p>
            <Link href="/tablero" className="etd-btn-primary">Ver tablero →</Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {[{ icon: '武', label: 'Torneos' }, { icon: '祭', label: 'Eventos' }, { icon: '春', label: 'Promociones' }, { icon: '道', label: 'Clases especiales' }].map(item => (
              <div key={item.label} style={{ background: 'rgba(250,248,244,0.04)', border: '1px solid rgba(200,169,110,0.1)', borderRadius: '6px', padding: '24px', textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-jp)', fontSize: '36px', color: 'rgba(200,169,110,0.4)', marginBottom: '8px' }}>{item.icon}</div>
                <div style={{ fontSize: '12px', color: 'rgba(250,248,244,0.4)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{item.label}</div>
              </div>
            ))}
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
