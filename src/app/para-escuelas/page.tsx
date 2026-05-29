import type { Metadata } from 'next'
import Link from 'next/link'
import NavBar from '@/components/NavBar'

export const metadata: Metadata = {
  title: 'Para escuelas — EncuentraTuDojo',
  description: 'Registrá tu escuela de artes marciales y conseguí nuevos alumnos. Sin contrato fijo. Solo pagás según la cantidad de alumnos.',
}

export default function ParaEscuelasPage() {
  return (
    <main style={{ minHeight:'100vh', background:'var(--ink)' }}>
      <NavBar />

      {/* HERO */}
      <div style={{ paddingTop:'var(--nav-h)', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', inset:0, backgroundImage:'repeating-linear-gradient(0deg,transparent,transparent 59px,rgba(200,169,110,0.03) 59px,rgba(200,169,110,0.03) 60px),repeating-linear-gradient(90deg,transparent,transparent 59px,rgba(200,169,110,0.03) 59px,rgba(200,169,110,0.03) 60px)', pointerEvents:'none' }} />
        <div style={{ position:'absolute', left:0, top:0, bottom:0, width:3, background:'linear-gradient(to bottom,transparent,var(--crimson) 20%,var(--crimson-bright) 80%,transparent)' }} />
        <div style={{ position:'absolute', right:0, top:'50%', transform:'translateY(-50%) translateX(30%)', fontFamily:'var(--font-jp)', fontSize:'clamp(200px,30vw,380px)', color:'rgba(200,169,110,0.04)', lineHeight:1, pointerEvents:'none' }}>武道</div>

        <div style={{ maxWidth:1200, margin:'0 auto', padding:'clamp(60px,10vw,100px) clamp(20px,5vw,64px) clamp(60px,8vw,80px)', position:'relative', zIndex:1 }}>
          <div style={{ fontSize:11, textTransform:'uppercase', letterSpacing:'0.2em', color:'var(--gold)', marginBottom:16 }}>Para dueños de escuelas</div>
          <h1 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(36px,6vw,72px)', fontWeight:300, color:'var(--parchment)', lineHeight:0.95, letterSpacing:'-0.02em', marginBottom:24, maxWidth:700 }}>
            Conseguí nuevos{' '}
            <em style={{ fontStyle:'italic', color:'var(--crimson-bright)' }}>alumnos</em>{' '}
            para tu dojo
          </h1>
          <p style={{ fontSize:'clamp(15px,2vw,18px)', fontWeight:300, color:'rgba(250,248,244,0.45)', lineHeight:1.7, maxWidth:540, marginBottom:36 }}>
            EncuentraTuDojo conecta a alumnos que buscan con escuelas que crecen. Sin suscripción fija — solo pagás según la cantidad de alumnos declarados.
          </p>
          <div style={{ display:'flex', gap:14, flexWrap:'wrap' }}>
            <Link href="/registro" style={{ display:'inline-flex', alignItems:'center', gap:8, background:'var(--crimson)', color:'#fff', padding:'14px 32px', borderRadius:3, textDecoration:'none', fontSize:13, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.1em' }}>
              Registrar mi escuela →
            </Link>
            <Link href="/buscador" style={{ display:'inline-flex', alignItems:'center', gap:8, background:'transparent', color:'rgba(250,248,244,0.5)', padding:'14px 28px', borderRadius:3, textDecoration:'none', fontSize:13, textTransform:'uppercase', letterSpacing:'0.1em', border:'1px solid rgba(250,248,244,0.15)' }}>
              Ver el directorio
            </Link>
          </div>
        </div>
      </div>

      {/* BENEFICIOS */}
      <section style={{ background:'var(--parchment)', padding:'clamp(48px,8vw,80px) 0' }}>
        <div style={{ maxWidth:1200, margin:'0 auto', padding:'0 clamp(20px,5vw,64px)' }}>
          <div style={{ textAlign:'center', marginBottom:48 }}>
            <h2 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(26px,4vw,38px)', fontWeight:300, color:'var(--ink)', marginBottom:8 }}>
              Todo lo que <em style={{ color:'var(--crimson)', fontStyle:'italic' }}>incluye</em> tu perfil
            </h2>
            <p style={{ fontSize:14, color:'var(--wood-light)' }}>Sin costo extra. Todo disponible desde el día uno.</p>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))', gap:24 }}>
            {[
              { icon:'🗺', title:'Presencia en el mapa interactivo', desc:'Tu escuela aparece en el mapa con un pin personalizado con el kanji de tu disciplina, visible para todos los que buscan en tu zona.' },
              { icon:'📊', title:'Panel de métricas real', desc:'Sabés exactamente cuántos alumnos llegaron por la plataforma — WhatsApp clicks, trials reservados, visitas al perfil y tasa de conversión.' },
              { icon:'📅', title:'Reservas de clase trial', desc:'Los alumnos pueden reservar su clase trial directamente desde tu perfil. Vos recibís los datos del alumno por email y en tu dashboard.' },
              { icon:'📢', title:'Tablero comunitario', desc:'Publicá torneos, eventos, promociones y clases especiales. Aparecen en el tablero comunitario visible para todos los usuarios.' },
              { icon:'⭐', title:'Reseñas verificadas', desc:'Los alumnos dejan reseñas reales con puntuación. El sistema recalcula tu rating automáticamente y te posiciona mejor en las búsquedas.' },
              { icon:'🔔', title:'Notificaciones push', desc:'Recibís una notificación en tu celular cada vez que llega un nuevo lead desde la plataforma, incluso con el navegador cerrado.' },
            ].map((b, i) => (
              <div key={i} style={{ background:'var(--parchment-dark)', borderRadius:'var(--radius)', padding:'24px 24px', border:'1px solid rgba(122,92,58,0.1)' }}>
                <div style={{ fontSize:28, marginBottom:12 }}>{b.icon}</div>
                <h3 style={{ fontFamily:'var(--font-display)', fontSize:18, fontWeight:400, color:'var(--ink)', marginBottom:8, lineHeight:1.2 }}>{b.title}</h3>
                <p style={{ fontSize:13, color:'var(--ink-soft)', lineHeight:1.7 }}>{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MODELO DE COMISIÓN */}
      <section style={{ background:'var(--ink)', padding:'clamp(48px,8vw,80px) 0', overflow:'hidden', position:'relative' }}>
        <div style={{ position:'absolute', right:0, bottom:0, fontFamily:'var(--font-jp)', fontSize:'clamp(100px,15vw,200px)', color:'rgba(200,169,110,0.04)', lineHeight:1, pointerEvents:'none', transform:'translateX(20%)' }}>銭</div>
        <div style={{ maxWidth:1200, margin:'0 auto', padding:'0 clamp(20px,5vw,64px)', position:'relative', zIndex:1 }}>
          <div style={{ textAlign:'center', marginBottom:40 }}>
            <h2 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(26px,4vw,38px)', fontWeight:300, color:'var(--parchment)', marginBottom:8 }}>
              El modelo más <em style={{ color:'var(--gold)', fontStyle:'italic' }}>justo</em> del mercado
            </h2>
            <p style={{ fontSize:14, color:'rgba(250,248,244,0.4)', maxWidth:500, margin:'0 auto' }}>
              No pagás una suscripción fija que pesa en los meses malos. Pagás en relación al tamaño real de tu escuela.
            </p>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:12, marginBottom:32 }}>
            {[
              { tier:'Dojo pequeño', range:'1–40 alumnos', rate:'$1.20', fee:'$1–$48', color:'#888780' },
              { tier:'Escuela media', range:'41–100 alumnos', rate:'$1.00', fee:'$41–$100', color:'#185FA5', highlight:true },
              { tier:'Academia grande', range:'101–200 alumnos', rate:'$0.80', fee:'$80–$160', color:'#3B6D11' },
              { tier:'Centro premium', range:'201–400 alumnos', rate:'$0.65', fee:'$130–$260', color:'#BA7517' },
              { tier:'Multi-sede', range:'401+ alumnos', rate:'$0.50', fee:'$200+', color:'#A32D2D' },
            ].map((t, i) => (
              <div key={i} style={{ background: t.highlight ? 'rgba(200,169,110,0.08)' : 'rgba(250,248,244,0.03)', border:`1px solid ${t.highlight ? 'rgba(200,169,110,0.3)' : 'rgba(200,169,110,0.08)'}`, borderRadius:'var(--radius)', padding:'18px 16px', position:'relative', overflow:'hidden' }}>
                {t.highlight && <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:'linear-gradient(90deg,transparent,var(--gold),transparent)' }} />}
                <div style={{ fontSize:10, textTransform:'uppercase', letterSpacing:'0.1em', color: t.highlight ? 'var(--gold)' : 'rgba(200,169,110,0.4)', marginBottom:8 }}>{t.tier}</div>
                <div style={{ fontFamily:'var(--font-display)', fontSize:24, color:'var(--parchment)', lineHeight:1, marginBottom:4 }}>{t.rate} <span style={{ fontSize:12, color:'rgba(250,248,244,0.4)' }}>USD/alumno</span></div>
                <div style={{ fontSize:12, color:'rgba(250,248,244,0.4)', marginBottom:6 }}>{t.range}</div>
                <div style={{ fontSize:11, color:'rgba(250,248,244,0.25)', borderTop:'1px solid rgba(200,169,110,0.08)', paddingTop:8 }}>Fee: {t.fee} USD/mes</div>
              </div>
            ))}
          </div>
          <div style={{ textAlign:'center' }}>
            <p style={{ fontSize:13, color:'rgba(250,248,244,0.3)', marginBottom:8 }}>¿Tenés 3 o más sedes? <Link href="mailto:hola@encuentratudojo.vercel.app" style={{ color:'var(--gold)' }}>Contactanos para un acuerdo especial →</Link></p>
          </div>
        </div>
      </section>

      {/* CÓMO EMPEZAR */}
      <section style={{ background:'var(--parchment)', padding:'clamp(48px,8vw,80px) 0' }}>
        <div style={{ maxWidth:900, margin:'0 auto', padding:'0 clamp(20px,5vw,64px)' }}>
          <h2 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(24px,4vw,36px)', fontWeight:300, color:'var(--ink)', textAlign:'center', marginBottom:40 }}>
            Empezá en <em style={{ color:'var(--crimson)', fontStyle:'italic' }}>3 pasos</em>
          </h2>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))', gap:32 }}>
            {[
              { num:'1', title:'Completá el registro', desc:'Ingresá los datos de tu escuela, disciplina, ubicación y cantidad de alumnos. Tarda menos de 5 minutos.', link:'/registro', cta:'Registrarme →' },
              { num:'2', title:'Revisamos tu perfil', desc:'Nuestro equipo revisa y activa tu perfil en menos de 24 horas. Te avisamos por email cuando esté visible.', link:null, cta:null },
              { num:'3', title:'Empezás a recibir leads', desc:'Desde el día de la activación tu escuela aparece en el buscador. Recibís las consultas directamente en tu dashboard.', link:'/buscador', cta:'Ver el directorio →' },
            ].map((s, i) => (
              <div key={i} style={{ textAlign:'center' }}>
                <div style={{ width:48, height:48, borderRadius:'50%', background:'var(--crimson)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'var(--font-display)', fontSize:22, fontWeight:600, color:'#fff', margin:'0 auto 16px' }}>{s.num}</div>
                <h3 style={{ fontFamily:'var(--font-display)', fontSize:18, fontWeight:400, color:'var(--ink)', marginBottom:8 }}>{s.title}</h3>
                <p style={{ fontSize:13, color:'var(--ink-soft)', lineHeight:1.7, marginBottom:16 }}>{s.desc}</p>
                {s.link && <Link href={s.link} style={{ fontSize:12, color:'var(--crimson)', textDecoration:'none', fontWeight:500 }}>{s.cta}</Link>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section style={{ background:'var(--crimson)', padding:'clamp(40px,6vw,64px) 0' }}>
        <div style={{ maxWidth:600, margin:'0 auto', padding:'0 clamp(20px,5vw,48px)', textAlign:'center' }}>
          <h2 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(24px,4vw,36px)', fontWeight:300, color:'#fff', marginBottom:12 }}>
            Tu próximo alumno te está buscando
          </h2>
          <p style={{ fontSize:14, color:'rgba(250,248,244,0.7)', lineHeight:1.7, marginBottom:28 }}>
            Registrá tu escuela gratis hoy y empezá a recibir consultas de alumnos interesados en tu disciplina.
          </p>
          <Link href="/registro" style={{ display:'inline-flex', alignItems:'center', gap:8, background:'#fff', color:'var(--crimson)', padding:'14px 36px', borderRadius:3, textDecoration:'none', fontSize:13, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em' }}>
            Registrar mi escuela →
          </Link>
        </div>
      </section>

      <footer className="etd-footer">
        <div className="etd-footer-inner">
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <span style={{ fontFamily:'var(--font-jp)', fontSize:20, color:'var(--crimson-bright)' }}>武</span>
            <span style={{ fontFamily:'var(--font-display)', color:'rgba(250,248,244,0.4)', fontSize:16 }}>EncuentraTuDojo</span>
          </div>
          <p style={{ fontSize:11, color:'rgba(250,248,244,0.15)' }}>© 2025 EncuentraTuDojo</p>
        </div>
      </footer>
    </main>
  )
}
