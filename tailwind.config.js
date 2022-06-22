/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['src/**/*.njk', 'src/transforms/parse-transform.js'],
  theme: {
    colors: {
      white: '#f9f8f6',
      black: '#000'
    },
    extend: {
      typography: {
        DEFAULT: {
          css: {
            // Remove backticks from <code> blocks
            'code::before': {
              content: '""'
            },
            'code::after': {
              content: '""'
            }
          }
        }
      }
    }
  },
  plugins: [require('@tailwindcss/typography')]
};
