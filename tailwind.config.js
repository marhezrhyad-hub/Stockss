/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#070908',
        panel: '#101411',
        line: '#253028',
        gain: '#41e68c',
        loss: '#ff6474',
        muted: '#98a39b',
      },
      boxShadow: {
        glow: '0 0 40px rgba(65,230,140,.08)',
      },
    },
  },
  plugins: [],
};
