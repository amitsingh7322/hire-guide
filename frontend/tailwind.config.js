/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        teal: {
          50: '#e6f7f9',
          100: '#cceff3',
          200: '#99dfe7',
          300: '#66cfdb',
          400: '#33bfcf',
          500: '#21808d',
          600: '#1d7480',
          700: '#1a6873',
          800: '#165c66',
          900: '#135059',
        },
        coral: {
          50: '#ffe0e0',
          100: '#ffcccc',
          200: '#ff9999',
          300: '#ff6b6b',
          400: '#ff5252',
          500: '#ff3838',
          600: '#e63030',
          700: '#cc2828',
        },
      },
    },
  },
  plugins: [],
}
