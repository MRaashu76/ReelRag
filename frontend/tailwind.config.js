/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: "hsl(var(--card))",
        "card-foreground": "hsl(var(--card-foreground))",
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        "video-a": "hsl(var(--video-a))",
        "video-b": "hsl(var(--video-b))",
      },
      fontFamily: {
        sans: ["var(--font-sans)"],
        mono: ["var(--font-mono)"],
        display: ["var(--font-display)"],
      },
      animation: {
        "pulse-glow": "pulseGlow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "fade-in": "fadeIn 0.5s ease-out",
        "slide-up": "slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
        "shimmer": "shimmer 2s linear infinite",
        "energy-wave": "energyWave 4s infinite linear",
        "float": "float 6s ease-in-out infinite",
      },
      keyframes: {
        pulseGlow: {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.8", transform: "scale(1.02)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        energyWave: {
          "0%": { backgroundPosition: "0% 50%" },
          "100%": { backgroundPosition: "100% 50%" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
      boxShadow: {
        "glow-orange": "0 0 20px 2px rgba(255, 90, 0, 0.3)",
        "glow-red": "0 0 20px 2px rgba(255, 0, 60, 0.3)",
        "glow-orange-lg": "0 0 40px 5px rgba(255, 90, 0, 0.4)",
        "cyber-inner": "inset 0 0 15px rgba(255, 90, 0, 0.1)",
      },
      backgroundImage: {
        'cyber-gradient': 'linear-gradient(to right, #000000, #110500)',
      }
    },
  },
  plugins: [],
};
