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
                bg2: 'var(--color-bg-2)',
                text: 'var(--color-text)',
                board: 'var(--color-board)',
                'border-cell': 'var(--color-cell-border)',
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
                    bg2: 'var(--color-btn-bg2)',
                    text: 'var(--color-btn-text)',
                    hover: 'var(--color-btn-hover)',
                    active: 'var(--color-btn-active)',
                    shadow: 'var(--color-btn-shadow)',
                    disabled: 'var(--color-btn-disabled)',
                },
            },
            keyframes: {
                rainbow: {
                    '0%': { color: '#f87171' },    // đỏ
                    '20%': { color: '#fbbf24' },   // vàng
                    '40%': { color: '#34d399' },   // xanh lá
                    '60%': { color: '#60a5fa' },   // xanh dương
                    '80%': { color: '#a78bfa' },   // tím
                    '100%': { color: '#f87171' },  // đỏ trở lại
                },
            },
            animation: {
                rainbow: 'rainbow 1s infinite',
            },

        },
    },
    plugins: [],
}
