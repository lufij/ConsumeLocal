import { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, Phone, Package, ShieldCheck, Star } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { ProductCard } from './ProductCard';
import { ShareButton } from './ShareButton';
import { AddReviewModal } from './AddReviewModal';
import { ReviewsList } from './ReviewsList';
import { shareStore, generateStoreShareMessage } from '../utils/share';
import type { Store, Product, User, Review } from '../App';
import { productsAPI, usersAPI, reviewsAPI, storesAPI } from '../utils/api';
import { toast } from 'sonner@2.0.3';

type StoreViewProps = {
  store: Store;
  currentUser: User;
  onBack: () => void;
  onProductClick: (product: Product) => void;
};

export function StoreView({ store, currentUser, onBack, onProductClick }: StoreViewProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [storeOwnerPhone, setStoreOwnerPhone] = useState<string | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isAddReviewModalOpen, setIsAddReviewModalOpen] = useState(false);

  useEffect(() => {
    loadStoreProducts();
    loadStoreOwnerPhone();
    loadStoreReviews();
  }, [store.id]);

  const loadStoreProducts = async () => {
    try {
      const result = await productsAPI.getAll();
      if (result.success && result.data) {
        const allProducts = result.data as Product[];
        // Filtrar solo productos de esta tienda y que estén en stock
        const storeProducts = allProducts.filter(p => 
          p.storeId === store.id && p.inStock !== false
        );
        setProducts(storeProducts);
      }
    } catch (error) {
      console.error('Error cargando productos:', error);
      toast.error('Error al cargar los productos');
    }
  };

  const loadStoreOwnerPhone = async () => {
    try {
      const result = await usersAPI.getAll();
      if (result.success && result.data) {
        const users = result.data as User[];
        const storeOwner = users.find(u => u.id === store.userId);
        if (storeOwner) {
          setStoreOwnerPhone(storeOwner.phone);
        }
      }
    } catch (error) {
      console.error('Error cargando teléfono:', error);
    }
  };

  const loadStoreReviews = async () => {
    try {
      const result = await reviewsAPI.getByStore(store.id);
      if (result.success && result.data) {
        setReviews(result.data as Review[]);
      }
    } catch (error) {
      console.error('Error cargando reseñas:', error);
    }
  };

  const handleAddReview = async (review: Review) => {
    try {
      const result = await reviewsAPI.create(review);
      if (!result.success) {
        throw new Error(result.error || 'Error al crear reseña');
      }
      
      // Actualizar rating de la tienda
      const newTotalReviews = store.totalReviews + 1;
      const newRating = ((store.rating * store.totalReviews) + review.rating) / newTotalReviews;
      
      await storesAPI.update(store.id, {
        rating: newRating,
        totalReviews: newTotalReviews
      });
      
      await loadStoreReviews();
      setIsAddReviewModalOpen(false);
      toast.success('Reseña agregada exitosamente');
    } catch (error) {
      console.error('Error agregando reseña:', error);
      toast.error('Error al agregar la reseña');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <Button
            variant="ghost"
            onClick={onBack}
            className="mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Volver
          </Button>

          {/* Store Header */}
          <div className="flex items-start gap-4 mb-4">
            {store.logo ? (
              <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                <ImageWithFallback
                  src={store.logo}
                  alt={store.name}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-20 h-20 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                <Package className="w-10 h-10 text-gray-400" />
              </div>
            )}
            
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl text-gray-900">{store.name}</h1>
                {store.verified && (
                  <ShieldCheck className="w-5 h-5 text-blue-600" />
                )}
              </div>
              <p className="text-gray-600 mb-2">{store.description}</p>
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-2">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{store.location}</span>
                </div>
                {store.totalReviews > 0 && (
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span>
                      {store.rating.toFixed(1)} ({store.totalReviews} reseñas)
                    </span>
                  </div>
                )}
              </div>

              {storeOwnerPhone && (
                <a
                  href={`https://wa.me/502${storeOwnerPhone.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-emerald-600 hover:text-emerald-700 hover:underline transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  <span>{storeOwnerPhone}</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h2 className="text-xl text-gray-900">
            Catálogo de Productos
            <span className="ml-2 text-gray-500">({products.length})</span>
          </h2>
        </div>

        {products.length === 0 ? (
          <Card className="p-12 text-center">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl text-gray-600 mb-2">
              No hay productos disponibles
            </h3>
            <p className="text-gray-500">
              Esta tienda aún no ha publicado productos
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {products.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                store={store}
                onClick={() => onProductClick(product)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Reviews Section */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h2 className="text-xl text-gray-900">
            Reseñas y Calificaciones
          </h2>
        </div>

        <ReviewsList
          storeId={store.id}
          showAddButton={currentUser.id !== store.userId}
          onAddReview={() => setIsAddReviewModalOpen(true)}
        />
      </div>

      {/* Add Review Modal */}
      {isAddReviewModalOpen && (
        <AddReviewModal
          store={store}
          currentUser={currentUser}
          onClose={() => setIsAddReviewModalOpen(false)}
          onSubmit={handleAddReview}
        />
      )}

      {/* Share Store Button - Floating */}
      <div className="fixed bottom-20 right-4 z-20">
        <ShareButton
          onWhatsAppShare={() => shareStore(store, products.length)}
          shareMessage={generateStoreShareMessage(store, products.length)}
          variant="default"
          size="lg"
          showLabel={false}
          className="shadow-lg hover:shadow-xl transition-shadow bg-emerald-600 hover:bg-emerald-700 rounded-full w-14 h-14"
        />
      </div>
    </div>
  );
}