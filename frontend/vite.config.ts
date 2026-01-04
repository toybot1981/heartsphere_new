import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0', // 允许所有网络接口访问
      },
      plugins: [react()],
      define: {
        // 兼容旧的环境变量名和新的 VITE_ 前缀
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY || env.VITE_GEMINI_API_KEY || ''),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY || env.VITE_GEMINI_API_KEY || ''),
        // 新的环境变量（VITE_ 前缀）
        'process.env.VITE_GEMINI_API_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY || ''),
        'process.env.VITE_OPENAI_API_KEY': JSON.stringify(env.VITE_OPENAI_API_KEY || ''),
        'process.env.VITE_OPENAI_BASE_URL': JSON.stringify(env.VITE_OPENAI_BASE_URL || 'https://api.openai.com/v1'),
        'process.env.VITE_QWEN_API_KEY': JSON.stringify(env.VITE_QWEN_API_KEY || ''),
        'process.env.VITE_QWEN_BASE_URL': JSON.stringify(env.VITE_QWEN_BASE_URL || 'https://dashscope.aliyuncs.com/compatible-mode/v1'),
        'process.env.VITE_DOUBAO_API_KEY': JSON.stringify(env.VITE_DOUBAO_API_KEY || ''),
        'process.env.VITE_DOUBAO_BASE_URL': JSON.stringify(env.VITE_DOUBAO_BASE_URL || 'https://ark.cn-beijing.volces.com/api/v3'),
        // 模型名称配置
        'process.env.VITE_GEMINI_MODEL_NAME': JSON.stringify(env.VITE_GEMINI_MODEL_NAME || 'gemini-2.5-flash'),
        'process.env.VITE_GEMINI_IMAGE_MODEL': JSON.stringify(env.VITE_GEMINI_IMAGE_MODEL || 'gemini-2.5-flash-image'),
        'process.env.VITE_GEMINI_VIDEO_MODEL': JSON.stringify(env.VITE_GEMINI_VIDEO_MODEL || 'veo-3.1-fast-generate-preview'),
        'process.env.VITE_OPENAI_MODEL_NAME': JSON.stringify(env.VITE_OPENAI_MODEL_NAME || 'gpt-4o'),
        'process.env.VITE_OPENAI_IMAGE_MODEL': JSON.stringify(env.VITE_OPENAI_IMAGE_MODEL || 'dall-e-3'),
        'process.env.VITE_QWEN_MODEL_NAME': JSON.stringify(env.VITE_QWEN_MODEL_NAME || 'qwen-max'),
        'process.env.VITE_QWEN_IMAGE_MODEL': JSON.stringify(env.VITE_QWEN_IMAGE_MODEL || 'qwen-image-plus'),
        'process.env.VITE_QWEN_VIDEO_MODEL': JSON.stringify(env.VITE_QWEN_VIDEO_MODEL || 'wanx-video'),
        'process.env.VITE_DOUBAO_MODEL_NAME': JSON.stringify(env.VITE_DOUBAO_MODEL_NAME || 'ep-2024...'),
        'process.env.VITE_DOUBAO_IMAGE_MODEL': JSON.stringify(env.VITE_DOUBAO_IMAGE_MODEL || 'doubao-image-v1'),
        'process.env.VITE_DOUBAO_VIDEO_MODEL': JSON.stringify(env.VITE_DOUBAO_VIDEO_MODEL || 'doubao-video-v1'),
        // 路由策略配置
        'process.env.VITE_TEXT_PROVIDER': JSON.stringify(env.VITE_TEXT_PROVIDER || 'gemini'),
        'process.env.VITE_IMAGE_PROVIDER': JSON.stringify(env.VITE_IMAGE_PROVIDER || 'gemini'),
        'process.env.VITE_VIDEO_PROVIDER': JSON.stringify(env.VITE_VIDEO_PROVIDER || 'gemini'),
        'process.env.VITE_AUDIO_PROVIDER': JSON.stringify(env.VITE_AUDIO_PROVIDER || 'gemini'),
        'process.env.VITE_ENABLE_FALLBACK': JSON.stringify(env.VITE_ENABLE_FALLBACK || 'true'),
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      build: {
        rollupOptions: {
          input: {
            main: path.resolve(__dirname, 'index.html'),
            admin: path.resolve(__dirname, 'admin.html'),
            mobile: path.resolve(__dirname, 'mobile.html'),
          },
          output: {
            // 使用函数形式的 manualChunks，避免空 chunk 问题
            manualChunks: (id) => {
              // React 相关库
              if (id.includes('node_modules') && (
                  id.includes('/react') || 
                  id.includes('/react-dom') ||
                  id.includes('/react-is') ||
                  id.includes('/scheduler')
              )) {
                return 'vendor-react';
              }
              
              // 大组件单独打包
              if (id.includes('/admin/AdminScreen')) {
                return 'admin';
              }
              if (id.includes('/mobile/MobileApp') || id.includes('/mobile.tsx')) {
                return 'mobile-core';
              }
              
              // AI 服务相关
              if (id.includes('/services/ai') || id.includes('/services/gemini')) {
                return 'vendor-ai';
              }
              
              // 其他 node_modules
              if (id.includes('node_modules')) {
                return 'vendor';
              }
            },
          },
        },
        // 增加chunk大小警告限制（因为AdminScreen确实很大）
        chunkSizeWarningLimit: 600,
      },
    };
});