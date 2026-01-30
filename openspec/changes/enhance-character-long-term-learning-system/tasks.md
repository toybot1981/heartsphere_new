# Tasks: 角色长期学习系统实现清单

## 1. 数据模型设计和迁移

- [ ] 1.1 在 `characters` 表添加新字段：`experience_level` (int, default=1), `knowledge_asset_count` (int, default=0), `last_learning_update` (timestamp, nullable)
- [ ] 1.2 创建 `character_knowledge_assets` 表
  - `id` (BIGINT, PK)
  - `character_id` (BIGINT, FK to characters)
  - `asset_type` (VARCHAR, enum: DOMAIN_KNOWLEDGE, INTERACTION_SKILLS, DECISION_RULES, EXPERIENCE_PATTERNS)
  - `title` (VARCHAR, 简短标题)
  - `content` (TEXT, 完整内容)
  - `summary` (VARCHAR, 摘要，用于相似度计算)
  - `source_conversation_id` (BIGINT, FK to chat_messages，标记来源)
  - `trust_score` (INT, 0-100, 信任度评分)
  - `usage_count` (INT, 被使用的次数)
  - `positive_feedback_count` (INT, 正面评价数)
  - `negative_feedback_count` (INT, 负面评价数)
  - `is_auto_promoted` (BOOLEAN, 是否自动升级)
  - `is_approved` (BOOLEAN, 是否通过审核)
  - `approved_by` (VARCHAR, nullable, 审核者ID)
  - `created_at` (TIMESTAMP)
  - `updated_at` (TIMESTAMP)
  - `last_used_at` (TIMESTAMP, nullable, 用于衰减)
  - 索引：(character_id, asset_type), (trust_score), (created_at)

- [ ] 1.3 创建 `character_learning_history` 表
  - `id` (BIGINT, PK)
  - `character_id` (BIGINT, FK)
  - `event_type` (VARCHAR, enum: ASSET_PROMOTED, ASSET_UPDATED, LEVEL_UP, FEEDBACK_RECEIVED)
  - `asset_id` (BIGINT, FK to character_knowledge_assets, nullable)
  - `description` (TEXT, 事件描述)
  - `metadata` (JSON, 包含具体数据如升级原因、反馈内容等)
  - `created_at` (TIMESTAMP)
  - 索引：(character_id, created_at), (event_type)

- [ ] 1.4 创建 Flyway 迁移脚本 `V202601__add_character_learning_system.sql`

## 2. 后端服务实现

### 2.1 工具类和工厂

- [ ] 2.1.1 创建 `SensitiveInfoDetector` 工具类
  - 检测敏感词汇（如用户名、电话、邮箱、身份证号等）
  - 支持可配置的敏感词列表
  - 实现隐私保护的内容脱敏

- [ ] 2.1.2 创建 `SimilarityCalculator` 工具类
  - 计算两个文本的语义相似度（基于 TF-IDF 或更简单的 Levenshtein 距离）
  - 支持向量化表示

- [ ] 2.1.3 创建 `ExperienceLevelCalculator` 工具类
  - 根据资产数量和平均信任度计算经验等级
  - 实现等级的晋升规则

### 2.2 Entity 和 Repository

- [ ] 2.2.1 创建 `CharacterKnowledgeAssetEntity` JPA 实体
- [ ] 2.2.2 创建 `CharacterLearningHistoryEntity` JPA 实体
- [ ] 2.2.3 创建 `CharacterKnowledgeAssetRepository`（包含自定义查询方法）
  - `findByCharacterIdAndAssetType()`
  - `findByCharacterIdOrderByTrustScoreDesc()`
  - `findSimilarAssets(characterId, summary, threshold)`
  - `findRecentUnusedAssets(characterId, daysThreshold)`

- [ ] 2.2.4 创建 `CharacterLearningHistoryRepository`

### 2.3 Service 层

- [ ] 2.3.1 创建 `CharacterKnowledgeAssetService`
  - `createAsset()` - 创建新资产
  - `updateAsset()` - 更新现有资产
  - `deleteAsset()` - 删除资产
  - `getAssetsByCharacterId()` - 查询角色的所有资产
  - `getAssetsByCharacterAndType()` - 按类型查询
  - `getRelatedAssets(characterId, keywords, limit)` - 检索相关资产
  - `updateTrustScore(assetId, feedback)` - 基于反馈更新信任度
  - `applyAutomaticDecay()` - 应用自动衰减
  - `approveAsset(assetId, approvedBy)` - 审核通过
  - `rejectAsset(assetId, reason)` - 审核拒绝

- [ ] 2.3.2 创建 `CharacterAssetPromotionService`
  - `canPromoteToAsset(conversationContent)` - 判断是否可升级
  - `detectAssetCandidates(conversationId)` - 从对话中检测可升级的资产
  - `promoteToAsset(candidate)` - 执行升级
  - `detectAndPromote(conversationId)` - 自动检测和升级

- [ ] 2.3.3 创建 `CharacterLearningService`
  - `calculateExperienceLevel(characterId)` - 计算当前等级
  - `updateCharacterStats(characterId)` - 更新角色统计数据
  - `recordLearningEvent(characterId, eventType, metadata)` - 记录学习事件
  - `getLearningHistory(characterId, limit)` - 获取学习历史

### 2.4 API 端点（Controller）

- [ ] 2.4.1 在 `MemoryController` 中添加：
  - `POST /api/v1/memory/character/{characterId}/assets` - 创建资产（需要管理员权限）
  - `GET /api/v1/memory/character/{characterId}/assets` - 获取资产列表
  - `GET /api/v1/memory/character/{characterId}/assets/{assetId}` - 获取单个资产
  - `GET /api/v1/memory/character/{characterId}/related-assets?query=...&limit=...` - 检索相关资产
  - `PUT /api/v1/memory/character/{characterId}/assets/{assetId}` - 更新资产（管理员权限）
  - `DELETE /api/v1/memory/character/{characterId}/assets/{assetId}` - 删除资产（管理员权限）
  - `POST /api/v1/memory/character/{characterId}/assets/{assetId}/feedback` - 提交反馈
  - `POST /api/v1/memory/character/{characterId}/assets/{assetId}/approve` - 审核通过（管理员权限）
  - `GET /api/v1/memory/character/{characterId}/stats` - 获取角色学习统计

- [ ] 2.4.2 添加对应的 DTO 类
  - `CreateKnowledgeAssetRequest`
  - `UpdateKnowledgeAssetRequest`
  - `KnowledgeAssetResponse`
  - `AssetFeedbackRequest`
  - `CharacterLearningStatsResponse`

## 3. 前端记忆检索优化

- [ ] 3.1 修改 `main/frontend/services/api/memory/memory.ts`
  - 添加 `getRelatedAssets(characterId, keywords)` - 检索相关的角色资产
  - 添加 `submitAssetFeedback(assetId, feedback)` - 提交资产反馈

- [ ] 3.2 修改 `main/frontend/components/chat/hooks/useSystemIntegration.ts`
  - 在 `getRelevantMemories()` 中添加角色资产检索
  - 实现三层优先级的记忆合并
  - 添加 Token 预算管理

- [ ] 3.3 修改 `main/frontend/components/chat/utils/generateAIResponse.ts`
  - 修改 `buildSystemPrompt()` 以支持多层记忆注入
  - 在生成完整系统提示词时，清晰标注来自哪一层的记忆（个体 vs 通用）

- [ ] 3.4 修改 `main/frontend/components/ChatWindow.tsx`
  - 在对话消息下添加"有帮助"/"没帮助"反馈按钮
  - 点击时收集和提交反馈数据
  - 可选：在反馈时让用户说明是哪个部分有帮助

## 4. 资产升级流程实现

- [ ] 4.1 修改 `generateAIResponse.ts` 的完成流程
  - 在对话完成后，调用 `CharacterAssetPromotionService.detectAndPromote(conversationId)`
  - 记录升级事件到学习历史

- [ ] 4.2 创建后台管理界面（在 admin 项目中）
  - 查看待审核的资产列表
  - 批量审核通过或拒绝
  - 编辑现有资产
  - 查看角色的学习统计和经验等级

## 5. 自动衰减和优化机制

- [ ] 5.1 创建定时任务（如每天凌晨 2 点）
  - 调用 `CharacterKnowledgeAssetService.applyAutomaticDecay()`
  - 衰减 30+ 天未使用的资产相关性评分
  - 标记低信任度、多次负面反馈的资产为"需要审核"

- [ ] 5.2 实现定期清理（可选）
  - 删除信任度长期低于 20 分的资产
  - 报告给管理员，而非直接删除

## 6. 前端展示层

- [ ] 6.1 在角色详情页显示：
  - 经验等级（新手/初级/中级/高级/专家）
  - 资产统计（总数、各类型分布）
  - 最后学习时间

- [ ] 6.2 创建"角色知识库"查看组件
  - 按资产类型分类显示
  - 显示每个资产的信任度、使用次数、反馈比例
  - 支持搜索和筛选

- [ ] 6.3 在 MemoryDebugPanel 中增强显示：
  - 显示本次对话中注入的角色资产（与个体记忆分开显示）
  - 显示每个资产的来源和信任度

## 7. 测试

- [ ] 7.1 单元测试
  - `SensitiveInfoDetector` - 测试隐私检测
  - `SimilarityCalculator` - 测试相似度计算
  - `ExperienceLevelCalculator` - 测试等级计算
  - `CharacterAssetPromotionService` - 测试升级条件判断

- [ ] 7.2 集成测试
  - 完整的对话→升级→注入流程
  - 多用户场景：两个用户与同一角色对话，资产共享
  - 反馈循环：提交反馈→信任度更新

- [ ] 7.3 性能测试
  - 大规模资产库查询性能（1000+ 资产）
  - 并发反馈提交

- [ ] 7.4 隐私安全审计
  - 确保不会升级包含隐私信息的内容
  - 验证敏感词检测的有效性

## 8. 文档

- [ ] 8.1 更新 API 文档（Swagger/OpenAPI）
- [ ] 8.2 编写"角色学习系统"架构文档
- [ ] 8.3 编写管理员使用手册（资产审核和编辑）
- [ ] 8.4 编写用户指南（理解角色经验等级）

## 注意事项

- **隐私优先**：所有资产升级都必须通过敏感信息检测
- **人工审核**：MVP 阶段建议所有自动升级的资产都需要管理员确认
- **渐进发布**：建议先在测试服务器验证，再逐步上线
- **监控和告警**：定期检查资产库健康状况，及时发现问题资产
