/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['src/**/*.njk', 'src/js/components/**/*.js', 'src/transforms/parse-transform.js'],
  darkMode: ['class', '[data-user-color-scheme="dark"]'],
  // https://colorhunt.co/palette/cdf0eaf9f9f9f6c6eafaf4b7
  theme: {
    fontFamily: {
      sans: ['Lora', 'Georgia', 'serif'],
    },
    colors: {
      white: '#f9f9f9',
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
        },
        '2xl': {
          css: {
            fontSize: '1.375rem',
          }
        }
      }
    }
  },
  plugins: [require('@tailwindcss/typography')]
};
