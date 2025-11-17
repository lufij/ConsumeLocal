// Service Worker para Gualán Market PWA
// Versión: 1.0.0

const CACHE_NAME = 'gualan-market-v1';
const OFFLINE_URL = '/offline.html';

// Recursos para cachear durante la instalación
const STATIC_RESOURCES = [
  '/',
  '/offline.html',
];

// Instalar Service Worker
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker: Instalando...');
  
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('📦 Service Worker: Cacheando recursos estáticos');
      // No fallar si no se pueden cachear todos los recursos
      return cache.addAll(STATIC_RESOURCES).catch((error) => {
        console.warn('⚠️ Service Worker: Algunos recursos no se pudieron cachear', error);
      });
    })
  );
  
  // Activar inmediatamente sin esperar
  self.skipWaiting();
});

// Activar Service Worker
self.addEventListener('activate', (event) => {
  console.log('✅ Service Worker: Activado');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Eliminar cachés antiguos
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Service Worker: Eliminando caché antigua:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  
  // Tomar control de todas las páginas inmediatamente
  return self.clients.claim();
});

// Interceptar peticiones de red
self.addEventListener('fetch', (event) => {
  // Solo cachear peticiones GET
  if (event.request.method !== 'GET') {
    return;
  }
  
  // Ignorar peticiones a APIs externas
  if (event.request.url.includes('supabase.co')) {
    return;
  }
  
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Si está en caché, devolverlo
      if (cachedResponse) {
        return cachedResponse;
      }
      
      // Si no, hacer la petición de red
      return fetch(event.request).then((response) => {
        // No cachear respuestas que no sean exitosas
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        
        // Cachear la nueva respuesta para futuras peticiones
        const responseToCache = response.clone();
        
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        
        return response;
      }).catch(() => {
        // Si falla la red, mostrar página offline
        if (event.request.mode === 'navigate') {
          return caches.match(OFFLINE_URL);
        }
      });
    })
  );
});

// Escuchar mensajes del cliente
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

console.log('📱 Service Worker cargado correctamente');
