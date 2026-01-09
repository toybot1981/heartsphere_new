# Graph 流程编辑器 - 角色技能编辑指南

## 概述

本文档详细说明如何通过 Graph 流程编辑器来编辑和管理角色的各项技能。Graph 流程编辑器提供了多种节点类型，可以灵活地实现技能查看、修改、验证和条件判断等功能。

---

## 一、技能编辑的核心节点类型

### 1. StateChangeNode（状态变更节点）- **核心编辑节点**

**功能**：直接修改角色的技能值，支持三种操作方式。

#### 支持的技能操作类型

| 操作类型 | 说明 | 适用场景 |
|---------|------|---------|
| `ADD` | 增加技能值 | 技能训练、升级、获得经验 |
| `SUBTRACT` | 减少技能值 | 技能退化、惩罚、消耗 |
| `SET` | 设置为指定值 | 初始化、重置、直接设置 |

#### JSON 配置格式

```json
{
  "id": "state_change_skill_1",
  "nodeType": "state_change",
  "nodeConfig": {
    "changes": [
      {
        "type": "SKILL",
        "target": "strength",
        "operation": "ADD",
        "value": 10
      },
      {
        "type": "SKILL",
        "target": "intelligence",
        "operation": "SET",
        "value": 50
      },
      {
        "type": "SKILL",
        "target": "agility",
        "operation": "SUBTRACT",
        "value": 5
      }
    ]
  }
}
```

#### 配置说明

- **type**: `"SKILL"` - 表示修改技能值
- **target**: 技能ID（如 `"strength"`, `"intelligence"`, `"agility"`, `"vitality"` 等）
- **operation**: `"ADD"` / `"SUBTRACT"` / `"SET"`
- **value**: 数值（整数），技能值自动限制在 0-100 范围内

---

### 2. SkillCheckNode（技能检查节点）- **验证节点**

**功能**：检查角色的技能值是否满足条件，用于技能验证和条件分支。

#### JSON 配置格式

```json
{
  "id": "skill_check_1",
  "nodeType": "skill_check",
  "nodeConfig": {
    "characterId": "char_1",
    "skillId": "strength",
    "operator": ">=",
    "requiredValue": 50,
    "successNodeId": "node_success",
    "failureNodeId": "node_failure"
  }
}
```

#### 配置说明

- **characterId**: 角色ID（可选，为空则检查玩家角色）
- **skillId**: 要检查的技能ID
- **operator**: 运算符（`">"`, `"<"`, `">="`, `"<="`, `"=="`, `"!="`）
- **requiredValue**: 需要的技能值
- **successNodeId**: 检查成功时的下一个节点
- **failureNodeId**: 检查失败时的下一个节点

---

### 3. ConditionNode（条件判断节点）- **条件分支节点**

**功能**：根据技能值进行条件判断，支持更复杂的逻辑组合。

#### JSON 配置格式

```json
{
  "id": "condition_skill_1",
  "nodeType": "condition",
  "nodeConfig": {
    "logic": "AND",
    "conditions": [
      {
        "type": "SKILL",
        "target": "strength",
        "operator": ">=",
        "value": 50
      },
      {
        "type": "SKILL",
        "target": "intelligence",
        "operator": ">=",
        "value": 30
      }
    ],
    "trueNodeId": "node_high_skills",
    "falseNodeId": "node_low_skills"
  }
}
```

#### 配置说明

- **logic**: `"AND"` / `"OR"` - 逻辑组合方式
- **conditions**: 条件列表，每个条件包含：
  - **type**: `"SKILL"` - 技能条件
  - **target**: 技能ID
  - **operator**: 运算符
  - **value**: 比较值

---

### 4. ChoiceNode（选择节点）- **交互式编辑节点**

**功能**：通过用户选择来修改技能值，每个选择可以有不同的技能变化效果。

#### JSON 配置格式

```json
{
  "id": "choice_skill_1",
  "nodeType": "choice",
  "nodeConfig": {
    "prompt": "选择你的技能训练方向：",
    "options": [
      {
        "id": "train_strength",
        "text": "训练力量（力量+5，敏捷-2）",
        "nextNodeId": "next_node",
        "effects": {
          "skillChange": {
            "strength": 5,
            "agility": -2
          }
        }
      },
      {
        "id": "train_intelligence",
        "text": "训练智力（智力+5，力量-2）",
        "nextNodeId": "next_node",
        "effects": {
          "skillChange": {
            "intelligence": 5,
            "strength": -2
          }
        }
      }
    ]
  }
}
```

#### 配置说明

- **options**: 选项列表，每个选项包含：
  - **id**: 选项ID
  - **text**: 选项文本
  - **effects.skillChange**: 技能变化（Map<技能ID, 变化值>）
    - 正数表示增加
    - 负数表示减少

---

### 5. DialogueNode（对话节点）- **信息展示节点**

**功能**：显示技能信息，可以展示当前技能值。

#### JSON 配置格式

```json
{
  "id": "dialogue_skill_info",
  "nodeType": "dialogue",
  "nodeConfig": {
    "content": "你当前的技能值：\n力量：{{strength}}\n智力：{{intelligence}}\n敏捷：{{agility}}",
    "speaker": "系统",
    "type": "dialogue"
  }
}
```

---

### 6. WaitNode（等待节点）- **用户输入节点**

**功能**：等待用户输入技能值，用于直接编辑技能。

#### JSON 配置格式

```json
{
  "id": "wait_skill_input",
  "nodeType": "wait",
  "nodeConfig": {
    "waitType": "USER_INPUT",
    "waitCondition": "skillValueInput",
    "timeout": 60000,
    "nextNodeId": "process_skill_input"
  }
}
```

---

## 二、技能编辑流程设计模式

### 模式1：直接设置模式

**适用场景**：初始化角色技能、重置技能、直接设置技能值

**流程**：
```
Start → Dialogue（提示）→ StateChange（SET操作）→ Dialogue（确认）→ End
```

**示例节点配置**：

```json
// StateChange 节点
{
  "id": "init_skills",
  "nodeType": "state_change",
  "nodeConfig": {
    "changes": [
      {"type": "SKILL", "target": "strength", "operation": "SET", "value": 50},
      {"type": "SKILL", "target": "intelligence", "operation": "SET", "value": 50},
      {"type": "SKILL", "target": "agility", "operation": "SET", "value": 50},
      {"type": "SKILL", "target": "vitality", "operation": "SET", "value": 50}
    ]
  }
}
```

---

### 模式2：训练/升级模式

**适用场景**：通过训练、升级、获得经验来提升技能

**流程**：
```
Start → Dialogue（提示）→ Choice（选择训练方向）→ StateChange（ADD操作）→ Dialogue（结果）→ End
```

**示例节点配置**：

```json
// Choice 节点
{
  "id": "choice_training",
  "nodeType": "choice",
  "nodeConfig": {
    "prompt": "选择训练方向：",
    "options": [
      {
        "id": "train_strength",
        "text": "力量训练（力量+5）",
        "nextNodeId": "apply_training",
        "effects": {"skillChange": {"strength": 5}}
      },
      {
        "id": "train_intelligence",
        "text": "智力训练（智力+5）",
        "nextNodeId": "apply_training",
        "effects": {"skillChange": {"intelligence": 5}}
      }
    ]
  }
}

// StateChange 节点（由 Choice 的效果自动应用，或手动添加）
{
  "id": "apply_training",
  "nodeType": "state_change",
  "nodeConfig": {
    "changes": [
      {"type": "SKILL", "target": "strength", "operation": "ADD", "value": 5}
    ]
  }
}
```

---

### 模式3：技能点分配模式

**适用场景**：分配技能点、角色创建时的技能配置

**流程**：
```
Start → Dialogue（提示）→ Wait（输入技能点）→ Condition（验证总点数）→ StateChange（分配技能）→ Dialogue（确认）→ End
```

**示例节点配置**：

```json
// Wait 节点 - 等待用户输入
{
  "id": "wait_skill_points",
  "nodeType": "wait",
  "nodeConfig": {
    "waitType": "USER_INPUT",
    "waitCondition": "skillPointsAllocated",
    "timeout": 120000,
    "nextNodeId": "validate_points"
  }
}

// Condition 节点 - 验证技能点总和
{
  "id": "validate_points",
  "nodeType": "condition",
  "nodeConfig": {
    "logic": "AND",
    "conditions": [
      {
        "type": "VARIABLE",
        "target": "totalSkillPoints",
        "operator": "<=",
        "value": 20
      }
    ],
    "trueNodeId": "apply_skill_points",
    "falseNodeId": "error_too_many_points"
  }
}

// StateChange 节点 - 应用技能点分配
{
  "id": "apply_skill_points",
  "nodeType": "state_change",
  "nodeConfig": {
    "changes": [
      {"type": "SKILL", "target": "strength", "operation": "SET", "value": "{{strengthPoints}}"},
      {"type": "SKILL", "target": "intelligence", "operation": "SET", "value": "{{intelligencePoints}}"},
      {"type": "SKILL", "target": "agility", "operation": "SET", "value": "{{agilityPoints}}"},
      {"type": "SKILL", "target": "vitality", "operation": "SET", "value": "{{vitalityPoints}}"}
    ]
  }
}
```

---

### 模式4：技能验证模式

**适用场景**：根据技能值解锁功能、检查技能是否满足要求

**流程**：
```
Start → SkillCheck（检查技能）→ [成功分支/失败分支] → Dialogue（结果）→ End
```

**示例节点配置**：

```json
// SkillCheck 节点
{
  "id": "check_strength",
  "nodeType": "skill_check",
  "nodeConfig": {
    "skillId": "strength",
    "operator": ">=",
    "requiredValue": 50,
    "successNodeId": "unlock_feature",
    "failureNodeId": "need_training"
  }
}
```

---

### 模式5：平衡调整模式

**适用场景**：技能平衡调整、属性重新分配

**流程**：
```
Start → Dialogue（提示）→ Choice（选择调整方案）→ StateChange（同时调整多个技能）→ Dialogue（确认）→ End
```

**示例节点配置**：

```json
// StateChange 节点 - 平衡调整
{
  "id": "balance_skills",
  "nodeType": "state_change",
  "nodeConfig": {
    "changes": [
      {"type": "SKILL", "target": "strength", "operation": "ADD", "value": 10},
      {"type": "SKILL", "target": "intelligence", "operation": "SUBTRACT", "value": 5},
      {"type": "SKILL", "target": "agility", "operation": "ADD", "value": 5}
    ]
  }
}
```

---

## 三、完整技能编辑流程示例

### 示例：角色技能管理系统

这是一个完整的技能编辑流程，包含查看、修改、验证等功能。

#### 流程结构

```
Start
  ↓
Dialogue（欢迎进入技能管理）
  ↓
Choice（选择操作：查看/修改/验证/退出）
  ↓
  ├─ 查看 → Dialogue（显示技能信息）→ 返回 Choice
  ├─ 修改 → Choice（选择修改方式）
  │         ├─ 直接设置 → Wait（输入新值）→ StateChange（SET）→ 返回 Choice
  │         ├─ 增加 → Wait（输入增加值）→ StateChange（ADD）→ 返回 Choice
  │         └─ 减少 → Wait（输入减少值）→ StateChange（SUBTRACT）→ 返回 Choice
  ├─ 验证 → SkillCheck（检查技能）→ Dialogue（结果）→ 返回 Choice
  └─ 退出 → End
```

#### 关键节点配置

**1. 主选择节点**：

```json
{
  "id": "main_choice",
  "nodeType": "choice",
  "nodeConfig": {
    "prompt": "请选择操作：",
    "options": [
      {"id": "view", "text": "查看技能", "nextNodeId": "view_skills"},
      {"id": "edit", "text": "编辑技能", "nextNodeId": "edit_choice"},
      {"id": "validate", "text": "验证技能", "nextNodeId": "validate_skills"},
      {"id": "exit", "text": "退出", "nextNodeId": "end"}
    ]
  }
}
```

**2. 查看技能节点**：

```json
{
  "id": "view_skills",
  "nodeType": "dialogue",
  "nodeConfig": {
    "content": "当前技能值：\n力量：{{strength}}\n智力：{{intelligence}}\n敏捷：{{agility}}\n体质：{{vitality}}",
    "speaker": "系统",
    "type": "dialogue"
  }
}
```

**3. 编辑选择节点**：

```json
{
  "id": "edit_choice",
  "nodeType": "choice",
  "nodeConfig": {
    "prompt": "选择要编辑的技能：",
    "options": [
      {"id": "edit_strength", "text": "编辑力量", "nextNodeId": "wait_strength"},
      {"id": "edit_intelligence", "text": "编辑智力", "nextNodeId": "wait_intelligence"},
      {"id": "edit_agility", "text": "编辑敏捷", "nextNodeId": "wait_agility"},
      {"id": "edit_vitality", "text": "编辑体质", "nextNodeId": "wait_vitality"},
      {"id": "back", "text": "返回", "nextNodeId": "main_choice"}
    ]
  }
}
```

**4. 等待输入节点**：

```json
{
  "id": "wait_strength",
  "nodeType": "wait",
  "nodeConfig": {
    "waitType": "USER_INPUT",
    "waitCondition": "newStrengthValue",
    "timeout": 60000,
    "nextNodeId": "apply_strength_change"
  }
}
```

**5. 应用修改节点**：

```json
{
  "id": "apply_strength_change",
  "nodeType": "state_change",
  "nodeConfig": {
    "changes": [
      {"type": "SKILL", "target": "strength", "operation": "SET", "value": "{{newStrengthValue}}"}
    ]
  }
}
```

**6. 技能验证节点**：

```json
{
  "id": "validate_skills",
  "nodeType": "skill_check",
  "nodeConfig": {
    "skillId": "strength",
    "operator": ">=",
    "requiredValue": 50,
    "successNodeId": "skill_high_enough",
    "failureNodeId": "skill_too_low"
  }
}
```

---

## 四、在 X6 编辑器中的实际操作步骤

### 步骤1：创建新的 Graph 或打开现有 Graph

1. 打开 Admin 管理端
2. 进入 Graph 流程编辑器
3. 创建新 Graph 或选择"角色技能编辑"示例

### 步骤2：添加节点

1. 从左侧侧边栏拖拽节点类型到画布
2. 双击节点打开属性面板
3. 配置节点属性

### 步骤3：配置 StateChange 节点（技能修改）

1. 选择 `state_change` 节点类型
2. 在属性面板中配置：
   - **节点ID**: `skill_edit_1`
   - **变更列表**: 点击"添加变更"
   - **变更类型**: 选择 `SKILL`
   - **目标技能**: 输入技能ID（如 `strength`）
   - **操作类型**: 选择 `ADD` / `SUBTRACT` / `SET`
   - **值**: 输入数值（如 `10`）

### 步骤4：配置 Choice 节点（选择编辑）

1. 选择 `choice` 节点类型
2. 在属性面板中配置：
   - **提示**: "选择要编辑的技能："
   - **选项列表**: 添加选项
   - 每个选项可以配置 `effects.skillChange` 来直接修改技能

### 步骤5：配置 SkillCheck 节点（验证）

1. 选择 `skill_check` 节点类型
2. 在属性面板中配置：
   - **技能ID**: `strength`
   - **运算符**: `>=`
   - **需要值**: `50`
   - **成功节点**: 选择成功后的节点
   - **失败节点**: 选择失败后的节点

### 步骤6：连接节点

1. 从节点的底部端口拖拽到目标节点的顶部端口
2. 对于条件分支，连接时选择条件（true/false）

### 步骤7：保存和测试

1. 点击顶部"保存"按钮
2. 使用 Graph 执行 API 测试流程
3. 查看执行日志，确认技能修改是否正确

---

## 五、常见技能编辑场景

### 场景1：角色创建时的技能初始化

**流程**：
```
Start → Dialogue（欢迎）→ Choice（选择职业）→ StateChange（应用职业基础技能）→ Dialogue（确认）→ End
```

**StateChange 配置**：
- 战士：`strength: 60, vitality: 50, agility: 40, intelligence: 30`
- 法师：`intelligence: 60, agility: 40, vitality: 30, strength: 30`

### 场景2：技能训练系统

**流程**：
```
Start → Dialogue（选择训练）→ Choice（训练类型）→ StateChange（增加技能）→ SkillCheck（检查是否达到上限）→ Dialogue（结果）→ End
```

**StateChange 配置**：
- 力量训练：`strength: +5`
- 智力训练：`intelligence: +5`
- 敏捷训练：`agility: +5`

### 场景3：技能重置系统

**流程**：
```
Start → Dialogue（确认重置）→ Choice（确认/取消）→ StateChange（重置所有技能为0）→ StateChange（分配重置后的技能点）→ End
```

**StateChange 配置**：
```json
{
  "changes": [
    {"type": "SKILL", "target": "strength", "operation": "SET", "value": 0},
    {"type": "SKILL", "target": "intelligence", "operation": "SET", "value": 0},
    {"type": "SKILL", "target": "agility", "operation": "SET", "value": 0},
    {"type": "SKILL", "target": "vitality", "operation": "SET", "value": 0}
  ]
}
```

### 场景4：技能平衡调整

**流程**：
```
Start → Dialogue（提示）→ StateChange（调整多个技能）→ Dialogue（显示调整后）→ End
```

**StateChange 配置**：
```json
{
  "changes": [
    {"type": "SKILL", "target": "strength", "operation": "SUBTRACT", "value": 10},
    {"type": "SKILL", "target": "intelligence", "operation": "ADD", "value": 10}
  ]
}
```

---

## 六、技能数据结构

### GraphState 中的技能存储

技能值存储在 `GraphState` 的 `character_skills` 数据中：

```java
Map<String, Integer> character_skills = {
  "strength": 50,
  "intelligence": 45,
  "agility": 40,
  "vitality": 55
}
```

### 常用技能ID

- `strength` - 力量
- `intelligence` - 智力
- `agility` - 敏捷
- `vitality` - 体质
- `charisma` - 魅力
- `wisdom` - 智慧
- `endurance` - 耐力
- `luck` - 幸运

---

## 七、最佳实践

### 1. 技能值范围限制

- 所有技能值自动限制在 **0-100** 范围内
- 使用 `SET` 操作时，确保值在有效范围内
- 使用 `ADD` / `SUBTRACT` 时，系统会自动限制范围

### 2. 技能验证

- 在修改技能前，使用 `SkillCheckNode` 验证当前值
- 在修改技能后，使用 `ConditionNode` 验证修改结果
- 在关键操作前，检查技能是否满足要求

### 3. 用户体验

- 使用 `DialogueNode` 显示当前技能值
- 使用 `ChoiceNode` 提供直观的选择界面
- 使用 `WaitNode` 等待用户确认重要操作

### 4. 数据一致性

- 技能点分配时，验证总点数不超过限制
- 技能平衡调整时，确保调整后的总和合理
- 使用多个 `StateChangeNode` 时，注意执行顺序

---

## 八、常见问题

### Q1: 如何同时修改多个技能？

A: 在一个 `StateChangeNode` 的 `changes` 数组中添加多个变更：

```json
{
  "changes": [
    {"type": "SKILL", "target": "strength", "operation": "ADD", "value": 5},
    {"type": "SKILL", "target": "intelligence", "operation": "ADD", "value": 3}
  ]
}
```

### Q2: 如何在修改前检查技能值？

A: 使用 `SkillCheckNode` 或 `ConditionNode`：

```json
{
  "id": "check_before_edit",
  "nodeType": "skill_check",
  "nodeConfig": {
    "skillId": "strength",
    "operator": ">=",
    "requiredValue": 30,
    "successNodeId": "allow_edit",
    "failureNodeId": "deny_edit"
  }
}
```

### Q3: 如何根据技能值显示不同的选项？

A: 在 `ChoiceNode` 的选项中添加条件：

```json
{
  "options": [
    {
      "id": "advanced_training",
      "text": "高级训练（需要力量>=50）",
      "conditions": [
        {"type": "SKILL", "target": "strength", "operator": ">=", "value": 50}
      ],
      "nextNodeId": "advanced_training_node"
    }
  ]
}
```

### Q4: 如何实现技能点分配系统？

A: 使用 `WaitNode` 等待输入，然后使用 `StateChangeNode` 的 `SET` 操作：

1. `WaitNode` - 等待用户输入技能点分配
2. `ConditionNode` - 验证总点数
3. `StateChangeNode` - 应用技能点分配

---

## 九、总结

通过 Graph 流程编辑器编辑角色技能的核心要点：

1. **StateChangeNode** 是核心编辑节点，支持 ADD、SUBTRACT、SET 三种操作
2. **SkillCheckNode** 用于验证技能值，实现条件分支
3. **ChoiceNode** 可以通过选择效果直接修改技能
4. **ConditionNode** 支持复杂的技能条件判断
5. **WaitNode** 可以等待用户输入，实现交互式编辑
6. **DialogueNode** 用于展示技能信息

通过组合这些节点，可以创建出灵活、强大的角色技能编辑系统。
