import { useState } from 'react';
import { X, Star } from 'lucide-react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { ReviewStars } from './ReviewStars';
import { Card } from './ui/card';
import type { Review } from './ReviewCard';
import type { User, Store } from '../App';

type AddReviewModalProps = {
  store: Store;
  currentUser: User;
  orderId?: string;
  onClose: () => void;
  onSubmit: (review: Review) => void;
};

export function AddReviewModal({
  store,
  currentUser,
  orderId,
  onClose,
  onSubmit,
}: AddReviewModalProps) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      alert('Por favor selecciona una calificación');
      return;
    }

    setIsSubmitting(true);

    const newReview: Review = {
      id: Date.now().toString(),
      storeId: store.id,
      userId: currentUser.id,
      userName: currentUser.name,
      rating,
      comment: comment.trim(),
      orderId,
      createdAt: new Date().toISOString(),
    };

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    onSubmit(newReview);
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
      <div 
        className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl shadow-xl max-h-[90vh] overflow-auto animate-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0 duration-300"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl text-gray-900">
            Calificar Tienda
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isSubmitting}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Store Info */}
          <Card className="p-4 bg-emerald-50 border-emerald-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                <span className="text-xl">🏪</span>
              </div>
              <div>
                <p className="font-semibold text-gray-900">{store.name}</p>
                <p className="text-sm text-gray-600">{store.location}</p>
              </div>
            </div>
          </Card>

          {/* Rating Selection */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Tu Calificación
            </label>
            <div className="flex flex-col items-center gap-3 py-4">
              <ReviewStars
                rating={rating}
                size="lg"
                interactive
                onRatingChange={setRating}
              />
              <div className="text-center">
                {rating === 5 && (
                  <p className="text-emerald-600">¡Excelente! ⭐</p>
                )}
                {rating === 4 && (
                  <p className="text-blue-600">¡Muy Bueno! 😊</p>
                )}
                {rating === 3 && (
                  <p className="text-yellow-600">Bueno 👍</p>
                )}
                {rating === 2 && (
                  <p className="text-orange-600">Regular 😐</p>
                )}
                {rating === 1 && (
                  <p className="text-red-600">Malo 😞</p>
                )}
              </div>
            </div>
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Tu Opinión <span className="text-gray-400">(Opcional)</span>
            </label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Cuéntanos sobre tu experiencia con esta tienda..."
              className="min-h-[120px] resize-none"
              maxLength={500}
              disabled={isSubmitting}
            />
            <p className="text-xs text-gray-500 text-right">
              {comment.length}/500
            </p>
          </div>

          {orderId && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                ✓ Esta reseña se marcará como <strong>compra verificada</strong>
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || rating === 0}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Publicando...
                </>
              ) : (
                'Publicar Reseña'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
