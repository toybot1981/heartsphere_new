import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3005,
    host: '0.0.0.0',
    proxy: {
      // 代理 demo API 到 mentis 后端
      '/api/demo': {
        target: 'http://localhost:8082',
        changeOrigin: true,
        secure: false,
        ws: true, // 支持 WebSocket（SSE 需要）
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', err);
          });
        },
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});
