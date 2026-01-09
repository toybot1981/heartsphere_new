# Claude Skill 部署和加载机制

## 一、核心答案

**用户不需要提前下载 skill**。

Skill 完全存储在服务器端，用户访问时：
- ✅ **无需下载**：Skill 代码和资源都在服务器端
- ✅ **按需加载**：只在需要时从服务器加载技能元数据（Function Definition）
- ✅ **后端执行**：所有技能执行都在服务器端完成
- ✅ **结果返回**：只返回执行结果给用户

---

## 二、部署架构

### 2.1 存储位置

```
┌─────────────────────────────────────────────────────────┐
│                    服务器端（后端）                       │
│                                                          │
│  ┌──────────────────────────────────────────────────┐ │
│  │  数据库存储                                        │ │
│  │  - skill_definitions（技能元数据）                │ │
│  │  - skill_instructions（技能指令）                  │ │
│  │  - skill_resources（技能资源）                     │ │
│  │  - character_skill_bindings（角色技能关联）        │ │
│  └──────────────────────────────────────────────────┘ │
│                                                          │
│  ┌──────────────────────────────────────────────────┐ │
│  │  文件系统存储                                      │ │
│  │  - .claude/skills/（技能脚本文件）                 │ │
│  │  - 服务器文件系统，用户无法直接访问                │ │
│  └──────────────────────────────────────────────────┘ │
│                                                          │
│  ┌──────────────────────────────────────────────────┐ │
│  │  Skill 执行引擎                                  │ │
│  │  - SkillRegistry（技能注册表）                   │ │
│  │  - SkillExecutor（技能执行器）                   │ │
│  │  - 所有执行都在服务器端完成                      │ │
│  └──────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
                          │
                          │ API 调用
                          ▼
┌─────────────────────────────────────────────────────────┐
│                    客户端（前端）                        │
│                                                          │
│  ┌──────────────────────────────────────────────────┐ │
│  │  仅接收 Function Definitions                    │ │
│  │  - 技能元数据（用于 AI Function Calling）        │ │
│  │  - 不包含技能代码                                │ │
│  │  - 轻量级 JSON 数据                              │ │
│  └──────────────────────────────────────────────────┘ │
│                                                          │
│  ┌──────────────────────────────────────────────────┐ │
│  │  接收执行结果                                    │ │
│  │  - 技能执行结果（JSON 格式）                      │ │
│  │  - 不包含技能代码                                │ │
│  └──────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### 2.2 数据流

```
用户访问心域
  ↓
前端请求角色技能列表
  ↓
后端 API: GET /api/skills/character/{characterId}
  ↓
后端从数据库加载技能元数据
  ↓
转换为 Function Definitions（轻量级 JSON）
  ↓
返回给前端（仅元数据，不包含代码）
  ↓
前端将 Function Definitions 传给 AI 模型
  ↓
AI 模型判断需要调用技能
  ↓
前端发送 Function Call 请求
  ↓
后端 API: POST /api/skills/{skillId}/execute
  ↓
后端执行技能（加载代码、执行逻辑）
  ↓
返回执行结果（JSON 格式）
  ↓
前端将结果传给 AI 模型
  ↓
AI 生成包含结果的回复
  ↓
返回给用户
```

---

## 三、详细说明

### 3.1 用户端加载的内容

#### 仅加载 Function Definition（元数据）

```json
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

**特点**：
- ✅ 轻量级（通常 < 1KB）
- ✅ 不包含技能代码
- ✅ 仅用于 AI Function Calling
- ✅ 可以缓存

#### 不加载的内容

- ❌ 技能脚本代码（`.js` 文件）
- ❌ 技能资源文件
- ❌ 技能执行逻辑
- ❌ 任何可执行代码

### 3.2 服务器端存储

#### 数据库存储

```sql
-- 技能元数据（Level 1）
skill_definitions
  - skill_id
  - name
  - description
  - function_schema  -- Function Calling JSON Schema
  - execution_type
  - execution_config

-- 技能指令（Level 2）
skill_instructions
  - skill_id
  - instruction_level
  - instruction_text

-- 技能资源（Level 3）
skill_resources
  - skill_id
  - resource_type
  - resource_content
```

#### 文件系统存储（可选）

```
服务器文件系统：
.claude/skills/
  ├── psychiatry-tools/
  │   ├── crisis-intervention.js
  │   ├── patient-record.js
  │   └── ...
  └── ...
```

**注意**：这些文件存储在服务器端，用户无法直接访问。

### 3.3 执行流程

#### 步骤 1：用户访问

```typescript
// 前端：获取角色可用技能
const skills = await skillService.getCharacterSkills(characterId);
// 返回：仅 Function Definitions（JSON 格式）
```

#### 步骤 2：AI 调用

```typescript
// 前端：将 Function Definitions 传给 AI
await aiService.generateTextStreamWithFunctions({
  functions: functionDefinitions,  // 仅元数据
  // ...
});
```

#### 步骤 3：技能执行

```java
// 后端：执行技能
SkillExecutionResult result = skillExecutor.execute(
    skillId,
    parameters,
    context
);
// 执行在服务器端完成，用户看不到代码
```

#### 步骤 4：返回结果

```typescript
// 前端：接收执行结果
{
  "success": true,
  "result": {
    "riskLevel": "high",
    "recommendation": "..."
  }
}
// 仅返回结果，不包含代码
```

---

## 四、安全考虑

### 4.1 代码保护

✅ **技能代码不暴露给用户**
- 所有技能代码存储在服务器端
- 用户无法直接访问技能文件
- 只能通过 API 调用技能

✅ **执行结果可控**
- 可以过滤敏感信息
- 可以限制返回的数据量
- 可以记录所有执行日志

### 4.2 权限控制

```java
// 后端：检查权限
private void checkSkillPermission(Long characterId, String skillId) {
    // 1. 检查角色是否有权限使用该技能
    if (!characterSkillBindingRepository.existsByCharacterIdAndSkillId(characterId, skillId)) {
        throw new SkillPermissionDeniedException("角色无权使用此技能");
    }
    
    // 2. 检查技能是否启用
    CharacterSkillBinding binding = characterSkillBindingRepository
        .findByCharacterIdAndSkillId(characterId, skillId)
        .orElseThrow(() -> new SkillNotFoundException("技能未绑定"));
    
    if (!binding.getIsEnabled()) {
        throw new SkillDisabledException("技能已禁用");
    }
}
```

### 4.3 数据安全

```java
// 后端：过滤敏感数据
private Object filterSensitiveData(Object result, SkillDefinition skill) {
    // 根据技能类型过滤敏感信息
    if (skill.getCategory().equals("healthcare")) {
        // 医疗数据需要特殊处理
        return sanitizeHealthData(result);
    }
    return result;
}
```

---

## 五、性能优化

### 5.1 缓存策略

#### Function Definitions 缓存

```typescript
// 前端：缓存 Function Definitions
const skillCache = new Map<number, FunctionDefinition[]>();

async function getCharacterSkills(characterId: number) {
  // 检查缓存
  if (skillCache.has(characterId)) {
    return skillCache.get(characterId)!;
  }
  
  // 从服务器获取
  const skills = await api.get(`/api/skills/character/${characterId}`);
  
  // 缓存（5分钟）
  skillCache.set(characterId, skills);
  setTimeout(() => skillCache.delete(characterId), 5 * 60 * 1000);
  
  return skills;
}
```

#### 服务器端缓存

```java
// 后端：缓存技能定义
@Cacheable(value = "skill_definitions", key = "#skillId")
public SkillDefinition getSkill(String skillId) {
    return skillDefinitionRepository.findBySkillId(skillId);
}
```

### 5.2 按需加载

```java
// 后端：按需加载技能资源
public Object executeSkill(String skillId, Map<String, Object> parameters) {
    // Level 1：元数据（已缓存）
    SkillDefinition skill = skillRegistry.getSkill(skillId);
    
    // Level 2：指令（按需加载）
    List<SkillInstruction> instructions = skillInstructionRepository
        .findBySkillIdAndInstructionLevel(skillId, 2);
    
    // Level 3：资源（按需加载）
    List<SkillResource> resources = skillResourceRepository
        .findBySkillId(skillId);
    
    // 执行
    return executeSkillLogic(skill, instructions, resources, parameters);
}
```

---

## 六、对比说明

### 6.1 与 Claude Code 的对比

| 特性 | Claude Code | 心域系统 |
|------|------------|---------|
| **存储位置** | 本地 `.claude/skills/` | 服务器端（数据库+文件系统） |
| **用户访问** | 直接访问文件 | 通过 API 访问 |
| **代码可见性** | 用户可见 | 用户不可见 |
| **执行位置** | 本地 Node.js | 服务器端 Java |
| **加载方式** | 文件系统发现 | API 按需加载 |

### 6.2 优势

✅ **安全性**
- 技能代码不暴露给用户
- 可以控制技能的使用权限
- 可以记录所有执行日志

✅ **性能**
- 按需加载，减少初始加载时间
- 服务器端缓存，提高响应速度
- 集中管理，便于优化

✅ **可维护性**
- 技能更新无需用户操作
- 统一版本管理
- 便于监控和调试

---

## 七、实施建议

### 7.1 部署流程

1. **开发阶段**
   - 在 `.claude/skills/` 目录开发技能
   - 本地测试

2. **部署阶段**
   - 将技能定义导入数据库
   - 将技能文件部署到服务器
   - 配置技能权限

3. **运行阶段**
   - 用户访问时自动加载技能元数据
   - 按需执行技能
   - 记录执行日志

### 7.2 更新机制

```java
// 后端：技能更新
@PostMapping("/api/admin/skills/{skillId}/update")
public ResponseEntity<Void> updateSkill(
    @PathVariable String skillId,
    @RequestBody SkillUpdateRequest request
) {
    // 1. 更新数据库中的技能定义
    skillDefinitionService.updateSkill(skillId, request);
    
    // 2. 清除缓存
    skillRegistry.clearCache(skillId);
    
    // 3. 通知前端刷新（可选）
    // websocketService.broadcast("skill_updated", skillId);
    
    return ResponseEntity.ok().build();
}
```

### 7.3 版本管理

```sql
-- 技能版本表
CREATE TABLE skill_versions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    skill_id VARCHAR(100) NOT NULL,
    version VARCHAR(50) NOT NULL,
    definition_snapshot TEXT COMMENT '技能定义快照',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_skill_version (skill_id, version)
);
```

---

## 八、总结

### 核心要点

1. **用户无需下载**
   - Skill 完全存储在服务器端
   - 用户只接收轻量级的 Function Definitions
   - 所有执行都在服务器端完成

2. **按需加载**
   - 只在需要时加载技能元数据
   - 技能资源按需加载
   - 支持缓存优化

3. **安全可控**
   - 技能代码不暴露
   - 权限控制完善
   - 执行日志完整

4. **易于维护**
   - 集中管理
   - 统一更新
   - 版本控制

### 用户端体验

- ✅ **无需安装**：打开浏览器即可使用
- ✅ **无需下载**：技能自动可用
- ✅ **无需更新**：技能更新自动生效
- ✅ **快速响应**：按需加载，缓存优化

---

**最后更新**：2025-01-03
