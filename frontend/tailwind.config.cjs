/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        neon: {
          pink: "#ff0080",
          blue: "#00f0ff",
          green: "#39ff14",
        },
      },
    },
  },
  plugins: [],
};
