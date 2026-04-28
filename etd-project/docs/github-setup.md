# Guía GitHub — EncuentraTuDojo

## Estructura de ramas

```
main ──────────────────────► versión estable (solo 1 commit inicial)
desarrollo ────────────────► todos los cambios van aquí
```

**Regla:** `main` no se toca. Todo va en `desarrollo`.

---

## Setup inicial (una sola vez)

### 1. Instalar Git
- **Windows:** https://git-scm.com/download/win
- **Mac:** `brew install git`
- **Linux:** `sudo apt install git`

### 2. Crear repositorio en GitHub
1. Ir a **https://github.com/new**
2. Nombre: `encuentratudojo`
3. ⚠️ No inicializar con README ni .gitignore
4. Click **Create repository**
5. Copiar la URL del repo

### 3. Ejecutar el script
```bash
# Mac/Linux:
chmod +x setup-github.sh && ./setup-github.sh

# Windows (Git Bash):
bash setup-github.sh
```

El script crea automáticamente:
- Commit inicial limpio en `main`
- Rama `desarrollo` lista para trabajar

---

## Workflow diario

```bash
# Ir a desarrollo
git checkout desarrollo

# Hacer cambios...

# Guardar y subir
git add .
git commit -m "feat: descripción del cambio"
git push origin desarrollo
```

O usar el script interactivo:
```bash
bash dev.sh
```

---

## Convención de commits

| Prefijo | Uso |
|---------|-----|
| `feat:` | Nueva funcionalidad |
| `fix:` | Corrección de bug |
| `style:` | Cambios de CSS/diseño |
| `docs:` | Documentación |
| `chore:` | Mantenimiento |

---

## GitHub Pages (publicar gratis)

1. GitHub → Settings → Pages
2. Branch: `main` → folder: `/public`
3. Save → disponible en `https://TU_USUARIO.github.io/encuentratudojo/`

---

## Token de autenticación

GitHub ya no acepta contraseñas. Crear token en:
**GitHub → Settings → Developer settings → Personal access tokens → Generate new token**
- Scope: `repo`
- Usar como contraseña cuando Git lo pida
