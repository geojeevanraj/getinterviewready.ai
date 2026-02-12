/**
 * Design Tokens - GetInterviewReady.AI
 * Centralized design system constants for consistent UI
 */

export const colors = {
  // Primary brand colors
  primary: {
    50: 'rgb(238 242 255)',
    100: 'rgb(224 231 255)',
    500: 'rgb(99 102 241)',
    600: 'rgb(79 70 229)',
    700: 'rgb(67 56 202)',
  },
  
  // Semantic colors
  success: {
    50: 'rgb(236 253 245)',
    100: 'rgb(209 250 229)',
    500: 'rgb(16 185 129)',
    600: 'rgb(5 150 105)',
    700: 'rgb(4 120 87)',
  },
  
  error: {
    50: 'rgb(254 242 242)',
    100: 'rgb(254 226 226)',
    500: 'rgb(239 68 68)',
    600: 'rgb(220 38 38)',
    700: 'rgb(185 28 28)',
  },
  
  warning: {
    50: 'rgb(255 251 235)',
    100: 'rgb(254 243 199)',
    500: 'rgb(245 158 11)',
    600: 'rgb(217 119 6)',
    700: 'rgb(180 83 9)',
  },
  
  // Neutral grays
  gray: {
    50: 'rgb(249 250 251)',
    100: 'rgb(243 244 246)',
    200: 'rgb(229 231 235)',
    300: 'rgb(209 213 219)',
    400: 'rgb(156 163 175)',
    500: 'rgb(107 114 128)',
    600: 'rgb(75 85 99)',
    700: 'rgb(55 65 81)',
    800: 'rgb(31 41 55)',
    900: 'rgb(17 24 39)',
    950: 'rgb(3 7 18)',
  },
};

export const spacing = {
  xs: '8px',     // 0.5rem / 2
  sm: '12px',    // 0.75rem / 3
  md: '16px',    // 1rem / 4
  lg: '24px',    // 1.5rem / 6
  xl: '32px',    // 2rem / 8
  '2xl': '48px', // 3rem / 12
  '3xl': '64px', // 4rem / 16
};

export const borderRadius = {
  sm: '0.375rem',  // 6px
  md: '0.5rem',    // 8px
  lg: '0.75rem',   // 12px
  xl: '1rem',      // 16px
  '2xl': '1.5rem', // 24px
  full: '9999px',
};

export const shadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
};

export const typography = {
  fontFamily: {
    sans: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  
  fontSize: {
    xs: ['0.75rem', { lineHeight: '1rem' }],      // 12px
    sm: ['0.875rem', { lineHeight: '1.25rem' }],  // 14px
    base: ['1rem', { lineHeight: '1.5rem' }],     // 16px
    lg: ['1.125rem', { lineHeight: '1.75rem' }],  // 18px
    xl: ['1.25rem', { lineHeight: '1.75rem' }],   // 20px
    '2xl': ['1.5rem', { lineHeight: '2rem' }],    // 24px
    '3xl': ['1.875rem', { lineHeight: '2.25rem' }], // 30px
    '4xl': ['2.25rem', { lineHeight: '2.5rem' }],   // 36px
  },
  
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
};

export const transitions = {
  fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
  base: '200ms cubic-bezier(0.4, 0, 0.2, 1)',
  slow: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
};

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

export const zIndex = {
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
};

// Component-specific token groups
export const componentTokens = {
  card: {
    background: 'bg-white dark:bg-gray-900',
    border: 'border border-gray-200 dark:border-gray-800',
    shadow: 'shadow-sm',
    hoverShadow: 'hover:shadow-md',
    padding: 'p-5',
    radius: 'rounded-lg',
  },
  
  button: {
    radius: 'rounded-md',
    paddingX: 'px-4',
    paddingY: 'py-2.5',
    fontSize: 'text-sm',
    fontWeight: 'font-semibold',
    transition: 'transition-all',
  },
  
  input: {
    radius: 'rounded-md',
    padding: 'px-3 py-2.5',
    fontSize: 'text-sm',
    border: 'border border-gray-200 dark:border-gray-700',
    focusRing: 'focus:outline-none focus:ring-2 focus:ring-indigo-500',
  },
  
  badge: {
    radius: 'rounded-md',
    padding: 'px-2.5 py-1',
    fontSize: 'text-xs',
    fontWeight: 'font-medium',
  },
};

export default {
  colors,
  spacing,
  borderRadius,
  shadows,
  typography,
  transitions,
  breakpoints,
  zIndex,
  componentTokens,
};
