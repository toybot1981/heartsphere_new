# Skill 系统独立模块

## 一、模块设计理念

### 1.1 独立性原则

**Skill 系统是一个完全独立的模块**，不依赖其他业务模块：

- ✅ **独立的包结构**：`com.heartsphere.skill`
- ✅ **不建立 JPA 关系**：实体类之间不建立 `@ManyToOne` 等关系
- ✅ **只存储 ID**：通过 ID 关联，不直接引用其他模块的实体
- ✅ **独立的服务层**：所有业务逻辑在 skill 包内完成
- ✅ **独立的 Repository**：数据访问层独立

### 1.2 为什么保持独立？

1. **解耦**：技能系统可以独立开发、测试、部署
2. **复用**：未来可以在其他项目中复用
3. **维护**：修改技能系统不影响其他模块
4. **扩展**：易于扩展和替换

---

## 二、包结构

```
com.heartsphere.skill/
├── entity/              # 实体类
│   ├── SkillDefinition.java
│   ├── SkillInstruction.java
│   ├── SkillResource.java
│   ├── CharacterSkillBinding.java
│   ├── CharacterSkill.java
│   ├── SkillExecution.java
│   ├── SkillPrerequisite.java
│   └── SkillConflict.java
├── repository/          # Repository 接口（待创建）
├── service/             # 服务层（待创建）
├── dto/                 # DTO 类（待创建）
├── exception/           # 异常类（待创建）
└── config/              # 配置类（待创建）
```

---

## 三、实体类说明

### 3.1 核心实体

#### SkillDefinition（技能定义）
- **用途**：存储技能的基本信息和配置
- **对应表**：`skill_definitions`
- **关键字段**：
  - `function_schema` - Function Calling JSON Schema
  - `execution_type` - 执行类型
  - `execution_config` - 执行配置

#### SkillInstruction（技能指令）
- **用途**：存储技能的详细指令（Level 1-3）
- **对应表**：`skill_instructions`
- **关键字段**：
  - `instruction_level` - 指令层级
  - `instruction_text` - 指令内容

#### SkillResource（技能资源）
- **用途**：存储技能的资源文件（模板、脚本等）
- **对应表**：`skill_resources`
- **关键字段**：
  - `resource_type` - 资源类型
  - `resource_content` - 资源内容

### 3.2 关联实体

#### CharacterSkillBinding（角色技能装备）
- **用途**：管理角色装备的技能及其配置
- **对应表**：`character_skill_bindings`
- **关键字段**：
  - `is_enabled` - 是否启用
  - `auto_trigger` - 是否自动触发
  - `priority` - 优先级

#### CharacterSkill（角色技能）
- **用途**：存储角色技能的等级和经验值（游戏化）
- **对应表**：`character_skills`
- **关键字段**：
  - `current_level` - 当前等级
  - `experience` - 经验值

### 3.3 辅助实体

#### SkillExecution（技能执行记录）
- **用途**：记录所有技能的执行历史
- **对应表**：`skill_executions`

#### SkillPrerequisite（技能前置条件）
- **用途**：定义技能解锁的前置条件
- **对应表**：`skill_prerequisites`

#### SkillConflict（技能冲突）
- **用途**：定义不能同时装备的技能
- **对应表**：`skill_conflicts`

---

## 四、设计原则

### 4.1 不建立 JPA 关系

**原因**：保持模块独立，避免循环依赖

**实现方式**：
```java
// ❌ 不这样做
@ManyToOne
@JoinColumn(name = "character_id")
private Character character;

// ✅ 这样做
@Column(name = "character_id")
private Long characterId;
```

### 4.2 通过 ID 关联

**如果需要访问其他模块的实体**：
- 通过 ID 查询
- 使用独立的服务接口
- 不直接引用实体类

### 4.3 数据完整性

**通过数据库外键保证**：
- 数据库层面的外键约束
- 应用层面的验证逻辑

---

## 五、使用示例

### 5.1 查询角色装备的技能

```java
// 在 SkillService 中
public List<SkillDefinition> getCharacterSkills(Long characterId) {
    // 1. 查询装备关系
    List<CharacterSkillBinding> bindings = 
        characterSkillBindingRepository.findByCharacterId(characterId);
    
    // 2. 获取技能ID列表
    List<String> skillIds = bindings.stream()
        .map(CharacterSkillBinding::getSkillId)
        .collect(Collectors.toList());
    
    // 3. 查询技能定义
    return skillDefinitionRepository.findBySkillIdIn(skillIds);
}
```

### 5.2 装备技能

```java
// 在 SkillService 中
public void equipSkill(Long characterId, String skillId) {
    // 1. 检查技能是否存在
    SkillDefinition skill = skillDefinitionRepository
        .findBySkillId(skillId)
        .orElseThrow(() -> new SkillNotFoundException(skillId));
    
    // 2. 检查前置条件
    checkPrerequisites(characterId, skillId);
    
    // 3. 检查冲突
    checkConflicts(characterId, skillId);
    
    // 4. 创建装备关系
    CharacterSkillBinding binding = CharacterSkillBinding.builder()
        .characterId(characterId)
        .skillId(skillId)
        .isEnabled(true)
        .autoTrigger(false)
        .priority(0)
        .build();
    
    characterSkillBindingRepository.save(binding);
}
```

---

## 六、后续开发

### 6.1 Repository 层
- [ ] SkillDefinitionRepository
- [ ] SkillInstructionRepository
- [ ] SkillResourceRepository
- [ ] CharacterSkillBindingRepository
- [ ] CharacterSkillRepository
- [ ] SkillExecutionRepository
- [ ] SkillPrerequisiteRepository
- [ ] SkillConflictRepository

### 6.2 Service 层
- [ ] SkillRegistry（技能注册表）
- [ ] SkillExecutor（技能执行器）
- [ ] CharacterSkillService（角色技能服务）

### 6.3 DTO 层
- [ ] SkillDefinitionDTO
- [ ] CharacterSkillBindingDTO
- [ ] SkillExecutionResultDTO

---

**最后更新**：2025-01-04
