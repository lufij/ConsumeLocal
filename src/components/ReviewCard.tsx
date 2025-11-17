import { Card } from './ui/card';
import { ReviewStars } from './ReviewStars';
import { User, Calendar } from 'lucide-react';

export type Review = {
  id: string;
  storeId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  orderId?: string;
  createdAt: string;
};

type ReviewCardProps = {
  review: Review;
};

export function ReviewCard({ review }: ReviewCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Hoy';
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 7) return `Hace ${diffDays} días`;
    if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} semanas`;
    if (diffDays < 365) return `Hace ${Math.floor(diffDays / 30)} meses`;
    
    return date.toLocaleDateString('es-GT', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <Card className="p-4">
      <div className="flex items-start gap-3">
        {/* User Avatar */}
        <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center">
          <User className="w-5 h-5 text-white" />
        </div>

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <p className="font-semibold text-gray-900">{review.userName}</p>
              <div className="flex items-center gap-2 mt-1">
                <ReviewStars rating={review.rating} size="sm" />
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {formatDate(review.createdAt)}
                </span>
              </div>
            </div>
          </div>

          {/* Comment */}
          {review.comment && (
            <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
              {review.comment}
            </p>
          )}

          {/* Order Badge */}
          {review.orderId && (
            <div className="mt-2">
              <span className="inline-flex items-center text-xs text-emerald-700 bg-emerald-50 px-2 py-1 rounded">
                ✓ Compra verificada
              </span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
