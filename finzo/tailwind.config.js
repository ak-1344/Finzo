/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: '#1A56DB',
        success: '#16A34A',
        danger: '#DC2626',
        warning: '#D97706',
        neutral: '#6B7280',
        background: '#F9FAFB',
        card: '#FFFFFF',
        'text-primary': '#111827',
        'text-secondary': '#6B7280',
        'text-muted': '#9CA3AF',
      },
      fontFamily: {
        mono: ['SpaceMono', 'monospace'],
      },
    },
  },
  plugins: [],
};
