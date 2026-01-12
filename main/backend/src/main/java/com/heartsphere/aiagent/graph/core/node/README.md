# 节点实现

## DialogueNode（对话节点）

对话节点用于在Graph中显示对话内容。

### 功能特性

- ✅ 显示对话文本
- ✅ 支持指定说话角色
- ✅ 支持三种对话类型：
  - `DIALOGUE` - 普通对话
  - `NARRATION` - 旁白
  - `THOUGHT` - 内心独白
- ✅ 自动记录对话历史

### 使用方式

#### 方式1：使用静态工厂方法

```java
// 创建简单对话节点
DialogueNode node = DialogueNode.create("dialogue_1", "你好！");

// 创建带角色的对话节点
DialogueNode node = DialogueNode.create("dialogue_1", "你好！", "char_1", "角色A");

// 创建旁白节点
DialogueNode node = DialogueNode.createNarration("narration_1", "阳光明媚。");

// 创建内心独白节点
DialogueNode node = DialogueNode.createThought("thought_1", "我想...");
```

#### 方式2：使用Builder模式

```java
DialogueNode node = DialogueNode.builder()
    .id("dialogue_1")
    .text("你好！")
    .characterId("char_1")
    .characterName("角色A")
    .type(DialogueNode.DialogueType.DIALOGUE)
    .build();
```

#### 方式3：使用DialogueNodeConfig

```java
DialogueNodeConfig config = DialogueNodeConfig.builder()
    .id("dialogue_1")
    .text("你好！")
    .characterId("char_1")
    .characterName("角色A")
    .type("dialogue")
    .build();

DialogueNode node = config.toDialogueNode();
```

#### 方式4：使用NodeFactory

```java
NodeFactory factory = new NodeFactory();

Map<String, Object> config = new HashMap<>();
config.put("id", "dialogue_1");
config.put("text", "你好！");
config.put("characterId", "char_1");
config.put("characterName", "角色A");
config.put("type", "dialogue");

GraphNode node = factory.createNode("dialogue", config);
```

### 状态数据

DialogueNode执行后会在GraphState中设置以下数据：

- `current_dialogue` - 当前对话节点对象
- `dialogue_text` - 对话文本
- `dialogue_character_id` - 角色ID
- `dialogue_character_name` - 角色名称
- `dialogue_type` - 对话类型（DIALOGUE/NARRATION/THOUGHT）
- `dialogue_history` - 对话历史列表（List<DialogueNode>）

### JSON配置格式

```json
{
  "id": "dialogue_1",
  "text": "你好，欢迎来到心域！",
  "characterId": "char_1",
  "characterName": "角色A",
  "type": "dialogue"
}
```

---

## ChoiceNode（选择节点）

选择节点用于在Graph中提供多个选项供用户选择。

### 功能特性

- ✅ 多个选项
- ✅ 选项显示条件（好感度、技能、事件、物品、变量）
- ✅ 选项选择效果（好感度变化、技能变化、触发事件、添加物品、设置变量）
- ✅ 条件运算符支持（>=, <=, >, <, ==, !=, has, not_has）
- ✅ 自动过滤不可用选项

### 使用方式

#### 方式1：使用静态工厂方法

```java
List<ChoiceNode.ChoiceOption> options = new ArrayList<>();
options.add(ChoiceNode.ChoiceOption.builder()
    .id("opt_1")
    .text("选项1")
    .nextNodeId("node_1")
    .build());

ChoiceNode node = ChoiceNode.create("choice_1", "请选择：", options);
```

#### 方式2：使用Builder模式

```java
ChoiceNode node = ChoiceNode.builder()
    .id("choice_1")
    .prompt("请选择：")
    .options(List.of(
        ChoiceNode.ChoiceOption.builder()
            .id("opt_1")
            .text("选项1")
            .nextNodeId("node_1")
            .build()
    ))
    .build();
```

#### 方式3：使用ChoiceNodeConfig

```java
ChoiceNodeConfig config = ChoiceNodeConfig.builder()
    .id("choice_1")
    .prompt("请选择：")
    .options(List.of(
        ChoiceNodeConfig.ChoiceOptionConfig.builder()
            .id("opt_1")
            .text("选项1")
            .nextNodeId("node_1")
            .build()
    ))
    .build();

ChoiceNode node = config.toChoiceNode();
```

#### 方式4：使用NodeFactory

```java
NodeFactory factory = new NodeFactory();
Map<String, Object> config = new HashMap<>();
config.put("id", "choice_1");
config.put("prompt", "请选择：");
config.put("options", ...);

GraphNode node = factory.createNode("choice", config);
```

### 条件类型

- **FAVORABILITY** - 好感度条件
- **SKILL** - 技能值条件
- **EVENT** - 事件条件（has/not_has）
- **ITEM** - 物品条件（has/not_has）
- **VARIABLE** - 变量条件

### 选择效果

- **favorabilityChange** - 好感度变化（Map<角色ID, 变化值>）
- **skillChange** - 技能值变化（Map<技能ID, 变化值>）
- **triggerEvents** - 触发事件（List<事件ID>）
- **addItems** - 添加物品（List<物品ID>）
- **setVariables** - 设置变量（Map<变量名, 变量值>）

### 状态数据

ChoiceNode执行后会在GraphState中设置：

- `current_choice` - 当前选择节点对象
- `choice_prompt` - 选择提示文本
- `choice_options` - 可用选项列表（已过滤）
- `waiting_for_choice` - 等待用户选择标记
- `choice_node_id` - 选择节点ID

处理选择后：

- `waiting_for_choice` - 设置为false
- `selected_option_id` - 选择的选项ID
- `selected_option` - 选择的选项对象
- 应用选择效果（好感度、技能、事件、物品、变量）

### JSON配置格式

```json
{
  "id": "choice_1",
  "prompt": "请选择：",
  "options": [
    {
      "id": "opt_1",
      "text": "选项1",
      "nextNodeId": "node_1",
      "conditions": [
        {
          "type": "favorability",
          "target": "char_1",
          "operator": ">=",
          "value": 50
        }
      ],
      "effect": {
        "favorabilityChange": {
          "char_1": 10
        },
        "triggerEvents": ["event_1"]
      }
    }
  ]
}
```

### 完整示例

参见 `DialogueNodeExample.java` 和 `ChoiceNodeExample.java`

---

## ConditionNode（条件判断节点）

条件判断节点用于在Graph中根据条件自动判断流程走向，连接两个后续节点（True/False分支）。

### 功能特性

- ✅ 多种条件类型（好感度、技能、事件、物品、变量）
- ✅ AND/OR逻辑组合
- ✅ 自动路由到True或False分支
- ✅ 支持数值、字符串、布尔值比较
- ✅ 条件运算符支持（>=, <=, >, <, ==, !=, has, not_has, contains, startsWith, endsWith）

### 使用方式

#### 方式1：使用Builder模式

```java
ConditionNode node = ConditionNode.builder()
    .id("condition_1")
    .logic(ConditionNode.LogicType.AND)
    .conditions(List.of(
        ConditionNode.Condition.builder()
            .type(ConditionNode.Condition.ConditionType.SKILL)
            .target("strength")
            .operator(">=")
            .value(50)
            .build()
    ))
    .trueNodeId("node_success")
    .falseNodeId("node_failure")
    .build();
```

#### 方式2：使用ConditionNodeConfig

```java
ConditionNodeConfig config = ConditionNodeConfig.builder()
    .id("condition_1")
    .logic(ConditionNode.LogicType.AND)
    .conditions(List.of(...))
    .trueNodeId("node_success")
    .falseNodeId("node_failure")
    .build();

ConditionNode node = config.toConditionNode();
```

#### 方式3：使用NodeFactory

```java
NodeFactory factory = new NodeFactory();
Map<String, Object> config = new HashMap<>();
config.put("id", "condition_1");
config.put("logic", "AND");
config.put("conditions", ...);
config.put("trueNodeId", "node_success");
config.put("falseNodeId", "node_failure");

GraphNode node = factory.createNode("condition", config);
```

### 逻辑类型

- **AND** - 所有条件必须满足（默认）
- **OR** - 至少一个条件满足

### 条件类型

- **FAVORABILITY** - 好感度条件（数值比较）
- **SKILL** - 技能值条件（数值比较）
- **EVENT** - 事件条件（has/not_has）
- **ITEM** - 物品条件（has/not_has）
- **VARIABLE** - 变量条件（支持数值、字符串、布尔值）

### 运算符

**数值运算符：**
- `>` - 大于
- `<` - 小于
- `>=` - 大于等于
- `<=` - 小于等于
- `==` - 等于
- `!=` - 不等于

**字符串运算符：**
- `==` - 等于
- `!=` - 不等于
- `contains` - 包含
- `startsWith` - 以...开始
- `endsWith` - 以...结束

**存在性运算符（事件、物品）：**
- `has` / `==` - 存在
- `not_has` / `!=` - 不存在

### 状态数据

ConditionNode执行后会在GraphState中设置：

- `condition_result` - 条件判断结果（Boolean）
- `condition_node_id` - 条件节点ID
- `next_node` - 下一个节点ID（trueNodeId或falseNodeId）

### JSON配置格式

```json
{
  "id": "condition_1",
  "logic": "AND",
  "conditions": [
    {
      "type": "SKILL",
      "target": "strength",
      "operator": ">=",
      "value": 50
    },
    {
      "type": "FAVORABILITY",
      "target": "alice",
      "operator": ">=",
      "value": 60
    }
  ],
  "trueNodeId": "node_success",
  "falseNodeId": "node_failure"
}
```

### 完整示例

参见 `ConditionNodeExample.java` 和 `ConditionNodeTest.java`

---

## SkillCheckNode（技能检查节点）

技能检查节点专门用于检查角色技能值，根据检查结果自动路由到成功或失败分支。这是 ConditionNode 的一个特化版本，专门用于技能检查场景。

### 功能特性

- ✅ 检查指定角色的指定技能值
- ✅ 支持多种运算符（>=, <=, >, <, ==, !=）
- ✅ 自动路由到成功或失败分支
- ✅ 简化配置，使用更方便

### 使用方式

#### 方式1：使用Builder模式

```java
SkillCheckNode node = SkillCheckNode.builder()
    .id("skill_check_1")
    .characterId("char_1")  // 可选
    .skillId("strength")
    .operator(">=")
    .requiredValue(50)
    .successNodeId("node_success")
    .failureNodeId("node_failure")
    .build();
```

#### 方式2：使用SkillCheckNodeConfig

```java
SkillCheckNodeConfig config = SkillCheckNodeConfig.builder()
    .id("skill_check_1")
    .skillId("strength")
    .operator(">=")
    .requiredValue(50)
    .successNodeId("node_success")
    .failureNodeId("node_failure")
    .build();

SkillCheckNode node = config.toSkillCheckNode();
```

#### 方式3：使用NodeFactory

```java
NodeFactory factory = new NodeFactory();
Map<String, Object> config = new HashMap<>();
config.put("id", "skill_check_1");
config.put("skillId", "strength");
config.put("operator", ">=");
config.put("requiredValue", 50);
config.put("successNodeId", "node_success");
config.put("failureNodeId", "node_failure");

GraphNode node = factory.createNode("skill_check", config);
```

### 运算符

- `>` - 大于
- `<` - 小于
- `>=` - 大于等于（默认）
- `<=` - 小于等于
- `==` - 等于
- `!=` - 不等于

### 状态数据

SkillCheckNode执行后会在GraphState中设置：

- `skill_check_result` - 检查结果（Boolean）
- `skill_check_node_id` - 技能检查节点ID
- `skill_check_skill_id` - 检查的技能ID
- `skill_check_character_id` - 检查的角色ID（如果有）
- `skill_check_current_value` - 当前技能值
- `skill_check_required_value` - 需要的技能值
- `next_node` - 下一个节点ID（successNodeId或failureNodeId）

### JSON配置格式

```json
{
  "id": "skill_check_1",
  "characterId": "char_1",
  "skillId": "strength",
  "operator": ">=",
  "requiredValue": 50,
  "successNodeId": "node_success",
  "failureNodeId": "node_failure"
}
```

### 与 ConditionNode 的区别

- **SkillCheckNode**：专门用于技能检查，配置更简单，只关注技能值检查
- **ConditionNode**：通用条件判断节点，支持多种条件类型（技能、好感度、事件、物品、变量）和逻辑组合（AND/OR）

### 完整示例

参见 `SkillCheckNodeExample.java` 和 `SkillCheckNodeTest.java`

---

## StateChangeNode（状态变更节点）

状态变更节点用于修改角色状态（技能值、好感度、变量等）。支持多种修改方式：增加、减少、设置为指定值。

### 功能特性

- ✅ 修改技能值（ADD、SUBTRACT、SET）
- ✅ 修改好感度（ADD、SUBTRACT、SET）
- ✅ 修改变量（ADD、SUBTRACT、SET）
- ✅ 触发/移除事件（TRIGGER、REMOVE）
- ✅ 添加/移除物品（ADD、REMOVE）
- ✅ 支持多个状态同时变更
- ✅ 自动限制技能值和好感度在0-100范围内

### 使用方式

#### 方式1：使用Builder模式

```java
StateChangeNode node = StateChangeNode.builder()
    .id("state_change_1")
    .changes(List.of(
        StateChangeNode.StateChange.builder()
            .type(StateChangeNode.StateChange.ChangeType.SKILL)
            .target("strength")
            .operation(StateChangeNode.StateChange.OperationType.ADD)
            .value(10)
            .build(),
        StateChangeNode.StateChange.builder()
            .type(StateChangeNode.StateChange.ChangeType.FAVORABILITY)
            .target("alice")
            .operation(StateChangeNode.StateChange.OperationType.ADD)
            .value(5)
            .build()
    ))
    .build();
```

#### 方式2：使用StateChangeNodeConfig

```java
StateChangeNodeConfig config = StateChangeNodeConfig.builder()
    .id("state_change_1")
    .changes(List.of(...))
    .build();

StateChangeNode node = config.toStateChangeNode();
```

#### 方式3：使用NodeFactory

```java
NodeFactory factory = new NodeFactory();
Map<String, Object> config = new HashMap<>();
config.put("id", "state_change_1");
config.put("changes", ...);

GraphNode node = factory.createNode("state_change", config);
```

### 变更类型

- **SKILL** - 技能值
- **FAVORABILITY** - 好感度
- **VARIABLE** - 变量
- **EVENT** - 事件
- **ITEM** - 物品

### 操作类型

- **ADD** - 增加（用于数值类型：技能、好感度、变量；也用于物品）
- **SUBTRACT** - 减少（用于数值类型：技能、好感度、变量）
- **SET** - 设置为指定值（用于所有类型）
- **TRIGGER** - 触发（用于事件）
- **REMOVE** - 移除（用于事件和物品）

### 状态数据

StateChangeNode执行后会直接修改GraphState中的相关数据：

- `character_skills` - 角色技能值（Map<String, Integer>）
- `character_favorability` - 角色好感度（Map<String, Integer>）
- `variables` - 变量（Map<String, Object>）
- `triggered_events` - 触发的事件（List<String>）
- `collected_items` - 收集的物品（List<String>）

### JSON配置格式

```json
{
  "id": "state_change_1",
  "changes": [
    {
      "type": "SKILL",
      "target": "strength",
      "operation": "ADD",
      "value": 10
    },
    {
      "type": "FAVORABILITY",
      "target": "alice",
      "operation": "ADD",
      "value": 5
    },
    {
      "type": "EVENT",
      "target": "quest_completed",
      "operation": "TRIGGER"
    },
    {
      "type": "ITEM",
      "target": "sword",
      "operation": "ADD"
    }
  ]
}
```

### 完整示例

参见 `StateChangeNodeExample.java` 和 `StateChangeNodeTest.java`

---

## StartNode（开始节点）

开始节点是流程的起点，用于标记流程的开始位置。每个流程只能有一个开始节点。

### 功能特性

- ✅ 标记流程开始
- ✅ 自动执行，无需配置
- ✅ 简单轻量

### 使用方式

#### 方式1：使用Builder模式

```java
StartNode node = StartNode.builder()
    .id("start")
    .build();
```

#### 方式2：使用StartNodeConfig

```java
StartNodeConfig config = StartNodeConfig.builder()
    .id("start")
    .build();

StartNode node = config.toStartNode();
```

#### 方式3：使用NodeFactory

```java
NodeFactory factory = new NodeFactory();
Map<String, Object> config = new HashMap<>();
config.put("id", "start");

GraphNode node = factory.createNode("start", config);
```

### 状态数据

StartNode执行后会在GraphState中设置：

- `graph_started` - 流程已开始标记（Boolean）
- `start_node_id` - 开始节点ID

### JSON配置格式

```json
{
  "id": "start"
}
```

---

## EndNode（结束节点）

结束节点是流程的终点，可以有多个（不同结局）。用于标记流程的结束。

### 功能特性

- ✅ 标记流程结束
- ✅ 支持多个结局节点
- ✅ 可配置结局类型和描述

### 使用方式

#### 方式1：使用Builder模式

```java
EndNode node = EndNode.builder()
    .id("end_1")
    .endingType("GOOD")
    .endingDescription("完美结局")
    .build();
```

#### 方式2：使用EndNodeConfig

```java
EndNodeConfig config = EndNodeConfig.builder()
    .id("end_1")
    .endingType("GOOD")
    .endingDescription("完美结局")
    .build();

EndNode node = config.toEndNode();
```

#### 方式3：使用NodeFactory

```java
NodeFactory factory = new NodeFactory();
Map<String, Object> config = new HashMap<>();
config.put("id", "end_1");
config.put("endingType", "GOOD");
config.put("endingDescription", "完美结局");

GraphNode node = factory.createNode("end", config);
```

### 状态数据

EndNode执行后会在GraphState中设置：

- `graph_ended` - 流程已结束标记（Boolean）
- `end_node_id` - 结束节点ID
- `ending_type` - 结局类型（可选）
- `ending_description` - 结局描述（可选）
- `next_node` - 设置为null（结束节点没有下一个节点）

### JSON配置格式

```json
{
  "id": "end_1",
  "endingType": "GOOD",
  "endingDescription": "完美结局"
}
```

---

## WaitNode（等待节点）

等待节点用于暂停流程，等待用户输入或其他条件满足后再继续。用于需要用户交互的场景。

### 功能特性

- ✅ 支持多种等待类型（用户输入、用户点击、事件触发、定时器等）
- ✅ 可配置等待条件
- ✅ 支持超时设置
- ✅ 提供条件检查方法

### 使用方式

#### 方式1：使用Builder模式

```java
WaitNode node = WaitNode.builder()
    .id("wait_1")
    .waitType(WaitNode.WaitType.USER_INPUT)
    .waitCondition("user_input_received")
    .nextNodeId("node_after_wait")
    .timeout(5000L)  // 可选：超时时间（毫秒）
    .build();
```

#### 方式2：使用WaitNodeConfig

```java
WaitNodeConfig config = WaitNodeConfig.builder()
    .id("wait_1")
    .waitType(WaitNode.WaitType.EVENT)
    .waitCondition("event_1")
    .nextNodeId("node_after_wait")
    .build();

WaitNode node = config.toWaitNode();
```

#### 方式3：使用NodeFactory

```java
NodeFactory factory = new NodeFactory();
Map<String, Object> config = new HashMap<>();
config.put("id", "wait_1");
config.put("waitType", "USER_INPUT");
config.put("nextNodeId", "node_after_wait");

GraphNode node = factory.createNode("wait", config);
```

### 等待类型

- **USER_INPUT** - 等待用户输入
- **USER_CLICK** - 等待用户点击
- **USER_CHOICE** - 等待用户选择（通常与ChoiceNode配合使用）
- **EVENT** - 等待事件触发
- **TIMER** - 等待指定时间
- **CONDITION** - 等待条件满足

### 状态数据

WaitNode执行后会在GraphState中设置：

- `waiting` - 等待标记（Boolean）
- `wait_node_id` - 等待节点ID
- `wait_type` - 等待类型
- `wait_condition` - 等待条件
- `wait_timeout` - 超时时间（可选）
- `next_node` - 下一个节点ID

### 条件检查

可以使用 `checkWaitCondition(state)` 方法检查等待条件是否满足：

```java
WaitNode waitNode = ...;
if (waitNode.checkWaitCondition(state)) {
    // 等待条件已满足，可以继续执行
}
```

### JSON配置格式

```json
{
  "id": "wait_1",
  "waitType": "EVENT",
  "waitCondition": "event_1",
  "nextNodeId": "node_after_wait",
  "timeout": 5000
}
```

### 完整示例

参见 `WaitNodeTest.java`

---

## 后续节点类型

- ParallelNode（并行节点）- 待实现（需要执行器支持）
- LoopNode（循环节点）- 待实现（需要执行器支持）
