/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_EDU_API_BASE_URL?: string;
  readonly VITE_API_BASE_URL?: string; // 主后端 API 地址（用于认证）
  // 更多环境变量...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
