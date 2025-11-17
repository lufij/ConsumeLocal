# 🎨 Generar los 9 Iconos PWA con tu Logo

## ✅ Tu logo está listo

Ya tienes el logo perfecto de **Gualán Market** con el hourglass de vegetales. 
Ahora necesitas generar los 9 iconos PNG en diferentes tamaños para la PWA.

---

## 🚀 MÉTODO 1: Componente React (MÁS FÁCIL) ⭐ RECOMENDADO

### Paso 1: Abre el generador en el navegador

El generador React ya está creado en `/components/IconGenerator.tsx` y usa tu logo real.

**Opción A - Crear ruta temporal:**

1. Abre el proyecto en desarrollo:
   ```bash
   npm run dev
   ```

2. Agrega esta línea temporal al final del archivo `/App.tsx` justo antes del `export default`:
   ```typescript
   // TEMPORAL: Generador de iconos
   if (window.location.pathname === '/generate-icons') {
     return <IconGenerator />;
   }
   ```

3. No olvides importar al inicio del archivo:
   ```typescript
   import IconGenerator from './components/IconGenerator';
   ```

4. Abre en el navegador: `http://localhost:5173/generate-icons`

5. Haz click en el botón verde grande

6. Se descargarán automáticamente los 9 iconos PNG

**Opción B - Modo standalone (sin modificar App.tsx):**

Crea un archivo temporal `/icon-generator-page.html` en la raíz:

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Generar Iconos</title>
</head>
<body>
  <div id="root"></div>
  <script type="module">
    import { StrictMode } from 'react';
    import { createRoot } from 'react-dom/client';
    import IconGenerator from './components/IconGenerator.tsx';
    import './styles/globals.css';

    createRoot(document.getElementById('root')).render(
      <StrictMode>
        <IconGenerator />
      </StrictMode>
    );
  </script>
</body>
</html>
```

Luego abre: `http://localhost:5173/icon-generator-page.html`

---

## 🌐 MÉTODO 2: Herramienta Online (MÁS RÁPIDO)

### Paso 1: Extrae tu logo

Tu logo está en: `figma:asset/f363da58c695d80309a491d46687c31d09664423.png`

Para extraerlo:

1. **Si estás en Figma:**
   - Selecciona el logo
   - Click derecho → Export → PNG
   - Guarda como `gualán-market-logo.png`

2. **Si tienes el proyecto corriendo:**
   - Abre `http://localhost:5173` en el navegador
   - Abre las DevTools (F12)
   - Ve a la pestaña Network
   - Recarga la página
   - Busca el archivo `.png` del logo
   - Click derecho → Open in new tab
   - Click derecho en la imagen → Save image as
   - Guarda como `gualán-market-logo.png`

### Paso 2: Genera los iconos

Ve a: **https://www.pwabuilder.com/imageGenerator**

1. Click en **"Select Image"**
2. Sube `gualán-market-logo.png`
3. Selecciona opciones:
   - **Padding**: Ninguno (0%)
   - **Background**: Transparent o el verde del logo (#1e4620)
4. Click en **"Generate"**
5. Descarga el ZIP con todos los iconos

### Paso 3: Copia los iconos al proyecto

```bash
# Descomprime el ZIP descargado
unzip icons.zip -d ~/Downloads/pwa-icons

# Copia los iconos a tu proyecto
cp ~/Downloads/pwa-icons/icon-*.png public/icons/
```

---

## 💻 MÉTODO 3: Script Manual con Node.js

Si prefieres usar un script, necesitas instalar `sharp`:

```bash
npm install --save-dev sharp
```

Luego crea `/scripts/generate-icons-from-logo.js`:

```javascript
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Ruta del logo (ajusta según tu estructura)
const LOGO_PATH = path.join(__dirname, '../public/logo-source.png');
const OUTPUT_DIR = path.join(__dirname, '../public/icons');

const SIZES = [
  { size: 72, name: 'icon-72x72.png' },
  { size: 96, name: 'icon-96x96.png' },
  { size: 128, name: 'icon-128x128.png' },
  { size: 144, name: 'icon-144x144.png' },
  { size: 152, name: 'icon-152x152.png' },
  { size: 192, name: 'icon-192x192.png' },
  { size: 384, name: 'icon-384x384.png' },
  { size: 512, name: 'icon-512x512.png' },
];

async function generateIcons() {
  console.log('🎨 Generando iconos PWA...\n');
  
  for (const { size, name } of SIZES) {
    const outputPath = path.join(OUTPUT_DIR, name);
    
    await sharp(LOGO_PATH)
      .resize(size, size, {
        fit: 'cover',
        position: 'center'
      })
      .png()
      .toFile(outputPath);
    
    console.log(`✅ Generado: ${name}`);
  }
  
  // Icono maskable (con padding)
  const maskablePath = path.join(OUTPUT_DIR, 'maskable-icon-512x512.png');
  await sharp(LOGO_PATH)
    .resize(410, 410) // 80% del tamaño para dejar padding
    .extend({
      top: 51,
      bottom: 51,
      left: 51,
      right: 51,
      background: { r: 30, g: 70, b: 32, alpha: 1 } // Verde oscuro
    })
    .png()
    .toFile(maskablePath);
  
  console.log('✅ Generado: maskable-icon-512x512.png');
  console.log('\n✨ ¡Todos los iconos generados exitosamente!');
}

generateIcons().catch(console.error);
```

**Primero copia tu logo a `/public/logo-source.png`**, luego ejecuta:

```bash
node scripts/generate-icons-from-logo.js
```

---

## 📋 Verificar que los iconos están listos

Después de generar los iconos con cualquier método:

```bash
# Ver los iconos generados
ls -lh public/icons/*.png

# Deberías ver 9 archivos PNG:
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

También puedes ejecutar el script de verificación:

```bash
node scripts/check-deployment-ready.js
```

---

## ✅ Siguiente paso

Una vez que tengas los 9 iconos PNG en `/public/icons/`:

1. **Commit los cambios:**
   ```bash
   git add public/icons/*.png
   git commit -m "feat: add PWA icons for all sizes"
   ```

2. **Push al repositorio:**
   ```bash
   git push origin main
   ```

3. **Deploy en Vercel:**
   - Sigue las instrucciones en `/DEPLOYMENT_INSTRUCTIONS.md`

---

## 🆘 Problemas comunes

### "No encuentro mi logo"
→ Usa el Método 2 (PWA Builder) con cualquier imagen cuadrada temporalmente. Puedes reemplazar los iconos después.

### "El generador React no funciona"
→ Usa el Método 2 (PWA Builder). Es la forma más confiable.

### "Los iconos se ven pixelados"
→ Asegúrate de que el logo original sea de al menos 512x512px. Si es más pequeño, upscalea primero con una herramienta como Photoshop o GIMP.

### "El script de Node.js da error"
→ No te preocupes, usa el Método 1 o 2. El script es opcional.

---

**Tiempo estimado:** 3-5 minutos  
**Recomendación:** Usa el Método 1 (React) o Método 2 (PWA Builder)
