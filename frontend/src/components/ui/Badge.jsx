import React from 'react';
import { componentTokens } from '../../config/designTokens';

/**
 * Badge/Tag Component
 * 
 * Visual indicators for status, categories, counts, etc.
 * 
 * @param {string} variant - Color variant: 'default'|'primary'|'success'|'warning'|'error'|'info'
 * @param {string} size - Size variant: 'sm'|'md'|'lg'
 * @param {React.ReactNode} children - Badge content
 * @param {React.ReactNode} icon - Optional icon element
 * @param {boolean} dot - Show colored dot indicator
 * @param {function} onRemove - Show remove button with callback
 */
const Badge = ({ 
  children, 
  variant = 'default',
  size = 'md',
  icon,
  dot = false,
  onRemove,
  className = '',
  ...props 
}) => {
  
  const variants = {
    default: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700',
    primary: 'bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
    success: 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    warning: 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    error: 'bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800',
    info: 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    purple: 'bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm',
  };

  const dotColors = {
    default: 'bg-gray-500',
    primary: 'bg-indigo-500',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    error: 'bg-rose-500',
    info: 'bg-blue-500',
    purple: 'bg-purple-500',
  };

  const baseClasses = [
    'inline-flex items-center gap-1.5',
    componentTokens.badge.radius,
    componentTokens.badge.fontWeight,
    'border',
    variants[variant] || variants.default,
    sizes[size] || sizes.md,
  ].join(' ');

  return (
    <span className={`${baseClasses} ${className}`} {...props}>
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant] || dotColors.default}`} />
      )}
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span>{children}</span>
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="flex-shrink-0 hover:opacity-70 transition-opacity ml-0.5"
          aria-label="Remove"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </span>
  );
};

export default Badge;
