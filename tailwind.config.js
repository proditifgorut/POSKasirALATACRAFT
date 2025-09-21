/** @type {import('tailwindcss').Config} */
export default {
  content: ["./*.html", "./*.js"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9f4',
          100: '#dcf2e3',
          300: '#86efac',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d'
        },
        cream: {
          50: '#fefdf8',
          100: '#fdf8f0',
          200: '#f9f0e3',
          300: '#f4e6d3',
          400: '#eed9bd',
          500: '#e6caa3'
        }
      }
    },
  },
  plugins: [],
}
