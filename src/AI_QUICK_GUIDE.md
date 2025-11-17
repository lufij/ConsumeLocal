# 🤖 GUÍA RÁPIDA PARA IA - GUALÁN MARKET

**LÉEME PRIMERO**: Esta es una guía de referencia rápida. Para instrucciones completas, lee `SETUP_INSTRUCTIONS.md`

---

## ⚡ COMANDOS RÁPIDOS

### Instalación
```bash
npm install
```

### Desarrollo
```bash
npm run dev
# App en http://localhost:5173
```

### Build
```bash
npm run build
# Output en /dist
```

### Deploy a Vercel
```bash
git add .
git commit -m "Deploy to production"
git push origin main
# Vercel detecta el push y hace deploy automático
```

---

## 🚨 ARCHIVOS CRÍTICOS QUE DEBEN EXISTIR

### 1. Service Worker
**Ubicación**: `/public/service-worker.js`
**Status**: ✅ YA EXISTE (creado)

### 2. Manifest PWA
**Ubicación**: `/public/manifest.json`
**Status**: ✅ YA EXISTE

### 3. Vercel Config
**Ubicación**: `/vercel.json`
**Status**: ✅ YA EXISTE (creado)

### 4. Iconos PWA
**Ubicación**: `/public/icons/`
**Status**: ✅ YA EXISTEN
**Tamaños**: 72, 96, 128, 144, 152, 192, 384, 512px

---

## 📋 CHECKLIST PRE-DEPLOY

```bash
# 1. Verificar Service Worker
[ ] ls public/service-worker.js

# 2. Verificar Manifest
[ ] ls public/manifest.json

# 3. Verificar Iconos
[ ] ls public/icons/icon-*.png

# 4. Test Build
[ ] npm run build

# 5. Verificar dist contiene SW
[ ] ls dist/service-worker.js

# 6. Preview local
[ ] npm run preview
```

---

## 🔧 SI ALGO FALLA

### Build Error
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Service Worker no carga
```bash
# Verificar que se copió a dist
ls dist/service-worker.js

# Si no existe, revisar vite.config.ts
# Debe incluir: copyPublicDir: true
```

### PWA no instalable
1. Debe ser HTTPS (Vercel lo proporciona automáticamente)
2. Manifest debe ser válido
3. Service Worker debe registrarse exitosamente
4. Iconos deben existir en todos los tamaños

---

## 📦 ESTRUCTURA DE ARCHIVOS

```
ConsumeLocal/
├── public/
│   ├── service-worker.js     ✅ CRÍTICO
│   ├── manifest.json         ✅ CRÍTICO
│   └── icons/               ✅ CRÍTICO
├── src/
│   ├── App.tsx              ✅ Componente principal
│   ├── components/          ✅ Todos los componentes
│   └── utils/               ✅ Utilidades
├── vercel.json              ✅ Config Vercel
├── vite.config.ts           ✅ Config Vite
└── package.json             ✅ Dependencias
```

---

## 🌐 DEPLOY EN VERCEL

### Método 1: GitHub (Recomendado)
```bash
# 1. Push a GitHub
git add .
git commit -m "Ready for production"
git push origin main

# 2. En vercel.com
- Importar repositorio
- Framework: Vite
- Build: npm run build
- Output: dist
- Deploy!
```

### Método 2: Vercel CLI
```bash
npm install -g vercel
vercel login
vercel --prod
```

---

## 🐛 TROUBLESHOOTING

### Problema: Service Worker no registra
**Solución**:
```javascript
// Verificar en utils/serviceWorkerRegistration.tsx
// Debe tener:
navigator.serviceWorker.register('/service-worker.js', { scope: '/' })
```

### Problema: Botón de instalación no aparece
**Causas posibles**:
- ❌ No está en HTTPS
- ❌ Ya está instalada
- ❌ Navegador no compatible (debe ser Chrome/Edge/Samsung)
- ❌ Manifest inválido

**Solución**:
```bash
# Validar manifest en:
# https://manifest-validator.appspot.com/

# Ver logs en consola:
# DevTools → Console → Filtrar por "PWA" o "Service Worker"
```

### Problema: Iconos no cargan
**Solución**:
```bash
# Verificar que existen
ls public/icons/

# Deben estar todos estos tamaños:
icon-72x72.png
icon-96x96.png
icon-128x128.png
icon-144x144.png
icon-152x152.png
icon-192x192.png
icon-384x384.png
icon-512x512.png
maskable-icon-512x512.png
```

---

## 🎯 CONFIGURACIÓN VERCEL

El archivo `vercel.json` ya está creado con:
- ✅ Framework: Vite
- ✅ Output: dist
- ✅ Headers para Service Worker
- ✅ Headers para Manifest
- ✅ Rewrite rules para SPA

**No necesitas modificar nada**, está listo para deploy.

---

## 📱 TESTING PWA

### En Desarrollo (localhost)
```bash
npm run build
npm run preview

# En Chrome DevTools:
# 1. Application → Manifest (verificar)
# 2. Application → Service Workers (verificar registrado)
# 3. Lighthouse → PWA audit (debe ser 100/100)
```

### En Producción (Vercel)
```bash
# Después del deploy:
# 1. Abrir URL en Chrome Android
# 2. Esperar 2-3 segundos
# 3. Debe aparecer banner "Agregar a pantalla de inicio"
# 4. O botón flotante verde "Instalar App"
```

---

## 🔑 VARIABLES DE ENTORNO

**IMPORTANTE**: Esta app NO requiere variables de entorno.

Todo se almacena en localStorage:
- Usuarios
- Productos
- Carrito
- Mensajes
- Notificaciones

Supabase está pre-configurado pero es opcional.

---

## 🚀 STACK TECNOLÓGICO

| Tech | Version | Propósito |
|------|---------|-----------|
| React | 18 | UI Framework |
| TypeScript | 5 | Tipado |
| Vite | 5 | Build Tool |
| Tailwind | v4 | Estilos |
| PWA | - | App Instalable |

---

## 📝 NOTAS IMPORTANTES

1. **NO crear `tailwind.config.js`** - Se usa Tailwind v4 (config en globals.css)
2. **Service Worker DEBE estar en `/public`** - Se copia a dist automáticamente
3. **HTTPS es obligatorio** - Vercel lo proporciona gratis
4. **Manifest DEBE ser válido** - Ya está configurado correctamente
5. **Iconos DEBEN existir en todos los tamaños** - Ya están incluidos

---

## ✅ VERIFICACIÓN FINAL

Antes de dar por terminado:

```bash
# 1. Build exitoso
npm run build

# 2. Preview funciona
npm run preview

# 3. Service Worker registrado
# Check en DevTools → Application

# 4. Manifest válido
# Check en DevTools → Application → Manifest

# 5. PWA score 100
# Lighthouse → PWA audit

# 6. Git push
git add .
git commit -m "Production ready"
git push origin main

# 7. Vercel deploy
# Automático al hacer push
```

---

## 🎉 LISTO PARA PRODUCCIÓN

Si todos los checks están en verde:
- ✅ Build exitoso
- ✅ Service Worker registrado
- ✅ Manifest válido
- ✅ Iconos presentes
- ✅ Preview funcional
- ✅ Lighthouse 100/100

**¡Tu app está lista para deploy!** 🚀

---

## 📞 SI NECESITAS AYUDA

1. Lee `SETUP_INSTRUCTIONS.md` (guía completa)
2. Verifica logs en consola del navegador
3. Usa Chrome DevTools → Application tab
4. Revisa Issues en GitHub
5. Consulta documentación de Vercel

---

**Repositorio**: https://github.com/lufij/ConsumeLocal.git
**Framework**: Vite + React + TypeScript
**Deploy**: Vercel
**Status**: ✅ LISTO PARA PRODUCCIÓN

---

🇬🇹 **Hecho en Guatemala - Gualán Market**
