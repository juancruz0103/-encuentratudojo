# EncuentraTuDojo 🥋

> Directorio de escuelas de artes marciales en Latinoamérica.  
> Conectamos alumnos con academias de Karate, Taekwondo, Judo, Kung Fu, Aikido, Hapkido, Pakua y Kenjutsu.

---

## Estado del proyecto

| Página | Descripción | Estado |
|--------|-------------|--------|
| `index.html` | Homepage · Buscador con mapa · Sistema de filtros | ✅ |
| `auth.html` | Login · Registro 4 pasos · Recuperar contraseña | ✅ |
| `registro-escuela.html` | Formulario de alta de escuela (7 pasos) | ✅ |
| `perfil-escuela.html` | Perfil público de escuela · Reservas · Mapa | ✅ |
| `dashboard-escuela.html` | Panel de administración para academias | ✅ |
| `panel-usuario.html` | Panel personal del alumno | ✅ |

---

## Rama de trabajo

| Rama | Propósito |
|------|-----------|
| `main` | Versión estable presentable. **No se hace push directo.** |
| `desarrollo` | Rama activa de desarrollo. Todos los nuevos commits van aquí. |

---

## Cómo correr localmente

No requiere build ni dependencias. Todos los archivos son HTML/CSS/JS puro.

```bash
# Opción 1 — Python (recomendado, preserva links relativos)
cd public
python3 -m http.server 3000
# Abrir http://localhost:3000

# Opción 2 — Node.js
npx serve public

# Opción 3 — VS Code
# Instalar extensión Live Server → click derecho en index.html → Open with Live Server
```

**Punto de entrada:** `public/index.html`

---

## Tecnologías

- **HTML5 / CSS3 / JavaScript** — sin frameworks, sin build step
- **Leaflet.js + CARTO** — mapas interactivos sin token
- **Tipografía** — Cormorant Garamond · Noto Serif JP · DM Sans (Google Fonts)
- **Iconografía** — SVG inline

### Stack planeado (Fase 1)
- Next.js 14 (App Router) · Supabase (PostgreSQL + Auth + Storage) · Stripe · Vercel

---

## Modelo de negocio

| Plan | Precio | Incluye |
|------|--------|---------|
| Starter | Gratis | Perfil básico, 3 fotos, contacto |
| Pro | USD $29/mes | Leads dashboard, métricas, mensajería |
| Premium | USD $79/mes | Destacado en mapa, top búsquedas, analíticas |

Comisiones adicionales: leads ($2–5), reservas (10–15%), inscripciones (15–20%).

---

## Flujo de navegación

```
index.html
├── auth.html ──────────────────► panel-usuario.html
│   └── (tipo escuela) ─────────► dashboard-escuela.html
├── registro-escuela.html ──────► dashboard-escuela.html
└── perfil-escuela.html
    ├── Modal reserva trial
    ├── WhatsApp directo
    └── Ver en mapa
```

---

## Workflow Git

```bash
# Nunca commitear directo a main
# Siempre trabajar en desarrollo:
git checkout desarrollo
git add .
git commit -m "feat: descripción del cambio"
git push origin desarrollo

# Para pasar a main (solo en releases autorizados):
git checkout main
git merge desarrollo
git push origin main
```

---

*武道を見つける — Encontrá tu camino marcial.*
