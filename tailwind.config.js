/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
  "./src/app/**/*.{js,ts,jsx,tsx}",
  "./src/components/**/*.{js,ts,jsx,tsx}",
],
  theme: {
    extend: {
      colors: {
        "dark-bg": "#0A1D21",
        "light-text": "#F3EEE6",
        "dark-text": "#9CA9A9",
        "accent-teal": "#00B4AA",
        "accent-beige": "#E5C9A4",
        "card-bg": "#143034",
      },
    },
  },
  plugins: [],
};
