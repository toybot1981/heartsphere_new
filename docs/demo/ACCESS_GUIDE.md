# AgentScope Computer-Use 演示访问指南

## 访问地址

### 管理端演示监控界面

**访问路径**: 
1. 打开管理后台：访问 `/admin.html` 或管理后台入口页面
2. 使用管理员账户登录
3. 在左侧导航菜单中找到 **"AI 智能体"** 分组
4. 点击 **"AgentScope 演示管理"** 菜单项

**完整导航路径**:
```
管理后台 → AI 智能体 → AgentScope 演示管理
```

**功能说明**:
- 工具调用监控：查看所有会话的工具调用记录
- 虚拟机管理：管理所有活动的虚拟机
- 会话管理：管理所有活跃会话
- 性能监控：查看系统性能指标

### 客户端演示界面

**当前状态**: 
客户端演示界面（`AgentScopeDemo.tsx`）已经创建，但尚未集成到主应用路由中。

**推荐访问方式**:

#### 选项 1: 集成到管理后台（推荐）

可以将客户端演示作为管理后台的一个新菜单项，与管理端监控分离：

1. 在 `AdminSidebar.tsx` 中添加新的菜单项：
   ```typescript
   { section: 'agentscope-demo-client' as SectionType, label: 'AgentScope 演示（客户端）', icon: '🎮' }
   ```

2. 在 `AdminScreen.tsx` 中添加路由：
   ```typescript
   {activeSection === 'agentscope-demo-client' && (
       <AgentScopeDemo adminToken={adminToken} />
   )}
   ```

**访问路径**:
```
管理后台 → AI 智能体 → AgentScope 演示（客户端）
```

#### 选项 2: 创建独立页面（可选）

如果需要独立的访问路径，可以：

1. 在 `frontend/App.tsx` 或路由配置中添加新路由
2. 创建独立的入口页面

**示例路由**:
```typescript
<Route path="/demo/agentscope" element={<AgentScopeDemoPage />} />
```

## API 端点

### 演示相关 API

所有 API 端点都需要管理员认证（Bearer Token）。

#### 工具调用日志
- `GET /api/demo/tool-calls` - 获取工具调用日志列表
  - 查询参数：
    - `sessionId` (可选): 筛选特定会话
    - `toolName` (可选): 筛选特定工具
    - `startTime` (可选): 开始时间
    - `endTime` (可选): 结束时间

- `GET /api/demo/tool-calls/{sessionId}` - 获取特定会话的工具调用日志

#### 虚拟机状态
- `GET /api/demo/vm-status/{sessionId}` - 获取特定会话的虚拟机状态

#### 统计信息
- `GET /api/demo/tool-call-statistics/{sessionId}` - 获取工具调用统计信息

#### 演示场景
- `GET /api/demo/scenarios` - 获取演示场景列表

#### SSE 事件流
- `GET /api/demo/events/session/{sessionId}` - 订阅会话级事件（SSE）
- `GET /api/demo/events/global` - 订阅全局事件（SSE，仅管理员）

## 本地开发环境

### 启动步骤

1. **启动后端服务**
   ```bash
   cd backend
   mvn spring-boot:run
   ```
   默认端口：`8081`

2. **启动前端服务**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   默认端口：`5173` (Vite)

3. **访问管理后台**
   - 浏览器访问：`http://localhost:5173/admin.html`
   - 或：`http://localhost:8081/admin.html`（如果前端通过后端代理）

### 开发环境配置

确保以下服务正常运行：
- ✅ MySQL 数据库
- ✅ Spring Boot 后端服务（端口 8081）
- ✅ 前端开发服务器（端口 5173）

## 生产环境

### 部署说明

1. **后端部署**
   - 部署 Spring Boot JAR 包
   - 配置数据库连接
   - 配置 SSE 支持（某些反向代理可能需要特殊配置）

2. **前端部署**
   - 构建前端静态文件：`npm run build`
   - 部署到静态文件服务器或通过后端提供

### 访问地址示例

**生产环境访问地址**:
```
https://yourdomain.com/admin.html
```

然后按照上述导航路径访问演示界面。

## 权限要求

### 管理端演示监控界面
- ✅ 需要管理员权限
- ✅ 需要有效的管理员 Token

### 客户端演示界面
- ✅ 建议也需要管理员权限（因为需要创建会话）
- ⚠️ 如果开放给普通用户，需要确保会话隔离和权限控制

## 故障排除

### 无法访问管理后台

1. 检查后端服务是否正常运行
2. 检查前端服务是否正常运行
3. 检查浏览器控制台是否有错误

### 看不到演示菜单

1. 检查是否以管理员身份登录
2. 检查 `AdminSidebar.tsx` 中是否已添加菜单项
3. 检查 `AdminScreen.tsx` 中是否已添加路由处理

### SSE 连接失败

1. 检查后端是否支持 SSE
2. 检查反向代理配置（如 Nginx）是否支持 SSE
3. 检查浏览器控制台的网络请求

## 快速访问链接

如果已经登录管理后台，可以直接通过修改 URL 中的 hash 来访问：

```
http://localhost:5173/admin.html#agentscope-demo
```

（注意：这取决于前端的实际路由实现方式）

## 下一步

如果需要客户端演示界面的独立访问，建议：

1. ✅ 创建客户端演示的独立路由
2. ✅ 或集成到管理后台作为新菜单项
3. ✅ 更新本文档的访问路径说明

## 最后更新

2026-01-10 - 创建访问指南文档
