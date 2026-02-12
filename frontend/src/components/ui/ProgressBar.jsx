import React from 'react';

/**
 * ProgressBar Component
 * 
 * Consistent progress indicator with label support.
 * 
 * @param {number} value - Current progress value
 * @param {number} max - Maximum value (default 100)
 * @param {string} size - 'sm'|'md'|'lg'
 * @param {boolean} showLabel - Show percentage label
 * @param {string} label - Optional left-side label text
 * @param {string} variant - 'primary'|'success'|'warning'|'error'
 */
const ProgressBar = ({ 
  value, 
  max = 100, 
  size = 'md', 
  showLabel = false, 
  label,
  variant = 'primary',
  className = '' 
}) => {
  const percentage = Math.min(Math.round((value / max) * 100), 100);

  const sizes = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-3.5',
  };

  const variants = {
    primary: 'bg-indigo-600 dark:bg-indigo-500',
    success: 'bg-emerald-600 dark:bg-emerald-500',
    warning: 'bg-amber-500 dark:bg-amber-400',
    error: 'bg-rose-600 dark:bg-rose-500',
  };

  return (
    <div className={className}>
      {(showLabel || label) && (
        <div className="flex items-center justify-between mb-1.5">
          {label && (
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {label}
            </span>
          )}
          {showLabel && (
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {percentage}%
            </span>
          )}
        </div>
      )}
      <div className={`w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden ${sizes[size] || sizes.md}`}>
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${variants[variant] || variants.primary}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
