package com.heartsphere.skill.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.heartsphere.skill.entity.SkillDefinition;
import com.heartsphere.skill.repository.SkillDefinitionRepository;
import com.heartsphere.skill.service.SkillExecutor;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * 技能执行 Controller 测试
 * 
 * @author HeartSphere
 * @version 1.0
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
public class SkillExecutionControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private SkillDefinitionRepository skillDefinitionRepository;

    @MockBean
    private SkillExecutor skillExecutor;

    @Autowired
    private ObjectMapper objectMapper;

    private SkillDefinition testSkill;
    private Long testCharacterId = 1L;

    @BeforeEach
    void setUp() {
        skillDefinitionRepository.deleteAll();

        // 创建测试技能
        testSkill = new SkillDefinition();
        testSkill.setSkillId("test-execution-skill");
        testSkill.setName("测试执行技能");
        testSkill.setDescription("用于测试技能执行的技能");
        testSkill.setCategory("test");
        testSkill.setSkillType("ACTIVE");
        testSkill.setExecutionType("RULE_BASED");
        testSkill.setFunctionSchema("""
            {
                "type": "object",
                "properties": {
                    "action": {
                        "type": "string",
                        "enum": ["test", "execute"]
                    },
                    "param1": {
                        "type": "string"
                    }
                },
                "required": ["action"]
            }
            """);
        testSkill.setVersion("1.0.0");
        testSkill.setIsSystemSkill(false);
        testSkill = skillDefinitionRepository.save(testSkill);
    }

    @Test
    @WithMockUser(username = "testuser", authorities = {"ROLE_USER"})
    void testExecuteSkill_Success() throws Exception {
        // 准备执行结果
        Map<String, Object> resultMap = new HashMap<>();
        resultMap.put("status", "success");
        resultMap.put("message", "技能执行成功");
        
        SkillExecutor.SkillExecutionResult successResult = SkillExecutor.SkillExecutionResult.builder()
            .skillId("test-execution-skill")
            .success(true)
            .result(resultMap)
            .executionTimeMs(150)
            .build();

        // Mock SkillExecutor
        when(skillExecutor.execute(
            eq("test-execution-skill"),
            any(Map.class),
            any(SkillExecutor.SkillExecutionContext.class)
        )).thenReturn(successResult);

        // 准备请求
        Map<String, Object> parameters = new HashMap<>();
        parameters.put("action", "test");
        parameters.put("param1", "value1");
        
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("skillId", "test-execution-skill");
        requestBody.put("characterId", testCharacterId);
        requestBody.put("parameters", parameters);

        // 执行请求
        mockMvc.perform(post("/api/skills/execute")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(requestBody)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.success").value(true))
                .andExpect(jsonPath("$.data.skillId").value("test-execution-skill"))
                .andExpect(jsonPath("$.data.executionTimeMs").value(150))
                .andExpect(jsonPath("$.data.result.status").value("success"));
    }

    @Test
    @WithMockUser(username = "testuser", authorities = {"ROLE_USER"})
    void testExecuteSkill_ExecutionError() throws Exception {
        // 准备执行结果（失败）
        SkillExecutor.SkillExecutionResult errorResult = SkillExecutor.SkillExecutionResult.builder()
            .skillId("test-execution-skill")
            .success(false)
            .errorMessage("技能执行失败：参数错误")
            .executionTimeMs(50)
            .build();

        // Mock SkillExecutor
        when(skillExecutor.execute(
            eq("test-execution-skill"),
            any(Map.class),
            any(SkillExecutor.SkillExecutionContext.class)
        )).thenReturn(errorResult);

        // 准备请求
        Map<String, Object> parameters = new HashMap<>();
        parameters.put("action", "invalid");
        
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("skillId", "test-execution-skill");
        requestBody.put("characterId", testCharacterId);
        requestBody.put("parameters", parameters);

        // 执行请求
        mockMvc.perform(post("/api/skills/execute")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(requestBody)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(500))
                .andExpect(jsonPath("$.message").value("技能执行失败：参数错误"));
    }

    @Test
    @WithMockUser(username = "testuser", authorities = {"ROLE_USER"})
    void testExecuteSkill_SkillNotFound() throws Exception {
        // Mock SkillExecutor 抛出异常
        when(skillExecutor.execute(
            eq("non-existent-skill"),
            any(Map.class),
            any(SkillExecutor.SkillExecutionContext.class)
        )).thenThrow(new SkillExecutor.SkillNotFoundException("技能不存在: non-existent-skill"));

        // 准备请求
        Map<String, Object> parameters = new HashMap<>();
        parameters.put("action", "test");
        
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("skillId", "non-existent-skill");
        requestBody.put("characterId", testCharacterId);
        requestBody.put("parameters", parameters);

        // 执行请求
        mockMvc.perform(post("/api/skills/execute")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(requestBody)))
                .andExpect(status().is5xxServerError());
    }

    @Test
    @WithMockUser(username = "testuser", authorities = {"ROLE_USER"})
    void testExecuteSkill_InvalidParameters() throws Exception {
        // Mock SkillExecutor 抛出参数验证异常
        when(skillExecutor.execute(
            eq("test-execution-skill"),
            any(Map.class),
            any(SkillExecutor.SkillExecutionContext.class)
        )).thenThrow(new IllegalArgumentException("参数验证失败: action 参数必填"));

        // 准备请求（缺少必填参数）
        Map<String, Object> parameters = new HashMap<>();
        parameters.put("param1", "value1"); // 缺少 action
        
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("skillId", "test-execution-skill");
        requestBody.put("characterId", testCharacterId);
        requestBody.put("parameters", parameters);

        // 执行请求
        mockMvc.perform(post("/api/skills/execute")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(requestBody)))
                .andExpect(status().is5xxServerError());
    }

    @Test
    @WithMockUser(username = "testuser", authorities = {"ROLE_USER"})
    void testExecuteSkill_UsageLimitExceeded() throws Exception {
        // Mock SkillExecutor 抛出使用限制异常
        when(skillExecutor.execute(
            eq("test-execution-skill"),
            any(Map.class),
            any(SkillExecutor.SkillExecutionContext.class)
        )).thenThrow(new SkillExecutor.SkillUsageLimitExceededException(
            "技能 test-execution-skill 今日使用次数已达上限: 10"
        ));

        // 准备请求
        Map<String, Object> parameters = new HashMap<>();
        parameters.put("action", "test");
        
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("skillId", "test-execution-skill");
        requestBody.put("characterId", testCharacterId);
        requestBody.put("parameters", parameters);

        // 执行请求
        mockMvc.perform(post("/api/skills/execute")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(requestBody)))
                .andExpect(status().is5xxServerError());
    }

    @Test
    @WithMockUser(username = "testuser", authorities = {"ROLE_USER"})
    void testExecuteSkill_WithAdditionalContext() throws Exception {
        // 准备执行结果
        Map<String, Object> resultMap = new HashMap<>();
        resultMap.put("status", "success");
        resultMap.put("contextUsed", true);
        
        SkillExecutor.SkillExecutionResult successResult = SkillExecutor.SkillExecutionResult.builder()
            .skillId("test-execution-skill")
            .success(true)
            .result(resultMap)
            .executionTimeMs(200)
            .build();

        // Mock SkillExecutor
        when(skillExecutor.execute(
            eq("test-execution-skill"),
            any(Map.class),
            any(SkillExecutor.SkillExecutionContext.class)
        )).thenReturn(successResult);

        // 准备请求（包含额外上下文）
        Map<String, Object> parameters = new HashMap<>();
        parameters.put("action", "test");
        
        Map<String, Object> additionalContext = new HashMap<>();
        additionalContext.put("sessionId", "session-123");
        additionalContext.put("timestamp", "2025-01-04");
        
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("skillId", "test-execution-skill");
        requestBody.put("characterId", testCharacterId);
        requestBody.put("parameters", parameters);
        requestBody.put("additionalContext", additionalContext);

        // 执行请求
        mockMvc.perform(post("/api/skills/execute")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(requestBody)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.success").value(true));
    }

    @Test
    @WithMockUser(username = "testuser", authorities = {"ROLE_USER"})
    void testExecuteSkill_MissingRequiredFields() throws Exception {
        // 准备请求（缺少必填字段）
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("characterId", testCharacterId);
        // 缺少 skillId 和 parameters

        // 执行请求（应该返回 400 Bad Request）
        mockMvc.perform(post("/api/skills/execute")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(requestBody)))
                .andExpect(status().is4xxClientError());
    }
}
