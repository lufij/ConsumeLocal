# 🚀 INSTRUCCIONES COMPLETAS DE SETUP - GUALÁN MARKET PWA

**IMPORTANTE**: Este archivo contiene TODAS las instrucciones para configurar, instalar y desplegar la aplicación Gualán Market desde Visual Studio Code.

---

## 📱 DESCRIPCIÓN DE LA APLICACIÓN

**Nombre**: Gualán Market - Tu Mercado Local
**Tipo**: Progressive Web App (PWA) de comercio local
**Ubicación**: Gualán, Zacapa, Guatemala
**Idioma**: Español
**Moneda**: Quetzal (Q)
**Tecnologías**: React + TypeScript + Vite + Tailwind CSS v4 + Supabase

### Propósito
Mercado virtual para que vendedores creen tiendas virtuales y compradores descubran productos locales de forma segura. Optimizada para conexiones 3G/4G y dispositivos Android.

### Funcionalidades Principales
- ✅ Autenticación por número de teléfono
- ✅ Perfiles de usuario y tienda
- ✅ Gestión de catálogo de productos con múltiples fotos
- ✅ Exploración y búsqueda por categorías
- ✅ Sistema de chat integrado
- ✅ Carrito de compras
- ✅ Sistema de notas del comprador
- ✅ PWA instalable en Android e iOS
- ✅ Sistema de notificaciones del navegador
- ✅ Cámara integrada para fotos de productos
- ✅ Sistema de compartir en WhatsApp

---

## 🔧 REQUISITOS PREVIOS

### Software Necesario
```bash
# Node.js (v18 o superior)
node --version  # Debe mostrar v18.x.x o superior

# npm o yarn
npm --version   # Debe mostrar 9.x.x o superior

# Git
git --version   # Para control de versiones
```

### Instalación de Node.js
Si no tienes Node.js instalado:
- Descarga desde: https://nodejs.org/
- Instala la versión LTS (Long Term Support)
- Reinicia tu terminal después de instalar

---

## 📦 INSTALACIÓN INICIAL

### 1. Clonar o Inicializar el Repositorio

```bash
# Opción A: Si ya tienes el código localmente
cd /ruta/a/tu/proyecto
git init
git remote add origin https://github.com/lufij/ConsumeLocal.git

# Opción B: Si estás clonando desde GitHub
git clone https://github.com/lufij/ConsumeLocal.git
cd ConsumeLocal
```

### 2. Instalar Dependencias

```bash
# Instalar todas las dependencias del proyecto
npm install

# Esto instalará automáticamente:
# - React 18
# - TypeScript
# - Vite (build tool)
# - Tailwind CSS v4
# - Supabase Client
# - Shadcn/ui components
# - Lucide React (iconos)
# - Sonner (toasts)
# - React Hook Form
# - Recharts (gráficos)
# - Motion (animaciones)
# Y todas las demás dependencias listadas en package.json
```

### 3. Verificar la Estructura del Proyecto

```
ConsumeLocal/
├── public/
│   ├── manifest.json          ✅ CRÍTICO - Manifest PWA
│   ├── service-worker.js      ⚠️ DEBE CREARSE (ver sección abajo)
│   ├── icons/                 ✅ Iconos PWA (múltiples tamaños)
│   └── screenshots/           ✅ Capturas para PWA
├── src/
│   ├── App.tsx               ✅ Componente principal
│   ├── components/           ✅ Todos los componentes React
│   ├── utils/                ✅ Utilidades y helpers
│   ├── hooks/                ✅ Custom React hooks
│   └── styles/
│       └── globals.css       ✅ Estilos globales Tailwind
├── index.html                ✅ Punto de entrada HTML
├── vite.config.ts            ✅ Configuración de Vite
├── tsconfig.json             ✅ Configuración TypeScript
├── tailwind.config.js        ⚠️ DEBE VERIFICARSE
└── package.json              ✅ Dependencias del proyecto
```

---

## ⚠️ CONFIGURACIÓN CRÍTICA DEL SERVICE WORKER

### PASO 1: Crear el Service Worker

**ACCIÓN REQUERIDA**: Debes crear manualmente el archivo `/public/service-worker.js`

```javascript
// /public/service-worker.js
const CACHE_NAME = 'gualan-market-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json'
];

// Instalación del Service Worker
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker: Instalando...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('📦 Service Worker: Archivos en caché');
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

// Activación del Service Worker
self.addEventListener('activate', (event) => {
  console.log('✅ Service Worker: Activado');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Service Worker: Eliminando caché antigua:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Interceptar peticiones de red
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Devolver del caché si existe
        if (response) {
          return response;
        }
        
        // Hacer petición de red
        return fetch(event.request).then((response) => {
          // Verificar respuesta válida
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clonar respuesta
          const responseToCache = response.clone();

          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });

          return response;
        });
      })
  );
});

// Manejar notificaciones push (futuro)
self.addEventListener('push', (event) => {
  console.log('📬 Service Worker: Push recibido');
  
  const options = {
    body: event.data ? event.data.text() : 'Nueva notificación',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [200, 100, 200],
    tag: 'gualan-market-notification',
    requireInteraction: false
  };

  event.waitUntil(
    self.registration.showNotification('Gualán Market', options)
  );
});

// Manejar clics en notificaciones
self.addEventListener('notificationclick', (event) => {
  console.log('🔔 Service Worker: Notificación clickeada');
  
  event.notification.close();

  event.waitUntil(
    clients.openWindow('/')
  );
});
```

### PASO 2: Verificar el Manifest

El archivo `/public/manifest.json` ya existe, pero verifica que tenga estos campos críticos:

```json
{
  "name": "Gualán Market - Tu Mercado Local",
  "short_name": "Gualán Market",
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#10b981",
  "background_color": "#ffffff",
  "icons": [
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

### PASO 3: Generar Iconos PWA

Los iconos ya están en `/public/icons/`, pero si necesitas regenerarlos:

1. Crea un ícono base de 512x512px con el logo de Gualán Market
2. Usa herramientas online para generar todos los tamaños:
   - https://www.pwabuilder.com/imageGenerator
   - Sube tu ícono de 512x512
   - Descarga todos los tamaños
   - Reemplaza en `/public/icons/`

**Tamaños requeridos**:
- 72x72, 96x96, 128x128, 144x144, 152x152, 192x192, 384x384, 512x512
- maskable-icon-512x512.png (con padding para Android)

---

## 🎨 CONFIGURACIÓN DE TAILWIND CSS V4

### Verificar globals.css

El archivo `/src/styles/globals.css` debe contener la configuración de Tailwind v4:

```css
@import "tailwindcss";

/* Variables de color personalizadas */
:root {
  --color-primary: #10b981;
  --color-secondary: #0d9488;
  /* ... más variables ... */
}
```

### NO crear tailwind.config.js

**IMPORTANTE**: Tailwind CSS v4 NO usa `tailwind.config.js`. Toda la configuración está en `globals.css`.

Si el archivo `tailwind.config.js` existe, es de una versión anterior y debe eliminarse.

---

## 🚀 COMANDOS DE DESARROLLO

### Desarrollo Local

```bash
# Iniciar servidor de desarrollo
npm run dev

# La aplicación se abrirá en:
# http://localhost:5173

# Características del modo desarrollo:
# - Hot Module Replacement (HMR)
# - Source maps
# - TypeScript checking en tiempo real
```

### Build para Producción

```bash
# Compilar para producción
npm run build

# Resultado:
# - Archivos optimizados en /dist
# - JavaScript minificado
# - CSS minificado
# - Assets optimizados
# - Service Worker copiado
```

### Preview del Build

```bash
# Previsualizar el build de producción localmente
npm run preview

# Se abre en:
# http://localhost:4173
```

### Linting

```bash
# Verificar código con ESLint
npm run lint

# Corregir automáticamente problemas
npm run lint -- --fix
```

---

## 🌐 DESPLEGAR EN VERCEL

### Opción A: Deploy desde GitHub (RECOMENDADO)

1. **Subir código a GitHub**:
```bash
git add .
git commit -m "Initial commit: Gualán Market PWA"
git push -u origin main
```

2. **Conectar con Vercel**:
   - Ve a https://vercel.com
   - Inicia sesión con GitHub
   - Click en "New Project"
   - Importa: https://github.com/lufij/ConsumeLocal
   - Framework Preset: **Vite**
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `dist`

3. **Variables de Entorno** (si usas Supabase):
   - No es necesario configurar nada en Vercel
   - La app usa localStorage y datos locales
   - Supabase está pre-configurado (opcional)

4. **Deploy**:
   - Click "Deploy"
   - Espera 1-2 minutos
   - Tu app estará en: `https://consume-local.vercel.app`

### Opción B: Deploy desde CLI

```bash
# Instalar Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel

# Responde las preguntas:
# - Scope: Tu cuenta
# - Link to existing project: No
# - Project name: gualan-market
# - Directory: ./
# - Override settings: No

# Deploy a producción
vercel --prod
```

### Configuración Avanzada de Vercel

Crea un archivo `vercel.json` en la raíz:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/service-worker.js",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=0, must-revalidate"
        },
        {
          "key": "Service-Worker-Allowed",
          "value": "/"
        }
      ]
    },
    {
      "source": "/manifest.json",
      "headers": [
        {
          "key": "Content-Type",
          "value": "application/manifest+json"
        }
      ]
    }
  ]
}
```

---

## 📱 VERIFICAR FUNCIONALIDAD PWA

### Después del Deploy

1. **Abrir en Chrome Android**:
   - Ve a tu URL de Vercel
   - Abre DevTools (Chrome Desktop)
   - Ve a "Application" → "Manifest"
   - Verifica que aparezca el manifest

2. **Verificar Service Worker**:
   - En DevTools → "Application" → "Service Workers"
   - Debe aparecer el service worker registrado
   - Estado: "activated and is running"

3. **Probar Instalación**:
   - En Chrome Android
   - Espera 2-3 segundos
   - Debe aparecer banner "Agregar a pantalla de inicio"
   - O botón flotante verde "Instalar App"

4. **Lighthouse Audit**:
```bash
# Instalar Lighthouse CLI
npm install -g @lhci/cli

# Auditar PWA
lighthouse https://tu-url.vercel.app --view
```

Debe obtener:
- ✅ PWA: 100/100
- ✅ Performance: 90+/100
- ✅ Accessibility: 95+/100

---

## 🐛 SOLUCIÓN DE PROBLEMAS COMUNES

### Problema 1: Service Worker no se registra

**Síntomas**:
- No aparece en DevTools → Application → Service Workers
- El botón de instalación no aparece
- Error en consola: "Service Worker registration failed"

**Solución**:
```bash
# 1. Verificar que existe /public/service-worker.js
ls public/service-worker.js

# 2. Verificar que se copia en el build
npm run build
ls dist/service-worker.js

# 3. Limpiar caché y recargar
# En Chrome: Ctrl + Shift + R
```

### Problema 2: Evento beforeinstallprompt no se dispara

**Causas**:
- ❌ No estás en HTTPS (debe ser https:// en producción)
- ❌ La app ya está instalada
- ❌ El navegador no es compatible (usa Chrome/Edge/Samsung Internet)
- ❌ El manifest.json tiene errores

**Solución**:
```bash
# Validar manifest
# Ve a: https://manifest-validator.appspot.com/
# Pega el contenido de tu manifest.json
```

### Problema 3: Iconos no se muestran

**Solución**:
```bash
# Verificar que los iconos existen
ls public/icons/

# Deben estar:
# - icon-72x72.png
# - icon-96x96.png
# - icon-128x128.png
# - icon-144x144.png
# - icon-152x152.png
# - icon-192x192.png
# - icon-384x384.png
# - icon-512x512.png
# - maskable-icon-512x512.png
```

### Problema 4: Build falla en Vercel

**Síntomas**:
- Error: "Command failed with exit code 1"
- TypeScript errors

**Solución**:
```bash
# 1. Probar build localmente
npm run build

# 2. Si falla, verificar errores TypeScript
npm run type-check

# 3. Corregir errores y volver a intentar
```

### Problema 5: La app no carga después de instalar

**Solución**:
```bash
# 1. Limpiar caché del Service Worker
# DevTools → Application → Service Workers → Unregister

# 2. Limpiar caché del navegador
# DevTools → Application → Clear storage → Clear site data

# 3. Recargar la página
```

---

## 📊 MONITOREO Y ANALYTICS

### Agregar Google Analytics (Opcional)

1. **Instalar dependencia**:
```bash
npm install react-ga4
```

2. **Configurar en App.tsx**:
```typescript
import ReactGA from 'react-ga4';

// En useEffect inicial
ReactGA.initialize('G-XXXXXXXXXX'); // Tu tracking ID
ReactGA.send('pageview');
```

### Sentry para Error Tracking (Opcional)

```bash
npm install @sentry/react

# Configurar en main.tsx
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "tu-dsn-de-sentry",
  integrations: [new Sentry.BrowserTracing()],
  tracesSampleRate: 1.0,
});
```

---

## 🔒 SEGURIDAD Y MEJORES PRÁCTICAS

### Content Security Policy

Agrega en `index.html`:
```html
<meta http-equiv="Content-Security-Policy" 
      content="
        default-src 'self'; 
        script-src 'self' 'unsafe-inline' 'unsafe-eval'; 
        style-src 'self' 'unsafe-inline';
        img-src 'self' data: https:;
        font-src 'self' data:;
        connect-src 'self' https://*.supabase.co;
      ">
```

### HTTPS Only

Vercel proporciona HTTPS automáticamente. No necesitas configurar nada.

### Rate Limiting

Si implementas backend:
```typescript
// Limitar llamadas API
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100 // límite de 100 requests por ventana
});

app.use(limiter);
```

---

## 📚 RECURSOS ADICIONALES

### Documentación
- React: https://react.dev
- Vite: https://vitejs.dev
- Tailwind CSS v4: https://tailwindcss.com
- PWA: https://web.dev/progressive-web-apps/
- Vercel: https://vercel.com/docs

### Herramientas útiles
- PWA Builder: https://www.pwabuilder.com/
- Lighthouse: https://developers.google.com/web/tools/lighthouse
- Manifest Generator: https://app-manifest.firebaseapp.com/
- Icon Generator: https://realfavicongenerator.net/

### Testing PWA
- Chrome DevTools → Application tab
- Lighthouse (DevTools → Lighthouse)
- PWA Testing Tool: https://www.pwabuilder.com/

---

## ✅ CHECKLIST FINAL ANTES DE DEPLOY

```
Pre-Deploy:
[ ] Service Worker creado en /public/service-worker.js
[ ] Iconos PWA en todos los tamaños requeridos
[ ] manifest.json completo y válido
[ ] Build local exitoso (npm run build)
[ ] Preview funcional (npm run preview)
[ ] PWA instalable en preview
[ ] No hay errores TypeScript
[ ] No hay errores de lint

Deploy a Vercel:
[ ] Código subido a GitHub
[ ] Proyecto conectado en Vercel
[ ] Framework: Vite seleccionado
[ ] Build command: npm run build
[ ] Output directory: dist
[ ] Deploy exitoso

Post-Deploy:
[ ] URL accesible públicamente
[ ] Service Worker registrado (Chrome DevTools)
[ ] Manifest carga correctamente
[ ] Botón de instalación aparece
[ ] App es instalable en Android
[ ] Lighthouse PWA score 100/100
[ ] Funciona offline (modo avión)
[ ] Notificaciones funcionan
[ ] Cámara funciona
```

---

## 🤖 MENSAJE PARA LA IA DE VISUAL STUDIO

**Contexto**: Este es un proyecto PWA de React + TypeScript + Vite + Tailwind CSS v4.

**Acciones Requeridas**:

1. **CRÍTICO**: Crear `/public/service-worker.js` con el código completo proporcionado arriba
2. Verificar que existe `/public/manifest.json`
3. Verificar que existen todos los iconos en `/public/icons/`
4. NO crear `tailwind.config.js` (se usa Tailwind v4)
5. Verificar `vite.config.ts` tenga la configuración PWA

**Si el usuario pide "preparar para deploy"**:
1. Verificar que `service-worker.js` existe
2. Ejecutar `npm run build`
3. Verificar que `dist/service-worker.js` existe
4. Crear `vercel.json` con la configuración proporcionada
5. Confirmar que todo está listo para git push

**Si hay errores de build**:
- Verificar dependencias con `npm install`
- Verificar TypeScript con `npm run type-check`
- Limpiar y rebuild: `rm -rf dist && npm run build`

**Repositorio Git**: https://github.com/lufij/ConsumeLocal.git

---

## 📝 NOTAS IMPORTANTES

1. **LocalStorage**: La app usa localStorage para datos locales. No requiere base de datos externa.

2. **PWA Offline**: El service worker cachea recursos para funcionamiento offline.

3. **Notificaciones**: Las notificaciones usan la API del navegador, no requieren servidor.

4. **Cámara**: Usa la API nativa del navegador (getUserMedia).

5. **Optimización 3G/4G**: 
   - Imágenes optimizadas
   - Code splitting
   - Lazy loading
   - Service Worker para caché

6. **Guatemala Específico**:
   - Idioma: Español
   - Moneda: Quetzal (Q)
   - Formato teléfono: +502 XXXXXXXX
   - Zona horaria: America/Guatemala (GMT-6)

---

## 🎯 PRÓXIMOS PASOS DESPUÉS DEL DEPLOY

1. **Compartir la URL** con usuarios beta en Gualán
2. **Monitorear errores** en la consola del navegador
3. **Recopilar feedback** de usuarios reales
4. **Optimizar performance** basado en métricas reales
5. **Agregar analytics** para entender uso
6. **Promocionar** en grupos de WhatsApp locales

---

**ÚLTIMA ACTUALIZACIÓN**: Noviembre 2025
**VERSIÓN**: 1.0.0 - MVP Completo + PWA
**AUTOR**: Sistema de desarrollo de Gualán Market
**REPOSITORIO**: https://github.com/lufij/ConsumeLocal.git

---

## 🆘 CONTACTO Y SOPORTE

Si necesitas ayuda adicional:
1. Lee la documentación en este archivo
2. Consulta los recursos adicionales
3. Verifica la sección de solución de problemas
4. Revisa los logs de la consola del navegador

**¡Éxito con tu deploy! 🚀🇬🇹**
