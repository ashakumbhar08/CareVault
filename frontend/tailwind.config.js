/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#F7F8FA',
        card: '#FFFFFF',
        accent: '#2A7BE4',
        border: '#E4E7EC',
        'text-primary': '#111827',
        'text-secondary': '#4B5563',
        success: '#0F9D6A',
        warning: '#D97706',
        error: '#DC2626',
        muted: '#9CA3AF',
        'surface-hover': '#F3F4F6',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'card': '12px',
        'input': '8px',
        'badge': '6px',
      },
      boxShadow: {
        'custom': '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
      },
    },
  },
  plugins: [],
}
