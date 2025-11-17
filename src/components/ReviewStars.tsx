import { Star } from 'lucide-react';

type ReviewStarsProps = {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
  showNumber?: boolean;
};

export function ReviewStars({
  rating,
  maxRating = 5,
  size = 'md',
  interactive = false,
  onRatingChange,
  showNumber = false,
}: ReviewStarsProps) {
  const sizeClasses = {
    sm: 'w-3.5 h-3.5',
    md: 'w-5 h-5',
    lg: 'w-7 h-7',
  };

  const handleClick = (value: number) => {
    if (interactive && onRatingChange) {
      onRatingChange(value);
    }
  };

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: maxRating }, (_, index) => {
        const starValue = index + 1;
        const isFilled = starValue <= Math.round(rating);
        const isPartial = starValue === Math.ceil(rating) && rating % 1 !== 0;

        return (
          <button
            key={index}
            type="button"
            onClick={() => handleClick(starValue)}
            disabled={!interactive}
            className={`
              ${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'}
              ${interactive && starValue <= rating ? 'animate-pulse' : ''}
            `}
          >
            <Star
              className={`
                ${sizeClasses[size]}
                ${isFilled || isPartial ? 'fill-yellow-400 text-yellow-400' : 'fill-none text-gray-300'}
                ${interactive ? 'hover:text-yellow-400' : ''}
              `}
            />
          </button>
        );
      })}
      {showNumber && (
        <span className="ml-1 text-sm text-gray-600">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}