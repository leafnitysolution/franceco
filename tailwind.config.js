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
        brand: {
          50: '#FDFBF7',
          100: '#F7F2E7',
          200: '#EAE0CA',
          300: '#DFCFA8',
          400: '#D4BD82',
          500: '#C5A059', // Primary Luxury Gold
          600: '#B08B43',
          700: '#9E7B3B',
          800: '#84642C',
          900: '#6B4F20',
        },
        cream: {
          50: '#FBF9F5',
          100: '#F5F2EA',
          200: '#EAE4D5',
          300: '#DDD5C0',
        },
        gold: {
          50: '#FDFBF7',
          100: '#F7F2E7',
          200: '#EAE0CA',
          300: '#DFCFA8',
          400: '#D4BD82',
          500: '#C5A059', // Primary Luxury Gold
          600: '#B08B43',
          700: '#9E7B3B',
          border: '#E5D7BC',
        },
        navy: {
          800: '#0F1E36',
          900: '#0B192C',
          950: '#050D1A',
        }
      },
      fontFamily: {
        serif: ['var(--font-serif)', 'Playfair Display', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
