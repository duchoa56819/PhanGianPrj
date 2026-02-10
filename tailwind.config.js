/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        card: {
          red: '#EF4444',
          yellow: '#F59E0B',
          blue: '#3B82F6',
          black: '#1F2937',
        },
        jade: '#10B981',
        surface: {
          dark: '#0F172A',
          card: '#1E293B',
          elevated: '#334155',
        }
      },
      boxShadow: {
        'card': '0 4px 20px rgba(0, 0, 0, 0.3)',
        'glow-jade': '0 0 20px rgba(16, 185, 129, 0.5)',
      }
    },
  },
  plugins: [],
}
