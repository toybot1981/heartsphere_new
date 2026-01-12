# function_schema 说明文档

## 一、function_schema 的作用

### 1.1 核心功能

`function_schema` 是用于 **AI Function Calling** 的参数定义，它：

1. **定义函数参数结构**：
   - 指定技能需要哪些输入参数
   - 定义参数的类型、描述、是否必填等
   - 使用 JSON Schema 格式

2. **启用自动调用机制**：
   - AI 可以根据用户输入自动识别需要调用的技能
   - 自动提取和传递参数
   - 无需用户明确指定参数格式

### 1.2 格式示例

```json
{
  "type": "object",
  "properties": {
    "input": {
      "type": "string",
      "description": "用户输入的内容"
    },
    "options": {
      "type": "object",
      "description": "可选配置"
    }
  },
  "required": ["input"]
}
```

---

## 二、function_schema 是否必须？

### 2.1 答案：**不是必须的**

系统支持两种技能驱动方式：

#### 方式1：Function Calling（有 function_schema）
- **特点**：自动调用，参数结构化
- **适用**：需要明确输入参数的技能
- **示例**：时间审计（需要时间数据）、任务分解（需要任务列表）

#### 方式2：提示词驱动（无 function_schema）
- **特点**：AI根据系统指令自然使用技能
- **适用**：灵活性高、参数不固定的技能
- **示例**：心理疏导（通过对话进行）、习惯追踪（通过自然语言描述）

### 2.2 两种方式的对比

| 特性 | Function Calling | 提示词驱动 |
|------|-----------------|-----------|
| **需要 function_schema** | ✅ 是 | ❌ 否 |
| **调用方式** | 自动调用函数 | AI自然使用 |
| **参数传递** | 结构化JSON | 自然语言 |
| **适用场景** | 需要明确参数 | 灵活对话场景 |

---

## 三、系统应该如何支持两种方式？

### 3.1 当前问题

当前实现存在以下问题：
- ❌ 没有 `function_schema` 的技能被完全过滤掉
- ❌ 这些技能既不出现在 Function Calling 列表，也不出现在系统指令中
- ❌ 导致技能无法被AI识别和使用

### 3.2 正确的实现方式

**应该支持混合模式**：

1. **有 function_schema 的技能**：
   - 加入 Function Calling 列表
   - AI可以自动调用

2. **没有 function_schema 的技能**：
   - 不加入 Function Calling 列表
   - 但在系统指令中描述这些技能
   - 让AI通过提示词自然使用

### 3.3 系统指令示例

```text
[可用技能]

【Function Calling 技能】（可通过工具调用）：
- time_audit: 时间审计 - 分析时间使用情况
- task_breakdown: 任务分解 - 将复杂任务分解为小步骤

【提示词驱动技能】（可通过对话使用）：
- 习惯养成追踪：帮助用户建立和追踪日常习惯，通过对话记录和鼓励来维持习惯
- 拖延症诊断：通过对话诊断用户的拖延类型和原因，提供针对性建议
```

---

## 四、修复方案

### 4.1 后端修改

1. **修改 API 返回结构**：
   - `/api/skills/character/{characterId}/available` 只返回有 `function_schema` 的技能（用于Function Calling）
   - 新增 `/api/skills/character/{characterId}/all` 返回所有已装备技能（包括描述信息）

2. **或者修改现有API**：
   - 返回两部分：`functionCallingSkills` 和 `promptDrivenSkills`

### 4.2 前端修改

1. **获取所有技能**：
   - 获取有 `function_schema` 的技能（用于Function Calling）
   - 获取所有已装备技能（用于系统指令）

2. **构建系统指令**：
   - Function Calling 技能：加入 Function Definitions
   - 提示词驱动技能：在系统指令中描述

---

## 五、实现建议

### 5.1 推荐方案：扩展现有API

修改 `/api/skills/character/{characterId}/available` 返回结构：

```json
{
  "code": 200,
  "data": {
    "functionCallingSkills": [
      // 有 function_schema 的技能，转换为 FunctionDefinition
    ],
    "promptDrivenSkills": [
      // 没有 function_schema 的技能，返回基本信息
      {
        "skillId": "habit_tracking",
        "name": "习惯养成追踪",
        "description": "帮助用户建立和追踪日常习惯..."
      }
    ]
  }
}
```

### 5.2 前端处理

```typescript
const { functionCallingSkills, promptDrivenSkills } = await getCharacterSkills(characterId);

// Function Calling
functionDefinitions = functionCallingSkills;

// 系统指令
if (promptDrivenSkills.length > 0) {
  systemInstruction += `\n\n[提示词驱动技能]\n${promptDrivenSkills.map(s => `- ${s.name}: ${s.description}`).join('\n')}\n\n你可以在对话中自然使用这些技能，无需调用工具。`;
}
```

---

## 六、总结

- ✅ `function_schema` **不是必须的**
- ✅ 系统应该支持两种驱动方式
- ✅ 当前实现需要修复，以支持混合模式
- ✅ 修复后，所有已装备技能都能被AI识别和使用
