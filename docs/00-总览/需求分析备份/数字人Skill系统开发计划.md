# 数字人 Skill 系统开发计划

## 一、项目概述

### 1.1 目标

基于 Function Calling 机制，为心域数字生命系统开发完整的 Skill 系统，让数字生命可以装备和使用各种技能，提供更丰富、更智能的交互体验。

### 1.2 核心功能

1. **技能定义和管理**：支持创建、编辑、删除技能
2. **角色技能装备**：角色可以装备多个技能
3. **技能自动调用**：AI 根据对话上下文自动调用技能
4. **技能执行引擎**：支持多种执行类型（SCRIPT/API/GRAPH/DATABASE）
5. **技能使用记录**：记录技能使用历史和统计

---

## 二、开发阶段规划

### 阶段一：基础框架（2-3周）

**目标**：建立技能系统的核心基础设施

#### 1.1 数据库设计 ✅

**任务清单**：
- [x] 设计技能定义表（skill_definitions）
- [x] 设计技能指令表（skill_instructions）
- [x] 设计技能资源表（skill_resources）
- [x] 设计角色技能关联表（character_skill_bindings）
- [x] 设计技能执行记录表（skill_executions）
- [ ] 创建数据库迁移脚本
- [ ] 编写数据库初始化脚本

**交付物**：
- 数据库表结构 SQL 脚本
- 数据库设计文档

#### 1.2 后端核心服务

**任务清单**：
- [ ] 实现 `SkillDefinition` 实体类
- [ ] 实现 `SkillDefinitionRepository`
- [ ] 实现 `SkillRegistry` 服务（技能注册表）
- [ ] 实现 `SkillExecutor` 服务（技能执行器）
- [ ] 实现基础执行器（SCRIPT/API/GRAPH/DATABASE）
- [ ] 实现技能参数验证
- [ ] 实现技能权限检查

**交付物**：
- SkillRegistry.java
- SkillExecutor.java
- ScriptSkillExecutor.java
- ApiSkillExecutor.java
- GraphSkillExecutor.java
- DatabaseSkillExecutor.java

#### 1.3 技能转换服务

**任务清单**：
- [ ] 实现 `SkillConverter` 服务
- [ ] 实现技能定义转 Function Definition
- [ ] 实现 Function Call 转技能执行参数
- [ ] 实现技能结果格式化

**交付物**：
- SkillConverter.java
- FunctionDefinition.java

---

### 阶段二：AI 集成（2-3周）

**目标**：将技能系统集成到 AI 对话中

#### 2.1 Function Calling 支持

**任务清单**：
- [ ] 扩展 `AIService` 接口，添加 function calling 方法
- [ ] 实现 `generateTextStreamWithFunctions` 方法
- [ ] 扩展 OpenAI 适配器支持 function calling
- [ ] 扩展 Claude 适配器支持 function calling
- [ ] 扩展 Gemini 适配器支持 function calling
- [ ] 实现 function calling 响应解析

**交付物**：
- AIService.java（扩展）
- OpenAIAdapter.java（扩展）
- ClaudeAdapter.java（扩展）
- GeminiAdapter.java（扩展）

#### 2.2 对话系统集成

**任务清单**：
- [ ] 修改 `generateAIResponse` 函数支持 function calling
- [ ] 实现 function call 拦截器
- [ ] 实现技能调用处理逻辑
- [ ] 实现技能结果注入 AI 上下文
- [ ] 实现错误处理和重试机制

**交付物**：
- generateAIResponse.ts（修改）
- SkillFunctionCallHandler.ts

#### 2.3 前端技能服务

**任务清单**：
- [ ] 实现 `SkillService`（前端）
- [ ] 实现获取角色技能列表 API
- [ ] 实现技能执行 API
- [ ] 实现自动触发技能检测 API
- [ ] 实现技能缓存机制

**交付物**：
- SkillService.ts
- skillApi.ts

---

### 阶段三：角色技能装备（1-2周）

**目标**：实现角色装备技能的功能

#### 3.1 后端 API

**任务清单**：
- [ ] 实现获取角色已装备技能 API
- [ ] 实现装备技能 API
- [ ] 实现卸载技能 API
- [ ] 实现技能装备验证（前置条件、冲突检查）
- [ ] 实现技能装备优先级管理

**交付物**：
- CharacterSkillController.java
- CharacterSkillService.java

#### 3.2 前端界面

**任务清单**：
- [ ] 实现角色技能管理页面
- [ ] 实现技能装备界面
- [ ] 实现技能列表展示
- [ ] 实现技能搜索和筛选
- [ ] 实现技能详情查看

**交付物**：
- CharacterSkillManagement.tsx
- SkillEquipDialog.tsx
- SkillList.tsx

#### 3.3 技能推荐

**任务清单**：
- [ ] 实现基于角色类型的技能推荐
- [ ] 实现基于场景的技能推荐
- [ ] 实现技能兼容性检查

**交付物**：
- SkillRecommendationService.java

---

### 阶段四：技能库建设（持续）

**目标**：迁移和创建技能库

#### 4.1 迁移现有技能

**任务清单**：
- [ ] 迁移 psychiatry-tools 技能集
  - [ ] crisis-intervention（危机干预）
  - [ ] patient-record（患者病历）
  - [ ] assessment-scale（评估量表）
  - [ ] emotion-analysis（情绪分析）
  - [ ] treatment-plan（治疗计划）
  - [ ] session-record（会话记录）
- [ ] 验证迁移后的技能功能
- [ ] 编写技能使用文档

**交付物**：
- 迁移后的技能定义（数据库记录）
- 技能使用文档

#### 4.2 创建新技能

**任务清单**：
- [ ] 学习类技能
  - [ ] study-plan-creator（学习计划生成）
  - [ ] knowledge-quiz（知识问答）
  - [ ] progress-tracker（进度跟踪）
- [ ] 创作类技能
  - [ ] story-generator（故事生成）
  - [ ] poem-creator（诗歌创作）
  - [ ] content-analyzer（内容分析）
- [ ] 生活类技能
  - [ ] weather-query（天气查询）
  - [ ] schedule-manager（日程管理）
  - [ ] reminder-system（提醒系统）

**交付物**：
- 新技能定义
- 技能实现代码
- 技能测试用例

---

### 阶段五：Graph 流程集成（1-2周）

**目标**：在 Graph 流程中使用技能

#### 5.1 SkillNode 实现

**任务清单**：
- [ ] 实现 `SkillNode` 节点类型
- [ ] 实现技能执行逻辑
- [ ] 实现技能结果处理
- [ ] 实现错误处理
- [ ] 集成到 Graph 流程编辑器

**交付物**：
- SkillNode.java
- Graph 编辑器支持

#### 5.2 技能触发机制

**任务清单**：
- [ ] 实现自动触发逻辑
- [ ] 实现条件触发机制
- [ ] 实现技能检查节点增强

**交付物**：
- AutoTriggerService.java
- ConditionTriggerService.java

---

### 阶段六：管理和监控（1周）

**目标**：技能管理和监控功能

#### 6.1 管理界面

**任务清单**：
- [ ] 实现技能管理界面（Admin）
- [ ] 实现技能创建/编辑表单
- [ ] 实现技能测试功能
- [ ] 实现技能使用统计

**交付物**：
- AdminSkillManagement.tsx
- SkillEditor.tsx
- SkillTestDialog.tsx

#### 6.2 监控和日志

**任务清单**：
- [ ] 实现技能执行日志记录
- [ ] 实现技能使用统计
- [ ] 实现性能监控
- [ ] 实现错误告警

**交付物**：
- SkillExecutionLogger.java
- SkillStatisticsService.java
- SkillMonitorService.java

---

## 三、详细任务分解

### 3.1 阶段一详细任务

#### 数据库迁移脚本

```sql
-- 文件：backend/src/main/resources/db/migration/V20250104__create_skill_system.sql

-- 1. 扩展 skill_definitions 表
ALTER TABLE skill_definitions 
ADD COLUMN function_schema TEXT COMMENT 'Function Calling JSON Schema',
ADD COLUMN execution_type VARCHAR(50) DEFAULT 'RULE_BASED' COMMENT '执行类型',
ADD COLUMN execution_config TEXT COMMENT '执行配置（JSON格式）',
ADD COLUMN auto_trigger_keywords TEXT COMMENT '自动触发关键词',
ADD COLUMN required_permissions VARCHAR(255) COMMENT '所需权限',
ADD COLUMN max_usage_per_day INT DEFAULT -1 COMMENT '每日最大使用次数';

-- 2. 创建技能执行记录表
CREATE TABLE skill_executions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    skill_id VARCHAR(100) NOT NULL,
    character_id BIGINT,
    user_id BIGINT,
    execution_type VARCHAR(50) DEFAULT 'FUNCTION_CALL',
    parameters TEXT,
    result TEXT,
    execution_time_ms INT,
    success BOOLEAN DEFAULT TRUE,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_skill_id (skill_id),
    INDEX idx_character_id (character_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. 创建角色技能关联表（如果不存在）
CREATE TABLE IF NOT EXISTS character_skill_bindings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    character_id BIGINT NOT NULL,
    skill_id VARCHAR(100) NOT NULL,
    is_enabled BOOLEAN DEFAULT TRUE,
    auto_trigger BOOLEAN DEFAULT FALSE,
    priority INT DEFAULT 0,
    usage_count INT DEFAULT 0,
    last_used_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_character_skill (character_id, skill_id),
    INDEX idx_character_id (character_id),
    INDEX idx_skill_id (skill_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

#### SkillRegistry 实现要点

```java
@Service
public class SkillRegistry {
    // 1. 技能缓存
    private final Map<String, SkillDefinition> skillCache = new ConcurrentHashMap<>();
    
    // 2. 角色技能缓存
    private final Map<Long, Set<String>> characterSkillCache = new ConcurrentHashMap<>();
    
    // 3. 初始化加载所有技能
    @PostConstruct
    public void init() {
        loadAllSkills();
    }
    
    // 4. 获取角色可用技能
    public List<SkillDefinition> getCharacterSkills(Long characterId) {
        // 实现逻辑
    }
    
    // 5. 转换为 Function Definitions
    public List<FunctionDefinition> toFunctionDefinitions(List<SkillDefinition> skills) {
        // 实现逻辑
    }
}
```

#### SkillExecutor 实现要点

```java
@Service
public class SkillExecutor {
    // 1. 执行技能
    public SkillExecutionResult execute(
        String skillId,
        Map<String, Object> parameters,
        SkillExecutionContext context
    ) {
        // 实现逻辑
    }
    
    // 2. 验证参数
    private void validateParameters(SkillDefinition skill, Map<String, Object> parameters) {
        // 实现逻辑
    }
    
    // 3. 检查权限
    private void checkPermissions(SkillDefinition skill, SkillExecutionContext context) {
        // 实现逻辑
    }
}
```

---

### 3.2 阶段二详细任务

#### Function Calling 接口扩展

```java
public interface AIService {
    // 新增方法
    void generateTextStreamWithFunctions(
        Long userId,
        TextGenerationRequest request,
        List<FunctionDefinition> functions,
        StreamResponseHandler<TextGenerationResponse> handler
    );
}
```

#### 前端集成要点

```typescript
// generateAIResponse.ts
export const generateAIResponse = async ({
  // ... 现有参数
}: GenerateAIResponseOptions): Promise<void> => {
  // 1. 获取角色技能
  const skills = await skillService.getCharacterSkills(character.id);
  const functionDefinitions = skillService.toFunctionDefinitions(skills);
  
  // 2. 调用 AI（支持 function calling）
  await aiService.generateTextStreamWithFunctions({
    functions: functionDefinitions,
    // ...
  }, async (response, done) => {
    // 3. 处理 function call
    if (response.functionCall) {
      const result = await skillService.executeSkill(
        response.functionCall.name,
        JSON.parse(response.functionCall.arguments || '{}'),
        character.id
      );
      // 4. 注入结果，继续生成
    }
  });
};
```

---

### 3.3 阶段三详细任务

#### 角色技能装备 API

```java
@RestController
@RequestMapping("/api/characters/{characterId}/skills")
public class CharacterSkillController {
    
    /**
     * 获取角色已装备的技能
     */
    @GetMapping
    public ResponseEntity<List<CharacterSkillDTO>> getEquippedSkills(
        @PathVariable Long characterId
    ) {
        // 实现逻辑
    }
    
    /**
     * 装备技能
     */
    @PostMapping("/{skillId}/equip")
    public ResponseEntity<Void> equipSkill(
        @PathVariable Long characterId,
        @PathVariable String skillId,
        @RequestBody EquipSkillRequest request
    ) {
        // 1. 检查前置条件
        // 2. 检查冲突
        // 3. 装备技能
        // 4. 更新缓存
    }
    
    /**
     * 卸载技能
     */
    @DeleteMapping("/{skillId}/unequip")
    public ResponseEntity<Void> unequipSkill(
        @PathVariable Long characterId,
        @PathVariable String skillId
    ) {
        // 实现逻辑
    }
}
```

#### 前端装备界面

```typescript
// CharacterSkillManagement.tsx
export const CharacterSkillManagement: React.FC = ({ characterId }) => {
  const [equippedSkills, setEquippedSkills] = useState<Skill[]>([]);
  const [availableSkills, setAvailableSkills] = useState<Skill[]>([]);
  
  // 装备技能
  const handleEquip = async (skillId: string) => {
    await api.post(`/api/characters/${characterId}/skills/${skillId}/equip`);
    // 刷新列表
  };
  
  // 卸载技能
  const handleUnequip = async (skillId: string) => {
    await api.delete(`/api/characters/${characterId}/skills/${skillId}/unequip`);
    // 刷新列表
  };
  
  return (
    <div>
      <h2>已装备技能</h2>
      <SkillList skills={equippedSkills} onUnequip={handleUnequip} />
      
      <h2>可用技能</h2>
      <SkillList skills={availableSkills} onEquip={handleEquip} />
    </div>
  );
};
```

---

## 四、技术栈

### 4.1 后端

- **语言**：Java 17+
- **框架**：Spring Boot 3.x
- **数据库**：MySQL 8.0+
- **ORM**：JPA / Hibernate
- **JSON 处理**：Jackson
- **脚本执行**：GraalVM JavaScript / Nashorn

### 4.2 前端

- **语言**：TypeScript
- **框架**：React 18+
- **状态管理**：React Hooks
- **HTTP 客户端**：Fetch API
- **UI 组件**：Tailwind CSS

### 4.3 AI 集成

- **Function Calling**：OpenAI / Claude / Gemini
- **流式响应**：Server-Sent Events (SSE)

---

## 五、测试计划

### 5.1 单元测试

- [ ] SkillRegistry 测试
- [ ] SkillExecutor 测试
- [ ] SkillConverter 测试
- [ ] 各执行器测试

### 5.2 集成测试

- [ ] Function Calling 集成测试
- [ ] 技能执行流程测试
- [ ] 角色技能装备测试

### 5.3 端到端测试

- [ ] 完整对话流程测试
- [ ] 技能自动触发测试
- [ ] 多技能组合测试

---

## 六、里程碑

### 里程碑 1：基础框架完成（3周后）

- ✅ 数据库表结构完成
- ✅ 核心服务实现完成
- ✅ 基础测试通过

### 里程碑 2：AI 集成完成（6周后）

- ✅ Function Calling 支持完成
- ✅ 对话系统集成完成
- ✅ 基础技能可以调用

### 里程碑 3：角色装备完成（8周后）

- ✅ 角色技能装备功能完成
- ✅ 技能管理界面完成
- ✅ 用户可以装备技能

### 里程碑 4：技能库完成（12周后）

- ✅ 现有技能迁移完成
- ✅ 新技能创建完成
- ✅ 技能文档完成

---

## 七、风险与应对

### 7.1 技术风险

**风险**：AI 模型 Function Calling 支持不一致

**应对**：
- 实现适配层，统一接口
- 支持多种模型
- 提供降级方案

### 7.2 性能风险

**风险**：技能执行可能影响响应速度

**应对**：
- 异步执行耗时技能
- 实现缓存机制
- 优化技能加载

### 7.3 安全风险

**风险**：技能执行可能涉及敏感操作

**应对**：
- 严格的权限控制
- 参数验证
- 执行日志记录

---

## 八、后续优化

### 8.1 性能优化

- [ ] 技能定义缓存优化
- [ ] 技能执行结果缓存
- [ ] 批量技能调用优化

### 8.2 功能扩展

- [ ] 技能组合（Combo Skills）
- [ ] 技能升级系统
- [ ] 技能市场
- [ ] 用户自定义技能

### 8.3 智能化

- [ ] AI 自动学习技能使用
- [ ] 智能技能推荐
- [ ] 技能使用分析

---

## 九、总结

### 9.1 开发周期

- **总时长**：约 12 周（3 个月）
- **核心功能**：8 周
- **技能库建设**：持续进行

### 9.2 关键交付物

1. **基础框架**：SkillRegistry、SkillExecutor
2. **AI 集成**：Function Calling 支持
3. **角色装备**：技能装备功能
4. **技能库**：至少 10 个可用技能

### 9.3 成功标准

- ✅ 角色可以装备技能
- ✅ AI 可以自动调用技能
- ✅ 技能执行稳定可靠
- ✅ 用户体验流畅

---

**最后更新**：2025-01-03
