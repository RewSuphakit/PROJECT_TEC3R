/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    fontFamily: {
      sans: ['Krub', 'sans-serif'],
    },
    extend: {},
  },
  plugins: [
    require("daisyui"),
    require('tailwindcss-animated'),
  ],
  daisyui: {
    themes: [ "winter"],
  },
}