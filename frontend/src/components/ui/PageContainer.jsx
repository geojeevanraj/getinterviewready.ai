import React from 'react';

/**
 * PageContainer Component
 * 
 * Consistent page layout wrapper with:
 * - Background color
 * - Padding/spacing
 * - Max width
 * - Responsive design
 */
const PageContainer = ({ children, className = '', maxWidth = '7xl' }) => {
  const maxWidthClasses = {
    '5xl': 'max-w-5xl',
    '6xl': 'max-w-6xl',
    '7xl': 'max-w-7xl',
    full: 'max-w-full',
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {children}
    </div>
  );
};

/**
 * PageContent Component
 * Inner content wrapper with consistent spacing
 */
export const PageContent = ({ children, className = '', maxWidth = '7xl' }) => {
  const maxWidthClasses = {
    '5xl': 'max-w-5xl',
    '6xl': 'max-w-6xl',
    '7xl': 'max-w-7xl',
    full: 'max-w-full',
  };

  return (
    <div className="p-4 sm:p-5 lg:p-6">
      <div className={`${maxWidthClasses[maxWidth] || maxWidthClasses['7xl']} mx-auto ${className}`}>
        {children}
      </div>
    </div>
  );
};

export default PageContainer;
