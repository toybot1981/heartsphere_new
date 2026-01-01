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

### 完整示例

参见 `DialogueNodeExample.java`

---

## 后续节点类型

- ChoiceNode（选择节点）- 待实现
- ConditionNode（条件判断节点）- 待实现
- SkillCheckNode（技能检查节点）- 待实现
- StateChangeNode（状态变更节点）- 待实现
