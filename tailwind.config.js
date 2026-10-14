/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        romantic: {
          dark: '#140518',
          surface: '#1E0824',
          card: '#290B30',
          cardHover: '#350E3E',
          cardGlass: 'rgba(38, 12, 45, 0.72)',
          liquidGlass: 'rgba(34, 10, 40, 0.65)',
          border: 'rgba(255, 117, 143, 0.25)',
          borderLight: 'rgba(255, 117, 143, 0.4)',
          glow: '#FF4D6D',
          textMuted: '#CBBAD9',
          burgundy: '#1E061D',
          plum: '#2A082C',
          midnight: '#170628',
          wine: '#3A0B28'
        },
        rose: {
          50: '#FFF0F3',
          100: '#FFCCD5',
          200: '#FFB3C1',
          300: '#FF8FA3',
          400: '#FF758F',
          500: '#FF4D6D',
          600: '#C9184A',
          700: '#A4133C',
          800: '#800F2F',
          900: '#590D22',
        },
        champagne: {
          50: '#FFF9F2',
          100: '#FFF0DE',
          200: '#FFE1BE',
          300: '#FFCE95',
          400: '#FFB664',
          500: '#FA9E38',
        }
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"SF Pro Display"',
          '"SF Pro Text"',
          '"SF Pro"',
          '"Segoe UI"',
          'Roboto',
          'Helvetica',
          'Arial',
          'sans-serif'
        ],
        serif: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"SF Pro Display"',
          '"SF Pro Text"',
          '"SF Pro"',
          '"Segoe UI"',
          'Roboto',
          'Helvetica',
          'Arial',
          'sans-serif'
        ],
        romantic: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"SF Pro Display"',
          '"SF Pro Text"',
          '"SF Pro"',
          '"Segoe UI"',
          'Roboto',
          'Helvetica',
          'Arial',
          'sans-serif'
        ]
      },
      boxShadow: {
        'glow-sm': '0 0 15px rgba(255, 77, 109, 0.25)',
        'glow-md': '0 0 25px rgba(255, 77, 109, 0.35)',
        'glow-lg': '0 0 45px rgba(255, 77, 109, 0.45)',
        'glow-rose': '0 10px 30px -10px rgba(255, 77, 109, 0.5)',
        'glow-gold': '0 10px 30px -10px rgba(255, 206, 149, 0.4)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'liquid': '0 12px 36px 0 rgba(0, 0, 0, 0.4), inset 0 1px 0 0 rgba(255, 255, 255, 0.25), inset 0 0 25px 0 rgba(255, 77, 109, 0.08)',
        'liquid-hover': '0 18px 45px -10px rgba(255, 77, 109, 0.35), inset 0 1px 0 0 rgba(255, 255, 255, 0.45), inset 0 0 35px 0 rgba(255, 77, 109, 0.15)',
        'liquid-glow': '0 0 25px rgba(255, 77, 109, 0.45), inset 0 1px 0 0 rgba(255, 255, 255, 0.5)',
      },
      animation: {
        'pulse-subtle': 'pulseSubtle 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'heartbeat': 'heartbeat 1.6s ease-in-out infinite',
        'float-slow': 'float 6s ease-in-out infinite',
        'liquid-shimmer': 'liquidShimmer 5s ease infinite',
        'liquid-glow': 'liquidGlow 4s ease-in-out infinite alternate',
      },
      keyframes: {
        pulseSubtle: {
          '0%, 100%': { opacity: 1, transform: 'scale(1)' },
          '50%': { opacity: 0.88, transform: 'scale(1.02)' },
        },
        heartbeat: {
          '0%': { transform: 'scale(1)' },
          '14%': { transform: 'scale(1.1)' },
          '28%': { transform: 'scale(1)' },
          '42%': { transform: 'scale(1.15)' },
          '70%': { transform: 'scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        liquidShimmer: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        liquidGlow: {
          '0%': { filter: 'drop-shadow(0 0 12px rgba(255, 77, 109, 0.25))' },
          '100%': { filter: 'drop-shadow(0 0 28px rgba(255, 77, 109, 0.55))' },
        }
      }
    },
  },
  plugins: [],
}
