/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Orbitron', 'sans-serif'],  
                battle: ['Orbitron', 'sans-serif'], 
            },
            colors: {
                bg: 'var(--color-bg)',
                text: 'var(--color-text)',
                board: 'var(--color-board)',
                ship: 'var(--color-ship)',
                'ship-hit': 'var(--color-ship-hit)',
                'ship-sunk': 'var(--color-ship-sunk)',
                water: 'var(--color-water)',
                'water-miss': 'var(--color-water-miss)',
                accent: 'var(--color-accent)',
                border: 'var(--color-border)',
                panel: 'var(--color-panel)',
                btn: {
                    bg: 'var(--color-btn-bg)',
                    text: 'var(--color-btn-text)',
                    hover: 'var(--color-btn-hover)',
                    active: 'var(--color-btn-active)',
                    shadow: 'var(--color-btn-shadow)',
                    disabled: 'var(--color-btn-disabled)',
                },
            },

        },
    },
    plugins: [],
}
