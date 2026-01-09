# Claude Skill 调用机制说明

## 一、Claude Code 中的 Skill 调用机制

### 1.1 实际机制

**Claude Code 中的 skill 调用并不是标准的 function calling**，而是：

1. **文件系统发现机制**
   - Skill 存储在 `.claude/skills/` 目录
   - 每个 skill 是一个 Node.js 模块（`.js` 文件）
   - 通过 `package.json` 中的 `skills` 字段注册

2. **命令行式调用**
   - 使用方式：`/skill-name --arg=value`
   - 例如：`/crisis-intervention --action=assess --patientId=P001`
   - 不是通过 AI 模型的 function calling API

3. **Skill 文件结构**
   ```javascript
   module.exports = {
     name: "skill-name",
     description: "技能描述",
     args: {
       arg1: { type: "string", required: true }
     },
     run: async (args, context) => {
       // 执行逻辑
       return result;
     }
   };
   ```

4. **自动发现和加载**
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

---

## 二、集成方案中的适配转换

### 2.1 为什么需要转换？

要在心域系统的 AI 对话中使用 Claude Code 的 skill，需要：

1. **格式转换**：将命令行式 skill 转换为 function calling 格式
2. **执行适配**：将 function calling 调用转换为 skill 执行
3. **结果处理**：将 skill 执行结果转换为 AI 可理解的格式

### 2.2 转换流程

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

### 2.3 具体转换示例

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

#### 执行时的转换

```javascript
// AI 返回的 function call
{
  "name": "crisis_intervention",
  "arguments": {
    "action": "assess",
    "patientId": "P001"
  }
}

// 转换为 skill 执行
const skill = require('.claude/skills/psychiatry-tools/crisis-intervention.js');
const result = await skill.run({
  action: "assess",
  patientId: "P001"
}, context);
```

---

## 三、两种集成方案对比

### 方案 A：直接使用 Claude Code Skill 机制（不推荐）

**优点**：
- 无需转换，直接使用
- 保持原有调用方式

**缺点**：
- 无法在 AI 对话中自动调用
- 需要用户手动输入命令行
- 无法与 AI 模型深度集成

### 方案 B：转换为 Function Calling（推荐）

**优点**：
- AI 可以自动判断何时使用技能
- 与对话系统无缝集成
- 支持流式响应
- 符合标准 AI API 规范

**缺点**：
- 需要实现转换层
- 需要适配执行机制

---

## 四、实现建议

### 4.1 技能定义层

在数据库中存储两种格式：

```sql
-- skill_definitions 表
CREATE TABLE skill_definitions (
    skill_id VARCHAR(100),
    name VARCHAR(255),
    description TEXT,
    
    -- Claude Code 格式（原始）
    claude_skill_path VARCHAR(500),  -- .claude/skills/xxx.js
    claude_skill_config TEXT,         -- package.json 中的配置
    
    -- Function Calling 格式（转换后）
    function_schema TEXT,             -- JSON Schema
    
    -- 执行配置
    execution_type VARCHAR(50),       -- SCRIPT/API/GRAPH
    execution_config TEXT
);
```

### 4.2 转换服务

```java
@Service
public class SkillConverter {
    
    /**
     * 从 Claude Code Skill 转换为 Function Definition
     */
    public FunctionDefinition convertFromClaudeSkill(SkillDefinition skill) {
        // 1. 读取 .claude/skills/ 目录下的 skill 文件
        // 2. 解析 args 定义
        // 3. 转换为 JSON Schema
        // 4. 生成 Function Definition
    }
    
    /**
     * 将 Function Call 转换为 Skill 执行参数
     */
    public Map<String, Object> convertToSkillArgs(FunctionCall functionCall) {
        // 将 JSON 参数转换为 skill 需要的格式
    }
}
```

### 4.3 执行适配器

```java
@Service
public class ClaudeSkillExecutor implements SkillExecutionHandler {
    
    @Override
    public Object execute(
        SkillDefinition skill,
        List<SkillInstruction> instructions,
        List<SkillResource> resources,
        Map<String, Object> parameters,
        SkillExecutionContext context
    ) {
        // 1. 加载 .claude/skills/ 目录下的 skill 文件
        String skillPath = skill.getClaudeSkillPath();
        
        // 2. 使用 Node.js 执行 skill
        // 可以通过 ProcessBuilder 或 Node.js 运行时执行
        
        // 3. 返回结果
    }
}
```

---

## 五、总结

### 关键点

1. **Claude Code 的 skill 不是 function calling**
   - 它是命令行式的工具系统
   - 通过文件系统发现和加载
   - 使用 Node.js 模块格式

2. **集成需要转换**
   - 将 skill 转换为 function calling 格式
   - 将 function call 转换为 skill 执行
   - 适配执行环境和结果格式

3. **推荐方案**
   - 使用 Function Calling 方式集成
   - 保持 skill 的原始定义（便于维护）
   - 实现转换层和执行适配器

### 实施步骤

1. **保留现有 skill 文件**
   - 继续使用 `.claude/skills/` 目录
   - 保持 Node.js 模块格式

2. **实现转换层**
   - 读取 skill 文件，解析 `args`
   - 转换为 JSON Schema
   - 生成 Function Definition

3. **实现执行适配器**
   - 拦截 function call
   - 调用 skill 的 `run` 方法
   - 返回执行结果

4. **集成到对话系统**
   - 在 AI 对话中支持 function calling
   - 自动调用技能
   - 自然语言化结果

---

## 六、参考资料

- [Claude Code Skills 文档](https://docs.anthropic.com/claude/docs/skills)
- [OpenAI Function Calling](https://platform.openai.com/docs/guides/function-calling)
- [Claude API Function Calling](https://docs.anthropic.com/claude/reference/function-calling)

---

**最后更新**：2025-01-03
