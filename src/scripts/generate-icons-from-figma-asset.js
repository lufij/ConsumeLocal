#!/usr/bin/env node

/**
 * Script para generar iconos PWA desde el asset de Figma
 * 
 * IMPORTANTE: Este script requiere que primero extraigas el logo desde Figma
 * y lo coloques en /public/logo-source.png
 * 
 * Para extraer el logo:
 * 1. Corre el proyecto: npm run dev
 * 2. Abre http://localhost:5173 en el navegador
 * 3. Abre DevTools (F12) → Network
 * 4. Recarga la página
 * 5. Busca el archivo f363da58c695d80309a491d46687c31d09664423.png
 * 6. Click derecho → Open in new tab
 * 7. Guarda como /public/logo-source.png
 * 
 * Luego ejecuta: node scripts/generate-icons-from-figma-asset.js
 */

const fs = require('fs');
const path = require('path');
const { createCanvas, loadImage } = require('canvas');

// Configuración
const LOGO_PATH = path.join(__dirname, '../public/logo-source.png');
const OUTPUT_DIR = path.join(__dirname, '../public/icons');

const ICON_SIZES = [
  { size: 72, name: 'icon-72x72.png' },
  { size: 96, name: 'icon-96x96.png' },
  { size: 128, name: 'icon-128x128.png' },
  { size: 144, name: 'icon-144x144.png' },
  { size: 152, name: 'icon-152x152.png' },
  { size: 192, name: 'icon-192x192.png' },
  { size: 384, name: 'icon-384x384.png' },
  { size: 512, name: 'icon-512x512.png' },
  { size: 512, name: 'maskable-icon-512x512.png', maskable: true }
];

// Verificar que existe el logo
if (!fs.existsSync(LOGO_PATH)) {
  console.error('❌ ERROR: No se encontró el logo en:', LOGO_PATH);
  console.log('\n📝 Para extraer el logo:');
  console.log('1. Corre el proyecto: npm run dev');
  console.log('2. Abre http://localhost:5173 en el navegador');
  console.log('3. Abre DevTools (F12) → Network');
  console.log('4. Recarga la página');
  console.log('5. Busca el archivo .png del logo');
  console.log('6. Click derecho → Open in new tab');
  console.log('7. Guarda como: public/logo-source.png');
  console.log('\n💡 O usa el método alternativo:');
  console.log('   - Ve a: https://www.pwabuilder.com/imageGenerator');
  console.log('   - Sube tu logo');
  console.log('   - Descarga los iconos generados\n');
  process.exit(1);
}

// Crear directorio de salida si no existe
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function generateIcon(image, size, maskable = false) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  if (maskable) {
    // Para maskable, agregar padding del 10%
    const padding = size * 0.1;
    const imageSize = size - (padding * 2);
    
    // Fondo verde oscuro (color del logo)
    ctx.fillStyle = '#1e4620';
    ctx.fillRect(0, 0, size, size);
    
    ctx.drawImage(image, padding, padding, imageSize, imageSize);
  } else {
    // Sin padding para iconos normales
    ctx.drawImage(image, 0, 0, size, size);
  }

  return canvas.toBuffer('image/png');
}

async function generateAllIcons() {
  console.log('🎨 Generando iconos PWA desde tu logo...\n');
  console.log(`📂 Logo: ${LOGO_PATH}`);
  console.log(`📂 Destino: ${OUTPUT_DIR}\n`);

  try {
    // Cargar imagen
    console.log('⏳ Cargando logo...');
    const image = await loadImage(LOGO_PATH);
    console.log(`✅ Logo cargado: ${image.width}x${image.height}px\n`);

    // Generar cada icono
    for (const { size, name, maskable } of ICON_SIZES) {
      const outputPath = path.join(OUTPUT_DIR, name);
      const buffer = await generateIcon(image, size, maskable);
      
      fs.writeFileSync(outputPath, buffer);
      console.log(`✅ Generado: ${name} (${size}x${size}px)`);
    }

    console.log('\n✨ ¡Todos los iconos generados exitosamente!');
    console.log('\n📋 Próximos pasos:');
    console.log('1. Verifica los iconos: ls -lh public/icons/*.png');
    console.log('2. Verifica el deployment: node scripts/check-deployment-ready.js');
    console.log('3. Haz commit: git add public/icons/*.png');
    console.log('4. Push: git push origin main');
    console.log('5. Deploy en Vercel siguiendo: DEPLOYMENT_INSTRUCTIONS.md\n');

  } catch (error) {
    console.error('❌ Error generando iconos:', error.message);
    console.log('\n💡 Alternativa: Usa PWA Builder');
    console.log('   https://www.pwabuilder.com/imageGenerator\n');
    process.exit(1);
  }
}

// Verificar si canvas está disponible
try {
  require.resolve('canvas');
  generateAllIcons();
} catch (error) {
  console.log('⚠️  El paquete "canvas" no está instalado.');
  console.log('\n🔧 Para instalar canvas:');
  console.log('   npm install --save-dev canvas');
  console.log('\n💡 O usa una alternativa más simple:');
  console.log('   1. Abre: public/icons/generate-icons-from-logo.html');
  console.log('   2. O usa: https://www.pwabuilder.com/imageGenerator\n');
  process.exit(1);
}
