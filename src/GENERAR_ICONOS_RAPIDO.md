# 🚀 GENERAR ICONOS PWA - GUÍA RÁPIDA

## ⚡ Método más rápido (2 minutos)

### Paso 1: Guarda tu logo

Tu logo ya está en el proyecto. Para guardarlo localmente:

**Opción A - Desde el proyecto corriendo:**
```bash
# 1. Inicia el servidor de desarrollo
npm run dev

# 2. Abre el navegador en http://localhost:5173
# 3. El logo aparecerá en la esquina superior
# 4. Click derecho en el logo → "Guardar imagen como..."
# 5. Guarda como: logo-gualán-market.png
```

**Opción B - Extrae directamente del asset:**
```bash
# El logo está embebido en el proyecto
# Copia el archivo desde Figma o usa el que está en el proyecto
```

### Paso 2: Genera los iconos online

Ve a: **https://www.pwabuilder.com/imageGenerator**

1. Click en **"Select Image"** o arrastra tu logo
2. Sube `logo-gualán-market.png`
3. Configuración recomendada:
   - **Padding**: 0% (sin padding)
   - **Background**: Transparent
   - **Maskable**: Activado ✓
4. Click en **"Generate"** 
5. Click en **"Download"**
6. Se descargará un ZIP con todos los iconos

### Paso 3: Copia los iconos al proyecto

```bash
# Descomprime el ZIP
cd ~/Downloads
unzip pwa-images.zip -d pwa-icons

# Ve a la carpeta de tu proyecto
cd /ruta/a/tu/proyecto

# Copia los iconos PNG
cp ~/Downloads/pwa-icons/android-chrome-*.png public/icons/
cp ~/Downloads/pwa-icons/icon-*.png public/icons/

# O manualmente:
# - Abre la carpeta ~/Downloads/pwa-icons
# - Copia todos los archivos .png
# - Pégalos en: public/icons/
```

### Paso 4: Renombra los iconos (si es necesario)

PWA Builder puede generar nombres diferentes. Necesitas estos 9 archivos:

```bash
cd public/icons

# Renombra si es necesario para que coincidan con estos nombres:
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

### Paso 5: Verifica que todo está listo

```bash
# Verifica que tienes los 9 iconos
ls -lh public/icons/*.png

# Ejecuta el verificador
node scripts/check-deployment-ready.js
```

Si todo está ✅, continúa al deployment.

---

## 🎨 Métodos Alternativos

### Método React (Automático)

Si prefieres generar los iconos directamente desde el código:

1. Abre `/components/IconGenerator.tsx` (ya está creado)
2. Agrega al final de `/App.tsx` (antes del `export default`):
   ```typescript
   import IconGenerator from './components/IconGenerator';
   
   // TEMPORAL: Generador de iconos
   if (window.location.pathname === '/generate-icons') {
     return <IconGenerator />;
   }
   ```
3. Corre: `npm run dev`
4. Abre: `http://localhost:5173/generate-icons`
5. Click en el botón verde
6. Se descargarán automáticamente los 9 PNG

### Método Python (Si tienes Python)

```bash
# 1. Instala Pillow
pip install Pillow

# 2. Guarda tu logo como:
#    public/logo-source.png

# 3. Ejecuta el script
python3 scripts/generate-icons.py
```

### Método HTML (Sin dependencias)

```bash
# 1. Abre en tu navegador:
open public/icons/generate-icons-from-logo.html

# 2. Click en el botón verde
# 3. Se descargarán los 9 iconos automáticamente
```

---

## 📋 Checklist Final

Antes de hacer deployment, verifica:

- [ ] Tienes 9 archivos PNG en `/public/icons/`
- [ ] Los nombres coinciden exactamente con los requeridos
- [ ] Los iconos se ven bien (no pixelados ni distorsionados)
- [ ] El `icon-192x192.png` y `icon-512x512.png` son críticos
- [ ] El `maskable-icon-512x512.png` tiene padding suficiente

```bash
# Verificador automático
node scripts/check-deployment-ready.js

# Si todo está ✅, haz commit
git add public/icons/*.png
git commit -m "feat: add PWA icons"
git push origin main
```

---

## 🆘 Solución de Problemas

### "No puedo guardar el logo desde el navegador"

→ Usa el método Python o el generador HTML. O toma un screenshot del logo y úsalo.

### "PWA Builder me da iconos con nombres diferentes"

→ No hay problema, solo renómbralos para que coincidan con los nombres requeridos.

### "Los iconos se ven pixelados"

→ Asegúrate de que el logo original sea de buena calidad (mínimo 512x512px).  
→ Si el logo es más pequeño, súbelo a una herramienta como [Upscale.media](https://www.upscale.media/) primero.

### "No tengo Python / Node.js / No funciona nada"

→ Usa PWA Builder (método online). Es la forma más confiable y no requiere instalación.

### "Ya generé los iconos pero fallan las verificaciones"

→ Asegúrate de que:
   - Los archivos están en `/public/icons/` (no en subcarpetas)
   - Los nombres coinciden exactamente (case-sensitive)
   - Son archivos PNG (no JPG ni otros formatos)
   - Tienen el tamaño correcto

---

## ⏱️ Resumen

**Tiempo estimado:** 2-5 minutos  
**Método recomendado:** PWA Builder (online)  
**Dificultad:** ⭐ Muy fácil  
**Importancia:** 🚨 CRÍTICA para el deployment

---

## ✅ Siguiente Paso

Una vez que tengas los 9 iconos PNG listos:

→ Lee: `/DEPLOYMENT_INSTRUCTIONS.md`  
→ O ejecuta: `node scripts/check-deployment-ready.js`
