/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx,html}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#f1f5f9",
        surface: "#ffffff",
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#f8fafc",
        "surface-container": "#f1f5f9",
        "surface-container-high": "#e2e8f0",
        "surface-container-highest": "#cbd5e1",
        
        primary: "#dbeafe",
        "on-primary": "#0f172a",
        "primary-container": "#bfdbfe",
        "on-primary-container": "#0f172a",
        
        secondary: "#e2e8f0",
        "on-secondary": "#0f172a",
        "secondary-container": "#f1f5f9",
        "on-secondary-container": "#0f172a",

        "on-background": "#0f172a",
        "on-surface": "#0f172a",
        "on-surface-variant": "#334155",
        
        outline: "#94a3b8",
        "outline-variant": "#cbd5e1",
        
        error: "#fca5a5",
        "on-error": "#450a0a",
        "error-container": "#fee2e2",
        "on-error-container": "#7f1d1d",
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/container-queries'),
  ],
}
