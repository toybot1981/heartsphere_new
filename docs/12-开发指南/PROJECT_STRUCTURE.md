# MindScape 完整项目结构

## 📁 目录结构

```
heartsphere_new/
├── aistudio/                          # AI Studio 主目录
│   ├── backend/                         # 后端服务 (Spring Boot)
│   │   ├── src/
│   │   │   ├── main/
│   │   │   │   ├── java/com/heartsphere/aistudio/
│   │   │   │   │   ├── mindscape/           # MindScape核心模块
│   │   │   │   │   │   ├── controller/        # REST控制器 (5个)
│   │   │   │   │   │   │   ├── TherapyMethodController.java
│   │   │   │   │   │   │   ├── ClinicalCaseController.java
│   │   │   │   │   │   │   ├── UserProfileController.java
│   │   │   │   │   │   │   ├── TherapySessionController.java
│   │   │   │   │   │   │   └── MindScapeAIController.java
│   │   │   │   │   │   ├── service/           # 业务逻辑层 (6个)
│   │   │   │   │   │   │   ├── TherapyMethodService.java
│   │   │   │   │   │   │   ├── ClinicalCaseService.java
│   │   │   │   │   │   │   ├── UserProfileService.java
│   │   │   │   │   │   │   ├── TherapySessionService.java
│   │   │   │   │   │   │   ├── MindScapeAIService.java
│   │   │   │   │   │   │   └── TherapyRecommendationService.java
│   │   │   │   │   │   ├── repository/        # 数据访问层 (8个)
│   │   │   │   │   │   │   ├── TherapyMethodRepository.java
│   │   │   │   │   │   │   ├── ClinicalCaseRepository.java
│   │   │   │   │   │   │   ├── UserProfileRepository.java
│   │   │   │   │   │   │   ├── TherapySessionRepository.java
│   │   │   │   │   │   │   ├── SessionMessageRepository.java
│   │   │   │   │   │   │   ├── LearningRecordRepository.java
│   │   │   │   │   │   │   └── UserStatisticsRepository.java
│   │   │   │   │   │   ├── entity/            # JPA实体 (9个)
│   │   │   │   │   │   │   ├── TherapyMethodEntity.java
│   │   │   │   │   │   │   ├── ClinicalCaseEntity.java
│   │   │   │   │   │   │   ├── UserProfileEntity.java
│   │   │   │   │   │   │   ├── TherapySessionEntity.java
│   │   │   │   │   │   │   ├── SessionMessageEntity.java
│   │   │   │   │   │   │   ├── LearningRecordEntity.java
│   │   │   │   │   │   │   ├── DatasetVersionEntity.java
│   │   │   │   │   │   │   ├── SystemConfigEntity.java
│   │   │   │   │   │   │   └── UserStatisticsEntity.java
│   │   │   │   │   │   └── dto/               # 数据传输对象 (4个)
│   │   │   │   │   │       ├── TherapyMethodDTO.java
│   │   │   │   │   │       ├── ClinicalCaseDTO.java
│   │   │   │   │   │       ├── SessionIntakeDTO.java
│   │   │   │   │   │       └── ChatMessageDTO.java
│   │   │   │   │   ├── adapter/           # AI适配器
│   │   │   │   │   │   ├── ModelAdapterFactory.java
│   │   │   │   │   │   └── ModelAdapter.java
│   │   │   │   │   └── config/            # 配置类
│   │   │   │   │       ├── WebConfig.java
│   │   │   │   │       ├── RedisConfig.java
│   │   │   │   │       └── MongoDBConfig.java
│   │   │   │   └── resources/
│   │   │   │       ├── application.yml              # 应用配置
│   │   │   │       └── db/
│   │   │   │           ├── migration/                # Flyway迁移脚本 (5个)
│   │   │   │           │   ├── V1__Create_MindScape_Schema.sql
│   │   │   │           │   ├── V2__Insert_Seed_Data.sql
│   │   │   │           │   ├── V3__Complete_MindScape_Initialization.sql
│   │   │   │           │   ├── V4__Insert_Clinical_Cases.sql
│   │   │   │           │   └── V5__Add_Constraints.sql
│   │   │   │           └── init/                    # 初始化脚本 (6个)
│   │   │   │               ├── README.md
│   │   │   │               ├── 001_create_tables.sql
│   │   │   │               ├── 002_insert_therapy_methods.sql
│   │   │   │               ├── 003_insert_clinical_cases.sql
│   │   │   │               ├── 004_insert_test_users.sql
│   │   │   │               ├── 005_insert_system_configs.sql
│   │   │   │               └── 006_insert_dataset_versions.sql
│   │   │   └── test/
│   │   │       └── java/com/heartsphere/aistudio/mindscape/
│   │   │           ├── service/               # 单元测试 (3个)
│   │   │           │   ├── TherapyMethodServiceTest.java
│   │   │           │   ├── ClinicalCaseServiceTest.java
│   │   │           │   └── TherapyRecommendationServiceTest.java
│   │   │           └── integration/           # 集成测试 (3个)
│   │   │               ├── TherapyMethodIntegrationTest.java
│   │   │               ├── ClinicalCaseIntegrationTest.java
│   │   │               └── MindScapeAIIntegrationTest.java
│   │   ├── docs/
│   │   │   └── mindscape/            # MindScape文档 (4个)
│   │   │       ├── SYSTEM_DESIGN.md          # 系统设计文档
│   │   │       ├── IMPLEMENTATION_PROGRESS.md # 实施进度文档
│   │   │       ├── PROJECT_SUMMARY.md       # 项目总结文档
│   │   │       └── INTEGRATION_GUIDE.md    # 集成指南文档
│   │   ├── scripts/
│   │   │   ├── init_db.sh             # Linux/macOS数据库初始化脚本
│   │   │   └── init_db.bat            # Windows数据库初始化脚本
│   │   ├── pom.xml                        # Maven配置
│   │   └── README_MindScape.md        # 后端README
│   └── mindscape-ai-clinic/            # 前端应用 (React + TypeScript)
│       ├── src/
│       │   ├── components/                   # React组件 (8个)
│       │   │   ├── LandingPage.tsx
│       │   │   ├── TherapySelection.tsx
│       │   │   ├── MethodDetails.tsx
│       │   │   ├── CaseLibrary.tsx
│       │   │   ├── IntakeForm.tsx
│       │   │   ├── ChatSession.tsx
│       │   │   ├── SessionSummary.tsx
│       │   │   └── CaseStudy.tsx
│       │   ├── services/                     # API服务层 (2个)
│       │   │   ├── mindscapeApi.ts          # 后端API服务
│       │   │   └── mindscapeService.ts      # 业务逻辑服务
│       │   ├── types/                        # TypeScript类型定义
│       │   │   └── index.ts
│       │   ├── constants/                    # 常量和配置
│       │   │   └── index.ts
│       │   ├── utils/                        # 工具函数
│       │   │   └── helpers.ts
│       │   ├── App.tsx                       # 应用根组件
│       │   ├── main.tsx                      # 应用入口
│       │   └── vite-env.d.ts                # Vite类型声明
│       ├── public/                            # 静态资源
│       │   └── vite.svg
│       ├── package.json                        # Node.js配置
│       ├── tsconfig.json                      # TypeScript配置
│       ├── vite.config.ts                     # Vite配置
│       └── README_MindScape.md            # 前端README
├── QUICKSTART.md                      # 快速启动指南
└── PROJECT_STRUCTURE.md               # 本文档 - 项目结构
```

---

## 📊 文件统计

### 后端 (backend/)

| 类别 | 数量 | 说明 |
|------|------|------|
| Controller | 5 | REST控制器 |
| Service | 6 | 业务逻辑层 |
| Repository | 8 | 数据访问层 |
| Entity | 9 | JPA实体 |
| DTO | 4 | 数据传输对象 |
| Adapter | 2 | AI适配器 |
| Config | 3 | 配置类 |
| 单元测试 | 3 | Service层测试 |
| 集成测试 | 3 | API层测试 |
| SQL脚本 | 11 | Flyway和初始化脚本 |
| 文档 | 4 | 完整文档 |
| **总计** | **58** | **完整后端代码** |

### 前端 (mindscape-ai-clinic/)

| 类别 | 数量 | 说明 |
|------|------|------|
| Component | 8 | React组件 |
| Service | 2 | API服务 |
| Type定义 | 7 | TypeScript接口 |
| 常量文件 | 1 | 疗法和案例常量 |
| 工具函数 | 1 | 辅助函数 |
| **总计** | **19** | **完整前端代码** |

### 文档

| 文档 | 路径 | 说明 |
|------|------|------|
| 系统设计 | `backend/docs/mindscape/SYSTEM_DESIGN.md` | 完整的系统架构设计 |
| 实施进度 | `backend/docs/mindscape/IMPLEMENTATION_PROGRESS.md` | 分阶段实施记录 |
| 项目总结 | `backend/docs/mindscape/PROJECT_SUMMARY.md` | 完整的项目总结 |
| 集成指南 | `backend/docs/mindscape/INTEGRATION_GUIDE.md` | 前后端集成详细指南 |
| 快速启动 | `aistudio/QUICKSTART.md` | 5分钟快速启动指南 |
| 后端README | `backend/README_MindScape.md` | 后端服务说明 |
| 前端README | `mindscape-ai-clinic/README_MindScape.md` | 前端应用说明 |
| 数据库初始化 | `backend/src/main/resources/db/init/README.md` | 数据库初始化说明 |

---

## 🎯 核心模块说明

### 1. 疗法管理模块

**文件**:
- `TherapyMethodEntity.java`
- `TherapyMethodRepository.java`
- `TherapyMethodService.java`
- `TherapyMethodController.java`
- `TherapyMethodDTO.java`
- `TherapyMethodServiceTest.java`
- `TherapyMethodIntegrationTest.java`

**功能**:
- 5种心理疗法的CRUD操作
- 疗法缓存机制
- 多维度查询和筛选
- 统计信息生成

### 2. 案例管理模块

**文件**:
- `ClinicalCaseEntity.java`
- `ClinicalCaseRepository.java`
- `ClinicalCaseService.java`
- `ClinicalCaseController.java`
- `ClinicalCaseDTO.java`
- `ClinicalCaseServiceTest.java`
- `ClinicalCaseIntegrationTest.java`

**功能**:
- 17个初始临床案例
- 多维度查询（分类、严重程度、标签）
- 关键词搜索
- 浏览次数管理
- 案例推荐

### 3. 用户管理模块

**文件**:
- `UserProfileEntity.java`
- `UserProfileRepository.java`
- `UserProfileService.java`
- `UserProfileController.java`
- `UserStatisticsEntity.java`
- `UserStatisticsRepository.java`

**功能**:
- 用户画像管理
- 用户注册和登录
- 用户统计追踪
- 会话历史管理

### 4. 会话管理模块

**文件**:
- `TherapySessionEntity.java`
- `TherapySessionRepository.java`
- `TherapySessionService.java`
- `TherapySessionController.java`
- `SessionMessageEntity.java`
- `SessionMessageRepository.java`
- `LearningRecordEntity.java`
- `LearningRecordRepository.java`

**功能**:
- 治疗会话创建和管理
- 实时消息处理
- 会话阶段推进
- 自动总结生成
- 学习记录管理

### 5. AI智能体模块

**文件**:
- `MindScapeAIService.java`
- `MindScapeAIController.java`
- `MindScapeAIIntegrationTest.java`
- `ModelAdapterFactory.java`
- `ModelAdapter.java`

**功能**:
- 多维度疗法推荐算法
- AI对话处理
- 4阶段治疗流程
- 深度知识库生成
- 会话总结生成

### 6. 前端组件模块

**文件**:
- `LandingPage.tsx`
- `TherapySelection.tsx`
- `MethodDetails.tsx`
- `CaseLibrary.tsx`
- `IntakeForm.tsx`
- `ChatSession.tsx`
- `SessionSummary.tsx`
- `CaseStudy.tsx`

**功能**:
- 5种疗法展示
- 17个案例库浏览
- AI治疗师对话
- 诊前评估表单
- 会话管理和总结

---

## 📚 技术架构

### 后端架构

```
┌─────────────────────────────────────────────────────┐
│                REST API Layer                  │
│              (Spring Boot 3.x)                  │
│                                                  │
│  ┌───────────────────────────────────────────┐  │
│  │  Controller Layer (5 Controllers)       │  │
│  │  - TherapyMethodController           │  │
│  │  - ClinicalCaseController           │  │
│  │  - UserProfileController           │  │
│  │  - TherapySessionController         │  │
│  │  - MindScapeAIController          │  │
│  └───────────────────────────────────────────┘  │
│                      ▼                           │
│  ┌───────────────────────────────────────────┐  │
│  │  Service Layer (6 Services)             │  │
│  │  - TherapyMethodService             │  │
│  │  - ClinicalCaseService             │  │
│  │  - UserProfileService             │  │
│  │  - TherapySessionService           │  │
│  │  - MindScapeAIService             │  │
│  │  - TherapyRecommendationService   │  │
│  └───────────────────────────────────────────┘  │
│                      ▼                           │
│  ┌───────────────────────────────────────────┐  │
│  │  Repository Layer (8 Repositories)       │  │
│  │  - TherapyMethodRepository          │  │
│  │  - ClinicalCaseRepository          │  │
│  │  - UserProfileRepository          │  │
│  │  - TherapySessionRepository        │  │
│  │  - SessionMessageRepository        │  │
│  │  - LearningRecordRepository        │  │
│  │  - UserStatisticsRepository       │  │
│  └───────────────────────────────────────────┘  │
│                      ▼                           │
│  ┌───────────────────────────────────────────┐  │
│  │  Database Layer (H2/MySQL)             │  │
│  │  - 9 Tables                           │  │
│  └───────────────────────────────────────────┘  │
│                      ▼                           │
│  ┌───────────────────────────────────────────┐  │
│  │  External Services                    │  │
│  │  - Redis (Cache)                      │  │
│  │  - MongoDB (Long-term Memory)         │  │
│  │  - Alibaba AI (DashScope)            │  │
│  └───────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

### 前端架构

```
┌─────────────────────────────────────────────┐
│           React Application (Vite)        │
│                                             │
│  ┌─────────────────────────────────────┐  │
│  │  Components (8 Components)         │  │
│  │  - LandingPage                   │  │
│  │  - TherapySelection             │  │
│  │  - MethodDetails               │  │
│  │  - CaseLibrary                 │  │
│  │  - IntakeForm                 │  │
│  │  - ChatSession                │  │
│  │  - SessionSummary             │  │
│  └─────────────────────────────────────┘  │
│                      ▼                   │
│  ┌─────────────────────────────────────┐  │
│  │  Services (2 Services)             │  │
│  │  - mindscapeApi               │  │
│  │  - mindscapeService           │  │
│  └─────────────────────────────────────┘  │
│                      ▼                   │
│  ┌─────────────────────────────────────┐  │
│  │  HTTP Client (Fetch)              │  │
│  └─────────────────────────────────────┘  │
│                      ▼                   │
│  ┌─────────────────────────────────────┐  │
│  │  Backend API (Spring Boot)         │  │
│  └─────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
```

---

## 🔧 配置文件

### 后端配置 (application.yml)

```yaml
server:
  port: 8082

spring:
  datasource:
    url: jdbc:h2:mem:mindscapedb
    driver-class-name: org.h2.Driver
  
  jpa:
    database-platform: org.hibernate.dialect.H2Dialect
    show-sql: true
  
  ai:
    alibaba:
      api-key: ${ALIBABA_API_KEY}
```

### 前端配置 (vite.config.ts)

```typescript
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8082',
        changeOrigin: true
      }
    }
  }
});
```

---

## 📝 开发工作流

### 1. 后端开发

```bash
cd backend
mvn spring-boot:run
```

### 2. 前端开发

```bash
cd mindscape-ai-clinic
npm run dev
```

### 3. 数据库操作

```bash
# 自动初始化（Flyway）
mvn spring-boot:run

# 手动初始化（Shell）
cd backend/scripts
./init_db.sh h2

# 手动初始化（Windows）
init_db.bat h2
```

### 4. 运行测试

```bash
# 单元测试
cd backend
mvn test

# 集成测试
mvn test -Dtest=*IntegrationTest
```

---

## 🎯 快速导航

### 查看文档

- 📖 [系统设计](aistudio/backend/docs/mindscape/SYSTEM_DESIGN.md)
- 📊 [实施进度](aistudio/backend/docs/mindscape/IMPLEMENTATION_PROGRESS.md)
- 📋 [项目总结](aistudio/backend/docs/mindscape/PROJECT_SUMMARY.md)
- 🚀 [快速启动](aistudio/QUICKSTART.md)
- 🔧 [集成指南](aistudio/backend/docs/mindscape/INTEGRATION_GUIDE.md)

### 查看代码

- 🔙 [后端代码](aistudio/backend/src/main/java/com/heartsphere/aistudio/mindscape/)
- 🎨 [前端代码](aistudio/mindscape-ai-clinic/src/)
- 💾 [数据库脚本](aistudio/backend/src/main/resources/db/)

### 查看测试

- 🧪 [单元测试](aistudio/backend/src/test/java/com/heartsphere/aistudio/mindscape/service/)
- 🔬 [集成测试](aistudio/backend/src/test/java/com/heartsphere/aistudio/mindscape/integration/)

---

## 📜 许可证

MIT License

---

**MindScape Project**  
**版本**: 1.0.0  
**创建日期**: 2025-12-28  
**维护者**: MindScape Development Team

