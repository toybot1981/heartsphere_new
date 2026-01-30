# 角色长期学习系统 - 完整实现指南

## 📋 系统概述

**目标**：使数字生命从多个用户的交互中学习，持续进化成为更聪明的 AI 助手。

**核心创新**：三层记忆架构 + 知识资产管理 + 经验等级系统

```
┌─────────────────────────────────────────────────────────────┐
│                    用户对话流程                              │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  用户输入 ──→ 多层记忆检索 ──→ AI生成 ──→ 资产升级 ──→ 反馈 │
│              (P0+P1+P2)                 检测      收集       │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## 🏗️ 系统架构

### 三层记忆

| 层级 | 名称 | 存储 | 内容 | 优先级 |
|------|------|------|------|--------|
| 1 | 短期记忆 | Redis | 会话上下文 | P0 |
| 2 | 个体长期 | MySQL/HSMem | 用户专属信息 | P0 |
| 3 | **通用资产** 🆕 | MySQL | 跨用户知识 | P1/P2 |

### 知识资产类型

1. **Domain Knowledge（领域知识）**
   - 专业见解、最佳实践
   - 示例：投资风险管理原则

2. **Interaction Skills（交互技巧）**
   - 沟通方式、处理不同用户类型
   - 示例：如何与焦虑用户沟通

3. **Decision Rules（决策规则）**
   - 特定场景的推荐行动
   - 示例：当用户问X时，采用Y策略

4. **Experience Patterns（经验模式）**
   - 成功/失败案例
   - 示例：此方案在80%用户中有效

### 经验等级系统

```
L1 新手   (0-5 资产)    → 知识积累阶段
L2 初级   (6-20 资产)   → 基础完整 (信任度≥60%)
L3 中级   (21-50 资产)  → 可靠方案 (信任度≥70%)
L4 高级   (51-100 资产) → 经验丰富 (信任度≥80%)
L5 专家   (>100 资产)   → 顶级专家 (信任度≥85%)
```

## 🚀 部署清单

### 已完成（60% ✅）

- [x] **数据库迁移** - 3个新表，5个索引，完整约束
- [x] **后端 Service** - 资产管理、学习追踪、统计计算
- [x] **后端 API** - 5个 REST 端点
- [x] **前端集成** - 多层记忆检索、反馈工具
- [x] **隐私保护** - 敏感词检测、去重机制
- [x] **经验计算** - 等级系统、晋升检测

### 待完成（40% ⏳）

- [ ] **自动衰减** - 定时任务清理旧资产
- [ ] **前端展示** - 角色等级卡、知识库查看器
- [ ] **管理后台** - 资产审核界面
- [ ] **完整测试** - 单元/集成/E2E测试
- [ ] **生产优化** - 缓存策略、查询优化
- [ ] **文档完善** - API 文档、用户指南

## 💻 快速开始

### 前置条件

```bash
# 后端
- Java 17+
- MySQL 8.0+
- Spring Boot 3.2.0

# 前端
- Node.js 18+
- React 18+
- TypeScript 5+
```

### 1️⃣ 数据库初始化

```bash
# 执行迁移脚本
mysql -h localhost -u root -p heartsphere < main/backend/src/main/resources/db/migration/V20260122__add_character_learning_system.sql
```

### 2️⃣ 后端编译

```bash
cd main/backend
mvn clean compile
mvn test  # 运行集成测试
mvn package
```

### 3️⃣ 启动服务

```bash
# 后端启动后，新 API 自动可用
java -jar main/backend/target/heartsphere-backend.jar
```

### 4️⃣ 前端集成

```bash
# 已自动集成，无需额外操作
# getRelevantMemories() 现已支持多层检索
# submitAssetFeedback() 已可用于反馈收集
```

## 📊 核心 API 列表

### 知识资产管理

```
POST   /api/memory/v1/character/{characterId}/assets
       创建知识资产

GET    /api/memory/v1/character/{characterId}/related-assets?query=xxx&limit=5
       检索相关资产

POST   /api/memory/v1/assets/{assetId}/feedback
       提交反馈

GET    /api/memory/v1/character/{characterId}/stats
       获取学习统计
```

### 前端工具

```typescript
// 检索多层记忆
const memories = await getRelevantMemories(
  userText,      // 用户输入
  5,             // 返回数量
  characterId,   // 角色ID（用于获取通用资产）
  debugCallback  // 调试信息回调
);

// 提交反馈
await submitAssetFeedback(assetId, 'positive');
```

## 🧪 测试场景

### 1. 单一对话中的学习

```
用户: "投资时应该注意什么？"
↓
AI: 注入P0(个体记忆) + P1(相关资产) → 生成高质量回复
↓
系统: 检测可升级知识 → 创建"投资原则"资产 → 标记待审核
```

### 2. 跨用户知识共享

```
用户A: 对话产生"风险管理"资产
↓
资产批准后加入角色知识库
↓
用户B: 问相同问题 → 自动检索到该资产
↓
角色变得"更聪明" → 经验等级上升
```

### 3. 反馈驱动改进

```
用户: "这个建议很有帮助" ✓
↓
资产信任度 +10
↓
经验等级自动调整
↓
该资产未来获得更高优先级
```

## 🔒 隐私安全

### 检测机制

- ✓ 敏感词列表（电话、邮箱、身份证等）
- ✓ 正则表达式匹配（手机号、邮箱格式）
- ✓ 第一人称频率分析
- ✓ 内容脱敏功能

### 审核流程

```
自动升级 → 隐私检测 → 相似度检测 → 待审核状态
                ↓ (有问题)
            标记为"需要审核"
                ↓ (人工处理)
            批准 或 拒绝
```

## 📈 性能指标

### 目标

| 指标 | 目标值 | 备注 |
|------|--------|------|
| 记忆检索响应时间 | <100ms | P0 + P1/P2 |
| 资产创建/批准 | <50ms | 内存操作 |
| 等级计算 | <10ms | 简单聚合 |
| 每日处理对话 | 10K+ | 生产级 |

### 优化策略

- 记忆检索使用 Redis 缓存
- 资产相似度计算异步化
- 等级计算定期批处理
- 数据库查询优化（索引）

## 🛠️ 开发指南

### 添加新的资产类型

```java
// 1. 更新 ExperienceLevelCalculator
// 2. 更新 AssetType 枚举
// 3. 更新 MemoryDebugPanel 显示
// 4. 添加对应的 prompt 模板
```

### 自定义隐私词汇

```java
// SensitiveInfoDetector.java
private static final Set<String> SENSITIVE_KEYWORDS = new HashSet<>(Arrays.asList(
    // 添加更多行业特定的敏感词
    "信用卡", "社保号", ...
));
```

### 调整经验等级阈值

```java
// ExperienceLevelCalculator.java
L3_INTERMEDIATE(3, "中级", 21, 50, 70),  // 修改资产数量或信任度要求
```

## 📝 数据库架构

### character_knowledge_assets 表

```sql
CREATE TABLE character_knowledge_assets (
  id BIGINT PRIMARY KEY,
  character_id BIGINT NOT NULL,
  asset_type VARCHAR(50),        -- 资产类型
  title VARCHAR(255),            -- 标题
  content LONGTEXT,              -- 完整内容
  summary VARCHAR(500),          -- 摘要
  trust_score INT DEFAULT 50,    -- 信任度 (0-100)
  usage_count INT DEFAULT 0,     -- 被使用次数
  positive_feedback_count INT,   -- 正面反馈
  negative_feedback_count INT,   -- 负面反馈
  is_approved BOOLEAN,           -- 审核状态
  created_at TIMESTAMP,
  ...
) CHARACTER SET utf8mb4;
```

### 关键索引

```sql
KEY idx_character_type (character_id, asset_type)
KEY idx_trust_score (trust_score)
KEY idx_is_approved (is_approved)
```

## 🚨 常见问题

### Q1: 资产什么时候才能对用户可见？

**A**: 三个步骤：
1. 自动检测并创建（标记待审核）
2. 管理员审核并批准
3. 立即可用于其他对话

### Q2: 如何处理低质量资产？

**A**: 多个机制：
- 负面反馈自动降低信任度
- 30+ 天未使用自动衰减
- 管理员可手工删除或隐藏

### Q3: 隐私信息会被泄露吗？

**A**: 完全保护：
- 上传前先过敏感词检测
- 失败的升级不留痕迹
- 用户隐私永不进入资产库

### Q4: 性能会下降吗？

**A**: 最优化设计：
- 检索使用并行查询（P0 + P1/P2）
- 缓存热门资产
- 异步处理非关键任务

## 📚 相关文件

```
openspec/changes/enhance-character-long-term-learning-system/
├── proposal.md          ← 项目提案
├── design.md            ← 技术设计
├── tasks.md             ← 实现清单
└── specs/
    └── character-learning/
        └── spec.md      ← 需求规范

main/backend/src/main/java/com/heartsphere/memory/
├── entity/              ← 数据实体
│   ├── CharacterKnowledgeAssetEntity.java
│   └── CharacterLearningHistoryEntity.java
├── service/             ← 业务逻辑
│   ├── CharacterKnowledgeAssetService.java
│   └── CharacterLearningService.java
├── util/                ← 工具类
│   ├── SensitiveInfoDetector.java
│   ├── SimilarityCalculator.java
│   └── ExperienceLevelCalculator.java
├── dto/                 ← 数据传输对象
│   ├── CreateKnowledgeAssetRequest.java
│   ├── KnowledgeAssetResponse.java
│   └── CharacterLearningStatsResponse.java
└── controller/          ← API 端点
    └── MemoryController.java (新增 5 个端点)

main/frontend/components/chat/
├── hooks/
│   └── useSystemIntegration.ts (增强多层检索)
├── utils/
│   ├── generateAIResponse.ts (添加升级检测)
│   └── assetFeedback.ts (新增)
└── ChatWindow.tsx (增强调用)
```

## ✅ 验收标准

系统正式上线需满足：

- [ ] 后端编译无错误
- [ ] 前端 TypeScript 通过检查
- [ ] 所有集成测试通过
- [ ] 隐私检测有效率 > 99%
- [ ] 平均响应时间 < 100ms
- [ ] 文档完整且准确
- [ ] 管理员界面可用
- [ ] 用户反馈机制正常

## 🎯 成功指标

上线后的目标：

1. **角色智能提升**
   - 对话质量评分提高 20%+
   - 用户满意度提高 15%+

2. **知识积累**
   - 平均每个活跃角色月增 50+ 资产
   - 资产平均信任度 > 70%

3. **用户参与**
   - 反馈率 > 30%
   - 平均反馈有用性 > 80%

## 📞 联系方式

- 技术问题：见 GitHub Issues
- 功能建议：提交 Feature Request
- 安全问题：联系安全团队

---

**更新日期**: 2026-01-24  
**版本**: 1.0.0  
**状态**: ✅ Phase 1-4 完成，等待上线验收
