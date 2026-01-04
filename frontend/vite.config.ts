import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0', // 允许所有网络接口访问
        // 开发环境代理配置：将 /api 请求转发到后端服务器
        // 如果 VITE_API_BASE_URL 未设置或为空，使用默认后端地址
        // 如果设置了 VITE_API_BASE_URL（如 http://localhost:8081），使用该地址
        proxy: {
          '/api': {
            // 确保代理目标不为空：如果 VITE_API_BASE_URL 未设置或为空字符串，使用默认后端地址
            target: (env.VITE_API_BASE_URL && env.VITE_API_BASE_URL.trim() !== '') 
              ? env.VITE_API_BASE_URL 
              : 'http://localhost:8081',
            changeOrigin: true,
            secure: false,
            // 不重写路径，保持 /api 前缀，直接转发到后端
          },
        },
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
          // 确保 @antv/x6-react-components 也使用同一个 React 实例
          '@antv/x6-react-components',
        ],
        // 强制重新构建这些依赖，确保使用正确的 React 版本
        force: true,
        // 确保 React 相关依赖使用正确的版本
        esbuildOptions: {
          jsx: 'automatic',
          // 确保所有 React 相关包使用同一个版本
          jsxFactory: 'React.createElement',
          jsxFragment: 'React.Fragment',
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
          // 确保 @antv/x6-react 相关包也使用同一个 React
          '@antv/x6-react-shape',
          '@antv/x6-react-components',
        ],
      },
      build: {
        // 确保构建时正确处理外部依赖
        commonjsOptions: {
          include: [/node_modules/],
          transformMixedEsModules: true,
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
              // vendor-react 应该优先加载
              if (chunkInfo.name === 'vendor-react') {
                return 'assets/vendor-react-[hash].js';
              }
              return 'assets/[name]-[hash].js';
            },
            manualChunks: (id) => {
              // 关键修复：优先处理 React 相关包，确保它们始终在同一个 chunk
              // 必须在所有其他逻辑之前检查，避免被其他规则捕获
              
              // 1. 所有 React 核心包 - 最高优先级（使用更宽泛的匹配）
              if (id.includes('node_modules/react') || 
                  id.includes('node_modules/react-dom') ||
                  id.includes('node_modules/react-is') ||
                  id.includes('node_modules/scheduler')) {
                return 'vendor-react';
              }
              
              // 2. @antv/x6-react 相关包 - 必须与 React 在同一 chunk
              if (id.includes('node_modules/@antv/x6-react')) {
                return 'vendor-react';
              }
              
              // 3. 其他可能依赖 React 的库（如果它们可能导致问题）
              // reactflow 等库应该可以正常使用 vendor-react 中的 React
              
              // Phase 5优化: 更细粒度的代码分割
              // 将大组件单独打包（但不包含 React，React 已在上面处理）
              if (id.includes('/admin/AdminScreen')) {
                return 'admin';
              }
              if (id.includes('/mobile/MobileApp')) {
                return 'mobile-core';
              }
              // 将Screen组件按功能分组打包
              if (id.includes('/mobile/screens/MobileChatWindowScreen') || 
                  id.includes('/mobile/screens/MobileSharedChatWindowScreen')) {
                return 'mobile-chat';
              }
              if (id.includes('/mobile/screens/MobileConnectionSpaceScreen')) {
                return 'mobile-connection';
              }
              if (id.includes('/mobile/screens/MobileScenarioBuilderScreen')) {
                return 'mobile-builder';
              }
              if (id.includes('/mobile/screens/')) {
                return 'mobile-screens';
              }
              // 将AI服务相关单独打包
              if (id.includes('/services/ai') || id.includes('/services/gemini')) {
                return 'vendor-ai';
              }
              // 将其他node_modules打包（排除已处理的 React 相关包）
              if (id.includes('node_modules')) {
                return 'vendor';
              }
            },
          },
        },
        // 增加chunk大小警告限制（因为AdminScreen确实很大）
        chunkSizeWarningLimit: 600,
        // 确保模块正确解析
        modulePreload: {
          polyfill: true,
        },
      },
    };
});
