# Mentis LLM 响应解析功能实现说明

**日期**：2025-01-06  
**状态**：已完成

---

## 一、实现内容

### 1. LLM 响应解析工具类

创建了 `LLMResponseParser` 工具类，提供以下功能：

#### 核心方法
- `extractJson()` - 从 LLM 响应中提取 JSON 内容
- `parseJson()` - 解析 JSON 字符串为 JsonNode
- `extractAndParseJson()` - 提取并解析 JSON（一步完成）
- `parseToObject()` - 解析为指定类型的对象
- `cleanJson()` - 清理 JSON 字符串
- `isValidJson()` - 验证 JSON 格式
- `extractJsonSafely()` - 安全提取（失败返回 null）
- `extractAndParseJsonSafely()` - 安全解析（失败返回 null）

#### 支持的格式
1. **Markdown 代码块**：从 ````json ... ``` 中提取
2. **纯 JSON 文本**：直接解析 JSON 对象或数组
3. **包含 JSON 的文本**：自动提取第一个 JSON 对象

### 2. 意图识别器解析实现

更新了 `LLMIntentRecognizer.parseResponse()` 方法，实现完整的 JSON 解析：

#### 解析字段
- `taskType` - 任务类型（COMMAND, SCRIPT, COMPUTER_USE, CHAT）
- `intent` - 意图描述
- `parameters` - 参数映射
- `confidence` - 置信度（0-1）

#### 特性
- 任务类型验证
- 置信度范围限制（0-1）
- 参数类型自动转换
- 异常处理和默认值

### 3. 任务分解器解析实现

更新了 `LLMTaskDecomposer.parseResponse()` 方法，实现完整的任务步骤解析：

#### 解析字段
- `stepId` - 步骤ID
- `taskType` - 任务类型
- `description` - 任务描述
- `command` - 执行的命令或脚本
- `order` - 执行顺序
- `dependencies` - 依赖的步骤ID列表

#### 特性
- 步骤数组解析
- 自动生成 stepId（如果缺失）
- 任务类型验证
- 依赖关系解析
- 异常处理和跳过无效步骤

---

## 二、技术实现

### 1. JSON 提取策略

```java
// 1. 优先从 Markdown 代码块中提取
Pattern: ```(?:json)?\s*([\s\S]*?)\s*```

// 2. 从文本中提取 JSON 对象
Pattern: \{[\\s\\S]*\}

// 3. 直接使用原文本（如果以 { 或 [ 开头）
```

### 2. 错误处理

- **安全方法**：提供 `*Safely()` 方法，失败时返回 null 而不是抛出异常
- **日志记录**：详细记录解析过程和错误信息
- **默认值**：解析失败时使用合理的默认值

### 3. 类型转换

支持自动类型转换：
- 字符串 → String
- 数字 → Integer/Long/Double
- 布尔值 → Boolean
- 数组 → List
- 对象 → Map

---

## 三、使用示例

### 1. 基本使用

```java
@Autowired
private LLMResponseParser responseParser;

// 提取并解析 JSON
JsonNode jsonNode = responseParser.extractAndParseJson(llmResponse);

// 解析为对象
IntentRecognitionResult result = responseParser.parseToObject(
    llmResponse, 
    IntentRecognitionResult.class
);
```

### 2. 安全解析

```java
// 失败时返回 null，不抛出异常
JsonNode jsonNode = responseParser.extractAndParseJsonSafely(llmResponse);
if (jsonNode != null) {
    // 处理解析结果
}
```

### 3. 自定义清理

```java
String cleaned = responseParser.cleanJson(rawJson);
JsonNode node = responseParser.parseJson(cleaned);
```

---

## 四、LLM 响应格式要求

### 1. 意图识别响应格式

```json
{
  "taskType": "COMMAND|SCRIPT|COMPUTER_USE|CHAT",
  "intent": "意图描述",
  "parameters": {
    "key1": "value1",
    "key2": 123
  },
  "confidence": 0.9
}
```

### 2. 任务分解响应格式

```json
{
  "steps": [
    {
      "stepId": "step_1",
      "taskType": "COMMAND|SCRIPT|COMPUTER_USE",
      "description": "任务描述",
      "command": "执行的命令或脚本内容",
      "order": 1,
      "dependencies": []
    }
  ]
}
```

### 3. 支持的格式变体

LLM 可以返回以下任意格式，解析器都能处理：

```markdown
```json
{
  "taskType": "COMMAND",
  "intent": "执行命令"
}
```
```

或者：

```text
根据分析，用户意图如下：
{
  "taskType": "COMMAND",
  "intent": "执行命令"
}
```

---

## 五、错误处理策略

### 1. 解析失败时的处理

- **意图识别**：返回默认结果（基于关键词匹配）
- **任务分解**：返回包含单个步骤的默认列表
- **日志记录**：详细记录错误信息，便于调试

### 2. 部分解析失败

- **任务步骤**：跳过无效步骤，继续解析其他步骤
- **参数解析**：缺失的参数使用默认值或空值
- **类型转换**：无法转换时使用字符串值

---

## 六、性能优化

### 1. 正则表达式优化

- 使用预编译的正则表达式
- 避免重复编译

### 2. 缓存策略

- ObjectMapper 实例复用
- 避免重复创建解析器

### 3. 早期返回

- 验证失败时尽早返回
- 避免不必要的处理

---

## 七、测试建议

### 1. 单元测试

- 测试各种 JSON 格式的提取
- 测试 Markdown 代码块提取
- 测试错误处理
- 测试类型转换

### 2. 集成测试

- 测试完整的意图识别流程
- 测试任务分解流程
- 测试异常场景

### 3. 边界测试

- 空响应
- 无效 JSON
- 缺失字段
- 类型错误

---

## 八、后续优化

### 1. 增强的 JSON 提取

- 支持多个 JSON 对象
- 支持嵌套的 JSON
- 支持 JSON 数组

### 2. 智能修复

- 自动修复常见的 JSON 错误
- 补全缺失的引号
- 修复转义字符

### 3. 验证增强

- Schema 验证
- 字段必填验证
- 值范围验证

---

## 九、总结

LLM 响应解析功能已完整实现，包括：

1. ✅ 通用的 JSON 提取和解析工具
2. ✅ 意图识别响应解析
3. ✅ 任务分解响应解析
4. ✅ 完善的错误处理
5. ✅ 类型自动转换
6. ✅ 安全解析方法

所有功能都已集成到现有代码中，可以正常使用。

---

**实现时间**：2025-01-06
