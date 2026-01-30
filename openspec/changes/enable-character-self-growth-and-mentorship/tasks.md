# Tasks: 启用角色自我成长和导师能力

## Phase 1: 数据模型和基础架构

### 1.1 数据库设计
- [x] 1.1.1 设计 `character_growth_events` 表结构
- [x] 1.1.2 设计 `character_relationship_milestones` 表结构
- [x] 1.1.3 设计 `character_mentorship_sessions` 表结构
- [x] 1.1.4 扩展 `characters` 表，添加成长相关字段
- [x] 1.1.5 创建 Flyway 迁移脚本
- [x] 1.1.6 创建索引和约束

### 1.2 实体类实现
- [x] 1.2.1 创建 `CharacterGrowthEventEntity.java`
- [x] 1.2.2 创建 `CharacterRelationshipMilestoneEntity.java`
- [x] 1.2.3 创建 `CharacterMentorshipSessionEntity.java`
- [x] 1.2.4 更新 `Character.java`，添加成长相关字段

### 1.3 Repository 层
- [x] 1.3.1 创建 `CharacterGrowthEventRepository.java`
- [x] 1.3.2 创建 `CharacterRelationshipMilestoneRepository.java`
- [x] 1.3.3 创建 `CharacterMentorshipSessionRepository.java`

## Phase 2: 自我成长系统

### 2.1 成长服务实现
- [x] 2.1.1 创建 `CharacterGrowthService.java`
- [x] 2.1.2 实现主动学习检测逻辑（MVP版本）
- [x] 2.1.3 实现自我反思机制（MVP版本）
- [x] 2.1.4 实现能力提升算法（MVP版本）
- [x] 2.1.5 实现成长轨迹记录（MVP版本）

### 2.2 成长工具类
- [ ] 2.2.1 创建 `SelfReflectionAnalyzer.java`（自我反思分析器）
- [ ] 2.2.2 创建 `GrowthTrajectoryCalculator.java`（成长轨迹计算器）
- [ ] 2.2.3 创建 `LearningOpportunityDetector.java`（学习机会检测器）

### 2.3 成长事件处理
- [ ] 2.3.1 实现成长事件记录
- [ ] 2.3.2 实现成长里程碑检测
- [ ] 2.3.3 实现成长通知机制

## Phase 3: 挚友能力系统

### 3.1 陪伴服务实现
- [x] 3.1.1 创建 `CharacterCompanionshipService.java`
- [x] 3.1.2 实现情感连接分析
- [x] 3.1.3 实现陪伴机制（主动关怀、定期问候）
- [x] 3.1.4 实现记忆共鸣检测
- [x] 3.1.5 实现关系深化逻辑

### 3.2 关系阶段管理
- [x] 3.2.1 实现关系阶段计算（STRANGER → FRIEND → CLOSE_FRIEND → MENTOR）
- [x] 3.2.2 实现关系里程碑记录
- [x] 3.2.3 实现关系阶段转换触发

### 3.3 情感连接工具
- [x] 3.3.1 创建 `EmotionalConnectionAnalyzer.java`（情感连接分析器）
- [x] 3.3.2 创建 `CompanionshipMemoryBuilder.java`（陪伴记忆构建器）
- [x] 3.3.3 创建 `RelationshipDepthCalculator.java`（关系深度计算器）

## Phase 4: 导师能力系统

### 4.1 导师服务实现
- [x] 4.1.1 创建 `CharacterMentorshipService.java`
- [x] 4.1.2 实现主动指导逻辑
- [x] 4.1.3 实现个性化教育内容生成
- [x] 4.1.4 实现成长规划制定
- [x] 4.1.5 实现知识传授机制

### 4.2 导师能力评估
- [x] 4.2.1 实现导师能力评估算法
- [x] 4.2.2 实现指导效果追踪
- [x] 4.2.3 实现导师能力提升机制

### 4.3 指导会话管理
- [x] 4.3.1 实现指导会话创建和追踪
- [x] 4.3.2 实现指导内容个性化
- [x] 4.3.3 实现指导进度追踪

## Phase 5: 智能决策系统

### 5.1 情境感知
- [x] 5.1.1 创建 `ContextAwarenessService.java`
- [x] 5.1.2 实现对话情境分析
- [x] 5.1.3 实现用户需求识别
- [x] 5.1.4 实现最佳响应模式选择

### 5.2 角色模式切换
- [x] 5.2.1 实现挚友模式和导师模式的智能切换
- [x] 5.2.2 实现模式切换触发条件
- [x] 5.2.3 实现模式切换平滑过渡

### 5.3 主动介入机制
- [x] 5.3.1 实现主动介入时机判断
- [x] 5.3.2 实现主动建议生成
- [x] 5.3.3 实现主动关怀触发

## Phase 6: 前端集成

### 6.1 成长展示组件
- [x] 6.1.1 创建 `CharacterGrowthPanel.tsx`（成长面板）
- [ ] 6.1.2 创建 `GrowthTrajectoryChart.tsx`（成长轨迹图表）- 可选，后续完善
- [ ] 6.1.3 创建 `SelfReflectionTimeline.tsx`（自我反思时间线）- 可选，后续完善

### 6.2 关系展示组件
- [x] 6.2.1 创建 `CharacterRelationshipPanel.tsx`（关系面板）
- [ ] 6.2.2 创建 `RelationshipMilestoneCard.tsx`（关系里程碑卡片）- 已集成在关系面板中
- [ ] 6.2.3 创建 `EmotionalConnectionIndicator.tsx`（情感连接指示器）- 可选，后续完善

### 6.3 导师展示组件
- [x] 6.3.1 创建 `MentorshipSessionCard.tsx`（指导会话卡片）- 已集成在导师面板中
- [ ] 6.3.2 创建 `GrowthPlanViewer.tsx`（成长计划查看器）- 可选，后续完善
- [x] 6.3.3 创建 `MentorshipCapabilitiesPanel.tsx`（导师能力面板）- 已创建为 `CharacterMentorshipPanel.tsx`

### 6.4 系统集成
- [x] 6.4.1 在 `generateAIResponse.ts` 中集成成长系统 - 已完成（检测学习机会、情感共鸣、模式切换）
- [x] 6.4.2 在 `useSystemIntegration.ts` 中扩展系统集成 - 已完成（添加成长系统集成注释）
- [x] 6.4.3 在 `CharacterConstructorModal.tsx` 中添加成长标签页 - 已完成

### 6.5 API 扩展
- [x] 6.5.1 在 `memory.ts` 中添加成长系统相关API方法

## Phase 7: API 端点

### 7.1 成长相关API
- [x] 7.1.1 `GET /api/memory/v1/character/{characterId}/growth` - 获取成长信息
- [x] 7.1.2 `GET /api/memory/v1/character/{characterId}/growth/trajectory` - 获取成长轨迹
- [x] 7.1.3 `POST /api/memory/v1/character/{characterId}/growth/reflect` - 触发自我反思

### 7.2 关系相关API
- [x] 7.2.1 `GET /api/memory/v1/character/{characterId}/relationship` - 获取关系信息
- [x] 7.2.2 `GET /api/memory/v1/character/{characterId}/relationship/milestones` - 获取关系里程碑
- [x] 7.2.3 `GET /api/memory/v1/character/{characterId}/relationship/depth` - 获取关系深度

### 7.3 导师相关API
- [x] 7.3.1 `GET /api/memory/v1/character/{characterId}/mentorship/capabilities` - 获取导师能力
- [x] 7.3.2 `POST /api/memory/v1/character/{characterId}/mentorship/sessions` - 创建指导会话
- [x] 7.3.3 `GET /api/memory/v1/character/{characterId}/mentorship/sessions` - 获取指导会话列表
- [x] 7.3.4 `POST /api/memory/v1/character/{characterId}/mentorship/plan` - 创建成长计划

### 7.4 情境感知和模式切换API
- [x] 7.4.1 `POST /api/memory/v1/character/{characterId}/context/analyze` - 分析对话情境
- [x] 7.4.2 `POST /api/memory/v1/character/{characterId}/mode/switch` - 智能模式切换

## Phase 8: 测试和文档

### 8.1 单元测试
- [x] 8.1.1 测试自我成长服务 - `CharacterGrowthServiceTest.java`
- [ ] 8.1.2 测试挚友能力服务 - 待实现
- [ ] 8.1.3 测试导师能力服务 - 待实现
- [ ] 8.1.4 测试智能决策服务 - 待实现
- [x] 8.1.5 测试工具类 - `RelationshipDepthCalculatorTest.java`, `EmotionalConnectionAnalyzerTest.java`

### 8.2 集成测试
- [ ] 8.2.1 测试成长系统端到端流程 - 待实现
- [ ] 8.2.2 测试关系阶段转换 - 待实现
- [ ] 8.2.3 测试导师指导会话 - 待实现

### 8.3 文档
- [x] 8.3.1 编写 API 文档 - `API_DOCUMENTATION.md`
- [x] 8.3.2 编写用户指南 - `USER_GUIDE.md`
- [x] 8.3.3 编写开发者文档 - `DEVELOPER_GUIDE.md`
- [x] 8.3.4 编写实施总结 - `IMPLEMENTATION_SUMMARY.md`
- [x] 8.3.5 编写完成报告 - `COMPLETION_REPORT.md`
