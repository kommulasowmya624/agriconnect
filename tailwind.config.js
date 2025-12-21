/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./*.{js,ts,jsx,tsx}",
        "./components/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
            colors: {
                agri: {
                    // Primary Green Palette
                    green: {
                        50: '#F0FDF4',
                        100: '#DCFCE7',
                        200: '#BBF7D0',
                        300: '#86EFAC',
                        400: '#4ADE80',
                        500: '#22C55E',  // Primary
                        600: '#16A34A',  // Hover
                        700: '#15803D',
                        800: '#166534',
                        900: '#14532D',
                    },
                    // Accent colors
                    light: '#FFFFFF',
                    dark: '#064E3B',
                    accent: '#22C55E',
                    gray: {
                        50: '#FAFAFA',
                        100: '#F5F5F5',
                        200: '#E5E5E5',
                        300: '#D4D4D4',
                        400: '#A3A3A3',
                        500: '#737373',
                        600: '#525252',
                        700: '#404040',
                        800: '#262626',
                        900: '#171717',
                    }
                }
            },
            animation: {
                blob: "blob 8s infinite ease-in-out",
                'fade-in': "fadeIn 0.5s ease-in-out",
                'slide-up': "slideUp 0.4s ease-out",
                'scale-in': "scaleIn 0.3s ease-out",
            },
            keyframes: {
                blob: {
                    "0%, 100%": { transform: "translate(0px, 0px) scale(1)" },
                    "33%": { transform: "translate(40px, -60px) scale(1.15)" },
                    "66%": { transform: "translate(-30px, 30px) scale(0.9)" }
                },
                fadeIn: {
                    "0%": { opacity: "0" },
                    "100%": { opacity: "1" }
                },
                slideUp: {
                    "0%": { transform: "translateY(20px)", opacity: "0" },
                    "100%": { transform: "translateY(0)", opacity: "1" }
                },
                scaleIn: {
                    "0%": { transform: "scale(0.95)", opacity: "0" },
                    "100%": { transform: "scale(1)", opacity: "1" }
                }
            },
            boxShadow: {
                'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
                'green': '0 4px 14px 0 rgba(34, 197, 94, 0.15)',
                'green-lg': '0 10px 40px -10px rgba(34, 197, 94, 0.25)',
            }
        },
    },
    plugins: [],
}
