/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand Colors
        primary: {
          DEFAULT: '#1D3557',
          foreground: '#F1FAEE',
        },
        accent: {
          DEFAULT: '#A8DADC',
          foreground: '#1D3557',
        },
        background: '#F1FAEE',
        foreground: '#1D3557',
        
        // Semantic Verdict States
        followup: {
          DEFAULT: '#2A9D8F',
          foreground: '#FFFFFF',
        },
        monitoring: {
          DEFAULT: '#E9C46A',
          foreground: '#1D3557',
        },
        notgood: {
          DEFAULT: '#E76F51',
          foreground: '#FFFFFF',
        },
        discuss: {
          DEFAULT: '#F4A261',
          foreground: '#1D3557',
        },
        
        // shadcn/ui compatibility
        border: '#A8DADC',
        input: '#A8DADC',
        ring: '#1D3557',
        card: {
          DEFAULT: '#FFFFFF',
          foreground: '#1D3557',
        },
        muted: {
          DEFAULT: '#E8F4F5',
          foreground: '#5A7A8C',
        },
        destructive: {
          DEFAULT: '#E76F51',
          foreground: '#FFFFFF',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
      },
      spacing: {
        // 8pt grid system
        'grid': '0.5rem', // 8px
      },
      borderRadius: {
        lg: '0.5rem',
        md: '0.375rem',
        sm: '0.25rem',
      },
      transitionDuration: {
        'calm': '225ms',
      },
      transitionTimingFunction: {
        'calm': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [],
}
