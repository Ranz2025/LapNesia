// src/styles/designSystem.js
// DESIGN SYSTEM GLOBAL - SOURCE OF TRUTH

export const colors = {
  // Primary
  primary: {
    50: '#EFF6FF',
    100: '#DBEAFE',
    200: '#BFDBFE',
    300: '#93C5FD',
    400: '#60A5FA',
    500: '#3B82F6',
    600: '#2563EB', // Main
    700: '#1D4ED8',
    800: '#1E40AF',
    900: '#1E3A8A',
  },
  
  // Secondary (Gray)
  secondary: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },
  
  // Status
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#0EA5E9',
  
  // Backgrounds
  background: '#FFFFFF',
  surface: '#F9FAFB',
  border: '#E5E7EB',
  overlay: 'rgba(0, 0, 0, 0.5)',
  
  // Text
  text: {
    primary: '#111827',
    secondary: '#6B7280',
    tertiary: '#9CA3AF',
    light: '#FFFFFF',
    inverse: '#111827',
  }
};

export const typography = {
  // Headings
  h1: {
    fontSize: '2.25rem', // 36px
    fontWeight: '900',
    lineHeight: '1.2',
    letterSpacing: '-0.02em',
  },
  h2: {
    fontSize: '1.875rem', // 30px
    fontWeight: '800',
    lineHeight: '1.3',
    letterSpacing: '-0.01em',
  },
  h3: {
    fontSize: '1.5rem', // 24px
    fontWeight: '700',
    lineHeight: '1.4',
  },
  h4: {
    fontSize: '1.25rem', // 20px
    fontWeight: '600',
    lineHeight: '1.4',
  },
  
  // Body
  body: {
    lg: {
      fontSize: '1.125rem', // 18px
      fontWeight: '400',
      lineHeight: '1.6',
    },
    base: {
      fontSize: '1rem', // 16px
      fontWeight: '400',
      lineHeight: '1.6',
    },
    sm: {
      fontSize: '0.875rem', // 14px
      fontWeight: '400',
      lineHeight: '1.5',
    },
  },
  
  // Caption
  caption: {
    fontSize: '0.75rem', // 12px
    fontWeight: '500',
    lineHeight: '1.5',
  },
};

export const spacing = {
  xs: '0.25rem',   // 4px
  sm: '0.5rem',    // 8px
  md: '1rem',      // 16px
  lg: '1.5rem',    // 24px
  xl: '2rem',      // 32px
  '2xl': '2.5rem', // 40px
  '3xl': '3rem',   // 48px
};

export const borderRadius = {
  xs: '0.25rem',   // 4px
  sm: '0.375rem',  // 6px
  md: '0.5rem',    // 8px
  lg: '0.75rem',   // 12px
  xl: '1rem',      // 16px
  '2xl': '1.5rem', // 24px
  '3xl': '2rem',   // 32px
  full: '9999px',
};

export const shadows = {
  none: 'none',
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
};

export const transitions = {
  fast: '150ms ease-in-out',
  base: '200ms ease-in-out',
  slow: '300ms ease-in-out',
};
