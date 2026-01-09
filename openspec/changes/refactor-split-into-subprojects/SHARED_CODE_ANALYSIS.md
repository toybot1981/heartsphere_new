# 共享代码分析报告

## 一、共享代码识别原则

### 1.1 必须共享的代码

#### 后端共享代码

1. **数据库实体类（Entity）**
   - 位置：`backend/src/main/java/com/heartsphere/*/entity/`
   - 原因：三个子项目共享同一个数据库，实体类必须统一
   - 建议共享的实体类：
     - `UserProfile` - 用户资料
     - `Character` - 角色
     - `Era` - 场景
     - `World` - 世界
     - `MainStory` - 主线剧情
     - `Script` - 剧本
     - `Memory` - 记忆
     - `Skill` - 技能
     - 其他核心业务实体

2. **公共工具类（Utils）**
   - 位置：`backend/src/main/java/com/heartsphere/*/util/`
   - 建议共享的工具类：
     - `JwtTokenUtil` - JWT Token 工具
     - `ShareCodeGenerator` - 共享码生成器（已在 `heartconnect/util/`）
     - `FileUtils` - 文件工具
     - `DateUtils` - 日期工具
     - `StringUtils` - 字符串工具
     - `JsonUtils` - JSON 工具
     - `ValidationUtils` - 验证工具

3. **公共配置类（Config）**
   - 位置：`backend/src/main/java/com/heartsphere/*/config/`
   - 建议共享的配置类：
     - `WebSecurityConfig` - Web 安全配置（部分）
     - `CorsConfig` - CORS 配置
     - `JwtConfig` - JWT 配置
     - `DatabaseConfig` - 数据库配置
     - `RedisConfig` - Redis 配置（如果使用）

4. **公共异常类（Exception）**
   - 位置：`backend/src/main/java/com/heartsphere/*/exception/`
   - 建议共享的异常类：
     - `BaseException` - 基础异常类
     - `BusinessException` - 业务异常
     - `ValidationException` - 验证异常
     - `NotFoundException` - 未找到异常
     - `UnauthorizedException` - 未授权异常
     - `GlobalExceptionHandler` - 全局异常处理器

5. **公共 DTO 类**
   - 位置：`backend/src/main/java/com/heartsphere/*/dto/`
   - 建议共享的 DTO：
     - `ApiResponse<T>` - 统一响应格式
     - `PaginatedResponse<T>` - 分页响应
     - `BaseDTO` - 基础 DTO
     - `ErrorResponse` - 错误响应

#### 前端共享代码

1. **公共类型定义（TypeScript Types）**
   - 位置：`frontend/types.ts`、`frontend/types/`
   - 建议共享的类型：
     - `UserProfile` - 用户资料类型
     - `Character` - 角色类型
     - `Era` - 场景类型
     - `World` - 世界类型
     - `ApiResponse<T>` - API 响应类型
     - `PaginatedResponse<T>` - 分页响应类型
     - `BaseEntity` - 基础实体类型

2. **公共工具函数（Utils）**
   - 位置：`frontend/utils/`
   - 建议共享的工具函数：
     - `request.ts` - 通用请求函数（已在 `services/api/base/request.ts`）
     - `tokenStorage.ts` - Token 存储（已在 `services/api/base/tokenStorage.ts`）
     - `logger.ts` - 日志工具
     - `dateUtils.ts` - 日期工具
     - `stringUtils.ts` - 字符串工具
     - `validationUtils.ts` - 验证工具
     - `formatUtils.ts` - 格式化工具

3. **公共 API 基础库**
   - 位置：`frontend/services/api/base/`
   - 建议共享的 API 基础库：
     - `request.ts` - 通用请求函数
     - `types.ts` - API 类型定义
     - `crudFactory.ts` - CRUD 工厂函数
     - `tokenStorage.ts` - Token 存储

4. **公共 UI 组件（可选）**
   - 位置：`frontend/components/common/`
   - 如果三个项目的 UI 风格统一，可以共享：
     - `Button` - 按钮组件
     - `Input` - 输入框组件
     - `Modal` - 模态框组件
     - `Loading` - 加载组件
     - `ErrorBoundary` - 错误边界组件

5. **公共常量定义**
   - 位置：`frontend/constants.ts`
   - 建议共享的常量：
     - API 基础 URL
     - 通用配置常量
     - 错误消息常量

### 1.2 可选共享的代码

1. **公共业务逻辑**
   - 如果客户端、管理端、Mentis 有相同的业务逻辑，可以考虑共享
   - 但需要谨慎，避免过度耦合

2. **公共 UI 组件**
   - 如果三个项目的 UI 设计风格统一，可以共享基础 UI 组件
   - 但需要支持主题定制，以适应不同项目的需求

### 1.3 不共享的代码

1. **项目特定的业务逻辑**
   - 客户端特有的业务逻辑
   - 管理端特有的业务逻辑
   - Mentis 特有的业务逻辑

2. **项目特定的 UI 组件**
   - 客户端特有的 UI 组件
   - 管理端特有的 UI 组件
   - Mentis 特有的 UI 组件

3. **项目特定的配置**
   - 各项目的独立配置
   - 各项目的环境变量

## 二、共享代码实现建议

### 2.1 后端共享代码实现

#### 方案 1: Maven 多模块项目（推荐）

**结构**：
```
heartsphere/
├── pom.xml                    # 父 POM
├── shared/
│   └── backend/
│       └── pom.xml            # 共享后端模块
├── client/
│   └── backend/
│       └── pom.xml            # 客户端后端，依赖 shared-backend
├── admin/
│   └── backend/
│       └── pom.xml            # 管理端后端，依赖 shared-backend
└── mentis/
    └── backend/
        └── pom.xml            # Mentis 后端，依赖 shared-backend
```

**优点**：
- 统一的构建管理
- 依赖关系清晰
- 版本管理简单

**实现步骤**：
1. 创建父 POM 文件
2. 将共享代码提取到 `shared/backend/`
3. 在各子项目的 `pom.xml` 中添加对 `shared-backend` 的依赖

#### 方案 2: Git Submodule

**结构**：
```
heartsphere/
├── shared-backend/            # Git Submodule
├── client/backend/            # 引用 shared-backend
├── admin/backend/             # 引用 shared-backend
└── mentis/backend/            # 引用 shared-backend
```

**优点**：
- 代码完全独立管理
- 可以独立版本控制
- 可以独立发布

**缺点**：
- 需要团队熟悉 Git Submodule
- 开发时更新稍显复杂

### 2.2 前端共享代码实现

#### 方案 1: npm/yarn workspace（推荐）

**结构**：
```
heartsphere/
├── package.json               # 根 package.json，配置 workspaces
├── shared/
│   └── frontend/
│       └── package.json       # 共享前端模块
├── client/
│   ├── frontend-pc/
│   │   └── package.json       # 引用 shared-frontend
│   ├── frontend-mobile/
│   │   └── package.json       # 引用 shared-frontend
│   └── frontend-miniprogram/
│       └── package.json       # 引用 shared-frontend
├── admin/
│   └── frontend/
│       └── package.json       # 引用 shared-frontend
└── mentis/
    └── frontend/
        └── package.json       # 引用 shared-frontend
```

**根 package.json 配置**：
```json
{
  "name": "heartsphere",
  "private": true,
  "workspaces": [
    "shared/frontend",
    "client/frontend-pc",
    "client/frontend-mobile",
    "admin/frontend",
    "mentis/frontend"
  ]
}
```

**子项目 package.json 配置**：
```json
{
  "name": "client-frontend-pc",
  "dependencies": {
    "shared-frontend": "*"
  }
}
```

**优点**：
- 统一的依赖管理
- 支持本地开发时的热更新
- 版本管理简单

#### 方案 2: Git Submodule + npm link

**结构**：
```
heartsphere/
├── shared-frontend/           # Git Submodule
├── client/frontend-pc/        # 通过 npm link 引用 shared-frontend
├── admin/frontend/             # 通过 npm link 引用 shared-frontend
└── mentis/frontend/            # 通过 npm link 引用 shared-frontend
```

**实现步骤**：
1. 在 `shared-frontend/` 中运行 `npm link`
2. 在各子项目中运行 `npm link shared-frontend`

**优点**：
- 代码完全独立管理
- 开发时可以直接修改共享代码

**缺点**：
- 需要手动管理链接
- 部署时需要额外处理

#### 方案 3: 发布到私有 npm 仓库

**结构**：
```
shared-frontend/               # 独立项目，发布到私有 npm
client/frontend-pc/            # 通过 npm install 安装 shared-frontend
admin/frontend/                 # 通过 npm install 安装 shared-frontend
mentis/frontend/                # 通过 npm install 安装 shared-frontend
```

**优点**：
- 版本管理最清晰
- 依赖关系最明确
- 适合大型团队

**缺点**：
- 需要搭建私有 npm 仓库
- 开发时更新不便（需要发布新版本）

### 2.3 推荐方案总结

**后端**：推荐使用 **Maven 多模块项目**
- 简单直接，适合当前项目规模
- 统一的构建和版本管理
- 团队熟悉 Maven

**前端**：推荐使用 **npm/yarn workspace**
- 开发体验好，支持热更新
- 统一的依赖管理
- 适合当前项目规模

**如果项目规模进一步扩大**，可以考虑：
- 后端：Git Submodule 或发布到 Maven 私有仓库
- 前端：Git Submodule 或发布到 npm 私有仓库

## 三、共享代码管理规范

### 3.1 代码组织规范

1. **包/目录命名**：
   - 共享代码使用 `com.heartsphere.shared.*` 包名（后端）
   - 共享代码使用 `@heartsphere/shared-*` 包名（前端）

2. **代码分层**：
   - 共享代码应该是最底层的代码
   - 子项目代码可以依赖共享代码，但共享代码不能依赖子项目代码

3. **依赖管理**：
   - 共享代码的依赖应该最小化
   - 避免引入子项目特定的依赖

### 3.2 版本管理规范

1. **语义化版本**：
   - 使用语义化版本（Semantic Versioning）
   - 主版本号：破坏性变更
   - 次版本号：新功能，向后兼容
   - 修订版本号：Bug 修复，向后兼容

2. **变更日志**：
   - 维护 CHANGELOG.md
   - 记录所有变更，特别是破坏性变更

3. **向后兼容**：
   - 优先保持向后兼容
   - 破坏性变更需要明确标注和迁移指南

### 3.3 测试规范

1. **单元测试**：
   - 共享代码必须有完整的单元测试
   - 测试覆盖率应该 > 80%

2. **集成测试**：
   - 在各子项目中运行集成测试
   - 验证共享代码的兼容性

### 3.4 文档规范

1. **API 文档**：
   - 共享代码必须提供清晰的 API 文档
   - 使用 JSDoc/JavaDoc 注释

2. **使用示例**：
   - 提供使用示例
   - 提供最佳实践指南

3. **迁移指南**：
   - 破坏性变更必须提供迁移指南
   - 说明如何从旧版本迁移到新版本

## 四、实施建议

### 4.1 分阶段实施

1. **第一阶段**：提取最核心的共享代码
   - Entity 类
   - 基础工具类
   - API 基础库

2. **第二阶段**：提取其他共享代码
   - 配置类
   - 异常类
   - UI 组件（如果适用）

3. **第三阶段**：优化和重构
   - 优化共享代码结构
   - 完善文档和测试
   - 建立最佳实践

### 4.2 风险控制

1. **代码审查**：
   - 共享代码的修改必须经过严格的代码审查
   - 需要所有受影响项目的批准

2. **测试覆盖**：
   - 充分的测试覆盖
   - 在各子项目中验证兼容性

3. **渐进式迁移**：
   - 不要一次性迁移所有代码
   - 分模块、分阶段迁移
   - 保持向后兼容

### 4.3 工具支持

1. **代码分析工具**：
   - 使用工具检测代码重复
   - 使用工具检测依赖关系

2. **自动化测试**：
   - CI/CD 自动运行测试
   - 自动检测共享代码变更的影响

3. **文档生成**：
   - 自动生成 API 文档
   - 自动生成变更日志
