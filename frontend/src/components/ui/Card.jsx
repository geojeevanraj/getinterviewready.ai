import React from 'react';
import { componentTokens } from '../../config/designTokens';

/**
 * Card Component
 * 
 * Flexible card container with consistent styling across the app.
 * 
 * @param {React.ReactNode} children - Card content
 * @param {string} className - Additional Tailwind classes
 * @param {boolean} hoverable - Enable hover shadow effect
 * @param {boolean} noPadding - Remove default padding
 * @param {function} onClick - Click handler (makes card interactive)
 */
const Card = ({ 
  children, 
  className = '', 
  hoverable = false,
  noPadding = false,
  onClick,
  ...props 
}) => {
  const baseClasses = [
    componentTokens.card.background,
    componentTokens.card.border,
    componentTokens.card.shadow,
    componentTokens.card.radius,
    !noPadding && componentTokens.card.padding,
    hoverable && componentTokens.card.hoverShadow,
    hoverable && 'transition-all',
    onClick && 'cursor-pointer',
  ].filter(Boolean).join(' ');

  return (
    <div 
      className={`${baseClasses} ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick(e) : undefined}
      {...props}
    >
      {children}
    </div>
  );
};

/**
 * CardHeader Component
 * Standardized card header section
 */
export const CardHeader = ({ title, subtitle, action, className = '' }) => {
  return (
    <div className={`flex items-start justify-between mb-4 ${className}`}>
      <div className="flex-1 min-w-0">
        {title && (
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">
            {title}
          </h3>
        )}
        {subtitle && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {subtitle}
          </p>
        )}
      </div>
      {action && <div className="ml-4 flex-shrink-0">{action}</div>}
    </div>
  );
};

/**
 * CardContent Component
 * Standardized card content wrapper
 */
export const CardContent = ({ children, className = '' }) => {
  return <div className={className}>{children}</div>;
};

/**
 * CardFooter Component
 * Standardized card footer section
 */
export const CardFooter = ({ children, className = '' }) => {
  return (
    <div className={`mt-4 pt-4 border-t border-gray-200 dark:border-gray-800 ${className}`}>
      {children}
    </div>
  );
};

export default Card;
