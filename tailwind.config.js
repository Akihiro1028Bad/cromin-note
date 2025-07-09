/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#ff6b35',
          dark: '#e55a2b',
        },
        secondary: '#1e3a8a',
        accent: '#fbbf24',
        success: '#10b981',
        danger: '#ef4444',
        warning: '#f59e0b',
        'bg-gradient-1': '#0f172a',
        'bg-gradient-2': '#1e293b',
        'bg-gradient-3': '#334155',
        'text-primary': '#ffffff',
        'text-secondary': '#e2e8f0',
        'text-muted': '#cbd5e1',
        'card-bg': 'rgba(15, 23, 42, 0.9)',
        'card-border': 'rgba(251, 191, 36, 0.3)',
      },
      fontFamily: {
        sans: ['Inter', 'Noto Sans JP', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'bounce-subtle': 'bounce-subtle 2s ease-in-out infinite',
        'slide-in-up': 'slide-in-up 0.5s ease-out',
        'fade-in-scale': 'fade-in-scale 0.3s ease-out',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': {
            boxShadow: '0 0 5px var(--primary)',
          },
          '50%': {
            boxShadow: '0 0 20px var(--primary), 0 0 30px var(--accent)',
          },
        },
        'bounce-subtle': {
          '0%, 100%': {
            transform: 'translateY(0)',
          },
          '50%': {
            transform: 'translateY(-5px)',
          },
        },
        'slide-in-up': {
          from: {
            opacity: '0',
            transform: 'translateY(30px)',
          },
          to: {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        'fade-in-scale': {
          from: {
            opacity: '0',
            transform: 'scale(0.9)',
          },
          to: {
            opacity: '1',
            transform: 'scale(1)',
          },
        },
      },
      textColor: {
        'white': {
          '70': 'rgba(255, 255, 255, 0.7)',
          '80': 'rgba(255, 255, 255, 0.8)',
          '90': 'rgba(255, 255, 255, 0.9)',
        },
      },
      backgroundColor: {
        'white': {
          '20': 'rgba(255, 255, 255, 0.2)',
          '70': 'rgba(255, 255, 255, 0.7)',
          '80': 'rgba(255, 255, 255, 0.8)',
          '90': 'rgba(255, 255, 255, 0.9)',
        },
      },
    },
  },
  plugins: [],
}

