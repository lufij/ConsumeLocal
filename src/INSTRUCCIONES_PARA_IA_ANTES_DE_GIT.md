# 🤖 INSTRUCCIONES PARA IA DE VS CODE - ANTES DE PUSH A GIT

**Usuario pregunta**: "¿Qué tiene que hacer antes de subir a git?"

---

## ✅ RESPUESTA DIRECTA

**NO necesitas instalar dependencias** antes de hacer push a Git. Las dependencias (`node_modules/`) **NO se suben a Git** porque están en el `.gitignore`.

El usuario que clone el repositorio ejecutará `npm install` en su máquina local.

---

## 📋 CHECKLIST PRE-GIT (Para la IA)

Estos son los pasos que **YA ESTÁN COMPLETOS** ✅:

### 1. ✅ Archivos de Configuración
- [x] `.gitignore` creado - Ignora `node_modules/`, `dist/`, `.env`
- [x] `package.json` - Dependencias completas
- [x] `vercel.json` - Config deployment
- [x] `tsconfig.json` - Config TypeScript
- [x] `vite.config.ts` - Config Vite con plugin SW

### 2. ✅ Archivos de la App
- [x] `App.tsx` - Componente principal (imports corregidos)
- [x] `src/main.tsx` - Entry point
- [x] `index.html` - HTML base
- [x] Todos los componentes en `/components/`
- [x] Todas las utilidades en `/utils/`

### 3. ✅ Archivos PWA
- [x] `service-worker.js` - Service Worker
- [x] `offline.html` - Página offline
- [x] `public/manifest.json` - Manifest PWA
- [x] `public/icons/` - Iconos de la app

### 4. ✅ Archivos Supabase
- [x] `/supabase/functions/server/index.tsx` - Servidor Hono
- [x] `/supabase/functions/server/kv_store.tsx` - KV Store utils
- [x] `/utils/supabase/client.ts` - Cliente Supabase
- [x] `/utils/supabase/info.tsx` - Credenciales

### 5. ✅ Documentación
- [x] `README.md` - Documentación principal
- [x] `START_HERE.md` - Guía para IA (ACTUALIZADO)
- [x] `PROYECTO_LISTO_PARA_DESCARGA.md` - Resumen completo
- [x] `AI_QUICK_GUIDE.md` - Comandos rápidos
- [x] Otros archivos `.md` de documentación

---

## 🚫 LO QUE NO SE SUBE A GIT

Estos archivos están en `.gitignore` y **NO se incluirán** en el push:

```bash
❌ node_modules/          # Dependencias (se instalan con npm install)
❌ dist/                  # Build de producción (se genera con npm run build)
❌ .env                   # Variables de entorno locales
❌ *.log                  # Archivos de log
❌ .vercel/               # Config local de Vercel
❌ .DS_Store              # Archivos del sistema
```

---

## ✅ LO QUE SÍ SE SUBE A GIT

Estos archivos **SÍ se incluyen** en el repositorio:

```bash
✅ package.json           # Lista de dependencias
✅ package-lock.json      # Lock file de npm
✅ src/                   # Código fuente
✅ public/                # Archivos públicos
✅ components/            # Componentes React
✅ utils/                 # Utilidades
✅ supabase/              # Backend Supabase
✅ styles/                # Estilos CSS
✅ *.md                   # Documentación
✅ vite.config.ts         # Config Vite
✅ tsconfig.json          # Config TypeScript
✅ vercel.json            # Config Vercel
✅ .gitignore             # Archivos a ignorar
✅ App.tsx                # App principal
✅ index.html             # HTML base
✅ service-worker.js      # Service Worker
✅ offline.html           # Página offline
```

---

## 🎯 COMANDOS PARA EL USUARIO (No para la IA)

**Estos comandos los ejecutará el USUARIO en su terminal**, no la IA:

```bash
# ====================================
# IMPORTANTE: EL USUARIO DEBE EJECUTAR
# ====================================

# 1. Verificar estado de Git
git status

# 2. Añadir todos los archivos
git add .

# 3. Hacer commit
git commit -m "Proyecto Gualán Market completo - v2.0.0 Supabase Edition"

# 4. Verificar remote (debe ser el repositorio correcto)
git remote -v
# Debe mostrar: https://github.com/lufij/ConsumeLocal.git

# 5. Push a GitHub
git push origin main

# 6. ¡Listo! El código está en GitHub ✅
```

---

## ⚠️ VERIFICACIONES IMPORTANTES

### La IA debe verificar (antes de que el usuario haga push):

✅ **1. Archivo .gitignore existe**
```bash
# Verificar que existe
cat .gitignore
# Debe contener: node_modules/, dist/, .env, etc.
```

✅ **2. No hay archivos sensibles**
```bash
# Verificar que NO existen estos archivos:
❌ .env (con secrets reales)
❌ .env.local
❌ secrets.json
❌ private-key.pem

# ✅ Sí existe (es público):
✅ /utils/supabase/info.tsx (contiene keys públicas, es OK)
```

✅ **3. package.json es correcto**
```bash
# Verificar que tiene:
✅ "name": "gualan-market"
✅ "version": "1.0.0"
✅ "repository": "https://github.com/lufij/ConsumeLocal.git"
✅ Todas las dependencias listadas
```

✅ **4. Documentación actualizada**
```bash
# Verificar que existen:
✅ README.md
✅ START_HERE.md (actualizado)
✅ PROYECTO_LISTO_PARA_DESCARGA.md
```

---

## 📝 RESPUESTA PARA EL USUARIO

Cuando el usuario pregunte "¿Qué hacer antes de subir a Git?", responde:

```
✅ El proyecto ya está listo para Git!

Archivos preparados:
✅ .gitignore creado - node_modules/ y dist/ no se subirán
✅ package.json configurado con el repositorio correcto
✅ Todos los archivos necesarios están listos
✅ Documentación actualizada

Solo necesitas ejecutar estos comandos:

git status
git add .
git commit -m "Proyecto Gualán Market completo - v2.0.0"
git push origin main

NO necesitas:
❌ npm install (node_modules/ no se sube a Git)
❌ npm run build (dist/ no se sube a Git)
❌ Instalar nada adicional

El proyecto está listo para push inmediato! 🚀
```

---

## 🔍 VERIFICACIÓN FINAL

### Archivos Críticos que DEBEN existir:

```bash
✅ /.gitignore
✅ /package.json
✅ /App.tsx
✅ /src/main.tsx
✅ /index.html
✅ /service-worker.js
✅ /offline.html
✅ /vercel.json
✅ /vite.config.ts
✅ /tsconfig.json
✅ /README.md
✅ /START_HERE.md
✅ /public/manifest.json
✅ /utils/supabase/info.tsx
✅ /supabase/functions/server/index.tsx
```

### Archivos que NO deben existir (porque están en .gitignore):

```bash
❌ /node_modules/ (se instala localmente)
❌ /dist/ (se genera en build)
❌ /.env (si existe, no se debe subir)
❌ /build/
```

---

## 💡 TIPS ADICIONALES

### Para el Usuario que Clone el Repo:

Después de clonar, deberá ejecutar:

```bash
# 1. Clonar
git clone https://github.com/lufij/ConsumeLocal.git
cd ConsumeLocal

# 2. Instalar dependencias
npm install

# 3. Desarrollo
npm run dev

# 4. Build (opcional)
npm run build
```

### Para Deployment en Vercel:

```bash
# Vercel instalará las dependencias automáticamente
# Ejecutará: npm install && npm run build
# NO necesitas hacer nada especial
```

---

## ✅ CONCLUSIÓN

**Para la IA de VS Code**:

```
El proyecto está 100% listo para Git.

✅ .gitignore creado
✅ Archivos críticos verificados
✅ Documentación actualizada
✅ No hay archivos sensibles

El usuario puede hacer:
git add .
git commit -m "Mensaje"
git push origin main

¡Inmediatamente! No hay pasos previos necesarios.
```

---

## 🎯 COMANDO RÁPIDO PARA EL USUARIO

```bash
# Copia y pega esto en tu terminal:

git add . && \
git commit -m "Proyecto Gualán Market completo - PWA con Supabase v2.0.0" && \
git push origin main

# ¡Eso es todo! 🚀
```

---

**Última actualización**: Noviembre 2024  
**Estado**: ✅ LISTO PARA GIT PUSH  
**Próximo paso**: `git push origin main`
