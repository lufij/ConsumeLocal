import { storesAPI, productsAPI, ordersAPI, chatsAPI } from '../utils/api';
import { cachedAPI, lastSeenAPI } from '../utils/api';
import { useState, useEffect } from 'react';
import type { User, Product, Store } from '../App';
import { toast } from 'sonner@2.0.3';
import { getTimeUntilExpiration } from '../utils/productOfTheDay';
import { 
  Package, 
  Plus, 
  Edit2, 
  Trash2, 
  ShoppingBag, 
  MessageSquare, 
  PackageCheck,
  Clock,
  Sparkles,
  PowerOff,
  Power
} from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Skeleton } from './ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { StoreSetup } from './StoreSetup';
import { AddProduct } from './AddProduct';
import { ProductOfTheDayForm } from './ProductOfTheDayForm';
import { StoreSales } from './StoreSales';
import { StoreOrdersScreen } from './StoreOrdersScreen';
import { ChatScreen } from './ChatScreen';

type Order = {
  id: string;
  buyerId: string;
  items: { productId: string; quantity: number; price: number; selectedImageIndex?: number }[];
  storeId: string;
  total: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  createdAt: string;
  buyerNotes?: string;
  sellerNotes?: string;
  adjustedTotal?: number;
};

type MyStoreProps = {
  currentUser: User;
  setCurrentUser: (user: User) => void;
};

type Tab = 'products' | 'sales' | 'orders' | 'chat';

export function MyStore({ currentUser, setCurrentUser }: MyStoreProps) {
  const [store, setStore] = useState<Store | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showStoreSetup, setShowStoreSetup] = useState(false);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showProductOfTheDay, setShowProductOfTheDay] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('products');
  const [chatUserId, setChatUserId] = useState<string | undefined>(undefined);
  const [chatUserName, setChatUserName] = useState<string | undefined>(undefined);
  const [ordersCount, setOrdersCount] = useState(0);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);

  useEffect(() => {
    loadStoreData();
  }, [currentUser]);

  // Recargar contadores cuando regresa al tab de productos desde chat
  useEffect(() => {
    if (activeTab === 'products' || activeTab === 'orders') {
      // Recargar los contadores cuando vuelve de chat
      if (currentUser.hasStore && currentUser.storeId) {
        const ordersStr = localStorage.getItem('orders');
        if (ordersStr) {
          const allOrders: Order[] = JSON.parse(ordersStr);
          // Solo contar pedidos pendientes
          const pendingOrders = allOrders.filter(
            o => o.storeId === currentUser.storeId && o.status === 'pending'
          );
          setOrdersCount(pendingOrders.length);
        }
        loadUnreadMessagesCount();
      }
    }
  }, [activeTab]);

  const loadStoreData = async () => {
    if (currentUser.hasStore && currentUser.storeId) {
      try {
        // Load all data in parallel with caching
        const [storesResult, productsResult, ordersResult] = await Promise.all([
          cachedAPI.getStores(),
          cachedAPI.getProducts(),
          cachedAPI.getOrders(),
        ]);

        // Load store
        if (storesResult.success && storesResult.data) {
          const stores = storesResult.data as Store[];
          const userStore = stores.find(s => s.id === currentUser.storeId);
          if (userStore) {
            console.log('🟣 [MyStore] Store cargado con caché, tiene logo:', userStore.logo ? 'SÍ' : 'NO');
            setStore(userStore);
          }
        }

        // Load products
        if (productsResult.success && productsResult.data) {
          const allProducts = productsResult.data as Product[];
          const storeProducts = allProducts.filter(
            p => p.storeId === currentUser.storeId
          );
          console.log('🟣 [MyStore] Productos cargados con caché:', storeProducts.length);
          setProducts(storeProducts);
        }

        // Load orders count
        if (ordersResult.success && ordersResult.data) {
          const allOrders = ordersResult.data as Order[];
          const pendingOrders = allOrders.filter(
            o => o.storeId === currentUser.storeId && o.status === 'pending'
          );
          setOrdersCount(pendingOrders.length);
        }

        // Load unread messages count
        loadUnreadMessagesCount();
      } catch (error) {
        console.error('Error cargando datos de tienda:', error);
      }
    }
    setLoading(false);
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
      console.log(`✅ Mensajes sin leer (MyStore): ${totalUnread}`);
    } catch (error) {
      console.error('Error al cargar mensajes sin leer:', error);
      setUnreadMessagesCount(0);
    }
  };

  const handleStoreCreated = (newStore: Store) => {
    console.log('🟣 [MyStore] Store recibido, tiene logo:', newStore.logo ? 'SÍ' : 'NO');
    setStore(newStore);
    const updatedUser = {
      ...currentUser,
      hasStore: true,
      storeId: newStore.id,
    };
    setCurrentUser(updatedUser);
    
    // Update current user in localStorage
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    
    // IMPORTANT: Also update the user in the users array
    const usersStr = localStorage.getItem('users');
    if (usersStr) {
      const users: User[] = JSON.parse(usersStr);
      const userIndex = users.findIndex(u => u.id === currentUser.id);
      if (userIndex >= 0) {
        users[userIndex] = updatedUser;
        localStorage.setItem('users', JSON.stringify(users));
        console.log('🟣 [MyStore] Usuario actualizado en array de users con storeId:', updatedUser.storeId);
      }
    }
    
    setShowStoreSetup(false);
    
    // Forzar recarga después de un breve delay para asegurar que se vea el logo
    setTimeout(() => {
      loadStoreData();
      console.log('🟣 [MyStore] Datos recargados después de guardar');
    }, 100);
  };

  const handleProductSaved = async () => {
    // Invalidar caché de productos para forzar actualización
    cachedAPI.invalidateProducts();
    await loadStoreData();
    setShowAddProduct(false);
    setEditingProduct(null);
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      // Get product title before deleting
      const product = products.find(p => p.id === productId);
      
      // Delete from Supabase
      const result = await productsAPI.delete(productId);
      
      if (!result.success) {
        throw new Error(result.error || 'Error al eliminar producto');
      }
      
      // Invalidar caché y recargar
      cachedAPI.invalidateProducts();
      await loadStoreData();
      
      // Cerrar el diálogo y resetear el producto
      setDeleteDialogOpen(false);
      setProductToDelete(null);
      
      // Mostrar toast de confirmación
      toast.success('Producto eliminado', {
        description: product ? `"${product.title}" ha sido eliminado de tu tienda` : undefined,
      });
    } catch (error) {
      console.error('Error eliminando producto:', error);
      toast.error('Error al eliminar producto');
    }
  };

  const handleReactivateProductOfDay = async (productId: string) => {
    try {
      const product = products.find(p => p.id === productId);
      
      // Reactivar producto del día
      const result = await productsAPI.reactivateProductOfDay(productId);
      
      if (!result.success) {
        throw new Error(result.error || 'Error al reactivar producto');
      }
      
      // Invalidar caché y recargar
      cachedAPI.invalidateProducts();
      await loadStoreData();
      
      // Mostrar toast de confirmación
      toast.success('¡Producto reactivado! 🌟', {
        description: product ? `"${product.title}" estará disponible hasta las 23:59` : 'Se desactivará automáticamente al final del d��a',
      });
    } catch (error) {
      console.error('Error reactivando producto:', error);
      toast.error('Error al reactivar producto');
    }
  };

  if (showStoreSetup) {
    return (
      <StoreSetup
        currentUser={currentUser}
        existingStore={store}
        onSave={handleStoreCreated}
        onCancel={() => setShowStoreSetup(false)}
      />
    );
  }

  if (showAddProduct || editingProduct) {
    return (
      <AddProduct
        store={store!}
        existingProduct={editingProduct}
        onSave={handleProductSaved}
        onCancel={() => {
          setShowAddProduct(false);
          setEditingProduct(null);
        }}
      />
    );
  }

  if (showProductOfTheDay && store) {
    const categories = [
      'Comida',
      'Ropa',
      'Electrónica',
      'Hogar',
      'Deportes',
      'Belleza',
      'Juguetes',
      'Libros',
      'Mascotas',
      'Otro'
    ];
    
    return (
      <ProductOfTheDayForm
        storeId={store.id}
        categories={categories}
        onClose={() => setShowProductOfTheDay(false)}
        onProductAdded={() => {
          setShowProductOfTheDay(false);
          loadStoreData();
        }}
      />
    );
  }

  if (!currentUser.hasStore) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <Card className="p-8 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-100 rounded-full mb-4">
            <Package className="w-10 h-10 text-emerald-600" />
          </div>
          <h2 className="text-2xl text-gray-900 mb-2">
            Crea Tu Tienda Virtual
          </h2>
          <p className="text-gray-600 mb-6">
            Comienza a vender tus productos en Gualán Market. Es fácil, rápido y
            gratuito.
          </p>
          <Button
            className="bg-emerald-600 hover:bg-emerald-700"
            onClick={() => setShowStoreSetup(true)}
          >
            <Plus className="w-5 h-5 mr-2" />
            Crear Mi Tienda
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Store Header */}
      {store && (
        <Card className="p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex gap-4">
              {store.logo && store.logo.length > 0 && (
                <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                  <img
                    src={store.logo}
                    alt={store.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.error('Error loading store logo');
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              )}
              <div>
                <h2 className="text-2xl text-gray-900 mb-1">{store.name}</h2>
                <p className="text-gray-600 mb-2">{store.description}</p>
                <p className="text-sm text-gray-500">{store.location}</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowStoreSetup(true)}
            >
              <Edit2 className="w-4 h-4 mr-2" />
              Editar
            </Button>
          </div>
        </Card>
      )}

      {/* Tabs */}
      <div className="mb-6">
        <div className="grid grid-cols-4 gap-2 sm:gap-4">
          <button
            onClick={() => setActiveTab('products')}
            className={`flex flex-col items-center gap-1 sm:gap-2 p-3 sm:p-4 rounded-lg transition-all ${
              activeTab === 'products'
                ? 'bg-emerald-50 text-emerald-600 shadow-sm'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            <div className="relative">
              <Package className="w-5 h-5 sm:w-6 sm:h-6" />
              {products.length > 0 && (
                <span className="absolute -top-1 -right-1 px-1 min-w-[18px] h-[18px] rounded-full text-xs bg-emerald-500 text-white flex items-center justify-center">
                  {products.length}
                </span>
              )}
            </div>
            <span className="text-xs sm:text-sm text-center leading-tight">Productos</span>
          </button>

          <button
            onClick={() => setActiveTab('sales')}
            className={`flex flex-col items-center gap-1 sm:gap-2 p-3 sm:p-4 rounded-lg transition-all ${
              activeTab === 'sales'
                ? 'bg-emerald-50 text-emerald-600 shadow-sm'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6" />
            <span className="text-xs sm:text-sm text-center leading-tight">Ventas</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`flex flex-col items-center gap-1 sm:gap-2 p-3 sm:p-4 rounded-lg transition-all ${
              activeTab === 'orders'
                ? 'bg-emerald-50 text-emerald-600 shadow-sm'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            <div className={`relative ${ordersCount > 0 ? 'animate-subtle-bounce' : ''}`}>
              <PackageCheck className="w-5 h-5 sm:w-6 sm:h-6" />
              {ordersCount > 0 && (
                <>
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center z-10">
                    <span className="text-xs font-bold text-white">{ordersCount}</span>
                  </div>
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-400 rounded-full animate-ping" />
                </>
              )}
            </div>
            <span className="text-xs sm:text-sm text-center leading-tight">Pedidos</span>
          </button>

          <button
            onClick={() => setActiveTab('chat')}
            className={`flex flex-col items-center gap-1 sm:gap-2 p-3 sm:p-4 rounded-lg transition-all ${
              activeTab === 'chat'
                ? 'bg-emerald-50 text-emerald-600 shadow-sm'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            <div className="relative">
              <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6" />
              {unreadMessagesCount > 0 && (
                <>
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center animate-bounce z-10">
                    <span className="text-xs font-bold text-white">{unreadMessagesCount}</span>
                  </div>
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full animate-ping" />
                </>
              )}
            </div>
            <span className="text-xs sm:text-sm text-center leading-tight">Chat</span>
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'products' ? (
        <div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-3">
            <h3 className="text-xl text-gray-900">Gestión de Productos</h3>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button
                className="flex-1 sm:flex-none bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-white shadow-md"
                onClick={() => setShowProductOfTheDay(true)}
              >
                <Clock className="w-5 h-5 mr-2" />
                Producto del Día
              </Button>
              <Button
                className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-700"
                onClick={() => setShowAddProduct(true)}
              >
                <Plus className="w-5 h-5 mr-2" />
                Agregar Producto
              </Button>
            </div>
          </div>

          {products.length === 0 ? (
            <Card className="p-12 text-center">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl text-gray-600 mb-2">
                No tienes productos aún
              </h3>
              <p className="text-gray-500 mb-4">
                Agrega tu primer producto para comenzar a vender
              </p>
              <Button
                className="bg-emerald-600 hover:bg-emerald-700"
                onClick={() => setShowAddProduct(true)}
              >
                <Plus className="w-5 h-5 mr-2" />
                Agregar Producto
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {products.map(product => (
                <Card key={product.id} className="overflow-hidden">
                  {/* Image Grid - Similar to ProductCard */}
                  <div className="aspect-square bg-gray-100 relative">
                    {product.images.length === 1 ? (
                      // Single image
                      <ImageWithFallback
                        src={product.images[0]}
                        alt={product.title}
                        className="w-full h-full object-cover"
                      />
                    ) : product.images.length === 2 ? (
                      // Two images side by side
                      <div className="grid grid-cols-2 gap-0.5 h-full">
                        <ImageWithFallback
                          src={product.images[0]}
                          alt={product.title}
                          className="w-full h-full object-cover"
                        />
                        <ImageWithFallback
                          src={product.images[1]}
                          alt={product.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      // Three or more images
                      <div className="grid grid-cols-2 gap-0.5 h-full">
                        {/* First image takes full left side */}
                        <ImageWithFallback
                          src={product.images[0]}
                          alt={product.title}
                          className="w-full h-full object-cover"
                        />
                        {/* Right side split into two */}
                        <div className="grid grid-rows-2 gap-0.5">
                          <ImageWithFallback
                            src={product.images[1]}
                            alt={product.title}
                            className="w-full h-full object-cover"
                          />
                          {/* Third image with overlay if more images exist */}
                          <div className="relative">
                            <ImageWithFallback
                              src={product.images[2]}
                              alt={product.title}
                              className="w-full h-full object-cover"
                            />
                            {product.images.length > 3 && (
                              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                <span className="text-white text-2xl font-semibold">
                                  +{product.images.length - 3}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className="text-lg text-gray-900 line-clamp-1 flex-1">
                        {product.title}
                      </h4>
                      {product.isProductOfTheDay && (
                        <div className="flex-shrink-0">
                          <Sparkles className="w-5 h-5 text-yellow-500" />
                        </div>
                      )}
                    </div>
                    
                    {product.isProductOfTheDay && (
                      <div className="mb-2">
                        {product.inStock ? (
                          <div className="flex items-center gap-1 text-xs text-yellow-600 bg-yellow-50 px-2 py-1 rounded">
                            <Clock className="w-3 h-3" />
                            <span>{getTimeUntilExpiration(product)}</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            <PowerOff className="w-3 h-3" />
                            <span>Desactivado</span>
                          </div>
                        )}
                      </div>
                    )}
                    
                    <p className="text-xl text-emerald-600 mb-3">
                      Q {product.price.toFixed(2)}
                    </p>
                    
                    {/* Si es producto del día desactivado, mostrar botón de reactivación */}
                    {product.isProductOfTheDay && !product.inStock ? (
                      <div className="space-y-2">
                        <Button
                          className="w-full bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-white"
                          size="sm"
                          onClick={() => handleReactivateProductOfDay(product.id)}
                        >
                          <Power className="w-4 h-4 mr-1" />
                          Reactivar Hoy
                        </Button>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => setEditingProduct(product)}
                          >
                            <Edit2 className="w-4 h-4 mr-1" />
                            Editar
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setProductToDelete(product.id);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => setEditingProduct(product)}
                        >
                          <Edit2 className="w-4 h-4 mr-1" />
                          Editar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setProductToDelete(product.id);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      ) : activeTab === 'sales' ? (
        <StoreSales storeId={currentUser.storeId!} />
      ) : activeTab === 'orders' && store ? (
        <StoreOrdersScreen
          currentUser={currentUser}
          store={store}
          onOpenChat={(buyerId, buyerName) => {
            setChatUserId(buyerId);
            setChatUserName(buyerName);
            setActiveTab('chat');
          }}
        />
      ) : activeTab === 'chat' ? (
        <ChatScreen 
          currentUser={currentUser}
          onBack={() => {
            setActiveTab('orders');
            setChatUserId(undefined);
            setChatUserName(undefined);
          }}
          initialUserId={chatUserId}
          initialUserName={chatUserName}
        />
      ) : null}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar producto?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El producto será eliminado permanentemente de tu tienda.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setDeleteDialogOpen(false);
              setProductToDelete(null);
            }}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (productToDelete) {
                  handleDeleteProduct(productToDelete);
                }
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}