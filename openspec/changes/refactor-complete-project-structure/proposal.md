# Change: 全面重构 - 完整的项目结构拆分

## Why

基于之前的子项目拆分工作，当前 HeartSphere 项目已经初步拆分为 edu、mentis、company 三个子项目，但还需要进一步优化和完善：

1. **客户端产品需要完全独立**：
   - 当前的 client、edu、mentis、company 都是独立的客户端产品，需要各自独立的前后端
   - 每个产品都有其特定的业务逻辑和用户群体，应该完全解耦

2. **管理端需要统一管理**：
   - 需要一个统一的管理入口来管理所有客户端产品
   - 当前的管理端分散在不同位置（如 `frontend/admin/`、`admin-edu/` 等），需要整合
   - 管理端应该能够统一管理所有产品的配置、用户、数据等

3. **共享代码需要独立管理**：
   - 已经创建了 `shared/` 模块，但需要进一步明确其职责和边界
   - 共享代码应该真正独立，便于版本管理和复用

4. **项目结构需要规范化**：
   - 当前的拆分还不够完整，需要统一的项目结构规范
   - 需要清晰的目录结构和命名规范
   - 需要明确的依赖关系和管理机制

## What Changes

### 项目结构重组

将整个 HeartSphere 项目拆分为以下独立的子项目：

1. **客户端产品（Client Products）**：
   - `client/` - 主客户端（PC Web、Mobile、小程序）
   - `edu/` - 教育版客户端
   - `mentis/` - Mentis 超级智能体客户端
   - `company/` - 公司官网客户端

2. **管理端（Admin）**：
   - `admin/` - 统一管理后台
     - 管理所有客户端产品的配置
     - 管理用户、权限、数据等
     - 提供统一的管理入口和界面

3. **共享模块（Shared）**：
   - `shared/` - 共享代码库
     - `shared/backend/` - 共享后端代码（DTO、异常、工具类等）
     - `shared/frontend/` - 共享前端代码（类型、工具函数、组件等）
     - `shared/config/` - 共享配置

### 新的项目结构

```
heartsphere/
├── client/                    # 主客户端项目
│   ├── frontend/              # PC Web 前端
│   ├── frontend-mobile/       # Mobile 前端（Capacitor）
│   ├── frontend-miniprogram/  # 微信小程序前端
│   └── backend/               # 客户端后端服务
├── edu/                        # 教育版项目
│   ├── frontend/              # 教育版前端
│   └── backend/               # 教育版后端服务
├── mentis/                     # Mentis 项目
│   ├── frontend/              # Mentis 前端
│   └── backend/               # Mentis 后端服务
├── company/                    # 公司官网项目
│   ├── frontend/              # 公司官网前端
│   └── backend/               # 公司官网后端服务
├── admin/                      # 统一管理后台
│   ├── frontend/              # 管理后台前端
│   └── backend/               # 管理后台后端服务
└── shared/                     # 共享代码库
    ├── backend/               # 共享后端模块
    ├── frontend/              # 共享前端模块
    └── config/                # 共享配置
```

### 统一管理后台（Admin）

管理后台应该提供以下能力：

1. **产品管理**：
   - 管理所有客户端产品的配置和状态
   - 查看各产品的运行状态和统计信息
   - 统一配置和更新各产品

2. **用户和权限管理**：
   - 统一管理所有产品的用户
   - 权限分配和角色管理
   - 用户行为分析和统计

3. **数据管理**：
   - 统一查看和管理各产品的数据
   - 数据导出和备份
   - 数据统计和分析

4. **系统管理**：
   - 系统配置和参数管理
   - 日志查看和监控
   - 性能监控和告警

### 共享模块职责

共享模块应该包含：

1. **共享后端（shared/backend）**：
   - 公共 DTO（ApiResponse、PageResponse 等）
   - 公共异常类（BusinessException、ResourceNotFoundException 等）
   - 公共工具类（JwtUtils、DateUtils 等）
   - 公共配置类（SecurityConfig、CorsConfig 等）
   - 全局异常处理器（GlobalExceptionHandler）

2. **共享前端（shared/frontend）**：
   - 公共类型定义（ApiResponse、BaseEntity 等）
   - 公共工具函数（tokenStorage、request 等）
   - 公共组件（Button、Input、Card 等，如果 UI 风格统一）
   - 公共常量（API_BASE_URL、STATUS_CODE 等）

3. **共享配置（shared/config）**：
   - 数据库配置模板
   - 环境变量配置模板
   - 构建和部署配置模板

## Impact

### 影响的文件

- **项目根目录结构**：完全重组
- **所有客户端产品代码**：需要按产品重新组织
- **管理端代码**：需要整合和重构
- **共享代码**：需要进一步提取和完善
- **构建配置文件**：需要为每个子项目独立配置
- **部署脚本**：需要更新以适应新的项目结构
- **CI/CD 配置**：需要为每个子项目单独配置

### 影响的规范

- **项目结构规范**：需要定义新的项目结构规范
- **共享代码规范**：需要定义共享代码的使用和管理规范
- **管理端规范**：需要定义统一管理后台的功能和接口规范
- **依赖管理规范**：需要定义各子项目之间的依赖关系和管理方式

### 迁移计划

1. **第一阶段**：完善现有的子项目结构（edu、mentis、company）
2. **第二阶段**：整合和创建统一管理后台（admin）
3. **第三阶段**：提取和完善共享代码（shared）
4. **第四阶段**：迁移主客户端（client）
5. **第五阶段**：测试、优化和文档完善
