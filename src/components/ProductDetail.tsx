import { useState, useEffect } from 'react';
import { X, MapPin, Star, ShieldCheck, MessageCircle, ShoppingCart, Minus, Plus, Heart, Phone, Clock, Sparkles, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { ImageViewerModal } from './ImageViewerModal';
import { ShareButton } from './ShareButton';
import type { Product, Store, User, CartItem } from '../App';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { isFavorite, toggleFavorite } from '../utils/favorites';
import { shareProduct, generateProductShareMessage } from '../utils/share';
import { toast } from 'sonner@2.0.3';
import { getTimeUntilExpiration } from '../utils/productOfTheDay';

type ProductDetailProps = {
  product: Product;
  store?: Store;
  currentUser: User;
  onClose: () => void;
  onCartUpdate: () => void;
  onFavoritesChange?: () => void;
  onOpenChat?: (storeUserId: string, storeName: string) => void;
  onStoreClick?: (store: Store) => void;
};

export function ProductDetail({
  product,
  store,
  currentUser,
  onClose,
  onCartUpdate,
  onFavoritesChange,
  onOpenChat,
  onStoreClick,
}: ProductDetailProps) {
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFav, setIsFav] = useState(false);
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [storeOwnerPhone, setStoreOwnerPhone] = useState<string | null>(null);

  useEffect(() => {
    setIsFav(isFavorite(currentUser.id, product.id));
    
    // Obtener teléfono del dueño de la tienda
    if (store) {
      const usersStr = localStorage.getItem('users');
      if (usersStr) {
        const users: User[] = JSON.parse(usersStr);
        const storeOwner = users.find(u => u.id === store.userId);
        if (storeOwner) {
          setStoreOwnerPhone(storeOwner.phone);
        }
      }
    }
  }, [currentUser.id, product.id, store]);

  const addToCart = () => {
    const cartStr = localStorage.getItem('cart');
    const cart: CartItem[] = cartStr ? JSON.parse(cartStr) : [];

    const existingItemIndex = cart.findIndex(
      item => item.productId === product.id && item.selectedImageIndex === (product.images.length > 1 ? currentImageIndex : undefined)
    );

    if (existingItemIndex >= 0) {
      // Producto ya existe, incrementar cantidad
      cart[existingItemIndex].quantity += quantity;
      
      const imageRefText = product.images.length > 1 
        ? ` (Imagen ${currentImageIndex + 1} como referencia)` 
        : '';
      
      toast.success('Cantidad actualizada', {
        description: `Se agregaron ${quantity} unidad(es) más al carrito${imageRefText}. Total: ${cart[existingItemIndex].quantity}`,
        duration: 3000,
      });
    } else {
      const cartItem: CartItem = {
        productId: product.id,
        quantity,
        storeId: product.storeId,
      };
      
      // Si el producto tiene múltiples imágenes, guardar la imagen seleccionada
      if (product.images.length > 1) {
        cartItem.selectedImageIndex = currentImageIndex;
      }
      
      cart.push(cartItem);
      
      const imageRefText = product.images.length > 1 
        ? ` (Imagen ${currentImageIndex + 1} como referencia)` 
        : '';
      
      toast.success(`✓ ${quantity} producto(s) agregado(s) al carrito${imageRefText}`, {
        description: 'Usa el botón flotante para ver tu carrito',
        duration: 3000,
      });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    onCartUpdate();
    
    // Opcional: Cerrar el modal después de agregar al carrito
    // onClose();
  };

  const handleFavoriteToggle = () => {
    toggleFavorite(currentUser.id, product.id);
    setIsFav(!isFav);
    if (onFavoritesChange) {
      onFavoritesChange();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 overflow-y-auto">
      <div className="min-h-screen flex items-start md:items-center justify-center md:p-4">
        <Card className="w-full md:max-w-4xl md:w-full bg-white relative md:rounded-lg rounded-none min-h-screen md:min-h-0">
          <button
            onClick={onClose}
            className="sticky md:absolute top-2 md:top-4 right-2 md:right-4 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="grid md:grid-cols-2 gap-4 md:gap-6 p-3 md:p-6">
            {/* Images */}
            <div>
              <div 
                className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-3 md:mb-4 cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => setShowImageViewer(true)}
              >
                <ImageWithFallback
                  src={product.images[currentImageIndex]}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
              </div>
              {product.images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden border-2 flex-shrink-0 relative ${
                        index === currentImageIndex
                          ? 'border-emerald-600 ring-2 ring-emerald-300'
                          : 'border-gray-200'
                      }`}
                    >
                      <ImageWithFallback
                        src={image}
                        alt={`${product.title} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      {index === currentImageIndex && (
                        <div className="absolute inset-0 bg-emerald-600/20 flex items-center justify-center">
                          <div className="bg-emerald-600 text-white text-xs px-2 py-1 rounded-full">
                            Referencia
                          </div>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
              {product.images.length > 1 ? (
                <p className="text-xs text-emerald-600 text-center mt-2 font-medium">
                  📸 Imagen {currentImageIndex + 1} seleccionada como referencia
                </p>
              ) : (
                <p className="text-xs text-gray-500 text-center mt-2">
                  Toca la imagen para ampliar
                </p>
              )}
            </div>

            {/* Details */}
            <div className="flex flex-col">
              <div className="mb-2 flex flex-wrap gap-2 items-center">
                <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-sm">
                  {product.category}
                </span>
                
                {/* Product of the Day Badge */}
                {product.isProductOfTheDay && (
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full animate-pulse opacity-50" />
                    <div className="relative bg-gradient-to-r from-yellow-400 via-yellow-500 to-amber-500 text-gray-900 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1.5 shadow-md">
                      <Sparkles className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '3s' }} />
                      <span className="uppercase text-xs tracking-wide">Producto del Día</span>
                      <Clock className="w-3.5 h-3.5" />
                    </div>
                  </div>
                )}
              </div>
              
              {/* Time Remaining Alert - Only for Product of the Day */}
              {product.isProductOfTheDay && product.expiresAt && (
                <div className="mb-4 bg-yellow-50 border-2 border-yellow-400 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-yellow-900 mb-1">
                        ⏰ ¡Disponible solo hoy!
                      </p>
                      <p className="text-xs text-yellow-800">
                        Este producto desaparecerá al finalizar el día (23:59)
                      </p>
                      <p className="text-xs font-medium text-yellow-900 mt-1">
                        {getTimeUntilExpiration(product)}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <h2 className="text-2xl md:text-3xl text-gray-900 mb-3 md:mb-4">
                {product.title}
              </h2>

              <div className="text-2xl md:text-3xl text-emerald-600 mb-4 md:mb-6">
                Q {product.price.toFixed(2)}
              </div>

              <div className="mb-4 md:mb-6">
                <h3 className="text-sm text-gray-500 mb-2">Descripción</h3>
                <p className="text-gray-700">{product.description}</p>
              </div>

              {/* Store Info */}
              {store && (
                <Card className="p-3 md:p-4 mb-4 md:mb-6 bg-gray-50">
                  <div className="flex items-start justify-between mb-2">
                    <div className="w-full">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 
                          className={`text-base md:text-lg text-gray-900 ${onStoreClick ? 'cursor-pointer hover:text-emerald-600 transition-colors' : ''}`}
                          onClick={() => {
                            if (onStoreClick && store) {
                              onStoreClick(store);
                            }
                          }}
                        >
                          {store.name}
                        </h4>
                        {store.verified && (
                          <ShieldCheck className="w-4 h-4 text-blue-600" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{store.description}</p>
                      {storeOwnerPhone && (
                        <a
                          href={`https://wa.me/502${storeOwnerPhone.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-sm text-emerald-600 hover:text-emerald-700 hover:underline transition-colors mb-2"
                        >
                          <Phone className="w-4 h-4" />
                          <span>{storeOwnerPhone}</span>
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>{store.location}</span>
                    </div>
                    {store.totalReviews > 0 && (
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span>
                          {store.rating.toFixed(1)} ({store.totalReviews})
                        </span>
                      </div>
                    )}
                  </div>
                </Card>
              )}

              {/* Quantity Selector */}
              <div className="mb-4 md:mb-6">
                <label className="text-sm text-gray-500 mb-2 block">
                  Cantidad
                </label>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="text-xl w-12 text-center">{quantity}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-auto space-y-3 pb-safe">
                <Button
                  className="w-full bg-emerald-600 hover:bg-emerald-700"
                  onClick={addToCart}
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Agregar al Carrito
                </Button>
                
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      if (onOpenChat && store) {
                        onOpenChat(store.userId, store.name);
                      } else {
                        alert('Función de chat próximamente');
                      }
                    }}
                  >
                    <MessageCircle className="w-5 h-5 mr-2" />
                    Contactar
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleFavoriteToggle}
                  >
                    <Heart className={`w-5 h-5 mr-2 ${isFav ? 'fill-red-500 text-red-500' : ''}`} />
                    {isFav ? 'Favorito' : 'Favoritos'}
                  </Button>
                </div>

                <ShareButton
                  onWhatsAppShare={() => shareProduct(product, store)}
                  shareMessage={generateProductShareMessage(product, store)}
                  variant="outline"
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Image Viewer Modal */}
      {showImageViewer && (
        <ImageViewerModal
          images={product.images}
          currentIndex={currentImageIndex}
          onClose={() => setShowImageViewer(false)}
          onImageChange={setCurrentImageIndex}
          visible={showImageViewer}
        />
      )}
    </div>
  );
}