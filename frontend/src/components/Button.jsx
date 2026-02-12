import React from 'react';
import { componentTokens } from '../config/designTokens';

/**
 * Button Component - Design System
 * 
 * Standardized button with consistent styling across the app.
 * 
 * @param {string} variant - 'primary'|'secondary'|'danger'|'success'|'ghost'|'outline'
 * @param {string} size - 'sm'|'md'|'lg'
 * @param {boolean} loading - Show loading spinner
 * @param {boolean} fullWidth - Take full width of container
 * @param {React.ReactNode} leftIcon - Icon before text
 * @param {React.ReactNode} rightIcon - Icon after text
 */

const variantStyles = {
  primary: 'bg-indigo-600 hover:bg-indigo-700 text-white focus:ring-indigo-500 shadow-sm hover:shadow',
  secondary: 'bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 focus:ring-gray-400',
  danger: 'bg-rose-600 hover:bg-rose-700 text-white focus:ring-rose-500 shadow-sm hover:shadow',
  success: 'bg-emerald-600 hover:bg-emerald-700 text-white focus:ring-emerald-500 shadow-sm hover:shadow',
  ghost: 'bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 focus:ring-gray-400',
  outline: 'bg-transparent border-2 border-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950 text-indigo-600 dark:text-indigo-400 focus:ring-indigo-500',
};

const sizeStyles = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-6 py-3 text-base',
};

const Button = ({ 
  children, 
  loading, 
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  leftIcon,
  rightIcon,
  className = '', 
  ...props 
}) => {
  const baseStyles = [
    componentTokens.button.fontWeight,
    componentTokens.button.radius,
    componentTokens.button.transition,
    'focus:outline-none focus:ring-2 focus:ring-offset-2',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    'inline-flex items-center justify-center gap-2',
    fullWidth && 'w-full',
  ].filter(Boolean).join(' ');

  const variantClass = variantStyles[variant] || variantStyles.primary;
  const sizeClass = sizeStyles[size] || sizeStyles.md;

  return (
    <button
      disabled={loading || props.disabled}
      className={`${baseStyles} ${variantClass} ${sizeClass} ${className}`}
      {...props}
    >
      {loading ? (
        <>
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>Loading...</span>
        </>
      ) : (
        <>
          {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
          <span>{children}</span>
          {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
        </>
      )}
    </button>
  );
};

export default Button;
