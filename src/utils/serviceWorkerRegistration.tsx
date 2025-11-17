// Service Worker Registration con manejo mejorado de errores
// Para entornos donde el Service Worker no está disponible

// Nota: En algunos entornos (como Figma Make), los Service Workers no están soportados
// debido a restricciones de seguridad. Sin embargo, la PWA puede instalarse y funcionar
// sin Service Worker, solo sin capacidades offline y notificaciones push.

export async function checkAndRegisterServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) {
    console.log('ℹ️ Service Worker no soportado en este navegador');
    return null;
  }

  // En este entorno, los Service Workers no están disponibles por restricciones de seguridad
  // La app funcionará como PWA instalable pero sin capacidades offline
  console.log('ℹ️ Service Worker deshabilitado en este entorno');
  console.log('✅ La PWA es instalable y funcional sin Service Worker');
  console.log('⚠️ Capacidades offline y notificaciones push no disponibles (requieren SW)');
  
  return null;
}

// Mantener estas funciones por compatibilidad pero no hacen nada
export async function registerInlineServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  return null;
}