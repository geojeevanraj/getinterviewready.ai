import React from 'react';

/**
 * OptionCard Component
 * 
 * Selectable card for MCQ options, form choices, etc.
 * 
 * @param {string} label - Option label (e.g., "A", "B", "1")
 * @param {boolean} selected - Is this option selected
 * @param {function} onClick - Click handler
 * @param {boolean} disabled - Disable the option
 * @param {boolean} correct - Show as correct answer (for review)
 * @param {boolean} incorrect - Show as incorrect answer (for review)
 * @param {React.ReactNode} children - Option content
 */
const OptionCard = ({ 
  label, 
  children, 
  selected = false, 
  onClick, 
  disabled = false,
  correct = false,
  incorrect = false,
  className = '' 
}) => {
  const getStyles = () => {
    if (correct) {
      return 'bg-emerald-50 dark:bg-emerald-950 border-emerald-500 dark:border-emerald-600';
    }
    if (incorrect) {
      return 'bg-rose-50 dark:bg-rose-950 border-rose-500 dark:border-rose-600';
    }
    if (selected) {
      return 'bg-indigo-50 dark:bg-indigo-950 border-indigo-600 dark:border-indigo-500 shadow-sm';
    }
    return 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600';
  };

  const getLabelStyles = () => {
    if (correct) return 'bg-emerald-600 text-white';
    if (incorrect) return 'bg-rose-600 text-white';
    if (selected) return 'bg-indigo-600 dark:bg-indigo-500 text-white';
    return 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 group-hover:bg-gray-200 dark:group-hover:bg-gray-700';
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`
        w-full p-4 rounded-xl border-2 transition-all duration-200 text-left group
        ${getStyles()}
        ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
    >
      <div className="flex items-center gap-3">
        {label && (
          <span className={`
            w-8 h-8 rounded-full flex items-center justify-center 
            font-semibold text-sm flex-shrink-0 transition-colors
            ${getLabelStyles()}
          `}>
            {label}
          </span>
        )}
        <span className={`text-sm sm:text-base flex-1 ${
          selected || correct ? 'text-gray-900 dark:text-white font-medium' : 'text-gray-700 dark:text-gray-300'
        }`}>
          {children}
        </span>
        {correct && (
          <svg className="w-5 h-5 text-emerald-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        )}
        {incorrect && (
          <svg className="w-5 h-5 text-rose-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        )}
      </div>
    </button>
  );
};

export default OptionCard;
