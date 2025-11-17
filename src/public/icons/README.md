# Iconos de Gualán Market PWA

## 🚨 IMPORTANTE: Los iconos PNG son obligatorios para el deployment

Sin estos 9 archivos PNG, la PWA no funcionará en dispositivos móviles.

## 📱 Iconos Necesarios

Esta carpeta debe contener los siguientes iconos para que la PWA funcione correctamente:

### Iconos estándar:
- `icon-72x72.png` (72x72px)
- `icon-96x96.png` (96x96px)
- `icon-128x128.png` (128x128px)
- `icon-144x144.png` (144x144px)
- `icon-152x152.png` (152x152px)
- `icon-192x192.png` (192x192px) - **CRÍTICO**
- `icon-384x384.png` (384x384px)
- `icon-512x512.png` (512x512px) - **CRÍTICO**

### Iconos especiales:
- `maskable-icon-512x512.png` (512x512px) - Para Android adaptativo

## ⚡ Generar los Iconos AHORA

### 🥇 MÉTODO RECOMENDADO: PWA Builder (2 minutos)

1. **Extrae el logo actual del proyecto:**
   - Corre: `npm run dev`
   - Abre: `http://localhost:5173`
   - Click derecho en el logo → "Guardar imagen como..."
   - O toma un screenshot del logo

2. **Genera los iconos:**
   - Ve a: **https://www.pwabuilder.com/imageGenerator**
   - Sube el logo
   - Click en "Generate" → "Download"

3. **Copia los iconos al proyecto:**
   ```bash
   cp ~/Downloads/pwa-icons/*.png public/icons/
   ```

### 🥈 MÉTODO ALTERNATIVO: Componente React

1. Abre: `/components/IconGenerator.tsx` (ya está creado con tu logo)
2. Agrega ruta temporal al final de `/App.tsx`:
   ```typescript
   import IconGenerator from './components/IconGenerator';
   if (window.location.pathname === '/generate-icons') {
     return <IconGenerator />;
   }
   ```
3. Corre: `npm run dev` y abre: `http://localhost:5173/generate-icons`
4. Click en el botón verde → Se descargarán los 9 PNG

### 🥉 MÉTODO PYTHON (Si tienes Python instalado)

```bash
# 1. Instala Pillow
pip install Pillow

# 2. Guarda tu logo como: public/logo-source.png

# 3. Ejecuta
python3 scripts/generate-icons.py
```

## 📋 Verificar que están listos

```bash
# Ver los iconos
ls -lh public/icons/*.png

# Verificador automático
node scripts/check-deployment-ready.js
```

## 🎨 Diseño del Logo Actual

El logo de Gualán Market incluye:
- **Hourglass amarillo** con vegetales (tomate, zanahoria, berenjena, etc.)
- **Fondo verde oscuro** (#1e4620)
- **Texto**: "CONSUME LOCAL GUALÁN"

Este diseño ya está perfectamente optimizado para PWA.

## 📝 Documentación Completa

- **Guía rápida**: `/GENERAR_ICONOS_RAPIDO.md`
- **Instrucciones detalladas**: `GENERAR_ICONOS_CON_TU_LOGO.md` (en esta carpeta)
- **Instrucciones críticas**: `GENERATE_ICONS_NOW.md` (en esta carpeta)

## ✅ Siguiente Paso

Una vez que tengas los 9 PNG:
1. Verifica: `node scripts/check-deployment-ready.js`
2. Commit: `git add public/icons/*.png && git commit -m "feat: add PWA icons"`
3. Push: `git push origin main`
4. Deploy siguiendo: `/DEPLOYMENT_INSTRUCTIONS.md`

---

**⏱️ Tiempo estimado:** 2-5 minutos  
**🚨 Importancia:** CRÍTICA - Bloquea el deployment  
**⭐ Dificultad:** Muy fácil