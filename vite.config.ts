import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'pwa-icon.png'],
        manifest: {
          name: '신청도우미',
          short_name: '신청도우미',
          description: '스마트상점 신청 지원 시스템',
          theme_color: '#ffffff',
          icons: [
            {
              src: 'pwa-icon.png',
              sizes: '1024x1024',
              type: 'image/png'
            }
          ],
          background_color: '#ffffff',
          display: 'standalone'
        }
      })
    ],
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    }
  };
});
