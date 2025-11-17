# 💻 SETUP EN VISUAL STUDIO CODE

**PARA LA IA DE VISUAL STUDIO CODE**: Este archivo contiene instrucciones específicas para configurar y trabajar con este proyecto en VS Code.

---

## 🎯 RESUMEN EJECUTIVO

**Proyecto**: Gualán Market PWA
**Tipo**: Progressive Web App (React + TypeScript + Vite)
**Repositorio**: https://github.com/lufij/ConsumeLocal.git
**Status**: ✅ Listo para deployment

---

## 🚀 COMANDOS PRINCIPALES

```bash
# Instalar dependencias
npm install

# Desarrollo (hot reload en http://localhost:5173)
npm run dev

# Build de producción
npm run build

# Preview del build
npm run preview

# Linting
npm run lint
```

---

## 📦 DEPENDENCIAS PRINCIPALES

El archivo `package.json` ya incluye todas estas dependencias. Solo ejecuta `npm install`.

### Core
- react: ^18.3.1
- react-dom: ^18.3.1
- typescript: ^5.6.3

### Build Tools
- vite: ^6.0.1
- @vitejs/plugin-react: ^4.3.4

### Styling
- tailwindcss: ^4.0.0
- @tailwindcss/vite: ^4.0.0

### UI Components
- @radix-ui/* (Shadcn/ui base)
- lucide-react: ^0.462.0
- sonner@2.0.3

### Forms
- react-hook-form@7.55.0

### Animations
- motion/react (Framer Motion)

### PWA
- No requiere paquetes adicionales (vanilla JS en service-worker.js)

---

## 🔧 CONFIGURACIÓN DE VS CODE

### Extensiones Recomendadas

Crea `.vscode/extensions.json`:

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "formulahendry.auto-rename-tag",
    "dsznajder.es7-react-js-snippets",
    "christian-kohler.path-intellisense"
  ]
}
```

### Settings de VS Code

Crea `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true,
  "files.associations": {
    "*.css": "tailwindcss"
  },
  "tailwindCSS.experimental.classRegex": [
    ["cva\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"],
    ["cx\\(([^)]*)\\)", "(?:'|\"|`)([^']*)(?:'|\"|`)"]
  ]
}
```

---

## 📁 ESTRUCTURA DEL PROYECTO

```
ConsumeLocal/
├── public/
│   ├── service-worker.js      ← Service Worker (CRÍTICO)
│   ├── manifest.json          ← Manifest PWA
│   └── icons/                 ← Iconos PWA
├── src/
│   ├── App.tsx                ← Entry point
│   ├── components/
│   │   ├── ui/               ← Shadcn components
│   │   ├── AuthScreen.tsx
│   │   ├── HomeScreen.tsx
│   │   └── ...
│   ├── utils/                ← Helpers
│   ├── hooks/                ← Custom hooks
│   └── styles/
│       └── globals.css       ← Tailwind config
├── SETUP_INSTRUCTIONS.md     ← Guía completa
├── AI_QUICK_GUIDE.md         ← Referencia rápida
└── vercel.json               ← Config Vercel
```

---

## 🛠️ TAREAS COMUNES

### 1. Agregar un Nuevo Componente

```typescript
// src/components/MiComponente.tsx
import { useState } from 'react';
import { Button } from './ui/button';

export function MiComponente() {
  const [count, setCount] = useState(0);
  
  return (
    <div className="p-4">
      <h2>Mi Componente</h2>
      <Button onClick={() => setCount(count + 1)}>
        Count: {count}
      </Button>
    </div>
  );
}
```

### 2. Usar Shadcn/ui Components

Los componentes ya están en `/src/components/ui/`. Úsalos así:

```typescript
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Card } from './components/ui/card';
import { Dialog } from './components/ui/dialog';
```

### 3. Agregar Iconos (Lucide React)

```typescript
import { Home, User, ShoppingCart } from 'lucide-react';

<Home className="w-6 h-6 text-emerald-600" />
```

### 4. Toast Notifications

```typescript
import { toast } from 'sonner@2.0.3';

toast.success('Éxito!', {
  description: 'Operación completada',
});

toast.error('Error', {
  description: 'Algo salió mal',
});
```

### 5. LocalStorage

```typescript
// Guardar
localStorage.setItem('key', JSON.stringify(data));

// Leer
const data = JSON.parse(localStorage.getItem('key') || '[]');

// Eliminar
localStorage.removeItem('key');
```

---

## 🎨 TAILWIND CSS v4

**IMPORTANTE**: Este proyecto usa Tailwind CSS v4.

### NO crear `tailwind.config.js`

Toda la configuración está en `/src/styles/globals.css`:

```css
@import "tailwindcss";

:root {
  --color-primary: #10b981;
  --color-secondary: #0d9488;
}
```

### Clases Comunes

```typescript
<div className="flex items-center justify-center">
<div className="grid grid-cols-2 gap-4">
<div className="bg-emerald-600 text-white rounded-lg p-4">
<button className="hover:bg-emerald-700 transition-colors">
```

---

## 🐛 TROUBLESHOOTING

### Problema: npm install falla

```bash
# Limpiar caché
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

### Problema: Build falla

```bash
# Verificar TypeScript
npm run type-check

# Limpiar y rebuild
rm -rf dist
npm run build
```

### Problema: Hot reload no funciona

```bash
# Matar proceso en puerto 5173
kill -9 $(lsof -t -i:5173)

# Reiniciar
npm run dev
```

### Problema: Service Worker no se registra

```bash
# Verificar que existe
ls public/service-worker.js

# Verificar que se copia en build
npm run build
ls dist/service-worker.js
```

---

## 🧪 TESTING

### Type Checking

```bash
npm run type-check
```

### Linting

```bash
npm run lint

# Fix automático
npm run lint -- --fix
```

### PWA Testing

```bash
# Build y preview
npm run build
npm run preview

# Lighthouse audit
npx lighthouse http://localhost:4173 --view
```

---

## 🚀 DEPLOYMENT WORKFLOW

### 1. Verificar que todo funciona localmente

```bash
npm run dev
# Probar todas las features
```

### 2. Build de producción

```bash
npm run build
```

### 3. Preview del build

```bash
npm run preview
# Verificar en http://localhost:4173
```

### 4. Push a GitHub

```bash
git add .
git commit -m "Ready for production"
git push origin main
```

### 5. Deploy en Vercel

Vercel detecta el push automáticamente y hace deploy.

O manualmente:
```bash
npm install -g vercel
vercel --prod
```

---

## 📝 NOTAS IMPORTANTES PARA LA IA

### 1. Service Worker

**UBICACIÓN**: `/public/service-worker.js`
**STATUS**: ✅ Ya existe (fue creado)
**ACCIÓN**: No modificar a menos que se solicite

### 2. Manifest PWA

**UBICACIÓN**: `/public/manifest.json`
**STATUS**: ✅ Ya existe
**ACCIÓN**: No modificar a menos que se solicite

### 3. Tailwind Config

**IMPORTANTE**: NO crear `tailwind.config.js`
**RAZÓN**: Tailwind v4 usa configuración en CSS
**UBICACIÓN DE CONFIG**: `/src/styles/globals.css`

### 4. TypeScript

**STRICT MODE**: Activado
**ACCIÓN**: Respetar tipos existentes
**FIX ERRORS**: Corregir errores TS antes de build

### 5. Componentes UI

**SHADCN**: Componentes en `/src/components/ui/`
**ACCIÓN**: Usar los existentes, no crear duplicados

---

## 🔍 VERIFICACIÓN RÁPIDA

Antes de confirmar que todo está listo:

```bash
# 1. Dependencias instaladas
ls node_modules/

# 2. Service Worker existe
cat public/service-worker.js

# 3. Build exitoso
npm run build

# 4. Service Worker en build
ls dist/service-worker.js

# 5. Preview funciona
npm run preview
```

Si todos pasan: ✅ **LISTO PARA DEPLOYMENT**

---

## 📚 DOCUMENTACIÓN COMPLETA

Para más información:

1. **Guía Completa**: Lee `SETUP_INSTRUCTIONS.md`
2. **Referencia Rápida**: Lee `AI_QUICK_GUIDE.md`
3. **Checklist**: Sigue `DEPLOYMENT_CHECKLIST.md`
4. **GitHub README**: Lee `README.md`

---

## 🎯 COMANDOS DE UN VISTAZO

```bash
# Setup inicial
npm install

# Desarrollo
npm run dev

# Build
npm run build

# Preview
npm run preview

# Deploy (después de git push)
# Vercel lo hace automáticamente
```

---

## 🤖 MENSAJE PARA GITHUB COPILOT / CURSOR AI

Este es un proyecto PWA de React + TypeScript + Vite con:

- ✅ Service Worker ya configurado (`/public/service-worker.js`)
- ✅ Manifest PWA ya configurado (`/public/manifest.json`)
- ✅ Tailwind CSS v4 (NO uses tailwind.config.js)
- ✅ Shadcn/ui components en `/src/components/ui/`
- ✅ LocalStorage para persistencia (no backend)
- ✅ Listo para deployment en Vercel

**Cuando el usuario pida modificaciones**:
1. Mantén la estructura existente
2. Respeta los tipos TypeScript
3. Usa los componentes Shadcn existentes
4. No modifiques el Service Worker sin solicitud explícita
5. Usa Tailwind v4 (config en globals.css)

---

## ✅ TODO CONFIGURADO

El proyecto está 100% configurado y listo para:
- ✅ Desarrollo local
- ✅ Build de producción
- ✅ Deployment en Vercel
- ✅ PWA funcional
- ✅ Testing completo

**¡Empieza a desarrollar con `npm run dev`!** 🚀

---

**Repositorio**: https://github.com/lufij/ConsumeLocal.git
**Deploy**: Vercel
**Status**: ✅ PRODUCTION READY

🇬🇹 **Gualán Market - Hecho en Guatemala**
