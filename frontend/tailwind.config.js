/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        // Dynamic Theme-Aware Palette Tokens
        'slate-deep': 'var(--color-slate-deep, #2C3E50)',
        'charcoal-soft': 'var(--color-charcoal-soft, #343A40)',
        'sage-accent': 'var(--color-sage-accent, #8AA399)',
        'sage-muted': 'var(--color-sage-muted, #DDE5B6)',
        'sage-light': 'var(--color-sage-light, #EEF3E2)',
        'clinical-blue': 'var(--color-clinical-blue, #4A6274)',
        'clinical-blue-light': 'var(--color-clinical-blue-light, #E8EFF4)',
        'bone-white': 'var(--color-bone-white, #FDFDFD)',
        
        // Surface & Background Tokens
        'surface': 'var(--color-surface, #F8F9FA)',
        'surface-dim': 'var(--color-surface-dim, #D9DADB)',
        'surface-bright': 'var(--color-surface, #F8F9FA)',
        'surface-container-lowest': 'var(--color-bone-white, #FFFFFF)',
        'surface-container-low': 'var(--color-surface, #F3F4F5)',
        'surface-container': 'var(--color-surface-container, #EDEEEF)',
        'surface-container-high': 'var(--color-surface-container-high, #E7E8E9)',
        'surface-container-highest': 'var(--color-surface-container-high, #E1E3E4)',
        'surface-tint': 'var(--color-clinical-blue, #4E6073)',
        
        // Semantic Tokens
        'primary': 'var(--color-slate-deep, #162839)',
        'primary-container': 'var(--color-surface-container, #2C3E50)',
        'on-primary': '#FFFFFF',
        'on-primary-container': 'var(--color-slate-deep, #96A9BE)',
        'inverse-primary': '#B5C8DF',
        
        'secondary': 'var(--color-sage-accent, #496800)',
        'secondary-container': 'var(--color-sage-light, #C8F17A)',
        'on-secondary': '#FFFFFF',
        'on-secondary-container': 'var(--color-slate-deep, #4E6E00)',
        
        'tertiary': 'var(--color-clinical-blue, #0F2939)',
        'tertiary-container': 'var(--color-clinical-blue-light, #273F50)',
        
        'outline': 'var(--color-charcoal-soft, #74777D)',
        'outline-variant': 'var(--color-surface-dim, #C4C6CD)',
        'on-surface': 'var(--color-on-surface, #191C1D)',
        'on-surface-variant': 'var(--color-on-surface-variant, #43474C)',
        'inverse-surface': 'var(--color-on-surface, #2E3132)',
        
        'error': '#BA1A1A',
        'error-container': '#FFDAD6',
        'on-error': '#FFFFFF',
        'on-error-container': '#93000A',
      },
      fontFamily: {
        serif: ['"Source Serif 4"', 'Georgia', 'serif'],
        sans: ['"Hanken Grotesk"', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        sm: '0.125rem',
        DEFAULT: '0.25rem',
        md: '0.375rem',
        lg: '0.5rem',
        xl: '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
        full: '9999px',
      },
      keyframes: {
        'breathe-slow': {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.8' },
          '35%': { transform: 'scale(1.35)', opacity: '1' },
          '65%': { transform: 'scale(1.35)', opacity: '0.95' },
          '90%': { transform: 'scale(1)', opacity: '0.8' },
        },
        'pulse-subtle': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        'wave': {
          '0%, 100%': { height: '8px' },
          '50%': { height: '32px' },
        }
      },
      animation: {
        'breathe-478': 'breathe-slow 19s ease-in-out infinite',
        'pulse-subtle': 'pulse-subtle 3s ease-in-out infinite',
        'float': 'float 4s ease-in-out infinite',
        'wave-bar': 'wave 1.2s ease-in-out infinite',
      }
    },
  },
  plugins: [],
};
