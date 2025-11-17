import type { Product, Store } from '../App';

/**
 * Genera un mensaje formateado para WhatsApp con información del producto
 */
export function generateProductShareMessage(product: Product, store?: Store): string {
  const messages: string[] = [];
  
  // Emoji y título
  messages.push(`🛍️ *${product.title}*`);
  messages.push('');
  
  // Precio destacado
  messages.push(`💰 *Precio:* Q${product.price.toFixed(2)}`);
  messages.push('');
  
  // Descripción
  if (product.description) {
    messages.push(`📝 ${product.description}`);
    messages.push('');
  }
  
  // Categoría
  if (product.category) {
    messages.push(`🏷️ *Categoría:* ${product.category}`);
  }
  
  // Información de la tienda
  if (store) {
    messages.push('');
    messages.push(`🏪 *Tienda:* ${store.name}`);
    if (store.location) {
      messages.push(`📍 ${store.location}`);
    }
    if (store.totalReviews > 0) {
      messages.push(`⭐ ${store.rating.toFixed(1)} (${store.totalReviews} reseñas)`);
    }
  }
  
  // Call to action
  messages.push('');
  messages.push('✅ *¡Encuéntralo en Gualán Market!*');
  messages.push('_El mercado virtual de tu comunidad_');
  
  return messages.join('\n');
}

/**
 * Genera un mensaje formateado para WhatsApp con información de la tienda
 */
export function generateStoreShareMessage(store: Store, totalProducts: number): string {
  const messages: string[] = [];
  
  // Emoji y nombre
  messages.push(`🏪 *${store.name}*`);
  messages.push('');
  
  // Descripción
  if (store.description) {
    messages.push(`${store.description}`);
    messages.push('');
  }
  
  // Ubicación
  if (store.location) {
    messages.push(`📍 *Ubicación:* ${store.location}`);
  }
  
  // Rating
  if (store.totalReviews > 0) {
    messages.push(`⭐ *Calificación:* ${store.rating.toFixed(1)} (${store.totalReviews} reseñas)`);
  }
  
  // Productos
  messages.push(`📦 *Productos:* ${totalProducts}`);
  
  // Verificación
  if (store.verified) {
    messages.push('');
    messages.push('✅ *Tienda Verificada*');
  }
  
  // Call to action
  messages.push('');
  messages.push('🛍️ *¡Visítanos en Gualán Market!*');
  messages.push('_Tu mercado local en línea_');
  
  return messages.join('\n');
}

/**
 * Abre WhatsApp con un mensaje pre-llenado
 * @param message - El mensaje a compartir
 * @param phoneNumber - Número de teléfono opcional (sin el mensaje se comparte por broadcast)
 */
export function shareViaWhatsApp(message: string, phoneNumber?: string): void {
  const encodedMessage = encodeURIComponent(message);
  
  let whatsappUrl: string;
  
  if (phoneNumber) {
    // Compartir con un contacto específico
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    whatsappUrl = `https://wa.me/502${cleanPhone}?text=${encodedMessage}`;
  } else {
    // Compartir en general (abre selector de contactos)
    whatsappUrl = `https://wa.me/?text=${encodedMessage}`;
  }
  
  // Abrir WhatsApp
  window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
}

/**
 * Comparte un producto por WhatsApp
 */
export function shareProduct(product: Product, store?: Store): void {
  const message = generateProductShareMessage(product, store);
  shareViaWhatsApp(message);
}

/**
 * Comparte una tienda por WhatsApp
 */
export function shareStore(store: Store, totalProducts: number): void {
  const message = generateStoreShareMessage(store, totalProducts);
  shareViaWhatsApp(message);
}

/**
 * Copia el mensaje al portapapeles (fallback si WhatsApp no está disponible)
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    // Intentar con el API moderno de Clipboard
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (err) {
    console.warn('Clipboard API no disponible, usando fallback:', err);
  }
  
  // Fallback para navegadores antiguos o contextos no seguros
  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      // Intentar con el comando moderno
      const success = document.execCommand('copy');
      textArea.remove();
      return success;
    } catch (err) {
      textArea.remove();
      
      // Último fallback: mostrar el texto para copiar manualmente
      const message = `No se pudo copiar automáticamente. Por favor copia este mensaje:\n\n${text}`;
      alert(message);
      return false;
    }
  } catch (err) {
    console.error('Error copying to clipboard:', err);
    return false;
  }
}

/**
 * Detecta si WhatsApp está disponible en el dispositivo
 */
export function isWhatsAppAvailable(): boolean {
  // En dispositivos móviles, WhatsApp suele estar disponible
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
  
  // En desktop, WhatsApp Web está disponible
  return true; // Siempre devolvemos true ya que WhatsApp Web funciona en todos lados
}

/**
 * Genera un mensaje formateado para compartir la aplicación
 */
export function generateAppShareMessage(totalUsers: number): string {
  const messages: string[] = [];
  
  // Título llamativo con logo
  messages.push('🏪✨ *¡Descubre Gualán Consume Local!* ✨🏪');
  messages.push('');
  
  // Descripción con emoji atractivo
  messages.push('🌟 _El mercado virtual de nuestra comunidad_');
  messages.push('');
  
  // Beneficios con emojis más atractivos
  messages.push('🛒 *Compra productos locales*');
  messages.push('🤝 *Apoya a vendedores de Gualán*');
  messages.push('🏪 *Crea tu tienda gratis*');
  messages.push('💬 *Chat directo con vendedores*');
  messages.push('📱 *100% gratuita y fácil de usar*');
  messages.push('');
  
  // Estadística social proof
  if (totalUsers > 0) {
    messages.push(`👥 *${totalUsers} personas* ya están usando Gualán Consume Local`);
    messages.push('');
  }
  
  // Link de descarga
  messages.push('🔗 *Accede aquí:*');
  messages.push('https://consume-local.vercel.app/');
  messages.push('');
  
  // Call to action
  messages.push('🎊 *¡Únete ahora y apoya el comercio local!* 🎊');
  messages.push('_Comprando y vendiendo en nuestra comunidad_ 🇬🇹💚');
  
  return messages.join('\n');
}

/**
 * Comparte la aplicación por WhatsApp
 */
export function shareApp(totalUsers: number): void {
  const message = generateAppShareMessage(totalUsers);
  shareViaWhatsApp(message);
}