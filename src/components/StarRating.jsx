import React from 'react';
import { Star } from 'lucide-react';

/**
 * 5-Star Rating Component with support for full stars, 0.5 half-stars, and empty stars.
 * Designed for 10 stages per level where each stage awards 0.5 stars (10 x 0.5 = 5.0 Stars).
 */
export default function StarRating({ 
  stars = 0, 
  maxStars = 5, 
  size = 'sm',
  className = '',
  showValue = false
}) {
  const numStars = Number(stars) || 0;
  
  const sizeMap = {
    xs: 'w-3 h-3',
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5 sm:w-6 sm:h-6',
    xl: 'w-7 h-7 sm:w-8 sm:h-8'
  };

  const starSizeClass = sizeMap[size] || sizeMap.sm;

  return (
    <div className={`inline-flex items-center space-x-1 select-none ${className}`}>
      <div className="flex items-center space-x-0.5 sm:space-x-1">
        {Array.from({ length: maxStars }).map((_, i) => {
          const fillAmount = Math.max(0, Math.min(1, numStars - i));
          const uniqueId = `star-grad-${i}-${Math.round(fillAmount * 100)}`;

          if (fillAmount >= 1) {
            // Full Star
            return (
              <Star
                key={i}
                className={`${starSizeClass} text-amber-400 fill-amber-400 drop-shadow-[0_0_4px_rgba(251,191,36,0.7)] shrink-0 transition-transform duration-200`}
              />
            );
          } else if (fillAmount > 0) {
            // Half Star (0.5)
            return (
              <div key={i} className={`relative ${starSizeClass} shrink-0 drop-shadow-[0_0_4px_rgba(251,191,36,0.6)]`}>
                <svg
                  className={`${starSizeClass} text-amber-400`}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <defs>
                    <linearGradient id={uniqueId} x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="50%" stopColor="#fbbf24" />
                      <stop offset="50%" stopColor="transparent" />
                    </linearGradient>
                  </defs>
                  <polygon
                    points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
                    fill={`url(#${uniqueId})`}
                    stroke="#fbbf24"
                    strokeWidth="1.5"
                  />
                </svg>
              </div>
            );
          } else {
            // Empty Star
            return (
              <Star
                key={i}
                className={`${starSizeClass} text-slate-700 stroke-1 shrink-0`}
              />
            );
          }
        })}
      </div>

      {showValue && (
        <span className="text-xs font-mono font-bold text-amber-400 ml-1.5">
          {numStars.toFixed(1).replace('.0', '')}/{maxStars}
        </span>
      )}
    </div>
  );
}
