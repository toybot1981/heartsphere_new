# Skill 系统使用逻辑梳理

## 一、核心问题：是否参照 Claude 的渐进式提示词请求方式？

### 1.1 Claude 的渐进式加载机制

Claude Skill 采用**三层渐进式加载**机制：

```
Level 1（元数据）→ 始终加载
  ↓
Level 2（指令）→ 触发时加载
  ↓
Level 3（资源/代码）→ 按需加载
```

**优势**：
- 减少初始加载时间（只加载元数据）
- 按需加载详细内容（节省资源）
- 渐进式增强（从简单到复杂）

### 1.2 心域系统的实现方式

#### 当前实现：**一次性加载 + Function Calling**

```
用户对话
  ↓
AI 服务（获取角色可用技能）
  ↓
转换为 Function Definitions（一次性加载所有技能元数据）
  ↓
AI 模型（根据对话判断是否需要调用技能）
  ↓
Function Call（AI 决定调用哪个技能）
  ↓
Skill Executor（执行时加载 Level 2 和 Level 3）
  ↓
返回结果给 AI
  ↓
AI 生成包含结果的回复
```

**关键点**：
1. **初始阶段**：只加载 Level 1（元数据），转换为 Function Definitions
2. **执行阶段**：当 AI 决定调用技能时，才加载 Level 2（指令）和 Level 3（资源）
3. **结果处理**：技能执行结果注入到 AI 上下文，AI 继续生成回复

---

## 二、详细流程分析

### 2.1 技能发现阶段（初始加载）

**位置**：`frontend/components/chat/utils/generateAIResponse.ts`

```typescript
// 获取角色可用技能（用于 Function Calling）
let functionDefinitions: FunctionDefinition[] = [];

if (character.id) {
  functionDefinitions = await skillService.getCharacterAvailableSkills(character.id);
}
```

**加载内容**：
- ✅ Level 1：技能元数据（skill_definitions 表）
  - skill_id
  - name
  - description
  - function_schema（JSON Schema）

**不加载**：
- ❌ Level 2：技能指令（skill_instructions 表）
- ❌ Level 3：技能资源（skill_resources 表）

**转换格式**：
```typescript
// 转换为 Function Definition（OpenAI/Claude 兼容格式）
{
  "name": "crisis_intervention",
  "description": "危机干预工具 - 评估风险、制定干预方案",
  "parameters": {
    "type": "object",
    "properties": {
      "action": {
        "type": "string",
        "enum": ["assess", "plan", "guide", "resources"]
      }
    }
  }
}
```

### 2.2 AI 判断阶段（Function Calling）

**位置**：`frontend/services/ai/adapters/OpenAIAdapter.ts`

```typescript
// AI 模型根据对话内容判断是否需要调用技能
const response = await openai.chat.completions.create({
  model: 'gpt-4',
  messages: messages,
  functions: functionDefinitions,  // 传入技能定义
  function_call: 'auto'  // 让 AI 自主决定
});
```

**AI 行为**：
1. 分析用户输入和对话上下文
2. 判断是否需要使用技能
3. 如果需要，返回 function_call：
   ```json
   {
     "name": "crisis_intervention",
     "arguments": {
       "action": "assess",
       "patientId": "user_123",
       "symptoms": ["绝望", "活着没意思"]
     }
   }
   ```

### 2.3 技能执行阶段（渐进式加载）

**位置**：`backend/src/main/java/com/heartsphere/skill/service/SkillExecutor.java`

```java
public SkillExecutionResult execute(
    String skillId,
    Map<String, Object> parameters,
    SkillExecutionContext context
) {
    // 1. 加载 Level 1：元数据（已缓存）
    SkillDefinition skill = skillRegistry.getSkill(skillId)
        .orElseThrow(() -> new SkillNotFoundException("技能不存在: " + skillId));
    
    // 2. 验证参数
    validateParameters(skill, parameters);
    
    // 3. 加载 Level 2：指令（按需加载）
    List<SkillInstruction> instructions = skillInstructionRepository
        .findBySkillIdAndInstructionLevel(skillId, 2);
    
    // 4. 加载 Level 3：资源（按需加载）
    List<SkillResource> resources = skillResourceRepository
        .findBySkillId(skillId);
    
    // 5. 执行技能逻辑
    Object executionResult = executeSkillLogic(
        skill, 
        instructions, 
        resources, 
        parameters, 
        context
    );
    
    return result;
}
```

**渐进式加载**：
- ✅ **Level 1**：已在初始阶段加载（缓存）
- ✅ **Level 2**：执行时才加载（按需）
- ✅ **Level 3**：执行时才加载（按需）

### 2.4 结果处理阶段（上下文注入）

**位置**：`frontend/components/chat/utils/generateAIResponse.ts`

```typescript
// 设置 Function Call 回调
onFunctionCall = async (functionCall: FunctionCall) => {
  // 执行技能
  const result = await skillService.executeSkill(
    functionCall.name,
    character.id!,
    parameters
  );
  
  // 返回结果（AI 会继续处理）
  return result;
};
```

**上下文注入**：
```typescript
// AI 服务将技能结果注入上下文，继续生成回复
messages.push({
  role: 'assistant',
  content: null,
  functionCall: functionCall
});
messages.push({
  role: 'function',
  name: functionCall.name,
  content: JSON.stringify(result)
});
```

---

## 三、与 Claude 的对比

### 3.1 相似之处

| 特性 | Claude Skill | 心域 Skill 系统 |
|------|-------------|----------------|
| 三层架构 | ✅ Level 1/2/3 | ✅ Level 1/2/3 |
| 渐进式加载 | ✅ 按需加载 | ✅ 按需加载 |
| 元数据优先 | ✅ 初始只加载元数据 | ✅ 初始只加载元数据 |
| 按需加载详细内容 | ✅ 执行时加载 | ✅ 执行时加载 |

### 3.2 不同之处

| 特性 | Claude Skill | 心域 Skill 系统 |
|------|-------------|----------------|
| 调用方式 | 命令行式 `/skill --arg=value` | Function Calling（JSON） |
| 发现机制 | 文件系统自动发现 | 数据库查询 + 角色绑定 |
| 执行环境 | Node.js 运行时 | Java 后端服务 |
| AI 集成 | Claude Code 内部机制 | 标准 Function Calling API |
| 触发方式 | 用户手动输入 | AI 自动判断 + 用户触发 |

### 3.3 关键差异

**Claude Skill**：
- 用户**主动输入**命令行调用技能
- 例如：`/crisis-intervention --action=assess`

**心域 Skill 系统**：
- AI **自动判断**是否需要调用技能
- 例如：用户说"我最近感觉很绝望"，AI 自动调用 `crisis_intervention`

---

## 四、渐进式加载的优势

### 4.1 性能优化

**初始加载**（只加载 Level 1）：
- 减少数据库查询
- 减少网络传输
- 减少内存占用

**执行时加载**（按需加载 Level 2/3）：
- 只加载需要的技能
- 避免加载未使用的技能资源

### 4.2 扩展性

- 可以添加大量技能，不影响初始加载性能
- 技能资源可以很大（模板、脚本），但不影响初始性能
- 支持技能的热更新（修改 Level 2/3 不影响 Level 1）

### 4.3 灵活性

- AI 可以根据对话上下文动态选择技能
- 不同角色可以有不同的技能组合
- 技能可以按需启用/禁用

---

## 五、完整使用流程示例

### 5.1 用户对话场景

**用户输入**：
```
我最近感觉很绝望，觉得活着没意思
```

### 5.2 系统处理流程

#### 步骤 1：初始加载（Level 1）

```typescript
// 获取角色可用技能（只加载元数据）
const skills = await skillService.getCharacterAvailableSkills(characterId);

// 转换为 Function Definitions
const functionDefinitions = skills.map(skill => ({
  name: skill.skillId,
  description: skill.description,
  parameters: JSON.parse(skill.functionSchema)
}));
```

**加载内容**：
- `crisis_intervention` 的元数据（名称、描述、参数定义）
- 不加载指令和资源

#### 步骤 2：AI 判断

```typescript
// AI 分析对话内容
const response = await aiService.generateTextStream({
  messages: [
    { role: 'user', content: '我最近感觉很绝望，觉得活着没意思' }
  ],
  functions: functionDefinitions
});

// AI 返回 function call
{
  name: 'crisis_intervention',
  arguments: {
    action: 'assess',
    symptoms: ['绝望', '活着没意思']
  }
}
```

#### 步骤 3：技能执行（渐进式加载）

```java
// 执行技能（此时才加载 Level 2 和 Level 3）
SkillExecutionResult result = skillExecutor.execute(
    "crisis_intervention",
    parameters,
    context
);

// 加载过程：
// 1. Level 1（已缓存）→ 获取技能定义
// 2. Level 2（按需加载）→ 获取详细指令
// 3. Level 3（按需加载）→ 获取资源（模板、脚本）
// 4. 执行技能逻辑
// 5. 返回结果
```

#### 步骤 4：结果注入

```typescript
// 将技能结果注入 AI 上下文
messages.push({
  role: 'assistant',
  content: null,
  functionCall: functionCall
});
messages.push({
  role: 'function',
  name: 'crisis_intervention',
  content: JSON.stringify({
    riskLevel: 'high',
    recommendations: ['立即制定安全计划', '联系专业帮助']
  })
});
```

#### 步骤 5：AI 生成回复

```typescript
// AI 基于技能结果生成自然语言回复
const finalResponse = await aiService.generateTextStream({
  messages: messages,  // 包含技能结果
  functions: functionDefinitions
});

// AI 回复：
"我理解你的感受。根据评估，你的风险等级为高风险。
我建议我们立即制定一个安全计划。让我为你创建一个干预方案..."
```

---

## 六、总结

### 6.1 是否参照 Claude 的渐进式方式？

**答案：是的，但有所改进**

1. ✅ **三层架构**：完全参照 Claude 的 Level 1/2/3 设计
2. ✅ **渐进式加载**：初始只加载 Level 1，执行时加载 Level 2/3
3. ✅ **按需加载**：只加载需要的技能资源
4. ✅ **性能优化**：减少初始加载时间，提升响应速度

### 6.2 改进之处

1. **AI 自动判断**：不需要用户手动输入命令行，AI 自动判断是否需要使用技能
2. **Function Calling 标准**：使用标准的 Function Calling API，兼容多种 AI 模型
3. **数据库存储**：使用数据库存储技能定义，便于管理和查询
4. **角色绑定**：支持不同角色拥有不同的技能组合

### 6.3 核心优势

- **性能**：渐进式加载减少初始开销
- **智能**：AI 自动判断何时使用技能
- **灵活**：支持动态技能组合和热更新
- **扩展**：易于添加新技能，不影响现有系统

---

**文档创建时间**：2025-01-04  
**最后更新**：2025-01-04
