# Design: HSMem 记忆类型分析与 ChatWindow 记忆集成优化

## Context

### 当前状态

1. **hsmem 系统**：
   - 三层架构：Resource Layer → Memory Item Layer → Memory Category Layer
   - 记忆类型：preference, habit, personal_info, text_memory, document, general
   - 存储方式：文件系统（JSON + Markdown）
   - 定位：长期记忆系统，提供持久化存储

2. **Backend 记忆系统**：
   - MemoryType 枚举：包含 PERSONAL_INFO, PREFERENCE, HABIT, IMPORTANT_MOMENT 等
   - 存储：MySQL（user_memories 表）
   - 短期记忆：Redis（会话上下文）
   - 长期记忆：MySQL（用户事实、偏好等）

3. **Frontend 记忆系统**：
   - MemorySystem：前端记忆管理
   - memoryApi：调用 backend API
   - ChatWindow：使用记忆系统提取和检索记忆

### 问题分析

1. **记忆类型不统一**：
   - hsmem 使用小写下划线格式（preference, personal_info）
   - Backend 使用大写下划线格式（PREFERENCE, PERSONAL_INFO）
   - 需要建立映射关系

2. **长短期记忆边界不清**：
   - 短期记忆和长期记忆的使用场景需要明确
   - hsmem 作为长期记忆系统，需要与短期记忆系统（Redis）区分

3. **ChatWindow 记忆使用不完善**：
   - 记忆检索时机不明确
   - 记忆注入方式需要优化
   - 记忆类型识别不够智能

## Goals / Non-Goals

### Goals

1. **统一记忆类型体系**：
   - 建立 hsmem memory_type 与 Backend MemoryType 的映射关系
   - 支持图中提到的 Event, Habit, Asset, Work 等类型

2. **明确长短期记忆边界**：
   - 短期记忆：会话上下文、工作记忆（Redis）
   - 长期记忆：用户事实、偏好、习惯（MySQL + hsmem）

3. **优化 ChatWindow 记忆使用**：
   - 在生成 AI 响应前检索相关长期记忆
   - 将检索到的记忆作为上下文注入 AI 提示词
   - 在对话完成后提取并保存记忆到 hsmem

### Non-Goals

- 不改变 hsmem 系统的核心架构
- 不改变 Backend MemoryType 枚举的定义
- 不重构现有的记忆存储系统

## Decisions

### Decision 1: 记忆类型映射策略

**选择**：建立双向映射表，支持 hsmem memory_type 与 Backend MemoryType 的转换

**理由**：
- hsmem 和 Backend 使用不同的命名规范
- 需要在前端和后端之间进行类型转换
- 映射表可以集中管理类型对应关系

**实现**：
```typescript
// 前端映射表
const MEMORY_TYPE_MAP = {
  'preference': MemoryType.PREFERENCE,
  'habit': MemoryType.HABIT,
  'personal_info': MemoryType.PERSONAL_INFO,
  'text_memory': MemoryType.CONVERSATION_TOPIC,
  'document': MemoryType.CREATED_CONTENT,
  'general': MemoryType.CONVERSATION_TOPIC,
  // 扩展类型
  'event': MemoryType.IMPORTANT_MOMENT,
  'asset': MemoryType.PERSONAL_INFO,
  'work': MemoryType.CONVERSATION_TOPIC,
};
```

### Decision 2: 长短期记忆使用策略

**选择**：
- **短期记忆**：用于当前会话上下文，通过 Redis 快速访问
- **长期记忆**：用于跨会话记忆，通过 hsmem 和 MySQL 持久化存储
- **记忆巩固**：重要信息从短期记忆转为长期记忆

**理由**：
- 短期记忆需要快速访问，适合 Redis
- 长期记忆需要持久化，适合 MySQL + hsmem
- 记忆巩固机制符合认知科学原理

### Decision 3: ChatWindow 记忆检索时机

**选择**：在生成 AI 响应前检索相关长期记忆

**理由**：
- 需要在生成响应前获取上下文信息
- 长期记忆提供用户画像和偏好信息
- 检索结果作为系统提示词的一部分

**实现流程**：
1. 用户发送消息
2. 检索相关长期记忆（基于用户输入关键词）
3. 将检索到的记忆注入系统提示词
4. 生成 AI 响应
5. 对话完成后提取记忆并保存到 hsmem

### Decision 4: 记忆类型自动识别

**选择**：基于关键词和 LLM 增强识别记忆类型

**理由**：
- 关键词匹配可以快速识别常见类型
- LLM 增强可以提高识别准确率
- 支持 Event, Habit, Asset, Work 等扩展类型

**实现**：
- 关键词匹配：识别常见模式（"喜欢" → preference, "每天" → habit）
- LLM 增强：使用 AI 分析对话内容，识别复杂类型（Event, Asset, Work）

## Risks / Trade-offs

### Risk 1: 记忆类型映射不一致

**风险**：hsmem 和 Backend 使用不同的类型定义，可能导致数据不一致

**缓解**：
- 建立完整的映射表
- 在 API 层进行类型转换
- 添加类型验证

### Risk 2: 记忆检索性能问题

**风险**：频繁检索长期记忆可能影响响应速度

**缓解**：
- 使用缓存机制
- 限制检索数量（默认 3-5 条）
- 异步检索，不阻塞主流程

### Risk 3: 记忆注入过多导致 Token 消耗

**风险**：将大量记忆注入提示词会增加 Token 消耗

**缓解**：
- 限制注入的记忆数量
- 使用记忆摘要而非完整内容
- 根据重要性筛选记忆

## Migration Plan

### Phase 1: 分析和设计（当前阶段）
- 完成记忆类型分析
- 建立映射关系
- 设计 ChatWindow 记忆使用方案

### Phase 2: 实现映射和检索
- 实现记忆类型映射
- 实现记忆检索功能
- 优化记忆检索性能

### Phase 3: 实现记忆注入
- 实现记忆注入到 AI 提示词
- 优化提示词构建逻辑
- 测试记忆注入效果

### Phase 4: 优化记忆提取
- 实现记忆类型自动识别
- 优化记忆提取流程
- 实现记忆重要性评分

### Phase 5: 测试和优化
- 编写测试用例
- 性能优化
- 用户体验优化

## Open Questions

1. **Event, Habit, Asset, Work 类型的具体定义**：
   - Event：重要事件、里程碑
   - Habit：用户习惯、行为模式
   - Asset：用户资产、资源
   - Work：工作相关、职业信息
   - 这些类型在 hsmem 中如何表示？

2. **记忆检索策略**：
   - 基于关键词检索还是语义检索？
   - 检索数量如何确定？
   - 如何平衡检索准确性和性能？

3. **记忆注入方式**：
   - 如何将记忆格式化后注入提示词？
   - 记忆的优先级如何确定？
   - 如何避免记忆冲突？
