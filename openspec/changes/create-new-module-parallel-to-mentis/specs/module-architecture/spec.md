## ADDED Requirements

### Requirement: 新模块目录结构
系统 SHALL 提供新模块的完整目录结构，包括后端和前端服务。

#### Scenario: 创建模块根目录
- **WHEN** 创建智能体意识模块时
- **THEN** 系统创建 `agent-mind/` 根目录
- **AND** 系统创建 `backend/` 子目录用于后端服务
- **AND** 系统创建 `frontend/` 子目录用于前端服务
- **AND** 系统创建 `README.md` 文件用于模块说明

#### Scenario: 创建后端目录结构
- **WHEN** 创建智能体意识模块的后端服务时
- **THEN** 系统创建 `backend/src/main/java/com/heartsphere/agentmind/` 目录结构
- **AND** 系统创建 `controller/`、`service/`、`entity/`、`repository/`、`dto/`、`config/` 等子目录
- **AND** 系统创建 `backend/src/main/resources/` 目录用于配置文件
- **AND** 系统创建 `backend/src/main/resources/db/migration/` 目录用于数据库迁移脚本
- **AND** 系统创建 `backend/src/test/` 目录用于测试代码

#### Scenario: 创建前端目录结构
- **WHEN** 创建新模块的前端服务时
- **THEN** 系统创建 `frontend/src/` 目录结构
- **AND** 系统创建 `components/`、`pages/`、`services/`、`types/`、`utils/`、`hooks/` 等子目录
- **AND** 系统创建 `frontend/public/` 目录用于静态资源

### Requirement: 后端服务框架
系统 SHALL 提供完整的 Spring Boot 后端服务框架。

#### Scenario: 创建主应用类
- **WHEN** 创建智能体意识模块的后端服务时
- **THEN** 系统创建 `AgentMindApplication.java` 主应用类
- **AND** 主应用类使用 `@SpringBootApplication` 注解
- **AND** 主应用类配置正确的包扫描路径

#### Scenario: 配置 Maven 依赖
- **WHEN** 创建新模块的后端服务时
- **THEN** 系统创建 `backend/pom.xml` 文件
- **AND** pom.xml 包含 Spring Boot 3.2.0 依赖
- **AND** pom.xml 包含 Spring Data JPA 依赖
- **AND** pom.xml 包含 MySQL 驱动依赖
- **AND** pom.xml 包含 Flyway 依赖
- **AND** pom.xml 包含 Shared Backend Module 依赖
- **AND** pom.xml 包含 SpringDoc OpenAPI (Swagger) 依赖

#### Scenario: 配置应用属性
- **WHEN** 创建新模块的后端服务时
- **THEN** 系统创建 `backend/src/main/resources/application.yml` 文件
- **AND** 配置文件包含服务器端口配置（默认 8086）
- **AND** 配置文件包含应用名称配置
- **AND** 配置文件包含数据库连接配置
- **AND** 配置文件包含 JPA 配置
- **AND** 配置文件包含 Flyway 配置
- **AND** 配置文件包含日志配置

#### Scenario: 创建基础配置类
- **WHEN** 创建新模块的后端服务时
- **THEN** 系统创建 `WebConfig.java` 配置类用于 Web 配置（CORS、编码等）
- **AND** 系统创建 `SwaggerConfig.java` 配置类用于 API 文档配置（可选）

#### Scenario: 创建健康检查接口
- **WHEN** 创建新模块的后端服务时
- **THEN** 系统创建 `HealthController.java` 提供健康检查接口
- **AND** 健康检查接口返回服务状态信息
- **AND** 健康检查接口路径为 `/api/<module-name>/health`

### Requirement: 前端服务框架
系统 SHALL 提供完整的 React + TypeScript + Vite 前端服务框架。

#### Scenario: 配置 npm 依赖
- **WHEN** 创建新模块的前端服务时
- **THEN** 系统创建 `frontend/package.json` 文件
- **AND** package.json 包含 React 18+ 依赖
- **AND** package.json 包含 TypeScript 5.8+ 依赖
- **AND** package.json 包含 Vite 5.0+ 依赖
- **AND** package.json 包含 React Router 依赖
- **AND** package.json 包含 Axios 依赖
- **AND** package.json 包含 Shared Frontend Module 依赖

#### Scenario: 配置 Vite
- **WHEN** 创建新模块的前端服务时
- **THEN** 系统创建 `frontend/vite.config.ts` 文件
- **AND** Vite 配置包含开发服务器端口配置（默认 3008）
- **AND** Vite 配置包含代理设置（如果需要）
- **AND** Vite 配置包含构建选项

#### Scenario: 配置 TypeScript
- **WHEN** 创建新模块的前端服务时
- **THEN** 系统创建 `frontend/tsconfig.json` 文件
- **AND** TypeScript 配置启用 strict mode
- **AND** TypeScript 配置包含正确的编译选项
- **AND** 系统创建 `frontend/tsconfig.node.json` 文件用于 Vite 配置

#### Scenario: 创建基础文件
- **WHEN** 创建新模块的前端服务时
- **THEN** 系统创建 `frontend/index.html` 文件
- **AND** 系统创建 `frontend/src/main.tsx` 文件作为入口文件
- **AND** 系统创建 `frontend/src/App.tsx` 文件作为主组件
- **AND** 系统创建 `frontend/src/index.css` 文件用于全局样式
- **AND** 系统创建 `frontend/src/vite-env.d.ts` 文件用于类型定义

#### Scenario: 创建基础组件
- **WHEN** 创建新模块的前端服务时
- **THEN** 系统创建 `frontend/src/components/Layout.tsx` 布局组件
- **AND** 系统创建基础页面组件（根据业务需求）

#### Scenario: 创建 API 服务
- **WHEN** 创建新模块的前端服务时
- **THEN** 系统创建 `frontend/src/services/api/client.ts` API 客户端
- **AND** API 客户端配置基础 URL
- **AND** API 客户端配置请求拦截器（认证、错误处理等）

### Requirement: 端口配置
系统 SHALL 为新模块分配独立的端口，避免与其他模块冲突。

#### Scenario: 后端端口配置
- **WHEN** 创建新模块时
- **THEN** 系统为后端服务分配端口 8086（默认）
- **AND** 端口可以通过配置文件或环境变量自定义
- **AND** 端口不与其他模块冲突

#### Scenario: 前端端口配置
- **WHEN** 创建新模块时
- **THEN** 系统为前端服务分配端口 3008（默认）
- **AND** 端口可以通过配置文件或环境变量自定义
- **AND** 端口不与其他模块冲突

### Requirement: 数据库配置
系统 SHALL 支持独立数据库或共享数据库两种模式。

#### Scenario: 独立数据库模式
- **WHEN** 智能体意识模块使用独立数据库时
- **THEN** 系统创建独立的数据库 `heartsphere_agent_mind`
- **AND** 数据库使用 utf8mb4 字符集
- **AND** 数据库使用 utf8mb4_unicode_ci 排序规则
- **AND** 数据库连接配置在 application.yml 中

#### Scenario: 共享数据库模式
- **WHEN** 新模块使用共享数据库时
- **THEN** 系统使用现有的共享数据库（如：`heartsphere`）
- **AND** 数据库连接配置在 application.yml 中
- **AND** 表名使用模块前缀避免冲突（如：`<module_name>_*`）

### Requirement: API 路径前缀
系统 SHALL 为新模块的 API 使用统一的路径前缀。

#### Scenario: API 路径配置
- **WHEN** 创建智能体意识模块的 API 接口时
- **THEN** 系统使用 `/api/agent-mind/` 作为 API 路径前缀
- **AND** 健康检查接口路径为 `/api/agent-mind/health`
- **AND** 其他 API 接口遵循相同的路径前缀规范

### Requirement: 文档
系统 SHALL 为新模块提供完整的文档。

#### Scenario: README 文档
- **WHEN** 创建新模块时
- **THEN** 系统创建 `README.md` 文件
- **AND** README 包含项目概述
- **AND** README 包含项目结构说明
- **AND** README 包含快速开始指南
- **AND** README 包含技术栈说明
- **AND** README 包含 API 文档链接
- **AND** README 包含开发指南

### Requirement: 依赖管理
系统 SHALL 正确配置模块的依赖关系。

#### Scenario: Shared 模块依赖
- **WHEN** 创建新模块时
- **THEN** 后端依赖 Shared Backend Module
- **AND** 前端依赖 Shared Frontend Module
- **AND** 依赖版本与现有模块保持一致

#### Scenario: 依赖版本一致性
- **WHEN** 创建新模块时
- **THEN** 核心依赖版本与现有模块保持一致
- **AND** Spring Boot 版本为 3.2.0
- **AND** React 版本为 18+
- **AND** TypeScript 版本为 5.8+
- **AND** Vite 版本为 5.0+

### Requirement: 服务可启动性
系统 SHALL 确保新模块的服务可以正常启动和运行。

#### Scenario: 后端服务启动
- **WHEN** 启动新模块的后端服务时
- **THEN** 服务可以正常启动
- **AND** 服务监听配置的端口（默认 8086）
- **AND** 数据库连接正常
- **AND** 健康检查接口可以访问

#### Scenario: 前端服务启动
- **WHEN** 启动新模块的前端服务时
- **THEN** 服务可以正常启动
- **AND** 服务监听配置的端口（默认 3008）
- **AND** 页面可以正常访问
- **AND** API 调用正常（如果有）

#### Scenario: Swagger UI 访问
- **WHEN** 启动新模块的后端服务时
- **THEN** Swagger UI 可以正常访问
- **AND** API 文档正确显示
- **AND** API 接口可以测试
