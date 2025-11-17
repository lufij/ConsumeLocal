# ✅ CHECKLIST DE DEPLOYMENT - GUALÁN MARKET

Use este checklist para asegurar un deployment exitoso a Vercel.

---

## 🔍 PRE-VERIFICACIÓN (ANTES DE PUSH)

### Archivos Críticos
- [ ] `/public/service-worker.js` existe
- [ ] `/public/manifest.json` existe
- [ ] `/vercel.json` existe
- [ ] `/.gitignore` existe
- [ ] `/README.md` existe

### Iconos PWA
- [ ] `/public/icons/icon-72x72.png` existe
- [ ] `/public/icons/icon-96x96.png` existe
- [ ] `/public/icons/icon-128x128.png` existe
- [ ] `/public/icons/icon-144x144.png` existe
- [ ] `/public/icons/icon-152x152.png` existe
- [ ] `/public/icons/icon-192x192.png` existe
- [ ] `/public/icons/icon-384x384.png` existe
- [ ] `/public/icons/icon-512x512.png` existe
- [ ] `/public/icons/maskable-icon-512x512.png` existe

### Dependencias
- [ ] `npm install` completado sin errores
- [ ] `package.json` tiene todas las dependencias necesarias
- [ ] No hay vulnerabilidades críticas (`npm audit`)

---

## 🛠️ BUILD LOCAL (TESTING)

### Comandos
```bash
# 1. Limpiar build anterior
rm -rf dist

# 2. Build de producción
npm run build

# 3. Verificar que build fue exitoso
ls dist/

# 4. Verificar que Service Worker se copió
ls dist/service-worker.js

# 5. Preview local
npm run preview
```

### Verificación Build
- [ ] Build completado sin errores
- [ ] Carpeta `/dist` creada
- [ ] `/dist/service-worker.js` existe
- [ ] `/dist/manifest.json` existe
- [ ] `/dist/assets/` contiene los archivos JS/CSS
- [ ] Tamaño total del build < 5MB

---

## 🌐 TESTING LOCAL (npm run preview)

### Chrome DevTools - Application Tab
- [ ] **Manifest**: Aparece correctamente
  - [ ] Name: "Gualán Market - Tu Mercado Local"
  - [ ] Short name: "Gualán Market"
  - [ ] Icons: Todos los tamaños presentes
  - [ ] Start URL: "/"
  - [ ] Display: "standalone"
  - [ ] Theme color: "#10b981"

- [ ] **Service Workers**: Registrado exitosamente
  - [ ] Estado: "activated and is running"
  - [ ] Scope: "/"
  - [ ] Source: "/service-worker.js"

- [ ] **Storage**: LocalStorage funcional
  - [ ] Puede guardar datos
  - [ ] Puede leer datos

### Funcionalidad
- [ ] Login/Registro funciona
- [ ] Exploración de productos funciona
- [ ] Crear tienda funciona
- [ ] Agregar productos funciona
- [ ] Carrito funciona
- [ ] Chat funciona
- [ ] Notificaciones se solicitan

### PWA
- [ ] Botón flotante "Instalar App" aparece
- [ ] Al hacer clic muestra el prompt de instalación
- [ ] Se puede instalar localmente
- [ ] Después de instalar, abre como standalone

---

## 📊 LIGHTHOUSE AUDIT

### Ejecutar Audit
```bash
# Opción 1: Chrome DevTools
# DevTools → Lighthouse → Generate report

# Opción 2: CLI
npx lighthouse http://localhost:4173 --view
```

### Scores Requeridos
- [ ] **Performance**: ≥ 90/100
- [ ] **Accessibility**: ≥ 95/100
- [ ] **Best Practices**: ≥ 95/100
- [ ] **SEO**: ≥ 90/100
- [ ] **PWA**: 100/100 ⚠️ CRÍTICO

### PWA Checks Específicos
- [ ] ✅ Registers a service worker
- [ ] ✅ Responds with 200 when offline
- [ ] ✅ Has a `<meta name="viewport">` tag
- [ ] ✅ Contains some content when JS is not available
- [ ] ✅ Has a `<meta name="theme-color">` tag
- [ ] ✅ Provides a valid `apple-touch-icon`
- [ ] ✅ Configured for a custom splash screen
- [ ] ✅ Sets a theme color for the address bar
- [ ] ✅ Content is sized correctly for the viewport
- [ ] ✅ Displays correctly in standalone mode

---

## 🔧 GIT SETUP

### Inicializar Git (si es necesario)
```bash
git init
git remote add origin https://github.com/lufij/ConsumeLocal.git
```

### Verificaciones
- [ ] Git inicializado
- [ ] Remote origin configurado
- [ ] `.gitignore` incluye `node_modules/`, `dist/`, `.env`

---

## 📤 PUSH A GITHUB

### Comandos
```bash
# 1. Ver cambios
git status

# 2. Agregar todos los archivos
git add .

# 3. Commit con mensaje descriptivo
git commit -m "Initial commit: Gualán Market PWA ready for production"

# 4. Push a main
git push -u origin main
```

### Verificación GitHub
- [ ] Código subido exitosamente
- [ ] Repository visible en: https://github.com/lufij/ConsumeLocal
- [ ] README.md se muestra correctamente
- [ ] Todos los archivos presentes

---

## 🚀 DEPLOY EN VERCEL

### Setup Inicial
1. [ ] Ir a https://vercel.com
2. [ ] Login con GitHub
3. [ ] Click "New Project"
4. [ ] Buscar e importar: `lufij/ConsumeLocal`

### Configuración
- [ ] **Framework Preset**: Vite
- [ ] **Root Directory**: `./`
- [ ] **Build Command**: `npm run build` (autodetectado)
- [ ] **Output Directory**: `dist` (autodetectado)
- [ ] **Install Command**: `npm install` (autodetectado)
- [ ] **Node Version**: 18.x o superior

### Variables de Entorno
- [ ] No se requieren variables de entorno (app usa localStorage)
- [ ] Si usas Supabase (opcional): Ya está pre-configurado

### Deploy
- [ ] Click "Deploy"
- [ ] Esperar ~2 minutos
- [ ] Build completado exitosamente
- [ ] URL generada (ejemplo: `https://consume-local.vercel.app`)

---

## ✅ POST-DEPLOY VERIFICATION

### Acceso Básico
- [ ] URL de Vercel accesible
- [ ] Página carga sin errores
- [ ] HTTPS activado (automático)
- [ ] No hay errores en consola

### PWA en Producción
- [ ] Abrir URL en Chrome Desktop
- [ ] DevTools → Application → Manifest aparece
- [ ] DevTools → Application → Service Workers registrado
- [ ] Botón flotante "Instalar App" aparece (después de 2-3 seg)

### Test en Mobile
- [ ] Abrir URL en Chrome Android
- [ ] Esperar 2-3 segundos
- [ ] Banner "Agregar a pantalla de inicio" aparece
- [ ] O botón flotante verde "Instalar App" aparece
- [ ] Hacer clic e instalar
- [ ] App se instala en pantalla de inicio
- [ ] Abrir app desde pantalla de inicio
- [ ] Se abre en modo standalone (sin barra del navegador)

### Funcionalidad Completa
- [ ] Login funciona
- [ ] Registro funciona
- [ ] Explorar productos funciona
- [ ] Crear tienda funciona
- [ ] Agregar productos funciona
- [ ] Tomar fotos con cámara funciona
- [ ] Carrito funciona
- [ ] Chat funciona
- [ ] Notificaciones funcionan
- [ ] Compartir en WhatsApp funciona

### Offline Mode
- [ ] Instalar la app
- [ ] Activar modo avión
- [ ] Abrir la app
- [ ] La app carga (aunque sin datos nuevos)
- [ ] Service Worker sirve contenido cacheado

---

## 🎯 LIGHTHOUSE EN PRODUCCIÓN

### Ejecutar Audit en URL de Vercel
```bash
npx lighthouse https://tu-url.vercel.app --view
```

### Scores Finales
- [ ] Performance: ___/100 (≥90)
- [ ] Accessibility: ___/100 (≥95)
- [ ] Best Practices: ___/100 (≥95)
- [ ] SEO: ___/100 (≥90)
- [ ] PWA: ___/100 (DEBE SER 100)

---

## 📱 TEST MATRIZ DE DISPOSITIVOS

### Desktop
- [ ] Chrome (Windows/Mac/Linux)
- [ ] Edge (Windows/Mac)
- [ ] Firefox (información, no instalable)
- [ ] Safari (Mac) (información, no instalable)

### Mobile
- [ ] Chrome (Android) - INSTALABLE ✅
- [ ] Samsung Internet (Android) - INSTALABLE ✅
- [ ] Edge (Android) - INSTALABLE ✅
- [ ] Safari (iOS) - Instalación manual

### Tablets
- [ ] Chrome (Android Tablet)
- [ ] Safari (iPad) - Instalación manual

---

## 🔍 DEBUGGING SI ALGO FALLA

### Service Worker no registra en producción
```bash
# Verificar en URL de Vercel:
# 1. https://tu-url.vercel.app/service-worker.js debe cargar
# 2. https://tu-url.vercel.app/manifest.json debe cargar
# 3. Content-Type de manifest debe ser application/manifest+json
```

### Botón de instalación no aparece
```bash
# Verificar en Chrome DevTools Console:
# Buscar mensajes como:
# ✅ "PWA: Service Worker registrado"
# ⚠️ "No se detectó evento beforeinstallprompt"
# 
# Causas comunes:
# - App ya instalada (desinstalar y probar de nuevo)
# - Navegador no compatible (usar Chrome/Edge)
# - Manifest inválido (verificar en Application tab)
```

### PWA no pasa Lighthouse
```bash
# Revisar qué checks fallan:
# - Service Worker: Verificar que se registra
# - Manifest: Verificar que es válido
# - Offline: Verificar que funciona sin red
# - Icons: Verificar que todos los tamaños existen
```

---

## 🎉 DEPLOYMENT EXITOSO

### Confirmación Final
Si todos estos checks pasan, tu deployment fue exitoso:

- ✅ Build completado sin errores
- ✅ Código en GitHub
- ✅ Deployed en Vercel
- ✅ URL accesible públicamente
- ✅ HTTPS habilitado
- ✅ Service Worker registrado
- ✅ Manifest válido
- ✅ PWA instalable en Android
- ✅ Lighthouse PWA: 100/100
- ✅ Funciona offline
- ✅ Todas las features funcionan

---

## 📣 PRÓXIMOS PASOS

### Compartir la App
1. [ ] Copiar URL de Vercel
2. [ ] Crear mensaje de WhatsApp:
```
🛒 ¡Gualán Market ya está disponible!

Compra y vende productos locales en nuestra nueva app.

📱 Instala aquí: https://tu-url.vercel.app

✨ 100% gratis
🇬🇹 Hecho en Guatemala
```

3. [ ] Compartir en:
   - [ ] Grupos de WhatsApp locales
   - [ ] Facebook
   - [ ] Comunidad de Gualán

### Monitoreo
1. [ ] Configurar Google Analytics (opcional)
2. [ ] Configurar Sentry para errores (opcional)
3. [ ] Revisar Vercel Analytics
4. [ ] Monitorear feedback de usuarios

### Mejoras Futuras
1. [ ] Sistema de calificaciones
2. [ ] Pagos integrados
3. [ ] Geolocalización
4. [ ] Backend con Supabase
5. [ ] Notificaciones push reales

---

## 📊 DEPLOYMENT SUMMARY

```
┌─────────────────────────────────────────┐
│  GUALÁN MARKET - DEPLOYMENT STATUS     │
├─────────────────────────────────────────┤
│                                         │
│  📦 Build:          [ ]                │
│  🔄 Git Push:       [ ]                │
│  🚀 Vercel Deploy:  [ ]                │
│  ✅ PWA Check:      [ ]                │
│  📱 Mobile Test:    [ ]                │
│  🎯 Lighthouse:     [ ]                │
│                                         │
│  READY FOR PRODUCTION: [ ]             │
│                                         │
└─────────────────────────────────────────┘
```

---

**Fecha de Deployment**: _________________

**URL de Producción**: _________________

**Notas**:
_________________________________________
_________________________________________
_________________________________________

---

🇬🇹 **Gualán Market - Consume Local, Vende Local**
