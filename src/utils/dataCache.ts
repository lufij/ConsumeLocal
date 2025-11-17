/**
 * Sistema de caché simple para optimizar llamadas a Supabase
 * Almacena datos en memoria con tiempo de expiración
 */

type CacheEntry<T> = {
  data: T;
  timestamp: number;
  ttl: number; // Time to live en milisegundos
};

class DataCache {
  private cache: Map<string, CacheEntry<any>> = new Map();

  /**
   * Obtener datos del caché
   * @param key - Clave del caché
   * @returns Los datos si están en caché y no han expirado, null si no
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const now = Date.now();
    const age = now - entry.timestamp;

    // Si los datos han expirado, eliminarlos
    if (age > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    console.log(`📦 Cache HIT para "${key}" (edad: ${Math.round(age / 1000)}s)`);
    return entry.data;
  }

  /**
   * Guardar datos en el caché
   * @param key - Clave del caché
   * @param data - Datos a guardar
   * @param ttl - Tiempo de vida en milisegundos (default: 30 segundos)
   */
  set<T>(key: string, data: T, ttl: number = 30000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
    console.log(`💾 Cache SET para "${key}" (TTL: ${ttl / 1000}s)`);
  }

  /**
   * Invalidar (eliminar) una entrada del caché
   * @param key - Clave del caché a invalidar
   */
  invalidate(key: string): void {
    const deleted = this.cache.delete(key);
    if (deleted) {
      console.log(`🗑️ Cache INVALIDATED para "${key}"`);
    }
  }

  /**
   * Invalidar todas las entradas que coincidan con un patrón
   * @param pattern - Patrón de búsqueda (puede ser una cadena parcial)
   */
  invalidatePattern(pattern: string): void {
    let count = 0;
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
        count++;
      }
    }
    if (count > 0) {
      console.log(`🗑️ Cache INVALIDATED ${count} entradas con patrón "${pattern}"`);
    }
  }

  /**
   * Limpiar todo el caché
   */
  clear(): void {
    this.cache.clear();
    console.log('🗑️ Cache CLEARED completamente');
  }

  /**
   * Obtener el tamaño del caché
   */
  size(): number {
    return this.cache.size;
  }
}

// Exportar instancia singleton
export const dataCache = new DataCache();

// Tiempos de caché recomendados
export const CACHE_TTL = {
  PRODUCTS: 30000,      // 30 segundos - Productos cambian con frecuencia
  STORES: 60000,        // 1 minuto - Tiendas cambian menos
  ORDERS: 15000,        // 15 segundos - Pedidos necesitan actualización frecuente
  CHATS: 10000,         // 10 segundos - Mensajes necesitan actualización rápida
  USERS: 60000,         // 1 minuto - Usuarios cambian poco
  COUNTERS: 15000,      // 15 segundos - Contadores para badges
} as const;
