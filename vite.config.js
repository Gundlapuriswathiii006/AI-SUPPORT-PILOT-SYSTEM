import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],

    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },

    server: {
      host: '0.0.0.0',
      port: 5000,
      strictPort: true,
      allowedHosts: 'all',

      proxy: {
        '/api': {
          target: env.BACKEND_URL || 'http://localhost:5050',
          changeOrigin: true,
        },
      },
    },
  };
});