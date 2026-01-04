# Claude Skill 集成技术实现指南

## 一、数据库设计

### 1.1 扩展技能定义表

```sql
-- 扩展 skill_definitions 表
ALTER TABLE skill_definitions 
ADD COLUMN function_schema TEXT COMMENT 'Function Calling JSON Schema（JSON格式）',
ADD COLUMN execution_type VARCHAR(50) DEFAULT 'RULE_BASED' COMMENT '执行类型：SCRIPT/API/GRAPH/DATABASE/RULE_BASED',
ADD COLUMN execution_config TEXT COMMENT '执行配置（JSON格式）',
ADD COLUMN auto_trigger_keywords TEXT COMMENT '自动触发关键词（JSON数组）',
ADD COLUMN required_permissions VARCHAR(255) COMMENT '所需权限（逗号分隔）',
ADD COLUMN max_usage_per_day INT DEFAULT -1 COMMENT '每日最大使用次数（-1表示无限制）';

-- 创建技能执行记录表
CREATE TABLE skill_executions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    skill_id VARCHAR(100) NOT NULL COMMENT '技能ID',
    character_id BIGINT COMMENT '角色ID',
    user_id BIGINT COMMENT '用户ID',
    execution_type VARCHAR(50) DEFAULT 'FUNCTION_CALL' COMMENT '执行类型：FUNCTION_CALL/GRAPH_NODE/MANUAL',
    parameters TEXT COMMENT '执行参数（JSON格式）',
    result TEXT COMMENT '执行结果（JSON格式）',
    execution_time_ms INT COMMENT '执行耗时（毫秒）',
    success BOOLEAN DEFAULT TRUE COMMENT '是否成功',
    error_message TEXT COMMENT '错误信息',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_skill_id (skill_id),
    INDEX idx_character_id (character_id),
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at),
    FOREIGN KEY (skill_id) REFERENCES skill_definitions(skill_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='技能执行记录表';

-- 创建角色技能关联表（如果不存在）
CREATE TABLE IF NOT EXISTS character_skill_bindings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    character_id BIGINT NOT NULL COMMENT '角色ID',
    skill_id VARCHAR(100) NOT NULL COMMENT '技能ID',
    is_enabled BOOLEAN DEFAULT TRUE COMMENT '是否启用',
    auto_trigger BOOLEAN DEFAULT FALSE COMMENT '是否自动触发',
    priority INT DEFAULT 0 COMMENT '优先级（数字越大优先级越高）',
    usage_count INT DEFAULT 0 COMMENT '使用次数',
    last_used_at TIMESTAMP COMMENT '最后使用时间',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_character_skill (character_id, skill_id),
    INDEX idx_character_id (character_id),
    INDEX idx_skill_id (skill_id),
    FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE CASCADE,
    FOREIGN KEY (skill_id) REFERENCES skill_definitions(skill_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='角色技能关联表';
```

### 1.2 示例数据

```sql
-- 插入危机干预技能定义
INSERT INTO skill_definitions (
    skill_id, name, description, category, skill_type, max_level,
    function_schema, execution_type, execution_config, auto_trigger_keywords
) VALUES (
    'crisis_intervention',
    '危机干预',
    '危机干预工具 - 评估风险、制定干预方案、提供应急指导',
    'healthcare',
    'ACTIVE',
    100,
    '{
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
                "items": {"type": "string"},
                "description": "危机症状"
            },
            "situation": {
                "type": "string",
                "description": "危机情况描述"
            }
        },
        "required": ["action"]
    }',
    'SCRIPT',
    '{
        "scriptPath": ".claude/skills/psychiatry-tools/crisis-intervention.js",
        "scriptType": "nodejs"
    }',
    '["绝望", "自杀", "想死", "不想活", "结束生命"]'
);

-- 为心理医生角色绑定技能
INSERT INTO character_skill_bindings (
    character_id, skill_id, is_enabled, auto_trigger, priority
) VALUES (
    1,  -- 假设心理医生角色的ID是1
    'crisis_intervention',
    TRUE,
    TRUE,  -- 自动触发
    10     -- 高优先级
);
```

---

## 二、后端实现

### 2.1 Skill Registry 实现

```java
// backend/src/main/java/com/heartsphere/aiagent/skill/SkillRegistry.java

package com.heartsphere.aiagent.skill;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.heartsphere.aiagent.entity.SkillDefinition;
import com.heartsphere.aiagent.repository.SkillDefinitionRepository;
import com.heartsphere.aiagent.repository.CharacterSkillBindingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.annotation.PostConstruct;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class SkillRegistry {
    
    private final SkillDefinitionRepository skillDefinitionRepository;
    private final CharacterSkillBindingRepository characterSkillBindingRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    // 技能缓存：skillId -> SkillDefinition
    private final Map<String, SkillDefinition> skillCache = new ConcurrentHashMap<>();
    
    // 角色技能缓存：characterId -> Set<skillId>
    private final Map<Long, Set<String>> characterSkillCache = new ConcurrentHashMap<>();
    
    @PostConstruct
    public void init() {
        log.info("初始化技能注册表...");
        loadAllSkills();
    }
    
    /**
     * 加载所有技能
     */
    @Transactional(readOnly = true)
    public void loadAllSkills() {
        List<SkillDefinition> skills = skillDefinitionRepository.findAll();
        skills.forEach(skill -> {
            skillCache.put(skill.getSkillId(), skill);
            log.debug("加载技能: {}", skill.getSkillId());
        });
        log.info("技能注册表初始化完成，共加载 {} 个技能", skills.size());
    }
    
    /**
     * 获取技能定义
     */
    public SkillDefinition getSkill(String skillId) {
        SkillDefinition skill = skillCache.get(skillId);
        if (skill == null) {
            log.warn("技能不存在: {}", skillId);
        }
        return skill;
    }
    
    /**
     * 获取角色可用的技能列表
     */
    @Transactional(readOnly = true)
    public List<SkillDefinition> getCharacterSkills(Long characterId) {
        // 先从缓存获取
        Set<String> cachedSkillIds = characterSkillCache.get(characterId);
        if (cachedSkillIds != null) {
            return cachedSkillIds.stream()
                .map(skillCache::get)
                .filter(Objects::nonNull)
                .filter(skill -> skill.getSkillType().equals("ACTIVE") || skill.getSkillType().equals("AUTOMATIC"))
                .collect(Collectors.toList());
        }
        
        // 从数据库加载
        List<String> skillIds = characterSkillBindingRepository
            .findByCharacterIdAndIsEnabledTrue(characterId)
            .stream()
            .map(binding -> binding.getSkillId())
            .collect(Collectors.toList());
        
        // 更新缓存
        characterSkillCache.put(characterId, new HashSet<>(skillIds));
        
        return skillIds.stream()
            .map(skillCache::get)
            .filter(Objects::nonNull)
            .filter(skill -> skill.getSkillType().equals("ACTIVE") || skill.getSkillType().equals("AUTOMATIC"))
            .sorted(Comparator.comparing(skill -> {
                // 按优先级排序
                return characterSkillBindingRepository
                    .findByCharacterIdAndSkillId(characterId, skill.getSkillId())
                    .map(binding -> binding.getPriority())
                    .orElse(0);
            }).reversed())
            .collect(Collectors.toList());
    }
    
    /**
     * 将技能转换为 Function Definition（OpenAI/Claude 格式）
     */
    public List<FunctionDefinition> toFunctionDefinitions(List<SkillDefinition> skills) {
        return skills.stream()
            .map(this::toFunctionDefinition)
            .filter(Objects::nonNull)
            .collect(Collectors.toList());
    }
    
    private FunctionDefinition toFunctionDefinition(SkillDefinition skill) {
        try {
            // 从 function_schema 字段解析
            if (skill.getFunctionSchema() == null || skill.getFunctionSchema().isEmpty()) {
                log.warn("技能 {} 没有 function_schema，跳过", skill.getSkillId());
                return null;
            }
            
            Map<String, Object> schema = objectMapper.readValue(
                skill.getFunctionSchema(), 
                Map.class
            );
            
            return FunctionDefinition.builder()
                .name(skill.getSkillId())
                .description(skill.getDescription())
                .parameters(schema)
                .build();
                
        } catch (Exception e) {
            log.error("转换技能 {} 为 Function Definition 失败", skill.getSkillId(), e);
            return null;
        }
    }
    
    /**
     * 检查关键词是否匹配自动触发条件
     */
    public List<SkillDefinition> findAutoTriggerSkills(Long characterId, String userInput) {
        List<SkillDefinition> characterSkills = getCharacterSkills(characterId);
        String lowerInput = userInput.toLowerCase();
        
        return characterSkills.stream()
            .filter(skill -> {
                if (skill.getAutoTriggerKeywords() == null || skill.getAutoTriggerKeywords().isEmpty()) {
                    return false;
                }
                try {
                    List<String> keywords = objectMapper.readValue(
                        skill.getAutoTriggerKeywords(),
                        List.class
                    );
                    return keywords.stream()
                        .anyMatch(keyword -> lowerInput.contains(keyword.toLowerCase()));
                } catch (Exception e) {
                    log.error("解析自动触发关键词失败: {}", skill.getSkillId(), e);
                    return false;
                }
            })
            .collect(Collectors.toList());
    }
    
    /**
     * 清除角色技能缓存
     */
    public void clearCharacterSkillCache(Long characterId) {
        characterSkillCache.remove(characterId);
    }
}
```

### 2.2 Skill Executor 实现

```java
// backend/src/main/java/com/heartsphere/aiagent/skill/SkillExecutor.java

package com.heartsphere.aiagent.skill;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.heartsphere.aiagent.entity.SkillDefinition;
import com.heartsphere.aiagent.entity.SkillExecution;
import com.heartsphere.aiagent.entity.SkillInstruction;
import com.heartsphere.aiagent.entity.SkillResource;
import com.heartsphere.aiagent.repository.SkillExecutionRepository;
import com.heartsphere.aiagent.repository.SkillInstructionRepository;
import com.heartsphere.aiagent.repository.SkillResourceRepository;
import com.heartsphere.aiagent.skill.executor.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class SkillExecutor {
    
    private final SkillRegistry skillRegistry;
    private final SkillInstructionRepository skillInstructionRepository;
    private final SkillResourceRepository skillResourceRepository;
    private final SkillExecutionRepository skillExecutionRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    // 执行器映射
    private final Map<String, SkillExecutionHandler> executionHandlers = new HashMap<>();
    
    public SkillExecutor(
        SkillRegistry skillRegistry,
        SkillInstructionRepository skillInstructionRepository,
        SkillResourceRepository skillResourceRepository,
        SkillExecutionRepository skillExecutionRepository,
        ScriptSkillExecutor scriptExecutor,
        ApiSkillExecutor apiExecutor,
        GraphSkillExecutor graphExecutor,
        DatabaseSkillExecutor databaseExecutor
    ) {
        this.skillRegistry = skillRegistry;
        this.skillInstructionRepository = skillInstructionRepository;
        this.skillResourceRepository = skillResourceRepository;
        this.skillExecutionRepository = skillExecutionRepository;
        
        // 注册执行器
        executionHandlers.put("SCRIPT", scriptExecutor);
        executionHandlers.put("API", apiExecutor);
        executionHandlers.put("GRAPH", graphExecutor);
        executionHandlers.put("DATABASE", databaseExecutor);
    }
    
    /**
     * 执行技能
     */
    @Transactional
    public SkillExecutionResult execute(
        String skillId,
        Map<String, Object> parameters,
        SkillExecutionContext context
    ) {
        long startTime = System.currentTimeMillis();
        SkillExecutionResult result;
        
        try {
            // 1. 加载技能定义
            SkillDefinition skill = skillRegistry.getSkill(skillId);
            if (skill == null) {
                throw new SkillNotFoundException("技能不存在: " + skillId);
            }
            
            // 2. 验证参数
            validateParameters(skill, parameters);
            
            // 3. 检查权限和使用限制
            checkPermissionsAndLimits(skill, context);
            
            // 4. 加载 Level 2：指令
            List<SkillInstruction> instructions = skillInstructionRepository
                .findBySkillIdAndInstructionLevel(skillId, 2);
            
            // 5. 加载 Level 3：资源
            List<SkillResource> resources = skillResourceRepository
                .findBySkillId(skillId);
            
            // 6. 执行技能逻辑
            Object executionResult = executeSkillLogic(
                skill, 
                instructions, 
                resources, 
                parameters, 
                context
            );
            
            result = SkillExecutionResult.builder()
                .skillId(skillId)
                .success(true)
                .result(executionResult)
                .executionTimeMs((int)(System.currentTimeMillis() - startTime))
                .build();
            
        } catch (Exception e) {
            log.error("执行技能失败: skillId={}, error={}", skillId, e.getMessage(), e);
            result = SkillExecutionResult.builder()
                .skillId(skillId)
                .success(false)
                .errorMessage(e.getMessage())
                .executionTimeMs((int)(System.currentTimeMillis() - startTime))
                .build();
        }
        
        // 7. 记录执行历史
        recordExecution(skillId, parameters, result, context);
        
        return result;
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
        String executionType = skill.getExecutionType() != null 
            ? skill.getExecutionType() 
            : "RULE_BASED";
        
        SkillExecutionHandler handler = executionHandlers.get(executionType);
        if (handler != null) {
            return handler.execute(skill, instructions, resources, parameters, context);
        }
        
        // 默认：基于规则的执行
        return executeRuleBased(skill, instructions, parameters, context);
    }
    
    /**
     * 基于规则的执行（默认）
     */
    private Object executeRuleBased(
        SkillDefinition skill,
        List<SkillInstruction> instructions,
        Map<String, Object> parameters,
        SkillExecutionContext context
    ) {
        // 简单的规则执行逻辑
        // 可以根据 instructions 中的规则进行匹配和执行
        Map<String, Object> result = new HashMap<>();
        result.put("skillId", skill.getSkillId());
        result.put("message", "技能执行成功");
        result.put("parameters", parameters);
        return result;
    }
    
    /**
     * 验证参数
     */
    private void validateParameters(SkillDefinition skill, Map<String, Object> parameters) {
        try {
            if (skill.getFunctionSchema() == null) {
                return;
            }
            
            Map<String, Object> schema = objectMapper.readValue(
                skill.getFunctionSchema(),
                Map.class
            );
            
            // 验证必填参数
            @SuppressWarnings("unchecked")
            List<String> required = (List<String>) ((Map<String, Object>) schema.get("properties"))
                .getOrDefault("required", Collections.emptyList());
            
            for (String param : required) {
                if (!parameters.containsKey(param)) {
                    throw new IllegalArgumentException("缺少必填参数: " + param);
                }
            }
            
        } catch (Exception e) {
            log.error("参数验证失败", e);
            throw new IllegalArgumentException("参数验证失败: " + e.getMessage());
        }
    }
    
    /**
     * 检查权限和使用限制
     */
    private void checkPermissionsAndLimits(SkillDefinition skill, SkillExecutionContext context) {
        // 检查每日使用次数限制
        if (skill.getMaxUsagePerDay() > 0) {
            int todayUsage = skillExecutionRepository.countTodayUsage(
                skill.getSkillId(),
                context.getCharacterId()
            );
            if (todayUsage >= skill.getMaxUsagePerDay()) {
                throw new SkillUsageLimitExceededException(
                    "技能 " + skill.getSkillId() + " 今日使用次数已达上限"
                );
            }
        }
        
        // 检查权限（如果需要）
        // TODO: 实现权限检查逻辑
    }
    
    /**
     * 记录执行历史
     */
    private void recordExecution(
        String skillId,
        Map<String, Object> parameters,
        SkillExecutionResult result,
        SkillExecutionContext context
    ) {
        try {
            SkillExecution execution = SkillExecution.builder()
                .skillId(skillId)
                .characterId(context.getCharacterId())
                .userId(context.getUserId())
                .executionType("FUNCTION_CALL")
                .parameters(objectMapper.writeValueAsString(parameters))
                .result(objectMapper.writeValueAsString(result.getResult()))
                .executionTimeMs(result.getExecutionTimeMs())
                .success(result.isSuccess())
                .errorMessage(result.getErrorMessage())
                .build();
            
            skillExecutionRepository.save(execution);
            
        } catch (Exception e) {
            log.error("记录技能执行历史失败", e);
        }
    }
}
```

### 2.3 Script Skill Executor 实现

```java
// backend/src/main/java/com/heartsphere/aiagent/skill/executor/ScriptSkillExecutor.java

package com.heartsphere.aiagent.skill.executor;

import com.heartsphere.aiagent.entity.SkillDefinition;
import com.heartsphere.aiagent.entity.SkillInstruction;
import com.heartsphere.aiagent.entity.SkillResource;
import com.heartsphere.aiagent.skill.SkillExecutionContext;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import javax.script.ScriptEngine;
import javax.script.ScriptEngineManager;
import javax.script.ScriptException;
import java.io.FileReader;
import java.io.IOException;
import java.util.List;
import java.util.Map;

@Slf4j
@Component
public class ScriptSkillExecutor implements SkillExecutionHandler {
    
    private final ScriptEngineManager scriptEngineManager = new ScriptEngineManager();
    
    @Override
    public Object execute(
        SkillDefinition skill,
        List<SkillInstruction> instructions,
        List<SkillResource> resources,
        Map<String, Object> parameters,
        SkillExecutionContext context
    ) {
        try {
            // 从 execution_config 中获取脚本路径
            String scriptPath = extractScriptPath(skill.getExecutionConfig());
            if (scriptPath == null) {
                throw new IllegalArgumentException("脚本路径未配置");
            }
            
            // 根据脚本类型选择引擎
            ScriptEngine engine = getScriptEngine(scriptPath);
            
            // 设置上下文变量
            engine.put("args", parameters);
            engine.put("context", context);
            engine.put("skill", skill);
            
            // 执行脚本
            Object result = engine.eval(new FileReader(scriptPath));
            
            return result;
            
        } catch (ScriptException | IOException e) {
            log.error("执行脚本技能失败: {}", skill.getSkillId(), e);
            throw new RuntimeException("脚本执行失败: " + e.getMessage(), e);
        }
    }
    
    private String extractScriptPath(String executionConfig) {
        // 从 JSON 配置中提取 scriptPath
        // 简化实现，实际应该解析 JSON
        if (executionConfig != null && executionConfig.contains("scriptPath")) {
            // 简单的字符串提取
            int start = executionConfig.indexOf("\"scriptPath\"");
            if (start > 0) {
                int valueStart = executionConfig.indexOf("\"", start + 13) + 1;
                int valueEnd = executionConfig.indexOf("\"", valueStart);
                return executionConfig.substring(valueStart, valueEnd);
            }
        }
        return null;
    }
    
    private ScriptEngine getScriptEngine(String scriptPath) {
        if (scriptPath.endsWith(".js")) {
            return scriptEngineManager.getEngineByName("javascript");
        } else if (scriptPath.endsWith(".py")) {
            return scriptEngineManager.getEngineByName("python");
        } else {
            throw new IllegalArgumentException("不支持的脚本类型: " + scriptPath);
        }
    }
}
```

---

## 三、前端实现

### 3.1 Skill Service（前端）

```typescript
// frontend/services/skill/SkillService.ts

import { apiClient } from '../api';

export interface SkillDefinition {
  skillId: string;
  name: string;
  description: string;
  category: string;
  skillType: string;
  functionSchema: any;
  executionType: string;
  autoTriggerKeywords?: string[];
}

export interface FunctionDefinition {
  name: string;
  description: string;
  parameters: any;
}

export interface SkillExecutionResult {
  skillId: string;
  success: boolean;
  result?: any;
  errorMessage?: string;
  executionTimeMs?: number;
}

export class SkillService {
  private static instance: SkillService;
  
  public static getInstance(): SkillService {
    if (!SkillService.instance) {
      SkillService.instance = new SkillService();
    }
    return SkillService.instance;
  }
  
  /**
   * 获取角色可用的技能列表
   */
  async getCharacterSkills(characterId: number): Promise<SkillDefinition[]> {
    const response = await apiClient.get(`/api/skills/character/${characterId}`);
    return response.data;
  }
  
  /**
   * 将技能转换为 Function Definitions
   */
  toFunctionDefinitions(skills: SkillDefinition[]): FunctionDefinition[] {
    return skills
      .filter(skill => skill.functionSchema)
      .map(skill => ({
        name: skill.skillId,
        description: skill.description,
        parameters: skill.functionSchema
      }));
  }
  
  /**
   * 执行技能
   */
  async executeSkill(
    skillId: string,
    parameters: Record<string, any>,
    characterId: number
  ): Promise<SkillExecutionResult> {
    const response = await apiClient.post(`/api/skills/${skillId}/execute`, {
      parameters,
      characterId
    });
    return response.data;
  }
  
  /**
   * 检查是否有自动触发的技能
   */
  async findAutoTriggerSkills(
    characterId: number,
    userInput: string
  ): Promise<SkillDefinition[]> {
    const response = await apiClient.post(`/api/skills/auto-trigger`, {
      characterId,
      userInput
    });
    return response.data;
  }
}
```

### 3.2 修改 generateAIResponse 支持 Function Calling

```typescript
// frontend/components/chat/utils/generateAIResponse.ts

import { SkillService } from '../../../services/skill/SkillService';

// ... 现有导入 ...

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
  
  const skillService = SkillService.getInstance();
  
  // 获取角色可用的技能
  const characterSkills = await skillService.getCharacterSkills(character.id);
  const functionDefinitions = skillService.toFunctionDefinitions(characterSkills);
  
  // 检查是否有自动触发的技能
  const autoTriggerSkills = await skillService.findAutoTriggerSkills(
    character.id,
    userText
  );
  
  // 如果有自动触发的技能，在系统指令中提示
  if (autoTriggerSkills.length > 0) {
    const autoTriggerHint = `\n\n[重要提示]检测到可能需要使用以下技能：${autoTriggerSkills.map(s => s.name).join(', ')}。请根据对话内容判断是否需要调用这些技能。`;
    systemInstruction += autoTriggerHint;
  }
  
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
        console.log('[generateAIResponse] 检测到 function call:', response.functionCall);
        
        try {
          // 执行技能
          const skillResult = await skillService.executeSkill(
            response.functionCall.name,
            JSON.parse(response.functionCall.arguments || '{}'),
            character.id
          );
          
          console.log('[generateAIResponse] 技能执行结果:', skillResult);
          
          // 将技能结果注入上下文，继续生成回复
          await aiService.generateTextStreamWithFunctions(
            {
              prompt: userText,
              systemInstruction: systemInstruction,
              messages: [
                ...historyMessages,
                {
                  role: 'assistant' as const,
                  content: null,
                  functionCall: response.functionCall
                },
                {
                  role: 'function' as const,
                  name: response.functionCall.name,
                  content: JSON.stringify(skillResult.result || skillResult)
                }
              ],
              temperature: 0.7,
              maxTokens: 2048,
              functions: functionDefinitions,
            },
            streamHandler  // 使用原有的流式处理
          );
          
        } catch (error) {
          console.error('[generateAIResponse] 技能执行失败:', error);
          // 如果技能执行失败，继续正常对话
          streamHandler(response, done);
        }
      } else {
        // 正常文本响应
        streamHandler(response, done);
      }
    }
  );
};
```

---

## 四、API 接口设计

### 4.1 后端 Controller

```java
// backend/src/main/java/com/heartsphere/aiagent/controller/SkillController.java

package com.heartsphere.aiagent.controller;

import com.heartsphere.aiagent.dto.response.SkillDefinitionDTO;
import com.heartsphere.aiagent.dto.response.SkillExecutionResultDTO;
import com.heartsphere.aiagent.dto.request.SkillExecutionRequest;
import com.heartsphere.aiagent.skill.SkillRegistry;
import com.heartsphere.aiagent.skill.SkillExecutor;
import com.heartsphere.aiagent.skill.SkillExecutionContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping("/api/skills")
@RequiredArgsConstructor
public class SkillController {
    
    private final SkillRegistry skillRegistry;
    private final SkillExecutor skillExecutor;
    
    /**
     * 获取角色可用的技能列表
     */
    @GetMapping("/character/{characterId}")
    public ResponseEntity<List<SkillDefinitionDTO>> getCharacterSkills(
        @PathVariable Long characterId
    ) {
        List<SkillDefinitionDTO> skills = skillRegistry.getCharacterSkills(characterId)
            .stream()
            .map(this::toDTO)
            .collect(Collectors.toList());
        return ResponseEntity.ok(skills);
    }
    
    /**
     * 执行技能
     */
    @PostMapping("/{skillId}/execute")
    public ResponseEntity<SkillExecutionResultDTO> executeSkill(
        @PathVariable String skillId,
        @RequestBody SkillExecutionRequest request,
        @AuthenticationPrincipal Long userId
    ) {
        SkillExecutionContext context = SkillExecutionContext.builder()
            .characterId(request.getCharacterId())
            .userId(userId)
            .build();
        
        SkillExecutionResult result = skillExecutor.execute(
            skillId,
            request.getParameters(),
            context
        );
        
        return ResponseEntity.ok(toDTO(result));
    }
    
    /**
     * 检查自动触发技能
     */
    @PostMapping("/auto-trigger")
    public ResponseEntity<List<SkillDefinitionDTO>> findAutoTriggerSkills(
        @RequestBody Map<String, Object> request
    ) {
        Long characterId = Long.valueOf(request.get("characterId").toString());
        String userInput = request.get("userInput").toString();
        
        List<SkillDefinitionDTO> skills = skillRegistry.findAutoTriggerSkills(characterId, userInput)
            .stream()
            .map(this::toDTO)
            .collect(Collectors.toList());
        
        return ResponseEntity.ok(skills);
    }
    
    // ... DTO 转换方法 ...
}
```

---

## 五、测试示例

### 5.1 单元测试

```java
// backend/src/test/java/com/heartsphere/aiagent/skill/SkillExecutorTest.java

@SpringBootTest
class SkillExecutorTest {
    
    @Autowired
    private SkillExecutor skillExecutor;
    
    @Autowired
    private SkillRegistry skillRegistry;
    
    @Test
    void testExecuteCrisisIntervention() {
        // 准备参数
        Map<String, Object> parameters = new HashMap<>();
        parameters.put("action", "assess");
        parameters.put("symptoms", Arrays.asList("绝望", "想死"));
        parameters.put("situation", "患者表达自杀意念");
        
        SkillExecutionContext context = SkillExecutionContext.builder()
            .characterId(1L)
            .userId(1L)
            .build();
        
        // 执行技能
        SkillExecutionResult result = skillExecutor.execute(
            "crisis_intervention",
            parameters,
            context
        );
        
        // 验证结果
        assertTrue(result.isSuccess());
        assertNotNull(result.getResult());
    }
}
```

---

## 六、部署注意事项

1. **脚本执行环境**：确保服务器安装了 Node.js 或 Python 运行环境
2. **权限控制**：技能执行可能涉及敏感操作，需要严格的权限控制
3. **性能监控**：监控技能执行耗时，对耗时操作进行优化
4. **错误处理**：完善的错误处理和日志记录
5. **缓存策略**：对技能定义和角色技能关联进行缓存，提高性能

---

## 七、后续优化方向

1. **技能市场**：允许用户创建和分享技能
2. **技能组合**：支持多个技能的组合使用
3. **技能学习**：AI 自动学习何时使用技能
4. **技能版本管理**：支持技能的版本控制和回滚
5. **技能分析**：分析技能使用情况，优化技能设计
