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
- **主题系统**: ⭐ **main 项目必须支持多风格（主题/皮肤）切换**，使用 CSS 变量和 React Context 实现
- **PC与Mobile版本规则**: ⭐ **UI独立，业务逻辑复用**
  - **UI独立**: PC和Mobile版本的UI组件必须独立开发，按照各自的风格完成（PC端：桌面交互、复杂布局；Mobile端：触摸优化、简洁布局）
  - **业务逻辑复用**: 网络请求、数据验证、状态管理等业务逻辑必须通过Hooks、Services或Utils层复用，避免重复实现
  - **通用组件**: 纯展示组件（如AgreementModal、ShareCodeDisplay）可以保持共用，但交互组件必须独立
  - **代码组织**: PC组件放在 `main/frontend/components/`，Mobile组件放在 `main/frontend/mobile/components/`，业务逻辑放在 `main/frontend/services/` 或 `main/frontend/hooks/`

#### 数据库设计
- **命名规范**: 
  - 表名: 小写字母+下划线，复数形式（如：`user_profiles`）
  - 字段名: 小写字母+下划线（如：`created_at`）
  - 主键: 统一使用 `id`，类型为 `BIGINT`
- **字符集和编码**: ⭐ **所有数据库表必须使用 utf8mb4 字符集和 utf8mb4_unicode_ci 排序规则**
  - **字符集**: `utf8mb4`（支持完整的UTF-8字符，包括emoji和特殊字符）
  - **排序规则**: `utf8mb4_unicode_ci`（推荐）或 `utf8mb4_general_ci`
  - **连接配置**: JDBC连接URL必须包含 `useUnicode=true&characterEncoding=UTF-8&connectionCollation=utf8mb4_unicode_ci`
  - **表创建**: 所有CREATE TABLE语句必须显式指定 `CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
  - **示例**:
    ```sql
    CREATE TABLE `user_profiles` (
      `id` BIGINT NOT NULL AUTO_INCREMENT,
      `name` VARCHAR(100) NOT NULL,
      PRIMARY KEY (`id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ```
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
- **API URL 定义标准** ⭐ **重要：避免 URL 路径重复**
  - **后端 Controller 路径定义**:
    - Controller 的 `@RequestMapping` 或 `@RestController` 注解中定义的路径**必须包含完整的 API 前缀**
    - 示例：
      ```java
      @RestController
      @RequestMapping("/api/admin/multi-agent")  // ✅ 正确：包含完整路径
      public class MultiAgentCollaborationAdminController {
          @GetMapping("/collaborations")  // 完整路径: /api/admin/multi-agent/collaborations
          public ResponseEntity<?> getCollaborations() { ... }
      }
      ```
  - **前端 API 服务路径定义**:
    - 前端 API 服务文件中定义的路径**不得包含 `API_BASE_URL` 中已有的前缀**
    - `API_BASE_URL` 通常为 `http://localhost:8085/api/admin`（已包含 `/api/admin`）
    - 前端路径应该从 `/` 开始，但**不包含** `/api/admin` 前缀
    - 示例：
      ```typescript
      // ✅ 正确：路径不包含 /api/admin 前缀
      export const multiAgentApi = {
        getAllAgents: async () => {
          return request<MultiAgentAgentDTO[]>(
            '/multi-agent/agents',  // 正确：不包含 /api/admin
            { method: 'GET' }
          );
        }
      };
      
      // ❌ 错误：路径包含 /api/admin 前缀（会导致重复）
      export const multiAgentApi = {
        getAllAgents: async () => {
          return request<MultiAgentAgentDTO[]>(
            '/api/admin/multi-agent/agents',  // 错误：会导致 /api/admin/api/admin/multi-agent/agents
            { method: 'GET' }
          );
        }
      };
      ```
  - **检查清单**:
    - ✅ 后端 Controller 路径包含完整前缀（如 `/api/admin/...`）
    - ✅ 前端 API 路径不包含 `API_BASE_URL` 中已有的前缀
    - ✅ 前端路径以 `/` 开头，但不包含 `/api/admin`
    - ✅ 最终请求 URL = `API_BASE_URL` + 前端路径（如：`http://localhost:8085/api/admin` + `/multi-agent/agents` = `http://localhost:8085/api/admin/multi-agent/agents`）
  - **常见错误**:
    - ❌ 前端路径包含 `/api/admin`，导致最终 URL 变成 `/api/admin/api/admin/...`
    - ❌ 后端路径不完整，缺少 `/api/admin` 前缀
    - ❌ 前后端路径不一致，导致 404 错误
- **请求规范**: 
  - Content-Type: `application/json`
  - 认证: Bearer Token（`Authorization: Bearer {token}`）
  - 请求体: JSON格式，字段命名使用camelCase
- **响应规范**: 
  - **统一响应格式**:
    ```json
    {
      "code": 200,
      "message": "成功",
      "data": { /* 数据 */ },
      "timestamp": "2025-01-04T10:00:00"
    }
    ```
  - **字符编码**: ⭐ **所有API响应必须使用 UTF-8 编码**
    - **Content-Type**: 必须设置为 `application/json;charset=UTF-8`
    - **HTTP响应头**: 必须包含 `Content-Type: application/json;charset=UTF-8`
    - **Spring Boot配置**: 
      - 在 `application.yml` 中配置 `server.servlet.encoding.charset=UTF-8`
      - 使用 `WebMvcConfigurer` 配置 `StringHttpMessageConverter` 和 `MappingJackson2HttpMessageConverter` 使用 UTF-8
    - **Controller注解**: 建议在 `@GetMapping`、`@PostMapping` 等注解中使用 `produces = "application/json;charset=UTF-8"`
    - **目的**: 确保中文字符、emoji等特殊字符在API响应中正确显示，避免乱码问题
- **分页规范**: `page`（页码，从1开始）、`size`（每页数量，默认10）
- **CORS配置**: 
  - **统一原则**: 所有CORS配置统一在 `WebSecurityConfig` 中管理
  - **禁止使用**: Controller层**禁止**使用 `@CrossOrigin` 注解
  - **标准配置**: 使用 `addAllowedOriginPattern("*")` 支持凭证，明确列出允许的请求头
  - **环境区分**: 开发环境允许所有来源，生产环境明确指定允许的来源
  - **自定义请求头**: 如需使用自定义请求头，在全局CORS配置中添加

#### Admin 模块架构约束 ⭐
- **独立接口原则**: ⭐ **Admin 模块除了 AI 大模型接入，不得调用其他工程中的服务**
  - **业务管理接口独立实现**: 所有的业务管理接口必须在 `admin/backend` 中单独实现，不依赖 `backend` 或其他工程的服务
  - **原因**: 鉴权方式不一样，接口的用途也不同
    - Admin 模块使用管理员认证（`SystemAdmin` + JWT）
    - 其他工程使用用户认证（`User` + JWT）
  - **允许的例外**: 
    - ✅ AI 大模型接入服务可以调用（因为这是基础设施服务）
  - **实现要求**:
    - 在 `admin/backend` 中创建独立的 Controller、Service、Repository
    - 可以复用数据库表（如 `skill_definitions`），但实体类和 Repository 必须在 `admin/backend` 中独立定义
    - 不依赖 `backend` 模块的业务代码
  - **示例**:
    - ❌ 错误：Admin 调用 `backend` 的 `SkillController`
    - ✅ 正确：在 `admin/backend` 中创建 `AdminSkillController`，独立实现技能管理接口

- **业务逻辑隔离原则**: ⭐ **各项目业务逻辑独立，不共享到 shared 模块**
  - **核心原则**: 
    - ❌ **业务逻辑不共享**: 各项目（main、admin、edu 等）的业务逻辑必须独立实现，不得将业务逻辑转移到 `shared/backend` 或 `shared/frontend` 中
    - ❌ **Admin 模块不与其他项目共享**: Admin 模块的业务逻辑必须独立，即使操作相同的数据库表，也应各自实现 Service、Controller、Repository
    - ✅ **按需各自提供服务**: 如果各项目确实需要相同的功能，应在各自项目中独立实现，而不是共享业务逻辑
  - **实现要求**:
    - 即使操作相同的数据库表，各项目也应独立定义实体类、Repository、Service、Controller
    - 各项目的业务逻辑根据自身需求实现，可以有不同的业务规则和接口设计
    - 不依赖其他项目的业务代码，保持项目间完全独立
  - **实体类处理**:
    - 即使实体类代码完全相同，也应分别在各自项目中定义，不共享到 `shared/backend`
    - 实体类属于项目的一部分，即使结构相同，但业务上下文和使用场景不同
  - **示例**:
    - ❌ 错误：将 `ResourcePoolService` 共享到 `shared/backend`，让 main 和 admin 共同使用
    - ❌ 错误：将实体类 `ResourcePoolRecharge` 共享到 `shared/backend`，让多个项目引用
    - ✅ 正确：main 和 admin 各自定义 `ResourcePoolRecharge` 实体类，各自实现 `ResourcePoolService`，各自提供管理接口
    - ✅ 正确：即使实体类代码相同，也应在各自项目中维护，保持项目独立性

#### 公共项目（Shared Module）架构
- **职能定位**: ⭐ **定义公共数据类型和公用前端组件，不包含业务逻辑实现**
  - **公共数据类型定义**: 
    - 后端: 定义公共 DTO（`ApiResponse<T>`、`PageResponse<T>`等）、公共实体类、公共枚举类型
    - 前端: 定义公共 TypeScript 类型（`ApiResponse<T>`、`BaseEntity`等）、公共接口类型
    - 跨平台类型: 确保前后端类型定义一致，使用代码生成或类型共享机制
  - **公用前端组件定义**: 
    - 定义可复用的前端组件（如 Button、Input、Card 等基础组件）
    - 组件应该是纯展示组件或基础交互组件，不包含业务逻辑
    - 组件应该支持样式定制和功能扩展
    - 组件应该遵循项目的 UX 设计规范
  - **项目间通信方式**: 
    - **当前架构**: 项目间通过 HTTP 调用进行通信，不需要将接口定义到公共模块中
    - **接口定义位置**: 各产品项目的接口定义应该放在各自的项目中（如 `main/backend/` 或 `main/frontend/services/api/`）
    - **远程调用**: 其他产品通过 HTTP 调用访问目标产品的 RESTful API，使用标准的 HTTP 方法（GET、POST、PUT、DELETE等）
    - **接口契约**: 接口的请求参数、响应类型、错误码等应该在各产品的 API 文档中定义（如使用 Swagger/OpenAPI）
    - **未来扩展**: 如果未来采用微服务架构，可以考虑将接口定义迁移到公共模块
  - **禁止包含业务逻辑**: 
    - ❌ 禁止在公共项目中实现任何业务逻辑
    - ❌ 禁止在公共项目中包含业务特定的配置
    - ❌ 禁止在公共项目中依赖业务模块的代码
    - ❌ 禁止在公共项目中定义远程调用接口（当前架构下）
    - ✅ 允许定义数据类型和枚举
    - ✅ 允许提供基础工具类和工具函数（不含业务逻辑）
    - ✅ 允许提供公共配置模板和常量定义
    - ✅ 允许定义公用的前端组件
  - **使用示例**:
    - **AIService 实现示例**: 
      - 在 `shared/backend` 中**不定义** `AIService` 接口，因为这是业务接口
      - 在 `shared/frontend` 中**不定义** AIService 的接口类型，因为各产品可能有不同的实现
      - 在心域客户端（heartsphere-client）中实现 `AIService` 并提供 RESTful API（如 `/api/v1/ai/generate-text`）
      - 其他产品（mentis、edu）通过 HTTP 调用访问心域客户端的 AIService API，接口定义在各产品的 API 文档中
      - 如果需要共享 AI 相关的数据类型（如 `GenerateTextRequest`、`GenerateTextResponse`），可以在 `shared/backend/dto/` 和 `shared/frontend/types/` 中定义
    - **数据模型定义**: 
      - 在 `shared/backend` 中定义公共实体类（如 `User`、`Character`、`Scene`）
      - 在 `shared/frontend` 中定义对应的 TypeScript 类型
      - 各产品项目引用这些类型定义，确保数据模型一致性
    - **公用前端组件**:
      - 在 `shared/frontend/components/` 中定义可复用的基础组件（如 `Button`、`Input`、`Modal` 等）
      - 各产品项目通过 npm workspace 或 Git Submodule 引用这些组件
      - 组件应该提供样式定制能力，适配不同产品的 UI 风格
  - **代码组织**:
    - 后端: `shared/backend/src/main/java/com/heartsphere/shared/`
      - `dto/` - 公共 DTO 定义（请求/响应数据类型）
      - `entity/` - 公共实体类定义
      - `exception/` - 公共异常类
      - `util/` - 公共工具类（不含业务逻辑）
      - `config/` - 公共配置类
      - ❌ **不包含**: `service/`（服务接口定义）、`api/`（远程调用接口定义）
    - 前端: `shared/frontend/src/`
      - `types/` - 公共 TypeScript 类型定义
      - `components/` - 公用前端组件（基础组件、展示组件）
      - `utils/` - 公共工具函数（不含业务逻辑）
      - `constants/` - 公共常量定义
      - ❌ **不包含**: `interfaces/`（服务接口类型定义）、`api-contracts/`（远程调用接口契约定义）
  - **版本管理**:
    - 使用语义化版本管理（Semantic Versioning）
    - 向后兼容变更：增加可选字段、增加新的公共类型、增加新的公用组件
    - 破坏性变更：删除字段、修改必需字段类型、删除公共类型、删除公用组件
    - 破坏性变更需要主版本号升级，并提供迁移指南

**参考文档**：详细架构设计请参考 `docs/12-开发指南/开发规范/心域开发指南.md` 第3节，公共模块文档请参考 `shared/README.md`

### UX Design Guidelines ⭐

**重要**: 所有页面开发必须遵循UX设计规范，确保设计一致性和用户体验。

#### 设计风格定位
- **科技感**: 使用渐变、光效、现代字体，体现未来感
- **扁平化**: 简化视觉层次，提高可读性和性能
- **温馨**: 使用柔和色彩和圆角，营造温暖友好的氛围

#### 多风格支持 ⭐
- **主题系统**: ⭐ **main 项目 UI 设计必须支持多风格（主题/皮肤）切换**
  - **实现方式**: 使用 CSS 变量（CSS Custom Properties）实现动态主题切换
  - **主题管理**: 通过 React Context API 管理主题状态，使用 localStorage 持久化用户偏好
  - **主题定义**: 每个主题包含完整的颜色、阴影、圆角、渐变等设计令牌（Design Tokens）
  - **平台支持**: PC 端和 Mobile 端都必须支持主题切换
  - **默认主题**: 保持"科技风格"（Tech Style）作为默认主题，确保向后兼容
  - **主题扩展**: 支持添加新主题，如"海天宁静"（Serene Horizon）等
  - **实现要求**:
    - ✅ 所有颜色值必须使用 CSS 变量（`var(--color-name)`），禁止硬编码颜色
    - ✅ 所有组件必须使用主题变量，确保主题切换时正确更新
    - ✅ 渐变、阴影、圆角等设计属性也应通过 CSS 变量定义
    - ✅ 移动端特殊效果（云纹背景、星空背景等）应支持主题切换
    - ✅ 主题切换应平滑过渡，使用 CSS transition 实现动画效果
    - ✅ 主题选择器应在设置界面中提供，PC 和 Mobile 端都应支持
  - **技术实现**:
    - 主题定义文件: `main/frontend/src/themes/` 目录下定义各主题的设计令牌
    - CSS 变量文件: `main/frontend/src/tokens.css` 中定义所有主题的 CSS 变量
    - 主题上下文: `main/frontend/contexts/ThemeContext.tsx` 提供主题管理功能
    - 主题选择器: PC 端使用 `components/ThemeSelector.tsx`，Mobile 端使用 `mobile/components/MobileThemeSelector.tsx`
  - **迁移要求**:
    - 现有组件应逐步迁移到使用 CSS 变量，替换硬编码的颜色值
    - 新开发的组件必须从一开始就使用主题变量
    - 迁移优先级: 入口页面 → 主要功能页面 → 辅助组件 → 模态框
  - **参考文档**: 详细实现请参考 `openspec/changes/add-theme-skin-management-system/` 目录下的设计文档和实现报告

#### 规范内容
- **色彩系统**: 主色、辅助色、语义色、渐变色规范（通过主题系统实现）
- **字体系统**: 字体族、字号、字重、行高规范
- **间距系统**: 8px基准，统一间距等级
- **组件设计**: 按钮、表单、卡片、导航等组件规范（支持主题切换）
- **交互设计**: 动画、反馈、状态规范
- **PC端规范**: 布局、导航、响应式、键盘操作
- **Mobile端规范**: 触摸优化、手势、底部导航、安全区域
- **无障碍设计**: WCAG AA标准、键盘导航、屏幕阅读器支持

#### 开发要求
- **必须遵循**: 所有新页面和组件必须符合UX设计规范
- **主题支持**: ⭐ **所有新组件必须使用 CSS 变量，支持主题切换**
- **代码审查**: 代码审查时检查是否符合UX规范和主题系统要求
- **Tailwind CSS**: 使用规范中提供的Tailwind CSS类名，结合 CSS 变量实现主题支持
- **渐进改进**: 现有页面逐步改进以符合规范和主题系统

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

#### API 和 web 测试用例方案 ⭐
项目遵循统一的「API 和 web 测试用例方案」，创建提案或编写测试时按以下约定执行；细则见下方「提案与前端自动化测试」「关键 API 自动化测试资产位置」。

| 维度 | Web 方案 | API 方案 |
|------|----------|----------|
| **触发条件** | 提案涉及前端页面功能 | 关键 API 模块需提供/维护自动化测试 |
| **执行技能** | web-automation-testing | api-automation-testing |
| **统一流程** | 先对目标模块/功能点进行需求分析，再围绕需求编写用例 | 同上 |
| **资产存放** | 对应前端项目 `e2e/<feature>/`（如 `admin/frontend/e2e/<feature>/`、`main/frontend/e2e/<feature>/`） | 对应后端项目 `api-tests/<feature>/`（如 `main/backend/api-tests/<feature>/`、`admin/backend/api-tests/<feature>/`） |
| **失败处理** | 失败即终止，结果交 Agent 修复后由 Agent 再次发起测试 | 查看后台日志 → 交 Agent 修复 → 使用 `scripts/start/` 下对应脚本重启后台 → Agent 再次发起测试直至通过 |

详见下方「提案与前端自动化测试」「关键 API 自动化测试资产位置」。

#### 提案与自动化测试任务 ⭐
- **规范**: 编写 OpenSpec 提案时，提案的**任务列表**中必须根据开发范围包含以下测试方案任务：
  - **涉及 API 开发时**：须列出「创建 API 自动化测试方案」的任务。
  - **涉及 Web 页面开发时**：须列出「创建 Web 自动化测试方案」的任务。

#### 提案与前端自动化测试 ⭐
- **规范**: 创建 OpenSpec 提案时，若变更**涉及前端页面功能**，提案中**必须提供自动化测试方案**（见上「提案与自动化测试任务」：须在任务列表中列出创建 Web 自动化测试方案的任务）。
- **执行**: 该方案由 **web-automation-testing** 技能完成（编写测试计划、执行、失败交 Agent 修复、扩展直至模块功能全覆盖）。技能执行时**先对目标模块/功能点进行需求分析，再围绕需求开展用例编写**，与技能内的「编写用例流程」保持一致。
- **存放位置**: 测试方案资产（test_plan.json、README、报告等）保存在**对应前端项目下的专有目录**（如 `admin/frontend/e2e/<feature>/`、`main/frontend/e2e/<feature>/`），不放在项目根或与前端分离的通用 e2e 根目录。

#### 关键 API 自动化测试资产位置 ⭐
- **规范**: 提案涉及 API 开发时，须在提案任务列表中列出「创建 API 自动化测试方案」的任务（见上「提案与自动化测试任务」）。关键 API 模块的自动化测试计划与用例由 **api-automation-testing** 技能执行与维护；编写时**先对目标 API 模块进行需求分析，再围绕需求编写用例**。
- **存放位置**: 测试资产（api_test_plan.json、README、results.json、report、agent_failure_summary.md、test_run_state.json）存放在**对应后端项目下的专有目录**，例如：
  - Main 技能执行：`main/backend/api-tests/skill-execution/`
  - Admin 技能管理：`admin/backend/api-tests/skills/`
- **执行与失败处理**: 使用 `.claude/skills/api-automation-testing/scripts/api_test_executor.py` 执行计划；失败时按技能约定查看后台日志、交 Agent 修复并执行 `scripts/start/` 下对应脚本重启后再测。详见 api-automation-testing 技能文档。

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
  - **字符集要求**: ⭐ 所有数据库表必须使用 `utf8mb4` 字符集和 `utf8mb4_unicode_ci` 排序规则
  - **连接配置**: JDBC连接URL必须包含 `useUnicode=true&characterEncoding=UTF-8&connectionCollation=utf8mb4_unicode_ci`
- **API响应编码**: ⭐ 所有API响应必须使用 UTF-8 编码
  - **Content-Type**: 必须设置为 `application/json;charset=UTF-8`
  - **配置要求**: Spring Boot应用必须配置HTTP响应编码为UTF-8（在 `application.yml` 中配置 `server.servlet.encoding.charset=UTF-8`）
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

### 开发约束
- **编译和启动问题处理**: ⭐ **禁止简单注释或删除代码以解决编译/启动问题**
  - **问题分析**: 遇到编译或启动失败时，必须首先分析问题的根本原因（依赖缺失、版本冲突、配置错误、代码错误等）
  - **解决方案**: 根据问题分析，给出具体的解决方案（更新依赖、修复配置、修正代码、添加缺失文件等）
  - **修改尝试**: 按照解决方案进行修改尝试，每次修改后验证是否解决问题
  - **多次尝试**: 如果第一次修改未成功，分析新的错误信息，调整方案继续尝试（最多尝试3次）
  - **停止条件**: 如果经过3次修改尝试仍未成功，**停止修改**，保留当前状态，并给出完整的：
    - 问题描述（错误日志、堆栈跟踪等）
    - 已尝试的解决方案（列出每次尝试的方法和结果）
    - 建议的后续方案（需要开发者决策的选项）
    - 风险评估（如果采用某种方案的潜在风险）
  - **禁止行为**: 
    - ❌ 禁止直接注释掉报错的代码
    - ❌ 禁止删除报错的文件
    - ❌ 禁止随意修改版本号
    - ❌ 禁止在未理解问题的情况下修改代码
  - **允许行为**: 
    - ✅ 分析错误日志和堆栈跟踪
    - ✅ 检查依赖版本兼容性
    - ✅ 查阅官方文档和已知问题
    - ✅ 修复代码逻辑错误
    - ✅ 添加缺失的依赖或配置

**参考文档**：详细约束请参考 `docs/12-开发指南/开发规范/心域开发指南.md` 第7.4节（安全规范）

## External Dependencies

### 数据库
- **MySQL 8.0+**: 主数据库，存储业务数据
- **字符集**: ⭐ **utf8mb4**（支持完整的UTF-8字符，包括emoji和特殊字符）
  - **表字符集**: 所有表必须使用 `utf8mb4` 字符集
  - **排序规则**: 推荐使用 `utf8mb4_unicode_ci`
  - **连接配置**: JDBC连接URL必须包含 `useUnicode=true&characterEncoding=UTF-8&connectionCollation=utf8mb4_unicode_ci`

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

**参考文档**：详细依赖信息请参考 `main/backend/pom.xml` 和 `main/frontend/package.json`

---

**最后更新**: 2025-01-09  
**参考文档**: `docs/12-开发指南/开发规范/心域开发指南.md`  
**维护者**: HeartSphere开发团队

---

## 更新日志

### 2025-01-29
- 添加 **提案与自动化测试任务** 规则：提案涉及 API 开发时须在任务列表中列出「创建 API 自动化测试方案」的任务；涉及 Web 页面开发时须列出「创建 Web 自动化测试方案」的任务

### 2025-01-09
- 添加 **API URL 定义标准**，明确前后端路径定义规范，避免 URL 路径重复问题
