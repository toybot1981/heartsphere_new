# Claude Skill 远程调用支持

## 一、Claude Code Skill 的远程调用能力

### 1.1 原生支持

**Claude Code Skill 支持远程调用**，可以通过以下方式实现：

1. **使用 Node.js 的 `fetch` API**（Node.js 18+）
2. **使用 `axios` 等 HTTP 库**
3. **通过 `Bash` 工具执行 `curl` 命令**

### 1.2 示例代码

#### 方式 1：使用 fetch（推荐）

```javascript
// .claude/skills/api-caller.js
module.exports = {
  name: "api-caller",
  description: "调用外部 API",
  args: {
    url: {
      type: "string",
      required: true,
      description: "API 地址"
    },
    method: {
      type: "string",
      enum: ["GET", "POST", "PUT", "DELETE"],
      default: "GET"
    },
    headers: {
      type: "object",
      description: "请求头"
    },
    body: {
      type: "object",
      description: "请求体"
    }
  },
  run: async (args, context) => {
    const { url, method = "GET", headers = {}, body } = args;
    
    try {
      const options = {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers
        }
      };
      
      if (body && ['POST', 'PUT', 'PATCH'].includes(method)) {
        options.body = JSON.stringify(body);
      }
      
      const response = await fetch(url, options);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      return {
        success: true,
        data,
        status: response.status,
        headers: Object.fromEntries(response.headers.entries())
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        stack: error.stack
      };
    }
  }
};
```

#### 方式 2：使用 Bash + curl

```javascript
run: async (args, context) => {
  const { Bash } = context.tools;
  const { url, method = "GET", headers = {}, body } = args;
  
  // 构建 curl 命令
  let curlCmd = `curl -X ${method}`;
  
  // 添加请求头
  Object.entries(headers).forEach(([key, value]) => {
    curlCmd += ` -H "${key}: ${value}"`;
  });
  
  // 添加请求体
  if (body) {
    curlCmd += ` -d '${JSON.stringify(body)}'`;
  }
  
  curlCmd += ` "${url}"`;
  
  const { stdout } = await Bash(curlCmd);
  return JSON.parse(stdout);
}
```

---

## 二、集成方案中的远程调用支持

### 2.1 执行类型：API

在我们的集成方案中，支持 `execution_type: "API"` 的技能类型，专门用于远程调用：

```sql
INSERT INTO skill_definitions (
    skill_id, name, description, category, skill_type,
    function_schema, execution_type, execution_config
) VALUES (
    'weather_api',
    '天气查询',
    '调用天气 API 获取天气信息',
    'utility',
    'ACTIVE',
    '{
        "type": "object",
        "properties": {
            "city": {
                "type": "string",
                "description": "城市名称"
            }
        },
        "required": ["city"]
    }',
    'API',
    '{
        "apiUrl": "https://api.weather.com/v1/current",
        "method": "GET",
        "headers": {
            "Authorization": "Bearer ${API_KEY}"
        },
        "queryParams": {
            "city": "${city}"
        },
        "responseMapping": {
            "temperature": "$.data.temp",
            "condition": "$.data.condition"
        }
    }'
);
```

### 2.2 API Skill Executor 实现

```java
// backend/src/main/java/com/heartsphere/aiagent/skill/executor/ApiSkillExecutor.java

package com.heartsphere.aiagent.skill.executor;

import com.heartsphere.aiagent.entity.SkillDefinition;
import com.heartsphere.aiagent.entity.SkillInstruction;
import com.heartsphere.aiagent.entity.SkillResource;
import com.heartsphere.aiagent.skill.SkillExecutionContext;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Slf4j
@Component
public class ApiSkillExecutor implements SkillExecutionHandler {
    
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    @Override
    public Object execute(
        SkillDefinition skill,
        List<SkillInstruction> instructions,
        List<SkillResource> resources,
        Map<String, Object> parameters,
        SkillExecutionContext context
    ) {
        try {
            // 1. 解析执行配置
            Map<String, Object> config = parseExecutionConfig(skill.getExecutionConfig());
            
            // 2. 构建请求 URL
            String apiUrl = buildApiUrl(config, parameters);
            
            // 3. 构建请求头
            HttpHeaders headers = buildHeaders(config, parameters);
            
            // 4. 构建请求体
            HttpEntity<?> requestEntity = buildRequestEntity(config, parameters, headers);
            
            // 5. 执行 HTTP 请求
            String method = (String) config.getOrDefault("method", "GET");
            ResponseEntity<String> response = executeRequest(apiUrl, method, requestEntity);
            
            // 6. 解析响应
            Object result = parseResponse(response, config);
            
            return result;
            
        } catch (Exception e) {
            log.error("API 技能执行失败: {}", skill.getSkillId(), e);
            throw new RuntimeException("API 调用失败: " + e.getMessage(), e);
        }
    }
    
    /**
     * 构建 API URL
     */
    private String buildApiUrl(Map<String, Object> config, Map<String, Object> parameters) {
        String baseUrl = (String) config.get("apiUrl");
        
        // 处理 URL 参数替换
        if (config.containsKey("queryParams")) {
            @SuppressWarnings("unchecked")
            Map<String, String> queryParams = (Map<String, String>) config.get("queryParams");
            StringBuilder url = new StringBuilder(baseUrl);
            url.append("?");
            
            queryParams.forEach((key, value) -> {
                // 支持参数占位符 ${paramName}
                String paramValue = replacePlaceholders(value, parameters);
                url.append(key).append("=").append(paramValue).append("&");
            });
            
            // 移除最后的 &
            if (url.length() > 0 && url.charAt(url.length() - 1) == '&') {
                url.setLength(url.length() - 1);
            }
            
            return url.toString();
        }
        
        return baseUrl;
    }
    
    /**
     * 构建请求头
     */
    private HttpHeaders buildHeaders(Map<String, Object> config, Map<String, Object> parameters) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        
        if (config.containsKey("headers")) {
            @SuppressWarnings("unchecked")
            Map<String, String> headerConfig = (Map<String, String>) config.get("headers");
            
            headerConfig.forEach((key, value) -> {
                // 支持环境变量和参数占位符
                String headerValue = replacePlaceholders(value, parameters);
                headers.set(key, headerValue);
            });
        }
        
        return headers;
    }
    
    /**
     * 构建请求体
     */
    private HttpEntity<?> buildRequestEntity(
        Map<String, Object> config,
        Map<String, Object> parameters,
        HttpHeaders headers
    ) {
        if (config.containsKey("body")) {
            @SuppressWarnings("unchecked")
            Map<String, Object> bodyTemplate = (Map<String, Object>) config.get("body");
            
            // 替换占位符
            Map<String, Object> body = replacePlaceholdersInMap(bodyTemplate, parameters);
            
            return new HttpEntity<>(body, headers);
        }
        
        return new HttpEntity<>(headers);
    }
    
    /**
     * 执行 HTTP 请求
     */
    private ResponseEntity<String> executeRequest(
        String url,
        String method,
        HttpEntity<?> requestEntity
    ) {
        HttpMethod httpMethod = HttpMethod.valueOf(method);
        
        return restTemplate.exchange(
            url,
            httpMethod,
            requestEntity,
            String.class
        );
    }
    
    /**
     * 解析响应
     */
    private Object parseResponse(ResponseEntity<String> response, Map<String, Object> config) {
        try {
            String body = response.getBody();
            
            // 如果配置了响应映射，进行字段提取
            if (config.containsKey("responseMapping")) {
                @SuppressWarnings("unchecked")
                Map<String, String> mapping = (Map<String, String>) config.get("responseMapping");
                
                Map<String, Object> jsonBody = objectMapper.readValue(body, Map.class);
                Map<String, Object> result = new java.util.HashMap<>();
                
                mapping.forEach((key, path) -> {
                    // 使用 JSONPath 提取字段（简化实现）
                    Object value = extractByPath(jsonBody, path);
                    result.put(key, value);
                });
                
                return result;
            }
            
            // 直接返回 JSON
            return objectMapper.readValue(body, Map.class);
            
        } catch (Exception e) {
            log.error("解析响应失败", e);
            return response.getBody();
        }
    }
    
    /**
     * 替换占位符
     */
    private String replacePlaceholders(String template, Map<String, Object> parameters) {
        String result = template;
        
        // 替换参数占位符 ${paramName}
        for (Map.Entry<String, Object> entry : parameters.entrySet()) {
            result = result.replace("${" + entry.getKey() + "}", String.valueOf(entry.getValue()));
        }
        
        // 替换环境变量 ${ENV_VAR}
        // TODO: 实现环境变量替换
        
        return result;
    }
    
    /**
     * 在 Map 中替换占位符
     */
    private Map<String, Object> replacePlaceholdersInMap(
        Map<String, Object> template,
        Map<String, Object> parameters
    ) {
        Map<String, Object> result = new java.util.HashMap<>();
        
        template.forEach((key, value) -> {
            if (value instanceof String) {
                result.put(key, replacePlaceholders((String) value, parameters));
            } else if (value instanceof Map) {
                @SuppressWarnings("unchecked")
                Map<String, Object> nested = (Map<String, Object>) value;
                result.put(key, replacePlaceholdersInMap(nested, parameters));
            } else {
                result.put(key, value);
            }
        });
        
        return result;
    }
    
    /**
     * 从 JSON 对象中提取路径值（简化实现）
     */
    private Object extractByPath(Map<String, Object> json, String path) {
        // 简化实现，实际应该使用 JSONPath 库
        String[] parts = path.replace("$.", "").split("\\.");
        Object current = json;
        
        for (String part : parts) {
            if (current instanceof Map) {
                @SuppressWarnings("unchecked")
                Map<String, Object> map = (Map<String, Object>) current;
                current = map.get(part);
            } else {
                return null;
            }
        }
        
        return current;
    }
    
    /**
     * 解析执行配置
     */
    private Map<String, Object> parseExecutionConfig(String configJson) {
        try {
            return objectMapper.readValue(configJson, Map.class);
        } catch (Exception e) {
            log.error("解析执行配置失败", e);
            throw new IllegalArgumentException("无效的执行配置: " + e.getMessage());
        }
    }
}
```

---

## 三、远程调用技能示例

### 3.1 天气查询技能

```sql
-- 天气查询技能
INSERT INTO skill_definitions (
    skill_id, name, description, category, skill_type,
    function_schema, execution_type, execution_config
) VALUES (
    'weather_query',
    '天气查询',
    '查询指定城市的天气信息',
    'utility',
    'ACTIVE',
    '{
        "type": "object",
        "properties": {
            "city": {
                "type": "string",
                "description": "城市名称"
            },
            "unit": {
                "type": "string",
                "enum": ["celsius", "fahrenheit"],
                "default": "celsius",
                "description": "温度单位"
            }
        },
        "required": ["city"]
    }',
    'API',
    '{
        "apiUrl": "https://api.openweathermap.org/data/2.5/weather",
        "method": "GET",
        "queryParams": {
            "q": "${city}",
            "units": "${unit}",
            "appid": "${WEATHER_API_KEY}"
        },
        "responseMapping": {
            "temperature": "$.main.temp",
            "humidity": "$.main.humidity",
            "description": "$.weather[0].description",
            "city": "$.name"
        }
    }'
);
```

### 3.2 翻译技能

```sql
-- 翻译技能
INSERT INTO skill_definitions (
    skill_id, name, description, category, skill_type,
    function_schema, execution_type, execution_config
) VALUES (
    'translate',
    '文本翻译',
    '将文本翻译成目标语言',
    'utility',
    'ACTIVE',
    '{
        "type": "object",
        "properties": {
            "text": {
                "type": "string",
                "description": "要翻译的文本"
            },
            "targetLang": {
                "type": "string",
                "description": "目标语言代码（如：en, zh, ja）"
            },
            "sourceLang": {
                "type": "string",
                "description": "源语言代码（可选，自动检测）"
            }
        },
        "required": ["text", "targetLang"]
    }',
    'API',
    '{
        "apiUrl": "https://api.translate.com/v1/translate",
        "method": "POST",
        "headers": {
            "Authorization": "Bearer ${TRANSLATE_API_KEY}",
            "Content-Type": "application/json"
        },
        "body": {
            "text": "${text}",
            "target_lang": "${targetLang}",
            "source_lang": "${sourceLang}"
        },
        "responseMapping": {
            "translatedText": "$.data.translated_text",
            "detectedLang": "$.data.detected_source_language"
        }
    }'
);
```

### 3.3 数据库查询技能（通过 API）

```sql
-- 数据库查询技能（通过后端 API）
INSERT INTO skill_definitions (
    skill_id, name, description, category, skill_type,
    function_schema, execution_type, execution_config
) VALUES (
    'database_query',
    '数据库查询',
    '查询心域系统数据库',
    'system',
    'ACTIVE',
    '{
        "type": "object",
        "properties": {
            "table": {
                "type": "string",
                "description": "表名"
            },
            "conditions": {
                "type": "object",
                "description": "查询条件"
            },
            "limit": {
                "type": "integer",
                "default": 10,
                "description": "返回记录数限制"
            }
        },
        "required": ["table]
    }',
    'API',
    '{
        "apiUrl": "${API_BASE_URL}/api/internal/query",
        "method": "POST",
        "headers": {
            "Authorization": "Bearer ${INTERNAL_API_KEY}",
            "Content-Type": "application/json"
        },
        "body": {
            "table": "${table}",
            "conditions": "${conditions}",
            "limit": "${limit}"
        }
    }'
);
```

---

## 四、安全考虑

### 4.1 API 密钥管理

**不要在技能配置中硬编码 API 密钥**，应该：

1. **使用环境变量**
   ```json
   {
     "headers": {
       "Authorization": "Bearer ${WEATHER_API_KEY}"
     }
   }
   ```

2. **从数据库获取**
   - 在 `skill_definitions` 表中存储 API 密钥引用
   - 执行时从安全存储中获取

3. **使用密钥管理服务**
   - 集成密钥管理服务（如 AWS Secrets Manager）
   - 动态获取密钥

### 4.2 权限控制

```java
// 在执行远程调用前检查权限
private void checkApiPermission(SkillDefinition skill, SkillExecutionContext context) {
    // 1. 检查角色是否有权限使用该技能
    if (!hasSkillPermission(context.getCharacterId(), skill.getSkillId())) {
        throw new SkillPermissionDeniedException("角色无权使用此技能");
    }
    
    // 2. 检查 API 调用频率限制
    if (exceedsRateLimit(skill.getSkillId(), context.getCharacterId())) {
        throw new SkillRateLimitExceededException("API 调用频率超限");
    }
    
    // 3. 检查 API 密钥是否有效
    if (!isApiKeyValid(skill)) {
        throw new SkillConfigurationException("API 密钥无效");
    }
}
```

### 4.3 错误处理

```java
try {
    ResponseEntity<String> response = executeRequest(url, method, requestEntity);
    
    if (response.getStatusCode().is4xxClientError()) {
        // 客户端错误（401, 403, 404 等）
        log.warn("API 调用客户端错误: {}", response.getStatusCode());
        throw new SkillExecutionException("API 调用失败: " + response.getStatusCode());
    }
    
    if (response.getStatusCode().is5xxServerError()) {
        // 服务器错误（500, 502, 503 等）
        log.error("API 调用服务器错误: {}", response.getStatusCode());
        throw new SkillExecutionException("API 服务暂时不可用");
    }
    
} catch (RestClientException e) {
    // 网络错误、超时等
    log.error("API 调用网络错误", e);
    throw new SkillExecutionException("网络连接失败: " + e.getMessage());
}
```

---

## 五、最佳实践

### 5.1 配置管理

1. **分离配置和环境**
   - 开发、测试、生产环境使用不同的 API 端点
   - 使用环境变量管理配置

2. **配置验证**
   - 在创建技能时验证 API 配置
   - 测试 API 连接性

3. **配置版本管理**
   - 支持配置的版本控制
   - 支持配置回滚

### 5.2 性能优化

1. **缓存机制**
   ```java
   @Cacheable(value = "api_results", key = "#skillId + '_' + #parameters")
   public Object executeApiSkill(String skillId, Map<String, Object> parameters) {
       // 执行 API 调用
   }
   ```

2. **超时控制**
   ```java
   RestTemplate restTemplate = new RestTemplate();
   restTemplate.setRequestFactory(new HttpComponentsClientHttpRequestFactory());
   ((HttpComponentsClientHttpRequestFactory) restTemplate.getRequestFactory())
       .setConnectTimeout(5000);  // 5秒连接超时
       .setReadTimeout(10000);     // 10秒读取超时
   ```

3. **重试机制**
   ```java
   @Retryable(value = {RestClientException.class}, maxAttempts = 3)
   public ResponseEntity<String> executeRequest(...) {
       // 自动重试失败的请求
   }
   ```

### 5.3 监控和日志

```java
@Aspect
@Component
public class ApiSkillMonitor {
    
    @Around("execution(* com.heartsphere.aiagent.skill.executor.ApiSkillExecutor.execute(..))")
    public Object monitorApiCall(ProceedingJoinPoint joinPoint) throws Throwable {
        long startTime = System.currentTimeMillis();
        String skillId = ((SkillDefinition) joinPoint.getArgs()[0]).getSkillId();
        
        try {
            Object result = joinPoint.proceed();
            
            long duration = System.currentTimeMillis() - startTime;
            log.info("API 技能执行成功: skillId={}, duration={}ms", skillId, duration);
            
            // 记录指标
            metricsCollector.recordApiCall(skillId, duration, true);
            
            return result;
        } catch (Exception e) {
            long duration = System.currentTimeMillis() - startTime;
            log.error("API 技能执行失败: skillId={}, duration={}ms", skillId, duration, e);
            
            // 记录错误指标
            metricsCollector.recordApiCall(skillId, duration, false);
            
            throw e;
        }
    }
}
```

---

## 六、总结

### 支持情况

✅ **Claude Code Skill 原生支持远程调用**
- 可以使用 `fetch` API
- 可以使用 `Bash` + `curl`
- 可以使用其他 HTTP 库

✅ **集成方案支持 API 类型技能**
- `execution_type: "API"`
- 配置化的 API 调用
- 支持参数替换和响应映射

### 实施建议

1. **优先使用后端 API Executor**
   - 更安全（API 密钥不暴露给前端）
   - 更好的错误处理
   - 支持缓存和重试

2. **保留 Claude Code Skill 格式**
   - 便于本地开发和测试
   - 支持直接使用现有技能

3. **统一配置管理**
   - 集中管理 API 密钥
   - 统一错误处理
   - 统一监控和日志

---

**最后更新**：2025-01-03
