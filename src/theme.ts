/**
 * Fujitec CRM Theme
 * Based on Fujitec Brand Guidelines
 * Primary Color: #C8102E (Fujitec Red - Corporate Identity)
 * Typography: Modern, clean sans-serif
 */

export const FUJITEC_THEME = {
  // Primary Brand Colors
  colors: {
    primary: {
      red: '#C8102E',      // Fujitec Corporate Red
      darkRed: '#A60D26',  // Dark variant for hover states
      lightRed: '#E8354F'  // Light variant for backgrounds
    },

    // Neutral Palette
    neutral: {
      dark: '#2D3436',     // Deep charcoal for text/headings
      medium: '#636E72',   // Medium gray for secondary text
      light: '#B2BEC3',    // Light gray for tertiary text
      lighter: '#E0E0E0',  // Border/divider color
      lightest: '#F1F3F5'  // Background color
    },

    // Semantic Colors
    semantic: {
      success: '#27AE60',
      warning: '#F39C12',
      error: '#E74C3C',
      info: '#3498DB'
    }
  },

  // Typography Configuration
  typography: {
    fontFamily: {
      primary: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      mono: '"Courier New", monospace'
    },

    fontSizes: {
      xs: '0.75rem',       // 12px
      sm: '0.875rem',      // 14px
      base: '1rem',        // 16px
      lg: '1.125rem',      // 18px
      xl: '1.25rem',       // 20px
      '2xl': '1.5rem',     // 24px
      '3xl': '1.875rem',   // 30px
      '4xl': '2.25rem'     // 36px
    },

    fontWeights: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
      black: 900
    },

    lineHeights: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.75,
      loose: 2
    }
  },

  // Spacing Scale (8px base)
  spacing: {
    xs: '0.25rem',   // 4px
    sm: '0.5rem',    // 8px
    md: '1rem',      // 16px
    lg: '1.5rem',    // 24px
    xl: '2rem',      // 32px
    '2xl': '3rem',   // 48px
    '3xl': '4rem'    // 64px
  },

  // Border Radius
  borderRadius: {
    sm: '0.375rem',    // 6px
    md: '0.5rem',      // 8px
    lg: '1rem',        // 16px
    xl: '1.5rem',      // 24px
    full: '9999px'
  },

  // Shadows (Elevation system)
  shadows: {
    xs: '0 1px 2px 0 rgba(45, 52, 54, 0.05)',
    sm: '0 1px 3px 0 rgba(45, 52, 54, 0.1)',
    md: '0 4px 6px -1px rgba(45, 52, 54, 0.1)',
    lg: '0 10px 15px -3px rgba(45, 52, 54, 0.1)',
    xl: '0 20px 25px -5px rgba(45, 52, 54, 0.1)',
    '2xl': '0 25px 50px -12px rgba(45, 52, 54, 0.25)'
  },

  // Transitions
  transitions: {
    fast: 'all 150ms ease-in-out',
    normal: 'all 300ms ease-in-out',
    slow: 'all 500ms ease-in-out'
  }
};

// CSS Custom Properties for use in stylesheets
export const generateCSSVariables = () => {
  return `
    :root {
      /* Primary Colors */
      --color-primary-red: ${FUJITEC_THEME.colors.primary.red};
      --color-primary-dark-red: ${FUJITEC_THEME.colors.primary.darkRed};
      --color-primary-light-red: ${FUJITEC_THEME.colors.primary.lightRed};

      /* Neutral Colors */
      --color-neutral-dark: ${FUJITEC_THEME.colors.neutral.dark};
      --color-neutral-medium: ${FUJITEC_THEME.colors.neutral.medium};
      --color-neutral-light: ${FUJITEC_THEME.colors.neutral.light};
      --color-neutral-lighter: ${FUJITEC_THEME.colors.neutral.lighter};
      --color-neutral-lightest: ${FUJITEC_THEME.colors.neutral.lightest};

      /* Typography */
      --font-family-primary: ${FUJITEC_THEME.typography.fontFamily.primary};
      --font-family-mono: ${FUJITEC_THEME.typography.fontFamily.mono};

      /* Transitions */
      --transition-fast: ${FUJITEC_THEME.transitions.fast};
      --transition-normal: ${FUJITEC_THEME.transitions.normal};
      --transition-slow: ${FUJITEC_THEME.transitions.slow};
    }
  `;
};

/**
 * Design Token Summary for Teams:
 *
 * PRIMARY RED (#C8102E):
 * - Use for: Main CTA buttons, brand accents, important highlights
 * - Hover: #A60D26 (dark red)
 * - Background: #E8354F (light red, 20% opacity)
 *
 * TYPOGRAPHY:
 * - Primary Font: Inter (modern, clean, professional)
 * - Headings: Bold (700-900 weight), tracking-tight
 * - Body: Regular (400-500 weight), line-height 1.5
 * - Secondary: Medium gray (#636E72)
 *
 * SPACING:
 * - Base unit: 8px
 * - Use multiples: 4px, 8px, 16px, 24px, 32px, etc.
 *
 * SHADOWS:
 * - xs/sm for cards and small elements
 * - md/lg for larger components
 * - xl/2xl for modals and overlays
 */
