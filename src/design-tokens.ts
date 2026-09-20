export const colors = {
  canvas: {
    light: '#EFECE6',
    dark: '#171614',
  },
  surface: {
    light: '#FAF8F5',
    dark: '#1E1D1B',
  },
  elevated: {
    light: '#F5F2ED',
    dark: '#242220',
  },
  overlay: {
    light: '#FFFFFF',
    dark: '#2A2826',
  },
  ink: {
    light: '#171614',
    dark: '#F6F2EA',
  },
  mutedInk: {
    light: '#777269',
    dark: '#A8A298',
  },
  line: {
    light: '#E5E0D8',
    dark: '#3A3630',
  },
  accent: {
    light: '#EF6B35',
    dark: '#EF7B49',
    subtleLight: '#EF6B351A',
    subtleDark: '#EF7B4926',
  },
  success: {
    light: '#007A5E',
    dark: '#22C55E',
  },
  warning: {
    light: '#B45309',
    dark: '#FBBF24',
  },
  danger: {
    light: '#A13F2B',
    dark: '#EF4444',
  },
  focus: {
    light: '#EF6B35',
    dark: '#EF7B49',
  },
} as const;

export const spacing = {
  0: '0',
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  8: '32px',
  10: '40px',
  12: '48px',
  16: '64px',
  20: '80px',
  24: '96px',
} as const;

export const radius = {
  none: '0',
  subtle: '4px',
  control: '10px',
  surface: '16px',
  sheet: '24px',
  pill: '9999px',
} as const;

export const elevation = {
  ground: {
    shadow: 'none',
    blur: 'none',
  },
  surface: {
    shadow: '0 2px 8px rgba(23,22,20,0.06), 0 1px 2px rgba(23,22,20,0.04)',
    blur: 'none',
    border: '1px solid var(--color-line)',
  },
  elevated: {
    shadow: '0 8px 24px rgba(23,22,20,0.08), 0 4px 12px rgba(23,22,20,0.05), 0 0 0 1px rgba(239,107,53,0.05)',
    blur: 'backdrop-blur-md',
    border: '1px solid var(--color-line)',
  },
  overlay: {
    shadow: '0 16px 48px rgba(23,22,20,0.12), 0 8px 24px rgba(23,22,20,0.08), 0 0 0 1px rgba(239,107,53,0.08)',
    blur: 'backdrop-blur-xl',
    border: '1px solid var(--color-line)',
  },
} as const;

export const motion = {
  easing: {
    easeOutExpo: [0.16, 1, 0.3, 1] as const,
    easeSpring: [0.22, 1, 0.36, 1] as const,
    easeSharp: [0.4, 0, 0.2, 1] as const,
  },
  duration: {
    instant: '0ms',
    fast: '120ms',
    base: '200ms',
    slow: '320ms',
    slowest: '480ms',
  },
  reduced: '0.01ms',
} as const;

export const typography = {
  fontFamilies: {
    display: 'var(--font-display)',
    ui: 'var(--font-ui)',
    mono: 'var(--font-mono)',
  },
  scale: {
    displayXl: {
      size: 'clamp(3.5rem, 8vw, 9rem)',
      lineHeight: '0.85',
      letterSpacing: '-0.07em',
      weight: '500',
    },
    displayLg: {
      size: 'clamp(2.5rem, 5vw, 4.5rem)',
      lineHeight: '0.9',
      letterSpacing: '-0.04em',
      weight: '500',
    },
    displayMd: {
      size: 'clamp(1.75rem, 3vw, 2.5rem)',
      lineHeight: '1.0',
      letterSpacing: '-0.02em',
      weight: '500',
    },
    headingSm: {
      size: '1.125rem',
      lineHeight: '1.2',
      letterSpacing: '-0.01em',
      weight: '600',
    },
    bodyLg: {
      size: '1.125rem',
      lineHeight: '1.6',
      letterSpacing: '0',
      weight: '400',
    },
    body: {
      size: '1rem',
      lineHeight: '1.6',
      letterSpacing: '0',
      weight: '400',
    },
    bodySm: {
      size: '0.875rem',
      lineHeight: '1.5',
      letterSpacing: '0',
      weight: '400',
    },
    label: {
      size: '0.75rem',
      lineHeight: '1.4',
      letterSpacing: '0.08em',
      weight: '500',
      textTransform: 'uppercase',
    },
    mono: {
      size: '0.75rem',
      lineHeight: '1.5',
      letterSpacing: '0',
      weight: '400',
    },
  },
} as const;

export const breakpoints = {
  mobile: '480px',
  tablet: '768px',
  desktop: '1024px',
  wide: '1440px',
} as const;

export const zIndex = {
  base: 0,
  canvas: 0,
  content: 10,
  sticky: 20,
  dropdown: 30,
  modal: 40,
  toast: 50,
  tooltip: 60,
} as const;

export const layout = {
  maxWidth: '1440px',
  gutter: {
    mobile: '24px',
    tablet: '32px',
    desktop: '40px',
  },
  headerHeight: '64px',
  navHeight: {
    mobile: '72px',
    desktop: '100%',
  },
  navWidth: {
    collapsed: '72px',
    expanded: '240px',
  },
} as const;

export type Colors = typeof colors;
export type Spacing = typeof spacing;
export type Radius = typeof radius;
export type Elevation = typeof elevation;
export type Motion = typeof motion;
export type Typography = typeof typography;
export type Breakpoints = typeof breakpoints;
export type ZIndex = typeof zIndex;
export type Layout = typeof layout;