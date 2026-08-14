/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Serene Logic Brand & Clinical Empathy Palette
        'slate-deep': '#2C3E50',
        'charcoal-soft': '#343A40',
        'sage-accent': '#8AA399',
        'sage-muted': '#DDE5B6',
        'sage-light': '#EEF3E2',
        'clinical-blue': '#4A6274',
        'clinical-blue-light': '#E8EFF4',
        'bone-white': '#FDFDFD',
        
        // Surface & Background Tokens
        'surface': '#F8F9FA',
        'surface-dim': '#D9DADB',
        'surface-bright': '#F8F9FA',
        'surface-container-lowest': '#FFFFFF',
        'surface-container-low': '#F3F4F5',
        'surface-container': '#EDEEEF',
        'surface-container-high': '#E7E8E9',
        'surface-container-highest': '#E1E3E4',
        'surface-tint': '#4E6073',
        
        // Semantic Tokens
        'primary': '#162839',
        'primary-container': '#2C3E50',
        'on-primary': '#FFFFFF',
        'on-primary-container': '#96A9BE',
        'inverse-primary': '#B5C8DF',
        
        'secondary': '#496800',
        'secondary-container': '#C8F17A',
        'on-secondary': '#FFFFFF',
        'on-secondary-container': '#4E6E00',
        
        'tertiary': '#0F2939',
        'tertiary-container': '#273F50',
        
        'outline': '#74777D',
        'outline-variant': '#C4C6CD',
        'on-surface': '#191C1D',
        'on-surface-variant': '#43474C',
        'inverse-surface': '#2E3132',
        
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
