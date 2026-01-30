## 1. 基础框架搭建

- [x] 1.1 创建模块目录结构
  - [x] 1.1.1 创建 `psychology-mentor/` 目录
  - [x] 1.1.2 创建 `psychology-mentor/backend/` 目录
  - [x] 1.1.3 创建 `psychology-mentor/frontend/` 目录
  - [x] 1.1.4 创建 `psychology-mentor/README.md`

- [x] 1.2 配置后端Spring Boot应用
  - [x] 1.2.1 创建 `pom.xml`，配置Maven依赖
  - [x] 1.2.2 创建主应用类 `PsychologyMentorApplication.java`
  - [x] 1.2.3 创建包结构 `com.heartsphere.psychology`
  - [x] 1.2.4 创建 `application.yml` 配置文件
  - [x] 1.2.5 配置端口（8083）、数据库连接等

- [x] 1.3 配置前端React应用
  - [x] 1.3.1 创建 `package.json`，配置npm依赖
  - [x] 1.3.2 创建 `vite.config.ts` 配置文件
  - [x] 1.3.3 创建 `tsconfig.json` TypeScript配置
  - [x] 1.3.4 创建基础目录结构（src/components, src/pages等）
  - [x] 1.3.5 配置开发服务器端口（3003）

- [x] 1.4 配置数据库连接
  - [x] 1.4.1 创建独立数据库 `heartsphere_psychology`（需手动创建）
  - [x] 1.4.2 配置MySQL连接（application.yml）
  - [x] 1.4.3 配置Redis连接（短期记忆）
  - [x] 1.4.4 配置MongoDB连接（长期记忆）

## 2. 数据库设计和迁移

- [x] 2.1 设计数据库表结构
  - [x] 2.1.1 设计 `therapy_methods` 表（疗法定义）
  - [x] 2.1.2 设计 `learning_pathways` 表（学习路径）
  - [x] 2.1.3 设计 `classic_cases` 表（经典案例）
  - [x] 2.1.4 设计 `session_records` 表（会话记录）
  - [x] 2.1.5 设计 `cognitive_distortions` 表（认知扭曲）
  - [x] 2.1.6 设计 `therapy_techniques` 表（治疗技术）
  - [x] 2.1.7 设计关联表（case_techniques, case_measurements, case_tags等）

- [x] 2.2 创建Flyway迁移脚本
  - [x] 2.2.1 创建 `V1__Create_Psychology_Schema.sql`
  - [x] 2.2.2 创建 `V2__Insert_Therapy_Methods.sql`（5种疗法）
  - [x] 2.2.3 创建 `V3__Insert_Learning_Pathways.sql`（学习路径）
  - [x] 2.2.4 创建 `V4__Insert_Clinical_Cases.sql`（5个案例，后续可扩展至17个）
  - [x] 2.2.5 创建 `V5__Insert_Cognitive_Distortions.sql`（12种认知扭曲）
  - [x] 2.2.6 创建 `V6__Insert_Assessment_Measures.sql`（测量量表）

- [ ] 2.3 初始化种子数据
  - [ ] 2.3.1 准备5种疗法的数据（CBT、DBT、ACT、心理动力学、人本主义）
  - [ ] 2.3.2 准备17个临床案例的数据
  - [ ] 2.3.3 准备12种认知扭曲的数据
  - [ ] 2.3.4 准备测量量表数据（BDI-II、GAD-7等）

- [x] 2.4 测试数据库迁移
  - [x] 2.4.1 测试Flyway迁移脚本
  - [x] 2.4.2 验证数据完整性（5种疗法、5个案例、12种认知扭曲）
  - [x] 2.4.3 测试数据库连接

## 3. 后端核心服务实现

- [x] 3.1 实现实体类
  - [x] 3.1.1 实现 `TherapyMethod` 实体
  - [x] 3.1.2 实现 `LearningPathway` 实体
  - [x] 3.1.3 实现 `ClassicCase` 实体
  - [x] 3.1.4 实现 `TherapySession` 实体
  - [x] 3.1.5 实现 `SessionMessage` 实体
  - [ ] 3.1.6 实现其他实体类（CognitiveDistortion、AssessmentMeasure等，后续需要时添加）

- [x] 3.2 实现Repository层
  - [x] 3.2.1 实现 `TherapyMethodRepository`
  - [x] 3.2.2 实现 `TherapySessionRepository`
  - [x] 3.2.3 实现 `ClinicalCaseRepository`
  - [x] 3.2.4 实现 `LearningPathwayRepository` 和 `SessionMessageRepository`

- [x] 3.3 实现Service层
  - [x] 3.3.1 实现 `TherapyMethodService`（疗法管理）
  - [x] 3.3.2 实现 `TherapySessionService`（会话管理，包含会话总结生成）
  - [x] 3.3.3 实现 `ClinicalCaseService`（案例管理）
  - [x] 3.3.4 实现 `PsychologyFactExtractionService`（心理学事实提取）
  - [x] 3.3.5 实现 `KnowledgeBaseService`（知识库服务）
  - [x] 3.3.6 实现 `MemoryService`（记忆系统）
  - [ ] 3.3.7 实现 `UserProfileService`（用户画像，待Phase 4实现）
  - [ ] 3.3.8 实现 `TherapyRecommendationService`（疗法推荐，待Phase 4实现）

- [x] 3.4 实现Controller层（REST API）
  - [x] 3.4.1 实现 `TherapyMethodController`（疗法API）
  - [x] 3.4.2 实现 `TherapySessionController`（会话API）
  - [x] 3.4.3 实现 `ClinicalCaseController`（案例API）
  - [x] 3.4.4 实现 `HealthController`（健康检查接口）
  - [ ] 3.4.5 实现 `UserProfileController`（用户画像API，待Phase 4实现）
  - [ ] 3.4.6 实现 `MindScapeAIController`（AI对话API，待Phase 4实现）

- [x] 3.5 实现DTO类
  - [x] 3.5.1 实现请求DTO（SessionStartRequest、MessageRequest等）
  - [x] 3.5.2 实现响应DTO（TherapyMethodDTO等）
  - [x] 3.5.3 使用统一响应格式（ApiResponse）

## 4. AI功能和知识库

- [x] 4.1 集成AI模型
  - [x] 4.1.1 配置HTTP客户端依赖（使用RestTemplate）
  - [x] 4.1.2 配置通义千问API（DashScope兼容模式）
  - [x] 4.1.3 实现AI服务（AIService）

- [x] 4.2 实现流式对话响应
  - [x] 4.2.1 实现SSE（Server-Sent Events）或WebSocket（使用shared SSE模块）
  - [x] 4.2.2 实现流式响应处理
  - [x] 4.2.3 测试流式响应功能（已通过编译和运行时测试）

- [x] 4.3 实现心理学事实提取
  - [x] 4.3.1 实现基础框架（extractPsychologyFacts方法）
  - [x] 4.3.2 实现情绪模式识别（已完善JSON解析和文本匹配）
  - [x] 4.3.3 实现认知扭曲识别（已完善JSON解析和文本匹配）
  - [x] 4.3.4 实现应对策略识别（已完善JSON解析和文本匹配）
  - [x] 4.3.5 实现触发因素识别（已完善JSON解析和文本匹配）

- [x] 4.4 实现知识库功能
  - [x] 4.4.1 实现知识库生成服务（KnowledgeBaseService）
  - [x] 4.4.2 实现深度学术解析生成（1000+字）
  - [ ] 4.4.3 实现知识库存储和检索（基础框架已实现，存储逻辑待完善）

- [x] 4.5 实现记忆系统
  - [x] 4.5.1 实现Redis短期记忆存储（MemoryService）
  - [x] 4.5.2 实现MongoDB长期记忆存储（MemoryService）
  - [x] 4.5.3 实现记忆检索功能

## 5. 前端界面实现

- [x] 5.1 实现基础组件
  - [x] 5.1.1 实现 `LandingPage` 组件（首页）
  - [x] 5.1.2 实现 `TherapySelection` 组件（疗法选择）
  - [x] 5.1.3 实现 `MethodDetails` 组件（疗法详情）
  - [x] 5.1.4 实现 `CaseLibrary` 组件（案例库）

- [x] 5.2 实现会话界面
  - [x] 5.2.1 实现 `TherapySession` 组件（会话主界面）
  - [ ] 5.2.2 实现诊前评估表单（待后端API支持）
  - [x] 5.2.3 实现对话界面（已集成shared SSE hook，支持流式响应，前端编译通过）
  - [ ] 5.2.4 实现会话总结展示（待后端API支持）

- [x] 5.3 实现API服务
  - [x] 5.3.1 创建 `psychologyApi.ts` 服务文件
  - [x] 5.3.2 实现疗法相关API调用
  - [x] 5.3.3 实现会话相关API调用
  - [x] 5.3.4 实现案例相关API调用

- [x] 5.4 实现类型定义
  - [x] 5.4.1 定义疗法相关类型
  - [x] 5.4.2 定义会话相关类型
  - [x] 5.4.3 定义案例相关类型

## 6. 测试和文档

- [x] 6.1 单元测试
  - [x] 6.1.1 测试Service层功能（TherapySessionServiceTest - 6个测试全部通过）
  - [ ] 6.1.2 测试Repository层功能（待添加，当前通过Service层测试间接覆盖）
  - [x] 6.1.3 测试Controller层功能（TherapyMethodControllerTest - 3个测试全部通过）

- [ ] 6.2 集成测试
  - [ ] 6.2.1 测试API端点
  - [ ] 6.2.2 测试数据库操作
  - [ ] 6.2.3 测试AI模型集成

- [x] 6.3 API文档
  - [x] 6.3.1 配置SpringDoc OpenAPI（OpenAPIConfig）
  - [ ] 6.3.2 生成API文档（需要启动服务后验证）
  - [ ] 6.3.3 验证API文档完整性

- [x] 6.4 用户文档
  - [x] 6.4.1 编写README.md（已更新）
  - [x] 6.4.2 编写快速开始指南（QUICK_START.md）
  - [x] 6.4.3 编写API使用文档（TEST_API.md, TEST_SSE.md）
  - [ ] 6.4.4 编写开发指南（待完善）

## 7. 部署和配置

- [x] 7.1 配置部署脚本
  - [x] 7.1.1 创建启动脚本（start-psychology-mentor-backend.sh, start-psychology-mentor-frontend.sh）
  - [x] 7.1.2 创建停止脚本（stop-psychology-mentor.sh）
  - [ ] 7.1.3 创建重启脚本（可组合使用启动和停止脚本）

- [ ] 7.2 配置Nginx（如果需要）
  - [ ] 7.2.1 配置后端代理
  - [ ] 7.2.2 配置前端静态文件服务

- [ ] 7.3 配置环境变量
  - [ ] 7.3.1 配置数据库连接信息
  - [ ] 7.3.2 配置Redis连接信息
  - [ ] 7.3.3 配置MongoDB连接信息
  - [ ] 7.3.4 配置AI模型API Key
