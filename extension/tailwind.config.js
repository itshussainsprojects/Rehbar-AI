/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-subtle': 'bounce 1s ease-in-out infinite',
      },
      backdropBlur: {
        xs: '2px',
      },
      colors: {
        'glass': 'rgba(0, 0, 0, 0.8)',
        'glass-light': 'rgba(255, 255, 255, 0.1)',
      }
    },
  },
  plugins: [],
}
