# 心域角色 Skill 构建指南 - 使用示例

## 一、完整的 Skill 创建流程

### 示例：创建一个"社交技能 - 说服"

#### 步骤1：创建技能定义（Level 1）

```sql
INSERT INTO skill_definitions (
    skill_id, name, description, category, skill_type, max_level
) VALUES (
    'social_persuasion',
    '说服',
    '提高角色的说服能力，在对话和谈判中更容易说服他人。',
    'social',
    'PASSIVE',
    100
);
```

#### 步骤2：添加技能指令（Level 2）

```sql
-- Level 1 指令
INSERT INTO skill_instructions (skill_id, instruction_level, instruction_text)
VALUES (
    'social_persuasion',
    1,
    '技能名称：说服\n技能类型：被动技能\n技能分类：社交技能\n最大等级：100'
);

-- Level 2 指令
INSERT INTO skill_instructions (skill_id, instruction_level, instruction_text)
VALUES (
    'social_persuasion',
    2,
    '## 技能效果\n- 每级增加 1% 的说服成功率\n- 等级30以上可以在对话中选择说服选项\n- 等级60以上可以解锁高级说服技巧\n- 等级90以上可以影响他人的决策'
);
```

#### 步骤3：添加技能资源（Level 3）

```sql
-- 说服成功率计算模板
INSERT INTO skill_resources (skill_id, resource_type, resource_name, resource_content)
VALUES (
    'social_persuasion',
    'template',
    'persuasion_calculation',
    '{"formula": "baseSuccessRate + (skillLevel * 0.01)", "maxBonus": 0.5}'
);
```

---

## 二、在 Graph 流程中使用 Skill

### 示例：技能解锁流程

#### Graph 节点配置

```json
{
  "nodes": [
    {
      "id": "start_skill_unlock",
      "nodeType": "start"
    },
    {
      "id": "dialogue_unlock_hint",
      "nodeType": "dialogue",
      "nodeConfig": {
        "content": "你完成了基础训练，现在可以学习新技能了！",
        "speaker": "系统"
      }
    },
    {
      "id": "check_prerequisite",
      "nodeType": "skill_check",
      "nodeConfig": {
        "characterId": "char_1",
        "skillId": "combat_basic_sword",
        "checkType": "LEVEL",
        "operator": ">=",
        "requiredValue": 30,
        "successNodeId": "unlock_sword_mastery",
        "failureNodeId": "prerequisite_not_met"
      }
    },
    {
      "id": "unlock_sword_mastery",
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
            "value": 1,
            "characterId": "char_1"
          }
        ]
      }
    },
    {
      "id": "dialogue_unlock_success",
      "nodeType": "dialogue",
      "nodeConfig": {
        "content": "恭喜！你已解锁"剑术精通"技能！",
        "speaker": "系统"
      }
    }
  ],
  "edges": [
    {
      "sourceNodeId": "start_skill_unlock",
      "targetNodeId": "dialogue_unlock_hint"
    },
    {
      "sourceNodeId": "dialogue_unlock_hint",
      "targetNodeId": "check_prerequisite"
    },
    {
      "sourceNodeId": "unlock_sword_mastery",
      "targetNodeId": "dialogue_unlock_success"
    }
  ]
}
```

---

## 三、技能训练流程

### 示例：通过战斗训练剑术技能

#### 流程设计

```
Start → Dialogue（选择训练方式）→ Choice（选择技能）→ 
SkillNode（执行训练）→ StateChange（增加经验）→ 
Condition（检查是否升级）→ StateChange（升级技能）→ 
Dialogue（训练结果）→ End
```

#### 关键节点配置

```json
// Choice - 选择训练的技能
{
  "id": "choice_training_skill",
  "nodeType": "choice",
  "nodeConfig": {
    "prompt": "选择要训练的技能：",
    "options": [
      {
        "id": "train_sword",
        "text": "训练剑术精通",
        "nextNodeId": "execute_sword_training",
        "effects": {
          "skillChange": {
            "combat_sword_mastery": 0
          }
        }
      }
    ]
  }
}

// StateChange - 增加技能经验
{
  "id": "add_skill_experience",
  "nodeType": "state_change",
  "nodeConfig": {
    "changes": [
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

// Condition - 检查是否达到升级条件
{
  "id": "check_level_up",
  "nodeType": "condition",
  "nodeConfig": {
    "logic": "AND",
    "conditions": [
      {
        "type": "SKILL_EXPERIENCE",
        "target": "combat_sword_mastery",
        "operator": ">=",
        "value": 1000
      }
    ],
    "trueNodeId": "level_up",
    "falseNodeId": "training_complete"
  }
}

// StateChange - 升级技能
{
  "id": "level_up",
  "nodeType": "state_change",
  "nodeConfig": {
    "changes": [
      {
        "type": "SKILL",
        "target": "combat_sword_mastery",
        "operation": "ADD",
        "value": 1,
        "characterId": "char_1"
      },
      {
        "type": "SKILL_EXPERIENCE",
        "target": "combat_sword_mastery",
        "operation": "SET",
        "value": 0,
        "characterId": "char_1"
      }
    ]
  }
}
```

---

## 四、技能检查和使用流程

### 示例：根据技能等级解锁不同对话选项

```json
// Choice - 对话选项（根据技能等级显示）
{
  "id": "dialogue_choice",
  "nodeType": "choice",
  "nodeConfig": {
    "prompt": "选择回应：",
    "options": [
      {
        "id": "normal_response",
        "text": "普通回应",
        "nextNodeId": "normal_dialogue"
      },
      {
        "id": "persuade_response",
        "text": "尝试说服（需要说服技能>=30）",
        "nextNodeId": "persuade_dialogue",
        "conditions": [
          {
            "type": "SKILL",
            "target": "social_persuasion",
            "operator": ">=",
            "value": 30
          }
        ]
      },
      {
        "id": "advanced_persuade",
        "text": "高级说服技巧（需要说服技能>=60）",
        "nextNodeId": "advanced_persuade_dialogue",
        "conditions": [
          {
            "type": "SKILL",
            "target": "social_persuasion",
            "operator": ">=",
            "value": 60
          }
        ]
      }
    ]
  }
}
```

---

## 五、技能效果应用流程

### 示例：战斗中使用技能

```json
// SkillNode - 执行技能（未来实现）
{
  "id": "use_fireball",
  "nodeType": "skill",
  "nodeConfig": {
    "skillId": "magic_fireball",
    "characterId": "char_1",
    "executionMode": "ACTIVE",
    "parameters": {
      "target": "enemy_1",
      "power": 1.0
    },
    "onSuccessNodeId": "fireball_hit",
    "onFailureNodeId": "fireball_missed"
  }
}

// StateChange - 增加技能使用次数和经验
{
  "id": "update_skill_usage",
  "nodeType": "state_change",
  "nodeConfig": {
    "changes": [
      {
        "type": "SKILL_USAGE",
        "target": "magic_fireball",
        "operation": "ADD",
        "value": 1,
        "characterId": "char_1"
      },
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

---

## 六、技能树系统

### 示例：技能前置关系

```sql
-- 基础技能
INSERT INTO skill_definitions (skill_id, name, description, category)
VALUES ('combat_basic_sword', '基础剑术', '学习使用剑类武器的基础技能', 'combat');

-- 高级技能（需要基础技能30级）
INSERT INTO skill_tree (parent_skill_id, child_skill_id, unlock_level, prerequisite_skill_id, required_level)
VALUES (
    'combat_basic_sword',
    'combat_sword_mastery',
    30,
    'combat_basic_sword',
    30
);

-- 终极技能（需要剑术精通70级）
INSERT INTO skill_tree (parent_skill_id, child_skill_id, unlock_level, prerequisite_skill_id, required_level)
VALUES (
    'combat_sword_mastery',
    'combat_sword_ultimate',
    70,
    'combat_sword_mastery',
    70
);
```

---

## 七、在 X6 编辑器中操作

### 步骤1：创建技能解锁 Graph

1. 创建新 Graph，命名为"技能解锁流程"
2. 添加 Start 节点
3. 添加 Dialogue 节点：提示可以解锁技能
4. 添加 SkillCheck 节点：检查前置条件
5. 添加 Condition 节点：判断是否满足
6. 添加 StateChange 节点：解锁技能并设置初始等级
7. 添加 Dialogue 节点：显示解锁成功
8. 连接所有节点

### 步骤2：配置 SkillCheck 节点

- 双击 SkillCheck 节点
- 在属性面板中配置：
  - **技能ID**: `combat_basic_sword`
  - **检查类型**: `LEVEL`
  - **运算符**: `>=`
  - **需要值**: `30`
  - **成功节点**: 选择解锁节点
  - **失败节点**: 选择提示节点

### 步骤3：配置 StateChange 节点

- 双击 StateChange 节点
- 在属性面板中添加变更：
  - **变更类型**: `SKILL_UNLOCK`
  - **目标**: `combat_sword_mastery`
  - **操作**: `TRIGGER`
  
- 再添加一个变更：
  - **变更类型**: `SKILL`
  - **目标**: `combat_sword_mastery`
  - **操作**: `SET`
  - **值**: `1`

### 步骤4：保存并测试

1. 点击"保存"按钮
2. 使用 Graph 执行 API 测试流程
3. 检查角色技能是否正确解锁

---

## 八、常见场景

### 场景1：角色创建时初始化技能

```json
{
  "nodeType": "state_change",
  "nodeConfig": {
    "changes": [
      {"type": "SKILL_UNLOCK", "target": "combat_basic_sword", "operation": "TRIGGER", "characterId": "char_1"},
      {"type": "SKILL", "target": "combat_basic_sword", "operation": "SET", "value": 10, "characterId": "char_1"},
      {"type": "SKILL_UNLOCK", "target": "magic_fireball", "operation": "TRIGGER", "characterId": "char_1"},
      {"type": "SKILL", "target": "magic_fireball", "operation": "SET", "value": 5, "characterId": "char_1"}
    ]
  }
}
```

### 场景2：战斗胜利后提升技能

```json
{
  "nodeType": "state_change",
  "nodeConfig": {
    "changes": [
      {"type": "SKILL_EXPERIENCE", "target": "combat_sword_mastery", "operation": "ADD", "value": 200, "characterId": "char_1"},
      {"type": "SKILL_EXPERIENCE", "target": "combat_sword_mastery", "operation": "ADD", "value": 100, "characterId": "char_1"}
    ]
  }
}
```

### 场景3：技能升级检查

```json
{
  "nodeType": "condition",
  "nodeConfig": {
    "logic": "AND",
    "conditions": [
      {"type": "SKILL_EXPERIENCE", "target": "combat_sword_mastery", "operator": ">=", "value": 1000},
      {"type": "SKILL", "target": "combat_sword_mastery", "operator": "<", "value": 100}
    ],
    "trueNodeId": "level_up",
    "falseNodeId": "no_level_up"
  }
}
```

---

## 九、总结

通过结合 Claude Skill 规范和心域 Graph 流程编辑器，你可以：

1. **定义技能**：使用三层架构（元数据、指令、资源）
2. **管理技能**：通过数据库表存储技能定义和关系
3. **执行技能**：在 Graph 流程中使用各种节点
4. **应用技能**：将技能绑定到角色并跟踪进度

这样的设计既符合 Claude Skill 的最佳实践，又充分利用了 Graph 流程编辑器的灵活性。
