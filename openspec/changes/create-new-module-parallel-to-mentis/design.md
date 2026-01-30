# 新模块架构设计

## Context

HeartSphere 系统采用多模块架构，每个模块都是独立的服务，拥有独立的后端和前端。现有模块包括：
- **main**: 主客户端（端口：8081/3000）
- **mentis**: 超级智能体模块（端口：8082/3002）
- **edu**: 教育版模块（端口：8084/3001）
- **company**: 公司官网模块（端口：8083/3003）
- **admin**: 管理后台模块（端口：8085/3005）

新模块需要遵循相同的架构模式和技术栈，确保系统的一致性和可维护性。

## Goals / Non-Goals

### Goals
- 创建与 mentis 并列的独立模块
- 遵循项目现有的技术栈和架构模式
- 提供完整的前后端框架
- 支持独立部署和运行
- 为后续功能开发提供基础

### Non-Goals
- 不实现具体的业务功能（需要后续定义）
- 不修改现有模块的代码
- 不创建新的共享模块

## Decisions

### Decision 1: 模块命名规范
**What**: 使用小写字母和连字符的模块名称：`agent-mind`
**Why**: 
- 与现有模块命名保持一致（mentis、edu、company 都是小写）
- 简洁直观（mind = 心智/意识）
- 便于目录和文件命名
- 符合 URL 和目录命名规范
- Java 包名使用 `agentmind`（去掉连字符）

**Alternatives considered**:
- 使用驼峰命名：不符合现有模块命名风格
- 使用连字符：在 Java 包名中不常用

### Decision 2: 端口分配策略
**What**: 使用递增的端口号，避免冲突
**Why**:
- 现有端口分配：main(8081/3000), mentis(8082/3002), company(8083/3003), edu(8084/3001), admin(8085/3005)
- 新模块使用：后端 8086，前端 3008
- 便于管理和记忆

**Alternatives considered**:
- 使用随机端口：不便于管理和配置
- 使用环境变量：增加配置复杂度

### Decision 3: 数据库策略
**What**: 支持独立数据库或共享数据库两种模式
**Why**:
- 灵活性：根据业务需求选择
- 独立性：独立数据库提供更好的隔离
- 共享性：共享数据库便于数据关联

**Alternatives considered**:
- 强制独立数据库：可能增加运维复杂度
- 强制共享数据库：可能影响模块独立性

### Decision 4: 技术栈选择
**What**: 使用与现有模块相同的技术栈
**Why**:
- 保持一致性：便于开发和维护
- 复用经验：团队熟悉现有技术栈
- 共享模块：可以复用 shared 模块

**Alternatives considered**:
- 使用新技术栈：增加学习成本和维护成本
- 部分使用新技术：可能导致不一致

## Architecture

### 模块结构

```
agent-mind/
├── backend/                    # 后端服务
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/heartsphere/agentmind/
│   │   │   │   ├── AgentMindApplication.java
│   │   │   │   ├── controller/     # REST API 控制器
│   │   │   │   ├── service/        # 业务服务层
│   │   │   │   ├── entity/         # 实体类
│   │   │   │   ├── repository/    # 数据访问层
│   │   │   │   ├── dto/            # 数据传输对象
│   │   │   │   └── config/         # 配置类
│   │   │   └── resources/
│   │   │       ├── application.yml
│   │   │       └── db/migration/   # Flyway 迁移脚本
│   │   └── test/                   # 测试代码
│   └── pom.xml                    # Maven 配置
├── frontend/                  # 前端服务
│   ├── src/
│   │   ├── components/         # React 组件
│   │   ├── pages/              # 页面组件
│   │   ├── services/           # API 服务
│   │   ├── types/              # TypeScript 类型
│   │   ├── utils/              # 工具函数
│   │   ├── hooks/              # React Hooks
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
└── README.md                   # 模块说明文档
```

### 技术栈

#### 后端
- **框架**: Spring Boot 3.2.0
- **语言**: Java 17
- **ORM**: Spring Data JPA
- **数据库**: MySQL 8.0+ (utf8mb4)
- **迁移**: Flyway
- **API文档**: SpringDoc OpenAPI (Swagger)
- **构建**: Maven 3.9+

#### 前端
- **框架**: React 18+
- **语言**: TypeScript 5.8+
- **构建**: Vite 5.0+
- **路由**: React Router
- **HTTP**: Axios
- **样式**: Tailwind CSS (可选)
- **状态管理**: React Hooks / Context API

### 端口配置

| 模块 | 后端端口 | 前端端口 |
|------|---------|---------|
| main | 8081 | 3000 |
| mentis | 8082 | 3002 |
| company | 8083 | - |
| edu | 8084 | - |
| **agent-mind** | **8086** | **3008** |

### 数据库配置

#### 选项1：独立数据库（推荐）
```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/heartsphere_agent_mind?useUnicode=true&characterEncoding=UTF-8&useSSL=false&serverTimezone=Asia/Shanghai&connectionCollation=utf8mb4_unicode_ci
```

#### 选项2：共享数据库
```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/heartsphere?useUnicode=true&characterEncoding=UTF-8&useSSL=false&serverTimezone=Asia/Shanghai&connectionCollation=utf8mb4_unicode_ci
```

### API 路径前缀

建议使用 `/api/agent-mind/` 作为 API 路径前缀，例如：
- `/api/agent-mind/health` - 健康检查
- `/api/agent-mind/...` - 其他 API 端点

## Risks / Trade-offs

### Risk 1: 端口冲突
**Mitigation**: 
- 使用递增的端口号
- 在配置文件中明确说明端口
- 支持通过环境变量覆盖端口

### Risk 2: 数据库命名冲突
**Mitigation**:
- 使用模块名称作为数据库名称的一部分
- 在文档中明确说明数据库命名规范

### Risk 3: 依赖版本冲突
**Mitigation**:
- 使用与现有模块相同的依赖版本
- 定期检查和更新依赖版本
- 使用 Maven 依赖管理

### Risk 4: 代码重复
**Mitigation**:
- 使用 shared 模块共享通用代码
- 遵循 DRY 原则
- 定期重构和提取公共代码

## Migration Plan

### 创建步骤
1. 确定模块名称和定位
2. 创建目录结构
3. 配置后端服务
4. 配置前端服务
5. 编写文档
6. 测试和验证

### 后续扩展
1. 根据业务需求添加功能
2. 创建数据库表和实体类
3. 实现业务逻辑
4. 开发前端界面
5. 编写测试用例

## Module Information

### 模块信息
- **中文名称**: 智能体意识模块
- **英文名称**: Agent Mind Module
- **目录名称**: `agent-mind`
- **包名**: `com.heartsphere.agentmind`
- **业务定位**: 智能体意识相关功能的开发和实验

### 数据库策略
建议使用独立数据库 `heartsphere_agent_mind`，以便：
- 独立管理意识相关的数据
- 支持实验性功能的数据隔离
- 便于数据分析和研究

## Open Questions

1. **功能优先级**: 哪些意识相关功能需要优先实现？
2. **与主模块集成**: 是否需要与 main 模块的角色系统集成？
3. **认证策略**: 是否需要集成 JWT 认证？
4. **部署方式**: 是否需要独立的部署脚本？

## Reference

参考现有模块的实现：
- **mentis**: 完整的智能体模块实现
- **edu**: 教育版模块实现
- **company**: 公司官网模块实现

这些模块提供了良好的参考模板，可以借鉴其结构和配置。
