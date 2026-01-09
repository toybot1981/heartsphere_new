# Claude Skill 集成快速参考

## 一、核心概念

### 什么是 Claude Skill？

Claude Skill 是模块化的能力系统，每个技能包含：
- **Level 1（元数据）**：技能名称、描述（始终加载）
- **Level 2（指令）**：详细操作指南（触发时加载）
- **Level 3（资源）**：模板、脚本、示例（按需加载）

### 集成目标

让数字生命在对话中能够：
1. **自动识别**：根据对话内容判断是否需要使用技能
2. **主动调用**：通过 Function Calling 机制调用技能
3. **执行技能**：执行技能逻辑，获取结果
4. **自然回复**：将技能结果融入对话，生成自然回复

---

## 二、架构概览

```
用户对话
  ↓
AI 服务（检测 function call）
  ↓
Skill 执行引擎
  ├─ Skill Registry（技能注册表）
  ├─ Skill Executor（技能执行器）
  └─ 执行结果
  ↓
AI 服务（生成包含结果的回复）
  ↓
返回给用户
```

---

## 三、关键组件

### 1. Skill Registry（技能注册表）
- **功能**：管理所有可用技能
- **位置**：`backend/src/main/java/com/heartsphere/aiagent/skill/SkillRegistry.java`
- **核心方法**：
  - `getCharacterSkills(characterId)` - 获取角色可用技能
  - `toFunctionDefinitions(skills)` - 转换为 Function Calling 格式

### 2. Skill Executor（技能执行器）
- **功能**：执行技能逻辑
- **位置**：`backend/src/main/java/com/heartsphere/aiagent/skill/SkillExecutor.java`
- **执行类型**：
  - `SCRIPT` - 执行脚本（JavaScript/Python）
  - `API` - 调用外部 API
  - `GRAPH` - 执行 Graph 流程
  - `DATABASE` - 数据库操作
  - `RULE_BASED` - 基于规则（默认）

### 3. Function Calling 拦截器
- **功能**：在 AI 对话中拦截 function call，转换为技能执行
- **位置**：
  - 前端：`frontend/components/chat/utils/generateAIResponse.ts`
  - 后端：`backend/src/main/java/com/heartsphere/aiagent/service/SkillAIService.java`

---

## 四、数据流程

### 完整流程示例

```
1. 用户输入："我最近感觉很绝望，觉得活着没意思"

2. AI 检测到关键词（"绝望"、"活着没意思"）
   → 触发自动技能检测
   → 发现 crisis_intervention 技能

3. AI 生成 function call：
   {
     "name": "crisis_intervention",
     "arguments": {
       "action": "assess",
       "symptoms": ["绝望", "活着没意思"],
       "situation": "用户表达绝望和自杀意念"
     }
   }

4. 系统拦截 function call
   → 调用 SkillExecutor.execute()
   → 执行危机评估逻辑
   → 返回评估结果

5. 将结果注入 AI 上下文：
   {
     "role": "function",
     "name": "crisis_intervention",
     "content": {
       "riskLevel": "high",
       "recommendation": "需要密切监测..."
     }
   }

6. AI 基于结果生成回复：
   "我理解你的感受。根据评估，你的风险等级为高风险。
   我建议我们立即制定一个安全计划..."

7. 返回给用户
```

---

## 五、数据库表结构

### 核心表

1. **skill_definitions** - 技能定义
   - `skill_id` - 技能ID
   - `name` - 技能名称
   - `description` - 描述
   - `function_schema` - Function Calling JSON Schema
   - `execution_type` - 执行类型
   - `auto_trigger_keywords` - 自动触发关键词

2. **character_skill_bindings** - 角色技能关联
   - `character_id` - 角色ID
   - `skill_id` - 技能ID
   - `is_enabled` - 是否启用
   - `auto_trigger` - 是否自动触发
   - `priority` - 优先级

3. **skill_executions** - 技能执行记录
   - `skill_id` - 技能ID
   - `character_id` - 角色ID
   - `parameters` - 执行参数
   - `result` - 执行结果
   - `success` - 是否成功

---

## 六、快速开始

### 1. 创建技能定义

```sql
INSERT INTO skill_definitions (
    skill_id, name, description, category, skill_type,
    function_schema, execution_type, execution_config
) VALUES (
    'my_skill',
    '我的技能',
    '技能描述',
    'custom',
    'ACTIVE',
    '{"type":"object","properties":{...}}',
    'SCRIPT',
    '{"scriptPath":".claude/skills/my-skill.js"}'
);
```

### 2. 为角色绑定技能

```sql
INSERT INTO character_skill_bindings (
    character_id, skill_id, is_enabled, auto_trigger, priority
) VALUES (
    1, 'my_skill', TRUE, FALSE, 0
);
```

### 3. 在对话中使用

系统会自动：
- 检测角色可用技能
- 转换为 Function Definitions
- 在对话中支持技能调用
- 执行技能并返回结果

---

## 七、技能类型示例

### 1. 危机干预技能（SCRIPT 类型）

```javascript
// .claude/skills/psychiatry-tools/crisis-intervention.js
module.exports = {
  name: "crisis-intervention",
  description: "危机干预工具",
  args: {
    action: { type: "string", required: true },
    symptoms: { type: "array" }
  },
  run: async (args, context) => {
    // 执行逻辑
    return { riskLevel: "high", recommendation: "..." };
  }
};
```

### 2. 学习计划技能（API 类型）

```json
{
  "skill_id": "study_plan_creator",
  "execution_type": "API",
  "execution_config": {
    "apiUrl": "https://api.example.com/study-plan",
    "method": "POST"
  }
}
```

### 3. Graph 流程技能（GRAPH 类型）

```json
{
  "skill_id": "custom_workflow",
  "execution_type": "GRAPH",
  "execution_config": {
    "graphId": 123,
    "entryNodeId": "start_node"
  }
}
```

---

## 八、API 接口

### 获取角色技能

```
GET /api/skills/character/{characterId}
```

### 执行技能

```
POST /api/skills/{skillId}/execute
Body: {
  "characterId": 1,
  "parameters": { ... }
}
```

### 检查自动触发

```
POST /api/skills/auto-trigger
Body: {
  "characterId": 1,
  "userInput": "用户输入文本"
}
```

---

## 九、最佳实践

### 1. 技能设计
- **单一职责**：每个技能只做一件事
- **参数清晰**：参数定义明确，易于理解
- **错误处理**：完善的错误处理和提示

### 2. 性能优化
- **缓存技能定义**：避免重复加载
- **异步执行**：耗时操作异步处理
- **结果缓存**：相同参数的结果可以缓存

### 3. 安全考虑
- **权限控制**：检查角色是否有权限使用技能
- **参数验证**：严格验证输入参数
- **使用限制**：设置每日使用次数限制

---

## 十、常见问题

### Q1: 如何让 AI 自动使用技能？

A: 在 `skill_definitions` 表中设置 `auto_trigger_keywords` 字段，包含触发关键词。AI 检测到这些关键词时会自动考虑使用该技能。

### Q2: 技能执行失败怎么办？

A: 系统会记录错误信息，并继续正常对话。用户不会感知到技能执行失败，但可以在后台查看执行记录。

### Q3: 如何限制技能使用次数？

A: 在 `skill_definitions` 表中设置 `max_usage_per_day` 字段，系统会自动检查并限制使用次数。

### Q4: 技能可以调用外部 API 吗？

A: 可以。设置 `execution_type` 为 `API`，并在 `execution_config` 中配置 API 地址和参数。

### Q5: 如何调试技能执行？

A: 查看 `skill_executions` 表中的执行记录，包括参数、结果、错误信息等。

---

## 十一、相关文档

- [Claude_Skill集成方案.md](./Claude_Skill集成方案.md) - 完整架构设计
- [Claude_Skill集成技术实现指南.md](./Claude_Skill集成技术实现指南.md) - 详细技术实现
- [心域角色Skill构建指南.md](../心域角色Skill构建指南.md) - 技能构建指南

---

## 十二、实施检查清单

### 第一阶段：基础框架
- [ ] 扩展数据库表结构
- [ ] 实现 SkillRegistry
- [ ] 实现 SkillExecutor
- [ ] 实现基础执行器（SCRIPT/API/GRAPH）

### 第二阶段：AI 集成
- [ ] 扩展 AIService 支持 function calling
- [ ] 扩展模型适配器（OpenAI/Claude/Gemini）
- [ ] 实现 function calling 拦截器
- [ ] 修改 generateAIResponse 支持技能调用

### 第三阶段：测试和优化
- [ ] 单元测试
- [ ] 集成测试
- [ ] 性能测试
- [ ] 错误处理完善

### 第四阶段：技能库建设
- [ ] 迁移现有技能（psychiatry-tools）
- [ ] 创建更多场景技能
- [ ] 技能管理界面
- [ ] 文档完善

---

**最后更新**：2025-01-03
