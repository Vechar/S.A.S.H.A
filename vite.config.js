import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const moonProxy = {
  '/api/moon': {
    target: 'https://svs.gsfc.nasa.gov',
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/api\/moon/, '/api/dialamoon'),
  },
};

export default defineConfig({
  plugins: [react()],
  server: { proxy: moonProxy },
  preview: { proxy: moonProxy },
});
