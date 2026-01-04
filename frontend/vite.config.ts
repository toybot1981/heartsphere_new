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
        // 修复初始化顺序问题：使用更保守的代码分割
        // 减少 chunk 数量，避免循环依赖和初始化顺序问题
        minify: 'esbuild',
        // 确保模块正确解析和初始化
        target: 'esnext',
        modulePreload: {
          polyfill: true,
        },
        // 禁用某些可能导致问题的优化
        cssCodeSplit: true,
        // 确保 sourcemap 可用于调试（生产环境可以关闭）
        sourcemap: false,
        rollupOptions: {
          // 允许更好的代码分割和模块解析
          preserveEntrySignatures: 'allow-extension',
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
            // 确保模块正确解析，避免循环依赖问题
            format: 'es',
            // 使用更安全的模块导出方式，避免 TDZ (Temporal Dead Zone) 问题
            generatedCode: {
              constBindings: true,
              objectShorthand: false, // 避免对象简写可能导致的问题
            },
            // 确保模块正确排序，避免初始化顺序问题
            experimentalMinChunkSize: 20000, // 最小 chunk 大小，避免过度分割
            manualChunks: (id) => {
              // 关键修复：优先处理 React 相关包，确保它们始终在同一个 chunk
              // 必须在所有其他逻辑之前检查，避免被其他规则捕获
              
              // 1. 所有 React 核心包 - 最高优先级（使用更宽泛的匹配）
              // 匹配所有包含 'react' 的 node_modules 路径
              if (id.includes('node_modules') && (
                  id.includes('/react') || 
                  id.includes('/react-dom') ||
                  id.includes('/react-is') ||
                  id.includes('/scheduler') ||
                  id.includes('/react-refresh')
              )) {
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
              // 注意：应用代码不包含 React，因为它们会从 vendor-react 导入
              if (id.includes('/admin/AdminScreen')) {
                return 'admin';
              }
              
              // 修复 mobile-core 初始化顺序问题：
              // 将 MobileApp 及其所有核心依赖打包在一起，避免循环依赖和初始化顺序问题
              // 策略：将所有 mobile 核心代码、共享模块和其直接依赖打包到一个 chunk
              if (id.includes('/mobile.tsx') ||
                  id.includes('/mobile/MobileApp') ||
                  id.includes('/mobile/components/MobileBottomNav') ||
                  id.includes('/mobile/components/MobileErrorBoundary') ||
                  id.includes('/mobile/components/modals/MobileQuickConnectModal') ||
                  id.includes('/mobile/utils/renderScreen') ||
                  id.includes('/mobile/utils/buildScreenProps') ||
                  id.includes('/mobile/MobileScenarioBuilder') ||
                  id.includes('/contexts/GameStateContext') ||
                  id.includes('/contexts/types/gameState.types') ||
                  id.includes('/contexts/constants/defaultState') ||
                  id.includes('/hooks/useGameState') ||
                  id.includes('/hooks/useJournalHandlers') ||
                  id.includes('/hooks/useSharedMode') ||
                  id.includes('/reducers/gameStateReducer') ||
                  id.includes('/utils/sceneMapping') ||
                  id.includes('/utils/dialog') ||
                  id.includes('/utils/dataTransformers') ||
                  id.includes('/services/storage') ||
                  id.includes('/services/sync/SyncService') ||
                  id.includes('/services/sync/syncConfig') ||
                  (id.includes('/services/api') && !id.includes('/services/api/admin')) ||
                  id.includes('/services/ai/AIService') ||
                  id.includes('/services/api/base/sharedModeState') ||
                  id.includes('/services/api/heartconnect') ||
                  id.includes('/components/LoginModal') ||
                  id.includes('/components/SettingsModal') ||
                  id.includes('/components/MailboxModal') ||
                  id.includes('/components/EraConstructorModal') ||
                  id.includes('/components/CharacterConstructorModal') ||
                  // 将共享的 types 文件也包含进来（如果被 mobile 使用）
                  (id.includes('/types') && !id.includes('/types/admin'))) {
                // 注意：services/api 包含多个子模块，但排除 admin API
                // 共享的 components、types、reducers 也被包含，确保初始化顺序正确
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
              
              // 将AI服务相关单独打包（但如果被 mobile-core 使用，已经在上面处理了）
              // 注意：由于 mobile-core 已经包含了 /services/ai/AIService，这里只处理其他 AI 服务
              if ((id.includes('/services/ai') || id.includes('/services/gemini')) && 
                  !id.includes('/services/ai/AIService')) {
                return 'vendor-ai';
              }
              
              // 将其他node_modules打包（排除已处理的 React 相关包）
              // 注意：上面的 React 检查已经处理了所有 react 相关包，这里不会再匹配到
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
