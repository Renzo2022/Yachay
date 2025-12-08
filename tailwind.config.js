/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    fontFamily: {
      sans: ['Archivo', 'system-ui', 'sans-serif'],
      mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'monospace'],
    },
    borderRadius: {
      none: '0px',
      sm: '0px',
      DEFAULT: '0px',
      md: '0px',
      lg: '0px',
      xl: '0px',
      '2xl': '0px',
      '3xl': '0px',
      full: '0px',
    },
    extend: {
      colors: {
        main: '#111111',
        'text-main': '#FFFFFF',
        'accent-primary': '#FF005C',
        'accent-secondary': '#00FFFF',
        'accent-violet': '#D946EF',
        'accent-success': '#00FF00',
        'accent-warning': '#FFD300',
        'accent-danger': '#FF1744',
        'neutral-100': '#F5F5F5',
        'neutral-900': '#0A0A0A',
      },
      borderWidth: {
        3: '3px',
        4: '4px',
      },
      boxShadow: {
        brutal: '4px 4px 0px 0px #000000',
        'brutal-inverse': '-4px -4px 0px 0px #FFFFFF',
      },
      keyframes: {
        'square-blink': {
          '0%, 100%': { transform: 'translate(0, 0)', opacity: '1' },
          '50%': { transform: 'translate(4px, -4px)', opacity: '0.6' },
        },
      },
      animation: {
        'square-blink': 'square-blink 0.8s steps(2, end) infinite',
      },
    },
  },
  plugins: [],
}

