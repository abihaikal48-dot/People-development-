/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        red: {
          DEFAULT: '#C0392B',
          dark: '#8E2A1F',
        },
        yellow: '#F4B400',
        ink: '#1E1E1E',
        bg: '#F6F5F3',
        card: '#FFFFFF',
        border: '#E7E3DE',
        muted: '#8A8580',
        ok: '#2E7D32',
        warn: '#C77700',
        bad: '#C0392B',
      },
      borderRadius: {
        'radius': '14px',
        'radius-lg': '20px',
      }
    },
  },
  plugins: [],
}
