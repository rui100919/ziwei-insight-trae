import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx,mdx}',
    './components/**/*.{ts,tsx,mdx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        paper: '#0B0C10',
        'paper-deep': '#101218',
        ink: '#F4EEE1',
        'ink-soft': 'rgba(244,238,225,.7)',
        'ink-muted': 'rgba(244,238,225,.5)',
        gold: '#B8945C',
        'gold-soft': '#E6CB92',
        'gold-pale': '#8A6A3D',
        plum: '#9E3B2B',
        line: 'rgba(244,238,225,.13)',
        'line-strong': 'rgba(244,238,225,.25)',
      },
      fontFamily: {
        serif: [
          '"Songti SC"',
          '"STSong"',
          '"Noto Serif SC"',
          '"Source Han Serif SC"',
          'Georgia',
          'serif',
        ],
        sans: [
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          '"PingFang SC"',
          '"Hiragino Sans GB"',
          '"Microsoft YaHei"',
          'sans-serif',
        ],
      },
    },
  },
  plugins: [],
};

export default config;
