import { useState, useEffect } from 'react';
import { TrendingUp, Store as StoreIcon, ShieldCheck, Search, Clock } from 'lucide-react';
import { Card } from './ui/card';
import { ProductCard } from './ProductCard';
import { ProductDetail } from './ProductDetail';
import { SearchScreen } from './SearchScreen';
import { ChatScreen } from './ChatScreen';
import { StoreView } from './StoreView';
import { SearchBar, type SearchFilters } from './SearchBar';
import { ProductGridSkeleton, StoreCardSkeleton } from './SkeletonLoader';
import { getStoreRating } from '../utils/reviews';
import { initializeSampleReviews } from '../utils/initializeReviews';
import type { User, Product, Store } from '../App';
import { productsAPI, storesAPI } from '../utils/api';
import { cachedAPI } from '../utils/api';

type HomeScreenProps = {
  currentUser: User;
  onCartUpdate?: () => void;
  onBackButton?: () => boolean; // Retorna true si manejó el evento, false si debe propagarse
  onSubScreenChange?: (hasSubScreen: boolean) => void; // Notifica cuando hay sub-pantallas abiertas
};

export function HomeScreen({
  currentUser,
  onCartUpdate,
  onBackButton,
  onSubScreenChange,
}: HomeScreenProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showChat, setShowChat] = useState(false);
  const [chatStoreId, setChatStoreId] = useState<string | undefined>();
  const [chatStoreName, setChatStoreName] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<SearchFilters>({
    category: 'all',
    minPrice: '',
    maxPrice: '',
    sortBy: 'newest',
  });

  useEffect(() => {
    loadData();
  }, []);

  // Notificar cuando hay sub-pantallas abiertas
  useEffect(() => {
    const hasSubScreen = !!(selectedProduct || selectedStore || showChat);
    console.log('🔍 HomeScreen - hasSubScreen:', hasSubScreen, { selectedProduct: !!selectedProduct, selectedStore: !!selectedStore, showChat });
    onSubScreenChange?.(hasSubScreen);
  }, [selectedProduct, selectedStore, showChat, onSubScreenChange]);

  // Escuchar evento de botón atrás
  useEffect(() => {
    const handleBackButton = () => {
      console.log('⬅️ HomeScreen - Botón atrás presionado', { selectedProduct: !!selectedProduct, selectedStore: !!selectedStore, showChat });
      
      // Si hay algo abierto, cerrarlo
      if (selectedProduct) {
        setSelectedProduct(null);
        return true; // Manejamos el evento
      }
      if (selectedStore) {
        setSelectedStore(null);
        return true;
      }
      if (showChat) {
        setShowChat(false);
        return true;
      }
      
      return false; // No manejamos, dejar que se propague
    };

    // Registrar el manejador
    if (onBackButton) {
      (window as any).__homeScreenBackHandler = handleBackButton;
    }

    return () => {
      delete (window as any).__homeScreenBackHandler;
    };
  }, [selectedProduct, selectedStore, showChat, onBackButton]);

  const loadData = async () => {
    try {
      // Load products and stores with caching
      const [productsResult, storesResult] = await Promise.all([
        cachedAPI.getProducts(),
        cachedAPI.getStores(),
      ]);

      if (productsResult.success && productsResult.data) {
        setProducts(productsResult.data as Product[]);
      }

      if (storesResult.success && storesResult.data) {
        setStores(storesResult.data as Store[]);
      }

      // Initialize sample reviews (solo si hay stores)
      const reviewsStr = localStorage.getItem('reviews');
      if (reviewsStr) {
        initializeSampleReviews();
      }
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStoreForProduct = (productId: string): Store | undefined => {
    const product = products.find(p => p.id === productId);
    if (!product) return undefined;
    return stores.find(s => s.id === product.storeId);
  };

  // Get unique categories from products
  const categories = [...new Set(products.map(p => p.category))].filter(Boolean);

  // Apply search and filters
  const getFilteredProducts = (): Product[] => {
    let filtered = [...products];

    // FILTRAR PRODUCTOS AGOTADOS - No mostrar productos sin stock
    filtered = filtered.filter(product => product.inStock !== false);

    // Apply search query - BÚSQUEDA MEJORADA
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      const queryWords = query.split(' ').filter(w => w.length > 0);
      
      filtered = filtered.filter(product => {
        // Buscar en título del producto
        const titleMatch = product.title.toLowerCase().includes(query);
        
        // Buscar en descripción del producto
        const descriptionMatch = product.description.toLowerCase().includes(query);
        
        // Buscar en categoría
        const categoryMatch = product.category.toLowerCase().includes(query);
        
        // Buscar en nombre de la tienda
        const store = stores.find(s => s.id === product.storeId);
        const storeNameMatch = store ? store.name.toLowerCase().includes(query) : false;
        const storeDescriptionMatch = store ? store.description.toLowerCase().includes(query) : false;
        
        // Búsqueda difusa por palabras - si cualquier palabra coincide parcialmente
        const fuzzyMatch = queryWords.some(word => {
          return (
            product.title.toLowerCase().includes(word) ||
            product.description.toLowerCase().includes(word) ||
            product.category.toLowerCase().includes(word) ||
            (store && store.name.toLowerCase().includes(word)) ||
            (store && store.description.toLowerCase().includes(word))
          );
        });
        
        // Retornar true si hay cualquier coincidencia
        return titleMatch || descriptionMatch || categoryMatch || 
               storeNameMatch || storeDescriptionMatch || fuzzyMatch;
      });
    }

    // Apply category filter
    if (filters.category !== 'all') {
      filtered = filtered.filter(product => product.category === filters.category);
    }

    // Apply price range filter
    const minPrice = filters.minPrice ? parseFloat(filters.minPrice) : 0;
    const maxPrice = filters.maxPrice ? parseFloat(filters.maxPrice) : Infinity;
    
    if (filters.minPrice || filters.maxPrice) {
      filtered = filtered.filter(product => 
        product.price >= minPrice && product.price <= maxPrice
      );
    }

    // Apply sorting
    switch (filters.sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case 'price-asc':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'name-asc':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
    }

    return filtered;
  };

  const filteredProducts = getFilteredProducts();
  const hasActiveSearch = searchQuery.trim() || 
    filters.category !== 'all' || 
    filters.minPrice !== '' || 
    filters.maxPrice !== '' || 
    filters.sortBy !== 'newest';

  const handleOpenChat = (storeUserId: string, storeName: string) => {
    setChatStoreId(storeUserId);
    setChatStoreName(storeName);
    setShowChat(true);
    setSelectedProduct(null); // Cerrar el detalle del producto
  };

  const handleStoreClick = (store: Store) => {
    setSelectedStore(store);
    setSelectedProduct(null); // Cerrar el detalle del producto si está abierto
  };

  if (selectedStore) {
    return (
      <StoreView
        store={selectedStore}
        currentUser={currentUser}
        onBack={() => setSelectedStore(null)}
        onProductClick={(product) => {
          setSelectedStore(null);
          setSelectedProduct(product);
        }}
      />
    );
  }

  if (showChat) {
    return (
      <ChatScreen
        currentUser={currentUser}
        onBack={() => setShowChat(false)}
        initialStoreId={chatStoreId}
        initialStoreName={chatStoreName}
      />
    );
  }

  if (selectedProduct) {
    return (
      <ProductDetail
        product={selectedProduct}
        store={getStoreForProduct(selectedProduct.id)}
        currentUser={currentUser}
        onClose={() => setSelectedProduct(null)}
        onCartUpdate={onCartUpdate}
        onOpenChat={handleOpenChat}
        onStoreClick={handleStoreClick}
      />
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl p-6 mb-6 shadow-lg">
        <h2 className="text-2xl mb-2">¡Bienvenido, {currentUser.name}!</h2>
        <p className="text-emerald-50">
          Descubre los mejores productos de tu comunidad
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <SearchBar
          onSearch={(query) => setSearchQuery(query)}
          onFilterChange={(newFilters) => setFilters(newFilters)}
          categories={categories}
          currentFilters={filters}
          userId={currentUser.id}
        />
      </div>

      {/* Products Grid */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {hasActiveSearch ? (
              <Search className="w-5 h-5 text-emerald-600" />
            ) : (
              <Clock className="w-5 h-5 text-emerald-600" />
            )}
            <h3 className="text-xl text-gray-900">
              {hasActiveSearch ? `Resultados (${filteredProducts.length})` : 'Productos Recientes'}
            </h3>
          </div>
        </div>
        
        {isLoading ? (
          <ProductGridSkeleton count={8} />
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredProducts.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                store={getStoreForProduct(product.id)}
                onClick={() => setSelectedProduct(product)}
                userId={currentUser.id}
              />
            ))}
          </div>
        ) : hasActiveSearch ? (
          <div className="text-center py-12">
            <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl text-gray-600 mb-2">
              No se encontraron productos
            </h3>
            <p className="text-gray-500">
              Intenta ajustar tus filtros o usar otras palabras clave
            </p>
          </div>
        ) : (
          <div className="text-center py-12">
            <StoreIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl text-gray-600 mb-2">
              No hay productos disponibles
            </h3>
            <p className="text-gray-500">
              Sé el primero en publicar productos en tu comunidad
            </p>
          </div>
        )}
      </section>
    </div>
  );
}