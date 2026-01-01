package com.heartsphere.memory.integration;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.heartsphere.dto.LoginRequest;
import com.heartsphere.memory.dto.SaveMemoryRequest;
import com.heartsphere.memory.model.MemoryImportance;
import com.heartsphere.memory.model.MemorySource;
import com.heartsphere.memory.model.MemoryType;
import com.heartsphere.memory.repository.jpa.UserMemoryRepository;
import com.heartsphere.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * 记忆API完整集成测试
 * 测试记忆系统的完整流程，包括保存、搜索、批量操作等
 * 
 * @author HeartSphere
 * @date 2025-12-31
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
public class MemoryAPIIntegrationTest {
    
    @Autowired
    private MockMvc mockMvc;
    
    @Autowired
    private ObjectMapper objectMapper;
    
    @Autowired
    private UserMemoryRepository userMemoryRepository;
    
    // 测试账号配置
    private static final Map<String, String> TEST_ACCOUNTS = Map.of(
        "tongyexin", "123456",
        "ty1", "Tyx@1234",
        "heartsphere", "Tyx@1234"
    );
    
    private String currentUserId;
    private String currentUsername;
    private String authToken;
    
    @BeforeEach
    public void setUp() throws Exception {
        // 使用第一个测试账号
        currentUsername = TEST_ACCOUNTS.keySet().iterator().next();
        String password = TEST_ACCOUNTS.get(currentUsername);
        
        // 登录获取token和用户ID
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setUsername(currentUsername);
        loginRequest.setPassword(password);
        
        MvcResult loginResult = mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andReturn();
        
        String loginResponse = loginResult.getResponse().getContentAsString();
        JsonNode loginJson = objectMapper.readTree(loginResponse);
        currentUserId = loginJson.get("id").asText();
        authToken = loginJson.has("token") ? loginJson.get("token").asText() : "";
        
        // 清理该用户的测试记忆数据
        userMemoryRepository.findByUserIdOrderByCreatedAtDesc(currentUserId)
            .forEach(userMemoryRepository::delete);
    }
    
    /**
     * 辅助方法：将对象转换为JSON字符串
     */
    private String asJsonString(Object obj) {
        try {
            return objectMapper.writeValueAsString(obj);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
    
    /**
     * 测试完整的记忆生命周期：保存 -> 搜索 -> 验证数据库
     */
    @Test
    public void testCompleteMemoryLifecycle() throws Exception {
        // 1. 保存记忆
        SaveMemoryRequest saveRequest = new SaveMemoryRequest();
        saveRequest.setMemoryType(MemoryType.PREFERENCE);
        saveRequest.setImportance(MemoryImportance.IMPORTANT);
        saveRequest.setContent("用户喜欢在周末去公园散步");
        saveRequest.setSource(MemorySource.JOURNAL);
        saveRequest.setSourceId("journal-lifecycle-test");
        saveRequest.setConfidence(0.9);
        saveRequest.setTags(Arrays.asList("运动", "休闲", "周末"));
        
        MvcResult saveResult = mockMvc.perform(post("/api/memory/v1/users/{userId}/memories", currentUserId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(asJsonString(saveRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.id").exists())
                .andReturn();
        
        // 2. 获取保存的记忆ID
        String saveResponse = saveResult.getResponse().getContentAsString();
        JsonNode saveJson = objectMapper.readTree(saveResponse);
        String memoryId = saveJson.get("data").get("id").asText();
        
        // 3. 验证数据库中有这条记录
        assertTrue(userMemoryRepository.findById(memoryId).isPresent(),
            "记忆应该已保存到数据库");
        
        userMemoryRepository.findById(memoryId).ifPresent(entity -> {
            assertEquals(currentUserId, entity.getUserId());
            assertEquals("用户喜欢在周末去公园散步", entity.getContent());
            assertEquals(MemoryType.PREFERENCE, entity.getType());
        });
        
        // 4. 搜索记忆
        MvcResult searchResult = mockMvc.perform(get("/api/memory/v1/users/{userId}/memories/search", currentUserId)
                .param("query", "散步")
                .param("limit", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data").isArray())
                .andReturn();
        
        // 5. 验证搜索结果
        String searchResponse = searchResult.getResponse().getContentAsString();
        JsonNode searchJson = objectMapper.readTree(searchResponse);
        JsonNode memories = searchJson.get("data");
        
        assertTrue(memories.size() > 0, "应该找到包含'散步'的记忆");
        
        boolean found = false;
        for (JsonNode memory : memories) {
            if (memory.get("id").asText().equals(memoryId)) {
                found = true;
                assertEquals("用户喜欢在周末去公园散步", memory.get("content").asText());
                break;
            }
        }
        assertTrue(found, "搜索结果应该包含刚保存的记忆");
    }
    
    /**
     * 测试批量保存不同类型的记忆
     */
    @Test
    public void testBatchSaveDifferentMemoryTypes() throws Exception {
        // Given - 准备不同类型的记忆
        List<SaveMemoryRequest> requests = new ArrayList<>();
        
        // 个人信息
        SaveMemoryRequest personalInfo = new SaveMemoryRequest();
        personalInfo.setMemoryType(MemoryType.PERSONAL_INFO);
        personalInfo.setImportance(MemoryImportance.CORE);
        personalInfo.setContent("用户的职业是软件工程师");
        personalInfo.setSource(MemorySource.CONVERSATION);
        personalInfo.setConfidence(0.95);
        requests.add(personalInfo);
        
        // 偏好
        SaveMemoryRequest preference = new SaveMemoryRequest();
        preference.setMemoryType(MemoryType.PREFERENCE);
        preference.setImportance(MemoryImportance.IMPORTANT);
        preference.setContent("用户喜欢使用Mac电脑");
        preference.setSource(MemorySource.JOURNAL);
        preference.setConfidence(0.85);
        requests.add(preference);
        
        // 情感经历
        SaveMemoryRequest emotion = new SaveMemoryRequest();
        emotion.setMemoryType(MemoryType.EMOTIONAL_EXPERIENCE);
        emotion.setImportance(MemoryImportance.NORMAL);
        emotion.setContent("用户对完成项目感到自豪");
        emotion.setSource(MemorySource.CONVERSATION);
        emotion.setConfidence(0.8);
        requests.add(emotion);
        
        // 习惯
        SaveMemoryRequest habit = new SaveMemoryRequest();
        habit.setMemoryType(MemoryType.HABIT);
        habit.setImportance(MemoryImportance.IMPORTANT);
        habit.setContent("用户习惯每天早上7点起床");
        habit.setSource(MemorySource.JOURNAL);
        habit.setConfidence(0.9);
        requests.add(habit);
        
        // When - 批量保存
        MvcResult result = mockMvc.perform(post("/api/memory/v1/users/{userId}/memories/batch", currentUserId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(asJsonString(requests)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.length()").value(4))
                .andReturn();
        
        // Then - 验证数据库
        long count = userMemoryRepository.countByUserId(currentUserId);
        assertEquals(4, count, "数据库应该有4条记忆记录");
        
        // 验证每种类型的数量
        assertEquals(1, userMemoryRepository.countByUserIdAndType(currentUserId, MemoryType.PERSONAL_INFO));
        assertEquals(1, userMemoryRepository.countByUserIdAndType(currentUserId, MemoryType.PREFERENCE));
        assertEquals(1, userMemoryRepository.countByUserIdAndType(currentUserId, MemoryType.EMOTIONAL_EXPERIENCE));
        assertEquals(1, userMemoryRepository.countByUserIdAndType(currentUserId, MemoryType.HABIT));
    }
    
    /**
     * 测试搜索不同重要性的记忆
     */
    @Test
    public void testSearchMemoriesByImportance() throws Exception {
        // Given - 保存不同重要性的记忆
        List<SaveMemoryRequest> requests = new ArrayList<>();
        
        SaveMemoryRequest core = new SaveMemoryRequest();
        core.setMemoryType(MemoryType.PERSONAL_INFO);
        core.setImportance(MemoryImportance.CORE);
        core.setContent("核心记忆：用户的基本信息");
        core.setSource(MemorySource.CONVERSATION);
        requests.add(core);
        
        SaveMemoryRequest important = new SaveMemoryRequest();
        important.setMemoryType(MemoryType.PREFERENCE);
        important.setImportance(MemoryImportance.IMPORTANT);
        important.setContent("重要记忆：用户的重要偏好");
        important.setSource(MemorySource.JOURNAL);
        requests.add(important);
        
        SaveMemoryRequest normal = new SaveMemoryRequest();
        normal.setMemoryType(MemoryType.EMOTIONAL_EXPERIENCE);
        normal.setImportance(MemoryImportance.NORMAL);
        normal.setContent("普通记忆：用户的日常情感");
        normal.setSource(MemorySource.CONVERSATION);
        requests.add(normal);
        
        mockMvc.perform(post("/api/memory/v1/users/{userId}/memories/batch", currentUserId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(asJsonString(requests)))
                .andExpect(status().isOk());
        
        // When & Then - 验证数据库中不同重要性的数量
        assertEquals(1, userMemoryRepository.countByUserIdAndImportance(currentUserId, MemoryImportance.CORE));
        assertEquals(1, userMemoryRepository.countByUserIdAndImportance(currentUserId, MemoryImportance.IMPORTANT));
        assertEquals(1, userMemoryRepository.countByUserIdAndImportance(currentUserId, MemoryImportance.NORMAL));
        
        // 搜索所有记忆
        MvcResult result = mockMvc.perform(get("/api/memory/v1/users/{userId}/memories/search", currentUserId)
                .param("query", "")
                .param("limit", "100"))
                .andExpect(status().isOk())
                .andReturn();
        
        String response = result.getResponse().getContentAsString();
        JsonNode json = objectMapper.readTree(response);
        JsonNode memories = json.get("data");
        
        assertEquals(3, memories.size(), "应该返回3条记忆");
    }
    
    /**
     * 测试所有测试账号
     */
    @Test
    public void testAllTestAccounts() throws Exception {
        for (Map.Entry<String, String> account : TEST_ACCOUNTS.entrySet()) {
            String username = account.getKey();
            String password = account.getValue();
            
            // 登录
            LoginRequest loginRequest = new LoginRequest();
            loginRequest.setUsername(username);
            loginRequest.setPassword(password);
            
            MvcResult loginResult = mockMvc.perform(post("/api/auth/login")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(asJsonString(loginRequest)))
                    .andExpect(status().isOk())
                    .andReturn();
            
            String loginResponse = loginResult.getResponse().getContentAsString();
            JsonNode loginJson = objectMapper.readTree(loginResponse);
            String userId = loginJson.get("id").asText();
            
            // 保存记忆
            SaveMemoryRequest request = new SaveMemoryRequest();
            request.setMemoryType(MemoryType.PREFERENCE);
            request.setImportance(MemoryImportance.IMPORTANT);
            request.setContent("测试记忆 - " + username);
            request.setSource(MemorySource.CONVERSATION);
            request.setConfidence(0.8);
            
            mockMvc.perform(post("/api/memory/v1/users/{userId}/memories", userId)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(asJsonString(request)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.code").value(200));
            
            // 验证数据库
            long count = userMemoryRepository.countByUserId(userId);
            assertTrue(count > 0, "用户 " + username + " 应该有记忆记录");
            
            // 搜索记忆
            mockMvc.perform(get("/api/memory/v1/users/{userId}/memories/search", userId)
                    .param("query", username)
                    .param("limit", "10"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.code").value(200))
                    .andExpect(jsonPath("$.data").isArray());
            
            // 清理
            userMemoryRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .forEach(userMemoryRepository::delete);
        }
    }
    
    /**
     * 测试记忆的完整字段验证
     */
    @Test
    public void testMemoryFieldsValidation() throws Exception {
        // Given - 创建包含所有字段的记忆
        SaveMemoryRequest request = new SaveMemoryRequest();
        request.setMemoryType(MemoryType.PREFERENCE);
        request.setImportance(MemoryImportance.IMPORTANT);
        request.setContent("完整的记忆内容");
        request.setSource(MemorySource.JOURNAL);
        request.setSourceId("journal-full-test");
        request.setConfidence(0.92);
        request.setTags(Arrays.asList("标签1", "标签2", "标签3"));
        
        Map<String, Object> metadata = new HashMap<>();
        metadata.put("key1", "value1");
        metadata.put("key2", 123);
        request.setMetadata(metadata);
        
        Map<String, Object> structuredData = new HashMap<>();
        structuredData.put("field1", "data1");
        structuredData.put("field2", true);
        request.setStructuredData(structuredData);
        
        // When
        MvcResult result = mockMvc.perform(post("/api/memory/v1/users/{userId}/memories", currentUserId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(asJsonString(request)))
                .andExpect(status().isOk())
                .andReturn();
        
        // Then - 验证所有字段
        String response = result.getResponse().getContentAsString();
        JsonNode json = objectMapper.readTree(response);
        JsonNode memory = json.get("data");
        String memoryId = memory.get("id").asText();
        
        // 验证数据库中的完整数据
        userMemoryRepository.findById(memoryId).ifPresent(entity -> {
            assertEquals(MemoryType.PREFERENCE, entity.getType());
            assertEquals(MemoryImportance.IMPORTANT, entity.getImportance());
            assertEquals("完整的记忆内容", entity.getContent());
            assertEquals(MemorySource.JOURNAL, entity.getSource());
            assertEquals("journal-full-test", entity.getSourceId());
            assertEquals(0.92, entity.getConfidence(), 0.01);
            assertNotNull(entity.getTags());
            assertNotNull(entity.getMetadata());
            assertNotNull(entity.getStructuredData());
            assertNotNull(entity.getCreatedAt());
            assertNotNull(entity.getLastAccessedAt());
            assertEquals(0, entity.getAccessCount());
        });
    }
}
