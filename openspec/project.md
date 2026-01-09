# Project Context

## Purpose

心域（HeartSphere）是一个数字生命体交互系统，提供AI对话、场景管理、角色扮演、剧本系统等核心功能。系统采用前后端分离架构，支持Web、移动端（Capacitor）等多平台。

**核心功能模块**：
- AI对话系统：与数字生命体进行智能对话
- 场景管理：创建和管理不同的场景（时代切片）
- 角色扮演：与场景中的角色进行交互
- 剧本系统：创建和管理剧本，推进剧情发展
- 插件系统：可扩展的插件机制，支持功能扩展
- 心域连接：心域共享和快速连接功能
- 跨时空信箱：跨时空消息传递功能

**参考文档**：详细规范请参考 `docs/12-开发指南/开发规范/心域开发指南.md`

## Tech Stack

### Backend
- **框架**: Spring Boot 3.2.0
- **语言**: Java 17
- **ORM**: Spring Data JPA
- **数据库**: MySQL 8.0+
- **安全**: Spring Security + JWT
- **数据库迁移**: Flyway
- **构建工具**: Maven 3.9+
- **API文档**: SpringDoc OpenAPI (Swagger)

### Frontend
- **框架**: React 18+ + TypeScript
- **构建工具**: Vite
- **UI库**: Tailwind CSS
- **状态管理**: React Hooks / Context API
- **路由**: React Router
- **HTTP客户端**: Fetch API / Axios
- **移动端**: Capacitor 8.0+
- **UX设计规范**: ⭐ **页面开发必须遵循UX设计规范**（见下方UX Design Guidelines）

### AI Services
- **大模型**: Gemini、OpenAI、Qwen、豆包等
- **AI服务**: 自研AI服务 + AipexBase集成
- **代码生成**: AI代码生成服务

## Project Conventions

### Code Style

#### Backend (Java)
- **包结构**: `com.heartsphere.{module}/` 包含 controller, service, repository, entity, dto, config, exception
- **类命名**: PascalCase（如：`UserProfileService`）
- **方法命名**: camelCase（如：`getUserProfile`）
- **常量命名**: UPPER_SNAKE_CASE（如：`MAX_RETRY_COUNT`）
- **包命名**: 小写字母+点分隔（如：`com.heartsphere.user`）
- **代码格式化**: Google Java Format
- **Lombok使用**: 优先使用 `@Data`, `@Builder`, `@RequiredArgsConstructor` 等注解简化代码

#### Frontend (TypeScript/React)
- **文件组织**: 
  - 组件: `components/` (common/, features/)
  - 服务: `services/api/`
  - Hooks: `hooks/`
  - 工具: `utils/`
  - 类型: `types/`
- **组件命名**: PascalCase（如：`UserProfile.tsx`）
- **Hook命名**: camelCase，以 `use` 开头（如：`useUserProfile`）
- **变量和函数**: camelCase（如：`photoAlbum`, `handleCreate`）
- **常量**: UPPER_SNAKE_CASE（如：`MAX_PHOTO_SIZE`）
- **代码格式化**: Prettier
- **代码检查**: ESLint + TypeScript strict mode

#### 日志规范
- **后端**: 使用 SLF4J + Logback，避免使用 `System.out.println`
- **前端**: 使用统一的日志工具（`utils/logger.ts`），避免使用 `console.log`（生产环境）
- **日志级别**: DEBUG, INFO, WARN, ERROR
- **敏感信息**: 自动脱敏（password, token, apiKey等）

**参考文档**：详细代码规范请参考 `docs/12-开发指南/开发规范/心域开发指南.md` 第4节

### Architecture Patterns

#### 架构设计原则
1. **前后端分离**: 标准RESTful API，前后端独立开发部署
2. **模块化设计**: 功能模块化，低耦合高内聚
3. **可扩展性**: 支持功能扩展和性能扩展
4. **安全性**: 数据安全、接口安全、权限控制
5. **可维护性**: 代码清晰、文档完善、易于理解

#### 后端架构
- **分层架构**: Controller → Service → Repository → Entity
- **包结构**: 按功能模块组织，每个模块包含完整的层次结构
- **依赖注入**: 使用 Spring 的依赖注入，优先使用构造函数注入（`@RequiredArgsConstructor`）
- **事务管理**: Service层使用 `@Transactional` 注解

#### 前端架构
- **组件化**: 单一职责，组件粒度适中
- **状态管理**: 优先使用本地状态，复杂状态使用 Context API
- **代码分割**: 使用 React.lazy 进行代码分割
- **路由**: 使用 React Router，需要认证的路由使用路由守卫
- **UX设计规范**: ⭐ **所有页面开发必须遵循UX设计规范**，确保设计一致性

#### 数据库设计
- **命名规范**: 
  - 表名: 小写字母+下划线，复数形式（如：`user_profiles`）
  - 字段名: 小写字母+下划线（如：`created_at`）
  - 主键: 统一使用 `id`，类型为 `BIGINT`
- **时间字段**: 
  - `created_at`: 创建时间（TIMESTAMP，NOT NULL，DEFAULT CURRENT_TIMESTAMP）
  - `updated_at`: 更新时间（TIMESTAMP，NOT NULL，DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP）
- **软删除**: 使用 `deleted_at` 字段（TIMESTAMP，NULL）
- **索引**: 外键字段和频繁查询的字段必须创建索引
- **迁移**: 使用 Flyway，命名规范 `V{版本号}__{描述}.sql`

#### API设计
- **RESTful规范**: 
  - URL命名: 小写字母+连字符（如：`/api/user-profiles`）
  - HTTP方法: GET（查询）、POST（创建）、PUT（完整更新）、PATCH（部分更新）、DELETE（删除）
  - 版本控制: URL中包含版本号（如：`/api/v1/user-profiles`）
- **请求规范**: 
  - Content-Type: `application/json`
  - 认证: Bearer Token（`Authorization: Bearer {token}`）
  - 请求体: JSON格式，字段命名使用camelCase
- **响应规范**: 统一响应格式
  ```json
  {
    "code": 200,
    "message": "成功",
    "data": { /* 数据 */ },
    "timestamp": "2025-01-04T10:00:00"
  }
  ```
- **分页规范**: `page`（页码，从1开始）、`size`（每页数量，默认10）
- **CORS配置**: 
  - **统一原则**: 所有CORS配置统一在 `WebSecurityConfig` 中管理
  - **禁止使用**: Controller层**禁止**使用 `@CrossOrigin` 注解
  - **标准配置**: 使用 `addAllowedOriginPattern("*")` 支持凭证，明确列出允许的请求头
  - **环境区分**: 开发环境允许所有来源，生产环境明确指定允许的来源
  - **自定义请求头**: 如需使用自定义请求头，在全局CORS配置中添加

**参考文档**：详细架构设计请参考 `docs/12-开发指南/开发规范/心域开发指南.md` 第3节

### UX Design Guidelines ⭐

**重要**: 所有页面开发必须遵循UX设计规范，确保设计一致性和用户体验。

#### 设计风格定位
- **科技感**: 使用渐变、光效、现代字体，体现未来感
- **扁平化**: 简化视觉层次，提高可读性和性能
- **温馨**: 使用柔和色彩和圆角，营造温暖友好的氛围

#### 规范内容
- **色彩系统**: 主色、辅助色、语义色、渐变色规范
- **字体系统**: 字体族、字号、字重、行高规范
- **间距系统**: 8px基准，统一间距等级
- **组件设计**: 按钮、表单、卡片、导航等组件规范
- **交互设计**: 动画、反馈、状态规范
- **PC端规范**: 布局、导航、响应式、键盘操作
- **Mobile端规范**: 触摸优化、手势、底部导航、安全区域
- **无障碍设计**: WCAG AA标准、键盘导航、屏幕阅读器支持

#### 开发要求
- **必须遵循**: 所有新页面和组件必须符合UX设计规范
- **代码审查**: 代码审查时检查是否符合UX规范
- **Tailwind CSS**: 使用规范中提供的Tailwind CSS类名
- **渐进改进**: 现有页面逐步改进以符合规范

**参考文档**：详细UX设计规范请参考 `docs/12-开发指南/开发规范/心域开发指南.md` 第3.5节（UX设计规范）

### Testing Strategy

#### 测试类型
- **单元测试**: 
  - 后端: JUnit 5 + Mockito
  - 前端: Jest + React Testing Library
  - 覆盖率目标: > 80%
- **集成测试**: 
  - 后端: Spring Boot Test + TestContainers
  - 前端: Cypress 或 Playwright
  - 测试范围: API端点、数据库操作
- **端到端测试**: 
  - 工具: Cypress / Playwright
  - 测试范围: 关键用户流程

#### 测试规范
- **测试类命名**: `{ClassName}Test`（如：`UserProfileServiceTest`）
- **测试方法命名**: `test{MethodName}_{Scenario}_{ExpectedResult}` 或描述性名称
- **测试覆盖**: 
  - Service层：核心业务逻辑必须有测试
  - Controller层：所有API端点有测试
  - 前端组件：关键组件有测试
- **测试结构**: Given-When-Then 模式

**参考文档**：详细测试规范请参考 `docs/12-开发指南/开发规范/心域开发指南.md` 第5节

### Git Workflow

#### 分支管理
- **main/master**: 生产环境分支
- **develop**: 开发分支
- **feature/{功能名}**: 功能分支
- **bugfix/{问题名}**: Bug修复分支
- **hotfix/{问题名}**: 紧急修复分支

#### 提交信息规范
格式：`<type>(<scope>): <subject>`

**Type类型**:
- `feat`: 新功能
- `fix`: 修复bug
- `docs`: 文档更新
- `style`: 代码格式（不影响功能）
- `refactor`: 重构
- `test`: 测试相关
- `chore`: 构建/工具相关

**示例**:
```
feat(user): 添加用户资料编辑功能

- 实现用户资料编辑界面
- 添加表单验证
- 集成后端API

Closes #123
```

#### 代码审查流程
1. 开发者提交 Pull Request
2. 自动运行 CI/CD 检查
3. 代码审查者审查代码
4. 修改后重新审查
5. 审查通过后合并

**参考文档**：详细Git工作流请参考 `docs/12-开发指南/开发规范/心域开发指南.md` 第4.3节

## Domain Context

### 核心概念

**心域（HeartSphere）**: 数字生命体交互系统，用户可以创建和管理自己的数字世界。

**场景（Era/World Scene）**: 代表一个时代切片或世界场景，如"我的大学"、"赛博都市"等。每个场景包含：
- 角色（Character）：场景中的数字生命体
- 主线剧情（Main Story）：场景的主要剧情线
- 剧本（Script）：场景中的剧本事件

**角色（Character/E-SOUL）**: 数字生命体，可以与用户进行AI对话。每个角色有：
- 基本信息：名称、头像、描述
- 技能（Skill）：角色可以执行的功能
- 记忆：与用户的对话历史

**插件（Plugin）**: 可独立运行的功能模块，可以动态加载和卸载。插件可以嵌入到"现实世界"场景中，提供功能扩展。

**心域连接**: 允许用户共享自己的心域，或访问他人的心域（体验模式）。

**跨时空信箱**: 允许用户在不同场景之间发送和接收消息。

### 主要功能模块

1. **AI对话系统**: 与数字生命体进行智能对话，支持多轮对话、上下文理解
2. **场景管理**: 创建、编辑、删除场景，管理场景中的角色和剧本
3. **角色管理**: 创建、编辑角色，配置角色技能和属性
4. **剧本系统**: 创建和管理剧本，定义剧情事件和触发条件
5. **插件系统**: 开发和管理插件，扩展系统功能
6. **心域连接**: 心域共享、快速连接、体验模式
7. **跨时空信箱**: 跨场景消息传递
8. **用户系统**: 用户注册、登录、资料管理

**参考文档**：详细领域知识请参考 `docs/` 目录下的各功能模块文档

## Important Constraints

### 技术约束
- **Java版本**: 必须使用 Java 17（后端）
- **Node.js版本**: 必须使用 Node.js 18+（前端）
- **数据库**: MySQL 8.0+，必须使用 utf8mb4 字符集
- **Spring Boot版本**: 3.2.0（固定版本，避免兼容性问题）
- **React版本**: 18+（固定版本）
- **TypeScript**: 启用 strict mode

### 安全约束
- **认证**: 所有API必须使用JWT认证（除公开接口外）
- **授权**: 实现RBAC（基于角色的访问控制）
- **输入验证**: 所有用户输入必须验证
- **SQL注入防护**: 使用参数化查询，禁止拼接SQL
- **XSS防护**: 前端避免使用 `innerHTML`，使用 `textContent`
- **CSRF防护**: 使用CSRF Token
- **敏感信息**: 不在前端存储敏感信息，不在日志中输出敏感信息

### 性能约束
- **API响应时间**: 一般接口 < 500ms，复杂查询 < 2s
- **数据库查询**: 避免N+1查询，使用索引优化
- **前端加载**: 首屏加载时间 < 3s
- **代码分割**: 大组件使用 React.lazy 进行代码分割
- **缓存策略**: 合理使用Redis缓存（如适用）

### 业务约束
- **数据隔离**: 用户数据必须隔离，不能跨用户访问
- **软删除**: 重要数据使用软删除，保留历史记录
- **审计日志**: 关键操作需要记录审计日志

**参考文档**：详细约束请参考 `docs/12-开发指南/开发规范/心域开发指南.md` 第7.4节（安全规范）

## External Dependencies

### 数据库
- **MySQL 8.0+**: 主数据库，存储业务数据
- **字符集**: utf8mb4（支持emoji和特殊字符）

### AI服务
- **Gemini API**: Google的AI大模型服务
- **OpenAI API**: OpenAI的GPT模型服务
- **Qwen API**: 阿里云的通义千问模型服务
- **豆包 API**: 字节跳动的AI模型服务
- **AipexBase**: 自研AI服务集成

### 可选服务
- **Redis**: 缓存服务（可选，用于提升性能）
- **MinIO/OSS**: 对象存储服务（可选，用于文件存储）
- **RabbitMQ/Kafka**: 消息队列（可选，用于异步任务处理）

### 开发工具
- **Maven**: 后端构建工具
- **npm/yarn**: 前端包管理工具
- **Vite**: 前端构建工具
- **Capacitor**: 移动端开发框架

**参考文档**：详细依赖信息请参考 `backend/pom.xml` 和 `frontend/package.json`

---

**最后更新**: 2025-01-04  
**参考文档**: `docs/12-开发指南/开发规范/心域开发指南.md`  
**维护者**: HeartSphere开发团队
