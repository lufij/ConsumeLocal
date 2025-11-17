/**
 * Script de verificación pre-deployment
 * Verifica que todos los archivos críticos estén presentes
 * 
 * Ejecutar con: node scripts/check-deployment-ready.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verificando archivos críticos para deployment...\n');

let errors = 0;
let warnings = 0;

// Función auxiliar para verificar archivos
function checkFile(filePath, description, required = true) {
  const fullPath = path.join(__dirname, '..', filePath);
  if (fs.existsSync(fullPath)) {
    console.log(`✅ ${description}: ${filePath}`);
    return true;
  } else {
    if (required) {
      console.error(`❌ FALTA (CRÍTICO): ${description}: ${filePath}`);
      errors++;
    } else {
      console.warn(`⚠️  FALTA (Opcional): ${description}: ${filePath}`);
      warnings++;
    }
    return false;
  }
}

// Función para verificar directorio
function checkDirectory(dirPath, description) {
  const fullPath = path.join(__dirname, '..', dirPath);
  if (fs.existsSync(fullPath) && fs.statSync(fullPath).isDirectory()) {
    console.log(`✅ ${description}: ${dirPath}`);
    return true;
  } else {
    console.error(`❌ FALTA (CRÍTICO): ${description}: ${dirPath}`);
    errors++;
    return false;
  }
}

// Función para contar archivos en un directorio
function countFiles(dirPath, extension) {
  const fullPath = path.join(__dirname, '..', dirPath);
  if (!fs.existsSync(fullPath)) return 0;
  
  const files = fs.readdirSync(fullPath);
  return files.filter(f => f.endsWith(extension)).length;
}

console.log('📦 ARCHIVOS DE CONFIGURACIÓN:');
console.log('─'.repeat(50));
checkFile('package.json', 'Dependencias y scripts');
checkFile('vite.config.ts', 'Configuración de Vite');
checkFile('tsconfig.json', 'Configuración de TypeScript');
checkFile('tsconfig.node.json', 'TypeScript para Node');
checkFile('index.html', 'HTML principal');
checkFile('.gitignore', 'Archivos a ignorar en Git');
checkFile('.env.example', 'Plantilla de variables de entorno');
checkFile('vercel.json', 'Configuración de Vercel');
checkFile('.eslintrc.cjs', 'Configuración de ESLint', false);

console.log('\n🚀 ARCHIVOS DE LA APLICACIÓN:');
console.log('─'.repeat(50));
checkFile('App.tsx', 'Componente principal');
checkFile('src/main.tsx', 'Punto de entrada');
checkDirectory('components', 'Directorio de componentes');
checkDirectory('utils', 'Directorio de utilidades');
checkDirectory('styles', 'Directorio de estilos');
checkFile('styles/globals.css', 'Estilos globales');

console.log('\n📱 ARCHIVOS DE PWA:');
console.log('─'.repeat(50));
checkFile('public/manifest.json', 'Manifest de PWA');
checkFile('public/service-worker.js', 'Service Worker');
checkDirectory('public/icons', 'Directorio de iconos');

// Verificar iconos PNG
console.log('\n🎨 ICONOS PNG (CRÍTICO PARA PWA):');
console.log('─'.repeat(50));

const requiredIcons = [
  'icon-72x72.png',
  'icon-96x96.png',
  'icon-128x128.png',
  'icon-144x144.png',
  'icon-152x152.png',
  'icon-192x192.png',
  'icon-384x384.png',
  'icon-512x512.png',
  'maskable-icon-512x512.png'
];

let iconsFound = 0;
requiredIcons.forEach(icon => {
  const iconPath = `public/icons/${icon}`;
  if (checkFile(iconPath, `Icono PWA`, true)) {
    iconsFound++;
  }
});

console.log(`\nIconos encontrados: ${iconsFound}/${requiredIcons.length}`);

if (iconsFound < requiredIcons.length) {
  console.error('\n⚠️  ACCIÓN REQUERIDA: Faltan iconos PNG');
  console.log('   📖 LEE PRIMERO: /LEER_PRIMERO_ICONOS.md');
  console.log('   📝 Guía paso a paso: /ICONOS_PASO_A_PASO.md');
  console.log('');
  console.log('   🥇 MÉTODO RECOMENDADO (3 min):');
  console.log('   1. Corre: npm run dev');
  console.log('   2. Abre http://localhost:5173');
  console.log('   3. Click derecho en el logo → Guardar imagen');
  console.log('   4. Ve a: https://www.pwabuilder.com/imageGenerator');
  console.log('   5. Sube el logo → Generate → Download');
  console.log('   6. Copia los PNG a public/icons/');
  console.log('');
  console.log('   🥈 MÉTODO ALTERNATIVO (React):');
  console.log('   1. Agrega ruta temporal en App.tsx (ver ICONOS_PASO_A_PASO.md)');
  console.log('   2. Abre http://localhost:5173/generate-icons');
  console.log('   3. Click en el botón verde → Descarga automática');
}

console.log('\n🔐 VARIABLES DE ENTORNO:');
console.log('─'.repeat(50));

const envExists = checkFile('.env', 'Variables de entorno locales', false);
if (!envExists) {
  console.warn('   ⚠️  Crea un archivo .env basado en .env.example');
  console.warn('   Necesario para desarrollo local y testing');
  warnings++;
}

console.log('\n🏗️  BACKEND (SUPABASE):');
console.log('─'.repeat(50));
checkFile('supabase/functions/server/index.tsx', 'Edge Function principal');
checkFile('supabase/functions/server/kv_store.tsx', 'KV Store helper');

// Resumen final
console.log('\n' + '='.repeat(50));
console.log('📊 RESUMEN:');
console.log('='.repeat(50));

if (errors === 0 && iconsFound === requiredIcons.length) {
  console.log('✅ ¡TODO LISTO PARA DEPLOYMENT!');
  console.log('\nPróximos pasos:');
  console.log('1. git add .');
  console.log('2. git commit -m "Ready for deployment"');
  console.log('3. git push origin main');
  console.log('4. Deploye en Vercel desde el dashboard');
  console.log('\n📖 Lee DEPLOYMENT_INSTRUCTIONS.md para más detalles');
  process.exit(0);
} else {
  console.error(`\n❌ Encontrados ${errors} errores cr��ticos`);
  console.warn(`⚠️  Encontradas ${warnings} advertencias`);
  
  if (iconsFound < requiredIcons.length) {
    console.error('\n🚨 BLOQUEADOR: Faltan iconos PNG de la PWA');
    console.log('   Sin estos iconos, la PWA no funcionará correctamente.');
  }
  
  console.log('\n📖 Lee CRITICAL_DEPLOYMENT_STEPS.md para resolver estos problemas');
  process.exit(1);
}