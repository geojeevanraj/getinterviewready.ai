import React from 'react';

/**
 * PageHeader Component
 * 
 * Consistent page header with title, subtitle, and actions.
 * Used across all main pages for visual consistency.
 * 
 * @param {string} title - Page title
 * @param {string} subtitle - Optional subtitle/description
 * @param {React.ReactNode} actions - Action buttons (e.g., "Add New")
 * @param {React.ReactNode} breadcrumb - Optional breadcrumb navigation
 * @param {boolean} sticky - Make header sticky on scroll
 */
const PageHeader = ({ 
  title, 
  subtitle, 
  actions,
  breadcrumb,
  sticky = true,
  className = '',
}) => {
  return (
    <header 
      className={`
        ${sticky ? 'sticky top-0 z-20' : ''}
        bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl 
        border-b border-gray-200 dark:border-gray-800
        ${className}
      `}
    >
      <div className="px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex-1 min-w-0">
            {breadcrumb && <div className="mb-2">{breadcrumb}</div>}
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
              {title}
            </h1>
            {subtitle && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
          {actions && (
            <div className="ml-4 flex items-center gap-2 flex-shrink-0">
              {actions}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default PageHeader;
