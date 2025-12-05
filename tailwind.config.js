/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Warm, friendly, artsy palette
        peach: {
          50: '#FFF7ED',
          100: '#FFEDD5',
          200: '#FED7AA',
        },
        coral: {
          400: '#F472B6',
          500: '#EC4899',
          600: '#DB2777',
        },
        lavender: {
          50: '#FAF5FF',
          100: '#F3E8FF',
          200: '#E9D5FF',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'DM Sans', 'sans-serif'],
        handwritten: ['Caveat', 'Patrick Hand', 'cursive'],
      },
      animation: {
        'bounce-slow': 'bounce 2s infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      boxShadow: {
        'purple': '0 10px 30px -10px rgba(147, 51, 234, 0.3)',
        'pink': '0 10px 30px -10px rgba(236, 72, 153, 0.3)',
        'orange': '0 10px 30px -10px rgba(251, 146, 60, 0.3)',
        'colorful': '0 10px 40px -10px rgba(147, 51, 234, 0.2), 0 0 20px -5px rgba(236, 72, 153, 0.15)',
      },
    },
  },
  plugins: [],
}
