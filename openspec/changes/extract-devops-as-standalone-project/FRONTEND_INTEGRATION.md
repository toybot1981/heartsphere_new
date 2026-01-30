# DevOps 前端集成到 Admin 管理后台方案

## 集成架构

```
┌─────────────────────────────────────────────────┐
│           Admin 管理后台 (Port 3005)              │
│  ┌──────────────┐  ┌──────────────────────────┐  │
│  │  左侧边栏    │  │     主内容区域            │  │
│  │              │  │  ┌────────────────────┐  │  │
│  │ - Dashboard  │  │  │  DevOps iframe     │  │  │
│  │ - 内容管理   │  │  │  (Port 3006)       │  │  │
│  │ - DevOps ⭐ │  │  │                    │  │  │
│  │   - 概览     │  │  │  [DevOps 前端内容] │  │  │
│  │   - 代码扫描 │  │  │                    │  │  │
│  │   - 测试     │  │  └────────────────────┘  │  │
│  │   - ...      │  │                            │  │
│  └──────────────┘  └──────────────────────────┘  │
└─────────────────────────────────────────────────┘
         │                    │
         │                    │
         │                    │ JWT Token (URL参数/postMessage)
         │                    │
         ▼                    ▼
┌─────────────────────────────────────────────────┐
│      DevOps 前端 (Port 3006)                    │
│  ┌──────────────────────────────────────────┐  │
│  │  DevOps 工作台界面                       │  │
│  │  - 脚本执行                              │  │
│  │  - 代码扫描                              │  │
│  │  - 部署流程                              │  │
│  │  - CMDB                                  │  │
│  └──────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
         │
         │ API 调用 (/api/devops/*)
         │
         ▼
┌─────────────────────────────────────────────────┐
│      DevOps 后端 (Port 8086)                    │
│  ┌──────────────────────────────────────────┐  │
│  │  DevOps API 服务                         │  │
│  │  - 脚本执行 API                           │  │
│  │  - 部署流程 API                           │  │
│  │  - CMDB API                               │  │
│  └──────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

## 实现方案

### 1. DevOps 前端作为独立应用

**特点**：
- 独立部署（独立端口，如 3006）
- 独立路由和状态管理
- 可以独立访问（不依赖 Admin）
- 通过 iframe 嵌入到 Admin

**配置**：
```typescript
// devops/frontend/vite.config.ts
export default defineConfig({
  server: {
    port: 3006,
    host: '0.0.0.0'
  },
  // 允许 iframe 嵌入
  build: {
    // ...
  }
})
```

### 2. Admin 前端集成 DevOps

**实现方式**：通过 iframe 嵌入

**Admin 前端组件**：
```typescript
// admin/frontend/src/components/DevOpsIframe.tsx
import React, { useEffect, useRef } from 'react';
import { useAdminAuth } from '../contexts/AdminAuthContext';

export const DevOpsIframe: React.FC = () => {
  const { adminToken } = useAdminAuth();
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    // 方式 1: 通过 URL 参数传递 Token
    const devopsUrl = `http://localhost:3006?token=${adminToken}`;
    
    // 方式 2: 通过 postMessage 传递 Token（更安全）
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        { type: 'SET_TOKEN', token: adminToken },
        'http://localhost:3006'
      );
    }
  }, [adminToken]);

  return (
    <iframe
      ref={iframeRef}
      src={`http://localhost:3006?token=${adminToken}`}
      className="w-full h-full border-0"
      title="DevOps 工作台"
    />
  );
};
```

**Admin 主内容区域更新**：
```typescript
// admin/frontend/src/AdminScreen.tsx
import { DevOpsIframe } from './components/DevOpsIframe';

// 在渲染主内容区域时
{activeSection.startsWith('devops-') && (
  <DevOpsIframe />
)}
```

### 3. DevOps 前端接收 Token

**方式 1：URL 参数（简单但不安全）**
```typescript
// devops/frontend/src/App.tsx
const App: React.FC = () => {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // 从 URL 参数读取 Token
    const urlParams = new URLSearchParams(window.location.search);
    const tokenFromUrl = urlParams.get('token');
    
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
      localStorage.setItem('devops_token', tokenFromUrl);
    } else {
      // 尝试从 localStorage 读取
      const storedToken = localStorage.getItem('devops_token');
      if (storedToken) {
        setToken(storedToken);
      }
    }
  }, []);

  // ...
};
```

**方式 2：postMessage（推荐，更安全）**
```typescript
// devops/frontend/src/App.tsx
const App: React.FC = () => {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // 监听 postMessage
    const handleMessage = (event: MessageEvent) => {
      // 验证消息来源
      if (event.origin !== 'http://localhost:3005') {
        return;
      }

      if (event.data.type === 'SET_TOKEN') {
        setToken(event.data.token);
        localStorage.setItem('devops_token', event.data.token);
      }
    };

    window.addEventListener('message', handleMessage);

    // 尝试从 localStorage 读取
    const storedToken = localStorage.getItem('devops_token');
    if (storedToken) {
      setToken(storedToken);
    }

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  // ...
};
```

### 4. DevOps 前端 API 调用

```typescript
// devops/frontend/src/services/api/devops.ts
const API_BASE_URL = import.meta.env.VITE_DEVOPS_API_BASE_URL || 'http://localhost:8086/api/devops';

export const devopsApi = {
  // 脚本执行
  executeScript: async (scriptId: string, params: any) => {
    const token = localStorage.getItem('devops_token');
    return fetch(`${API_BASE_URL}/scripts/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ scriptId, params })
    });
  },
  // ...
};
```

## 菜单配置

**Admin 左侧边栏菜单**（已存在，无需修改）：
```typescript
// admin/frontend/src/components/AdminSidebar.tsx
{
  id: 'devops',
  label: 'DevOps 工作台',
  icon: '🔧',
  items: [
    { section: 'devops-overview', label: '概览', icon: '📊' },
    { section: 'devops-scan', label: '代码扫描', icon: '🔍' },
    { section: 'devops-test', label: '测试', icon: '🧪' },
    { section: 'devops-build', label: '构建部署', icon: '🚀' },
    { section: 'devops-database', label: '数据库', icon: '💾' },
    { section: 'devops-server', label: '服务器', icon: '🖥️' },
    { section: 'devops-scheduled', label: '定时任务', icon: '⏰' },
    { section: 'devops-pipeline', label: '部署流程', icon: '🔄' },
    { section: 'devops-cmdb', label: 'CMDB', icon: '🗄️' },
    { section: 'devops-autofix', label: '自动修复', icon: '🔧' }
  ]
}
```

**DevOps 前端路由**：
```typescript
// devops/frontend/src/App.tsx
<Routes>
  <Route path="/" element={<DevOpsOverview />} />
  <Route path="/scan" element={<CodeScanner />} />
  <Route path="/test" element={<TestRunner />} />
  <Route path="/build" element={<BuildDeploy />} />
  <Route path="/database" element={<DatabaseManager />} />
  <Route path="/server" element={<ServerManager />} />
  <Route path="/scheduled" element={<ScheduledTasks />} />
  <Route path="/pipeline" element={<PipelineManager />} />
  <Route path="/cmdb" element={<CMDBManager />} />
  <Route path="/autofix" element={<AutoFixManager />} />
</Routes>
```

**Admin 前端路由映射**：
```typescript
// admin/frontend/src/AdminScreen.tsx
const getDevOpsRoute = (section: string) => {
  const routeMap: Record<string, string> = {
    'devops-overview': '/',
    'devops-scan': '/scan',
    'devops-test': '/test',
    'devops-build': '/build',
    'devops-database': '/database',
    'devops-server': '/server',
    'devops-scheduled': '/scheduled',
    'devops-pipeline': '/pipeline',
    'devops-cmdb': '/cmdb',
    'devops-autofix': '/autofix'
  };
  return routeMap[section] || '/';
};

// 在 DevOpsIframe 组件中
<iframe
  src={`http://localhost:3006${getDevOpsRoute(activeSection)}?token=${adminToken}`}
  // ...
/>
```

## 安全考虑

### 1. Token 传递安全

**推荐方式**：使用 postMessage（更安全）
- Token 不暴露在 URL 中
- 可以验证消息来源
- 支持更复杂的通信

**备选方式**：URL 参数（简单但不安全）
- Token 暴露在 URL 中
- 可能被浏览器历史记录保存
- 不推荐用于生产环境

### 2. 跨域安全

**配置 CORS**：
```typescript
// devops/backend/src/main/java/.../WebSecurityConfig.java
@Bean
public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration configuration = new CorsConfiguration();
    configuration.setAllowedOrigins(Arrays.asList(
        "http://localhost:3005",  // Admin 前端
        "http://localhost:3006"   // DevOps 前端
    ));
    configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE"));
    configuration.setAllowedHeaders(Arrays.asList("*"));
    configuration.setAllowCredentials(true);
    // ...
}
```

### 3. Token 验证

**DevOps 后端验证 Token**：
```java
// devops/backend/src/main/java/.../JwtAuthenticationFilter.java
// 验证 JWT Token（使用共享的 JWT Secret）
if (jwtUtils.validateJwtToken(token)) {
    String username = jwtUtils.getUserNameFromJwtToken(token);
    // 查询共享的 system_admin 表验证管理员身份
    // ...
}
```

## 部署配置

### 1. 开发环境

```bash
# 启动 DevOps 后端
cd devops/backend
mvn spring-boot:run  # Port 8086

# 启动 DevOps 前端
cd devops/frontend
npm run dev  # Port 3006

# 启动 Admin 前端
cd admin/frontend
npm run dev  # Port 3005
```

### 2. 生产环境

**Nginx 配置**：
```nginx
# Admin 前端
server {
    listen 80;
    server_name admin.example.com;
    
    location / {
        proxy_pass http://localhost:3005;
    }
}

# DevOps 前端
server {
    listen 80;
    server_name devops.example.com;
    
    location / {
        proxy_pass http://localhost:3006;
    }
}

# DevOps 后端 API
server {
    listen 80;
    server_name devops-api.example.com;
    
    location /api/devops {
        proxy_pass http://localhost:8086/api/devops;
    }
}
```

## 优势

1. ✅ **完全独立**：DevOps 前端可以独立部署和访问
2. ✅ **低耦合**：Admin 和 DevOps 前端完全解耦
3. ✅ **易于维护**：两个前端项目独立维护
4. ✅ **灵活性**：可以独立更新 DevOps 前端，不影响 Admin
5. ✅ **用户体验**：在统一的管理后台中访问 DevOps 功能

## 注意事项

1. **Token 同步**：确保 Admin 和 DevOps 使用相同的 JWT Secret
2. **跨域配置**：正确配置 CORS，允许 iframe 嵌入
3. **Token 传递**：优先使用 postMessage，避免 URL 参数暴露 Token
4. **路由同步**：确保 Admin 菜单点击时，DevOps iframe 显示正确的路由
