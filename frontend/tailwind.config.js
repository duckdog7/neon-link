/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        mono: ['"Share Tech Mono"', '"Courier New"', 'monospace'],
        display: ['"Orbitron"', 'monospace'],
      },
      colors: {
        neon: {
          cyan:   '#00ffff',
          green:  '#00ff88',
          pink:   '#ff00ff',
          amber:  '#ffaa00',
          red:    '#ff3333',
          blue:   '#0088ff',
        },
        dark: {
          900: '#050a0e',
          800: '#0a1520',
          700: '#0f1e2d',
          600: '#162436',
        },
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
        'scroll-up': 'scrollUp 20s linear infinite',
        'typewriter': 'typewriter 0.05s steps(1) forwards',
        'scanline': 'scanline 4s linear infinite',
        'flicker': 'flicker 6s infinite',
      },
      keyframes: {
        scrollUp: {
          '0%':   { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(-50%)' },
        },
        scanline: {
          '0%':   { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        flicker: {
          '0%,94%,96%,98%,100%': { opacity: 1 },
          '95%,97%,99%': { opacity: 0.85 },
        },
      },
      boxShadow: {
        'neon-cyan':  '0 0 8px #00ffff, 0 0 20px #00ffff44',
        'neon-green': '0 0 8px #00ff88, 0 0 20px #00ff8844',
        'neon-pink':  '0 0 8px #ff00ff, 0 0 20px #ff00ff44',
        'neon-amber': '0 0 8px #ffaa00, 0 0 20px #ffaa0044',
        'neon-red':   '0 0 8px #ff3333, 0 0 20px #ff333344',
        'panel':      'inset 0 0 30px rgba(0,255,255,0.03), 0 0 0 1px rgba(0,255,255,0.15)',
      },
    },
  },
  plugins: [],
};
