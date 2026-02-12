import React from 'react';

/**
 * EmptyState Component
 * 
 * Displays when there's no data to show.
 * Provides clear messaging and optional call-to-action.
 * 
 * @param {React.ReactNode} icon - SVG icon or illustration
 * @param {string} title - Main message
 * @param {string} description - Supporting text
 * @param {React.ReactNode} action - CTA button
 */
const EmptyState = ({ 
  icon, 
  title, 
  description, 
  action,
  className = '' 
}) => {
  return (
    <div className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`}>
      {icon && (
        <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
          <div className="w-8 h-8 text-gray-400 dark:text-gray-600">
            {icon}
          </div>
        </div>
      )}
      
      {title && (
        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">
          {title}
        </h3>
      )}
      
      {description && (
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mb-6">
          {description}
        </p>
      )}
      
      {action && <div>{action}</div>}
    </div>
  );
};

export default EmptyState;
