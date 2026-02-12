import React from 'react';

/**
 * InfoPanel Component
 * 
 * Consistent info/tip/warning panel with left accent border.
 * Used for tips, notices, motivational messages, etc.
 * 
 * @param {string} variant - 'info'|'warning'|'success'|'tip'|'error'
 * @param {string} title - Panel title
 * @param {React.ReactNode} icon - Optional icon element
 * @param {React.ReactNode} children - Panel content
 */
const InfoPanel = ({ 
  variant = 'info', 
  title, 
  icon, 
  children, 
  className = '' 
}) => {
  const variants = {
    info: {
      border: 'border-l-indigo-500',
      bg: 'bg-indigo-50 dark:bg-indigo-950/50',
      titleColor: 'text-indigo-900 dark:text-indigo-100',
      textColor: 'text-indigo-700 dark:text-indigo-300',
      iconBg: 'bg-indigo-100 dark:bg-indigo-900',
    },
    warning: {
      border: 'border-l-amber-500',
      bg: 'bg-amber-50 dark:bg-amber-950/50',
      titleColor: 'text-amber-900 dark:text-amber-100',
      textColor: 'text-amber-700 dark:text-amber-300',
      iconBg: 'bg-amber-100 dark:bg-amber-900',
    },
    success: {
      border: 'border-l-emerald-500',
      bg: 'bg-emerald-50 dark:bg-emerald-950/50',
      titleColor: 'text-emerald-900 dark:text-emerald-100',
      textColor: 'text-emerald-700 dark:text-emerald-300',
      iconBg: 'bg-emerald-100 dark:bg-emerald-900',
    },
    tip: {
      border: 'border-l-purple-500',
      bg: 'bg-purple-50 dark:bg-purple-950/50',
      titleColor: 'text-purple-900 dark:text-purple-100',
      textColor: 'text-purple-700 dark:text-purple-300',
      iconBg: 'bg-purple-100 dark:bg-purple-900',
    },
    error: {
      border: 'border-l-rose-500',
      bg: 'bg-rose-50 dark:bg-rose-950/50',
      titleColor: 'text-rose-900 dark:text-rose-100',
      textColor: 'text-rose-700 dark:text-rose-300',
      iconBg: 'bg-rose-100 dark:bg-rose-900',
    },
  };

  const v = variants[variant] || variants.info;

  return (
    <div className={`border-l-4 ${v.border} ${v.bg} rounded-xl p-4 sm:p-5 ${className}`}>
      <div className="flex items-start gap-3">
        {icon && (
          <div className={`p-2 rounded-lg flex-shrink-0 ${v.iconBg}`}>
            {icon}
          </div>
        )}
        <div className="flex-1 min-w-0">
          {title && (
            <h4 className={`font-semibold text-sm mb-1.5 ${v.titleColor}`}>
              {title}
            </h4>
          )}
          <div className={`text-sm leading-relaxed ${v.textColor}`}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InfoPanel;
