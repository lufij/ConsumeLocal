import { Heart, ShoppingCart, ArrowLeft } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { ProductDetail } from './ProductDetail';
import type { User, Product, Store } from '../App';
import { getFavorites, addFavorite, removeFavorite } from '../utils/favorites';
import { productsAPI, storesAPI, favoritesAPI } from '../utils/api';

type FavoritesScreenProps = {
  currentUser: User;
  onCartUpdate?: () => void;
  onFavoritesChange?: () => void;
  onBack?: () => void;
};

export function FavoritesScreen({
  currentUser,
  onCartUpdate,
  onFavoritesChange,
  onBack,
}: FavoritesScreenProps) {
  const [favoriteProducts, setFavoriteProducts] = useState<Product[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      // Get user's favorite product IDs from Supabase
      const favResult = await favoritesAPI.get(currentUser.id);
      const favoriteIds = favResult.success && favResult.data 
        ? (favResult.data as string[]) 
        : [];

      // Load all products and stores from Supabase
      const productsResult = await productsAPI.getAll();
      const storesResult = await storesAPI.getAll();

      if (!productsResult.success || !productsResult.data) {
        setFavoriteProducts([]);
        return;
      }

      const allProducts = productsResult.data as Product[];
      const allStores = storesResult.success && storesResult.data 
        ? storesResult.data as Store[] 
        : [];

      // Filter products that are in favorites
      const favorites = allProducts.filter(product =>
        favoriteIds.includes(product.id) && product.inStock !== false
      );

      setFavoriteProducts(favorites);
      setStores(allStores);
    } catch (error) {
      console.error('Error cargando favoritos:', error);
      setFavoriteProducts([]);
      setStores([]);
    }
  };

  const getStoreForProduct = (productId: string): Store | undefined => {
    const product = favoriteProducts.find(p => p.id === productId);
    if (!product) return undefined;
    return stores.find(s => s.id === product.storeId);
  };

  const handleProductDetailClose = () => {
    setSelectedProduct(null);
    // Reload favorites in case user removed favorite from detail view
    loadFavorites();
    onFavoritesChange?.();
  };

  if (selectedProduct) {
    return (
      <ProductDetail
        product={selectedProduct}
        store={getStoreForProduct(selectedProduct.id)}
        currentUser={currentUser}
        onClose={handleProductDetailClose}
        onCartUpdate={onCartUpdate}
      />
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {onBack && (
        <Button
          variant="ghost"
          onClick={onBack}
          className="mb-4"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Volver
        </Button>
      )}
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-red-100 p-3 rounded-full">
          <Heart className="w-6 h-6 text-red-600 fill-red-600" />
        </div>
        <div>
          <h2 className="text-2xl text-gray-900">Mis Favoritos</h2>
          <p className="text-sm text-gray-600">
            {favoriteProducts.length} producto{favoriteProducts.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {favoriteProducts.length === 0 ? (
        <Card className="p-12 text-center">
          <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl text-gray-600 mb-2">
            No tienes favoritos aún
          </h3>
          <p className="text-gray-500">
            Toca el corazón en los productos que te gusten para guardarlos aquí
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {favoriteProducts.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              store={getStoreForProduct(product.id)}
              onClick={() => setSelectedProduct(product)}
              userId={currentUser.id}
              onFavoritesChange={() => {
                loadFavorites();
                onFavoritesChange?.();
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}