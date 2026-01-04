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
          '@antv/x6-react-shape',
          '@antv/x6-react-components',
          'antd',
          'reactflow',
          '@mui/material',
          '@emotion/react',
          '@emotion/styled',
        ],
        // 强制重新构建这些依赖，确保使用正确的 React 版本
        force: true,
        esbuildOptions: {
          jsx: 'automatic',
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
          '@antv/x6-react-shape',
          '@antv/x6-react-components',
          'antd',
          'reactflow',
          '@mui/material',
          '@emotion/react',
          '@emotion/styled',
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
            // 确保 chunk 加载顺序正确
            chunkFileNames: (chunkInfo) => {
              // vendor-react 应该优先加载（使用 00- 前缀确保排序）
              if (chunkInfo.name === 'vendor-react') {
                return 'assets/00-vendor-react-[hash].js';
              }
              return 'assets/[name]-[hash].js';
            },
            // 确保模块正确排序，避免初始化顺序问题
            experimentalMinChunkSize: 20000,
            // 使用函数形式的 manualChunks，避免空 chunk 问题
            manualChunks: (id) => {
              // React 相关库 - 最高优先级，必须在所有其他检查之前
              // 使用更宽泛的匹配，确保所有 React 相关包都被捕获
              if (id.includes('node_modules')) {
                // React 核心包
                if (id.includes('/react') || 
                    id.includes('/react-dom') ||
                    id.includes('/react-is') ||
                    id.includes('/scheduler') ||
                    id.includes('/react-refresh') ||
                    id.includes('/react/jsx-runtime')) {
                  return 'vendor-react';
                }
                
                // @antv/x6-react 相关包 - 必须与 React 在同一 chunk
                if (id.includes('/@antv/x6-react')) {
                  return 'vendor-react';
                }
                
                // antd 及其所有依赖 - 必须与 React 在同一 chunk（antd 依赖 React）
                if (id.includes('/antd/') || id.includes('/rc-')) {
                  return 'vendor-react';
                }
                
                // reactflow - 必须与 React 在同一 chunk
                if (id.includes('/reactflow') || id.includes('/@xyflow')) {
                  return 'vendor-react';
                }
                
                // @mui (Material-UI) 及其所有依赖 - 必须与 React 在同一 chunk
                if (id.includes('/@mui/') || id.includes('/@emotion/')) {
                  return 'vendor-react';
                }
                
                // 其他可能依赖 React 的库
                if (id.includes('/material-ui') || id.includes('/styled-components')) {
                  return 'vendor-react';
                }
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