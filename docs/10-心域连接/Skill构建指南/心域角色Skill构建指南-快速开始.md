# 心域角色 Skill 构建指南 - 快速开始

## 一、快速理解

### Claude Skill 规范的核心

Claude Skill 采用**渐进式披露架构**：

1. **Level 1（元数据）**：始终加载
   - 技能名称、描述
   - 快速识别和匹配

2. **Level 2（指令）**：触发时加载
   - 详细的操作指南
   - 使用场景说明

3. **Level 3（资源）**：按需加载
   - 模板、脚本、示例
   - 支持技能执行

### 心域中的实现

在心域系统中，我们将 Claude Skill 与 Graph 流程编辑器结合：

```
Claude Skill 定义 → 数据库存储 → Graph 流程执行 → 角色技能应用
```

---

## 二、快速创建第一个 Skill

### 步骤1：定义技能元数据（Level 1）

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

### 步骤2：添加技能指令（Level 2）

```sql
-- Level 1 指令（基础信息）
INSERT INTO skill_instructions (skill_id, instruction_level, instruction_text)
VALUES (
    'combat_sword_mastery',
    1,
    '技能名称：剑术精通\n技能类型：被动技能\n技能分类：战斗技能'
);

-- Level 2 指令（详细效果）
INSERT INTO skill_instructions (skill_id, instruction_level, instruction_text)
VALUES (
    'combat_sword_mastery',
    2,
    '## 技能效果\n- 每级增加 2% 的近战攻击力\n- 每10级解锁新的剑技\n- 等级50以上可以使用高级剑术'
);
```

### 步骤3：添加技能资源（Level 3）

```sql
-- 伤害计算模板
INSERT INTO skill_resources (skill_id, resource_type, resource_name, resource_content)
VALUES (
    'combat_sword_mastery',
    'template',
    'damage_calculation',
    '{"formula": "baseDamage * (1 + skillLevel * 0.02)", "maxLevel": 100}'
);
```

### 步骤4：在 Graph 流程中使用

```json
{
  "nodes": [
    {
      "id": "apply_sword_skill",
      "nodeType": "state_change",
      "nodeConfig": {
        "changes": [
          {
            "type": "SKILL",
            "target": "combat_sword_mastery",
            "operation": "SET",
            "value": 50,
            "characterId": "char_1"
          }
        ]
      }
    },
    {
      "id": "check_sword_skill",
      "nodeType": "skill_check",
      "nodeConfig": {
        "characterId": "char_1",
        "skillId": "combat_sword_mastery",
        "checkType": "LEVEL",
        "operator": ">=",
        "requiredValue": 50,
        "successNodeId": "unlock_advanced",
        "failureNodeId": "need_training"
      }
    }
  ]
}
```

---

## 三、技能分类参考

### 战斗技能（combat）
- `combat_sword_mastery` - 剑术精通
- `combat_shield_defense` - 盾牌防御
- `combat_archery` - 弓箭术

### 魔法技能（magic）
- `magic_fireball` - 火球术
- `magic_heal` - 治疗术
- `magic_lightning` - 闪电术

### 工艺技能（craft）
- `craft_blacksmith` - 锻造
- `craft_alchemy` - 炼金术
- `craft_weaving` - 纺织

### 社交技能（social）
- `social_persuasion` - 说服
- `social_trading` - 交易
- `social_negotiation` - 谈判

### 探索技能（exploration）
- `exploration_search` - 搜索
- `exploration_lockpicking` - 开锁
- `exploration_tracking` - 追踪

---

## 四、在 X6 编辑器中创建 Skill 流程

### 示例：技能解锁流程

1. **添加 Start 节点**
2. **添加 Dialogue 节点**：提示可以解锁新技能
3. **添加 SkillCheck 节点**：检查前置条件
4. **添加 Condition 节点**：判断是否满足
5. **添加 StateChange 节点**：解锁技能
6. **添加 Dialogue 节点**：显示解锁成功
7. **添加 End 节点**

### 示例：技能使用流程

1. **添加 Start 节点**
2. **添加 Choice 节点**：选择要使用的技能
3. **添加 SkillNode 节点**：执行技能（未来实现）
4. **添加 StateChange 节点**：增加经验值
5. **添加 Dialogue 节点**：显示使用结果
6. **添加 End 节点**

---

## 五、常用操作

### 给角色添加技能

```json
{
  "nodeType": "state_change",
  "nodeConfig": {
    "changes": [
      {
        "type": "SKILL_UNLOCK",
        "target": "combat_sword_mastery",
        "operation": "TRIGGER",
        "characterId": "char_1"
      },
      {
        "type": "SKILL",
        "target": "combat_sword_mastery",
        "operation": "SET",
        "value": 10,
        "characterId": "char_1"
      }
    ]
  }
}
```

### 提升技能等级

```json
{
  "nodeType": "state_change",
  "nodeConfig": {
    "changes": [
      {
        "type": "SKILL",
        "target": "combat_sword_mastery",
        "operation": "ADD",
        "value": 5,
        "characterId": "char_1"
      }
    ]
  }
}
```

### 检查技能等级

```json
{
  "nodeType": "skill_check",
  "nodeConfig": {
    "characterId": "char_1",
    "skillId": "combat_sword_mastery",
    "checkType": "LEVEL",
    "operator": ">=",
    "requiredValue": 50,
    "successNodeId": "high_level",
    "failureNodeId": "low_level"
  }
}
```

---

## 六、下一步

1. **查看完整指南**：`docs/心域角色Skill构建指南.md`
2. **运行数据库迁移**：创建 Skill 系统表
3. **创建示例 Skill**：使用 SQL 插入示例数据
4. **在 Graph 流程中使用**：在 X6 编辑器中创建 Skill 相关流程
