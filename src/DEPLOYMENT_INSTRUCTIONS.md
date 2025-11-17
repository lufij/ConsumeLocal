# 🚀 Instrucciones de Deployment - Gualán Market

## 📋 Pre-requisitos Completados

✅ Todos los archivos de código corregidos  
✅ Configuración de Vite, TypeScript y Tailwind v4  
✅ Migración completa a Supabase KV Store  
✅ PWA configurada con Service Worker y Manifest  

## ⚠️ ACCIÓN REQUERIDA: Generar Iconos de la PWA

**CRÍTICO**: Los 9 iconos PNG de la PWA son obligatorios para el deployment. Sin ellos, la PWA no funcionará correctamente.

### Opción 1: PWA Builder (Recomendado - Iconos Profesionales)

1. Ve a https://www.pwabuilder.com/imageGenerator
2. Sube un logo cuadrado de 1024x1024px del mercado
3. Descarga el ZIP con todos los tamaños generados automáticamente
4. Extrae los archivos en `/public/icons/`

### Opción 2: Generador Incluido (Iconos Temporales)

1. Abre el archivo `/public/icons/icon-generator.html` en tu navegador
2. Click en "Generar y Descargar Todos los Iconos"
3. Se descargarán 9 archivos PNG automáticamente
4. Mueve todos los archivos descargados a `/public/icons/`

### Iconos Requeridos (9 archivos)

```
/public/icons/
├── icon-72x72.png
├── icon-96x96.png
├── icon-128x128.png
├── icon-144x144.png
├── icon-152x152.png
├── icon-192x192.png          ⚠️ OBLIGATORIO
├── icon-384x384.png
├── icon-512x512.png          ⚠️ OBLIGATORIO
└── maskable-icon-512x512.png
```

## 🔧 Pasos de Deployment en Vercel

### 1. Configurar Variables de Entorno en Supabase

Primero necesitas obtener tus credenciales de Supabase:

1. Ve a https://supabase.com/dashboard
2. Selecciona tu proyecto de Gualán Market
3. Ve a **Settings** → **API**
4. Copia estos valores:
   - **Project URL** (será algo como: `https://xxxxx.supabase.co`)
   - **Project API keys** → **anon** **public**
   - **Project API keys** → **service_role** (⚠️ Mantén esto secreto)

### 2. Configurar Repositorio GitHub

```bash
# En tu terminal local, en la carpeta del proyecto:

# 1. Inicializar Git (si no está inicializado)
git init

# 2. Agregar el remote de tu repositorio
git remote add origin https://github.com/lufij/ConsumeLocal.git

# 3. Verificar que los iconos PNG estén en /public/icons/
ls -la public/icons/

# 4. Agregar todos los archivos
git add .

# 5. Commit
git commit -m "Deploy: Archivos de configuración y correcciones pre-deployment"

# 6. Push
git push -u origin main
```

### 3. Deployment en Vercel

#### Opción A: Desde Dashboard de Vercel (Recomendado)

1. Ve a https://vercel.com/
2. Click en **"Add New..."** → **"Project"**
3. Importa el repositorio: `lufij/ConsumeLocal`
4. Configura el proyecto:
   - **Framework Preset**: Vite
   - **Root Directory**: `./` (raíz del proyecto)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

5. **Agregar Variables de Entorno** (CRÍTICO):
   Click en "Environment Variables" y agrega:
   
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=tu-anon-key-aqui
   VITE_SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key-aqui
   VITE_PROJECT_ID=tu-project-id
   ```

6. Click en **"Deploy"**

#### Opción B: Desde CLI de Vercel

```bash
# Instalar Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel

# Configurar variables de entorno
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
vercel env add VITE_SUPABASE_SERVICE_ROLE_KEY
vercel env add VITE_PROJECT_ID

# Deploy a producción
vercel --prod
```

### 4. Configurar Supabase Edge Functions

Las Edge Functions de Supabase necesitan ser desplegadas por separado:

```bash
# Instalar Supabase CLI
npm install -g supabase

# Login a Supabase
supabase login

# Link al proyecto
supabase link --project-ref tu-project-ref

# Deploy las funciones
supabase functions deploy make-server-5d0cb103

# Verificar que las funciones estén corriendo
curl https://tu-project.supabase.co/functions/v1/make-server-5d0cb103/health
```

### 5. Verificación Post-Deployment

Después del deployment, verifica:

#### ✅ Checklist de Verificación

- [ ] El sitio carga correctamente en https://tu-proyecto.vercel.app
- [ ] Los iconos de la PWA se muestran correctamente
- [ ] El botón "Instalar App" aparece en dispositivos compatibles
- [ ] El Service Worker se registra correctamente (Console: "SW registered")
- [ ] La autenticación funciona (login/registro)
- [ ] Se pueden crear tiendas
- [ ] Se pueden agregar productos
- [ ] El carrito funciona
- [ ] El chat funciona
- [ ] Las notificaciones funcionan
- [ ] La sincronización con Supabase funciona

#### 🔍 Debugging

Si algo no funciona:

1. **Abre las DevTools** (F12)
2. **Console**: Busca errores en rojo
3. **Network**: Verifica que las llamadas a Supabase funcionen
4. **Application** → **Manifest**: Verifica que el manifest.json cargue correctamente
5. **Application** → **Service Workers**: Verifica que el SW esté activo

## 🔄 Updates y Re-deployment

Para hacer cambios después del deployment inicial:

```bash
# 1. Hacer cambios en el código
# 2. Commit
git add .
git commit -m "Descripción de los cambios"

# 3. Push
git push origin main

# 4. Vercel hará el re-deploy automáticamente
```

## 📱 Instalación de la PWA

### En Android:

1. Abre el sitio en Chrome
2. Aparecerá un prompt "Agregar a pantalla de inicio"
3. O usa el botón flotante "Instalar App" en la aplicación

### En iOS:

1. Abre el sitio en Safari
2. Toca el botón de compartir
3. Selecciona "Agregar a pantalla de inicio"

## 🆘 Soporte

Si encuentras problemas:

1. Revisa `/DEPLOYMENT_ERRORS_AND_FIXES.md`
2. Revisa los logs en Vercel Dashboard
3. Revisa los logs de Supabase Edge Functions
4. Verifica que todas las variables de entorno estén configuradas

## 🎉 ¡Listo!

Una vez completados todos los pasos, Gualán Market estará en producción y los usuarios de Gualán, Zacapa podrán:

- 🛒 Comprar productos locales
- 🏪 Crear sus tiendas virtuales
- 💬 Chatear con vendedores
- ⭐ Dejar reseñas
- 📱 Instalar la app en sus teléfonos
- 🔔 Recibir notificaciones

---

**Repositorio**: https://github.com/lufij/ConsumeLocal  
**Stack**: React + TypeScript + Vite + Tailwind v4 + Supabase  
**Región**: Gualán, Zacapa, Guatemala 🇬🇹
