/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // UXmagic design colors - artsy, warm palette
        ink: {
          red: '#D33A2C',
          charcoal: '#27272A',
        },
        warm: {
          orange: '#F5A623',
          yellow: '#F6D547',
          grey: '#4B4B4B'
        },
        cerulean: '#2B82C6',
        indigo: '#3449A6',
        parchment: '#F5F1E8',
      },
      fontFamily: {
        serif: ['"DM Serif Display"', 'serif'],
        sans: ['"Inter"', 'sans-serif'],
        hand: ['"Caveat"', 'cursive'],
      },
      boxShadow: {
        'watercolor-orange': '0 12px 28px -8px rgba(245, 166, 35, 0.25), 0 6px 12px -4px rgba(245, 166, 35, 0.15)',
        'watercolor-blue': '0 12px 28px -8px rgba(43, 130, 198, 0.25), 0 6px 12px -4px rgba(43, 130, 198, 0.15)',
        'watercolor-purple': '0 12px 28px -8px rgba(52, 73, 166, 0.25), 0 6px 12px -4px rgba(52, 73, 166, 0.15)',
        'watercolor-red': '0 12px 28px -8px rgba(211, 58, 44, 0.25), 0 6px 12px -4px rgba(211, 58, 44, 0.15)',
        'paper': '0 2px 8px 0 rgba(0, 0, 0, 0.08), 0 1px 3px -1px rgba(0, 0, 0, 0.06)',
        'paper-lift': '0 8px 24px -4px rgba(0, 0, 0, 0.12), 0 4px 12px -2px rgba(0, 0, 0, 0.08)',
      },
    },
  },
  plugins: [],
}
