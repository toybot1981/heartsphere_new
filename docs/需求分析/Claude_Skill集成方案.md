# Claude Skill 集成方案 - 让数字生命拥有强大技能

## 一、概述

### 1.1 目标

将 Claude Code 的 Skill 系统集成到心域数字生命系统中，让场景内的数字生命具有强大的技能能力，能够在对话中主动或被动地使用各种技能，提供更丰富、更智能的交互体验。

### 1.2 重要说明

**Claude Code 的 skill 调用机制说明**：

- Claude Code 中的 skill **不是**标准的 function calling
- 它是命令行式的工具系统（`/skill-name --arg=value`）
- 通过文件系统发现（`.claude/skills/` 目录）
- 使用 Node.js 模块格式

**集成方案**：

- 需要将 Claude Code skill 转换为 function calling 格式
- 通过适配层实现两种格式的转换
- 在 AI 对话中使用 function calling 机制调用技能

详细说明请参考：[Claude_Skill调用机制说明.md](./Claude_Skill调用机制说明.md)

### 1.2 核心价值

1. **技能化能力**：数字生命不再是简单的对话机器人，而是拥有各种专业技能的智能体
2. **模块化设计**：技能可以独立开发、测试、部署，易于扩展和维护
3. **场景适配**：不同场景的数字生命可以拥有不同的技能组合
4. **智能调用**：AI 可以根据对话上下文自动判断何时使用技能

---

## 二、架构设计

### 2.1 整体架构

```
┌─────────────────────────────────────────────────────────────┐
│                    用户对话层                                │
│  (ChatWindow / MobileChatWindow)                            │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                  AI 对话服务层                                │
│  (generateAIResponse / AIService)                           │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Function Calling 拦截器                              │   │
│  │  - 检测 AI 返回的 function_call                        │   │
│  │  - 解析技能调用请求                                    │   │
│  └──────────────────────────────────────────────────────┘   │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                  Skill 执行引擎层                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  SkillRegistry (技能注册表)                           │   │
│  │  - 技能发现和注册                                      │   │
│  │  - 技能元数据管理                                      │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  SkillExecutor (技能执行器)                           │   │
│  │  - 技能加载（按层级）                                  │   │
│  │  - 参数验证和转换                                      │   │
│  │  - 技能执行                                            │   │
│  │  - 结果处理和返回                                      │   │
│  └──────────────────────────────────────────────────────┘   │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                  Skill 定义层                                 │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  数据库存储 (skill_definitions, skill_instructions)   │   │
│  │  文件系统存储 (.claude/skills/)                        │   │
│  └──────────────────────────────────────────────────────┘   │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                  Graph 流程集成层                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  SkillNode (技能执行节点)                              │   │
│  │  - 在 Graph 流程中执行技能                             │   │
│  │  - 与场景状态交互                                      │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 数据流

```
用户输入
  ↓
AI 对话服务（带 Function Calling）
  ↓
检测到 function_call → 解析技能ID和参数
  ↓
Skill 执行引擎
  ├─ 加载技能定义（Level 1 → Level 2 → Level 3）
  ├─ 验证参数
  ├─ 执行技能逻辑
  └─ 返回结果
  ↓
将结果注入 AI 上下文
  ↓
AI 生成包含技能结果的回复
  ↓
返回给用户
```

---

## 三、核心组件设计

### 3.1 Skill Registry（技能注册表）

**功能**：管理所有可用技能，提供技能发现和查询能力

**实现位置**：`backend/src/main/java/com/heartsphere/aiagent/skill/`

```java
@Service
public class SkillRegistry {
    
    // 技能注册表：skillId -> SkillDefinition
    private final Map<String, SkillDefinition> skills = new ConcurrentHashMap<>();
    
    // 按角色/场景的技能映射：characterId -> List<skillId>
    private final Map<Long, Set<String>> characterSkills = new ConcurrentHashMap<>();
    
    /**
     * 注册技能
     */
    public void registerSkill(SkillDefinition skill) {
        skills.put(skill.getSkillId(), skill);
    }
    
    /**
     * 获取技能定义
     */
    public SkillDefinition getSkill(String skillId) {
        return skills.get(skillId);
    }
    
    /**
     * 获取角色可用的技能列表
     */
    public List<SkillDefinition> getCharacterSkills(Long characterId) {
        Set<String> skillIds = characterSkills.getOrDefault(characterId, Collections.emptySet());
        return skillIds.stream()
            .map(skills::get)
            .filter(Objects::nonNull)
            .collect(Collectors.toList());
    }
    
    /**
     * 将技能转换为 Function Calling 格式
     */
    public List<FunctionDefinition> toFunctionDefinitions(List<SkillDefinition> skills) {
        return skills.stream()
            .map(this::toFunctionDefinition)
            .collect(Collectors.toList());
    }
    
    private FunctionDefinition toFunctionDefinition(SkillDefinition skill) {
        // 将技能定义转换为 OpenAI/Claude 的 function calling 格式
        // 包括：name, description, parameters (JSON Schema)
    }
}
```

### 3.2 Skill Executor（技能执行器）

**功能**：执行技能逻辑，处理技能的三层加载机制

```java
@Service
public class SkillExecutor {
    
    @Autowired
    private SkillRegistry skillRegistry;
    
    @Autowired
    private SkillDefinitionService skillDefinitionService;
    
    @Autowired
    private SkillInstructionService skillInstructionService;
    
    @Autowired
    private SkillResourceService skillResourceService;
    
    /**
     * 执行技能
     */
    public SkillExecutionResult execute(
        String skillId, 
        Map<String, Object> parameters,
        SkillExecutionContext context
    ) {
        // 1. 加载 Level 1：元数据（已缓存）
        SkillDefinition skill = skillRegistry.getSkill(skillId);
        if (skill == null) {
            throw new SkillNotFoundException(skillId);
        }
        
        // 2. 验证参数
        validateParameters(skill, parameters);
        
        // 3. 加载 Level 2：指令（按需加载）
        List<SkillInstruction> instructions = skillInstructionService
            .getInstructions(skillId, 2);
        
        // 4. 加载 Level 3：资源（按需加载）
        List<SkillResource> resources = skillResourceService
            .getResources(skillId);
        
        // 5. 执行技能逻辑
        Object result = executeSkillLogic(skill, instructions, resources, parameters, context);
        
        // 6. 记录技能使用
        recordSkillUsage(skillId, context.getCharacterId(), parameters, result);
        
        return SkillExecutionResult.builder()
            .skillId(skillId)
            .success(true)
            .result(result)
            .build();
    }
    
    /**
     * 执行技能逻辑
     */
    private Object executeSkillLogic(
        SkillDefinition skill,
        List<SkillInstruction> instructions,
        List<SkillResource> resources,
        Map<String, Object> parameters,
        SkillExecutionContext context
    ) {
        // 根据技能类型执行不同的逻辑
        switch (skill.getSkillType()) {
            case "SCRIPT":
                // 执行脚本（JavaScript/Python）
                return executeScript(skill, resources, parameters, context);
            case "API":
                // 调用外部 API
                return callExternalAPI(skill, resources, parameters, context);
            case "GRAPH":
                // 执行 Graph 流程
                return executeGraph(skill, resources, parameters, context);
            case "DATABASE":
                // 数据库操作
                return executeDatabaseOperation(skill, resources, parameters, context);
            default:
                // 默认：基于指令的规则执行
                return executeRuleBased(skill, instructions, parameters, context);
        }
    }
}
```

### 3.3 Function Calling 拦截器

**功能**：在 AI 对话服务中拦截 function calling 请求，转换为技能执行

**实现位置**：`frontend/services/ai/` 和 `backend/src/main/java/com/heartsphere/aiagent/service/`

#### 前端实现（TypeScript）

```typescript
// frontend/services/ai/SkillFunctionCallHandler.ts

export class SkillFunctionCallHandler {
  private skillRegistry: SkillRegistry;
  
  /**
   * 处理 AI 返回的 function calling
   */
  async handleFunctionCall(
    functionCall: FunctionCall,
    character: Character,
    context: SkillExecutionContext
  ): Promise<FunctionCallResult> {
    const skillId = functionCall.name;
    const parameters = JSON.parse(functionCall.arguments || '{}');
    
    // 调用后端技能执行服务
    const result = await this.executeSkill(skillId, parameters, character.id, context);
    
    return {
      name: skillId,
      result: JSON.stringify(result)
    };
  }
  
  /**
   * 为角色生成可用的 function definitions
   */
  async getFunctionDefinitions(characterId: number): Promise<FunctionDefinition[]> {
    const skills = await this.skillRegistry.getCharacterSkills(characterId);
    return skills.map(skill => this.toFunctionDefinition(skill));
  }
}
```

#### 后端实现（Java）

```java
// backend/src/main/java/com/heartsphere/aiagent/service/SkillAIService.java

@Service
public class SkillAIService {
    
    @Autowired
    private SkillRegistry skillRegistry;
    
    @Autowired
    private SkillExecutor skillExecutor;
    
    /**
     * 生成带技能支持的 AI 响应
     */
    public void generateTextWithSkills(
        Long userId,
        Long characterId,
        TextGenerationRequest request,
        StreamResponseHandler<TextGenerationResponse> handler
    ) {
        // 1. 获取角色可用的技能
        List<SkillDefinition> skills = skillRegistry.getCharacterSkills(characterId);
        
        // 2. 转换为 function definitions
        List<FunctionDefinition> functions = skillRegistry.toFunctionDefinitions(skills);
        
        // 3. 在系统指令中添加技能说明
        String systemInstruction = buildSystemInstructionWithSkills(request.getSystemInstruction(), skills);
        request.setSystemInstruction(systemInstruction);
        
        // 4. 调用 AI 服务（支持 function calling）
        aiService.generateTextStreamWithFunctions(
            userId, 
            request, 
            functions,  // 传入 function definitions
            (response, done) -> {
                // 5. 检测 function calling
                if (response.hasFunctionCall()) {
                    handleFunctionCall(response, characterId, handler);
                } else {
                    // 正常文本响应
                    handler.handle(response, done);
                }
            }
        );
    }
    
    /**
     * 处理 function calling
     */
    private void handleFunctionCall(
        TextGenerationResponse response,
        Long characterId,
        StreamResponseHandler<TextGenerationResponse> handler
    ) {
        FunctionCall functionCall = response.getFunctionCall();
        String skillId = functionCall.getName();
        Map<String, Object> parameters = functionCall.getArguments();
        
        // 执行技能
        SkillExecutionResult result = skillExecutor.execute(
            skillId,
            parameters,
            SkillExecutionContext.builder()
                .characterId(characterId)
                .userId(response.getUserId())
                .build()
        );
        
        // 将技能结果注入到 AI 上下文，继续对话
        // 这里需要将 function call 的结果作为 assistant message 的一部分
        // 然后让 AI 基于结果生成最终回复
    }
}
```

---

## 四、技能定义格式

### 4.1 数据库存储格式

沿用现有的 `skill_definitions`、`skill_instructions`、`skill_resources` 表结构。

### 4.2 Function Calling 格式转换

将技能定义转换为标准的 Function Calling 格式（OpenAI/Claude 兼容）：

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
      },
      "riskLevel": {
        "type": "string",
        "enum": ["low", "medium", "high", "critical"],
        "description": "风险等级"
      },
      "symptoms": {
        "type": "array",
        "items": {
          "type": "string"
        },
        "description": "危机症状"
      },
      "situation": {
        "type": "string",
        "description": "危机情况描述"
      }
    },
    "required": ["action"]
  }
}
```

### 4.3 技能元数据增强

在 `skill_definitions` 表中添加字段：

```sql
ALTER TABLE skill_definitions ADD COLUMN function_schema TEXT COMMENT 'Function Calling JSON Schema';
ALTER TABLE skill_definitions ADD COLUMN execution_type VARCHAR(50) COMMENT '执行类型：SCRIPT/API/GRAPH/DATABASE';
ALTER TABLE skill_definitions ADD COLUMN execution_config TEXT COMMENT '执行配置（JSON格式）';
```

---

## 五、集成到对话系统

### 5.1 前端集成

修改 `generateAIResponse` 函数，支持 function calling：

```typescript
// frontend/components/chat/utils/generateAIResponse.ts

export const generateAIResponse = async ({
  userText,
  userMsg,
  historyWithUserMsg,
  character,
  settings,
  userProfile,
  tempBotId,
  onUpdateHistory,
  setIsLoading,
  engine,
  engineReady,
  memorySystem,
  relevantMemories = [],
  onComplete,
  customSystemInstructionSuffix,
}: GenerateAIResponseOptions): Promise<void> => {
  // ... 现有代码 ...
  
  // 新增：获取角色可用的技能
  const characterSkills = await skillService.getCharacterSkills(character.id);
  const functionDefinitions = skillService.toFunctionDefinitions(characterSkills);
  
  // 调用 AI 服务（支持 function calling）
  await aiService.generateTextStreamWithFunctions(
    {
      prompt: userText,
      systemInstruction: systemInstruction,
      messages: historyMessages,
      temperature: 0.7,
      maxTokens: 2048,
      functions: functionDefinitions,  // 传入 function definitions
    },
    async (response, done) => {
      // 检测 function calling
      if (response.functionCall) {
        // 执行技能
        const skillResult = await skillService.executeSkill(
          response.functionCall.name,
          response.functionCall.arguments,
          character.id
        );
        
        // 将技能结果注入上下文，继续生成回复
        await aiService.generateTextStreamWithFunctions(
          {
            prompt: userText,
            systemInstruction: systemInstruction,
            messages: [
              ...historyMessages,
              {
                role: 'assistant',
                content: null,
                functionCall: response.functionCall
              },
              {
                role: 'function',
                name: response.functionCall.name,
                content: JSON.stringify(skillResult)
              }
            ],
            temperature: 0.7,
            maxTokens: 2048,
            functions: functionDefinitions,
          },
          streamHandler  // 使用原有的流式处理
        );
      } else {
        // 正常文本响应
        streamHandler(response, done);
      }
    }
  );
};
```

### 5.2 后端集成

修改 `AIServiceImpl`，支持 function calling：

```java
// backend/src/main/java/com/heartsphere/aiagent/service/AIServiceImpl.java

@Override
public void generateTextStreamWithFunctions(
    Long userId,
    TextGenerationRequest request,
    List<FunctionDefinition> functions,
    StreamResponseHandler<TextGenerationResponse> handler
) {
    // 根据 provider 选择支持 function calling 的适配器
    ModelAdapter adapter = adapterManager.getAdapter(request.getProvider());
    
    // 调用适配器的 function calling 方法
    adapter.generateTextStreamWithFunctions(request, functions, handler);
}
```

### 5.3 适配器扩展

为各个模型适配器添加 function calling 支持：

```java
// backend/src/main/java/com/heartsphere/aiagent/adapter/OpenAIAdapter.java

@Override
public void generateTextStreamWithFunctions(
    TextGenerationRequest request,
    List<FunctionDefinition> functions,
    StreamResponseHandler<TextGenerationResponse> handler
) {
    // 构建 OpenAI 格式的 function calling 请求
    // 调用 OpenAI API
    // 处理 function calling 响应
}
```

---

## 六、技能与 Graph 流程集成

### 6.1 SkillNode 节点

在 Graph 流程中添加技能执行节点：

```json
{
  "id": "skill_node_1",
  "nodeType": "skill",
  "nodeConfig": {
    "skillId": "crisis_intervention",
    "executionMode": "AUTOMATIC",  // ACTIVE/PASSIVE/AUTOMATIC
    "parameters": {
      "action": "assess",
      "patientId": "${characterId}"
    },
    "onSuccessNodeId": "skill_success",
    "onFailureNodeId": "skill_failure"
  }
}
```

### 6.2 技能触发条件

技能可以在以下场景触发：

1. **主动触发**：用户在对话中明确要求使用技能
2. **自动触发**：AI 根据对话上下文自动判断需要使用技能
3. **Graph 流程触发**：在 Graph 流程的特定节点执行技能
4. **条件触发**：满足特定条件时自动触发（如技能检查节点）

---

## 七、实施步骤

### 7.1 第一阶段：基础框架（2-3周）

1. **数据库扩展**
   - 扩展 `skill_definitions` 表，添加 function calling 相关字段
   - 创建技能执行记录表

2. **后端核心服务**
   - 实现 `SkillRegistry`
   - 实现 `SkillExecutor`
   - 实现 `SkillAIService`

3. **前端技能服务**
   - 实现 `SkillService`（前端）
   - 实现 `SkillFunctionCallHandler`

### 7.2 第二阶段：AI 集成（2-3周）

1. **Function Calling 支持**
   - 扩展 `AIService` 支持 function calling
   - 扩展模型适配器（OpenAI, Claude, Gemini 等）
   - 实现 function calling 拦截和处理

2. **对话系统集成**
   - 修改 `generateAIResponse` 支持 function calling
   - 实现技能结果的上下文注入
   - 测试技能调用流程

### 7.3 第三阶段：Graph 集成（1-2周）

1. **SkillNode 实现**
   - 实现 `SkillNode` 节点类型
   - 集成到 Graph 流程编辑器
   - 支持技能参数配置

2. **技能触发机制**
   - 实现自动触发逻辑
   - 实现条件触发机制

### 7.4 第四阶段：技能库建设（持续）

1. **迁移现有技能**
   - 将 `.claude/skills/psychiatry-tools/` 中的技能迁移到数据库
   - 创建更多场景技能（学习、创作、游戏等）

2. **技能管理界面**
   - 在 Admin 端创建技能管理界面
   - 支持技能创建、编辑、测试

---

## 八、示例场景

### 8.1 心理医生角色使用危机干预技能

**对话流程**：
```
用户：我最近感觉很绝望，觉得活着没意思

AI（心理医生角色）：
  → 检测到危机信号
  → 自动调用 crisis_intervention 技能
  → 执行：assess(patientId="user_123", symptoms=["绝望", "活着没意思"])
  → 获得风险评估结果：riskLevel="high"
  → 生成回复："我理解你的感受。根据评估，你的风险等级为高风险。
     我建议我们立即制定一个安全计划。让我为你创建一个干预方案..."
  → 继续调用：plan(patientId="user_123", riskLevel="high")
  → 返回详细的干预方案
```

### 8.2 学习伙伴角色使用学习技能

**对话流程**：
```
用户：帮我制定一个学习计划

AI（学习伙伴角色）：
  → 调用 study_plan_creator 技能
  → 执行：createPlan(subject="数学", level="高中", duration="30天")
  → 返回详细的学习计划
  → 生成回复："我为你制定了一个30天的数学学习计划。
     第一周重点复习基础概念，第二周..."
```

### 8.3 Graph 流程中的技能使用

```
Start
  ↓
Dialogue（用户描述问题）
  ↓
SkillNode（执行情绪分析技能）
  ↓
Condition（判断情绪状态）
  ├─ 负面情绪 → SkillNode（执行危机干预）→ Dialogue（提供帮助）
  └─ 正常情绪 → Dialogue（继续对话）
```

---

## 九、技术挑战与解决方案

### 9.1 Function Calling 兼容性

**挑战**：不同 AI 模型的 function calling 格式可能不同

**解决方案**：
- 定义统一的 Function Definition 格式
- 在适配器层进行格式转换
- 优先支持 OpenAI 和 Claude（格式相似）

### 9.2 技能执行性能

**挑战**：技能执行可能耗时，影响对话响应速度

**解决方案**：
- 技能执行异步化
- 使用缓存减少重复加载
- 对于耗时技能，先返回"正在处理"提示

### 9.3 技能权限控制

**挑战**：不同角色应该有不同的技能权限

**解决方案**：
- 在 `character_skills` 表中管理角色技能关联
- 在技能执行前检查权限
- 支持技能使用次数限制

### 9.4 技能结果展示

**挑战**：技能返回的结构化数据需要友好地展示给用户

**解决方案**：
- 技能结果通过 AI 自然语言化
- 支持富文本展示（表格、列表等）
- 提供技能结果的详细视图

---

## 十、总结

通过将 Claude Skill 集成到心域系统中，我们可以：

1. **提升数字生命能力**：从简单对话升级为拥有专业技能的智能体
2. **模块化扩展**：技能可以独立开发、测试、部署
3. **场景适配**：不同场景的数字生命拥有不同的技能组合
4. **智能交互**：AI 自动判断何时使用技能，提供更智能的交互体验

这个集成方案充分利用了现有的 Graph 流程编辑器、技能系统基础，以及 AI 对话系统，实现了技能的完整闭环：定义 → 注册 → 调用 → 执行 → 结果展示。
