import React from 'react';
import { componentTokens } from '../config/designTokens';

/**
 * Input Component - Design System
 * 
 * Standardized text input with consistent styling.
 * 
 * @param {string} label - Input label
 * @param {string} error - Error message
 * @param {string} helperText - Helper text below input
 * @param {React.ReactNode} leftIcon - Icon on the left side
 * @param {React.ReactNode} rightIcon - Icon on the right side
 * @param {boolean} required - Show required indicator
 */

const Input = ({ 
  label, 
  error, 
  helperText,
  leftIcon,
  rightIcon,
  required = false,
  className = '',
  ...props 
}) => {
  return (
    <div className="mb-4">
      {label && (
        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">
          {label}
          {required && <span className="text-rose-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-600">
            {leftIcon}
          </div>
        )}
        
        <input
          className={`
            w-full
            ${componentTokens.input.padding}
            ${componentTokens.input.fontSize}
            ${componentTokens.input.border}
            ${componentTokens.input.radius}
            ${componentTokens.input.focusRing}
            bg-white dark:bg-gray-900
            text-gray-900 dark:text-white
            placeholder-gray-400 dark:placeholder-gray-600
            transition-colors
            ${leftIcon ? 'pl-10' : ''}
            ${rightIcon ? 'pr-10' : ''}
            ${error ? 'border-rose-500 focus:ring-rose-500' : ''}
            disabled:opacity-50 disabled:cursor-not-allowed
            ${className}
          `}
          {...props}
        />
        
        {rightIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-600">
            {rightIcon}
          </div>
        )}
      </div>
      
      {error && (
        <p className="text-rose-600 dark:text-rose-400 text-xs mt-1.5 flex items-center gap-1">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </p>
      )}
      
      {helperText && !error && (
        <p className="text-gray-500 dark:text-gray-400 text-xs mt-1.5">
          {helperText}
        </p>
      )}
    </div>
  );
};

export default Input;
