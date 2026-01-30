# 🚀 Phase 1 实现启动指南（后端基础实现）

## 目标
在 1-2 周内完成后端基础实现，为 Phase 2 的 API 集成做准备。

---

## Phase 1 工作分解

### 任务 1.1：数据库迁移 (1-2 天)

#### 步骤 1：创建迁移脚本

**文件位置**: `main/backend/src/main/resources/db/migration/`

**文件名**: `V{version}__{timestamp}__create_skill_execution_records.sql`

**关键内容**:
```sql
-- 技能执行记录表
CREATE TABLE skill_execution_records (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    conversation_id BIGINT,
    skill_id BIGINT,
    user_id BIGINT,
    role_id BIGINT,
    
    -- 评估阶段
    evaluation_context JSON COMMENT '评估上下文快照',
    evaluation_timestamp TIMESTAMP,
    keyword_matches JSON COMMENT '匹配的关键词列表',
    semantic_score INT COMMENT '语义相似度 (0-100)',
    context_score INT COMMENT '上下文得分 (0-100)',
    memory_score INT COMMENT '内存触发得分 (0-100)',
    composite_score INT COMMENT '综合得分 (0-100)',
    decision VARCHAR(50) COMMENT 'APPLIED/REJECTED',
    rejection_reason VARCHAR(255),
    
    -- 应用阶段
    execution_parameters JSON COMMENT '执行参数',
    execution_status VARCHAR(50) COMMENT 'PENDING/EXECUTING/COMPLETED/FAILED',
    execution_timestamp TIMESTAMP,
    execution_duration_ms INT,
    
    -- 结果阶段
    execution_result JSON COMMENT '执行结果',
    error_message TEXT,
    resource_usage JSON,
    
    -- 关联
    related_memory_ids JSON,
    related_conversation_turn_id BIGINT,
    
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- 索引
    KEY idx_conversation_created (conversation_id, created_at),
    KEY idx_skill_created (skill_id, created_at),
    KEY idx_user_created (user_id, created_at),
    KEY idx_decision (decision)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='技能执行记录表';
```

**验证**:
```bash
# 运行迁移
mvn flyway:migrate -Ddb.driver=com.mysql.cj.jdbc.Driver \
  -Ddb.url=jdbc:mysql://localhost:3306/heartsphere \
  -Ddb.user=root -Ddb.password=xxx

# 验证表创建
mysql> DESCRIBE skill_execution_records;
mysql> SHOW INDEX FROM skill_execution_records;
```

---

### 任务 1.2：实体类与 DTO (2-3 天)

#### 1.2.1 创建实体类

**文件位置**: `main/backend/src/main/java/com/heartsphere/ai/skill/entity/SkillExecutionRecord.java`

**关键代码**:
```java
@Data
@Builder
@Entity
@Table(name = "skill_execution_records", indexes = {
    @Index(name = "idx_conversation_created", columnList = "conversation_id,created_at"),
    @Index(name = "idx_skill_created", columnList = "skill_id,created_at"),
    @Index(name = "idx_user_created", columnList = "user_id,created_at"),
    @Index(name = "idx_decision", columnList = "decision")
})
public class SkillExecutionRecord {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "conversation_id")
    private Long conversationId;
    
    @Column(name = "skill_id")
    private Long skillId;
    
    @Column(name = "user_id")
    private Long userId;
    
    @Column(name = "role_id")
    private Long roleId;
    
    // 评估阶段
    @Column(name = "evaluation_context", columnDefinition = "JSON")
    private String evaluationContext;  // JSON 字符串
    
    @Column(name = "evaluation_timestamp")
    private LocalDateTime evaluationTimestamp;
    
    @Column(name = "semantic_score")
    private Integer semanticScore;
    
    @Column(name = "context_score")
    private Integer contextScore;
    
    @Column(name = "memory_score")
    private Integer memoryScore;
    
    @Column(name = "composite_score")
    private Integer compositeScore;
    
    @Column(name = "decision", length = 50)
    private String decision;  // APPLIED, REJECTED
    
    @Column(name = "rejection_reason")
    private String rejectionReason;
    
    // 应用阶段
    @Column(name = "execution_parameters", columnDefinition = "JSON")
    private String executionParameters;
    
    @Column(name = "execution_status", length = 50)
    @Enumerated(EnumType.STRING)
    private ExecutionStatus executionStatus;  // PENDING, EXECUTING, COMPLETED, FAILED
    
    @Column(name = "execution_duration_ms")
    private Integer executionDurationMs;
    
    // 结果阶段
    @Column(name = "execution_result", columnDefinition = "JSON")
    private String executionResult;
    
    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;
    
    @Column(name = "related_memory_ids", columnDefinition = "JSON")
    private String relatedMemoryIds;  // 数组 JSON
    
    @Column(name = "related_conversation_turn_id")
    private Long relatedConversationTurnId;
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
```

#### 1.2.2 创建枚举

**文件位置**: `main/backend/src/main/java/com/heartsphere/ai/skill/enums/ExecutionStatus.java`

```java
public enum ExecutionStatus {
    PENDING("待执行"),
    EXECUTING("执行中"),
    COMPLETED("已完成"),
    FAILED("已失败");
    
    private final String description;
    
    ExecutionStatus(String description) {
        this.description = description;
    }
    
    public String getDescription() {
        return description;
    }
}
```

#### 1.2.3 创建 DTO

**文件位置**: `main/backend/src/main/java/com/heartsphere/ai/skill/dto/SkillExecutionRecordDTO.java`

```java
@Data
@Builder
public class SkillExecutionRecordDTO {
    private Long id;
    private Long conversationId;
    private Long skillId;
    private Integer compositeScore;
    private String decision;
    private String executionStatus;
    private LocalDateTime executionTimestamp;
    private Integer executionDurationMs;
    private String executionResult;
    private String errorMessage;
    private List<Long> relatedMemoryIds;
    private LocalDateTime createdAt;
}
```

---

### 任务 1.3：Repository 和基础 Service (2-3 天)

#### 1.3.1 创建 Repository

**文件位置**: `main/backend/src/main/java/com/heartsphere/ai/skill/repository/SkillExecutionRecordRepository.java`

```java
@Repository
public interface SkillExecutionRecordRepository extends JpaRepository<SkillExecutionRecord, Long> {
    
    // 按会话查询
    List<SkillExecutionRecord> findByConversationIdOrderByCreatedAtDesc(Long conversationId, Pageable pageable);
    
    // 按技能查询
    List<SkillExecutionRecord> findBySkillIdAndCreatedAtBetween(
        Long skillId, LocalDateTime startTime, LocalDateTime endTime);
    
    // 按用户查询
    List<SkillExecutionRecord> findByUserIdAndCreatedAtBetween(
        Long userId, LocalDateTime startTime, LocalDateTime endTime, Pageable pageable);
    
    // 查询统计
    long countBySkillIdAndDecision(Long skillId, String decision);
    
    long countBySkillIdAndExecutionStatus(Long skillId, String status);
    
    // 删除过期记录（用于归档）
    long deleteByCreatedAtBefore(LocalDateTime before);
}
```

#### 1.3.2 创建 Service

**文件位置**: `main/backend/src/main/java/com/heartsphere/ai/skill/service/SkillExecutionRecordService.java`

```java
@Service
@RequiredArgsConstructor
@Slf4j
public class SkillExecutionRecordService {
    
    private final SkillExecutionRecordRepository repository;
    private final ObjectMapper objectMapper;
    
    /**
     * 创建执行记录
     */
    @Transactional
    public SkillExecutionRecord createRecord(SkillExecutionRecordDTO dto) {
        SkillExecutionRecord record = SkillExecutionRecord.builder()
            .conversationId(dto.getConversationId())
            .skillId(dto.getSkillId())
            .userId(dto.getUserId())
            .compositeScore(dto.getCompositeScore())
            .decision(dto.getDecision())
            .executionStatus(ExecutionStatus.PENDING)
            .evaluationTimestamp(LocalDateTime.now())
            .relatedMemoryIds(serializeList(dto.getRelatedMemoryIds()))
            .build();
        
        return repository.save(record);
    }
    
    /**
     * 更新执行结果
     */
    @Transactional
    public void updateExecutionResult(
            Long recordId,
            String status,
            String result,
            Integer durationMs,
            String error) {
        SkillExecutionRecord record = repository.findById(recordId)
            .orElseThrow(() -> new RuntimeException("记录不存在"));
        
        record.setExecutionStatus(ExecutionStatus.valueOf(status));
        record.setExecutionResult(result);
        record.setExecutionDurationMs(durationMs);
        record.setErrorMessage(error);
        record.setUpdatedAt(LocalDateTime.now());
        
        repository.save(record);
    }
    
    /**
     * 查询对话的执行历史
     */
    public List<SkillExecutionRecordDTO> getConversationHistory(Long conversationId) {
        List<SkillExecutionRecord> records = repository.findByConversationIdOrderByCreatedAtDesc(
            conversationId, PageRequest.of(0, 100));
        
        return records.stream()
            .map(this::toDTO)
            .collect(Collectors.toList());
    }
    
    /**
     * 查询统计数据
     */
    public SkillStatistics getStatistics(Long skillId, LocalDateTime startTime, LocalDateTime endTime) {
        List<SkillExecutionRecord> records = repository.findBySkillIdAndCreatedAtBetween(
            skillId, startTime, endTime);
        
        long applied = records.stream()
            .filter(r -> "APPLIED".equals(r.getDecision()))
            .count();
        
        long completed = records.stream()
            .filter(r -> "COMPLETED".equals(r.getExecutionStatus().name()))
            .count();
        
        return SkillStatistics.builder()
            .totalCount(records.size())
            .appliedCount(applied)
            .completedCount(completed)
            .successRate(completed > 0 ? (double) completed / applied : 0)
            .build();
    }
    
    private SkillExecutionRecordDTO toDTO(SkillExecutionRecord record) {
        return SkillExecutionRecordDTO.builder()
            .id(record.getId())
            .conversationId(record.getConversationId())
            .skillId(record.getSkillId())
            .compositeScore(record.getCompositeScore())
            .decision(record.getDecision())
            .executionStatus(record.getExecutionStatus().name())
            .executionTimestamp(record.getExecutionTimestamp())
            .executionDurationMs(record.getExecutionDurationMs())
            .executionResult(record.getExecutionResult())
            .errorMessage(record.getErrorMessage())
            .relatedMemoryIds(deserializeList(record.getRelatedMemoryIds()))
            .createdAt(record.getCreatedAt())
            .build();
    }
    
    private String serializeList(List<Long> list) {
        try {
            return objectMapper.writeValueAsString(list);
        } catch (Exception e) {
            log.error("序列化失败", e);
            return "[]";
        }
    }
    
    private List<Long> deserializeList(String json) {
        try {
            return objectMapper.readValue(json, new TypeReference<List<Long>>() {});
        } catch (Exception e) {
            log.error("反序列化失败", e);
            return new ArrayList<>();
        }
    }
}
```

---

### 任务 1.4：单元测试 (2-3 天)

#### 1.4.1 Repository 测试

**文件位置**: `main/backend/src/test/java/com/heartsphere/ai/skill/repository/SkillExecutionRecordRepositoryTest.java`

```java
@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.ANY)
public class SkillExecutionRecordRepositoryTest {
    
    @Autowired
    private SkillExecutionRecordRepository repository;
    
    @Test
    public void testCreateRecord() {
        SkillExecutionRecord record = SkillExecutionRecord.builder()
            .conversationId(1L)
            .skillId(1L)
            .userId(1L)
            .compositeScore(85)
            .decision("APPLIED")
            .executionStatus(ExecutionStatus.COMPLETED)
            .build();
        
        SkillExecutionRecord saved = repository.save(record);
        
        assertNotNull(saved.getId());
        assertEquals(85, saved.getCompositeScore());
    }
    
    @Test
    public void testQueryByConversationId() {
        // Setup
        SkillExecutionRecord record1 = createTestRecord(1L, 85);
        SkillExecutionRecord record2 = createTestRecord(1L, 72);
        repository.saveAll(Arrays.asList(record1, record2));
        
        // Test
        List<SkillExecutionRecord> results = repository.findByConversationIdOrderByCreatedAtDesc(
            1L, PageRequest.of(0, 10));
        
        assertEquals(2, results.size());
    }
    
    private SkillExecutionRecord createTestRecord(Long conversationId, int score) {
        return SkillExecutionRecord.builder()
            .conversationId(conversationId)
            .skillId(1L)
            .userId(1L)
            .compositeScore(score)
            .decision("APPLIED")
            .executionStatus(ExecutionStatus.COMPLETED)
            .build();
    }
}
```

#### 1.4.2 Service 测试

**文件位置**: `main/backend/src/test/java/com/heartsphere/ai/skill/service/SkillExecutionRecordServiceTest.java`

```java
@ExtendWith(MockitoExtension.class)
public class SkillExecutionRecordServiceTest {
    
    @Mock
    private SkillExecutionRecordRepository repository;
    
    @InjectMocks
    private SkillExecutionRecordService service;
    
    @Test
    public void testCreateRecord() {
        // Setup
        SkillExecutionRecordDTO dto = SkillExecutionRecordDTO.builder()
            .conversationId(1L)
            .skillId(1L)
            .userId(1L)
            .compositeScore(85)
            .decision("APPLIED")
            .build();
        
        SkillExecutionRecord expected = SkillExecutionRecord.builder()
            .id(1L)
            .compositeScore(85)
            .build();
        
        when(repository.save(any(SkillExecutionRecord.class)))
            .thenReturn(expected);
        
        // Test
        SkillExecutionRecord result = service.createRecord(dto);
        
        assertEquals(1L, result.getId());
        assertEquals(85, result.getCompositeScore());
        verify(repository, times(1)).save(any(SkillExecutionRecord.class));
    }
}
```

---

## 验收标准

✅ **必须达成**:
- [ ] 数据库表成功创建并通过迁移
- [ ] 所有实体类正确映射
- [ ] Repository CRUD 操作正常
- [ ] Service 业务逻辑正确
- [ ] 单元测试覆盖率 > 80%
- [ ] 所有测试通过

✅ **质量检查**:
- [ ] 代码通过 Lint 检查
- [ ] 符合 OpenSpec 项目规范
- [ ] 准备就绪进入 Phase 2

---

## 实施时间表

```
Day 1-2:   任务 1.1（数据库迁移）
Day 3-4:   任务 1.2（实体类与 DTO）
Day 5-6:   任务 1.3（Repository 和 Service）
Day 7-8:   任务 1.4（单元测试）
Day 9:     集成测试和代码审查
Day 10-14: Buffer 和修复
```

---

## 下一步（Phase 2）

完成 Phase 1 后，进入 Phase 2（后端 API 和集成）：
- 创建 `SkillApplicationEngine` 核心引擎
- 创建 `SkillDebugController` REST API
- 集成到 `AIServiceController`

---

**准备就绪？让我们开始实现吧！** 🚀

