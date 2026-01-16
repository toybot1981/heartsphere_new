import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0', // 允许所有网络接口访问
        proxy: {
          // 开发环境 API 代理配置
          // 当 VITE_API_BASE_URL 为空或未设置时，通过此代理转发到后端
          '/api': {
            target: 'http://localhost:8081',
            changeOrigin: true,
            // 如果后端路径不包含 /api 前缀，需要取消注释下面这行
            // rewrite: (path) => path.replace(/^\/api/, '')
          },
          // 开发环境图片代理配置
          '/images': {
            target: 'http://localhost:8080',
            changeOrigin: true,
          }
        }
      },
      plugins: [
        react({
          // 确保 React 17+ 的 JSX 转换
          jsxRuntime: 'automatic',
        }),
      ],
      optimizeDeps: {
        // 预构建依赖，确保 React 相关依赖正确解析
        include: [
          'react',
          'react-dom',
          'react/jsx-runtime',
          '@antv/x6',
          'antd',
          'reactflow',
          '@mui/material',
          '@emotion/react',
          '@emotion/styled',
          '@emotion/cache',
          '@emotion/utils',
          'framer-motion', // 添加 framer-motion 到预构建列表
          'react-fast-compare', // 修复 ESM/CommonJS 兼容性问题
        ],
        // 强制重新构建这些依赖，确保使用正确的 React 版本
        force: true,
        esbuildOptions: {
          jsx: 'automatic',
          // 处理 CommonJS 模块的默认导出问题
          mainFields: ['module', 'main'],
        },
      },
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
          // 确保所有依赖使用同一个 React 实例，避免多个 React 实例导致的错误
          'react': path.resolve(__dirname, 'node_modules/react'),
          'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
        },
        // 强制去重，确保只有一个 React 实例
        dedupe: [
          'react',
          'react-dom',
          'react/jsx-runtime',
          'antd',
          'reactflow',
          '@mui/material',
          '@emotion/react',
          '@emotion/styled',
          '@emotion/cache',
          '@emotion/utils',
          'react-fast-compare',
        ],
      },
      build: {
        // 确保模块正确解析和初始化
        target: 'esnext',
        modulePreload: {
          polyfill: true,
        },
        rollupOptions: {
          input: {
            main: path.resolve(__dirname, 'index.html'),
            admin: path.resolve(__dirname, 'admin.html'),
            mobile: path.resolve(__dirname, 'mobile.html'),
          },
          output: {
            manualChunks: (id) => {
              // 排除入口文件，避免立即执行问题
              if (id.endsWith('mobile.tsx') || id.endsWith('main.tsx') || id.endsWith('admin.tsx')) {
                return;
              }

              // 大组件单独打包
              if (id.includes('/admin/AdminScreen')) {
                return 'admin';
              }
              if (id.includes('/mobile/MobileApp')) {
                return 'mobile-core';
              }
            },
          },
        },
        // 增加chunk大小警告限制（因为AdminScreen确实很大）
        chunkSizeWarningLimit: 600,
      },
    };
});