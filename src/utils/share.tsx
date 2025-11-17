import type { Product, Store } from '../App';

/**
 * Genera el mensaje para compartir un producto por WhatsApp
 */
export function generateProductShareMessage(product: Product, store?: Store): string {
  const storeName = store ? store.name : 'Gualán Market';
  const storeLocation = store ? ` - ${store.location}` : '';
  
  let message = `🛍️ *${product.title}*\n\n`;
  message += `💰 Precio: Q ${product.price.toFixed(2)}\n`;
  message += `📦 Categoría: ${product.category}\n`;
  message += `🏪 Tienda: ${storeName}${storeLocation}\n\n`;
  message += `📝 ${product.description}\n\n`;
  
  if (!product.inStock) {
    message += `⚠️ *Actualmente agotado*\n\n`;
  }
  
  message += `✨ Descubre más productos locales en *Gualán Market*`;
  
  return message;
}

/**
 * Comparte un producto por WhatsApp
 */
export function shareProduct(product: Product, store?: Store): void {
  const message = generateProductShareMessage(product, store);
  const encodedMessage = encodeURIComponent(message);
  
  // Abrir WhatsApp con el mensaje pre-llenado
  const whatsappUrl = `https://wa.me/?text=${encodedMessage}`;
  window.open(whatsappUrl, '_blank');
}

/**
 * Comparte un producto con un contacto específico de WhatsApp
 */
export function shareProductToContact(
  product: Product, 
  store: Store | undefined, 
  phoneNumber: string
): void {
  const message = generateProductShareMessage(product, store);
  const encodedMessage = encodeURIComponent(message);
  
  // Limpiar el número de teléfono (solo dígitos)
  const cleanPhone = phoneNumber.replace(/\D/g, '');
  
  // Agregar código de país si no lo tiene (+502 para Guatemala)
  const fullPhone = cleanPhone.startsWith('502') ? cleanPhone : `502${cleanPhone}`;
  
  // Abrir WhatsApp con el contacto específico
  const whatsappUrl = `https://wa.me/${fullPhone}?text=${encodedMessage}`;
  window.open(whatsappUrl, '_blank');
}

/**
 * Comparte el pedido con la tienda (para coordinación)
 */
export function shareOrderWithStore(
  orderSummary: string,
  storePhone: string,
  buyerName: string
): void {
  let message = `👋 Hola, soy *${buyerName}* de Gualán Market\n\n`;
  message += `Me interesa hacer el siguiente pedido:\n\n`;
  message += orderSummary;
  message += `\n\n¿Está disponible? 😊`;
  
  const encodedMessage = encodeURIComponent(message);
  const cleanPhone = storePhone.replace(/\D/g, '');
  const fullPhone = cleanPhone.startsWith('502') ? cleanPhone : `502${cleanPhone}`;
  
  const whatsappUrl = `https://wa.me/${fullPhone}?text=${encodedMessage}`;
  window.open(whatsappUrl, '_blank');
}

/**
 * Copia texto al portapapeles
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    // Intentar usar la API moderna del portapapeles
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback para navegadores antiguos o contextos no seguros
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      
      return successful;
    }
  } catch (error) {
    console.error('Error al copiar al portapapeles:', error);
    return false;
  }
}

/**
 * Genera mensaje para compartir tienda
 */
export function generateStoreShareMessage(store: Store, productsCount: number = 0): string {
  let message = `🏪 *${store.name}*\n\n`;
  
  if (store.verified) {
    message += `✅ Tienda verificada\n`;
  }
  
  message += `📍 ${store.location}\n`;
  message += `⭐ ${store.rating.toFixed(1)} (${store.totalReviews} reseñas)\n`;
  message += `📦 ${productsCount} productos disponibles\n\n`;
  message += `${store.description}\n\n`;
  message += `✨ Visita *Gualán Market* para ver todos sus productos`;
  
  return message;
}