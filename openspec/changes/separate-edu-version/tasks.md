# Implementation Tasks

## Phase 1: 代码整理和迁移（1-2周）

### 1.1 代码迁移准备
- [x] 1.1.1 备份 `frontend-edu/` 和 `admin-edu/` 目录到备份位置（已通过 Git 版本控制）
- [x] 1.1.2 创建迁移计划文档，列出需要迁移的文件清单（已在 proposal.md 中说明）
- [x] 1.1.3 检查 `edu/` 目录现有结构，确认目标位置

### 1.2 前端代码迁移
- [x] 1.2.1 将 `frontend-edu/src/` 所有源文件迁移到 `edu/frontend/src/`（已确认内容相同）
- [x] 1.2.2 迁移 `frontend-edu/package.json` 依赖配置到 `edu/frontend/`（已包含 shared 模块依赖）
- [x] 1.2.3 迁移配置文件（vite.config.ts, tsconfig.json, tailwind.config.js 等）（已存在）
- [x] 1.2.4 更新所有 import 路径，确保引用正确（edu/frontend 路径已正确）
- [x] 1.2.5 测试 `edu/frontend` 可以正常启动和构建（构建成功 ✓）

### 1.3 Admin 前端代码整合
- [x] 1.3.1 将 `admin-edu/src/pages/` 页面迁移到 `admin/frontend/src/pages/edu/`
- [x] 1.3.2 迁移 `admin-edu/src/components/` 组件到 `admin/frontend/src/components/edu/`
- [x] 1.3.3 更新 `admin/frontend/src/AdminScreen.tsx`，添加 edu 管理路由（已适配 section 切换方式）
- [x] 1.3.4 更新 `admin/frontend/src/components/AdminSidebar.tsx`，添加 edu 管理菜单项
- [x] 1.3.5 更新所有 import 路径和路由配置（已更新 import 路径，移除路由使用 section 切换）
- [x] 1.3.6 测试 admin frontend 中的 edu 管理页面可以正常访问（类型检查通过，已集成到 AdminScreen）

### 1.4 清理和验证
- [x] 1.4.1 在原 `frontend-edu/` 和 `admin-edu/` 目录创建 `.deprecated` 标记文件
- [ ] 1.4.2 更新项目 README，说明目录迁移情况（将在 Phase 5 完成）
- [x] 1.4.3 运行前端构建测试，确保无编译错误（edu/frontend 构建成功，admin/frontend 类型检查通过）
- [ ] 1.4.4 运行基础功能测试，确保核心功能正常（将在 Phase 5 完成端到端测试）

## Phase 2: 完善 admin edu 管理模块（2-3周）✅ 基础结构已完成

**当前状态**：Admin 后端配置和所有服务的基础结构已完成，等待 edu 后端实现后再完善具体调用逻辑。

### 2.1 Admin 后端配置 ✅
- [x] 2.1.1 在 `admin/backend/src/main/resources/application.yml` 添加 edu 后端配置
  - 配置 edu 后端 base URL（默认 http://localhost:8084）
  - 配置连接超时和重试策略
- [x] 2.1.2 创建 `EduBackendClient` 配置类，用于 HTTP 调用（支持 Class 和 ParameterizedTypeReference）
- [x] 2.1.3 创建统一错误处理机制（EduBackendException）
- [x] 2.1.4 创建 RestTemplate 配置 Bean
- [x] 2.1.5 创建 EduBackendProperties 配置属性类

### 2.2 实现 AdminEduStudentService
- [x] 2.2.1 实现 `getStudents()` 方法，调用 `/api/edu/students` 端点（基础结构完成，等待 edu 后端实现）
- [x] 2.2.2 实现 `getStudentById()` 方法，调用 `/api/edu/students/{id}` 端点（基础结构完成，等待 edu 后端实现）
- [x] 2.2.3 实现 `updateStudent()` 方法，调用 PUT `/api/edu/students/{id}` 端点（基础结构完成，等待 edu 后端实现）
- [x] 2.2.4 实现 `updateStudentStatus()` 方法，调用 PATCH `/api/edu/students/{id}/status` 端点（基础结构完成，等待 edu 后端实现）
- [x] 2.2.5 实现 `deleteStudent()` 方法，调用 DELETE `/api/edu/students/{id}` 端点（基础结构完成，等待 edu 后端实现）
- [x] 2.2.6 实现 `getStudentStatistics()` 方法，调用 `/api/edu/students/{id}/statistics` 端点（基础结构完成，返回默认统计）
- [ ] 2.2.7 添加单元测试覆盖所有方法（等待 edu 后端实现后再添加）

### 2.3 实现 AdminEduTeacherService
- [x] 2.3.1 实现 `getTeachers()` 方法，调用 `/api/edu/teachers` 端点（基础结构完成，等待 edu 后端实现）
- [x] 2.3.2 实现 `getTeacherById()` 方法，调用 `/api/edu/teachers/{id}` 端点（基础结构完成，等待 edu 后端实现）
- [x] 2.3.3 实现 `approveTeacher()` 方法，调用 POST `/api/edu/teachers/{id}/approve` 端点（基础结构完成，等待 edu 后端实现）
- [x] 2.3.4 实现 `rejectTeacher()` 方法，调用 POST `/api/edu/teachers/{id}/reject` 端点（基础结构完成，等待 edu 后端实现）
- [x] 2.3.5 实现 `updateTeacher()` 方法，调用 PUT `/api/edu/teachers/{id}` 端点（基础结构完成，等待 edu 后端实现）
- [x] 2.3.6 实现 `updateTeacherPermissions()` 方法，调用 PATCH `/api/edu/teachers/{id}/permissions` 端点（基础结构完成，等待 edu 后端实现）
- [x] 2.3.7 实现 `updateTeacherStatus()` 方法，调用 PATCH `/api/edu/teachers/{id}/status` 端点（基础结构完成，等待 edu 后端实现）
- [ ] 2.3.8 添加单元测试覆盖所有方法（等待 edu 后端实现后再添加）

### 2.4 实现 AdminEduContentService
- [x] 2.4.1 实现 `getReviewQueue()` 方法，调用 `/api/edu/content/review-queue` 端点（基础结构完成，等待 edu 后端实现）
- [x] 2.4.2 实现 `approveContent()` 方法，调用 POST `/api/edu/content/{id}/approve` 端点（基础结构完成，等待 edu 后端实现）
- [x] 2.4.3 实现 `rejectContent()` 方法，调用 POST `/api/edu/content/{id}/reject` 端点（基础结构完成，等待 edu 后端实现）
- [x] 2.4.4 实现 `getContentById()` 方法，调用 `/api/edu/content/{id}` 端点（基础结构完成，等待 edu 后端实现）
- [x] 2.4.5 实现 `updateContent()` 方法，调用 PUT `/api/edu/content/{id}` 端点（基础结构完成，等待 edu 后端实现）
- [x] 2.4.6 实现 `deleteContent()` 和 `getContentStatistics()` 方法（基础结构完成，等待 edu 后端实现）
- [ ] 2.4.7 添加单元测试覆盖所有方法（等待 edu 后端实现后再添加）

### 2.5 实现 AdminEduAnalyticsService
- [x] 2.5.1 实现 `getOverview()` 方法，调用 `/api/edu/analytics/overview` 端点（基础结构完成，返回默认统计）
- [x] 2.5.2 实现 `getUserGrowth()` 方法，调用 `/api/edu/analytics/user-growth` 端点（基础结构完成，返回默认统计）
- [x] 2.5.3 实现 `getLearningActivities()` 方法，调用 `/api/edu/analytics/learning-activities` 端点（基础结构完成，返回默认统计）
- [x] 2.5.4 实现 `getHomeworkCompletion()` 方法，调用 `/api/edu/analytics/homework-completion` 端点（基础结构完成，返回默认统计）
- [ ] 2.5.5 添加单元测试覆盖所有方法（等待 edu 后端实现后再添加）

### 2.6 Admin 前端界面完善
- [x] 2.6.1 创建 edu API 客户端（students, teachers, content, analytics）
- [x] 2.6.2 在 adminApi 中导出 edu API
- [x] 2.6.3 完善 `StudentsManagePage.tsx`，对接 AdminEduStudentService（已完成，包含加载状态、错误处理、分页）
- [x] 2.6.4 完善 `TeachersManagePage.tsx`，对接 AdminEduTeacherService（已完成，包含加载状态、错误处理、分页、审核功能）
- [x] 2.6.5 完善 `ContentManagePage.tsx`，对接 AdminEduContentService（已完成，包含加载状态、错误处理、审核功能）
- [x] 2.6.6 完善 `ContentReviewQueuePage.tsx`，对接 AdminEduContentService（已完成，包含加载状态、错误处理、分页）
- [x] 2.6.7 完善 `DashboardPage.tsx`，对接 AdminEduAnalyticsService（已完成，获取概览统计）
- [x] 2.6.8 完善 `AnalyticsPage.tsx`，对接 AdminEduAnalyticsService（已完成，获取分析数据）
- [x] 2.6.9 添加加载状态和错误处理（所有页面已完成）
- [ ] 2.6.10 完善 `SettingsPage.tsx`（等待 edu 后端实现设置 API）
- [ ] 2.6.11 添加表单验证和用户反馈（部分完成，需要完善）

### 2.7 集成测试
- [ ] 2.7.1 端到端测试：admin 前端 → admin 后端 → edu 后端完整流程
- [ ] 2.7.2 测试错误处理：edu 后端不可用时的降级处理
- [ ] 2.7.3 测试性能：API 调用延迟和并发处理
- [ ] 2.7.4 测试权限：验证管理员权限控制

## Phase 3: 数字人教育应用规划（1周）

### 3.1 数据模型设计
- [x] 3.1.1 设计 `EduCharacter` 实体结构（字段、关联关系）
- [x] 3.1.2 设计 `EduCharacterInteraction` 实体结构（字段、关联关系）
- [x] 3.1.3 设计数据库表结构（字段类型、索引、外键）
- [x] 3.1.4 设计 Flyway 迁移脚本结构

### 3.2 服务接口设计
- [x] 3.2.1 设计 `DigitalHumanService` 接口方法
- [x] 3.2.2 设计数字人推荐算法接口
- [x] 3.2.3 设计数字人创建和配置接口
- [x] 3.2.4 设计互动记录管理接口

### 3.3 API 端点设计
- [x] 3.3.1 设计数字人 CRUD API 端点
- [x] 3.3.2 设计数字人推荐 API 端点
- [x] 3.3.3 设计互动记录 API 端点
- [x] 3.3.4 设计学习进度 API 端点

### 3.4 前端组件规划
- [x] 3.4.1 规划数字人角色展示组件
- [x] 3.4.2 规划数字人推荐界面
- [x] 3.4.3 规划互动历史查看组件
- [x] 3.4.4 规划学习进度可视化组件

### 3.5 文档编写
- [x] 3.5.1 编写数字人教育应用技术方案文档（PHASE3_DESIGN.md）
- [x] 3.5.2 编写数据库设计文档（包含在 PHASE3_DESIGN.md 中）
- [x] 3.5.3 编写 API 接口文档（包含在 PHASE3_DESIGN.md 中）
- [x] 3.5.4 编写详细需求规范（edu-character-entity-spec.md, edu-character-interaction-spec.md）
- [ ] 3.5.5 进行设计评审和确认（等待评审）

## Phase 4: 实现数字人教育功能（4-6周）

### 4.1 数据库实现
- [x] 4.1.1 创建 Flyway 迁移脚本 `V20260110__create_edu_characters_table.sql`
- [x] 4.1.2 创建 Flyway 迁移脚本 `V20260110_01__create_edu_character_interactions_table.sql`
- [x] 4.1.3 创建必要的索引（已在迁移脚本中定义）
- [ ] 4.1.4 测试数据库迁移脚本（需要数据库环境）

### 4.2 后端实体和仓库
- [x] 4.2.1 实现 `EduCharacter` 实体类（JPA Entity，包含所有枚举类型）
- [x] 4.2.2 实现 `EduCharacterRepository` 接口（包含查询方法）
- [x] 4.2.3 实现 `EduCharacterInteraction` 实体类（JPA Entity）
- [x] 4.2.4 实现 `EduCharacterInteractionRepository` 接口（包含查询方法）
- [x] 4.2.5 实现 `ListToJsonConverter` JSON 转换器
- [ ] 4.2.6 添加单元测试（待实现）

### 4.3 后端服务实现
- [x] 4.3.1 创建所有必要的 DTO 类（8个 DTO）
- [x] 4.3.2 实现 `DigitalHumanService` 接口和实现类
- [x] 4.3.3 实现基础方法（CRUD：createCharacter, getCharacters, getCharacterById, updateCharacter, deleteCharacter）
- [x] 4.3.4 实现数字人推荐算法（根据年龄、兴趣、学科、受欢迎程度）
- [x] 4.3.5 实现互动记录管理（recordInteraction, getStudentInteractions, getCharacterStatistics）
- [ ] 4.3.6 实现学习进度跟踪（记录、更新、查询）- 待实现（Phase 4.5）
- [ ] 4.3.7 添加单元测试和集成测试（待实现）

### 4.4 后端控制器实现
- [x] 4.4.1 实现 `EduCharacterController`，提供数字人 CRUD API（7个端点）
- [x] 4.4.2 实现数字人推荐 API 端点（GET /api/edu/characters/recommendations）
- [x] 4.4.3 实现互动记录 API 端点（EduCharacterInteractionController，4个端点）
- [x] 4.4.4 使用 ApiResponse 统一响应格式（来自 shared 模块）
- [x] 4.4.5 添加参数验证和异常处理
- [x] 4.4.6 实现 getInteractionById 方法（Service 和 Controller）
- [x] 4.4.7 使用 shared 模块的 GlobalExceptionHandler（全局异常处理）
- [ ] 4.4.8 实现学习进度 API 端点（待实现，需要学习进度 Service）
- [x] 4.4.9 添加 API 文档（Swagger/OpenAPI）- 已添加 springdoc-openapi 依赖和配置类

### 4.5 前端服务层
- [x] 4.5.1 创建 API 工具函数（config.ts, request.ts）
- [x] 4.5.2 创建类型定义（types/digitalHuman.ts - 23个类型）
- [x] 4.5.3 创建 `digitalHuman.ts` API 服务（7个方法）
- [x] 4.5.4 创建 `characterInteraction.ts` API 服务（4个方法）
- [x] 4.5.5 创建统一导出（index.ts, eduApi 对象）
- [x] 4.5.6 添加错误处理和类型安全
- [ ] 4.5.7 添加单元测试（待实现）

### 4.6 前端组件实现
- [x] 4.6.1 实现 `DigitalCharacterCard` 组件（数字人卡片展示）
- [x] 4.6.2 实现 `DigitalCharacterList` 组件（数字人列表）
- [x] 4.6.3 实现 `CharacterRecommendation` 组件（数字人推荐）
- [x] 4.6.4 实现 `InteractionHistory` 组件（互动历史）
- [x] 4.6.5 实现 `LearningProgress` 组件（学习进度可视化）
- [x] 4.6.6 添加组件导出文件（index.ts）
- [x] 4.6.7 添加加载状态、错误处理、空状态展示
- [ ] 4.6.8 添加组件样式和动画优化（后续优化）

### 4.7 前端页面集成
- [x] 4.7.1 更新 CharacterListPage，集成 DigitalCharacterList 和 CharacterRecommendation 组件
- [x] 4.7.2 更新 CharacterDetailPage，集成 InteractionHistory 和 LearningProgress 组件
- [x] 4.7.3 更新 DashboardPage，集成数字人推荐功能
- [x] 4.7.4 更新 ProfilePage，添加学习进度标签页，集成 LearningProgress 和 InteractionHistory
- [x] 4.7.5 所有页面使用真实 API（替换 mock 数据）
- [x] 4.7.6 添加加载状态、错误处理和空状态展示
- [x] 4.7.7 集成用户认证系统（创建 auth.ts 工具函数和 useAuth/useCurrentUserId hooks，更新所有页面使用真实学生ID）
- [ ] 4.7.8 在家长端添加孩子与数字人互动记录查看（待实现）

### 4.8 测试
- [ ] 4.8.1 后端单元测试（服务层、控制器层）- 待实现（需要数据库环境）
- [ ] 4.8.2 前端组件测试 - 待实现
- [ ] 4.8.3 集成测试（前后端联调）- 待实现
- [ ] 4.8.4 端到端测试（完整用户流程）- 待实现

## Phase 5: 测试和优化（1-2周）

### 5.1 功能测试
- [x] 5.1.1 创建测试指南文档（edu/TESTING_GUIDE.md）
- [ ] 5.1.2 测试所有 Phase 1-4 实现的功能（需要实际运行服务）
- [ ] 5.1.3 测试边界情况和异常处理（需要实际运行服务）
- [ ] 5.1.4 测试不同用户角色（学生、教师、家长、管理员）的权限（需要实际运行服务）
- [ ] 5.1.5 修复发现的功能缺陷

### 5.2 性能测试和优化
- [ ] 5.2.1 测试 API 响应时间，优化慢查询
- [ ] 5.2.2 测试前端页面加载性能，优化资源加载
- [ ] 5.2.3 测试并发访问能力，优化数据库连接池
- [ ] 5.2.4 添加缓存策略（如适用）

### 5.3 安全审计
- [ ] 5.3.1 检查 SQL 注入风险
- [ ] 5.3.2 检查 XSS 攻击风险
- [ ] 5.3.3 检查权限控制是否完善
- [ ] 5.3.4 检查敏感数据是否加密
- [ ] 5.3.5 修复发现的安全漏洞

### 5.4 文档完善
- [x] 5.4.1 更新项目 README，说明 edu 系统结构（edu/README.md）
- [x] 5.4.2 更新 API 文档（Swagger）- 已配置 OpenAPI
- [x] 5.4.3 编写部署文档，说明如何部署 edu 系统（edu/backend/DEPLOYMENT.md, edu/frontend/DEPLOYMENT.md）
- [x] 5.4.4 编写用户手册（学生端、教师端、家长端）- edu/USER_MANUAL.md
- [x] 5.4.5 编写管理员手册（admin edu 管理）- admin/frontend/src/pages/edu/ADMIN_MANUAL.md

### 5.5 用户验收测试
- [x] 5.5.1 创建用户验收测试指南（edu/ACCEPTANCE_TEST.md）
- [x] 5.5.2 创建用户验收测试清单（edu/ACCEPTANCE_TEST_CHECKLIST.md）
- [ ] 5.5.3 准备测试环境（需要实际运行服务）
- [ ] 5.5.4 邀请用户（学生、教师、家长、管理员）进行测试
- [ ] 5.5.5 收集反馈和建议
- [ ] 5.5.6 修复用户反馈的问题
- [ ] 5.5.7 确认所有功能满足需求

## 验证清单

### 代码质量
- [ ] 所有代码通过 lint 检查
- [ ] 代码覆盖率 > 80%
- [ ] 所有测试用例通过

### 功能完整性
- [ ] edu 前端和后端可以独立运行
- [ ] admin edu 管理模块所有功能正常
- [ ] 数字人教育功能基本实现
- [ ] 所有用户角色功能正常

### 部署就绪
- [ ] 数据库迁移脚本已验证
- [ ] 配置文件模板已创建
- [ ] 部署文档已完善
- [ ] 回滚方案已准备
