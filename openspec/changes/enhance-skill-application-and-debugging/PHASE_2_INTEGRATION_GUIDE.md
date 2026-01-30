# 🚀 技能引擎集成指南 - Phase 2

完成 Phase 1 后，您需要将技能应用引擎集成到 AI 服务流程中。

## 集成点

### 1. AIServiceController 中的集成

**文件**: `main/backend/src/main/java/com/heartsphere/admin/controller/AIServiceController.java`

**在 `chatCompletions()` 方法中添加以下代码**（大约在第 674 行）:

```java
@PostMapping(value = "/v1/chat/completions")
public Object chatCompletions(
        @RequestBody ChatCompletionRequest request,
        @Parameter(hidden = true) Authentication authentication) {
    try {
        Long userId = getCurrentUserId(authentication);
        
        if (Boolean.TRUE.equals(request.getStream())) {
            return chatCompletionsStreamInternal(request, userId);
        }
        
        TextGenerationRequest internalRequest = convertToInternalRequest(request);
        
        // ==================== 新增：技能引擎集成 ====================
        // Step 1: 准备技能评估上下文
        SkillEvaluationContext skillContext = prepareSkillContext(
            userId, 
            request.getMessages(),
            request.getConversationId()
        );
        
        // Step 2: 获取可用的技能列表
        List<SkillDefinition> availableSkills = skillService.getAvailableSkills(userId);
        
        // Step 3: 异步评估和应用技能
        SkillApplicationResult skillResult = skillApplicationEngine.evaluateAndApplySkills(
            skillContext,
            availableSkills,
            userId,
            request.getConversationId()
        );
        
        // ==================== 新增结束 ====================
        
        // 原有逻辑
        TextGenerationResponse internalResponse = aiService.generateText(userId, internalRequest);
        
        // ==================== 新增：在响应中包含技能信息 ====================
        ChatCompletionResponse response = convertToOpenAPIResponse(internalResponse, request.getModel());
        
        // 在 response 的 metadata 中添加技能执行信息
        if (response.getMetadata() == null) {
            response.setMetadata(new HashMap<>());
        }
        response.getMetadata().put("skillApplicationResult", skillResult);
        
        // ==================== 新增结束 ====================
        
        return ResponseEntity.ok(response);
    } catch (IllegalArgumentException e) {
        log.error("聊天完成请求参数错误", e);
        throw e;
    } catch (Exception e) {
        log.error("聊天完成失败", e);
        throw new RuntimeException("聊天完成失败: " + e.getMessage(), e);
    }
}
```

### 2. 需要新增的方法

在 `AIServiceController` 中添加以下辅助方法:

```java
/**
 * 准备技能评估上下文
 */
private SkillEvaluationContext prepareSkillContext(
    Long userId,
    List<ChatMessage> messages,
    String conversationId) {
    
    String userMessage = messages != null && !messages.isEmpty() ? 
        messages.get(messages.size() - 1).getContent() : "";
    
    List<String> history = messages != null ? 
        messages.stream()
            .map(ChatMessage::getContent)
            .collect(Collectors.toList()) :
        new ArrayList<>();
    
    return SkillEvaluationContext.builder()
        .userMessage(userMessage)
        .roleId(getCurrentRoleId(userId))
        .conversationHistory(history)
        .timestamp(LocalDateTime.now())
        .build();
}

/**
 * 获取当前用户的角色ID
 */
private Long getCurrentRoleId(Long userId) {
    // 从数据库或缓存获取用户当前的角色ID
    // 这取决于您的系统设计
    return 1L;  // 示例值
}
```

### 3. 注入依赖

在 `AIServiceController` 中添加以下字段:

```java
@Autowired
private SkillApplicationEngine skillApplicationEngine;

@Autowired
private SkillService skillService;  // 需要创建此服务

@Autowired
private SkillExecutionRecordService skillExecutionRecordService;
```

---

## 数据库迁移步骤

### 1. 运行迁移脚本

```bash
cd main/backend

# 使用 Maven Flyway 插件
mvn clean flyway:migrate \
  -Ddb.driver=com.mysql.cj.jdbc.Driver \
  -Ddb.url=jdbc:mysql://localhost:3306/heartsphere \
  -Ddb.user=root \
  -Ddb.password=your_password

# 或使用 Spring Boot
mvn spring-boot:run
```

### 2. 验证表创建

```sql
mysql> DESCRIBE skill_execution_records;
mysql> SHOW INDEX FROM skill_execution_records;
mysql> SELECT * FROM skill_execution_records LIMIT 1;
```

---

## 测试清单

### 单元测试

```bash
# 运行 Repository 测试
mvn test -Dtest=SkillExecutionRecordRepositoryTest

# 运行 Service 测试
mvn test -Dtest=SkillExecutionRecordServiceTest

# 运行所有技能相关测试
mvn test -Dtest=com.heartsphere.ai.skill.**
```

### 集成测试

```bash
# 运行完整的集成测试
mvn verify

# 查看覆盖率报告
mvn jacoco:report
# 报告位置: target/site/jacoco/index.html
```

### 手动测试

```bash
# 1. 启动后端
mvn spring-boot:run

# 2. 测试健康检查
curl http://localhost:8080/api/v1/skill/debug/health

# 3. 测试调试 API
curl -X POST http://localhost:8080/api/v1/skill/debug/evaluate-skills \
  -H "Content-Type: application/json" \
  -d '{
    "userMessage": "我想学习编程",
    "roleId": 1
  }'

# 4. 测试统计查询
curl http://localhost:8080/api/v1/skill/debug/user/1/statistics
```

---

## 配置说明

### 评分阈值配置

在 `SkillApplicationEngine` 中修改以下值:

```java
// 评分阈值（0-100）
private static final int SCORE_THRESHOLD = 60;

// 最多同时应用的技能数
private static final int TOP_N_SKILLS = 5;
```

### 权重配置

在 `SkillScoringService` 中修改:

```java
// 语义相似度权重
private static final double SEMANTIC_WEIGHT = 0.4;

// 上下文匹配权重
private static final double CONTEXT_WEIGHT = 0.35;

// 内存触发权重
private static final double MEMORY_WEIGHT = 0.25;
```

---

## 性能优化

### 1. 异步执行

建议使用 `@Async` 进行异步处理:

```java
@Async
public void evaluateAndApplySkillsAsync(
    SkillEvaluationContext context,
    List<SkillDefinition> availableSkills,
    Long userId,
    Long conversationId) {
    
    skillApplicationEngine.evaluateAndApplySkills(
        context, availableSkills, userId, conversationId);
}
```

### 2. 缓存

使用 Spring Cache 缓存技能列表:

```java
@Cacheable(value = "availableSkills", key = "#userId")
public List<SkillDefinition> getAvailableSkills(Long userId) {
    return skillRepository.findByUserIdAndActiveTrue(userId);
}
```

### 3. 批量查询

使用 `scoreSkillsBatch()` 进行批量评分:

```java
List<SkillScore> scores = scoringService.scoreSkillsBatch(skills, context);
```

---

## 常见问题

### Q1: 如何调试技能评分?

使用 `/api/v1/skill/debug/evaluate-skills` 端点进行调试，无需实际执行。

### Q2: 如何查看执行历史?

访问 `/api/v1/skill/debug/conversation/{conversationId}/history`

### Q3: 如何优化性能?

1. 使用异步处理
2. 启用缓存
3. 批量评分而不是逐个评分
4. 定期清理过期记录

---

## 下一步 (Phase 3-4)

1. **前端 Skill Debug Panel** - 在 ChatWindow 中显示技能调试信息
2. **实时更新** - WebSocket 推送技能执行状态
3. **可视化分析** - 技能效果统计图表
4. **灰度发布** - 逐步上线新功能

---

**准备就绪！继续集成吧！** 🚀
