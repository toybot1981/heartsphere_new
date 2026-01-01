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

## 后续节点类型

- ConditionNode（条件判断节点）- 待实现
- SkillCheckNode（技能检查节点）- 待实现
- StateChangeNode（状态变更节点）- 待实现
