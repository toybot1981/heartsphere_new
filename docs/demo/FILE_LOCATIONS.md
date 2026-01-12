# AgentScope Computer-Use 演示文件路径清单

## 📁 文件路径总览

### 前端组件文件

#### 客户端演示组件

1. **AgentScopeDemo.tsx** - 主组件
   ```
   frontend/demo/components/AgentScopeDemo.tsx
   ```
   - 功能：客户端演示主界面，集成聊天、工具调用监控、虚拟机状态等功能

2. **ToolCallMonitor.tsx** - 工具调用监控组件
   ```
   frontend/demo/components/ToolCallMonitor.tsx
   ```
   - 功能：实时显示工具调用列表和状态

3. **VmStatusPanel.tsx** - 虚拟机状态面板
   ```
   frontend/demo/components/VmStatusPanel.tsx
   ```
   - 功能：显示虚拟机状态信息

4. **ScenarioSelector.tsx** - 演示场景选择器
   ```
   frontend/demo/components/ScenarioSelector.tsx
   ```
   - 功能：显示和选择演示场景

5. **scenarios.ts** - 演示场景配置
   ```
   frontend/demo/scenarios.ts
   ```
   - 功能：定义所有演示场景的数据

#### 管理端演示组件

6. **AgentScopeDemoAdmin.tsx** - 管理端主组件
   ```
   frontend/admin/components/AgentScopeDemoAdmin.tsx
   ```
   - 功能：管理端演示主界面，包含标签导航

7. **ToolCallMonitorPanel.tsx** - 工具调用监控面板
   ```
   frontend/admin/components/agentscope-demo/ToolCallMonitorPanel.tsx
   ```
   - 功能：管理端工具调用监控，支持筛选和统计

8. **VmManagementPanel.tsx** - 虚拟机管理面板
   ```
   frontend/admin/components/agentscope-demo/VmManagementPanel.tsx
   ```
   - 功能：管理所有活动的虚拟机

9. **SessionManagementPanel.tsx** - 会话管理面板
   ```
   frontend/admin/components/agentscope-demo/SessionManagementPanel.tsx
   ```
   - 功能：管理所有活跃会话

10. **PerformancePanel.tsx** - 性能监控面板
    ```
    frontend/admin/components/agentscope-demo/PerformancePanel.tsx
    ```
    - 功能：显示性能指标和统计信息

### 后端服务文件

#### 模型层

11. **ToolCallLog.java** - 工具调用日志实体
    ```
    backend/src/main/java/com/heartsphere/mentis/demo/model/ToolCallLog.java
    ```

#### 数据访问层

12. **ToolCallLogRepository.java** - Repository 接口
    ```
    backend/src/main/java/com/heartsphere/mentis/demo/repository/ToolCallLogRepository.java
    ```

#### 服务层

13. **ToolCallLogService.java** - 工具调用日志服务
    ```
    backend/src/main/java/com/heartsphere/mentis/demo/service/ToolCallLogService.java
    ```

14. **DemoService.java** - 演示业务服务
    ```
    backend/src/main/java/com/heartsphere/mentis/demo/service/DemoService.java
    ```

15. **DemoEventService.java** - 事件推送服务
    ```
    backend/src/main/java/com/heartsphere/mentis/demo/service/DemoEventService.java
    ```

#### 控制器层

16. **DemoController.java** - REST API 控制器
    ```
    backend/src/main/java/com/heartsphere/mentis/demo/controller/DemoController.java
    ```

17. **DemoEventController.java** - SSE 事件流控制器
    ```
    backend/src/main/java/com/heartsphere/mentis/demo/controller/DemoEventController.java
    ```

### 集成文件

18. **AdminScreen.tsx** - 管理后台主界面（已添加路由）
    ```
    frontend/admin/AdminScreen.tsx
    ```
    - 修改：添加了 `agentscope-demo` 路由处理

19. **AdminSidebar.tsx** - 管理后台侧边栏（已添加菜单项）
    ```
    frontend/admin/components/AdminSidebar.tsx
    ```
    - 修改：添加了 "AgentScope 演示管理" 菜单项

### 文档文件

20. **README.md** - 使用说明
    ```
    docs/demo/README.md
    ```

21. **scenarios.md** - 演示场景文档
    ```
    docs/demo/scenarios.md
    ```

22. **architecture.md** - 架构文档
    ```
    docs/demo/architecture.md
    ```

23. **ACCESS_GUIDE.md** - 访问指南
    ```
    docs/demo/ACCESS_GUIDE.md
    ```

24. **QUICK_START.md** - 快速开始指南
    ```
    docs/demo/QUICK_START.md
    ```

25. **FILE_LOCATIONS.md** - 本文件
    ```
    docs/demo/FILE_LOCATIONS.md
    ```

26. **implementation-progress.md** - 实现进度文档
    ```
    docs/demo/implementation-progress.md
    ```

## 🔍 如何查看演示

### 方式 1: 通过管理后台访问（推荐）

1. **启动服务**
   ```bash
   # 后端
   cd backend
   mvn spring-boot:run
   
   # 前端
   cd frontend
   npm run dev
   ```

2. **访问地址**
   - 前端: `http://localhost:5173/admin.html`
   - 后端 API: `http://localhost:8081/api/`

3. **导航路径**
   ```
   管理后台 → 登录 → 左侧菜单 "AI 智能体" → "AgentScope 演示管理"
   ```

### 方式 2: 直接在代码中查看组件

#### 查看客户端演示组件

```bash
# 查看主组件
code frontend/demo/components/AgentScopeDemo.tsx

# 查看工具调用监控组件
code frontend/demo/components/ToolCallMonitor.tsx

# 查看虚拟机状态面板
code frontend/demo/components/VmStatusPanel.tsx

# 查看演示场景选择器
code frontend/demo/components/ScenarioSelector.tsx
```

#### 查看管理端演示组件

```bash
# 查看管理端主组件
code frontend/admin/components/AgentScopeDemoAdmin.tsx

# 查看工具调用监控面板
code frontend/admin/components/agentscope-demo/ToolCallMonitorPanel.tsx

# 查看虚拟机管理面板
code frontend/admin/components/agentscope-demo/VmManagementPanel.tsx

# 查看会话管理面板
code frontend/admin/components/agentscope-demo/SessionManagementPanel.tsx

# 查看性能监控面板
code frontend/admin/components/agentscope-demo/PerformancePanel.tsx
```

#### 查看后端服务代码

```bash
# 查看控制器
code backend/src/main/java/com/heartsphere/mentis/demo/controller/DemoController.java
code backend/src/main/java/com/heartsphere/mentis/demo/controller/DemoEventController.java

# 查看服务
code backend/src/main/java/com/heartsphere/mentis/demo/service/DemoService.java
code backend/src/main/java/com/heartsphere/mentis/demo/service/ToolCallLogService.java
code backend/src/main/java/com/heartsphere/mentis/demo/service/DemoEventService.java
```

## 📂 目录结构

```
frontend/
├── demo/
│   ├── components/
│   │   ├── AgentScopeDemo.tsx          # 客户端演示主组件
│   │   ├── ToolCallMonitor.tsx         # 工具调用监控组件
│   │   ├── VmStatusPanel.tsx           # 虚拟机状态面板
│   │   └── ScenarioSelector.tsx        # 演示场景选择器
│   └── scenarios.ts                     # 演示场景配置
│
└── admin/
    ├── components/
    │   ├── AgentScopeDemoAdmin.tsx     # 管理端演示主组件
    │   └── agentscope-demo/
    │       ├── ToolCallMonitorPanel.tsx    # 工具调用监控面板
    │       ├── VmManagementPanel.tsx       # 虚拟机管理面板
    │       ├── SessionManagementPanel.tsx  # 会话管理面板
    │       └── PerformancePanel.tsx        # 性能监控面板
    ├── AdminScreen.tsx                  # 管理后台主界面（已集成）
    └── components/
        └── AdminSidebar.tsx             # 管理后台侧边栏（已集成）

backend/src/main/java/com/heartsphere/mentis/demo/
├── model/
│   └── ToolCallLog.java                # 工具调用日志实体
├── repository/
│   └── ToolCallLogRepository.java      # Repository 接口
├── service/
│   ├── ToolCallLogService.java         # 工具调用日志服务
│   ├── DemoService.java                # 演示业务服务
│   └── DemoEventService.java           # 事件推送服务
└── controller/
    ├── DemoController.java             # REST API 控制器
    └── DemoEventController.java        # SSE 事件流控制器

docs/demo/
├── README.md                           # 使用说明
├── scenarios.md                        # 演示场景文档
├── architecture.md                     # 架构文档
├── ACCESS_GUIDE.md                     # 访问指南
├── QUICK_START.md                      # 快速开始指南
├── FILE_LOCATIONS.md                   # 本文件
└── implementation-progress.md          # 实现进度文档
```

## 🚀 快速定位命令

### 使用 find 命令查找文件

```bash
# 查找所有演示相关的前端文件
find main/frontend -name "*AgentScope*" -o -name "*ToolCall*" -o -name "*VmStatus*" -o -name "*Scenario*"

# 查找所有演示相关的后端文件
find main/backend -path "*/demo/*" -name "*.java"

# 查找所有演示相关的文档
find docs -path "*/demo/*" -name "*.md"
```

### 使用 grep 搜索代码引用

```bash
# 搜索 AgentScopeDemo 的引用
grep -r "AgentScopeDemo" main/frontend/

# 搜索 ToolCallMonitor 的引用
grep -r "ToolCallMonitor" main/frontend/

# 搜索演示 API 的引用
grep -r "/api/demo" main/frontend/
```

## 📝 注意事项

1. **客户端演示组件**（`AgentScopeDemo.tsx`）目前尚未集成到主应用路由
   - 需要在 `App.tsx` 或路由配置中添加路由才能直接访问
   - 或者可以临时在管理后台中添加新菜单项来访问

2. **管理端演示组件**（`AgentScopeDemoAdmin.tsx`）已集成
   - 可以通过管理后台菜单直接访问
   - 访问路径：管理后台 → AI 智能体 → AgentScope 演示管理

3. **所有后端 API** 都需要管理员认证
   - 需要在请求头中携带 `Authorization: Bearer <token>`

## 最后更新

2026-01-10 - 创建文件路径清单文档
