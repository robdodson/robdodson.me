/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['src/**/*.njk', 'src/transforms/parse-transform.js'],
  theme: {
    extend: {}
  },
  plugins: [require('@tailwindcss/typography')]
};
