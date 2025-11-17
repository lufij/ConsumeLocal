# 🛠️ Scripts de Utilidad - Gualán Market

Esta carpeta contiene scripts útiles para el desarrollo y deployment de Gualán Market.

---

## 📝 Scripts Disponibles

### 1. `check-deployment-ready.js`
**Propósito**: Verificar que todos los archivos críticos estén presentes antes del deployment.

**Uso**:
```bash
node scripts/check-deployment-ready.js
# o
npm run check-deployment
```

**Lo que verifica**:
- ✅ Archivos de configuración (package.json, vite.config.ts, etc.)
- ✅ Archivos de la aplicación (App.tsx, components/, etc.)
- ✅ Archivos de PWA (manifest.json, service-worker.js)
- ✅ **Iconos PNG (9 archivos) - CRÍTICO**
- ✅ Variables de entorno (.env)
- ✅ Backend (Supabase Edge Functions)

**Salida**:
```bash
# Si todo está listo:
✅ ¡TODO LISTO PARA DEPLOYMENT!

# Si falta algo:
❌ Encontrados X errores críticos
⚠️  Encontradas X advertencias
```

---

### 2. `generate-icons.js`
**Propósito**: Generar iconos SVG temporales para la PWA.

**Uso**:
```bash
node scripts/generate-icons.js
# o
npm run generate-icons
```

**Lo que genera**:
```
/public/icons/
├── icon-72x72.svg
├── icon-96x96.svg
├── icon-128x128.svg
├── icon-144x144.svg
├── icon-152x152.svg
├── icon-192x192.svg
├── icon-384x384.svg
├── icon-512x512.svg
└── maskable-icon-512x512.svg
```

**⚠️ IMPORTANTE**: 
- Este script genera archivos **SVG**, no PNG
- Los iconos PNG son mejores para PWAs
- Usa los SVG como última opción temporal
- Mejor usa PWA Builder: https://www.pwabuilder.com/imageGenerator

---

### 3. `create-placeholder-icons.sh`
**Propósito**: Generar iconos PNG usando ImageMagick.

**Pre-requisitos**:
```bash
# macOS
brew install imagemagick

# Ubuntu/Debian
sudo apt-get install imagemagick

# Windows
# Descargar de: https://imagemagick.org/script/download.php
```

**Uso**:
```bash
# Dar permisos de ejecución (primera vez)
chmod +x scripts/create-placeholder-icons.sh

# Ejecutar
./scripts/create-placeholder-icons.sh
```

**Lo que genera**:
```
/public/icons/
├── icon-72x72.png ✅
├── icon-96x96.png ✅
├── icon-128x128.png ✅
├── icon-144x144.png ✅
├── icon-152x152.png ✅
├── icon-192x192.png ✅
├── icon-384x384.png ✅
├── icon-512x512.png ✅
└── maskable-icon-512x512.png ✅
```

**Si ImageMagick no está instalado**:
```
⚠️  El script mostrará un error y sugerirá alternativas:
- Usar public/icons/icon-generator.html
- Usar PWA Builder
```

---

## 🚀 Flujo de Trabajo Recomendado

### Antes del Deployment:

1. **Generar iconos PNG**:
   ```bash
   # Opción A: PWA Builder (mejor)
   # https://www.pwabuilder.com/imageGenerator
   
   # Opción B: Script bash (si tienes ImageMagick)
   ./scripts/create-placeholder-icons.sh
   
   # Opción C: Generador HTML
   # Abre: public/icons/icon-generator.html
   ```

2. **Verificar todo**:
   ```bash
   npm run check-deployment
   ```

3. **Si hay errores, resolverlos según las instrucciones**

4. **Continuar con el deployment**

---

## 📊 Interpretando los Resultados

### Script: check-deployment-ready.js

#### ✅ Éxito:
```
✅ ¡TODO LISTO PARA DEPLOYMENT!

Próximos pasos:
1. git add .
2. git commit -m "Ready for deployment"
3. git push origin main
4. Deploye en Vercel desde el dashboard
```
**Acción**: Procede al deployment

#### ❌ Errores Críticos:
```
❌ FALTA (CRÍTICO): Iconos PNG: public/icons/icon-192x192.png
❌ FALTA (CRÍTICO): Variables de entorno: .env
```
**Acción**: Resuelve los errores antes de continuar

#### ⚠️ Advertencias:
```
⚠️  FALTA (Opcional): Variables de entorno locales
```
**Acción**: No bloquean el deployment, pero son recomendadas

---

## 🐛 Troubleshooting

### Error: "command not found: node"
**Problema**: Node.js no está instalado

**Solución**:
```bash
# Descargar de: https://nodejs.org/
# O usar nvm:
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
```

### Error: "Cannot find module"
**Problema**: Dependencias no instaladas

**Solución**:
```bash
npm install
```

### Error: "Permission denied: ./scripts/create-placeholder-icons.sh"
**Problema**: El script no tiene permisos de ejecución

**Solución**:
```bash
chmod +x scripts/create-placeholder-icons.sh
./scripts/create-placeholder-icons.sh
```

### Error: "convert: command not found"
**Problema**: ImageMagick no está instalado

**Solución**:
```bash
# Instala ImageMagick
brew install imagemagick  # macOS
sudo apt-get install imagemagick  # Linux

# O usa alternativas:
# - PWA Builder
# - Generador HTML
```

### Los iconos SVG no funcionan en la PWA
**Problema**: Los navegadores móviles prefieren PNG para PWA

**Solución**:
- Usa PWA Builder: https://www.pwabuilder.com/imageGenerator
- O convierte los SVG a PNG con una herramienta online

---

## 📚 Documentación Relacionada

- **Deployment completo**: `/DEPLOYMENT_INSTRUCTIONS.md`
- **Pasos críticos**: `/CRITICAL_DEPLOYMENT_STEPS.md`
- **Guía rápida**: `/START_DEPLOYMENT.md`
- **Generar iconos**: `/public/icons/GENERATE_ICONS_NOW.md`
- **Checklist visual**: `/CHECKLIST_VISUAL_DEPLOYMENT.md`

---

## 🔄 Actualizar Scripts

Si necesitas modificar los scripts:

1. Edita el archivo correspondiente
2. Prueba localmente:
   ```bash
   node scripts/nombre-del-script.js
   ```
3. Si funciona, haz commit:
   ```bash
   git add scripts/nombre-del-script.js
   git commit -m "Update: descripción del cambio"
   ```

---

## 🆘 Soporte

Si tienes problemas con los scripts:

1. Verifica que Node.js esté instalado: `node --version`
2. Verifica que las dependencias estén instaladas: `npm list`
3. Lee el error completo y busca en la documentación
4. Usa las alternativas sugeridas (PWA Builder, generador HTML)

---

**Última actualización**: Hoy  
**Mantenedor**: Gualán Market Team  
**Licencia**: MIT
