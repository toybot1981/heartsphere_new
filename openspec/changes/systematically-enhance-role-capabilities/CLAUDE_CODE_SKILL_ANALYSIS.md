# Claude Code 使用 Skill 的逻辑分析

## 一、Claude Code 的 Skill 机制

### 1.1 核心特点

**Claude Code 中的 skill 调用并不是标准的 function calling**，而是采用了一套独特的机制：

#### 1. 文件系统发现机制
- Skill 存储在 `.claude/skills/` 目录
- 每个 skill 是一个 Node.js 模块（`.js` 文件）
- 通过 `package.json` 中的 `skills` 字段注册
- Claude Code 启动时自动发现技能

#### 2. 命令行式调用
- **使用方式**：`/skill-name --arg=value`
- **示例**：`/crisis-intervention --action=assess --patientId=P001`
- **特点**：不是通过 AI 模型的 function calling API

#### 3. Skill 文件结构

```javascript
// .claude/skills/psychiatry-tools/crisis-intervention.js
module.exports = {
  name: "crisis-intervention",
  description: "危机干预工具",
  args: {
    action: {
      type: "string",
      required: true,
      enum: ["assess", "plan", "guide", "resources"]
    },
    patientId: {
      type: "string",
      description: "患者ID"
    }
  },
  run: async (args, context) => {
    // 执行逻辑
    return { riskLevel: "high", recommendation: "..." };
  }
};
```

#### 4. 自动发现和加载
- Claude Code 启动时自动发现技能
- 根据上下文自主选择何时使用技能
- 通过 `allowed_tools` 配置启用

### 1.2 与 Function Calling 的区别

| 特性 | Claude Code Skill | Function Calling |
|------|------------------|------------------|
| 调用方式 | 命令行式 `/skill --arg=value` | API 调用（JSON 格式） |
| 发现机制 | 文件系统自动发现 | 通过 API 传入 function definitions |
| 执行环境 | Node.js 运行时 | 服务器端执行 |
| 参数格式 | 命令行参数 | JSON Schema |
| AI 集成 | Claude Code 内部机制 | 标准 AI API 功能 |
| 触发方式 | 用户手动输入命令行 | AI 自动判断 + 用户触发 |

---

## 二、Claude Skill 的三层渐进式加载机制

### 2.1 三层架构

Claude Skill 采用**三层渐进式加载**机制：

```
Level 1（元数据）→ 始终加载
  ↓
Level 2（指令）→ 触发时加载
  ↓
Level 3（资源/代码）→ 按需加载
```

### 2.2 各层内容

#### Level 1：元数据（始终加载）
- 技能名称
- 技能描述
- 基本信息
- **目的**：快速识别技能，决定是否需要使用

#### Level 2：指令（触发时加载）
- 具体操作指南
- 使用场景说明
- 触发条件
- **目的**：提供详细的使用说明

#### Level 3：资源和代码（按需加载）
- 模板文件
- 示例数据
- 可执行脚本
- **目的**：提供完整的执行资源

### 2.3 渐进式加载的优势

1. **性能优化**
   - 减少初始加载时间（只加载元数据）
   - 按需加载详细内容（节省资源）
   - 渐进式增强（从简单到复杂）

2. **扩展性**
   - 可以添加大量技能，不影响初始加载性能
   - 技能资源可以很大（模板、脚本），但不影响初始性能
   - 支持技能的热更新（修改 Level 2/3 不影响 Level 1）

3. **灵活性**
   - AI 可以根据对话上下文动态选择技能
   - 不同角色可以有不同的技能组合
   - 技能可以按需启用/禁用

---

## 三、心域系统的实现方式

### 3.1 转换策略

心域系统将 Claude Code 的 skill 机制转换为标准的 Function Calling：

```
Claude Code Skill (命令行式)
  ↓
转换为 Function Definition (JSON Schema)
  ↓
AI 模型 Function Calling
  ↓
拦截 Function Call
  ↓
转换为 Skill 执行
  ↓
执行 Skill 逻辑
  ↓
返回结果给 AI
```

### 3.2 实现流程

#### 阶段 1：技能发现（初始加载）

**位置**：`frontend/components/chat/utils/generateAIResponse.ts`

```typescript
// 获取角色可用技能（用于 Function Calling）
let functionDefinitions: FunctionDefinition[] = [];

if (character.id) {
  functionDefinitions = await skillService.getCharacterAvailableSkills(character.id);
}
```

**加载内容**：
- ✅ **Level 1**：技能元数据（skill_definitions 表）
  - skill_id
  - name
  - description
  - function_schema（JSON Schema）

**不加载**：
- ❌ Level 2：技能指令（skill_instructions 表）
- ❌ Level 3：技能资源（skill_resources 表）

#### 阶段 2：AI 判断（Function Calling）

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

#### 阶段 3：技能执行（渐进式加载）

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

#### 阶段 4：结果处理（上下文注入）

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

## 四、关键差异对比

### 4.1 Claude Code vs 心域系统

| 特性 | Claude Code Skill | 心域 Skill 系统 |
|------|------------------|----------------|
| **调用方式** | 命令行式 `/skill --arg=value` | Function Calling（JSON） |
| **发现机制** | 文件系统自动发现 | 数据库查询 + 角色绑定 |
| **执行环境** | Node.js 运行时 | Java 后端服务 |
| **AI 集成** | Claude Code 内部机制 | 标准 Function Calling API |
| **触发方式** | 用户手动输入命令行 | AI 自动判断 + 用户触发 |
| **三层架构** | ✅ Level 1/2/3 | ✅ Level 1/2/3 |
| **渐进式加载** | ✅ 按需加载 | ✅ 按需加载 |
| **元数据优先** | ✅ 初始只加载元数据 | ✅ 初始只加载元数据 |

### 4.2 关键差异说明

#### Claude Code Skill：
- **用户主动输入**命令行调用技能
- 例如：`/crisis-intervention --action=assess`
- 需要用户知道技能名称和参数格式

#### 心域 Skill 系统：
- **AI 自动判断**是否需要调用技能
- 例如：用户说"我最近感觉很绝望"，AI 自动调用 `crisis_intervention`
- 用户无需知道技能的存在，AI 智能选择

---

## 五、转换实现细节

### 5.1 格式转换

#### Claude Code Skill 定义

```javascript
// .claude/skills/psychiatry-tools/crisis-intervention.js
module.exports = {
  name: "crisis-intervention",
  description: "危机干预工具",
  args: {
    action: {
      type: "string",
      required: true,
      enum: ["assess", "plan", "guide", "resources"]
    },
    patientId: {
      type: "string",
      description: "患者ID"
    }
  },
  run: async (args, context) => {
    // 执行逻辑
  }
};
```

#### 转换为 Function Definition

```json
{
  "name": "crisis_intervention",
  "description": "危机干预工具 - 评估风险、制定干预方案、提供应急指导",
  "parameters": {
    "type": "object",
    "properties": {
      "action": {
        "type": "string",
        "enum": ["assess", "plan", "guide", "resources"],
        "description": "操作类型"
      },
      "patientId": {
        "type": "string",
        "description": "患者ID"
      }
    },
    "required": ["action"]
  }
}
```

### 5.2 执行转换

#### AI 返回的 function call

```json
{
  "name": "crisis_intervention",
  "arguments": {
    "action": "assess",
    "patientId": "P001"
  }
}
```

#### 转换为 skill 执行

```java
// 后端执行
SkillExecutionResult result = skillExecutor.execute(
    "crisis_intervention",
    Map.of(
        "action", "assess",
        "patientId", "P001"
    ),
    context
);
```

---

## 六、完整使用流程示例

### 6.1 用户对话场景

**用户输入**：
```
我最近感觉很绝望，觉得活着没意思
```

### 6.2 系统处理流程

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

## 七、核心优势总结

### 7.1 心域系统的改进

1. **AI 自动判断**
   - 不需要用户手动输入命令行
   - AI 自动判断是否需要使用技能
   - 更自然的交互体验

2. **Function Calling 标准**
   - 使用标准的 Function Calling API
   - 兼容多种 AI 模型（OpenAI、Claude、Gemini）
   - 符合行业标准

3. **数据库存储**
   - 使用数据库存储技能定义
   - 便于管理和查询
   - 支持动态更新

4. **角色绑定**
   - 支持不同角色拥有不同的技能组合
   - 灵活的权限控制
   - 个性化技能配置

### 7.2 保持的优势

1. **三层架构**
   - 完全参照 Claude 的 Level 1/2/3 设计
   - 渐进式加载减少初始开销

2. **按需加载**
   - 初始只加载元数据
   - 执行时才加载详细内容
   - 性能优化

3. **模块化设计**
   - 技能定义与执行分离
   - 易于扩展和维护

---

## 八、代码位置

### 8.1 前端

- **技能获取**：`main/frontend/components/chat/utils/generateAIResponse.ts`
- **Function Calling 适配器**：
  - `main/frontend/services/ai/adapters/OpenAIAdapter.ts`
  - `main/frontend/services/ai/adapters/GeminiAdapter.ts`
  - `main/frontend/services/ai/adapters/DoubaoAdapter.ts`

### 8.2 后端

- **技能注册表**：`main/backend/src/main/java/com/heartsphere/skill/service/SkillRegistry.java`
- **技能执行器**：`main/backend/src/main/java/com/heartsphere/skill/service/SkillExecutor.java`
- **技能定义实体**：`main/backend/src/main/java/com/heartsphere/skill/entity/SkillDefinition.java`

### 8.3 数据库

- **技能定义表**：`skill_definitions`
- **技能指令表**：`skill_instructions`
- **技能资源表**：`skill_resources`
- **角色技能绑定表**：`character_skill_bindings`

---

## 九、总结

### 9.1 Claude Code Skill 机制

- **文件系统发现**：`.claude/skills/` 目录
- **命令行式调用**：`/skill-name --arg=value`
- **Node.js 模块**：每个 skill 是一个 JS 文件
- **用户手动触发**：需要用户输入命令行

### 9.2 心域系统实现

- **数据库存储**：技能定义存储在数据库
- **Function Calling**：转换为标准 Function Calling 格式
- **AI 自动判断**：AI 根据对话内容自动选择技能
- **渐进式加载**：保持 Claude 的三层架构优势

### 9.3 核心价值

1. **智能化**：AI 自动判断何时使用技能，无需用户学习命令行
2. **标准化**：使用 Function Calling 标准，兼容多种 AI 模型
3. **性能优化**：渐进式加载减少初始开销
4. **灵活扩展**：易于添加新技能，支持角色个性化配置

---

**文档创建时间**：2025-01-06  
**最后更新**：2025-01-06
