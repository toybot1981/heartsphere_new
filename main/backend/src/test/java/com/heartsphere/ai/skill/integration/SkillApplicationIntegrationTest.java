package com.heartsphere.ai.skill.integration;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.heartsphere.ai.skill.controller.SkillDebugController;
import com.heartsphere.ai.skill.dto.SkillExecutionRecordDTO;
import com.heartsphere.ai.skill.entity.SkillExecutionRecord;
import com.heartsphere.ai.skill.repository.SkillExecutionRecordRepository;
import com.heartsphere.ai.skill.service.SkillExecutionRecordService;
import com.heartsphere.skill.entity.SkillDefinition;
import com.heartsphere.skill.repository.SkillDefinitionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * 技能应用集成测试
 * 测试完整的对话 → 技能评估 → 技能应用 → 记录流程
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
@DisplayName("技能应用集成测试")
public class SkillApplicationIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private SkillExecutionRecordRepository recordRepository;

    @Autowired
    private SkillExecutionRecordService recordService;

    @Autowired
    private SkillDefinitionRepository skillDefinitionRepository;

    @Autowired
    private ObjectMapper objectMapper;

    private Long testUserId = 1L;
    private Long testConversationId = 100L;
    private Long testSkillId;

    @BeforeEach
    public void setUp() {
        // 清理测试数据
        recordRepository.deleteAll();
        
        // 创建测试技能
        SkillDefinition skill = new SkillDefinition();
        skill.setName("测试技能");
        skill.setDescription("这是一个测试技能");
        skill.setCategory("测试");
        skill.setAutoTriggerKeywords("[\"测试\", \"技能\"]");
        skill = skillDefinitionRepository.save(skill);
        testSkillId = skill.getId();
    }

    @Test
    @DisplayName("测试创建技能执行记录")
    public void testCreateSkillExecutionRecord() {
        // 创建执行记录
        SkillExecutionRecordDTO dto = SkillExecutionRecordDTO.builder()
            .conversationId(testConversationId)
            .skillId(testSkillId)
            .userId(testUserId)
            .decision("APPLIED")
            .executionStatus("COMPLETED")
            .semanticScore(80)
            .contextScore(85)
            .memoryScore(75)
            .compositeScore(80)
            .evaluationTimestamp(LocalDateTime.now())
            .build();

        SkillExecutionRecord record = recordService.createRecord(dto);

        // 验证记录已创建
        assertNotNull(record.getId());
        assertEquals(testConversationId, record.getConversationId());
        assertEquals(testSkillId, record.getSkillId());
        assertEquals(testUserId, record.getUserId());
        assertEquals("APPLIED", record.getDecision());
        assertEquals("COMPLETED", record.getExecutionStatus());
        assertEquals(80, record.getCompositeScore());

        // 验证数据库中的记录
        SkillExecutionRecord savedRecord = recordRepository.findById(record.getId()).orElse(null);
        assertNotNull(savedRecord);
        assertEquals(testConversationId, savedRecord.getConversationId());
    }

    @Test
    @DisplayName("测试查询技能执行历史")
    public void testGetSkillExecutionHistory() throws Exception {
        // 创建测试记录
        SkillExecutionRecordDTO dto1 = SkillExecutionRecordDTO.builder()
            .conversationId(testConversationId)
            .skillId(testSkillId)
            .userId(testUserId)
            .decision("APPLIED")
            .executionStatus("COMPLETED")
            .compositeScore(80)
            .evaluationTimestamp(LocalDateTime.now())
            .build();
        recordService.createRecord(dto1);

        SkillExecutionRecordDTO dto2 = SkillExecutionRecordDTO.builder()
            .conversationId(testConversationId)
            .skillId(testSkillId)
            .userId(testUserId)
            .decision("REJECTED")
            .executionStatus("FAILED")
            .rejectionReason("评分过低")
            .evaluationTimestamp(LocalDateTime.now())
            .build();
        recordService.createRecord(dto2);

        // 调用 API
        mockMvc.perform(get("/api/v1/skill/debug/conversation/{conversationId}/history", testConversationId)
                .contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$").isArray())
            .andExpect(jsonPath("$.length()").value(2))
            .andExpect(jsonPath("$[0].conversationId").value(testConversationId))
            .andExpect(jsonPath("$[0].skillId").value(testSkillId));
    }

    @Test
    @DisplayName("测试按状态过滤执行记录")
    public void testFilterRecordsByStatus() throws Exception {
        // 创建不同状态的记录
        SkillExecutionRecordDTO dto1 = SkillExecutionRecordDTO.builder()
            .conversationId(testConversationId)
            .skillId(testSkillId)
            .userId(testUserId)
            .decision("APPLIED")
            .executionStatus("COMPLETED")
            .evaluationTimestamp(LocalDateTime.now())
            .build();
        recordService.createRecord(dto1);

        SkillExecutionRecordDTO dto2 = SkillExecutionRecordDTO.builder()
            .conversationId(testConversationId)
            .skillId(testSkillId)
            .userId(testUserId)
            .decision("APPLIED")
            .executionStatus("FAILED")
            .evaluationTimestamp(LocalDateTime.now())
            .build();
        recordService.createRecord(dto2);

        // 查询已完成的记录
        mockMvc.perform(get("/api/v1/skill/debug/conversation/{conversationId}/history", testConversationId)
                .param("status", "COMPLETED")
                .contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$").isArray())
            .andExpect(jsonPath("$.length()").value(1))
            .andExpect(jsonPath("$[0].executionStatus").value("COMPLETED"));
    }

    @Test
    @DisplayName("测试获取用户统计信息")
    public void testGetUserStatistics() throws Exception {
        // 创建多条记录
        for (int i = 0; i < 5; i++) {
            SkillExecutionRecordDTO dto = SkillExecutionRecordDTO.builder()
                .conversationId(testConversationId + i)
                .skillId(testSkillId)
                .userId(testUserId)
                .decision(i % 2 == 0 ? "APPLIED" : "REJECTED")
                .executionStatus(i % 2 == 0 ? "COMPLETED" : "FAILED")
                .compositeScore(70 + i * 5)
                .evaluationTimestamp(LocalDateTime.now().minusDays(i))
                .build();
            recordService.createRecord(dto);
        }

        // 调用统计 API
        mockMvc.perform(get("/api/v1/skill/debug/user/{userId}/statistics", testUserId)
                .param("days", "7")
                .contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.totalExecutions").exists())
            .andExpect(jsonPath("$.successfulExecutions").exists())
            .andExpect(jsonPath("$.failedExecutions").exists());
    }

    @Test
    @DisplayName("测试技能执行记录的完整生命周期")
    public void testSkillExecutionRecordLifecycle() {
        // 1. 创建记录（评估阶段）
        SkillExecutionRecordDTO dto = SkillExecutionRecordDTO.builder()
            .conversationId(testConversationId)
            .skillId(testSkillId)
            .userId(testUserId)
            .decision("APPLIED")
            .executionStatus("PENDING")
            .semanticScore(80)
            .contextScore(85)
            .memoryScore(75)
            .compositeScore(80)
            .evaluationTimestamp(LocalDateTime.now())
            .build();

        SkillExecutionRecord record = recordService.createRecord(dto);
        Long recordId = record.getId();

        // 2. 标记为执行中
        recordService.markAsExecuting(recordId);
        SkillExecutionRecord executingRecord = recordRepository.findById(recordId).orElse(null);
        assertNotNull(executingRecord);
        assertEquals("EXECUTING", executingRecord.getExecutionStatus());

        // 3. 标记为完成
        String result = "{\"success\": true, \"output\": \"执行成功\"}";
        recordService.markAsCompleted(recordId, result, 150);
        SkillExecutionRecord completedRecord = recordRepository.findById(recordId).orElse(null);
        assertNotNull(completedRecord);
        assertEquals("COMPLETED", completedRecord.getExecutionStatus());
        assertNotNull(completedRecord.getExecutionResult());
        assertEquals(150, completedRecord.getExecutionDurationMs());
    }

    @Test
    @DisplayName("测试技能执行记录与记忆关联")
    public void testSkillMemoryCorrelation() {
        // 创建带记忆关联的记录
        List<Long> relatedMemoryIds = List.of(1L, 2L, 3L);
        
        SkillExecutionRecordDTO dto = SkillExecutionRecordDTO.builder()
            .conversationId(testConversationId)
            .skillId(testSkillId)
            .userId(testUserId)
            .decision("APPLIED")
            .executionStatus("COMPLETED")
            .relatedMemoryIds(relatedMemoryIds)
            .memoryScore(90)
            .evaluationTimestamp(LocalDateTime.now())
            .build();

        SkillExecutionRecord record = recordService.createRecord(dto);

        // 验证记忆关联 - 需要解析 JSON 字符串
        assertNotNull(record.getRelatedMemoryIds());
        ObjectMapper mapper = new ObjectMapper();
        try {
            List<Long> memoryIds = mapper.readValue(record.getRelatedMemoryIds(), new TypeReference<List<Long>>() {});
            assertEquals(3, memoryIds.size());
            assertTrue(memoryIds.contains(1L));
            assertTrue(memoryIds.contains(2L));
            assertTrue(memoryIds.contains(3L));
        } catch (Exception e) {
            fail("解析 relatedMemoryIds 失败: " + e.getMessage());
        }
        assertEquals(90, record.getMemoryScore());
    }

    @Test
    @DisplayName("测试分页查询执行记录")
    public void testPagedQuery() throws Exception {
        // 创建多条记录
        for (int i = 0; i < 15; i++) {
            SkillExecutionRecordDTO dto = SkillExecutionRecordDTO.builder()
                .conversationId(testConversationId)
                .skillId(testSkillId)
                .userId(testUserId)
                .decision("APPLIED")
                .executionStatus("COMPLETED")
                .evaluationTimestamp(LocalDateTime.now().minusMinutes(i))
                .build();
            recordService.createRecord(dto);
        }

        // 测试分页查询
        mockMvc.perform(get("/api/v1/skill/debug/conversation/{conversationId}/history/paged", testConversationId)
                .param("page", "0")
                .param("size", "10")
                .contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.content").isArray())
            .andExpect(jsonPath("$.content.length()").value(10))
            .andExpect(jsonPath("$.totalElements").value(15))
            .andExpect(jsonPath("$.totalPages").value(2))
            .andExpect(jsonPath("$.number").value(0))
            .andExpect(jsonPath("$.size").value(10));
    }
}
