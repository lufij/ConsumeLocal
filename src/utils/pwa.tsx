// Utilidades para Progressive Web App (PWA)
// Registro de Service Worker, detección de instalación, etc.

export type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

export type PWAInstallPromptState = {
  canInstall: boolean;
  promptEvent: BeforeInstallPromptEvent | null;
  isInstalled: boolean;
  isStandalone: boolean;
  platform: 'android' | 'ios' | 'desktop' | 'unknown';
};

// Detectar si la app está instalada (modo standalone)
export function isAppInstalled(): boolean {
  // @ts-ignore - matchMedia standalone
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
  // @ts-ignore - navigator.standalone para iOS
  const isIOSStandalone = window.navigator.standalone === true;
  
  return isStandalone || isIOSStandalone;
}

// Detectar plataforma del usuario
export function detectPlatform(): 'android' | 'ios' | 'desktop' | 'unknown' {
  const userAgent = window.navigator.userAgent.toLowerCase();
  
  if (/android/.test(userAgent)) {
    return 'android';
  }
  
  if (/iphone|ipad|ipod/.test(userAgent)) {
    return 'ios';
  }
  
  if (/windows|macintosh|linux/.test(userAgent)) {
    return 'desktop';
  }
  
  return 'unknown';
}

// Verificar si el navegador soporta PWA
export function isPWASupported(): boolean {
  return 'serviceWorker' in navigator && 'PushManager' in window;
}

// Registrar Service Worker
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) {
    console.log('ℹ️ Service Worker no soportado en este navegador');
    return null;
  }

  try {
    console.log('📱 Registrando Service Worker...');
    
    const registration = await navigator.serviceWorker.register('/service-worker.js', {
      scope: '/',
    });

    console.log('✅ Service Worker registrado correctamente');

    // Verificar actualizaciones
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      console.log('🔄 Nueva versión del Service Worker disponible');

      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            console.log('✨ Nueva versión lista. Recarga la página para actualizar.');
            // Aquí se puede mostrar un mensaje al usuario para recargar
          }
        });
      }
    });

    return registration;
  } catch (error) {
    // Solo mostrar error si no es 404 (en preview puede que no exista)
    if (error instanceof Error && !error.message.includes('404')) {
      console.error('❌ Error al registrar Service Worker:', error);
    } else {
      console.log('ℹ️ Service Worker no disponible (esperado en preview)');
    }
    console.log('ℹ️ La app funcionará sin Service Worker (sin cache offline)');
    return null;
  }
}

// Desregistrar Service Worker (para debugging)
export async function unregisterServiceWorker(): Promise<boolean> {
  if (!('serviceWorker' in navigator)) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration) {
      const success = await registration.unregister();
      console.log('🗑️ Service Worker desregistrado:', success);
      return success;
    }
    return false;
  } catch (error) {
    console.error('❌ Error al desregistrar Service Worker:', error);
    return false;
  }
}

// Verificar si se puede mostrar el prompt de instalación
export function canShowInstallPrompt(): boolean {
  const platform = detectPlatform();
  const isInstalled = isAppInstalled();
  
  // No mostrar si ya está instalada
  if (isInstalled) {
    return false;
  }
  
  // Android: Esperar evento beforeinstallprompt
  // iOS: Siempre mostrar instrucciones manuales
  // Desktop: Depende del navegador
  return platform === 'android' || platform === 'ios';
}

// Guardar información de instalación en localStorage
export function saveInstallationState(installed: boolean): void {
  const state = {
    installed,
    installedAt: new Date().toISOString(),
    platform: detectPlatform(),
  };
  
  localStorage.setItem('pwa_installation_state', JSON.stringify(state));
}

// Obtener información de instalación
export function getInstallationState(): { installed: boolean; installedAt: string | null; platform: string } | null {
  const stateStr = localStorage.getItem('pwa_installation_state');
  if (!stateStr) {
    return null;
  }
  
  try {
    return JSON.parse(stateStr);
  } catch {
    return null;
  }
}

// Marcar que el usuario rechazó la instalación
export function saveInstallPromptDismissed(): void {
  const dismissData = {
    dismissed: true,
    dismissedAt: new Date().toISOString(),
    count: getInstallPromptDismissCount() + 1,
  };
  
  localStorage.setItem('pwa_install_prompt_dismissed', JSON.stringify(dismissData));
}

// Obtener cuántas veces el usuario ha rechazado
export function getInstallPromptDismissCount(): number {
  const dismissStr = localStorage.getItem('pwa_install_prompt_dismissed');
  if (!dismissStr) {
    return 0;
  }
  
  try {
    const data = JSON.parse(dismissStr);
    return data.count || 0;
  } catch {
    return 0;
  }
}

// Verificar si debemos mostrar el prompt de instalación
// (no molestar si el usuario lo ha rechazado muchas veces)
export function shouldShowInstallPrompt(): boolean {
  const dismissCount = getInstallPromptDismissCount();
  const isInstalled = isAppInstalled();
  
  // No mostrar si ya está instalada
  if (isInstalled) {
    return false;
  }
  
  // No mostrar si el usuario lo ha rechazado más de 3 veces
  if (dismissCount >= 3) {
    return false;
  }
  
  return canShowInstallPrompt();
}

// Detectar si el dispositivo tiene suficiente espacio (heurística básica)
export async function checkStorageSpace(): Promise<{ available: boolean; quota?: number; usage?: number }> {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    try {
      const estimate = await navigator.storage.estimate();
      const available = estimate.quota && estimate.usage 
        ? (estimate.quota - estimate.usage) > 50 * 1024 * 1024 // 50MB mínimo
        : true;
      
      return {
        available,
        quota: estimate.quota,
        usage: estimate.usage,
      };
    } catch {
      return { available: true };
    }
  }
  
  return { available: true };
}

// Verificar estado de la conexión
export function getNetworkStatus(): 'online' | 'offline' | 'slow' {
  if (!navigator.onLine) {
    return 'offline';
  }
  
  // @ts-ignore - connection API experimental
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  
  if (connection) {
    const type = connection.effectiveType;
    if (type === 'slow-2g' || type === '2g') {
      return 'slow';
    }
  }
  
  return 'online';
}

// Listener para cambios de red
export function addNetworkListener(callback: (status: 'online' | 'offline') => void): () => void {
  const handleOnline = () => callback('online');
  const handleOffline = () => callback('offline');
  
  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);
  
  // Retornar función para remover listeners
  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
}

// Log de información PWA (debugging)
export function logPWAInfo(): void {
  console.group('📱 PWA Information');
  console.log('Platform:', detectPlatform());
  console.log('Installed:', isAppInstalled());
  console.log('PWA Supported:', isPWASupported());
  console.log('Network:', getNetworkStatus());
  console.log('Installation State:', getInstallationState());
  console.log('Dismiss Count:', getInstallPromptDismissCount());
  console.groupEnd();
}