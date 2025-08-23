/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#0b0b0f",
        pane: "#14141A",
        mute: "#A0A3BD",
        accent: "#7CFFCB"
      }
    }
  },
  plugins: []
};
