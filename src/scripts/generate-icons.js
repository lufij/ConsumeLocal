/**
 * Script para generar iconos de la PWA
 * Ejecutar con: node scripts/generate-icons.js
 * 
 * Nota: Si este script falla, usa el generador HTML en /public/icons/icon-generator.html
 * o genera los iconos manualmente con PWA Builder: https://www.pwabuilder.com/imageGenerator
 */

const fs = require('fs');
const path = require('path');

// Tamaños de iconos requeridos
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Crear directorio de iconos si no existe
const iconsDir = path.join(__dirname, '../public/icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Función para crear SVG de icono
function createIconSVG(size) {
  const padding = size * 0.15;
  const iconWidth = size - (padding * 2);
  const iconHeight = iconWidth * 0.75;
  const strokeWidth = size * 0.08;
  const circleRadius = size * 0.08;
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#10b981;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#059669;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Fondo con degradado -->
  <rect width="${size}" height="${size}" fill="url(#gradient)"/>
  
  <!-- Icono de tienda/carrito -->
  <g stroke="white" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" fill="none">
    <!-- Rectángulo principal -->
    <rect x="${padding}" y="${padding * 1.3}" width="${iconWidth}" height="${iconHeight}" rx="${size * 0.08}"/>
    
    <!-- Línea superior -->
    <line x1="${padding}" y1="${padding * 1.8}" x2="${size - padding}" y2="${padding * 1.8}"/>
    
    <!-- Handle superior -->
    <line x1="${size / 2}" y1="${padding * 1.3}" x2="${size / 2}" y2="${padding * 1.8}"/>
  </g>
  
  <!-- Círculos del carrito -->
  <circle cx="${padding + iconWidth * 0.3}" cy="${size - padding * 0.8}" r="${circleRadius}" fill="white"/>
  <circle cx="${padding + iconWidth * 0.7}" cy="${size - padding * 0.8}" r="${circleRadius}" fill="white"/>
  
  <!-- Texto pequeño para desarrollo -->
  ${size >= 192 ? `<text x="${size / 2}" y="${size * 0.55}" font-family="Arial" font-size="${size * 0.15}" fill="white" text-anchor="middle" font-weight="bold">GM</text>` : ''}
</svg>`;
}

console.log('🎨 Generando iconos de la PWA...\n');

// Generar iconos SVG (que servirán como placeholder hasta tener PNG reales)
sizes.forEach(size => {
  const svg = createIconSVG(size);
  const filename = `icon-${size}x${size}.svg`;
  const filepath = path.join(iconsDir, filename);
  
  fs.writeFileSync(filepath, svg);
  console.log(`✅ Generado: ${filename}`);
});

// Generar icono maskable
const maskableSVG = createIconSVG(512);
fs.writeFileSync(path.join(iconsDir, 'maskable-icon-512x512.svg'), maskableSVG);
console.log('✅ Generado: maskable-icon-512x512.svg');

console.log('\n⚠️  IMPORTANTE: Estos son archivos SVG temporales.');
console.log('📝 Para generar PNG reales, usa una de estas opciones:\n');
console.log('   1. Abre /public/icons/icon-generator.html en tu navegador');
console.log('   2. Usa PWA Builder: https://www.pwabuilder.com/imageGenerator');
console.log('   3. Convierte los SVG a PNG con una herramienta online\n');
console.log('✨ Los archivos SVG funcionarán temporalmente, pero PNG es mejor para PWAs.\n');
