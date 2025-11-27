// postcss.config.js
export default {
  plugins: {
    // tailwindcss: {}, // <--- DELETE THIS LINE
    '@tailwindcss/postcss': {}, // <--- ADD THIS LINE
    autoprefixer: {},
  },
}