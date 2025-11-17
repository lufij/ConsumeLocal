# 📱 GENERAR ICONOS - PASO A PASO

## 🎯 Objetivo

Generar 9 archivos PNG para que tu PWA funcione en móviles.

---

## ✅ OPCIÓN 1: Método Online (MÁS FÁCIL) - 3 minutos

### Paso 1: Obtén tu logo

```bash
# En la terminal, en la carpeta del proyecto:
npm run dev
```

- Abre tu navegador en: `http://localhost:5173`
- Verás tu logo (el hourglass con vegetales) en la esquina superior
- **Click derecho** en el logo → **"Guardar imagen como..."**
- Guárdalo como: `gualán-market-logo.png` en tu carpeta de Descargas

### Paso 2: Genera los iconos online

- Ve a: **https://www.pwabuilder.com/imageGenerator**
- Click en **"Select Image"**
- Sube el logo que guardaste (`gualán-market-logo.png`)
- Deja las opciones por defecto
- Click en **"Generate ZIP"**
- Click en **"Download"**
- Se descargará un archivo `pwa-images.zip`

### Paso 3: Descomprime y copia

```bash
# En tu terminal:

# 1. Ve a tu carpeta de Descargas
cd ~/Downloads

# 2. Descomprime el ZIP
unzip pwa-images.zip -d pwa-icons

# 3. Ve a la carpeta de tu proyecto
cd /ruta/a/tu/proyecto/ConsumeLocal

# 4. Copia los iconos
cp ~/Downloads/pwa-icons/*.png public/icons/
```

Si prefieres hacerlo manualmente:
1. Abre la carpeta `Downloads/pwa-icons`
2. Selecciona todos los archivos `.png`
3. Cópialos
4. Pégalos en la carpeta `public/icons/` de tu proyecto

### Paso 4: Verifica que funcionó

```bash
# Revisa que tienes los 9 archivos
ls public/icons/*.png

# Deberías ver algo como:
# icon-72x72.png
# icon-96x96.png
# icon-128x128.png
# icon-144x144.png
# icon-152x152.png
# icon-192x192.png
# icon-384x384.png
# icon-512x512.png
# maskable-icon-512x512.png (o similar)
```

### Paso 5: Renombra si es necesario

Si PWA Builder generó nombres diferentes, renómbralos:

```bash
cd public/icons

# Ejemplo si generó "android-chrome-192x192.png":
mv android-chrome-192x192.png icon-192x192.png
mv android-chrome-512x512.png icon-512x512.png

# Verifica que coincidan con estos nombres exactos:
# icon-72x72.png
# icon-96x96.png
# icon-128x128.png
# icon-144x144.png
# icon-152x152.png
# icon-192x192.png
# icon-384x384.png
# icon-512x512.png
# maskable-icon-512x512.png
```

### ✅ ¡Listo! Ahora verifica

```bash
node scripts/check-deployment-ready.js
```

Si todo está ✅, continúa al deployment.

---

## ✅ OPCIÓN 2: Método React (AUTOMÁTICO) - 2 minutos

### Paso 1: Agrega la ruta temporal

Abre `/App.tsx` y busca la línea que dice:

```typescript
export default function App() {
```

**Justo ANTES de esa línea**, agrega:

```typescript
import IconGenerator from './components/IconGenerator';

// TEMPORAL: Para generar iconos
if (window.location.pathname === '/generate-icons') {
  return <IconGenerator />;
}
```

### Paso 2: Genera los iconos

```bash
# En la terminal:
npm run dev
```

- Abre en tu navegador: `http://localhost:5173/generate-icons`
- Verás una pantalla con tu logo y un botón verde grande
- Click en el botón: **"📥 Generar y Descargar Todos los Iconos"**
- Se descargarán automáticamente 9 archivos PNG a tu carpeta de Descargas

### Paso 3: Mueve los iconos

```bash
# Mueve los iconos desde Descargas al proyecto
mv ~/Downloads/icon-*.png public/icons/
mv ~/Downloads/maskable-icon-*.png public/icons/
```

O manualmente:
1. Abre `Downloads`
2. Busca los archivos `icon-*.png` (9 archivos)
3. Muévelos a `public/icons/` en tu proyecto

### Paso 4: Limpia el código temporal

Vuelve a `/App.tsx` y **elimina** las líneas que agregaste:

```typescript
// ELIMINA estas líneas:
import IconGenerator from './components/IconGenerator';

if (window.location.pathname === '/generate-icons') {
  return <IconGenerator />;
}
```

### ✅ ¡Listo! Verifica

```bash
node scripts/check-deployment-ready.js
```

---

## ✅ OPCIÓN 3: Método Python - 2 minutos

### Paso 1: Instala Pillow

```bash
pip install Pillow
# o si tienes Python 3:
pip3 install Pillow
```

### Paso 2: Guarda tu logo

```bash
# Corre el proyecto
npm run dev
```

- Abre: `http://localhost:5173`
- Click derecho en el logo → "Guardar imagen como..."
- Guárdalo en: `public/logo-source.png` (exactamente en esa ubicación)

### Paso 3: Ejecuta el script

```bash
python3 scripts/generate-icons.py
```

Los iconos se generarán automáticamente en `public/icons/`.

### ✅ ¡Listo! Verifica

```bash
node scripts/check-deployment-ready.js
```

---

## 📋 Verificación Final

Asegúrate de tener estos 9 archivos en `public/icons/`:

- [ ] `icon-72x72.png`
- [ ] `icon-96x96.png`
- [ ] `icon-128x128.png`
- [ ] `icon-144x144.png`
- [ ] `icon-152x152.png`
- [ ] `icon-192x192.png` ⚠️ **CRÍTICO**
- [ ] `icon-384x384.png`
- [ ] `icon-512x512.png` ⚠️ **CRÍTICO**
- [ ] `maskable-icon-512x512.png`

```bash
# Comando para verificar:
ls -1 public/icons/*.png | wc -l

# Debería mostrar: 9
```

---

## 🚀 Siguiente Paso

Una vez que tengas los 9 iconos:

```bash
# 1. Haz commit
git add public/icons/*.png
git commit -m "feat: add PWA icons for all sizes"

# 2. Push al repositorio
git push origin main

# 3. Continúa con el deployment
# Lee: DEPLOYMENT_INSTRUCTIONS.md
```

---

## 🆘 ¿Problemas?

### "No puedo guardar el logo"
→ Usa la Opción 1 (PWA Builder) y sube cualquier imagen cuadrada temporalmente.  
→ Puedes reemplazar los iconos después.

### "Los scripts no funcionan"
→ No te preocupes, usa la Opción 1 (PWA Builder).  
→ Es el método más confiable.

### "No tengo Python / Node.js / etc."
→ Usa la Opción 1 (PWA Builder).  
→ Solo necesitas un navegador.

### "El verificador dice que faltan archivos"
→ Revisa los nombres de los archivos (deben coincidir exactamente).  
→ Asegúrate de que estén en `public/icons/` (no en subcarpetas).

---

**⏱️ Tiempo total:** 2-5 minutos  
**🎯 Método recomendado:** Opción 1 (PWA Builder)  
**⭐ Dificultad:** Muy fácil
