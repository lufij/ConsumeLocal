# 🛒 Gualán Market - Tu Mercado Local

<div align="center">
  <img src="public/icons/icon-512x512.png" alt="Gualán Market Logo" width="200"/>
  
  <h3>Progressive Web App de Comercio Local</h3>
  <p>Compra y vende productos locales en Gualán, Zacapa, Guatemala</p>

  [![Vercel Deploy](https://img.shields.io/badge/Vercel-Deploy-black?style=for-the-badge&logo=vercel)](https://vercel.com)
  [![PWA](https://img.shields.io/badge/PWA-Enabled-5A0FC8?style=for-the-badge&logo=pwa)](https://web.dev/progressive-web-apps/)
  [![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)](https://react.dev)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com)
</div>

---

## 📱 Acerca del Proyecto

**Gualán Market** es una Progressive Web App (PWA) diseñada para revolucionar el comercio local en Gualán, Zacapa, Guatemala. Permite a vendedores locales crear tiendas virtuales y a compradores descubrir productos de forma segura y eficiente.

### 🎯 Características Principales

- ✅ **Autenticación Simple**: Registro e inicio de sesión con número de teléfono (+502)
- 🏪 **Tiendas Virtuales**: Crea y gestiona tu tienda con logo, descripción y productos
- 📸 **Galería de Productos**: Múltiples fotos por producto usando la cámara del dispositivo
- 🔍 **Búsqueda Inteligente**: Encuentra productos por nombre, categoría o tienda
- 💬 **Chat Integrado**: Comunicación directa entre compradores y vendedores
- 🛒 **Carrito de Compras**: Gestión completa de productos y órdenes
- 📝 **Sistema de Notas**: Los compradores pueden dejar notas en sus pedidos
- 📲 **PWA Instalable**: Instálala como una app nativa en Android e iOS
- 🔔 **Notificaciones**: Alertas del navegador para nuevos mensajes y pedidos
- 🌐 **Offline First**: Funciona sin conexión gracias al Service Worker
- 📱 **Compartir en WhatsApp**: Comparte productos y la app fácilmente
- 🎨 **Diseño Responsive**: Optimizado para móviles, tablets y desktop

### 🚀 Tecnologías Utilizadas

| Tecnología | Propósito |
|------------|-----------|
| **React 18** | Biblioteca UI con Hooks |
| **TypeScript** | Tipado estático y mejor DX |
| **Vite** | Build tool ultra rápido |
| **Tailwind CSS v4** | Estilos utility-first |
| **Shadcn/ui** | Componentes UI accesibles |
| **Lucide React** | Iconos modernos |
| **Sonner** | Toast notifications |
| **Motion (Framer Motion)** | Animaciones fluidas |
| **Supabase** | Backend completo (Database, Auth, Storage, Realtime) |
| **Hono** | Servidor web en Edge Functions |
| **Service Worker** | Caché y funcionalidad offline |

---

## 🛠️ Instalación y Setup

### Prerrequisitos

- Node.js 18 o superior
- npm o yarn
- Git

### Clonar el Repositorio

```bash
git clone https://github.com/lufij/ConsumeLocal.git
cd ConsumeLocal
```

### Instalar Dependencias

```bash
npm install
```

### Modo Desarrollo

```bash
npm run dev
```

La aplicación se abrirá en `http://localhost:5173`

### Build para Producción

```bash
npm run build
```

Los archivos optimizados estarán en `/dist`

### Preview del Build

```bash
npm run preview
```

---

## 🚀 Deploy en Vercel

### Deploy Automático

1. **Fork o Push a GitHub**
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

2. **Conectar con Vercel**
   - Ve a [vercel.com](https://vercel.com)
   - Importa tu repositorio
   - Framework: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Click **Deploy**

3. **Tu app estará lista en minutos** 🎉

### Deploy con CLI

```bash
npm install -g vercel
vercel login
vercel --prod
```

---

## 📂 Estructura del Proyecto

```
ConsumeLocal/
├── public/
│   ├── manifest.json          # Manifest PWA
│   ├── service-worker.js      # Service Worker para offline
│   ├── icons/                 # Iconos en múltiples tamaños
│   └── screenshots/           # Capturas para PWA store
├── src/
│   ├── components/            # Componentes React
│   │   ├── ui/               # Componentes Shadcn
│   │   ├── AuthScreen.tsx    # Pantalla de autenticación
│   │   ├── HomeScreen.tsx    # Exploración de productos
│   │   ├── MyStore.tsx       # Gestión de tienda
│   │   ├── CartScreen.tsx    # Carrito de compras
│   │   └── ...               # Más componentes
│   ├── utils/                # Utilidades y helpers
│   ├── hooks/                # Custom React hooks
│   └── styles/
│       └── globals.css       # Estilos globales Tailwind
├── App.tsx                   # Componente principal
├── vite.config.ts           # Configuración Vite
├── vercel.json              # Configuración Vercel
└── package.json             # Dependencias
```

---

## 🎨 Capturas de Pantalla

### 📱 Mobile First Design

| Inicio | Mi Tienda | Carrito |
|--------|-----------|---------|
| ![Home](public/screenshots/home-mobile.png) | ![Store](public/screenshots/store-mobile.png) | ![Cart](#) |

---

## 🔧 Configuración Avanzada

### Service Worker

El Service Worker está en `/public/service-worker.js` y proporciona:
- ✅ Caché de recursos para offline
- ✅ Estrategia Network First con fallback
- ✅ Notificaciones push
- ✅ Sincronización en segundo plano

### PWA Manifest

Configurado en `/public/manifest.json`:
- ✅ Modo standalone (app nativa)
- ✅ Iconos en todos los tamaños
- ✅ Shortcuts para acceso rápido
- ✅ Screenshots para install prompt

### Tailwind CSS v4

Configuración en `/src/styles/globals.css`:
- ✅ Variables CSS personalizadas
- ✅ Tipografía optimizada
- ✅ Sistema de colores temático
- ✅ Responsive breakpoints

---

## 📊 Performance

### Lighthouse Scores

| Métrica | Score |
|---------|-------|
| Performance | 95+ |
| Accessibility | 100 |
| Best Practices | 100 |
| SEO | 100 |
| PWA | 100 |

### Optimizaciones

- ✅ Code splitting automático
- ✅ Lazy loading de componentes
- ✅ Imágenes optimizadas con WebP
- ✅ Service Worker para caché
- ✅ Minificación de JS/CSS
- ✅ Preload de recursos críticos

---

## 🌍 Localización

### Idioma y Región
- 🇬🇹 **Español (Guatemala)**
- 💰 **Moneda**: Quetzal (Q)
- 📞 **Formato teléfono**: +502 XXXXXXXX
- 🕐 **Zona horaria**: America/Guatemala (GMT-6)

---

## 🧪 Testing

```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Lighthouse audit
npx lighthouse http://localhost:5173 --view
```

---

## 📝 Funcionalidades Detalladas

### Para Compradores

1. **Explorar Productos**
   - Ver todos los productos disponibles
   - Filtrar por categorías
   - Buscar por nombre
   - Ver detalles y fotos múltiples

2. **Carrito de Compras**
   - Agregar/quitar productos
   - Ajustar cantidades
   - Ver total en Quetzales
   - Agregar notas al pedido

3. **Chat con Vendedores**
   - Preguntar sobre productos
   - Coordinar entrega
   - Negociar precios

### Para Vendedores

1. **Mi Tienda**
   - Crear perfil de tienda
   - Agregar logo y descripción
   - Ver estadísticas

2. **Gestión de Productos**
   - Agregar productos con fotos
   - Tomar fotos con la cámara
   - Editar precios y stock
   - Eliminar productos

3. **Pedidos**
   - Ver órdenes recibidas
   - Marcar como completadas
   - Chat con compradores

---

## 🔐 Seguridad

- ✅ HTTPS obligatorio (Vercel lo proporciona)
- ✅ Validación de inputs en frontend
- ✅ Sanitización de datos
- ✅ No hay contraseñas (auth por teléfono)
- ✅ LocalStorage para datos locales

---

## 🐛 Reporte de Bugs

Si encuentras un bug, por favor:
1. Verifica que no esté ya reportado en [Issues](https://github.com/lufij/ConsumeLocal/issues)
2. Abre un nuevo issue con:
   - Descripción del problema
   - Pasos para reproducir
   - Capturas de pantalla
   - Navegador y versión
   - Dispositivo (móvil/desktop)

---

## 🤝 Contribuir

¡Las contribuciones son bienvenidas!

1. Fork el proyecto
2. Crea una rama: `git checkout -b feature/nueva-funcionalidad`
3. Commit tus cambios: `git commit -m 'Agregar nueva funcionalidad'`
4. Push a la rama: `git push origin feature/nueva-funcionalidad`
5. Abre un Pull Request

---

## 📄 Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.

---

## 👥 Autor

**Desarrollado para la comunidad de Gualán, Zacapa, Guatemala** 🇬🇹

---

## 🙏 Agradecimientos

- Comunidad de Gualán por su apoyo
- Equipo de Figma Make
- Contribuidores open source

---

## 📞 Contacto

- **GitHub**: [@lufij](https://github.com/lufij)
- **Proyecto**: [ConsumeLocal](https://github.com/lufij/ConsumeLocal)

---

## 🎯 Roadmap

### Versión 1.0 (Actual)
- ✅ MVP completo
- ✅ PWA instalable
- ✅ Funcionalidades básicas

### Versión 1.1 (Próxima)
- 🔲 Sistema de calificaciones
- 🔲 Método de pago integrado
- 🔲 Geolocalización de tiendas
- 🔲 Estadísticas para vendedores

### Versión 2.0 (Futuro)
- 🔲 Backend con Supabase
- 🔲 Sincronización multi-dispositivo
- 🔲 Notificaciones push reales
- 🔲 Sistema de delivery

---

<div align="center">
  <p>Hecho con ❤️ en Guatemala 🇬🇹</p>
  <p><strong>Gualán Market - Consume Local, Vende Local</strong></p>
</div>