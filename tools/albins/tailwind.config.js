module.exports = {
  content: [
    "./pages/*.{html,js}",
    "./index.html",
    "./js/*.js",
    "./components/*.html"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#2C2C2C", // gray-800
          50: "#F9F9F9", // gray-50
          100: "#F3F3F3", // gray-100
          200: "#E5E5E5", // gray-200
          300: "#D4D4D4", // gray-300
          400: "#A3A3A3", // gray-400
          500: "#737373", // gray-500
          600: "#525252", // gray-600
          700: "#404040", // gray-700
          800: "#2C2C2C", // gray-800
          900: "#171717", // gray-900
        },
        secondary: {
          DEFAULT: "#D4AF37", // yellow-600
          50: "#FEFCE8", // yellow-50
          100: "#FEF3C7", // yellow-100
          200: "#FDE68A", // yellow-200
          300: "#FCD34D", // yellow-300
          400: "#FBBF24", // yellow-400
          500: "#F59E0B", // yellow-500
          600: "#D4AF37", // yellow-600
          700: "#A16207", // yellow-700
          800: "#92400E", // yellow-800
          900: "#78350F", // yellow-900
        },
        accent: {
          DEFAULT: "#800020", // red-900
          50: "#FEF2F2", // red-50
          100: "#FEE2E2", // red-100
          200: "#FECACA", // red-200
          300: "#FCA5A5", // red-300
          400: "#F87171", // red-400
          500: "#EF4444", // red-500
          600: "#DC2626", // red-600
          700: "#B91C1C", // red-700
          800: "#991B1B", // red-800
          900: "#800020", // red-900
        },
        background: "#F8F6F0", // stone-50
        surface: "#FFFFFF", // white
        text: {
          primary: "#1A1A1A", // gray-900
          secondary: "#666666", // gray-500
        },
        success: {
          DEFAULT: "#2D5A27", // green-800
          50: "#F0FDF4", // green-50
          100: "#DCFCE7", // green-100
          500: "#22C55E", // green-500
          800: "#2D5A27", // green-800
        },
        warning: {
          DEFAULT: "#B8860B", // yellow-700
          50: "#FFFBEB", // amber-50
          100: "#FEF3C7", // amber-100
          500: "#F59E0B", // amber-500
          700: "#B8860B", // amber-700
        },
        error: {
          DEFAULT: "#8B0000", // red-800
          50: "#FEF2F2", // red-50
          100: "#FEE2E2", // red-100
          500: "#EF4444", // red-500
          800: "#8B0000", // red-800
        },
      },
      fontFamily: {
        playfair: ['Playfair Display', 'serif'],
        inter: ['Inter', 'sans-serif'],
        crimson: ['Crimson Text', 'serif'],
        sans: ['Inter', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
        accent: ['Crimson Text', 'serif'],
      },
      fontSize: {
        'hero': ['3.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'display': ['2.5rem', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
        'heading': ['2rem', { lineHeight: '1.3' }],
        'subheading': ['1.5rem', { lineHeight: '1.4' }],
        'body': ['1rem', { lineHeight: '1.6' }],
        'caption': ['0.875rem', { lineHeight: '1.5' }],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      boxShadow: {
        'soft': '0 4px 20px rgba(44, 44, 44, 0.1)',
        'elevated': '0 8px 30px rgba(44, 44, 44, 0.15)',
        'hero': '0 20px 60px rgba(44, 44, 44, 0.2)',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
      },
      animation: {
        'fade-in': 'fadeInUp 400ms ease-out forwards',
        'parallax': 'parallax 20s ease-in-out infinite',
      },
      keyframes: {
        fadeInUp: {
          '0%': {
            opacity: '0',
            transform: 'translateY(10px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        parallax: {
          '0%, 100%': {
            transform: 'translateY(0px)',
          },
          '50%': {
            transform: 'translateY(-10px)',
          },
        },
      },
      transitionDuration: {
        '300': '300ms',
        '400': '400ms',
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'content': 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      },
    },
  },
  plugins: [
    function({ addUtilities }) {
      const newUtilities = {
        '.text-balance': {
          'text-wrap': 'balance',
        },
        '.transition-smooth': {
          'transition': 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
        },
        '.transition-content': {
          'transition': 'all 400ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        },
      }
      addUtilities(newUtilities)
    }
  ],
}