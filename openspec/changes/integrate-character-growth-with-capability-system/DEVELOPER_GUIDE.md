# 开发者指南：能力体系整合

## 概述

本文档为开发者提供能力体系整合的技术指南，包括架构设计、API使用、数据模型和集成方式。

## 架构设计

### 模块结构

能力体系作为独立模块 `com.heartsphere.capability`，通过事件驱动集成现有系统。

```
com.heartsphere.capability/
├── entity/              # 实体类
│   ├── RoleCapabilityProfile.java
│   ├── CapabilityExperience.java
│   ├── CapabilityAssessment.java
│   └── CapabilitySynergyLog.java
├── repository/          # 数据访问层
├── service/            # 服务层
│   ├── integration/    # 整合服务
│   ├── growth/         # 成长服务
│   ├── assessment/     # 评估服务
│   ├── personalization/# 个性化服务
│   └── visualization/  # 可视化服务
└── controller/         # 控制器层
```

### 能力维度

系统支持5个能力维度：

1. **技能维度**（Skill）：技能熟练度、成功率、使用频率
2. **记忆维度**（Memory）：记忆质量、检索精度、关联度
3. **意识维度**（Consciousness）：意识成熟度、自主性、反思能力
4. **协作维度**（Collaboration）：协作效率、互补性、沟通能力
5. **关系维度**（Relationship）：挚友能力、导师能力、关系管理能力

### 集成方式

能力体系通过以下方式集成现有系统：

1. **事件监听**：监听技能执行、记忆更新、关系进展等事件
2. **ID关联**：通过 `character_id` 关联现有数据（不建立JPA外键）
3. **服务调用**：通过服务接口调用现有服务（如 `CharacterMentorshipService`）

## API 使用

### 能力评估

```java
@Autowired
private CapabilityAssessmentService assessmentService;

// 全面能力评估
FullCapabilityAssessmentDTO assessment = 
    assessmentService.assessAllCapabilities(characterId, userId);

// 获取最新评估
Optional<CapabilityAssessment> latest = 
    assessmentService.getLatestFullAssessment(characterId);
```

### 能力成长

```java
@Autowired
private CapabilityExperienceService experienceService;

// 添加经验值
experienceService.addSkillExperience(characterId, 10);
experienceService.addRelationshipExperience(characterId, 5);

// 获取经验值
CapabilityExperience experience = 
    experienceService.getExperience(characterId);
```

### 能力协同

```java
@Autowired
private CapabilitySynergyEngine synergyEngine;

// 处理技能-记忆协同
synergyEngine.processSkillMemorySynergy(characterId, skillId, true);

// 处理关系-技能协同
synergyEngine.processRelationshipSkillSynergy(
    characterId, userId, skillId, "guidance");
```

### 能力个性化

```java
@Autowired
private CapabilityPersonalizationService personalizationService;

// 基于关系定位个性化
CapabilityPersonalizationDTO personalization = 
    personalizationService.personalizeByRelationship(characterId, userId);

// 获取发展建议
List<DevelopmentSuggestion> suggestions = 
    personalizationService.getDevelopmentSuggestions(characterId, userId);
```

## 数据模型

### RoleCapabilityProfile

角色能力档案，存储角色的多维度能力得分。

```java
@Entity
@Table(name = "role_capability_profile")
public class RoleCapabilityProfile {
    private Long characterId;
    private Integer skillDimensionScore;
    private Integer memoryDimensionScore;
    private Integer consciousnessDimensionScore;
    private Integer collaborationDimensionScore;
    private Integer relationshipDimensionScore;  // 关系维度
    private Integer mentorshipCapabilityScore;    // 导师能力
    private Integer companionshipCapabilityScore; // 挚友能力
    private Integer overallScore;
}
```

### CapabilityExperience

能力经验值，记录各维度的经验积累。

```java
@Entity
@Table(name = "capability_experience")
public class CapabilityExperience {
    private Long characterId;
    private Long skillExperience;
    private Long memoryExperience;
    private Long consciousnessExperience;
    private Long collaborationExperience;
    private Long relationshipExperience;  // 关系经验
    private Long mentorshipExperience;     // 导师经验
    private Long companionshipExperience;  // 挚友经验
}
```

## 事件驱动集成

### 监听成长事件

```java
@EventListener
public void onGrowthEvent(GrowthEvent event) {
    // 将成长事件转换为能力经验值
    experienceService.addExperienceFromGrowthEvent(
        event.getCharacterId(), event);
}
```

### 监听关系进展

```java
@EventListener
public void onRelationshipStageChanged(RelationshipStageChangedEvent event) {
    // 关系阶段变化触发能力成长
    linkageService.onRelationshipStageChanged(
        event.getCharacterId(), 
        event.getUserId(),
        event.getOldStage(),
        event.getNewStage());
}
```

## 测试

### 单元测试

使用 Mockito 进行单元测试：

```java
@ExtendWith(MockitoExtension.class)
class CapabilityAssessmentServiceTest {
    @Mock
    private CapabilityAssessmentRepository repository;
    
    @InjectMocks
    private CapabilityAssessmentService service;
    
    @Test
    void testAssessAllCapabilities() {
        // 测试代码
    }
}
```

### 集成测试

使用 Spring Boot Test 进行集成测试：

```java
@SpringBootTest
@Transactional
class CapabilityRelationshipLinkageIntegrationTest {
    @Autowired
    private CapabilityRelationshipLinkageService linkageService;
    
    @Test
    void testRelationshipStageAffectsCapabilityGrowth() {
        // 测试代码
    }
}
```

## 最佳实践

1. **异步处理**：能力评估和成长计算应异步处理，避免阻塞主流程
2. **缓存结果**：能力评估结果应缓存，减少重复计算
3. **错误处理**：集成服务调用应包含错误处理，避免影响主流程
4. **数据一致性**：定期同步能力体系数据与现有关系数据

## 常见问题

### Q: 如何添加新的能力维度？

A: 扩展 `RoleCapabilityProfile` 和 `CapabilityExperience` 实体，添加新维度字段，更新评估和成长服务。

### Q: 如何自定义能力协同规则？

A: 在 `CapabilitySynergyEngine` 中添加新的协同处理方法，定义协同规则和效果。

### Q: 如何处理数据不一致？

A: 使用 `RelationshipCapabilityIntegrationService.syncRelationshipData()` 方法同步数据。

## 参考文档

- [API文档](./API_DOCUMENTATION.md)
- [整合说明](./IMPLEMENTATION_SUMMARY.md)
- [设计文档](./design.md)
