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
          bg: '#1a1a1a',
          surface: '#2a2a2a',
          border: '#404040',
          accent: '#ffffff',
          input: '#d4d4d4',
          output: '#e5e5e5',
          math: '#c2c2c2',
          rpc: '#b3b3b3',
          wallet: '#999999',
          transaction: '#888888',
          utility: '#777777',
        },
        canvas: {
          bg: '#0a0a0a',
          grid: '#1a1a1a',
          line: '#2a2a2a',
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

