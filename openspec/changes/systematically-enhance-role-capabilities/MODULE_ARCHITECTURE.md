# 模块架构设计：角色能力体系

## 问题分析

当前提案中，角色能力体系计划放在 `com.heartsphere.role.capability/` 下，但需要考虑：

1. **是否应该作为独立模块？**（类似 `skill`、`memory`、`multiagent`）
2. **如何与现有模块集成？**
3. **模块边界如何划分？**

## 当前模块组织原则

从现有代码结构分析：

### 独立模块的特征
- **skill** 模块：完全独立，不依赖其他业务模块，只通过 ID 关联
- **memory** 模块：独立模块，提供记忆服务
- **multiagent** 模块：基础设施层，可被多个应用场景使用

### 模块独立性原则
1. **独立的包结构**：`com.heartsphere.{module}`
2. **不建立 JPA 关系**：实体类之间不建立 `@ManyToOne` 等关系
3. **只存储 ID**：通过 ID 关联，不直接引用其他模块的实体
4. **独立的服务层**：所有业务逻辑在模块内完成
5. **独立的 Repository**：数据访问层独立

## 角色能力体系的特点

### 1. 整合层特性
- **不是独立业务领域**：能力体系是整合层，整合技能、记忆、意识、协作
- **依赖多个现有模块**：需要与 skill、memory、consciousness、multiagent 集成
- **提供统一抽象**：在现有系统之上提供统一的能力抽象

### 2. 功能范围
- 能力模型和协同引擎
- 能力成长系统
- 能力评估和优化
- 能力个性化
- 能力可视化

## 建议：作为独立模块

### 理由

1. **功能完整性**
   - 能力体系有完整的功能边界（整合、成长、评估、个性化、可视化）
   - 有独立的数据模型（能力档案、经验值、评估记录等）
   - 有独立的业务逻辑

2. **可维护性**
   - 独立模块便于开发、测试、维护
   - 修改能力体系不影响其他模块
   - 清晰的模块边界

3. **可扩展性**
   - 未来可以扩展更多能力维度
   - 可以支持不同的能力模型
   - 可以独立演进

4. **符合现有架构**
   - 与 `skill`、`memory`、`multiagent` 等模块保持一致的组织方式
   - 遵循模块独立性原则

### 模块结构建议

```
com.heartsphere.capability/          # 独立模块
├── entity/                          # 实体类
│   ├── RoleCapabilityProfile.java
│   ├── CapabilityExperience.java
│   ├── CapabilityAssessment.java
│   ├── CapabilitySynergyLog.java
│   ├── CapabilityPersonalizationProfile.java
│   ├── CapabilityPreference.java
│   └── CapabilityCombination.java
├── repository/                      # Repository 接口
│   ├── RoleCapabilityProfileRepository.java
│   ├── CapabilityExperienceRepository.java
│   └── ...
├── service/                         # 服务层
│   ├── integration/                 # 能力整合
│   │   ├── CapabilityModelService.java
│   │   └── CapabilitySynergyEngine.java
│   ├── growth/                      # 能力成长
│   │   ├── CapabilityExperienceService.java
│   │   ├── CapabilityLevelService.java
│   │   └── CapabilityLearningService.java
│   ├── assessment/                  # 能力评估
│   │   ├── CapabilityAssessmentService.java
│   │   └── CapabilityOptimizationService.java
│   ├── personalization/            # 能力个性化
│   │   ├── CapabilityPersonalizationService.java
│   │   └── CapabilityCombinationService.java
│   └── visualization/              # 能力可视化
│       └── CapabilityVisualizationService.java
├── dto/                             # DTO 类
│   ├── CapabilityProfileDTO.java
│   ├── CapabilityAssessmentDTO.java
│   └── ...
├── controller/                      # API 控制器
│   └── CapabilityController.java
├── config/                          # 配置类
│   └── CapabilityConfig.java
└── exception/                       # 异常类
    └── CapabilityException.java
```

## 模块间集成方式

### 1. 通过 ID 关联（不建立 JPA 关系）

```java
// ✅ 正确：只存储 ID
@Entity
public class RoleCapabilityProfile {
    @Column(name = "role_id")
    private Long roleId;  // 不建立 @ManyToOne 关系
    
    @Column(name = "skill_id")
    private Long skillId;  // 不建立 @ManyToOne 关系
}

// ❌ 错误：建立 JPA 关系
@Entity
public class RoleCapabilityProfile {
    @ManyToOne
    private Role role;  // 不要这样做
}
```

### 2. 通过服务接口调用

```java
// capability 模块调用其他模块的服务
@Service
public class CapabilitySynergyEngine {
    @Autowired(required = false)
    private SkillApplicationEngine skillEngine;  // 来自 ai.skill 模块
    
    @Autowired(required = false)
    private MemoryManager memoryManager;  // 来自 memory 模块
}
```

### 3. 通过事件驱动（推荐）

```java
// capability 模块监听其他模块的事件
@Component
public class CapabilityEventProcessor {
    @EventListener
    public void onSkillExecuted(SkillExecutedEvent event) {
        // 更新能力经验值
        // 记录能力协同日志
    }
}
```

## 与现有模块的关系

### 依赖关系图

```
capability (角色能力体系)
    ├── 依赖 skill (技能系统) - 获取技能执行信息
    ├── 依赖 memory (记忆系统) - 获取记忆信息
    ├── 依赖 aiagent.consciousness (意识系统) - 获取意识状态
    └── 依赖 multiagent (多智能体) - 获取协作信息

skill, memory, consciousness, multiagent
    └── 不依赖 capability (保持独立性)
```

### 集成点

1. **技能系统集成**
   - 监听技能执行事件
   - 更新技能相关能力经验值
   - 记录技能-能力关联

2. **记忆系统集成**
   - 监听记忆更新事件
   - 更新记忆相关能力经验值
   - 记录记忆-能力关联

3. **意识系统集成**
   - 监听意识状态变化事件
   - 更新意识相关能力经验值
   - 记录意识-能力关联

4. **多智能体集成**
   - 监听协作事件
   - 更新协作相关能力经验值
   - 记录协作-能力关联

## 实施建议

### 阶段一：模块创建
1. 创建 `com.heartsphere.capability` 独立模块
2. 定义模块边界和依赖关系
3. 实现基础的能力模型和数据结构

### 阶段二：模块集成
1. 通过事件机制集成现有模块
2. 实现能力协同引擎
3. 实现能力查询 API

### 阶段三：功能完善
1. 实现能力成长系统
2. 实现能力评估和优化
3. 实现能力个性化和可视化

## 总结

**建议：将角色能力体系作为独立模块 `com.heartsphere.capability`**

**理由**：
- ✅ 功能完整，有独立的数据模型和业务逻辑
- ✅ 符合现有模块组织原则
- ✅ 便于维护和扩展
- ✅ 通过事件驱动和 ID 关联保持模块独立性

**模块组织**：
- 独立包结构：`com.heartsphere.capability`
- 不建立 JPA 关系，只通过 ID 关联
- 通过事件驱动和服务接口集成其他模块
- 保持其他模块的独立性（不反向依赖）
