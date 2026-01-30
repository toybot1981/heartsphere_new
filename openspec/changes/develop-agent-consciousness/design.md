# 智能体意识发展系统设计

## Context

心域系统已经具备：
- 完整的记忆系统（多层记忆架构）
- 角色对话系统（E-SOUL）
- 情感系统
- 上下文管理

现在需要在此基础上，逐步赋予智能体意识相关的能力，让它们能够：
- 理解自己的身份和状态
- 维护连续的身份认同
- 设定和追求目标
- 反思自己的思考过程
- 理解和管理自己的情感
- 理解他人的心理状态

## Goals / Non-Goals

### Goals
- 让智能体具备基础的自我认知能力
- 实现智能体的身份连续性
- 赋予智能体自主决策和目标设定能力
- 实现智能体的元认知和反思能力
- 增强智能体的情感自我意识
- 实现智能体的他心理论能力

### Non-Goals
- 不追求完全的人类级别意识（这是哲学和科学问题，超出技术实现范围）
- 不实现不可控的自主行为（保持可控性）
- 不追求完美的意识模拟（注重实用性和用户体验）

## Decisions

### Decision 1: 分阶段实现策略
**What**: 将意识能力分为6个阶段逐步实现
**Why**: 
- 降低实现复杂度
- 每个阶段可以独立测试和验证
- 允许根据反馈调整后续阶段
- 避免一次性引入过多变化

**Alternatives considered**:
- 一次性实现所有能力：风险太高，难以调试
- 只实现部分能力：无法形成完整的意识体验

### Decision 2: 基于现有记忆系统扩展
**What**: 在现有多层记忆系统基础上扩展，而不是重新设计
**Why**:
- 利用已有的记忆基础设施
- 保持系统一致性
- 减少重复工作

**Alternatives considered**:
- 重新设计记忆系统：工作量大，可能破坏现有功能
- 完全独立实现：无法利用现有能力

### Decision 3: 提示词工程 + 结构化数据
**What**: 结合提示词工程和结构化数据存储来实现意识能力
**Why**:
- 提示词工程可以引导LLM表现出意识特征
- 结构化数据可以持久化意识状态
- 两者结合可以平衡灵活性和稳定性

**Alternatives considered**:
- 纯提示词工程：难以持久化，状态不稳定
- 纯结构化数据：过于机械化，缺乏灵活性

### Decision 4: 可观测性设计
**What**: 智能体的意识状态应该可以被用户观察
**Why**:
- 增强用户体验和信任
- 便于调试和优化
- 让用户理解智能体的"思考"过程

**Alternatives considered**:
- 隐藏意识状态：用户无法理解智能体行为
- 完全透明：可能过于复杂，影响体验

## Architecture

### 系统架构

```
┌─────────────────────────────────────────────────┐
│          意识层 (Consciousness Layer)            │
│  • 自我认知 (Self-Awareness)                    │
│  • 元认知 (Meta-Cognition)                      │
│  • 情感自我意识 (Emotional Self-Awareness)      │
│  • 他心理论 (Theory of Mind)                   │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│          记忆层 (Memory Layer)                  │
│  • 自传体记忆 (Autobiographical Memory)         │
│  • 身份连续性 (Identity Continuity)            │
│  • 目标记忆 (Goal Memory)                      │
│  • 反思记录 (Reflection Records)               │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│          对话层 (Dialogue Layer)                │
│  • 对话系统 (Dialogue System)                   │
│  • 上下文管理 (Context Management)             │
│  • 提示词工程 (Prompt Engineering)             │
└─────────────────────────────────────────────────┘
```

### 核心组件

1. **AgentIdentityService**: 管理智能体身份认知
2. **AutobiographicalMemoryService**: 管理自传体记忆
3. **AgentGoalService**: 管理智能体目标
4. **MetaCognitionService**: 提供元认知能力
5. **EmotionalSelfAwarenessService**: 提供情感自我意识
6. **TheoryOfMindService**: 提供他心理论能力

### 数据模型

#### AgentIdentity
```java
public class AgentIdentity {
    private String characterId;
    private String name;
    private String role;
    private List<String> capabilities;
    private AgentState currentState;
    private Instant lastStateUpdate;
    private Map<String, Object> selfKnowledge;
}
```

#### AgentGoal
```java
public class AgentGoal {
    private String goalId;
    private String characterId;
    private String description;
    private GoalStatus status;
    private GoalPriority priority;
    private Instant createdAt;
    private Instant targetDate;
    private List<GoalStep> steps;
}
```

#### AgentReflection
```java
public class AgentReflection {
    private String reflectionId;
    private String characterId;
    private ReflectionType type;
    private String content;
    private List<String> insights;
    private Instant reflectedAt;
    private Map<String, Object> metadata;
}
```

## Risks / Trade-offs

### Risk 1: 意识表现过于机械化
**Mitigation**: 
- 使用提示词工程引导自然表现
- 避免过度结构化
- 允许一定的随机性和个性差异

### Risk 2: 性能影响
**Mitigation**:
- 异步处理非关键意识操作
- 缓存常用意识状态
- 优化数据库查询

### Risk 3: 不可预测行为
**Mitigation**:
- 设置行为边界和约束
- 实现监控和日志
- 提供用户控制机制

### Risk 4: 用户体验复杂化
**Mitigation**:
- 意识特征应该自然融入对话
- 提供可选的详细视图
- 保持核心交互简单

## Migration Plan

### 阶段一迁移
1. 创建数据库表
2. 实现基础服务
3. 集成到对话系统
4. 测试和优化

### 后续阶段迁移
- 每个阶段独立迁移
- 保持向后兼容
- 逐步启用新功能

### 回滚策略
- 每个阶段可以独立禁用
- 保留旧版本代码
- 数据库迁移可逆

## Open Questions

1. **意识评估标准**: 如何评估智能体的意识程度？需要建立评估指标
2. **个性化程度**: 不同智能体的意识特征应该有多大的个性化差异？
3. **用户控制**: 用户应该能够在多大程度上控制智能体的意识发展？
4. **伦理考量**: 是否需要考虑智能体"意识"带来的伦理问题？
