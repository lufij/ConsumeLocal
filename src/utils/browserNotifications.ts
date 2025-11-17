/**
 * Sistema de Notificaciones del Navegador para Gualán Market
 * Si hay service worker activo, usa service worker notifications (persisten cuando app está cerrada)
 * Si no, usa Notification API directamente
 */

export type NotificationPermission = 'default' | 'granted' | 'denied';

export interface NotificationSettings {
  enabled: boolean;
  orders: boolean;
  messages: boolean;
  favorites: boolean;
  priceAdjustments: boolean;
  soundEnabled: boolean;
}

const SETTINGS_KEY = 'gm_notification_settings';
const DEFAULT_SETTINGS: NotificationSettings = {
  enabled: true,
  orders: true,
  messages: true,
  favorites: true,
  priceAdjustments: true,
  soundEnabled: true,
};

/**
 * Verifica si las notificaciones del navegador están soportadas
 */
export function isNotificationSupported(): boolean {
  return 'Notification' in window;
}

/**
 * Obtiene el estado actual de permisos de notificaciones
 */
export function getNotificationPermission(): NotificationPermission {
  if (!isNotificationSupported()) return 'denied';
  return Notification.permission as NotificationPermission;
}

/**
 * Solicita permiso para mostrar notificaciones del navegador
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!isNotificationSupported()) {
    console.warn('⚠️ Notificaciones no soportadas en este navegador');
    return 'denied';
  }

  try {
    const permission = await Notification.requestPermission();
    console.log(`📬 Permiso de notificaciones: ${permission}`);
    return permission as NotificationPermission;
  } catch (error) {
    console.error('❌ Error solicitando permiso de notificaciones:', error);
    return 'denied';
  }
}

/**
 * Obtiene la configuración de notificaciones del usuario
 */
export function getNotificationSettings(): NotificationSettings {
  try {
    const saved = localStorage.getItem(SETTINGS_KEY);
    if (saved) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
    }
    return DEFAULT_SETTINGS;
  } catch (error) {
    console.error('❌ Error cargando configuración de notificaciones:', error);
    return DEFAULT_SETTINGS;
  }
}

/**
 * Guarda la configuración de notificaciones
 */
export function saveNotificationSettings(settings: NotificationSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    console.log('✅ Configuración de notificaciones guardada');
  } catch (error) {
    console.error('❌ Error guardando configuración de notificaciones:', error);
  }
}

/**
 * Verifica si un tipo de notificación está habilitado
 */
export function isNotificationTypeEnabled(type: 'order' | 'message' | 'favorite' | 'order_confirmed' | 'price_adjusted'): boolean {
  const settings = getNotificationSettings();
  
  if (!settings.enabled) return false;

  switch (type) {
    case 'order':
    case 'order_confirmed':
      return settings.orders;
    case 'message':
      return settings.messages;
    case 'favorite':
      return settings.favorites;
    case 'price_adjusted':
      return settings.priceAdjustments;
    default:
      return true;
  }
}

/**
 * Reproduce un sonido de notificación (opcional)
 */
export function playNotificationSound(): void {
  const settings = getNotificationSettings();
  if (!settings.soundEnabled) return;

  try {
    // Audio simple usando AudioContext para generar un tono
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800; // Frecuencia en Hz
    oscillator.type = 'sine'; // Tipo de onda

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime); // Volumen
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  } catch (error) {
    console.warn('⚠️ No se pudo reproducir sonido de notificación:', error);
  }
}

/**
 * Muestra una notificación del navegador
 * Si hay service worker activo, usa service worker notifications (persisten cuando app está cerrada)
 * Si no, usa Notification API directamente
 */
export function showBrowserNotification(
  title: string,
  options: {
    body: string;
    icon?: string;
    badge?: string;
    tag?: string;
    data?: any;
    requireInteraction?: boolean;
  }
): Notification | null {
  // Verificar soporte
  if (!isNotificationSupported()) {
    console.warn('⚠️ Notificaciones no soportadas');
    return null;
  }

  // Verificar permisos
  if (Notification.permission !== 'granted') {
    console.warn('⚠️ Permiso de notificaciones no concedido');
    return null;
  }

  try {
    // Icono y badge por defecto de Gualán Market
    const icon = options.icon || getDefaultNotificationIcon();
    const badge = options.badge || getDefaultNotificationBadge();

    const notificationOptions = {
      ...options,
      icon,
      badge,
      vibrate: [200, 100, 200], // Patrón de vibración
    };

    // Intentar usar Service Worker si está disponible (persiste cuando app está cerrada)
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.showNotification(title, notificationOptions);
        console.log('📬 Notificación mostrada vía Service Worker:', title);
      });
      
      // Reproducir sonido
      playNotificationSound();
      
      return null; // Service Worker notifications no retornan objeto Notification
    }

    // Fallback: usar Notification API directamente
    const notification = new Notification(title, notificationOptions);

    // Reproducir sonido
    playNotificationSound();

    // Evento de click en la notificación
    notification.onclick = (event) => {
      event.preventDefault();
      window.focus();
      notification.close();
      
      // Si hay data, podríamos navegar a una sección específica
      if (options.data?.screen) {
        // Esto lo manejaremos con un evento personalizado
        window.dispatchEvent(new CustomEvent('notification-click', { detail: options.data }));
      }
    };

    console.log('📬 Notificación mostrada:', title);
    return notification;
  } catch (error) {
    console.error('❌ Error mostrando notificación:', error);
    return null;
  }
}

/**
 * Icono por defecto para notificaciones (SVG en base64)
 */
function getDefaultNotificationIcon(): string {
  // SVG del carrito de compras de Gualán Market
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192">
      <rect width="192" height="192" fill="#10b981" rx="48"/>
      <path fill="#fff" d="M48 48h12l8 40h56l12-40h12l-14 48H66l-10-40H48zm20 80a12 12 0 1 1 0 24 12 12 0 0 1 0-24zm56 0a12 12 0 1 1 0 24 12 12 0 0 1 0-24z"/>
    </svg>
  `.trim();
  
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

/**
 * Badge por defecto para notificaciones (monograma)
 */
function getDefaultNotificationBadge(): string {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 72 72">
      <circle cx="36" cy="36" r="36" fill="#10b981"/>
      <text x="36" y="50" font-size="40" font-family="Arial" font-weight="bold" fill="#fff" text-anchor="middle">GM</text>
    </svg>
  `.trim();
  
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

/**
 * Muestra una notificación basada en el tipo de evento de la app
 */
export function showAppNotification(
  type: 'order' | 'message' | 'favorite' | 'order_confirmed' | 'price_adjusted',
  title: string,
  message: string,
  data?: any
): Notification | null {
  // Verificar si este tipo de notificación está habilitado
  if (!isNotificationTypeEnabled(type)) {
    console.log(`🔕 Notificación tipo "${type}" deshabilitada por el usuario`);
    return null;
  }

  // Configurar opciones según el tipo
  const options: any = {
    body: message,
    tag: data?.id || `${type}-${Date.now()}`,
    data: { type, ...data },
    requireInteraction: false,
  };

  // Personalizar según el tipo
  switch (type) {
    case 'order':
      options.badge = '🛒';
      options.requireInteraction = true; // Pedidos son importantes
      break;
    case 'order_confirmed':
      options.badge = '✅';
      options.requireInteraction = true;
      break;
    case 'message':
      options.badge = '💬';
      break;
    case 'favorite':
      options.badge = '⭐';
      break;
    case 'price_adjusted':
      options.badge = '💰';
      options.requireInteraction = true;
      break;
  }

  return showBrowserNotification(title, options);
}

/**
 * Hook para verificar si la app está en foco
 */
export function isAppInFocus(): boolean {
  return document.visibilityState === 'visible';
}

/**
 * Solicita permisos de notificación de forma amigable con mensaje contextual
 */
export async function requestNotificationPermissionWithContext(
  context: 'login' | 'profile' | 'first-order' | 'first-message'
): Promise<NotificationPermission> {
  const messages = {
    login: '¡Bienvenido a Gualán Market! ¿Te gustaría recibir notificaciones de tus pedidos y mensajes?',
    profile: 'Activa las notificaciones para no perderte ninguna actualización importante',
    'first-order': '¿Quieres recibir notificaciones cuando tu pedido cambie de estado?',
    'first-message': '¿Quieres recibir notificaciones cuando recibas nuevos mensajes?',
  };

  console.log(`📬 Solicitando permisos de notificación (contexto: ${context})`);
  console.log(`💡 ${messages[context]}`);

  return await requestNotificationPermission();
}

/**
 * Envía una notificación de prueba
 */
export function sendTestNotification(): void {
  showBrowserNotification('🎉 ¡Notificaciones Activadas!', {
    body: 'Recibirás actualizaciones de tus pedidos, mensajes y más.',
    tag: 'test-notification',
    requireInteraction: false,
  });
}

/**
 * Limpia notificaciones antiguas del navegador
 */
export async function clearOldNotifications(): Promise<void> {
  // Esta función solo funciona con Service Worker
  // Por ahora solo registramos el intento
  console.log('ℹ️ Limpieza de notificaciones (requiere Service Worker en producción)');
}

/**
 * Obtiene el número de notificaciones no leídas del localStorage
 */
export function getUnreadNotificationsCount(): number {
  try {
    const notifications = JSON.parse(localStorage.getItem('gm_notifications') || '[]');
    return notifications.filter((n: any) => !n.read).length;
  } catch (error) {
    return 0;
  }
}