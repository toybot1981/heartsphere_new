# Change: Separate Education Edition to Independent Client

## Why

当前教育版（edu）版本已经初步创建了独立的前端和后端结构，但存在以下问题需要解决：

1. **代码未完全分离**：`frontend-edu/` 和 `admin-edu/` 目录仍然存在，与 `edu/` 目录存在重复，需要统一到 `edu/` 目录下
2. **admin 模块不完整**：admin 后端中的 edu 管理模块已创建基础结构，但大部分功能还处于待实现状态（UnsupportedOperationException）
3. **架构规划不清晰**：需要基于现有实现和未来数字人在教育领域的应用场景，对 edu 版本进行完整规划
4. **代码复用不明确**：需要明确哪些代码应该独立，哪些可以复用主系统的 shared 模块

**业务价值**：
- 建立完全独立的教育版系统，确保数据隔离和独立部署
- 完善 admin 管理后台的 edu 模块，提供完整的管理能力
- 为未来数字人在教育领域的深度应用奠定架构基础
- 支持教育版产品的独立迭代和发展

## What Changes

### 核心架构变更

- **MODIFIED**: 统一 edu 目录结构
  - 将 `frontend-edu/` 中的代码迁移或整合到 `edu/frontend/`
  - 将 `admin-edu/` 中的代码迁移或整合到合适的位置（建议整合到 admin/frontend 的 edu 模块中）
  - 清理重复目录，确保只有一个 edu 客户端结构
  - 确保 `edu/backend/` 和 `edu/frontend/` 完全独立

- **MODIFIED**: 完善 admin 后端 edu 管理模块
  - 实现 `AdminEduStudentService` 的所有方法，对接 `edu/backend` 的服务
  - 实现 `AdminEduTeacherService` 的所有方法，包括教师审核、权限管理
  - 实现 `AdminEduContentService` 的内容审核和管理功能
  - 实现 `AdminEduAnalyticsService` 的数据分析功能，对接 edu 后端数据
  - 添加必要的 DTO 和实体映射
  - 完善 API 端点，确保与 edu 后端的通信正常

- **ADDED**: 数字人在教育领域的应用规划
  - **AI 教学助手角色**：创建专门用于教学的数字人角色（如数学老师、语文老师、英语外教等）
  - **个性化学习伙伴**：根据学生年龄和兴趣创建个性化的学习伙伴角色
  - **心理辅导数字人**：专门用于学生心理辅导和情绪管理的数字人角色
  - **作业辅导助手**：帮助学生理解题目、提供解题思路的数字人
  - **学科知识讲解**：针对不同学科创建专业的知识讲解角色
  - **互动式学习场景**：基于数字人的互动式学习场景，如历史对话、科学实验等

- **ADDED**: 教育版特有功能模块
  - **年龄分级内容系统**：自动根据学生年龄（6-12岁、13-18岁）过滤和推荐内容
  - **学习进度跟踪**：记录学生在各个场景和角色中的学习进度
  - **数字人教学记录**：记录学生与教学数字人的对话和学习内容
  - **学习成就系统**：基于数字人互动的学习成就和徽章系统
  - **家长监管集成**：家长可以查看孩子与数字人的互动记录和学习情况

### 代码分离策略

- **独立代码**（edu 目录）：
  - 教育版特定的前端页面和组件
  - 教育版特定的后端业务逻辑
  - 教育版特定的数据模型和实体
  - 教育版特定的 API 端点

- **复用代码**（shared 模块）：
  - AI 服务调用（复用主系统的 AI 服务集成）
  - 认证和授权基础逻辑（但使用 edu 特定的角色和权限）
  - 通用工具函数和 DTO
  - 文件上传和存储服务

- **admin 管理模块**：
  - admin/frontend 中创建 edu 管理界面
  - admin/backend 中完善 edu 管理服务，作为 edu 系统的管理入口
  - admin 通过 API 调用 edu/backend 的服务，不直接访问 edu 数据库

### 数据库隔离

- **edu 独立数据库**：使用独立的数据库 `heartsphere_edu`，与主系统完全隔离
- **表结构设计**：
  - `edu_students`：学生信息表
  - `edu_teachers`：教师信息表
  - `edu_parents`：家长信息表
  - `edu_courses`：课程表
  - `edu_homework`：作业表
  - `edu_scenes`：教育场景表（简化版，复用主系统概念）
  - `edu_characters`：教育角色表（包含教学数字人角色）
  - `edu_learning_records`：学习记录表
  - `edu_character_interactions`：数字人互动记录表
  - `edu_achievements`：学习成就表

## Impact

### Affected Specs

- **New capabilities to be created**:
  - `edu-platform-separation`: 教育版平台代码分离规范
  - `admin-edu-management`: Admin 后台教育版管理模块规范
  - `digital-human-education`: 数字人在教育领域的应用规范

- **Modified capabilities**:
  - `education-platform`: 更新教育平台规范，包含数字人应用场景
  - `admin-platform`: 添加 edu 管理模块规范

### Affected Code

#### 目录结构调整

```
edu/
├── frontend/              # 教育版前端（统一从 frontend-edu/ 迁移）
│   ├── src/
│   │   ├── pages/
│   │   │   ├── student/   # 学生端页面
│   │   │   ├── teacher/   # 教师端页面
│   │   │   └── parent/    # 家长端页面
│   │   ├── components/
│   │   │   ├── digital-human/  # 数字人相关组件（新增）
│   │   │   ├── learning/
│   │   │   └── homework/
│   │   └── services/
│   └── package.json
│
├── backend/               # 教育版后端
│   ├── src/main/java/com/heartsphere/edu/
│   │   ├── controller/
│   │   ├── service/
│   │   │   ├── digitalhuman/  # 数字人服务（新增）
│   │   │   └── ...
│   │   ├── entity/
│   │   │   ├── EduCharacter.java      # 教育角色实体（包含数字人）
│   │   │   ├── EduCharacterInteraction.java  # 数字人互动记录（新增）
│   │   │   └── ...
│   │   └── ...
│   └── pom.xml
│
└── README.md

admin/
├── frontend/
│   └── src/
│       └── pages/
│           └── edu/      # Admin edu 管理界面（新增或整合）
│               ├── StudentsManagePage.tsx
│               ├── TeachersManagePage.tsx
│               ├── ContentManagePage.tsx
│               └── AnalyticsPage.tsx
│
└── backend/
    └── src/main/java/com/heartsphere/admin/
        ├── controller/edu/    # 已存在，需要完善
        ├── service/edu/       # 已存在，需要实现所有方法
        └── dto/edu/          # 已存在，可能需要补充
```

#### 需要清理的目录

- `frontend-edu/`：迁移完成后删除或标记为已废弃
- `admin-edu/`：迁移完成后删除或标记为已废弃（代码整合到 admin/frontend）

### New Dependencies

#### 前端（edu/frontend）
- 无新增依赖，继续使用现有技术栈

#### 后端（edu/backend）
- 无新增依赖，继续使用 Spring Boot 3.2.0

#### 后端（admin/backend）
- 可能需要添加 edu 后端服务的客户端（如果使用 Feign 或 RestTemplate）
- 或者直接通过 HTTP 调用 edu 后端的 API

### Storage

- **数据库**:
  - `heartsphere_edu`：独立的 MySQL 数据库
  - 与主系统数据库完全隔离
  - 使用 Flyway 进行数据库版本管理

- **文件存储**:
  - 教育版文件存储路径：`edu/` 前缀
  - 与主系统文件存储隔离

### Deployment

- **独立部署**:
  - edu 前端和后端独立部署
  - admin 可以统一部署，但通过 API 调用 edu 服务
  - 独立的域名和端口配置

- **环境配置**:
  - edu 后端端口：8084（已配置）
  - edu 前端端口：3001（已配置）
  - admin edu 管理通过 admin 后端统一入口

### Security & Compliance

- **数据隔离**:
  - edu 数据库与主系统数据库完全隔离
  - admin 通过 API 访问 edu 数据，不直接访问数据库

- **权限控制**:
  - admin edu 管理模块需要特定的管理员权限
  - edu 系统中的用户数据只有授权的 admin 用户才能访问

## Non-Breaking Changes

这是一个代码重组和完善的变更，不涉及主系统的功能修改：

1. **edu 目录已存在**：只是完善和统一结构
2. **admin edu 模块已存在**：只是实现待实现的方法
3. **不影响主系统**：edu 系统完全独立，主系统不受影响

## Implementation Phases

### Phase 1: 代码整理和迁移（1-2周）
- 统一 edu 目录结构，迁移 frontend-edu 和 admin-edu 的代码
- 清理重复目录
- 确保 edu/frontend 和 edu/backend 可以独立运行

### Phase 2: 完善 admin edu 管理模块（2-3周）
- 实现 AdminEduStudentService 所有方法
- 实现 AdminEduTeacherService 所有方法
- 实现 AdminEduContentService 所有方法
- 实现 AdminEduAnalyticsService 所有方法
- 完善 admin frontend 的 edu 管理界面
- 测试 admin 与 edu 后端的集成

### Phase 3: 数字人教育应用规划（1周）
- 设计数字人教学角色体系
- 设计数字人互动记录数据结构
- 设计学习成就系统
- 编写详细的数字人教育应用方案文档

### Phase 4: 实现数字人教育功能（4-6周）
- 创建教育版数字人角色实体和服务
- 实现数字人互动记录功能
- 实现学习进度跟踪功能
- 实现学习成就系统
- 前端集成数字人相关组件

### Phase 5: 测试和优化（1-2周）
- 端到端测试
- 性能优化
- 安全审计
- 文档完善

**总计预计时间**：9-14周（约2-3.5个月）
