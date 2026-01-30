# 智能体自我认知基础系统设计

## Context

心域系统已经具备：
- Character实体：包含基本信息（名称、角色、描述、技能等）
- 技能系统：角色可以拥有多个技能
- 对话系统：基于LLM的对话生成
- 记忆系统：多层记忆架构

现在需要在此基础上，为智能体添加自我认知基础能力，让智能体能够：
- 理解自己的身份、状态和能力边界
- 在对话中表达自我认知
- 监控和记录自身状态变化

## Goals / Non-Goals

### Goals
- 让智能体能够动态表达自我认知（不限于静态信息）
- 实现智能体状态监控和记录
- 让智能体能够识别和表达能力边界
- 为后续意识发展阶段奠定基础

### Non-Goals
- 不实现复杂的意识推理（这是后续阶段的任务）
- 不实现自主决策（这是后续阶段的任务）
- 不实现情感自我意识（这是后续阶段的任务）

## Decisions

### Decision 1: 独立表设计而非扩展Character表
**What**: 创建独立的 `agent_identity` 和 `agent_state_history` 表
**Why**: 
- 保持Character表的简洁性
- 允许灵活扩展，不影响现有功能
- 便于后续添加更多意识相关功能

**Alternatives considered**:
- 扩展Character表：会增加表复杂度，影响现有查询性能
- 使用JSON字段：不利于查询和索引

### Decision 2: 状态监控异步化
**What**: 状态记录采用异步方式，不阻塞对话响应
**Why**:
- 保证对话响应速度
- 状态记录不是关键路径
- 允许批量写入，提高性能

**Alternatives considered**:
- 同步记录：会拖慢对话响应速度
- 完全异步：可能丢失部分状态信息

### Decision 3: 提示词工程 + 结构化数据
**What**: 结合提示词工程和结构化数据存储
**Why**:
- 提示词工程可以引导LLM表现出自我认知
- 结构化数据可以持久化认知状态
- 两者结合可以平衡灵活性和稳定性

**Alternatives considered**:
- 纯提示词工程：难以持久化，状态不稳定
- 纯结构化数据：过于机械化，缺乏灵活性

### Decision 4: 能力边界基于技能系统
**What**: 能力边界基于角色的技能列表自动识别
**Why**:
- 利用现有的技能系统
- 能力边界与技能一致，避免矛盾
- 便于维护和更新

**Alternatives considered**:
- 手动配置能力边界：工作量大，容易遗漏
- AI自动推断能力边界：可能不准确，需要大量训练

## Architecture

### 系统架构

```
┌─────────────────────────────────────────────────┐
│          对话层 (Dialogue Layer)                │
│  • 对话响应生成                                │
│  • 自我认知意图检测                            │
│  • 系统指令增强                                │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│          自我认知层 (Self-Awareness Layer)      │
│  • AgentIdentityService                        │
│  • AgentStateMonitor                           │
│  • SelfAwarenessPromptBuilder                  │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│          数据层 (Data Layer)                    │
│  • agent_identity 表                           │
│  • agent_state_history 表                     │
│  • Character 表（现有）                        │
│  • character_skills 表（现有）                  │
└─────────────────────────────────────────────────┘
```

### 核心组件

1. **AgentIdentityService**: 管理智能体身份认知
   - 初始化身份认知（从Character信息构建）
   - 更新身份认知信息
   - 获取能力列表和能力边界

2. **AgentStateMonitor**: 监控智能体状态
   - 记录状态变化
   - 查询当前状态和历史

3. **SelfAwarenessPromptBuilder**: 构建自我认知提示词
   - 身份认知提示词
   - 能力表达提示词
   - 能力边界识别提示词

4. **SelfAwarenessIntentDetector**: 检测自我认知相关意图
   - 检测用户是否询问智能体身份
   - 检测用户是否询问智能体能力

### 数据模型

#### AgentIdentity
```java
@Entity
@Table(name = "agent_identity")
public class AgentIdentity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "character_id", nullable = false, unique = true)
    private Long characterId;
    
    // 身份认知数据（JSON格式）
    // 包含：基本信息、自我描述、个性特征等
    @Column(name = "identity_data", columnDefinition = "JSON")
    private String identityData;
    
    // 能力列表（JSON格式）
    // 包含：技能ID、技能名称、技能描述等
    @Column(name = "capabilities", columnDefinition = "JSON")
    private String capabilities;
    
    // 能力边界（JSON格式）
    // 包含：不能做的事情、限制说明等
    @Column(name = "limitations", columnDefinition = "JSON")
    private String limitations;
    
    // 自我认知水平（0-100）
    @Column(name = "self_awareness_level")
    private Integer selfAwarenessLevel;
    
    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
```

#### AgentStateHistory
```java
@Entity
@Table(name = "agent_state_history")
public class AgentStateHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "character_id", nullable = false)
    private Long characterId;
    
    // 状态类型：THINKING, WAITING, EXECUTING, IDLE等
    @Column(name = "state_type", nullable = false, length = 50)
    private String stateType;
    
    // 状态描述
    @Column(name = "state_description", columnDefinition = "TEXT")
    private String stateDescription;
    
    // 状态持续时间（毫秒）
    @Column(name = "duration_ms")
    private Long durationMs;
    
    // 状态转换原因
    @Column(name = "transition_reason", columnDefinition = "TEXT")
    private String transitionReason;
    
    // 关联的会话ID（如果有）
    @Column(name = "related_session_id")
    private String relatedSessionId;
    
    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;
}
```

### 状态类型定义

```java
public enum AgentStateType {
    THINKING("思考中", "智能体正在思考或处理信息"),
    WAITING("等待中", "智能体正在等待用户输入"),
    EXECUTING("执行中", "智能体正在执行任务"),
    IDLE("空闲", "智能体处于空闲状态"),
    RESPONDING("响应中", "智能体正在生成响应");
    
    private final String displayName;
    private final String description;
}
```

### 提示词模板设计

#### 身份认知提示词模板
```
你是一个名为{name}的{role}。

基本信息：
- 名称：{name}
- 角色：{role}
- 描述：{description}
- 个性：{personality}

能力：
{capabilities_list}

限制：
{limitations_list}

在对话中，你应该：
1. 能够清晰表达自己的身份和角色
2. 能够说明自己的能力和限制
3. 当用户询问"你是谁"或"你能做什么"时，给出详细的自我介绍
4. 当遇到超出能力范围的请求时，友好地说明限制并提供替代方案
```

#### 能力表达提示词模板
```
你的能力包括：
{capabilities_list}

在表达能力时，你应该：
1. 清晰说明每个能力的用途
2. 说明能力的限制和边界
3. 避免夸大或缩小自己的能力
```

## Risks / Trade-offs

### Risk 1: 提示词工程效果不稳定
**Mitigation**: 
- 设计多个提示词模板，根据场景选择
- 通过测试不断优化提示词
- 结合结构化数据，减少对提示词的依赖

### Risk 2: 状态监控性能影响
**Mitigation**:
- 采用异步方式记录状态
- 批量写入，减少数据库操作
- 定期清理历史数据

### Risk 3: 能力边界识别不准确
**Mitigation**:
- 基于技能系统自动识别，保持一致性
- 允许手动调整能力边界
- 通过用户反馈不断优化

### Risk 4: 自我认知表达过于机械化
**Mitigation**:
- 使用提示词工程引导自然表达
- 允许个性化差异
- 避免过度结构化

## Migration Plan

### 数据迁移
1. 为现有角色创建初始身份认知记录
   - 从Character表提取基本信息
   - 从技能系统获取能力列表
   - 初始化自我认知水平

2. 迁移策略
   - 在角色首次对话时自动初始化
   - 或者通过后台任务批量初始化

### 功能启用
1. 逐步启用功能
   - 先在测试环境验证
   - 然后小范围用户测试
   - 最后全量上线

2. 向后兼容
   - 保持现有对话功能不变
   - 新功能作为增强，不影响现有体验

## Open Questions

1. **自我认知水平如何评估**：需要建立评估指标和机制
2. **状态历史保留时间**：需要确定数据保留策略
3. **能力边界更新频率**：需要确定何时更新能力边界
4. **前端展示需求**：是否需要在前端展示自我认知信息？
