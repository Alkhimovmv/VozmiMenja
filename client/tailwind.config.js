/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans:    ['Manrope', 'system-ui', 'sans-serif'],
        heading: ['Manrope', 'system-ui', 'sans-serif'],
        body:    ['Inter Tight', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        // Manrope heading scale
        'h1': ['56px', { lineHeight: '1.05', letterSpacing: '-0.025em', fontWeight: '700' }],
        'h2': ['36px', { lineHeight: '1.15', letterSpacing: '-0.01em',  fontWeight: '700' }],
        'h3': ['22px', { lineHeight: '1.3',  letterSpacing: '0',        fontWeight: '700' }],
        // Inter Tight body scale
        'body': ['15px', { lineHeight: '1.6', fontWeight: '400' }],
        'micro': ['12px', { lineHeight: '1.4', letterSpacing: '0.04em', fontWeight: '500' }],
      },
      colors: {
        ink:     '#0F172A',
        bg:      '#F8FAFC',
        primary: {
          DEFAULT: '#2563EB',
          50:  '#EFF6FF',
          100: '#DBEAFE',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
        },
        accent:  '#7C3AED',
        soft:    '#DBEAFE',
        muted:   '#64748B',
        line:    '#E2E8F0',
        surface: '#FFFFFF',
      },
      borderRadius: {
        'sm':  '8px',
        'md':  '14px',
        'lg':  '20px',
        'xl':  '28px',
        '2xl': '28px',
        '3xl': '28px',
      },
      typography: {
        DEFAULT: {
          css: { maxWidth: 'none' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
