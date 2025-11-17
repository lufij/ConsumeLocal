import { useState, useEffect } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { ProductCard } from './ProductCard';
import { ProductDetail } from './ProductDetail';
import type { User, Product, Store } from '../App';

type SearchScreenProps = {
  currentUser: User;
  onCartUpdate: () => void;
  onFavoritesChange: () => void;
};

const CATEGORIES = [
  'Todas',
  'Ropa',
  'Calzado',
  'Alimentos',
  'Artesanías',
  'Electrónica',
  'Hogar',
  'Belleza',
  'Deportes',
  'Juguetes',
  'Otro',
];

const LOCATIONS = [
  'Todas',
  'Centro de Gualán',
  'Barrio El Carmen',
  'Barrio San Sebastián',
  'Barrio La Cruz',
  'Colonia El Milagro',
  'Colonia Las Flores',
  'Aldea El Jícaro',
];

export function SearchScreen({ currentUser, onCartUpdate, onFavoritesChange }: SearchScreenProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [selectedLocation, setSelectedLocation] = useState('Todas');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const productsStr = localStorage.getItem('products');
    const storesStr = localStorage.getItem('stores');

    if (productsStr) {
      setProducts(JSON.parse(productsStr));
    }
    if (storesStr) {
      setStores(JSON.parse(storesStr));
    }
  };

  const getStoreForProduct = (productId: string): Store | undefined => {
    const product = products.find(p => p.id === productId);
    if (!product) return undefined;
    return stores.find(s => s.id === product.storeId);
  };

  const filteredProducts = products.filter(product => {
    // Search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesTitle = product.title.toLowerCase().includes(query);
      const matchesDescription = product.description.toLowerCase().includes(query);
      const matchesCategory = product.category.toLowerCase().includes(query);
      if (!matchesTitle && !matchesDescription && !matchesCategory) {
        return false;
      }
    }

    // Category filter
    if (selectedCategory !== 'Todas' && product.category !== selectedCategory) {
      return false;
    }

    // Location filter
    if (selectedLocation !== 'Todas') {
      const store = getStoreForProduct(product.id);
      if (!store || store.location !== selectedLocation) {
        return false;
      }
    }

    // Price filter
    if (minPrice && product.price < parseFloat(minPrice)) {
      return false;
    }
    if (maxPrice && product.price > parseFloat(maxPrice)) {
      return false;
    }

    return true;
  });

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('Todas');
    setSelectedLocation('Todas');
    setMinPrice('');
    setMaxPrice('');
  };

  if (selectedProduct) {
    return (
      <ProductDetail
        product={selectedProduct}
        store={getStoreForProduct(selectedProduct.id)}
        currentUser={currentUser}
        onClose={() => setSelectedProduct(null)}
        onCartUpdate={onCartUpdate}
        onFavoritesChange={onFavoritesChange}
      />
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Search Bar */}
      <div className="mb-6">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Buscar productos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className={showFilters ? 'bg-emerald-50' : ''}
          >
            <Filter className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <Card className="p-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg text-gray-900">Filtros</h3>
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Limpiar
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-600 mb-2 block">
                Categoría
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm text-gray-600 mb-2 block">
                Ubicación
              </label>
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {LOCATIONS.map(loc => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm text-gray-600 mb-2 block">
                Precio Mínimo (Q)
              </label>
              <Input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm text-gray-600 mb-2 block">
                Precio Máximo (Q)
              </label>
              <Input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
              />
            </div>
          </div>
        </Card>
      )}

      {/* Results */}
      <div className="mb-4">
        <p className="text-gray-600">
          {filteredProducts.length} producto{filteredProducts.length !== 1 ? 's' : ''} encontrado{filteredProducts.length !== 1 ? 's' : ''}
        </p>
      </div>

      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredProducts.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              store={getStoreForProduct(product.id)}
              onClick={() => setSelectedProduct(product)}
              userId={currentUser.id}
              onFavoriteChange={onFavoritesChange}
            />
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl text-gray-600 mb-2">
            No se encontraron productos
          </h3>
          <p className="text-gray-500">
            Intenta con otros términos de búsqueda o filtros
          </p>
        </Card>
      )}
    </div>
  );
}