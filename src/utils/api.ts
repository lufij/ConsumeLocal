import { projectId, publicAnonKey } from './supabase/info';
import { dataCache, CACHE_TTL } from './dataCache';

const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-5d0cb103`;

// Helper function to make API calls
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data?: T; error?: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
        ...options.headers,
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error(`❌ API Error (${endpoint}):`, data);
      return { success: false, error: data.error || 'Error desconocido' };
    }

    return data;
  } catch (error) {
    console.error(`❌ Network Error (${endpoint}):`, error);
    console.error(`🔗 URL intentada: ${API_BASE_URL}${endpoint}`);
    console.error(`⚠️ IMPORTANTE: El servidor Supabase Edge Functions no está disponible.`);
    console.error(`   Para producción, desplegar en: https://github.com/lufij/ConsumeLocal.git`);
    return { success: false, error: error instanceof Error ? error.message : 'Error de red' };
  }
}

// ============================================
// USERS API
// ============================================

export const usersAPI = {
  getAll: () => apiCall('/users'),
  
  getByPhone: (phone: string) => apiCall(`/users/${phone}`),
  
  create: (user: { phone: string; name: string }) => 
    apiCall('/users', {
      method: 'POST',
      body: JSON.stringify(user),
    }),
  
  update: (id: string, updates: any) => 
    apiCall(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),
};

// ============================================
// PRODUCTS API
// ============================================

export const productsAPI = {
  getAll: () => apiCall('/products'),
  
  create: (product: any) => 
    apiCall('/products', {
      method: 'POST',
      body: JSON.stringify(product),
    }),
  
  update: (id: string, updates: any) => 
    apiCall(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),
  
  delete: (id: string) => 
    apiCall(`/products/${id}`, {
      method: 'DELETE',
    }),
  
  reactivateProductOfDay: (id: string) =>
    apiCall(`/products/${id}/reactivate-product-of-day`, {
      method: 'POST',
    }),
};

// ============================================
// STORES API
// ============================================

export const storesAPI = {
  getAll: () => apiCall('/stores'),
  
  create: (store: any) => 
    apiCall('/stores', {
      method: 'POST',
      body: JSON.stringify(store),
    }),
  
  update: (id: string, updates: any) => 
    apiCall(`/stores/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),
};

// ============================================
// ORDERS API
// ============================================

export const ordersAPI = {
  getAll: () => apiCall('/orders'),
  
  create: (order: any) => 
    apiCall('/orders', {
      method: 'POST',
      body: JSON.stringify(order),
    }),
  
  update: (id: string, updates: any) => 
    apiCall(`/orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),
};

// ============================================
// CHATS API
// ============================================

export const chatsAPI = {
  getAll: () => apiCall('/chats'),
  
  sendMessage: (conversationId: string, message: any) => 
    apiCall('/chats', {
      method: 'POST',
      body: JSON.stringify({ conversationId, message }),
    }),
};

// ============================================
// FAVORITES API
// ============================================

export const favoritesAPI = {
  get: (userId: string) => apiCall(`/favorites/${userId}`),
  
  add: (userId: string, productId: string) => 
    apiCall('/favorites', {
      method: 'POST',
      body: JSON.stringify({ userId, productId }),
    }),
  
  remove: (userId: string, productId: string) => 
    apiCall(`/favorites/${userId}/${productId}`, {
      method: 'DELETE',
    }),
};

// ============================================
// REVIEWS API
// ============================================

export const reviewsAPI = {
  getByProduct: (productId: string) => apiCall(`/reviews/product/${productId}`),
  
  getByStore: (storeId: string) => apiCall(`/reviews/store/${storeId}`),
  
  create: (review: any) => 
    apiCall('/reviews', {
      method: 'POST',
      body: JSON.stringify(review),
    }),
};

// ============================================
// PRODUCT OF THE DAY API
// ============================================

export const productOfTheDayAPI = {
  get: () => apiCall('/product-of-the-day'),
  
  set: (data: any) => 
    apiCall('/product-of-the-day', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// ============================================
// LAST SEEN API (Migrado a Supabase KV)
// ============================================

export const lastSeenAPI = {
  /**
   * Obtener todos los lastSeen de un usuario
   * Retorna un objeto { conversationId: timestamp }
   */
  async getAll(userId: string): Promise<Record<string, string>> {
    try {
      const result = await apiCall<Record<string, string>>(`/last-seen/${userId}`);
      if (result.success && result.data) {
        return result.data;
      }
      
      // ⚠️ FALLBACK: Si Supabase falla, usar localStorage temporalmente
      console.warn('⚠️ Supabase lastSeen no disponible, usando localStorage como fallback');
      return this._getFromLocalStorage(userId);
    } catch (error) {
      console.error('❌ Error en lastSeenAPI.getAll:', error);
      return this._getFromLocalStorage(userId);
    }
  },
  
  /**
   * Guardar el lastSeen de una conversación para un usuario
   */
  async set(userId: string, conversationId: string, timestamp: string): Promise<void> {
    try {
      await apiCall('/last-seen', {
        method: 'POST',
        body: JSON.stringify({ userId, conversationId, timestamp }),
      });
      
      // También guardar en localStorage como backup
      this._saveToLocalStorage(userId, conversationId, timestamp);
    } catch (error) {
      console.error('❌ Error en lastSeenAPI.set:', error);
      // Si Supabase falla, solo usar localStorage
      this._saveToLocalStorage(userId, conversationId, timestamp);
    }
  },
  
  // ============================================
  // FUNCIONES AUXILIARES DE FALLBACK
  // ============================================
  
  /**
   * FALLBACK: Leer lastSeen desde localStorage
   */
  _getFromLocalStorage(userId: string): Record<string, string> {
    const result: Record<string, string> = {};
    
    // Buscar todas las claves que empiecen con "lastSeen-"
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('lastSeen-') && key.endsWith(`-${userId}`)) {
        // Extraer conversationId de la clave "lastSeen-{conversationId}-{userId}"
        const parts = key.split('-');
        if (parts.length >= 3) {
          // Reconstruir conversationId (puede contener guiones)
          const conversationId = parts.slice(1, -1).join('-');
          const timestamp = localStorage.getItem(key);
          if (timestamp) {
            result[conversationId] = timestamp;
          }
        }
      }
    }
    
    return result;
  },
  
  /**
   * FALLBACK: Guardar lastSeen en localStorage
   */
  _saveToLocalStorage(userId: string, conversationId: string, timestamp: string): void {
    const key = `lastSeen-${conversationId}-${userId}`;
    localStorage.setItem(key, timestamp);
  },
};

// ============================================
// CACHED API FUNCTIONS (Con sistema de caché integrado)
// ============================================

/**
 * Funciones con caché para optimizar rendimiento
 * Usar estas en lugar de las APIs directas cuando sea posible
 */

export const cachedAPI = {
  /**
   * Obtener todos los productos (con caché de 30s)
   */
  async getProducts(forceRefresh = false) {
    const cacheKey = 'products:all';
    
    if (!forceRefresh) {
      const cached = dataCache.get(cacheKey);
      if (cached) return cached;
    }
    
    const result = await productsAPI.getAll();
    if (result.success && result.data) {
      dataCache.set(cacheKey, result, CACHE_TTL.PRODUCTS);
    }
    return result;
  },

  /**
   * Obtener todas las tiendas (con caché de 1min)
   */
  async getStores(forceRefresh = false) {
    const cacheKey = 'stores:all';
    
    if (!forceRefresh) {
      const cached = dataCache.get(cacheKey);
      if (cached) return cached;
    }
    
    const result = await storesAPI.getAll();
    if (result.success && result.data) {
      dataCache.set(cacheKey, result, CACHE_TTL.STORES);
    }
    return result;
  },

  /**
   * Obtener todos los pedidos (con caché de 15s)
   */
  async getOrders(forceRefresh = false) {
    const cacheKey = 'orders:all';
    
    if (!forceRefresh) {
      const cached = dataCache.get(cacheKey);
      if (cached) return cached;
    }
    
    const result = await ordersAPI.getAll();
    if (result.success && result.data) {
      dataCache.set(cacheKey, result, CACHE_TTL.ORDERS);
    }
    return result;
  },

  /**
   * Obtener todos los chats (con caché de 10s)
   */
  async getChats(forceRefresh = false) {
    const cacheKey = 'chats:all';
    
    if (!forceRefresh) {
      const cached = dataCache.get(cacheKey);
      if (cached) return cached;
    }
    
    const result = await chatsAPI.getAll();
    if (result.success && result.data) {
      dataCache.set(cacheKey, result, CACHE_TTL.CHATS);
    }
    return result;
  },

  /**
   * Obtener todos los usuarios (con caché de 1min)
   */
  async getUsers(forceRefresh = false) {
    const cacheKey = 'users:all';
    
    if (!forceRefresh) {
      const cached = dataCache.get(cacheKey);
      if (cached) return cached;
    }
    
    const result = await usersAPI.getAll();
    if (result.success && result.data) {
      dataCache.set(cacheKey, result, CACHE_TTL.STORES); // Usar mismo TTL que stores (1min)
    }
    return result;
  },

  /**
   * Obtener contadores (con caché de 15s)
   * Para badges de mensajes no leídos y pedidos pendientes
   */
  async getCounters(userId: string, storeId: string | undefined, forceRefresh = false) {
    const cacheKey = `counters:${userId}`;
    
    if (!forceRefresh) {
      const cached = dataCache.get(cacheKey);
      if (cached) return cached;
    }
    
    // Cargar datos necesarios para los contadores
    const [ordersResult, chatsResult, lastSeenData] = await Promise.all([
      this.getOrders(forceRefresh),
      this.getChats(forceRefresh),
      lastSeenAPI.getAll(userId), // ✅ Obtener lastSeen desde Supabase
    ]);

    const counters = {
      pendingOrders: 0,
      profilePendingOrders: 0,
      unreadMessages: 0,
    };

    // Contar pedidos pendientes (para Mi Tienda)
    if (storeId && ordersResult.success && ordersResult.data) {
      const orders = ordersResult.data as any[];
      counters.pendingOrders = orders.filter(
        o => o.storeId === storeId && o.status === 'pending'
      ).length;
    }

    // Contar pedidos activos del comprador (para Perfil)
    if (ordersResult.success && ordersResult.data) {
      const orders = ordersResult.data as any[];
      counters.profilePendingOrders = orders.filter(
        o => o.buyerId === userId && (o.status === 'pending' || o.status === 'confirmed')
      ).length;
    }

    // Contar mensajes sin leer (usando Supabase)
    if (chatsResult.success && chatsResult.data) {
      const allChats = chatsResult.data as any[];
      let totalUnread = 0;
      
      allChats.forEach((chat: any) => {
        const messages = chat.messages || [];
        const conversationId = chat.id;
        const lastSeenTime = lastSeenData[conversationId] || null; // ✅ Desde Supabase
        
        messages.forEach((msg: any) => {
          if (msg.receiverId === userId) {
            if (!lastSeenTime || new Date(msg.timestamp) > new Date(lastSeenTime)) {
              totalUnread++;
            }
          }
        });
      });
      
      counters.unreadMessages = totalUnread;
    }

    dataCache.set(cacheKey, counters, CACHE_TTL.COUNTERS);
    return counters;
  },

  /**
   * Invalidar caché de productos (llamar después de crear/actualizar)
   */
  invalidateProducts() {
    dataCache.invalidate('products:all');
  },

  /**
   * Invalidar caché de tiendas (llamar después de crear/actualizar)
   */
  invalidateStores() {
    dataCache.invalidate('stores:all');
  },

  /**
   * Invalidar caché de pedidos (llamar después de crear/actualizar)
   */
  invalidateOrders() {
    dataCache.invalidate('orders:all');
    dataCache.invalidatePattern('counters:'); // También invalidar contadores
  },

  /**
   * Invalidar caché de chats (llamar después de enviar mensaje)
   */
  invalidateChats() {
    dataCache.invalidate('chats:all');
    dataCache.invalidatePattern('counters:'); // También invalidar contadores
  },
};