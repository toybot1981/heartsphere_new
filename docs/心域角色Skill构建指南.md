# 心域角色 Skill 构建指南

## 概述

本文档说明如何结合 **Claude 的 Skill 规范**，在心域系统中构建面向角色的 Skill。将 Claude 的模块化 Skill 架构与心域的 Graph 流程编辑器相结合，实现灵活、可扩展的角色技能系统。

---

## 一、Claude Skill 规范回顾

### 1.1 Claude Skill 的核心概念

Claude 的 Skill 是模块化的能力系统，每个 Skill 包含：

- **Level 1：元数据**（始终加载）
  - 技能名称
  - 技能描述
  
- **Level 2：指令**（触发时加载）
  - 具体操作指南
  - 使用场景说明
  
- **Level 3：资源和代码**（按需加载）
  - 模板文件
  - 示例数据
  - 可执行脚本

### 1.2 Claude Skill 文件结构

```
skill-name/
  ├── SKILL.md          # 技能元数据和指令
  ├── templates/        # 模板文件
  ├── examples/         # 示例数据
  └── scripts/          # 可执行脚本
```

---

## 二、心域角色 Skill 系统设计

### 2.1 总体架构

将 Claude Skill 规范适配到心域系统，结合 Graph 流程编辑器实现：

```
心域角色 Skill 系统
  ├── Skill 定义层（数据库存储）
  │   ├── SkillDefinition（技能元数据）
  │   ├── SkillInstruction（技能指令）
  │   └── SkillResource（技能资源）
  │
  ├── Skill 执行层（Graph 流程）
  │   ├── SkillNode（技能执行节点）
  │   ├── SkillCheckNode（技能检查节点）
  │   └── StateChangeNode（技能状态变更）
  │
  └── Skill 应用层（角色绑定）
      ├── CharacterSkill（角色技能值）
      ├── SkillProgress（技能进度）
      └── SkillHistory（技能历史）
```

---

## 三、数据库模型设计

### 3.1 Skill 定义表

```sql
-- 技能定义表（对应 Claude Skill 的 Level 1：元数据）
CREATE TABLE skill_definitions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    skill_id VARCHAR(100) NOT NULL UNIQUE COMMENT '技能ID（唯一标识）',
    name VARCHAR(255) NOT NULL COMMENT '技能名称',
    description TEXT COMMENT '技能描述（Level 1）',
    category VARCHAR(50) COMMENT '技能分类：combat/magic/craft/social/exploration等',
    skill_type VARCHAR(50) DEFAULT 'PASSIVE' COMMENT '技能类型：ACTIVE/PASSIVE/AUTOMATIC',
    max_level INT DEFAULT 100 COMMENT '最大等级',
    base_value INT DEFAULT 0 COMMENT '基础值',
    icon_url VARCHAR(500) COMMENT '技能图标URL',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_category (category),
    INDEX idx_skill_type (skill_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='技能定义表';
```

### 3.2 Skill 指令表

```sql
-- 技能指令表（对应 Claude Skill 的 Level 2：指令）
CREATE TABLE skill_instructions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    skill_id VARCHAR(100) NOT NULL COMMENT '关联的技能ID',
    instruction_level INT DEFAULT 1 COMMENT '指令层级（1-3，对应 Claude 的 Level）',
    instruction_text TEXT NOT NULL COMMENT '指令内容',
    trigger_condition TEXT COMMENT '触发条件（JSON格式）',
    execution_order INT DEFAULT 0 COMMENT '执行顺序',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (skill_id) REFERENCES skill_definitions(skill_id) ON DELETE CASCADE,
    INDEX idx_skill_id (skill_id),
    INDEX idx_instruction_level (instruction_level)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='技能指令表';
```

### 3.3 Skill 资源表

```sql
-- 技能资源表（对应 Claude Skill 的 Level 3：资源和代码）
CREATE TABLE skill_resources (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    skill_id VARCHAR(100) NOT NULL COMMENT '关联的技能ID',
    resource_type VARCHAR(50) NOT NULL COMMENT '资源类型：template/example/script/config',
    resource_name VARCHAR(255) NOT NULL COMMENT '资源名称',
    resource_content TEXT COMMENT '资源内容（文本）',
    resource_url VARCHAR(500) COMMENT '资源URL（文件）',
    resource_order INT DEFAULT 0 COMMENT '资源顺序',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (skill_id) REFERENCES skill_definitions(skill_id) ON DELETE CASCADE,
    INDEX idx_skill_id (skill_id),
    INDEX idx_resource_type (resource_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='技能资源表';
```

### 3.4 角色技能关联表

```sql
-- 角色技能关联表（角色拥有的技能及其值）
CREATE TABLE character_skills (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    character_id BIGINT NOT NULL COMMENT '角色ID',
    skill_id VARCHAR(100) NOT NULL COMMENT '技能ID',
    current_level INT DEFAULT 0 COMMENT '当前等级（0-100）',
    experience INT DEFAULT 0 COMMENT '经验值',
    unlocked_at TIMESTAMP COMMENT '解锁时间',
    last_used_at TIMESTAMP COMMENT '最后使用时间',
    usage_count INT DEFAULT 0 COMMENT '使用次数',
    metadata TEXT COMMENT '扩展元数据（JSON格式）',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE CASCADE,
    FOREIGN KEY (skill_id) REFERENCES skill_definitions(skill_id) ON DELETE CASCADE,
    UNIQUE KEY uk_character_skill (character_id, skill_id),
    INDEX idx_character_id (character_id),
    INDEX idx_skill_id (skill_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='角色技能关联表';
```

### 3.5 技能树关系表

```sql
-- 技能树关系表（技能之间的依赖和前置关系）
CREATE TABLE skill_tree (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    parent_skill_id VARCHAR(100) NOT NULL COMMENT '父技能ID',
    child_skill_id VARCHAR(100) NOT NULL COMMENT '子技能ID',
    unlock_level INT COMMENT '解锁所需等级',
    prerequisite_skill_id VARCHAR(100) COMMENT '前置技能ID',
    required_level INT COMMENT '前置技能所需等级',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_skill_id) REFERENCES skill_definitions(skill_id) ON DELETE CASCADE,
    FOREIGN KEY (child_skill_id) REFERENCES skill_definitions(skill_id) ON DELETE CASCADE,
    INDEX idx_parent_skill (parent_skill_id),
    INDEX idx_child_skill (child_skill_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='技能树关系表';
```

---

## 四、Graph 流程编辑器中的 Skill 节点

### 4.1 SkillNode（技能执行节点）

新增一个专门的技能执行节点，用于在 Graph 流程中执行技能。

#### JSON 配置格式

```json
{
  "id": "skill_node_1",
  "nodeType": "skill",
  "nodeConfig": {
    "skillId": "combat_sword_mastery",
    "characterId": "char_1",
    "executionMode": "ACTIVE",
    "parameters": {
      "target": "enemy_1",
      "power": 1.2
    },
    "onSuccessNodeId": "skill_success",
    "onFailureNodeId": "skill_failure"
  }
}
```

#### 节点功能

- 根据技能ID加载技能定义
- 按层级加载技能指令（Level 1 → Level 2 → Level 3）
- 执行技能逻辑（调用相关脚本或API）
- 更新角色技能状态（经验值、使用次数等）
- 根据执行结果路由到不同分支

### 4.2 增强现有节点

#### StateChangeNode 扩展

支持更丰富的技能变更配置：

```json
{
  "id": "state_change_skill_1",
  "nodeType": "state_change",
  "nodeConfig": {
    "changes": [
      {
        "type": "SKILL",
        "target": "combat_sword_mastery",
        "operation": "ADD",
        "value": 5,
        "characterId": "char_1",
        "reason": "战斗胜利奖励"
      },
      {
        "type": "SKILL_EXPERIENCE",
        "target": "combat_sword_mastery",
        "operation": "ADD",
        "value": 100,
        "characterId": "char_1"
      }
    ]
  }
}
```

#### SkillCheckNode 扩展

支持检查技能的多种属性：

```json
{
  "id": "skill_check_1",
  "nodeType": "skill_check",
  "nodeConfig": {
    "characterId": "char_1",
    "skillId": "combat_sword_mastery",
    "checkType": "LEVEL",
    "operator": ">=",
    "requiredValue": 50,
    "successNodeId": "unlock_advanced_skill",
    "failureNodeId": "need_more_training"
  }
}
```

支持的检查类型：
- `LEVEL` - 检查技能等级
- `EXPERIENCE` - 检查经验值
- `USAGE_COUNT` - 检查使用次数
- `IS_UNLOCKED` - 检查是否已解锁

---

## 五、Skill 定义示例

### 5.1 示例：战斗技能 - 剑术精通

#### Skill 定义（Level 1：元数据）

```sql
INSERT INTO skill_definitions (
    skill_id, name, description, category, skill_type, max_level
) VALUES (
    'combat_sword_mastery',
    '剑术精通',
    '提高角色的近战攻击能力和剑类武器的使用熟练度。',
    'combat',
    'PASSIVE',
    100
);
```

#### Skill 指令（Level 2：指令）

```sql
INSERT INTO skill_instructions (
    skill_id, instruction_level, instruction_text, trigger_condition
) VALUES (
    'combat_sword_mastery',
    1,
    '技能名称：剑术精通\n技能类型：被动技能\n技能分类：战斗技能',
    NULL
),
(
    'combat_sword_mastery',
    2,
    '## 技能效果\n- 每级增加 2% 的近战攻击力\n- 每10级解锁新的剑技\n- 等级50以上可以使用高级剑术',
    '{"trigger": "skill_level_up", "level": 1}'
),
(
    'combat_sword_mastery',
    3,
    '## 高级效果（等级50+）\n- 解锁"二连斩"技能\n- 攻击速度提升 15%\n- 可以格挡敌人的攻击',
    '{"trigger": "skill_level_up", "level": 50}'
);
```

#### Skill 资源（Level 3：资源和代码）

```sql
INSERT INTO skill_resources (
    skill_id, resource_type, resource_name, resource_content
) VALUES (
    'combat_sword_mastery',
    'template',
    'skill_effect_template',
    '{"attackBonus": "level * 0.02", "unlockLevels": [10, 20, 30, 40, 50]}'
),
(
    'combat_sword_mastery',
    'script',
    'calculate_damage',
    'function calculateDamage(baseDamage, skillLevel) {\n  return baseDamage * (1 + skillLevel * 0.02);\n}'
),
(
    'combat_sword_mastery',
    'example',
    'usage_example',
    '当角色使用剑类武器攻击时，根据剑术精通等级计算最终伤害值。'
);
```

### 5.2 示例：魔法技能 - 火球术

#### Skill 定义

```sql
INSERT INTO skill_definitions (
    skill_id, name, description, category, skill_type, max_level
) VALUES (
    'magic_fireball',
    '火球术',
    '发射火球对敌人造成火焰伤害。',
    'magic',
    'ACTIVE',
    100
);
```

#### Skill 指令

```sql
INSERT INTO skill_instructions (
    skill_id, instruction_level, instruction_text
) VALUES (
    'magic_fireball',
    1,
    '技能名称：火球术\n技能类型：主动技能\n技能分类：魔法技能\n消耗：MP 20'
),
(
    'magic_fireball',
    2,
    '## 技能效果\n- 基础伤害：50 + (等级 * 2)\n- 攻击范围：单个目标\n- 冷却时间：3秒\n- 可以点燃目标，造成持续伤害'
),
(
    'magic_fireball',
    3,
    '## 高级效果（等级70+）\n- 解锁"爆裂火球"，可以攻击多个目标\n- 伤害提升 50%\n- 冷却时间减少到 2秒'
);
```

---

## 六、在 Graph 流程中使用 Skill

### 6.1 技能解锁流程

```
Start
  ↓
Dialogue（提示技能解锁）
  ↓
SkillCheck（检查前置条件）
  ↓
Condition（判断是否满足）
  ├─ 满足 → StateChange（解锁技能）→ Dialogue（解锁成功）
  └─ 不满足 → Dialogue（条件不足）
```

#### 节点配置示例

```json
// SkillCheck 节点 - 检查前置技能
{
  "id": "check_prerequisite",
  "nodeType": "skill_check",
  "nodeConfig": {
    "characterId": "char_1",
    "skillId": "combat_basic_sword",
    "checkType": "LEVEL",
    "operator": ">=",
    "requiredValue": 30,
    "successNodeId": "unlock_skill",
    "failureNodeId": "prerequisite_not_met"
  }
}

// StateChange 节点 - 解锁新技能
{
  "id": "unlock_skill",
  "nodeType": "state_change",
  "nodeConfig": {
    "changes": [
      {
        "type": "SKILL_UNLOCK",
        "target": "combat_sword_mastery",
        "operation": "TRIGGER",
        "characterId": "char_1"
      }
    ]
  }
}
```

### 6.2 技能使用流程

```
Start
  ↓
Choice（选择使用技能）
  ↓
SkillNode（执行技能）
  ↓
Condition（判断执行结果）
  ├─ 成功 → StateChange（增加经验）→ Dialogue（使用成功）
  └─ 失败 → Dialogue（使用失败）
```

#### 节点配置示例

```json
// SkillNode - 执行技能
{
  "id": "execute_fireball",
  "nodeType": "skill",
  "nodeConfig": {
    "skillId": "magic_fireball",
    "characterId": "char_1",
    "executionMode": "ACTIVE",
    "parameters": {
      "target": "enemy_1",
      "power": 1.0
    },
    "onSuccessNodeId": "skill_success",
    "onFailureNodeId": "skill_failure"
  }
}

// StateChange - 增加技能经验
{
  "id": "add_experience",
  "nodeType": "state_change",
  "nodeConfig": {
    "changes": [
      {
        "type": "SKILL_EXPERIENCE",
        "target": "magic_fireball",
        "operation": "ADD",
        "value": 50,
        "characterId": "char_1"
      }
    ]
  }
}
```

### 6.3 技能升级流程

```
Start
  ↓
SkillCheck（检查经验值）
  ↓
Condition（判断是否达到升级条件）
  ├─ 达到 → StateChange（升级技能）→ Dialogue（升级成功）
  └─ 未达到 → Dialogue（继续努力）
```

---

## 七、Skill 定义的最佳实践

### 7.1 遵循 Claude Skill 的三层架构

1. **Level 1（元数据）**：简洁明了，快速加载
   - 技能名称
   - 简短描述
   - 基本信息

2. **Level 2（指令）**：详细清晰，按需加载
   - 技能效果说明
   - 使用场景
   - 触发条件

3. **Level 3（资源）**：完整资源，按需加载
   - 计算脚本
   - 模板文件
   - 示例数据

### 7.2 技能分类建议

- **战斗技能**（combat）：攻击、防御、格挡等
- **魔法技能**（magic）：火球、治疗、buff等
- **工艺技能**（craft）：制作、修理、合成等
- **社交技能**（social）：说服、交易、谈判等
- **探索技能**（exploration）：搜索、解密、开锁等
- **生活技能**（life）：烹饪、钓鱼、采集等

### 7.3 技能类型

- **ACTIVE**：主动技能，需要玩家触发
- **PASSIVE**：被动技能，自动生效
- **AUTOMATIC**：自动技能，满足条件时自动触发

---

## 八、实现步骤

### 步骤1：创建数据库表

执行数据库迁移脚本，创建 Skill 相关的表。

### 步骤2：实现后端服务

创建以下服务类：

- `SkillDefinitionService` - 技能定义管理
- `SkillInstructionService` - 技能指令管理
- `SkillResourceService` - 技能资源管理
- `CharacterSkillService` - 角色技能管理
- `SkillExecutionService` - 技能执行服务

### 步骤3：实现 SkillNode

在 Graph 流程编辑器中实现 `SkillNode`，支持：
- 技能加载（按层级）
- 技能执行
- 结果路由

### 步骤4：扩展现有节点

增强 `StateChangeNode` 和 `SkillCheckNode`，支持更丰富的技能操作。

### 步骤5：创建管理界面

在 Admin 端创建 Skill 管理界面：
- Skill 定义列表
- Skill 编辑器
- 技能树可视化
- 角色技能分配

---

## 九、示例：完整的 Skill 定义流程

### 9.1 创建技能定义

```java
SkillDefinition swordMastery = SkillDefinition.builder()
    .skillId("combat_sword_mastery")
    .name("剑术精通")
    .description("提高角色的近战攻击能力")
    .category("combat")
    .skillType("PASSIVE")
    .maxLevel(100)
    .baseValue(0)
    .build();

skillDefinitionService.create(swordMastery);
```

### 9.2 添加技能指令

```java
// Level 1
SkillInstruction level1 = SkillInstruction.builder()
    .skillId("combat_sword_mastery")
    .instructionLevel(1)
    .instructionText("技能名称：剑术精通\n类型：被动技能")
    .build();

// Level 2
SkillInstruction level2 = SkillInstruction.builder()
    .skillId("combat_sword_mastery")
    .instructionLevel(2)
    .instructionText("每级增加 2% 的近战攻击力")
    .triggerCondition("{\"trigger\": \"skill_level_up\"}")
    .build();

skillInstructionService.addInstruction(level1);
skillInstructionService.addInstruction(level2);
```

### 9.3 添加技能资源

```java
SkillResource template = SkillResource.builder()
    .skillId("combat_sword_mastery")
    .resourceType("template")
    .resourceName("damage_calculation")
    .resourceContent("{\"formula\": \"baseDamage * (1 + level * 0.02)\"}")
    .build();

skillResourceService.addResource(template);
```

### 9.4 在 Graph 中使用

```json
{
  "nodes": [
    {
      "id": "use_sword_skill",
      "nodeType": "skill",
      "nodeConfig": {
        "skillId": "combat_sword_mastery",
        "characterId": "char_1",
        "executionMode": "PASSIVE"
      }
    }
  ]
}
```

---

## 十、总结

通过结合 Claude Skill 规范和心域的 Graph 流程编辑器，我们可以构建一个：

1. **模块化**：Skill 定义与执行分离
2. **可扩展**：易于添加新技能
3. **灵活**：通过 Graph 流程灵活组合
4. **渐进式**：按需加载技能内容
5. **面向角色**：每个角色可以拥有不同的技能组合

这样的系统既遵循了 Claude Skill 的最佳实践，又充分利用了心域 Graph 流程编辑器的优势。
