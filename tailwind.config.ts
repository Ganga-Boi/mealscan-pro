import type { Config } from 'tailwindcss';
const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './hooks/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary:   '#2DB8A4',
        accent:    '#7C4DFF',
        appbg:     '#F4EFFF',
        surface:   '#FFFFFF',
        muted:     '#EEE8F8',
        border:    '#E4DEEE',
        txtpri:    '#1A1829',
        txtsec:    '#9494AA',
        txtmuted:  '#C4BEDB',
        breakfast: '#FFA726',
        lunch:     '#64B5F6',
        dinner:    '#B39DDB',
        snack:     '#66BB6A',
        danger:    '#FF4757',
      },
      borderRadius: { xl2: '1rem', xl3: '1.25rem' },
    },
  },
  plugins: [],
};
export default config;
