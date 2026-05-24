/* Enterprise Design System Constants */

export const SPACING = {
  xs: '0.25rem',
  sm: '0.5rem',
  md: '1rem',
  lg: '1.5rem',
  xl: '2rem',
  '2xl': '2.5rem',
  '3xl': '3rem',
} as const;

export const BREAKPOINTS = {
  mobile: '0px',
  tablet: '640px',
  desktop: '1024px',
  wide: '1280px',
} as const;

export const TYPOGRAPHY = {
  heading: {
    h1: { size: '1.875rem', weight: 700, lineHeight: 1.2 },
    h2: { size: '1.5rem', weight: 700, lineHeight: 1.3 },
    h3: { size: '1.25rem', weight: 600, lineHeight: 1.4 },
    h4: { size: '1.125rem', weight: 600, lineHeight: 1.4 },
  },
  body: {
    lg: { size: '1.125rem', weight: 400, lineHeight: 1.6 },
    base: { size: '1rem', weight: 400, lineHeight: 1.5 },
    sm: { size: '0.875rem', weight: 400, lineHeight: 1.5 },
    xs: { size: '0.75rem', weight: 400, lineHeight: 1.4 },
  },
} as const;

export const SHADOW = {
  sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px rgba(0, 0, 0, 0.07)',
  lg: '0 10px 15px rgba(0, 0, 0, 0.1)',
  xl: '0 20px 25px rgba(0, 0, 0, 0.12)',
} as const;

export const BORDER_RADIUS = {
  sm: '0.375rem',
  md: '0.5rem',
  lg: '0.75rem',
  xl: '1rem',
} as const;

export const COMPONENT_SIZES = {
  button: {
    sm: '2rem',
    md: '2.5rem',
    lg: '3rem',
  },
  input: {
    sm: '2rem',
    md: '2.5rem',
    lg: '3rem',
  },
  icon: {
    sm: '1rem',
    md: '1.5rem',
    lg: '2rem',
    xl: '2.5rem',
  },
} as const;

export const TRANSITIONS = {
  fast: '150ms ease-in-out',
  normal: '300ms ease-in-out',
  slow: '500ms ease-in-out',
} as const;

export const TOUCH_TARGET = {
  min: '2.5rem', // Minimum touch-friendly size
  comfortable: '3rem',
  thumb: '3rem', // For mobile thumb accessibility
} as const;
