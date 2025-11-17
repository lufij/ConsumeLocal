import { useState, useEffect } from 'react';
import { Heart, Package, Star, Clock, ShieldCheck, MapPin } from 'lucide-react';
import { Card } from './ui/card';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { ReviewStars } from './ReviewStars';
import { isFavorite, toggleFavorite } from '../utils/favorites';
import type { Product, Store } from '../types';
import { getTimeUntilExpiration } from '../utils/productOfTheDay';
import { favoritesAPI } from '../utils/api';
import { toast } from 'sonner@2.0.3';

type ProductCardProps = {
  product: Product;
  store?: Store;
  onClick: () => void;
  userId?: string;
  onFavoriteChange?: () => void;
};

export function ProductCard({ product, store, onClick, userId, onFavoriteChange }: ProductCardProps) {
  const [isFav, setIsFav] = useState(false);

  useEffect(() => {
    if (userId) {
      setIsFav(isFavorite(userId, product.id));
    }
  }, [userId, product.id]);

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!userId) return;

    try {
      // Optimistic update
      const newState = !isFav;
      setIsFav(newState);
      
      // Update localStorage (cache local)
      toggleFavorite(userId, product.id);
      
      // Sync with Supabase
      if (newState) {
        await favoritesAPI.add(userId, product.id);
        toast.success('Agregado a favoritos');
      } else {
        await favoritesAPI.remove(userId, product.id);
        toast.success('Eliminado de favoritos');
      }
      
      onFavoriteChange?.();
    } catch (error) {
      console.error('Error actualizando favorito:', error);
      // Revert on error
      setIsFav(!isFav);
      toast.error('Error al actualizar favorito');
    }
  };

  return (
    <Card
      className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
      onClick={onClick}
    >
      {/* Image Grid */}
      <div className="aspect-square bg-gray-100 relative">
        {product.images.length === 1 ? (
          // Single image - full size
          <ImageWithFallback
            src={product.images[0]}
            alt={product.title}
            className="w-full h-full object-cover"
          />
        ) : product.images.length === 2 ? (
          // Two images - side by side
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
        ) : product.images.length === 3 ? (
          // Three images - first large, two small
          <div className="grid grid-cols-2 gap-0.5 h-full">
            <ImageWithFallback
              src={product.images[0]}
              alt={product.title}
              className="w-full h-full object-cover"
            />
            <div className="grid grid-rows-2 gap-0.5">
              <ImageWithFallback
                src={product.images[1]}
                alt={product.title}
                className="w-full h-full object-cover"
              />
              <ImageWithFallback
                src={product.images[2]}
                alt={product.title}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        ) : (
          // Four or more images - 2x2 grid with "+X more" overlay
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
            <ImageWithFallback
              src={product.images[2]}
              alt={product.title}
              className="w-full h-full object-cover"
            />
            <div className="relative">
              <ImageWithFallback
                src={product.images[3]}
                alt={product.title}
                className="w-full h-full object-cover"
              />
              {product.images.length > 4 && (
                <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
                  <span className="text-white text-2xl">
                    +{product.images.length - 4}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Category Badge */}
        <div className="absolute top-2 left-2 bg-emerald-600 text-white px-2 py-1 rounded text-xs">
          {product.category}
        </div>
        
        {/* Product of the Day Badge - Animated */}
        {product.isProductOfTheDay && (
          <div className="absolute bottom-2 left-2 right-2">
            <div className="relative">
              {/* Pulsing background effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-lg animate-pulse opacity-75" />
              
              {/* Main badge */}
              <div className="relative bg-gradient-to-r from-yellow-400 via-yellow-500 to-amber-500 text-gray-900 px-3 py-1.5 rounded-lg shadow-lg flex items-center justify-center gap-1.5 animate-bounce">
                <Star className="w-4 h-4 animate-spin" style={{ animationDuration: '3s' }} />
                <span className="font-bold text-xs uppercase tracking-wide">
                  Producto del Día
                </span>
                <Clock className="w-4 h-4" />
              </div>
              
              {/* Shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-shimmer rounded-lg" 
                   style={{ 
                     backgroundSize: '200% 100%',
                     animation: 'shimmer 2s infinite'
                   }} 
              />
            </div>
          </div>
        )}
        
        {/* Favorite Button */}
        {userId && (
          <button
            onClick={handleFavoriteClick}
            className="absolute top-2 right-2 bg-white rounded-full p-2 shadow-lg hover:scale-110 transition-transform"
          >
            <Heart
              className={`w-5 h-5 ${
                isFav ? 'fill-red-500 text-red-500' : 'text-gray-600'
              }`}
            />
          </button>
        )}
      </div>
      <div className="p-4">
        <h3 className="text-lg text-gray-900 mb-1 line-clamp-1">
          {product.title}
        </h3>
        <p className="text-2xl text-emerald-600 mb-2">
          Q {product.price.toFixed(2)}
        </p>
        {store && (
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <Store className="w-3 h-3" />
              <span className="line-clamp-1">{store.name}</span>
              {store.verified && (
                <ShieldCheck className="w-3 h-3 text-blue-600" />
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                <span>{store.location}</span>
              </div>
              {store.totalReviews > 0 && (
                <div className="flex items-center gap-1">
                  <ReviewStars rating={store.rating} size="sm" />
                  <span className="text-xs">({store.totalReviews})</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

function Store({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
      />
    </svg>
  );
}
