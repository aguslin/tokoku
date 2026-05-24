'use client';

import { ReactNode } from 'react';
import { Star } from 'lucide-react';

interface RatingStarsProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onChange?: (rating: number) => void;
  className?: string;
}

const sizeStyles = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
};

export const RatingStars = ({
  rating,
  maxRating = 5,
  size = 'md',
  interactive = false,
  onChange,
  className = '',
}: RatingStarsProps) => {
  return (
    <div className={`flex gap-1 ${className}`}>
      {Array.from({ length: maxRating }, (_, i) => {
        const starValue = i + 1;
        const isFilled = starValue <= Math.round(rating);

        return (
          <button
            key={i}
            onClick={() => interactive && onChange?.(starValue)}
            disabled={!interactive}
            className={`transition-colors ${interactive ? 'cursor-pointer hover:scale-110' : ''}`}
          >
            <Star
              className={`${sizeStyles[size]} ${
                isFilled
                  ? 'fill-warning text-warning'
                  : 'text-muted-foreground'
              }`}
            />
          </button>
        );
      })}
    </div>
  );
};
