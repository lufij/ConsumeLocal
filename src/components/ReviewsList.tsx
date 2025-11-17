import { useState, useEffect } from 'react';
import { Star, MessageSquare, TrendingUp, Filter } from 'lucide-react';
import { ReviewCard, type Review } from './ReviewCard';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card } from './ui/card';
import { reviewsAPI } from '../utils/api';

type ReviewsListProps = {
  storeId: string;
  showAddButton?: boolean;
  onAddReview?: () => void;
};

type SortOption = 'newest' | 'oldest' | 'highest' | 'lowest';

export function ReviewsList({
  storeId,
  showAddButton = false,
  onAddReview,
}: ReviewsListProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [filterRating, setFilterRating] = useState<number | 'all'>('all');

  useEffect(() => {
    loadReviews();
  }, [storeId]);

  const loadReviews = async () => {
    try {
      const result = await reviewsAPI.getByStore(storeId);
      if (result.success && result.data) {
        setReviews(result.data as Review[]);
      }
    } catch (error) {
      console.error('Error cargando reseñas:', error);
      setReviews([]);
    }
  };

  // Calculate statistics
  const avgRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  const ratingDistribution = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: reviews.filter(r => r.rating === star).length,
    percentage: reviews.length > 0
      ? (reviews.filter(r => r.rating === star).length / reviews.length) * 100
      : 0,
  }));

  // Apply filters and sorting
  const getFilteredReviews = (): Review[] => {
    let filtered = [...reviews];

    // Filter by rating
    if (filterRating !== 'all') {
      filtered = filtered.filter(r => r.rating === filterRating);
    }

    // Sort
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case 'highest':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'lowest':
        filtered.sort((a, b) => a.rating - b.rating);
        break;
    }

    return filtered;
  };

  const filteredReviews = getFilteredReviews();

  if (reviews.length === 0 && !showAddButton) {
    return (
      <Card className="p-8 text-center">
        <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-600 mb-2">
          Aún no hay reseñas para esta tienda
        </p>
        <p className="text-sm text-gray-500">
          Sé el primero en compartir tu experiencia
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Summary */}
      {reviews.length > 0 && (
        <Card className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Average Rating */}
            <div className="text-center md:border-r">
              <div className="text-5xl mb-2">{avgRating.toFixed(1)}</div>
              <div className="flex items-center justify-center gap-1 mb-2">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < Math.round(avgRating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'fill-none text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <p className="text-gray-600">
                {reviews.length} {reviews.length === 1 ? 'reseña' : 'reseñas'}
              </p>
            </div>

            {/* Rating Distribution */}
            <div className="space-y-2">
              {ratingDistribution.map(({ star, count, percentage }) => (
                <div key={star} className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 w-8">{star}★</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-yellow-400 h-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 w-8 text-right">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Add Review Button */}
      {showAddButton && onAddReview && (
        <Button
          onClick={onAddReview}
          className="w-full bg-emerald-600 hover:bg-emerald-700 h-12"
        >
          <Star className="w-5 h-5 mr-2" />
          Escribir Reseña
        </Button>
      )}

      {/* Filters and Sort */}
      {reviews.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3">
          <Select value={filterRating.toString()} onValueChange={(v) => setFilterRating(v === 'all' ? 'all' : parseInt(v))}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las estrellas</SelectItem>
              <SelectItem value="5">5 estrellas</SelectItem>
              <SelectItem value="4">4 estrellas</SelectItem>
              <SelectItem value="3">3 estrellas</SelectItem>
              <SelectItem value="2">2 estrellas</SelectItem>
              <SelectItem value="1">1 estrella</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <TrendingUp className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Más Recientes</SelectItem>
              <SelectItem value="oldest">Más Antiguas</SelectItem>
              <SelectItem value="highest">Mejor Valoradas</SelectItem>
              <SelectItem value="lowest">Peor Valoradas</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Reviews List */}
      {filteredReviews.length > 0 ? (
        <div className="space-y-4">
          {filteredReviews.map(review => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      ) : reviews.length > 0 ? (
        <Card className="p-8 text-center">
          <Filter className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600">
            No hay reseñas con los filtros seleccionados
          </p>
        </Card>
      ) : null}
    </div>
  );
}