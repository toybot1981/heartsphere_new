# Change: 创建心理导师系统模块（Psychology Mentor Module）

## Why

当前 HeartSphere 系统已有多个独立模块（main、mentis、edu、company、admin），每个模块都有独立的业务定位和技术栈。为了支持专业的心理健康治疗功能，需要创建一个与 mentis 并列的心理导师系统模块（Psychology Mentor）。

心理导师系统模块将：
1. **独立部署和运行**：拥有独立的后端和前端服务
2. **专业治疗功能**：支持5种主流心理治疗流派（CBT、DBT、ACT、心理动力学、人本主义）
3. **智能会话管理**：提供专业的诊前评估、实时对话、会话总结功能
4. **专业知识库**：包含深度知识库和17个临床案例
5. **心理学事实提取**：自动识别情绪模式、认知扭曲、应对策略
6. **疗法智能推荐**：基于用户困扰匹配最佳疗法
7. **独立端口**：拥有独立的端口配置，不与其他模块冲突
8. **遵循项目规范**：遵循 HeartSphere 项目的技术栈和架构规范

该模块将为心理健康支持系统（build-mental-health-support-system）提供专业治疗能力，通过API集成到main项目的多智能体框架中。

## What Changes

### 1. 模块目录结构
- **ADDED**: 创建心理导师系统模块目录 `psychology-mentor/`
  - `backend/` - 后端服务（Spring Boot）
  - `frontend/` - 前端服务（React + TypeScript + Vite）
  - `README.md` - 模块说明文档

### 2. 后端服务框架
- **ADDED**: Spring Boot 应用结构
  - `src/main/java/com/heartsphere/psychology/` - 主包结构
  - `src/main/java/com/heartsphere/psychology/PsychologyMentorApplication.java` - 主应用类
  - `src/main/java/com/heartsphere/psychology/controller/` - REST API 控制器
    - `TherapyMethodController.java` - 疗法管理控制器
    - `TherapySessionController.java` - 会话管理控制器
    - `ClinicalCaseController.java` - 临床案例控制器
    - `UserProfileController.java` - 用户画像控制器
    - `MindScapeAIController.java` - AI对话控制器
  - `src/main/java/com/heartsphere/psychology/service/` - 业务服务层
    - `TherapyMethodService.java` - 疗法服务
    - `TherapySessionService.java` - 会话服务
    - `ClinicalCaseService.java` - 临床案例服务
    - `UserProfileService.java` - 用户画像服务
    - `MindScapeAIService.java` - AI对话服务
    - `TherapyRecommendationService.java` - 疗法推荐服务
  - `src/main/java/com/heartsphere/psychology/repository/` - 数据访问层
  - `src/main/java/com/heartsphere/psychology/entity/` - 实体类
  - `src/main/java/com/heartsphere/psychology/dto/` - 数据传输对象
  - `src/main/java/com/heartsphere/psychology/config/` - 配置类
  - `src/main/resources/application.yml` - 应用配置文件
  - `src/main/resources/db/migration/` - Flyway 数据库迁移脚本目录
  - `pom.xml` - Maven 依赖配置

### 3. 前端服务框架
- **ADDED**: React + TypeScript + Vite 应用结构
  - `src/` - 源代码目录
  - `src/components/` - React 组件
    - `LandingPage.tsx` - 首页组件
    - `TherapySelection.tsx` - 疗法选择组件
    - `MethodDetails.tsx` - 疗法详情组件
    - `CaseLibrary.tsx` - 案例库组件
    - `TherapySession.tsx` - 会话组件
  - `src/pages/` - 页面组件
  - `src/services/` - API 服务
  - `src/types/` - TypeScript 类型定义
  - `src/utils/` - 工具函数
  - `src/hooks/` - React Hooks
  - `package.json` - npm 依赖配置
  - `vite.config.ts` - Vite 配置
  - `tsconfig.json` - TypeScript 配置

### 4. 核心功能实现
- **ADDED**: 5种治疗流派支持
  - CBT（认知行为疗法）- Dr. Cognos 🧠
  - DBT（辩证行为疗法）- Sage Harmony ⚖️
  - ACT（接纳承诺疗法）- Guide River 🌊
  - 心理动力学 - Prof. Freudia 🛋️
  - 人本主义 - Alex Beacon ❤️

- **ADDED**: 智能会话管理
  - 诊前评估（moodScore、stressLevel、sleepQuality等）
  - 实时对话（支持流式响应）
  - 会话总结（自动生成会话摘要）

- **ADDED**: 心理学事实提取
  - 情绪模式识别（10+种情绪）
  - 认知扭曲识别（12种认知扭曲类型）
  - 应对策略识别
  - 触发因素识别

- **ADDED**: 深度知识库
  - 生成1000+字的专业学术解析
  - 疗法理论知识库
  - 治疗技术库

- **ADDED**: 疗法智能推荐
  - 基于用户困扰匹配最佳疗法
  - 支持多疗法推荐排序

- **ADDED**: 临床案例库
  - 17个真实临床案例
  - 案例分类（亲密关系、情绪障碍、职场与自我等）
  - 案例详情（典型表现、心理溯源、治疗处方）

### 5. 数据库设计
- **ADDED**: 数据库表结构（使用Flyway迁移）
  - `therapy_methods` - 疗法定义表
  - `learning_pathways` - 学习路径表
  - `classic_cases` - 经典案例表
  - `session_records` - 会话记录表
  - `cognitive_distortions` - 认知扭曲表
  - `therapy_techniques` - 治疗技术表
  - `case_techniques` - 案例技术关联表
  - `assessment_measures` - 测量量表表
  - `case_measurements` - 案例测量结果表
  - `case_tags` - 案例标签表

### 6. 配置文件
- **ADDED**: 后端配置文件
  - 端口配置（默认 8083，可自定义）
  - 数据库连接配置（独立数据库 `heartsphere_psychology`）
  - Redis配置（短期记忆）
  - MongoDB配置（长期记忆）
  - AI模型配置（通义千问等）
  - JPA配置
  - Flyway配置
  - 日志配置
- **ADDED**: 前端配置文件
  - Vite 开发服务器配置（默认端口 3003）
  - API 基础 URL 配置
  - 环境变量配置

### 7. 依赖配置
- **ADDED**: Maven 依赖（后端）
  - Spring Boot 3.2.0
  - Spring Data JPA
  - Spring Data Redis
  - Spring Data MongoDB
  - MySQL 驱动
  - Flyway
  - Shared Backend Module
  - SpringDoc OpenAPI (Swagger)
  - Spring AI（用于AI模型集成）
- **ADDED**: npm 依赖（前端）
  - React 18+
  - TypeScript 5.8+
  - Vite 5.0+
  - Shared Frontend Module
  - 其他必要的依赖

### 8. API接口
- **ADDED**: RESTful API接口
  - `GET /api/psychology/health` - 健康检查
  - `GET /api/psychology/methods` - 获取所有疗法
  - `GET /api/psychology/methods/{methodId}` - 获取特定疗法
  - `POST /api/psychology/sessions/start` - 开始会话
  - `POST /api/psychology/sessions/{sessionId}/message` - 发送消息
  - `POST /api/psychology/sessions/{sessionId}/end` - 结束会话
  - `GET /api/psychology/sessions/{sessionId}` - 获取会话详情
  - `GET /api/psychology/cases` - 获取临床案例
  - `GET /api/psychology/cases/recommend` - 推荐疗法

### 9. 文档
- **ADDED**: README.md - 模块说明文档
  - 项目结构说明
  - 快速开始指南
  - 技术栈说明
  - API 文档链接
  - 开发指南

## Impact

- **Affected specs**: 
  - 新增 `psychology-mentor-module` capability（心理导师系统模块）
  - 新增 `therapy-session-management` capability（治疗会话管理）
  - 新增 `psychology-knowledge-base` capability（心理学知识库）
- **Affected code**: 
  - 新增 `psychology-mentor/` 目录及其所有内容
  - 可能需要更新部署脚本（如果有）
  - 可能需要更新 Nginx 配置（如果有）
- **Database**: 
  - 创建新的独立数据库 `heartsphere_psychology`
  - 使用 utf8mb4 字符集和 utf8mb4_unicode_ci 排序规则
- **Ports**: 
  - 后端端口：8083（默认，可自定义）
  - 前端端口：3003（默认，可自定义）
- **Dependencies**: 
  - 依赖 Shared Backend Module
  - 依赖 Shared Frontend Module
  - 依赖 Redis（短期记忆）
  - 依赖 MongoDB（长期记忆）

## Design Principles

1. **独立性**：新模块应该完全独立，不依赖其他业务模块
2. **专业性**：专注于专业心理治疗功能，提供高质量的治疗体验
3. **一致性**：遵循项目现有的技术栈和架构模式
4. **可扩展性**：为后续功能开发提供良好的基础
5. **可维护性**：代码结构清晰，易于理解和维护
6. **文档完善**：提供完整的文档，便于开发和部署
7. **API优先**：设计良好的RESTful API，便于与其他模块集成

## Implementation Strategy

采用分步骤实施：
1. **Phase 1**: 创建目录结构和基础框架（1-2天）
2. **Phase 2**: 实现数据库设计和迁移脚本（2-3天）
3. **Phase 3**: 实现后端核心服务（3-4天）
4. **Phase 4**: 实现前端界面（3-4天）
5. **Phase 5**: 实现AI对话和知识库功能（3-4天）
6. **Phase 6**: 测试和文档（2-3天）

总计预计 14-20 个工作日。

## Module Information

### 模块名称
- **中文名称**：心理导师系统模块
- **英文名称**：Psychology Mentor Module
- **目录名称**：`psychology-mentor`
- **包名**：`com.heartsphere.psychology`

### 模块定位
心理导师系统模块是一个独立的专业治疗模块，专注于提供专业的心理健康治疗功能。该模块将支持：
- 5种主流心理治疗流派
- 专业的治疗会话管理
- 智能的疗法推荐
- 丰富的临床案例库
- 深度的心理学知识库

### 数据库策略
使用独立数据库 `heartsphere_psychology`，以便：
- 独立管理心理治疗相关的数据
- 支持数据隔离和隐私保护
- 便于数据分析和研究
- 符合医疗数据管理规范

### 与心理健康支持系统的关系
- 心理导师系统作为独立的专业治疗服务
- 心理健康支持系统（main项目）通过API调用心理导师系统
- 心理导师系统的治疗师可以被包装为Agent，参与多智能体协作
- 两个系统保持独立，通过HTTP API通信
