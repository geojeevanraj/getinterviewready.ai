import React from 'react';

/**
 * LoadingSkeleton Component
 * 
 * Animated skeleton loader for better perceived performance.
 * 
 * @param {string} variant - 'text'|'card'|'avatar'|'rect'
 * @param {number} lines - Number of text lines (for 'text' variant)
 * @param {string} className - Additional classes
 */
const LoadingSkeleton = ({ 
  variant = 'text', 
  lines = 3,
  className = '' 
}) => {
  const baseClasses = 'animate-pulse bg-gray-200 dark:bg-gray-700';

  if (variant === 'text') {
    return (
      <div className={`space-y-3 ${className}`}>
        {Array.from({ length: lines }).map((_, i) => (
          <div 
            key={i}
            className={`${baseClasses} h-4 rounded ${i === lines - 1 ? 'w-3/4' : 'w-full'}`}
          />
        ))}
      </div>
    );
  }

  if (variant === 'avatar') {
    return (
      <div className={`${baseClasses} w-12 h-12 rounded-full ${className}`} />
    );
  }

  if (variant === 'card') {
    return (
      <div className={`bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm p-5 ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
          </div>
        </div>
      </div>
    );
  }

  // Default rect variant
  return <div className={`${baseClasses} rounded ${className}`} />;
};

/**
 * PageLoadingSkeleton
 * Full page loading state
 */
export const PageLoadingSkeleton = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="p-4 sm:p-5 lg:p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header skeleton */}
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-2" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
          </div>
          
          {/* Content skeletons */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <LoadingSkeleton variant="card" />
            <LoadingSkeleton variant="card" />
            <LoadingSkeleton variant="card" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingSkeleton;
