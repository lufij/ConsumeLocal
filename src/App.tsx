import { useState, useEffect } from 'react';
import { Home, ShoppingCart, User, Store } from 'lucide-react';
import { AuthScreen } from './components/AuthScreen';
import { HomeScreen } from './components/HomeScreen';
import { CartScreen } from './components/CartScreen';
import { ProfileScreen } from './components/ProfileScreen';
import { MyStore } from './components/MyStore';
import { FloatingCartButton } from './components/FloatingCartButton';
import { FloatingNotification } from './components/FloatingNotification';
import { FloatingNotificationButtons } from './components/FloatingNotificationButtons';
import { InstallPWAPrompt } from './components/InstallPWAPrompt';
import { FloatingInstallButton } from './components/FloatingInstallButton';
import { AppLogo } from './components/AppLogo';
import { registerServiceWorker, logPWAInfo } from './utils/pwa';
import { getNotificationPermission, requestNotificationPermissionWithContext } from './utils/browserNotifications';
import { usersAPI, ordersAPI, chatsAPI, lastSeenAPI } from './utils/api';
import { cachedAPI } from './utils/api';
import { toast } from 'sonner@2.0.3';
import { Toaster } from './components/ui/sonner';
import { BackButtonHandler } from './components/BackButtonHandler';
import { ServerStatusBanner } from './components/ServerStatusBanner';

export type User = {
  id: string;
  phone: string;
  name: string;
  hasStore: boolean;
  storeId?: string;
};

export type Store = {
  id: string;
  userId: string;
  name: string;
  description: string;
  logo?: string;
  location: string;
  verified: boolean;
  rating: number;
  totalReviews: number;
};

export type Product = {
  id: string;
  storeId: string;
  title: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  createdAt: string;
  inStock: boolean; // Estado de disponibilidad del producto
  isProductOfTheDay?: boolean; // Si es producto temporal del día
  expiresAt?: string; // Fecha/hora de expiración (23:59 del día de creación)
};

export type CartItem = {
  productId: string;
  quantity: number;
  storeId: string;
  selectedImageIndex?: number; // Índice de la imagen seleccionada como referencia
};

export type Order = {
  id: string;
  buyerId: string;
  items: {
    productId: string;
    quantity: number;
    price: number;
    selectedImageIndex?: number; // Índice de la imagen de referencia
  }[];
  storeId: string;
  total: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  createdAt: string;
  buyerNotes?: string;
  sellerNotes?: string; // Notas del vendedor (ej: razón de cambio de precio)
  adjustedTotal?: number; // Total ajustado por el vendedor (si es diferente al original)
};

export type Notification = {
  id: string;
  userId: string; // Para quién es la notificación
  type: 'order' | 'message' | 'favorite' | 'order_confirmed' | 'price_adjusted';
  title: string;
  message: string;
  relatedId: string; // orderId, conversationId, productId
  createdAt: string;
  read: boolean;
  data?: {
    orderId?: string;
    conversationId?: string;
    otherUserId?: string;
    otherUserName?: string;
    productId?: string;
    productTitle?: string;
    storeId?: string;
  };
};

export type Screen =
  | 'home'
  | 'store'
  | 'cart'
  | 'profile';

// Función para mostrar notificaciones al iniciar sesión
async function showLoginNotifications(user: User) {
  try {
    // Cargar pedidos
    const ordersResult = await ordersAPI.getAll();
    if (ordersResult.success && ordersResult.data) {
      const orders = ordersResult.data as Order[];
      const activeOrders = orders.filter(order => 
        order.buyerId === user.id && 
        (order.status === 'pending' || order.status === 'confirmed')
      );
      
      if (activeOrders.length > 0) {
        const confirmedOrders = activeOrders.filter(o => o.status === 'confirmed');
        if (confirmedOrders.length > 0) {
          toast.success(`✅ Tienes ${confirmedOrders.length} ${confirmedOrders.length === 1 ? 'pedido confirmado' : 'pedidos confirmados'}`, {
            description: 'Revisa "Mis Pedidos" en tu perfil',
            duration: 5000,
          });
        }
      }
    }

    // Cargar mensajes
    const chatsResult = await chatsAPI.getAll();
    if (chatsResult.success && chatsResult.data) {
      const allChats = chatsResult.data as any[];
      let totalUnread = 0;
      
      console.log('🔍 [LOGIN] Revisando mensajes no leídos...');
      
      // ✅ MIGRADO A SUPABASE: Obtener todos los lastSeen del usuario
      const lastSeenData = await lastSeenAPI.getAll(user.id);
      
      allChats.forEach((chat: any) => {
        const messages = chat.messages || [];
        const conversationId = chat.id;
        const lastSeenTime = lastSeenData[conversationId] || null;
        
        console.log(`🔍 [LOGIN] Conversación ${conversationId}:`);
        console.log(`  - Mensajes totales: ${messages.length}`);
        console.log(`  - LastSeen: ${lastSeenTime || 'NUNCA'}`);
        
        let unreadInConversation = 0;
        messages.forEach((msg: any) => {
          if (msg.receiverId === user.id) {
            const msgTime = new Date(msg.timestamp);
            const isUnread = !lastSeenTime || msgTime > new Date(lastSeenTime);
            
            if (isUnread) {
              unreadInConversation++;
              console.log(`  ❌ NO LEÍDO: "${msg.text.substring(0, 30)}" - ${msg.timestamp}`);
            } else {
              console.log(`  ✅ LEÍDO: "${msg.text.substring(0, 30)}" - ${msg.timestamp}`);
            }
            
            if (isUnread) {
              totalUnread++;
            }
          }
        });
        
        console.log(`  - Total no leídos en esta conversación: ${unreadInConversation}`);
      });
      
      console.log(`🔍 [LOGIN] TOTAL MENSAJES NO LEÍDOS: ${totalUnread}`);
      
      if (totalUnread > 0) {
        toast.info(`💬 Tienes ${totalUnread} ${totalUnread === 1 ? 'mensaje nuevo' : 'mensajes nuevos'}`, {
          description: 'Revisa "Mis Mensajes" en tu perfil',
          duration: 5000,
        });
      }
    }
  } catch (error) {
    console.error('Error cargando notificaciones:', error);
  }
}

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cartCount, setCartCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [hasHomeSubScreen, setHasHomeSubScreen] = useState(false); // Track si HomeScreen tiene sub-pantallas
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0); // Contador de pedidos pendientes en tienda
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0); // Contador de mensajes sin leer
  const [profilePendingOrdersCount, setProfilePendingOrdersCount] = useState(0); // Contador de pedidos pendientes en perfil
  const [profileResetTrigger, setProfileResetTrigger] = useState(false); // ✅ Trigger para resetear ProfileScreen

  useEffect(() => {
    const initializeApp = async () => {
      // Limpiar datos demo de versiones anteriores (ya no es necesario con Supabase)
      // const cleanDemoData = () => {
      //   const productsStr = localStorage.getItem('products');
      //   const storesStr = localStorage.getItem('stores');
        
      //   // Eliminar productos demo (los que tienen storeId 'sample1' o 'sample2')
      //   if (productsStr) {
      //     try {
      //       const products: Product[] = JSON.parse(productsStr);
      //       const realProducts = products.filter(p => 
      //         p.storeId !== 'sample1' && 
      //         p.storeId !== 'sample2' &&
      //         !p.id.startsWith('1') && // IDs de demo empiezan con números bajos
      //         !p.id.startsWith('2') &&
      //         !p.id.startsWith('3') &&
      //         !p.id.startsWith('4')
      //       );
          
      //       if (realProducts.length !== products.length) {
      //         localStorage.setItem('products', JSON.stringify(realProducts));
      //         console.log('🧹 Limpiados productos demo');
      //       }
      //     } catch (error) {
      //       console.error('Error limpiando productos:', error);
      //     }
      //   }
        
      //   // Eliminar tiendas demo (las que tienen id 'sample1' o 'sample2')
      //   if (storesStr) {
      //     try {
      //       const stores: Store[] = JSON.parse(storesStr);
      //       const realStores = stores.filter(s => 
      //         s.id !== 'sample1' && 
      //         s.id !== 'sample2' &&
      //         s.userId !== 'sample'
      //       );
          
      //       if (realStores.length !== stores.length) {
      //         localStorage.setItem('stores', JSON.stringify(realStores));
      //         console.log('🧹 Limpiadas tiendas demo');
      //       }
      //     } catch (error) {
      //       console.error('Error limpiando tiendas:', error);
      //     }
      //   }
      // };
      
      // // Ejecutar limpieza al inicio
      // cleanDemoData();
      
      // Check if user is logged in - usar Supabase como fuente de verdad
      const userStr = localStorage.getItem('currentUser');
      if (userStr) {
        try {
          const savedUser: User = JSON.parse(userStr);
          
          // Sync with Supabase to get the latest data
          const result = await usersAPI.getAll();
          if (result.success && result.data) {
            const users = result.data as User[];
            const latestUser = users.find((u: User) => u.id === savedUser.id);
            if (latestUser) {
              // Use the latest user data from Supabase
              setCurrentUser(latestUser);
              localStorage.setItem('currentUser', JSON.stringify(latestUser));
              console.log('✅ Usuario sincronizado desde Supabase:', latestUser);
              
              // Mostrar notificaciones de mensajes y pedidos pendientes
              await showLoginNotifications(latestUser);
            } else {
              // User not found in Supabase, logout
              setCurrentUser(null);
              localStorage.removeItem('currentUser');
            }
          } else {
            setCurrentUser(savedUser);
          }
        } catch (error) {
          console.error('Error sincronizando usuario:', error);
          setCurrentUser(null);
          localStorage.removeItem('currentUser');
        }
      }

      // Update cart count
      updateCartCount();

      // Load notifications (todavía usa localStorage)
      const notificationsStr = localStorage.getItem('notifications');
      if (notificationsStr) {
        const savedNotifications: Notification[] = JSON.parse(notificationsStr);
        setNotifications(savedNotifications);
      }

      // Register service worker for PWA
      registerServiceWorker();
      logPWAInfo();
    };
    
    initializeApp();
  }, []);

  const updateCartCount = () => {
    const cartStr = localStorage.getItem('cart');
    if (cartStr) {
      const cart: CartItem[] = JSON.parse(cartStr);
      const total = cart.reduce((sum, item) => sum + item.quantity, 0);
      setCartCount(total);
    } else {
      setCartCount(0);
    }
  };

  const updatePendingOrdersCount = async () => {
    // Ya no necesario - se actualiza con updateCounters
  };

  const updateProfilePendingOrdersCount = async () => {
    // Ya no necesario - se actualiza con updateCounters
  };

  const updateUnreadMessagesCount = async () => {
    // Ya no necesario - se actualiza con updateCounters
  };

  // Función optimizada para actualizar todos los contadores de una vez
  const updateCounters = async () => {
    if (!currentUser) return;

    try {
      const counters = await cachedAPI.getCounters(
        currentUser.id,
        currentUser.storeId,
        false // No forzar refresh, usar caché si está disponible
      );

      setPendingOrdersCount(counters.pendingOrders);
      setProfilePendingOrdersCount(counters.profilePendingOrders);
      setUnreadMessagesCount(counters.unreadMessages);
    } catch (error) {
      console.error('Error actualizando contadores:', error);
    }
  };

  // Polling optimizado para actualizar contadores
  useEffect(() => {
    if (!currentUser) return;

    // Actualizar inmediatamente
    updateCartCount();
    updateCounters();

    // Actualizar cada 30 segundos (reducido de 3 segundos)
    const interval = setInterval(() => {
      updateCartCount();
      updateCounters();
    }, 30000); // 30 segundos en lugar de 3

    return () => clearInterval(interval);
  }, [currentUser]);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
    
    // Solicitar permisos de notificación después del login
    // Esperar un poco para que la UI cargue primero
    setTimeout(async () => {
      const permission = getNotificationPermission();
      if (permission === 'default') {
        // Solo solicitar si nunca se ha solicitado antes
        await requestNotificationPermissionWithContext('login');
      }
    }, 2000);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
    setCurrentScreen('home');
  };

  const handleUserUpdate = (updatedUser: User) => {
    setCurrentUser(updatedUser);
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
  };

  const handleNavigateBack = () => {
    // Navegación hacia atrás dentro de la app
    // Siempre volver a la pantalla de Inicio
    setCurrentScreen('home');
  };

  if (!currentUser) {
    return <AuthScreen onLogin={handleLogin} />;
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <Toaster position="top-center" richColors />
      
      {/* Back Button Handler - Maneja el botón de retroceso del navegador/celular */}
      <BackButtonHandler
        currentScreen={currentScreen}
        onNavigateBack={handleNavigateBack}
        isAtRoot={currentScreen === 'home' && !hasHomeSubScreen}
      />
      
      {/* Header */}
      <header className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AppLogo size="md" />
              <div>
                <h1 className="font-bold text-xl">Gualán Consume Local</h1>
                <p className="text-xs text-emerald-100">Tu mercado local</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Server Status Banner - Mostrar advertencia si el servidor no está disponible */}
      <ServerStatusBanner />

      {/* Content */}
      <main className="flex-1 overflow-y-auto">
        {currentScreen === 'home' && (
          <HomeScreen
            currentUser={currentUser}
            onCartUpdate={updateCartCount}
            onSubScreenChange={setHasHomeSubScreen}
          />
        )}
        {currentScreen === 'store' && (
          <MyStore currentUser={currentUser} setCurrentUser={setCurrentUser} />
        )}
        {currentScreen === 'cart' && (
          <CartScreen
            currentUser={currentUser}
            onCartUpdate={updateCartCount}
          />
        )}
        {currentScreen === 'profile' && (
          <ProfileScreen
            currentUser={currentUser}
            onLogout={handleLogout}
            onCartUpdate={updateCartCount}
            onUserUpdate={handleUserUpdate}
            resetView={profileResetTrigger}
          />
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="bg-white border-t border-gray-200 shadow-lg pb-safe">
        <div className="max-w-7xl mx-auto px-2">
          <div className="flex justify-around items-center py-2 pb-4">
            <NavButton
              icon={<Home className="w-6 h-6" />}
              label="Inicio"
              active={currentScreen === 'home'}
              onClick={() => setCurrentScreen('home')}
            />
            <NavButton
              icon={<Store className="w-6 h-6" />}
              label="Mi Tienda"
              active={currentScreen === 'store'}
              onClick={() => setCurrentScreen('store')}
              badge={pendingOrdersCount > 0 ? pendingOrdersCount : undefined}
            />
            <NavButton
              icon={<ShoppingCart className="w-6 h-6" />}
              label="Carrito"
              active={currentScreen === 'cart'}
              onClick={() => setCurrentScreen('cart')}
              badge={cartCount > 0 ? cartCount : undefined}
            />
            <NavButton
              icon={<User className="w-6 h-6" />}
              label="Perfil"
              active={currentScreen === 'profile'}
              onClick={() => {
                // ✅ Si ya está en perfil, resetear la vista
                if (currentScreen === 'profile') {
                  setProfileResetTrigger(!profileResetTrigger);
                } else {
                  setCurrentScreen('profile');
                }
              }}
              badge={(profilePendingOrdersCount + unreadMessagesCount) > 0 ? (profilePendingOrdersCount + unreadMessagesCount) : undefined}
            />
          </div>
        </div>
      </nav>

      {/* Floating Cart Button */}
      <FloatingCartButton
        cartCount={cartCount}
        onClick={() => setCurrentScreen('cart')}
        show={cartCount > 0 && currentScreen !== 'cart'}
      />

      {/* Floating Notification */}
      <FloatingNotification
        userId={currentUser.id}
        onNavigate={(notification) => {
          // Navigate based on notification type
          if (notification.type === 'order') {
            // Vendedor recibe pedido - ir a Mi Tienda (pedidos)
            setCurrentScreen('store');
          } else if (notification.type === 'order_confirmed' || notification.type === 'price_adjusted') {
            // Comprador notificado de pedido confirmado - ir a perfil (pedidos)
            setCurrentScreen('profile');
          } else if (notification.type === 'message') {
            // Mensaje - ir a perfil (mensajes)
            setCurrentScreen('profile');
          } else if (notification.type === 'favorite') {
            // Favorito - ir a inicio
            setCurrentScreen('home');
          }
        }}
      />

      {/* Floating Notification Buttons */}
      <FloatingNotificationButtons
        messagesCount={unreadMessagesCount}
        ordersCount={profilePendingOrdersCount}
        onMessagesClick={() => setCurrentScreen('profile')}
        onOrdersClick={() => setCurrentScreen('profile')}
        currentScreen={currentScreen}
      />

      {/* Install PWA Prompt */}
      <InstallPWAPrompt />

      {/* Floating Install Button - Instalación y permisos */}
      <FloatingInstallButton />
    </div>
  );
}

function NavButton({
  icon,
  label,
  active,
  onClick,
  badge,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
  badge?: number;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors relative ${
        active
          ? 'text-emerald-600'
          : 'text-gray-600 hover:text-emerald-600'
      }`}
    >
      <div className={`relative ${badge ? 'animate-subtle-bounce' : ''}`}>
        {icon}
        {badge && (
          <>
            {/* Badge pulsante con animación */}
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse z-10">
              {badge}
            </span>
            {/* Anillo de pulso adicional para mayor visibilidad */}
            <span className="absolute -top-2 -right-2 bg-red-400 rounded-full w-5 h-5 animate-ping"></span>
          </>
        )}
      </div>
      <span className="text-xs">{label}</span>
    </button>
  );
}

export default App;