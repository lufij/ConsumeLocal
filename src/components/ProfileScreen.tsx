import { ordersAPI, chatsAPI, storesAPI } from '../utils/api';
import { cachedAPI, lastSeenAPI } from '../utils/api';
import { User, Phone, LogOut, Star, ShieldCheck, Store, MessageSquare, Package, ChevronRight, Heart, Edit2, Bell } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { ChatScreen } from './ChatScreen';
import { OrdersScreen } from './OrdersScreen';
import { FavoritesScreen } from './FavoritesScreen';
import { ProfileEditScreen } from './ProfileEditScreen';
import { NotificationSettings } from './NotificationSettings';
import { getFavoritesCount } from '../utils/favorites';
import type { User as UserType, Store as StoreType, Order } from '../App';
import { useState, useEffect } from 'react';

type ProfileScreenProps = {
  currentUser: UserType;
  onLogout: () => void;
  onCartUpdate?: () => void;
  onUserUpdate: (user: UserType) => void;
  resetView?: boolean; // ✅ Nuevo prop para resetear vista desde App
};

export function ProfileScreen({ currentUser, onLogout, onCartUpdate, onUserUpdate, resetView }: ProfileScreenProps) {
  const [store, setStore] = useState<StoreType | null>(null);
  const [currentView, setCurrentView] = useState<'profile' | 'messages' | 'orders' | 'favorites' | 'edit' | 'notifications'>('profile');
  const [chatUserId, setChatUserId] = useState<string | undefined>(undefined);
  const [chatUserName, setChatUserName] = useState<string | undefined>(undefined);
  const [ordersCount, setOrdersCount] = useState(0);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);

  // ✅ Resetear vista cuando se presiona el botón Perfil desde sub-pantallas
  useEffect(() => {
    if (resetView && currentView !== 'profile') {
      setCurrentView('profile');
      setChatUserId(undefined);
      setChatUserName(undefined);
    }
  }, [resetView]);

  useEffect(() => {
    const loadStore = async () => {
      if (currentUser.hasStore && currentUser.storeId) {
        try {
          const result = await storesAPI.getAll();
          if (result.success && result.data) {
            const stores = result.data as StoreType[];
            const userStore = stores.find(s => s.id === currentUser.storeId);
            if (userStore) {
              setStore(userStore);
            }
          }
        } catch (error) {
          console.error('Error cargando tienda:', error);
        }
      }
    };

    loadStore();
    
    // Contar pedidos del usuario
    loadOrdersCount();
    
    // Contar mensajes sin leer
    loadUnreadMessagesCount();
  }, [currentUser]);

  // Recargar contadores cuando cambia la vista
  useEffect(() => {
    if (currentView === 'profile') {
      loadOrdersCount();
      loadUnreadMessagesCount();
    }
  }, [currentView]);

  const loadOrdersCount = async () => {
    try {
      const result = await cachedAPI.getOrders();
      if (result.success && result.data) {
        const orders = result.data as Order[];
        // Contar solo pedidos activos (pendientes o confirmados) donde el usuario es el comprador
        const activeOrders = orders.filter(order => 
          order.buyerId === currentUser.id && 
          (order.status === 'pending' || order.status === 'confirmed')
        );
        setOrdersCount(activeOrders.length);
        console.log(`✅ Pedidos activos del usuario: ${activeOrders.length}`);
      }
    } catch (error) {
      console.error('Error al cargar pedidos:', error);
    }
  };

  const loadUnreadMessagesCount = async () => {
    try {
      const result = await cachedAPI.getChats();
      if (!result.success || !result.data) {
        setUnreadMessagesCount(0);
        return;
      }

      const allChats = result.data as any[];
      let totalUnread = 0;
      
      // ✅ MIGRADO A SUPABASE: Obtener todos los lastSeen del usuario
      const lastSeenData = await lastSeenAPI.getAll(currentUser.id);
      
      // Recorrer todas las conversaciones
      allChats.forEach((chat: any) => {
        const messages = chat.messages || [];
        const conversationId = chat.id;
        
        // ✅ Obtener lastSeen desde Supabase
        const lastSeenTime = lastSeenData[conversationId] || null;
        
        // Contar mensajes sin leer en esta conversación
        messages.forEach((msg: any) => {
          if (msg.receiverId === currentUser.id) {
            // Si no hay tiempo de última vista, o el mensaje es más reciente, contarlo
            if (!lastSeenTime || new Date(msg.timestamp) > new Date(lastSeenTime)) {
              totalUnread++;
            }
          }
        });
      });
      
      setUnreadMessagesCount(totalUnread);
      console.log(`✅ Mensajes sin leer: ${totalUnread}`);
    } catch (error) {
      console.error('Error al cargar mensajes sin leer:', error);
      setUnreadMessagesCount(0);
    }
  };

  const handleLogout = () => {
    if (confirm('¿Estás seguro de cerrar sesin?')) {
      onLogout();
    }
  };

  // Si está en mensajes, mostrar ChatScreen
  if (currentView === 'messages') {
    return <ChatScreen 
      currentUser={currentUser} 
      onBack={() => {
        setCurrentView('profile');
        setChatUserId(undefined);
        setChatUserName(undefined);
      }} 
      initialUserId={chatUserId} 
      initialUserName={chatUserName} 
    />;
  }

  // Si está en pedidos, mostrar OrdersScreen
  if (currentView === 'orders') {
    return <OrdersScreen 
      currentUser={currentUser} 
      onBack={() => setCurrentView('profile')}
      onOpenChat={(storeUserId, storeName) => {
        setCurrentView('messages');
        setChatUserId(storeUserId);
        setChatUserName(storeName);
      }}
    />;
  }

  // Si está en favoritos, mostrar FavoritesScreen
  if (currentView === 'favorites') {
    return <FavoritesScreen currentUser={currentUser} onBack={() => setCurrentView('profile')} onCartUpdate={onCartUpdate} />;
  }

  // Si está en editar, mostrar ProfileEditScreen
  if (currentView === 'edit') {
    return (
      <ProfileEditScreen
        currentUser={currentUser}
        onSave={(updatedUser) => {
          // Actualizar el usuario en App.tsx (esto actualizará el estado globalmente)
          onUserUpdate(updatedUser);
          
          // Volver a la vista de perfil
          setCurrentView('profile');
        }}
        onCancel={() => setCurrentView('profile')}
      />
    );
  }

  // Si está en notificaciones, mostrar NotificationSettings
  if (currentView === 'notifications') {
    return (
      <div className="max-w-2xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <div className="mb-4">
          <Button
            variant="ghost"
            onClick={() => setCurrentView('profile')}
            className="mb-2"
          >
            ← Volver
          </Button>
        </div>
        <NotificationSettings />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
      <h2 className="text-xl sm:text-2xl text-gray-900 mb-4 sm:mb-6">Mi Perfil</h2>

      {/* User Info */}
      <Card className="p-4 sm:p-6 mb-4">
        <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
            <User className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-600" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-lg sm:text-xl text-gray-900 mb-1 truncate">{currentUser.name}</h3>
            <div className="flex items-center gap-2 text-gray-600 text-sm sm:text-base">
              <Phone className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
              <span className="truncate">+502 {currentUser.phone}</span>
            </div>
          </div>
        </div>

        {currentUser.hasStore && store && (
          <div className="border-t pt-4">
            <div className="flex items-center gap-2 mb-2">
              <Store className="w-5 h-5 text-emerald-600" />
              <h4 className="text-lg text-gray-900">Mi Tienda</h4>
              {store.verified && (
                <ShieldCheck className="w-4 h-4 text-blue-600" />
              )}
            </div>
            <p className="text-gray-900 mb-1">{store.name}</p>
            <p className="text-sm text-gray-600">{store.description}</p>
            {store.totalReviews > 0 && (
              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm text-gray-900">
                    {store.rating.toFixed(1)}
                  </span>
                </div>
                <span className="text-sm text-gray-600">
                  ({store.totalReviews} valoraciones)
                </span>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Menu Options */}
      <Card className="p-0 mb-4 overflow-hidden">
        <button
          onClick={() => setCurrentView('messages')}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors border-b border-gray-100"
        >
          <div className="flex items-center gap-3">
            <div className={`bg-blue-100 p-2 rounded-lg relative ${unreadMessagesCount > 0 ? 'animate-subtle-bounce' : ''}`}>
              <MessageSquare className="w-5 h-5 text-blue-600" />
              {unreadMessagesCount > 0 && (
                <>
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center z-10">
                    <span className="text-xs font-bold text-white">{unreadMessagesCount}</span>
                  </div>
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-400 rounded-full animate-ping" />
                </>
              )}
            </div>
            <span className="text-gray-900">Mis Mensajes</span>
          </div>
          {unreadMessagesCount > 0 && (
            <div className="flex items-center gap-2">
              <span className="bg-red-500 text-white px-2.5 py-1 rounded-full text-xs font-bold animate-pulse">
                {unreadMessagesCount} {unreadMessagesCount === 1 ? 'nuevo' : 'nuevos'}
              </span>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
          )}
          {unreadMessagesCount === 0 && (
            <ChevronRight className="w-5 h-5 text-gray-400" />
          )}
        </button>
        <button
          onClick={() => setCurrentView('orders')}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors relative"
        >
          <div className="flex items-center gap-3">
            <div className={`bg-emerald-100 p-2 rounded-lg relative ${ordersCount > 0 ? 'animate-subtle-bounce' : ''}`}>
              <Package className="w-5 h-5 text-emerald-600" />
              {ordersCount > 0 && (
                <>
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center z-10">
                    <span className="text-xs font-bold text-white">{ordersCount}</span>
                  </div>
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-400 rounded-full animate-ping" />
                </>
              )}
            </div>
            <span className="text-gray-900">Mis Pedidos</span>
          </div>
          {ordersCount > 0 && (
            <div className="flex items-center gap-2">
              <span className="bg-red-500 text-white px-2.5 py-1 rounded-full text-xs font-bold animate-pulse">
                {ordersCount} {ordersCount === 1 ? 'nuevo' : 'nuevos'}
              </span>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
          )}
          {ordersCount === 0 && (
            <ChevronRight className="w-5 h-5 text-gray-400" />
          )}
        </button>
        <button
          onClick={() => setCurrentView('favorites')}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="bg-red-100 p-2 rounded-lg">
              <Heart className="w-5 h-5 text-red-600" />
            </div>
            <span className="text-gray-900">Mis Favoritos</span>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </button>
        <button
          onClick={() => setCurrentView('edit')}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="bg-gray-100 p-2 rounded-lg">
              <Edit2 className="w-5 h-5 text-gray-600" />
            </div>
            <span className="text-gray-900">Editar Perfil</span>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </button>
        <button
          onClick={() => setCurrentView('notifications')}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="bg-gray-100 p-2 rounded-lg">
              <Bell className="w-5 h-5 text-gray-600" />
            </div>
            <span className="text-gray-900">Configuración de Notificaciones</span>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </button>
      </Card>

      {/* About Section */}
      <Card className="p-6 mb-4">
        <h3 className="text-lg text-gray-900 mb-4">Acerca de Gualán Market</h3>
        <div className="space-y-3 text-sm text-gray-600">
          <p>
            Gualán Market es tu mercado virtual local, creado para facilitar la
            compra y venta de productos en nuestra comunidad.
          </p>
          <p>
            <strong>Versión:</strong> 1.0.0 (MVP)
          </p>
          <p>
            <strong>Ubicación:</strong> Gualán, Zacapa, Guatemala
          </p>
        </div>
      </Card>

      {/* Logout Button */}
      <Button
        variant="outline"
        className="w-full text-red-600 border-red-200 hover:bg-red-50"
        onClick={handleLogout}
      >
        <LogOut className="w-5 h-5 mr-2" />
        Cerrar Sesión
      </Button>

      <p className="text-xs text-gray-500 text-center mt-6">
        Este es un prototipo en desarrollo. Los datos se guardan localmente en tu
        navegador.
      </p>
    </div>
  );
}