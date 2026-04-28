#!/bin/bash

# ============================================================
#  EncuentraTuDojo — Setup inicial de GitHub
#  Ejecutar UNA SOLA VEZ desde la carpeta del proyecto
# ============================================================

set -e  # salir si hay error

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

echo ""
echo -e "${BOLD}════════════════════════════════════════${NC}"
echo -e "${BOLD}  EncuentraTuDojo — Git Setup Inicial   ${NC}"
echo -e "${BOLD}════════════════════════════════════════${NC}"
echo ""

# ── PASO 1: Verificar Git instalado ──
if ! command -v git &> /dev/null; then
  echo -e "${RED}✗ Git no está instalado.${NC}"
  echo "  Instalá Git desde https://git-scm.com y volvé a ejecutar este script."
  exit 1
fi
echo -e "${GREEN}✓ Git encontrado:${NC} $(git --version)"

# ── PASO 2: Pedir URL del repositorio ──
echo ""
echo -e "${CYAN}Antes de continuar, creá el repositorio en GitHub:${NC}"
echo "  1. Andá a https://github.com/new"
echo "  2. Nombre: encuentratudojo"
echo "  3. Visibilidad: Public o Private (tu elección)"
echo "  4. NO inicialices con README, .gitignore ni licencia"
echo "  5. Click en 'Create repository'"
echo ""

read -p "$(echo -e ${YELLOW}Pegá la URL del repositorio GitHub \(ej: https://github.com/TU_USUARIO/encuentratudojo.git\): ${NC})" REPO_URL

if [[ -z "$REPO_URL" ]]; then
  echo -e "${RED}✗ URL vacía. Abortando.${NC}"
  exit 1
fi

echo ""
echo -e "${GREEN}✓ URL recibida:${NC} $REPO_URL"

# ── PASO 3: Inicializar Git si no existe ──
if [ ! -d ".git" ]; then
  echo ""
  echo -e "${CYAN}→ Inicializando repositorio Git...${NC}"
  git init
  echo -e "${GREEN}✓ Repositorio inicializado${NC}"
else
  echo -e "${GREEN}✓ Repositorio Git ya existe${NC}"
fi

# ── PASO 4: Configurar identidad (si no está configurada) ──
if [ -z "$(git config user.name)" ]; then
  read -p "$(echo -e ${YELLOW}Tu nombre para Git: ${NC})" GIT_NAME
  read -p "$(echo -e ${YELLOW}Tu email para Git: ${NC})" GIT_EMAIL
  git config user.name "$GIT_NAME"
  git config user.email "$GIT_EMAIL"
  echo -e "${GREEN}✓ Identidad configurada${NC}"
fi

# ── PASO 5: Agregar todos los archivos ──
echo ""
echo -e "${CYAN}→ Agregando archivos al staging...${NC}"
git add .
echo -e "${GREEN}✓ Archivos listos${NC}"

# ── PASO 6: Commit inicial en main ──
echo ""
echo -e "${CYAN}→ Creando commit inicial en main...${NC}"
git commit -m "🚀 feat: lanzamiento inicial EncuentraTuDojo v1.0

Plataforma completa de búsqueda de escuelas de artes marciales.

Páginas incluidas:
- index.html         → Homepage + buscador + mapa + filtros por disciplina
- auth.html          → Login · Registro 4 pasos · Recuperar contraseña
- perfil-escuela.html → Perfil público · Reservas · Reseñas · Mapa
- registro-escuela.html → Alta de academia (formulario 7 pasos)
- dashboard-escuela.html → Panel de administración para escuelas
- panel-usuario.html → Panel personal del alumno

Disciplinas: Karate · Taekwondo · Judo · Kung Fu · Aikido · Hapkido · Pakua · Kenjutsu
Tech: HTML5 · CSS3 · JavaScript · Leaflet.js · OpenStreetMap (CARTO)"

echo -e "${GREEN}✓ Commit inicial creado${NC}"

# ── PASO 7: Renombrar rama a main ──
git branch -M main
echo -e "${GREEN}✓ Rama principal: main${NC}"

# ── PASO 8: Conectar con GitHub ──
echo ""
echo -e "${CYAN}→ Conectando con GitHub...${NC}"
git remote remove origin 2>/dev/null || true
git remote add origin "$REPO_URL"
echo -e "${GREEN}✓ Remote 'origin' configurado${NC}"

# ── PASO 9: Push a main ──
echo ""
echo -e "${CYAN}→ Subiendo main a GitHub...${NC}"
echo -e "${YELLOW}  (Si te pide contraseña, usá tu Personal Access Token)${NC}"
git push -u origin main
echo -e "${GREEN}✓ main subido correctamente${NC}"

# ── PASO 10: Crear rama desarrollo ──
echo ""
echo -e "${CYAN}→ Creando rama 'desarrollo'...${NC}"
git checkout -b desarrollo
git push -u origin desarrollo
git checkout main
echo -e "${GREEN}✓ Rama 'desarrollo' creada y subida${NC}"

# ── RESUMEN FINAL ──
echo ""
echo -e "${BOLD}════════════════════════════════════════${NC}"
echo -e "${GREEN}${BOLD}  ✓ Setup completado exitosamente       ${NC}"
echo -e "${BOLD}════════════════════════════════════════${NC}"
echo ""
echo -e "  ${BOLD}Repositorio:${NC} $REPO_URL"
echo -e "  ${BOLD}Rama activa:${NC} main (estable)"
echo -e "  ${BOLD}Rama trabajo:${NC} desarrollo"
echo ""
echo -e "${CYAN}Próximos pasos:${NC}"
echo "  1. Verificá el repo en GitHub"
echo "  2. Para seguir desarrollando:"
echo -e "     ${YELLOW}git checkout desarrollo${NC}"
echo "  3. Todos los nuevos commits van en 'desarrollo'"
echo "  4. Para publicar en GitHub Pages:"
echo "     → GitHub repo → Settings → Pages → Branch: main → /public"
echo ""
echo -e "  📖 Ver guía completa: ${CYAN}docs/github-setup.md${NC}"
echo ""
