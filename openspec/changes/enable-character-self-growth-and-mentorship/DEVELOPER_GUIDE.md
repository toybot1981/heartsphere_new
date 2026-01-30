# 角色自我成长和导师能力系统 - 开发者指南

## 架构概述

角色自我成长和导师能力系统采用分层架构：

```
Controller Layer (API 端点)
    ↓
Service Layer (业务逻辑)
    ↓
Repository Layer (数据访问)
    ↓
Entity Layer (数据模型)
```

## 核心组件

### 1. 服务层

#### CharacterGrowthService
负责角色的自我成长功能。

**主要方法**:
- `recordGrowthEvent()`: 记录成长事件
- `detectLearningOpportunity()`: 检测学习机会
- `triggerSelfReflection()`: 触发自我反思
- `recordAbilityUpgrade()`: 记录能力提升
- `getGrowthTrajectory()`: 获取成长轨迹

#### CharacterCompanionshipService
负责角色的挚友能力功能。

**主要方法**:
- `analyzeEmotionalConnection()`: 分析情感连接
- `detectAndRecordEmotionalResonance()`: 检测并记录情感共鸣
- `calculateAndUpdateRelationshipStage()`: 计算并更新关系阶段
- `recordRelationshipMilestone()`: 记录关系里程碑
- `triggerActiveCare()`: 触发主动关怀

#### CharacterMentorshipService
负责角色的导师能力功能。

**主要方法**:
- `evaluateMentorshipCapabilities()`: 评估导师能力
- `createMentorshipSession()`: 创建指导会话
- `provideActiveGuidance()`: 提供主动指导
- `providePersonalizedEducation()`: 提供个性化教育
- `createGrowthPlan()`: 创建成长规划

#### ContextAwarenessService
负责情境感知和模式选择。

**主要方法**:
- `analyzeContext()`: 分析对话情境
- `shouldIntervene()`: 判断是否需要主动介入
- `generateInterventionSuggestion()`: 生成介入建议

#### CharacterModeSwitchService
负责模式切换管理。

**主要方法**:
- `intelligentModeSwitch()`: 智能模式切换
- `recordModeSwitch()`: 记录模式切换事件

### 2. 工具类

#### RelationshipDepthCalculator
计算关系深度分数和确定关系阶段。

**主要方法**:
- `calculateRelationshipDepth()`: 计算关系深度分数
- `determineRelationshipStage()`: 确定关系阶段
- `shouldTransitionStage()`: 判断是否需要阶段转换

#### EmotionalConnectionAnalyzer
分析情感连接深度。

**主要方法**:
- `calculateEmotionalConnectionScore()`: 计算情感连接分数
- `detectEmotionalResonance()`: 检测情感共鸣

#### CompanionshipMemoryBuilder
构建陪伴相关记忆。

**主要方法**:
- `buildSharedExperienceMemory()`: 构建共同经历记忆
- `buildEmotionalResonanceMemory()`: 构建情感共鸣记忆
- `buildCompanionshipCareMemory()`: 构建陪伴关怀记忆

## 数据模型

### CharacterGrowthEventEntity
成长事件实体，记录角色的成长事件。

**关键字段**:
- `eventType`: 事件类型（LEARNING/REFLECTION/ABILITY_UPGRADE/RELATIONSHIP_PROGRESS）
- `eventCategory`: 事件分类（SELF_GROWTH/COMPANIONSHIP/MENTORSHIP）
- `metadata`: 事件元数据（JSON格式）

### CharacterRelationshipMilestoneEntity
关系里程碑实体，记录关系发展的重要时刻。

**关键字段**:
- `milestoneType`: 里程碑类型（STAGE_TRANSITION/EMOTIONAL_CONNECTION/SHARED_EXPERIENCE）
- `fromStage`: 起始阶段
- `toStage`: 目标阶段

### CharacterMentorshipSessionEntity
导师指导会话实体，记录指导会话信息。

**关键字段**:
- `sessionType`: 会话类型（ACTIVE_GUIDANCE/PERSONALIZED_EDUCATION/GROWTH_PLANNING）
- `status`: 状态（ACTIVE/COMPLETED/ARCHIVED）
- `effectivenessScore`: 效果评分

## API 集成

### 在对话系统中集成

在 `generateAIResponse.ts` 中集成成长系统：

```typescript
// 1. 检测学习机会
await growthService.detectLearningOpportunity(characterId, userId, userMessage);

// 2. 检测情感共鸣
await companionshipService.detectAndRecordEmotionalResonance(
  characterId, userId, userMessage, aiResponse
);

// 3. 分析情境并切换模式
const context = await contextAwarenessService.analyzeContext(
  userMessage, conversationHistory, userEmotionState
);

// 4. 根据推荐模式调整AI提示词
if (context.recommendedMode === 'MENTOR') {
  // 添加导师模式的提示词
} else if (context.recommendedMode === 'COMPANION') {
  // 添加挚友模式的提示词
}
```

### 在系统集成 Hook 中扩展

在 `useSystemIntegration.ts` 中扩展：

```typescript
// 在 analyzeAndIntegrate 函数中添加
const growthContext = await memoryApi.analyzeContext(
  characterId, userId, userText, emotionState, conversationHistory
);

// 根据情境调整响应
if (growthContext.shouldSwitch) {
  // 切换到推荐模式
}
```

## 配置和扩展

### 关系阶段阈值配置

可以在 `RelationshipDepthCalculator` 中调整阶段阈值：

```java
// 修改 RelationshipStage 枚举中的 minScore 和 maxScore
STRANGER("陌生人", 0, 30),
FRIEND("朋友", 30, 60),
CLOSE_FRIEND("挚友", 60, 80),
MENTOR("导师", 80, 100);
```

### 情感连接权重配置

可以在 `EmotionalConnectionAnalyzer` 中调整权重：

```java
// 修改 calculateEmotionalConnectionScore 方法中的权重
int totalScore = (int) (
    resonanceScore * 0.3 +  // 情感共鸣权重
    memoryScore * 0.3 +     // 情感记忆权重
    emotionScore * 0.2 +     // 情绪倾向权重
    conversationScore * 0.2   // 深度对话权重
);
```

### 主动介入条件配置

可以在 `ContextAwarenessService` 中调整介入条件：

```java
// 修改 shouldIntervene 方法中的条件
// 例如：调整长时间未交互的阈值
if (timeSinceLastInteraction > 7 * 24 * 60 * 60 * 1000) {
    return true;
}
```

## 性能优化建议

1. **缓存关系阶段**: 关系阶段不需要每次都重新计算，可以缓存一段时间
2. **异步处理**: 成长事件记录可以异步处理，不阻塞主流程
3. **批量更新**: 定期批量更新关系阶段，而不是每次交互都更新
4. **索引优化**: 确保数据库表有适当的索引

## 测试指南

### 单元测试

运行单元测试：
```bash
mvn test -Dtest=CharacterGrowthServiceTest
mvn test -Dtest=RelationshipDepthCalculatorTest
```

### 集成测试

创建集成测试时，需要：
1. 使用 `@SpringBootTest` 注解
2. 配置测试数据库
3. 模拟用户和角色数据
4. 验证端到端流程

## 常见问题排查

### 问题1: 关系阶段不更新

**可能原因**:
- 关系深度分数未达到下一阶段阈值
- 数据库更新失败
- 缓存未刷新

**排查步骤**:
1. 检查关系深度分数计算是否正确
2. 查看数据库日志
3. 清除缓存后重试

### 问题2: 情感共鸣检测不准确

**可能原因**:
- 关键词检测规则不够完善
- AI分析服务不可用

**解决方案**:
- 扩展关键词列表
- 集成AI情感分析服务

### 问题3: 模式切换过于频繁

**可能原因**:
- 置信度阈值设置过低
- 情境分析不准确

**解决方案**:
- 提高模式切换的置信度阈值（默认0.6）
- 优化情境分析算法

## 扩展开发

### 添加新的事件类型

1. 在 `CharacterGrowthEventEntity` 中添加新的事件类型常量
2. 在 `CharacterGrowthService` 中添加对应的处理方法
3. 更新前端展示组件

### 添加新的关系里程碑类型

1. 在 `CharacterRelationshipMilestoneEntity` 中添加新的里程碑类型
2. 在 `CharacterCompanionshipService` 中添加记录逻辑
3. 更新前端展示

### 集成AI分析

当前的情感共鸣检测使用关键词匹配，可以扩展为AI分析：

```java
// 在 EmotionalConnectionAnalyzer 中
public boolean detectEmotionalResonance(String userMessage, String characterResponse) {
    // 调用AI服务分析情感共鸣
    return aiService.analyzeEmotionalResonance(userMessage, characterResponse);
}
```

## 参考资源

- API文档: `API_DOCUMENTATION.md`
- 用户指南: `USER_GUIDE.md`
- 设计文档: `design.md`
- 规范文档: `specs/character-growth/spec.md`
