#!/bin/bash

# ============================================================
#  EncuentraTuDojo — Workflow diario de desarrollo
#  Usar para cada sesión de trabajo
# ============================================================

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
RED='\033[0;31m'
BOLD='\033[1m'
NC='\033[0m'

echo ""
echo -e "${BOLD}══════════════════════════════${NC}"
echo -e "${BOLD}  ETD — Workflow Desarrollo   ${NC}"
echo -e "${BOLD}══════════════════════════════${NC}"
echo ""

# Verificar que estamos en la carpeta correcta
if [ ! -f "README.md" ]; then
  echo -e "${RED}✗ Ejecutá este script desde la carpeta raíz del proyecto${NC}"
  exit 1
fi

# Mostrar rama actual
CURRENT=$(git branch --show-current)
echo -e "  Rama actual: ${CYAN}${CURRENT}${NC}"
echo ""

echo "¿Qué querés hacer?"
echo "  1) Ir a desarrollo y actualizar"
echo "  2) Commitear cambios en desarrollo"
echo "  3) Ver estado del repo"
echo "  4) Ver historial de commits"
echo "  5) Salir"
echo ""

read -p "Opción: " OPT

case $OPT in
  1)
    echo ""
    echo -e "${CYAN}→ Cambiando a rama desarrollo...${NC}"
    git checkout desarrollo
    git pull origin desarrollo
    echo -e "${GREEN}✓ Listo para trabajar en desarrollo${NC}"
    ;;
  2)
    if [ "$CURRENT" != "desarrollo" ]; then
      echo -e "${RED}✗ No estás en la rama 'desarrollo'. Cambiá primero (opción 1).${NC}"
      exit 1
    fi
    echo ""
    git status --short
    echo ""
    read -p "$(echo -e ${YELLOW}Descripción del commit: ${NC})" MSG
    if [[ -z "$MSG" ]]; then
      echo -e "${RED}✗ El mensaje no puede estar vacío${NC}"
      exit 1
    fi
    git add .
    git commit -m "$MSG"
    git push origin desarrollo
    echo -e "${GREEN}✓ Commit subido a desarrollo${NC}"
    ;;
  3)
    echo ""
    git status
    echo ""
    echo -e "${CYAN}Ramas:${NC}"
    git branch -a
    ;;
  4)
    echo ""
    git log --oneline --graph --all --decorate | head -20
    ;;
  5)
    echo "Hasta luego 👋"
    exit 0
    ;;
  *)
    echo -e "${RED}Opción inválida${NC}"
    exit 1
    ;;
esac

echo ""
