/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#0B0F19',       // Dark navy background sesuai PRD
          surface: '#161F30',    // Card background base
          pastelBlue: '#A5C9FF', // Soft pastel blue
          neonCyan: '#00F0FF',   // Glow neon cyan
          muted: '#64748B',      // Text muted gray
        }
      },
      boxShadow: {
        // Efek Neomorphism lembut untuk tombol/input aktif
        'neo-in': 'inset 2px 2px 5px #0b0f19, inset -2px -2px 5px #212f47',
        'neo-out': '4px 4px 10px #0b0f19, -4px -4px 10px #1d2b43',
        // Efek glow AI untuk kartu dan badge
        'neon-glow': '0 0 15px rgba(0, 240, 255, 0.2)',
      }
    },
  },
  plugins: [],
}