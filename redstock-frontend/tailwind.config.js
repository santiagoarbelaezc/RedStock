/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        accent: 'var(--accent-color)',
        'accent-light': 'var(--accent-light)',
      },
    },
  },
  plugins: [],
};
