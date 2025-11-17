import type { Product } from '../App';

/**
 * Obtiene la fecha/hora actual en zona horaria de Guatemala (GMT-6)
 */
export function getCurrentGuatemalaTime(): Date {
  // Crear fecha en UTC
  const now = new Date();
  
  // Guatemala está en GMT-6 (sin cambio de horario de verano)
  const guatemalaOffset = -6 * 60; // -6 horas en minutos
  const localOffset = now.getTimezoneOffset(); // Diferencia del navegador con UTC
  
  // Ajustar a hora de Guatemala
  const guatemalaTime = new Date(now.getTime() + (guatemalaOffset - localOffset) * 60 * 1000);
  
  return guatemalaTime;
}

/**
 * Obtiene la fecha/hora de fin del día en Guatemala (23:59:59)
 */
export function getEndOfDayGuatemala(): Date {
  const now = getCurrentGuatemalaTime();
  
  // Establecer a las 23:59:59.999
  const endOfDay = new Date(now);
  endOfDay.setHours(23, 59, 59, 999);
  
  return endOfDay;
}

/**
 * Formatea una fecha/hora para mostrar en la UI
 */
export function formatGuatemalaTime(date: Date): string {
  return date.toLocaleString('es-GT', {
    timeZone: 'America/Guatemala',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
}

/**
 * Verifica si un producto ha expirado
 */
export function isProductExpired(product: Product): boolean {
  if (!product.isProductOfTheDay || !product.expiresAt) {
    return false;
  }
  
  const now = getCurrentGuatemalaTime();
  const expiresAt = new Date(product.expiresAt);
  
  return now > expiresAt;
}

/**
 * Limpia productos expirados del localStorage
 * Retorna el número de productos eliminados
 */
export function cleanExpiredProducts(): number {
  try {
    const productsStr = localStorage.getItem('products');
    if (!productsStr) return 0;
    
    const products: Product[] = JSON.parse(productsStr);
    const now = getCurrentGuatemalaTime();
    
    // Filtrar productos no expirados
    const activeProducts = products.filter(product => {
      if (!product.isProductOfTheDay || !product.expiresAt) {
        return true; // Mantener productos normales
      }
      
      const expiresAt = new Date(product.expiresAt);
      return now <= expiresAt; // Mantener solo si no ha expirado
    });
    
    const removedCount = products.length - activeProducts.length;
    
    if (removedCount > 0) {
      localStorage.setItem('products', JSON.stringify(activeProducts));
      console.log(`🗑️ Eliminados ${removedCount} productos del día expirados`);
    }
    
    return removedCount;
  } catch (error) {
    console.error('Error al limpiar productos expirados:', error);
    return 0;
  }
}

/**
 * Obtiene solo productos activos (no expirados)
 */
export function getActiveProducts(): Product[] {
  try {
    const productsStr = localStorage.getItem('products');
    if (!productsStr) return [];
    
    const products: Product[] = JSON.parse(productsStr);
    const now = getCurrentGuatemalaTime();
    
    return products.filter(product => {
      if (!product.isProductOfTheDay || !product.expiresAt) {
        return true; // Incluir productos normales
      }
      
      const expiresAt = new Date(product.expiresAt);
      return now <= expiresAt; // Incluir solo si no ha expirado
    });
  } catch (error) {
    console.error('Error al obtener productos activos:', error);
    return [];
  }
}

/**
 * Calcula el tiempo restante hasta que expire un producto del día
 */
export function getTimeUntilExpiration(product: Product): string {
  if (!product.isProductOfTheDay || !product.expiresAt) {
    return '';
  }
  
  const now = getCurrentGuatemalaTime();
  const expiresAt = new Date(product.expiresAt);
  const diff = expiresAt.getTime() - now.getTime();
  
  if (diff <= 0) {
    return 'Expirado';
  }
  
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 0) {
    return `${hours}h ${minutes}m restantes`;
  } else {
    return `${minutes}m restantes`;
  }
}

/**
 * Crea los campos necesarios para un producto del día
 */
export function createProductOfTheDayFields(): {
  isProductOfTheDay: boolean;
  expiresAt: string;
} {
  const endOfDay = getEndOfDayGuatemala();
  
  return {
    isProductOfTheDay: true,
    expiresAt: endOfDay.toISOString(),
  };
}

/**
 * Inicializa la limpieza automática de productos expirados
 * Ejecuta la limpieza cada 1 minuto
 */
export function initializeAutoCleanup(): () => void {
  // Limpiar inmediatamente al iniciar
  cleanExpiredProducts();
  
  // Configurar limpieza periódica cada 1 minuto
  const intervalId = setInterval(() => {
    cleanExpiredProducts();
  }, 60 * 1000); // 60 segundos
  
  // Retornar función para cancelar el intervalo
  return () => clearInterval(intervalId);
}
