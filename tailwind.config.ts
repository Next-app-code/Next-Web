import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        tighter: '-0.03em',
        tight: '-0.02em',
      },
      colors: {
        node: {
          bg: '#1a1a2e',
          surface: '#232340',
          border: '#3d3d5c',
          accent: '#00d4aa',
          input: '#ff6b6b',
          output: '#4ecdc4',
          math: '#ffe66d',
          rpc: '#a855f7',
          wallet: '#f97316',
          transaction: '#3b82f6',
          utility: '#6b7280',
        },
        canvas: {
          bg: '#0f0f1a',
          grid: '#1a1a2e',
          line: '#2d2d4a',
        },
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'flow': 'flow 2s ease-in-out infinite',
      },
      keyframes: {
        flow: {
          '0%, 100%': { strokeDashoffset: '0' },
          '50%': { strokeDashoffset: '10' },
        },
      },
    },
  },
  plugins: [],
};

export default config;

