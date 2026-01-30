# Change: 创建智能体意识模块（Agent Mind Module）

## Why

当前 HeartSphere 系统已有多个独立模块（main、mentis、edu、company、admin），每个模块都有独立的业务定位和技术栈。为了支持智能体意识相关的功能开发和实验，需要创建一个与 mentis 并列的智能体意识模块（Agent Mind）。

智能体意识模块将：
1. **独立部署和运行**：拥有独立的后端和前端服务
2. **独立数据库**：可以选择使用独立数据库或共享数据库
3. **独立端口**：拥有独立的端口配置，不与其他模块冲突
4. **遵循项目规范**：遵循 HeartSphere 项目的技术栈和架构规范
5. **可扩展性**：为智能体意识相关功能开发提供基础框架
6. **实验性功能**：支持智能体意识相关的实验和研究功能

## What Changes

### 1. 模块目录结构
- **ADDED**: 创建智能体意识模块目录 `agent-mind/`
  - `backend/` - 后端服务（Spring Boot）
  - `frontend/` - 前端服务（React + TypeScript + Vite）
  - `README.md` - 模块说明文档

### 2. 后端服务框架
- **ADDED**: Spring Boot 应用结构
  - `src/main/java/com/heartsphere/agentmind/` - 主包结构
  - `src/main/java/com/heartsphere/agentmind/AgentMindApplication.java` - 主应用类
  - `src/main/java/com/heartsphere/agentmind/controller/` - REST API 控制器
  - `src/main/java/com/heartsphere/agentmind/service/` - 业务服务层
  - `src/main/java/com/heartsphere/agentmind/entity/` - 实体类
  - `src/main/java/com/heartsphere/agentmind/repository/` - 数据访问层
  - `src/main/java/com/heartsphere/agentmind/dto/` - 数据传输对象
  - `src/main/java/com/heartsphere/agentmind/config/` - 配置类
  - `src/main/resources/application.yml` - 应用配置文件
  - `src/main/resources/db/migration/` - Flyway 数据库迁移脚本目录
  - `pom.xml` - Maven 依赖配置

### 3. 前端服务框架
- **ADDED**: React + TypeScript + Vite 应用结构
  - `src/` - 源代码目录
  - `src/components/` - React 组件
  - `src/pages/` - 页面组件
  - `src/services/` - API 服务
  - `src/types/` - TypeScript 类型定义
  - `src/utils/` - 工具函数
  - `src/hooks/` - React Hooks
  - `package.json` - npm 依赖配置
  - `vite.config.ts` - Vite 配置
  - `tsconfig.json` - TypeScript 配置
  - `tailwind.config.js` - Tailwind CSS 配置（可选）

### 4. 配置文件
- **ADDED**: 后端配置文件
  - 端口配置（默认 8086，可自定义）
  - 数据库连接配置
  - JPA 配置
  - Flyway 配置
  - 日志配置
- **ADDED**: 前端配置文件
  - Vite 开发服务器配置
  - API 基础 URL 配置
  - 环境变量配置

### 5. 依赖配置
- **ADDED**: Maven 依赖（后端）
  - Spring Boot 3.2.0
  - Spring Data JPA
  - MySQL 驱动
  - Flyway
  - Shared Backend Module
  - SpringDoc OpenAPI (Swagger)
- **ADDED**: npm 依赖（前端）
  - React 18+
  - TypeScript 5.8+
  - Vite 5.0+
  - Shared Frontend Module
  - 其他必要的依赖

### 6. 文档
- **ADDED**: README.md - 模块说明文档
  - 项目结构说明
  - 快速开始指南
  - 技术栈说明
  - API 文档链接
  - 开发指南

## Impact

- **Affected specs**: 
  - 新增 `module-architecture` 能力规范（模块架构规范）
- **Affected code**: 
  - 新增 `agent-mind/` 目录及其所有内容
  - 可能需要更新部署脚本（如果有）
  - 可能需要更新 Nginx 配置（如果有）
- **Database**: 
  - 可能需要创建新的数据库（如果使用独立数据库，建议：`heartsphere_agent_mind`）
  - 或使用现有的共享数据库（`heartsphere`）
- **Ports**: 
  - 后端端口：8086（默认，可自定义）
  - 前端端口：3008（默认，可自定义）
- **Dependencies**: 
  - 依赖 Shared Backend Module
  - 依赖 Shared Frontend Module

## Design Principles

1. **独立性**：新模块应该完全独立，不依赖其他业务模块
2. **一致性**：遵循项目现有的技术栈和架构模式
3. **可扩展性**：为后续功能开发提供良好的基础
4. **可维护性**：代码结构清晰，易于理解和维护
5. **文档完善**：提供完整的文档，便于开发和部署

## Implementation Strategy

采用分步骤实施：
1. **第一步**：创建目录结构和基础文件（1天）
2. **第二步**：配置后端服务框架（1天）
3. **第三步**：配置前端服务框架（1天）
4. **第四步**：编写文档和测试（1天）

总计预计 4 个工作日。

## Module Information

### 模块名称
- **中文名称**：智能体意识模块
- **英文名称**：Agent Mind Module
- **目录名称**：`agent-mind`
- **包名**：`com.heartsphere.agentmind`

### 模块定位
智能体意识模块是一个独立的实验性模块，专注于智能体意识相关功能的开发和实验。该模块将支持：
- 智能体自我认知功能
- 智能体意识状态监控
- 智能体意识发展实验
- 意识相关的数据分析和可视化

### 数据库策略
建议使用独立数据库 `heartsphere_agent_mind`，以便：
- 独立管理意识相关的数据
- 支持实验性功能的数据隔离
- 便于数据分析和研究

## Open Questions

1. **数据库策略**：确认使用独立数据库还是共享数据库？
2. **端口配置**：后端和前端端口是否需要自定义？
3. **功能优先级**：哪些意识相关功能需要优先实现？
4. **与主模块集成**：是否需要与 main 模块的角色系统集成？
