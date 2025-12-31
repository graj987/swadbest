/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
  

    theme: {
        fontFamily: {
            sans: ["Inter", "system-ui", "sans-serif"],
            display: ["Poppins", "system-ui", "sans-serif"],
        },

        extend: {
            /* ===========================
             SWADBEST BRAND COLORS
            ============================== */
            colors: {
                brand: {
                    light: "#FFEDD5",
                    DEFAULT: "#FB923C",
                    dark: "#EA580C",
                    deep: "#C2410C",
                },
                brown: {
                    DEFAULT: "#7C3F00",
                    light: "#B1742A",
                },
            },


            /* ===========================
             CUSTOM SHADOWS (Premium)
            ============================== */
            boxShadow: {
                card: "0 6px 20px rgba(0,0,0,0.08)",
                cardHover: "0 12px 30px rgba(0,0,0,0.12)",
                smooth: "0 4px 14px rgba(251,146,60,0.35)",
                soft: "0px 2px 8px rgba(0,0,0,0.08)",
            },


            /* ===========================
             GRADIENTS
            ============================== */
            backgroundImage: {
                "swad-gradient":
                    "linear-gradient(135deg, #fb923c 0%, #ea580c 45%, #c2410c 100%)",
                "swad-light":
                    "linear-gradient(180deg, #fff7ed 0%, #ffedd5 100%)",
            },


            /* ===========================
             ANIMATIONS & KEYFRAMES
            ============================== */
            keyframes: {
                fadeIn: {
                    "0%": { opacity: 0, transform: "translateY(10px)" },
                    "100%": { opacity: 1, transform: "translateY(0)" },
                },
                slideUp: {
                    "0%": { opacity: 0, transform: "translateY(25px)" },
                    "100%": { opacity: 1, transform: "translateY(0)" },
                },
                float: {
                    "0%": { transform: "translateY(0px)" },
                    "50%": { transform: "translateY(-8px)" },
                    "100%": { transform: "translateY(0px)" },
                },
                floatSlow: {
                    "0%": { transform: "translateY(0px)" },
                    "50%": { transform: "translateY(-5px)" },
                    "100%": { transform: "translateY(0px)" },
                },
                scaleSmooth: {
                    "0%": { transform: "scale(0.95)", opacity: 0 },
                    "100%": { transform: "scale(1)", opacity: 1 },
                },
                slideDown: {
                    "0%": { opacity: 0, transform: "translateY(-10px)" },
                    "100%": { opacity: 1, transform: "translateY(0)" },
                },
            },
            animation: {
                fadeIn: "fadeIn 0.6s ease-out",
                fadeInSlow: "fadeIn 1.2s ease-out",
                slideUp: "slideUp 0.7s ease-out",
                float: "float 4s ease-in-out infinite",
                floatSlow: "floatSlow 6s ease-in-out infinite",
                scaleSmooth: "scaleSmooth 0.6s ease-out",
                slideDown: "slideDown 0.3s ease-out",
            },


            /* ===========================
             TYPOGRAPHY SCALE (Mobile First)
            ============================== */
            fontSize: {
                base: "0.95rem",
                sm: "0.85rem",
                lg: "1.05rem",
                xl: "1.35rem",
                "2xl": "1.7rem",
                "3xl": "2rem",
                "4xl": "2.4rem",
                "5xl": "3rem",
            },


            /* ===========================
             RADIUS (Premium Look)
            ============================== */
            borderRadius: {
                soft: "14px",
                card: "20px",
                pill: "40px",
            },
        },
    },
    plugins: [],
};
