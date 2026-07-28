/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'tastelab-yellow': '#ffd23f',
        'tastelab-yellow-soft': '#fff2c2',
        'tastelab-orange': '#ff6b35',
        'tastelab-orange-dark': '#e5541c',
        'tastelab-black': '#18140f',
        'tastelab-white': '#fffdf7',
        'tastelab-cream': '#fff9ec',
      },
      fontFamily: {
        heading: ['"Baloo 2"', 'Poppins', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'brutal-sm': '3px 3px 0 0 #18140f',
        'brutal-md': '5px 5px 0 0 #18140f',
        'brutal-lg': '8px 8px 0 0 #18140f',
      },
      borderRadius: {
        brutal: '1rem',
        neo: '1.5rem',
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
  ],
}