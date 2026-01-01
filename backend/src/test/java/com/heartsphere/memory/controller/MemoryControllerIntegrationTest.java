package com.heartsphere.memory.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.heartsphere.controller.BaseControllerTest;
import com.heartsphere.dto.LoginRequest;
import com.heartsphere.memory.dto.SaveMemoryRequest;
import com.heartsphere.memory.model.MemoryImportance;
import com.heartsphere.memory.model.MemorySource;
import com.heartsphere.memory.model.MemoryType;
import com.heartsphere.memory.repository.jpa.UserMemoryRepository;
import com.heartsphere.repository.UserRepository;
import com.heartsphere.security.UserDetailsImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * MemoryController集成测试
 * 使用真实数据库和测试账号进行测试
 * 
 * @author HeartSphere
 * @date 2025-12-31
 */
@Transactional
public class MemoryControllerIntegrationTest extends BaseControllerTest {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private UserMemoryRepository userMemoryRepository;
    
    @Autowired
    private ObjectMapper objectMapper;
    
    // 测试账号信息
    private static final String[] TEST_USERS = {
        "tongyexin",      // 密码: 123456
        "ty1",            // 密码: Tyx@1234
        "heartsphere"     // 密码: Tyx@1234
    };
    
    private String currentUserId;
    private String currentUsername;
    
    @BeforeEach
    public void setUp() throws Exception {
        // 使用第一个测试账号进行测试
        currentUsername = TEST_USERS[0];
        
        // 登录并获取用户ID
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setUsername(currentUsername);
        loginRequest.setPassword("123456");
        
        MvcResult loginResult = mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(asJsonString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").exists())
                .andReturn();
        
        // 解析登录响应获取用户ID
        String loginResponse = loginResult.getResponse().getContentAsString();
        JsonNode loginJson = objectMapper.readTree(loginResponse);
        currentUserId = loginJson.get("id").asText();
        
        // 从数据库获取用户并设置认证上下文
        userRepository.findById(Long.parseLong(currentUserId)).ifPresent(user -> {
            UserDetailsImpl userDetails = UserDetailsImpl.build(user);
            Authentication authentication = new UsernamePasswordAuthenticationToken(
                userDetails, null, userDetails.getAuthorities());
            SecurityContextHolder.getContext().setAuthentication(authentication);
        });
        
        // 清理该用户的测试记忆数据
        userMemoryRepository.findByUserIdOrderByCreatedAtDesc(currentUserId)
            .forEach(userMemoryRepository::delete);
    }
    
    /**
     * 测试保存单个记忆
     */
    @Test
    public void testSaveMemory() throws Exception {
        // Given
        SaveMemoryRequest request = new SaveMemoryRequest();
        request.setMemoryType(MemoryType.PREFERENCE);
        request.setImportance(MemoryImportance.IMPORTANT);
        request.setContent("用户喜欢看电影");
        request.setSource(MemorySource.JOURNAL);
        request.setSourceId("journal-1");
        request.setConfidence(0.9);
        request.setTags(Arrays.asList("电影", "娱乐"));
        
        // When
        MvcResult result = mockMvc.perform(post("/api/memory/v1/users/{userId}/memories", currentUserId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(asJsonString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data").exists())
                .andExpect(jsonPath("$.data.id").exists())
                .andExpect(jsonPath("$.data.userId").value(currentUserId))
                .andExpect(jsonPath("$.data.content").value("用户喜欢看电影"))
                .andExpect(jsonPath("$.data.type").value("PREFERENCE"))
                .andExpect(jsonPath("$.data.importance").value("IMPORTANT"))
                .andReturn();
        
        // Then - 验证数据库中的数据
        String responseContent = result.getResponse().getContentAsString();
        JsonNode responseJson = objectMapper.readTree(responseContent);
        String memoryId = responseJson.get("data").get("id").asText();
        
        assertTrue(userMemoryRepository.findById(memoryId).isPresent(), 
            "记忆应该已保存到数据库");
        
        userMemoryRepository.findById(memoryId).ifPresent(entity -> {
            assertEquals(currentUserId, entity.getUserId(), "用户ID应该匹配");
            assertEquals("用户喜欢看电影", entity.getContent(), "内容应该匹配");
            assertEquals(MemoryType.PREFERENCE, entity.getType(), "类型应该匹配");
            assertEquals(MemoryImportance.IMPORTANT, entity.getImportance(), "重要性应该匹配");
            assertEquals(MemorySource.JOURNAL, entity.getSource(), "来源应该匹配");
        });
    }
    
    /**
     * 测试批量保存记忆
     */
    @Test
    public void testSaveMemoriesBatch() throws Exception {
        // Given
        List<SaveMemoryRequest> requests = new ArrayList<>();
        
        SaveMemoryRequest request1 = new SaveMemoryRequest();
        request1.setMemoryType(MemoryType.PERSONAL_INFO);
        request1.setImportance(MemoryImportance.CORE);
        request1.setContent("用户的生日是1990年1月1日");
        request1.setSource(MemorySource.CONVERSATION);
        request1.setConfidence(0.95);
        requests.add(request1);
        
        SaveMemoryRequest request2 = new SaveMemoryRequest();
        request2.setMemoryType(MemoryType.PREFERENCE);
        request2.setImportance(MemoryImportance.IMPORTANT);
        request2.setContent("用户喜欢喝咖啡");
        request2.setSource(MemorySource.JOURNAL);
        request2.setSourceId("journal-2");
        request2.setConfidence(0.85);
        requests.add(request2);
        
        // When
        MvcResult result = mockMvc.perform(post("/api/memory/v1/users/{userId}/memories/batch", currentUserId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(asJsonString(requests)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data.length()").value(2))
                .andReturn();
        
        // Then - 验证数据库中的数据
        String responseContent = result.getResponse().getContentAsString();
        JsonNode responseJson = objectMapper.readTree(responseContent);
        JsonNode memoriesArray = responseJson.get("data");
        
        assertEquals(2, memoriesArray.size(), "应该保存2条记忆");
        
        List<String> memoryIds = new ArrayList<>();
        for (JsonNode memory : memoriesArray) {
            memoryIds.add(memory.get("id").asText());
            assertTrue(userMemoryRepository.findById(memory.get("id").asText()).isPresent(),
                "记忆应该已保存到数据库: " + memory.get("id").asText());
        }
        
        // 验证数据库中的记录数
        long count = userMemoryRepository.countByUserId(currentUserId);
        assertEquals(2, count, "数据库应该有2条记忆记录");
    }
    
    /**
     * 测试搜索记忆
     */
    @Test
    public void testSearchMemories() throws Exception {
        // Given - 先保存一些记忆
        List<SaveMemoryRequest> requests = new ArrayList<>();
        
        SaveMemoryRequest request1 = new SaveMemoryRequest();
        request1.setMemoryType(MemoryType.PREFERENCE);
        request1.setImportance(MemoryImportance.IMPORTANT);
        request1.setContent("用户喜欢看电影，特别是科幻片");
        request1.setSource(MemorySource.JOURNAL);
        request1.setConfidence(0.9);
        requests.add(request1);
        
        SaveMemoryRequest request2 = new SaveMemoryRequest();
        request2.setMemoryType(MemoryType.PREFERENCE);
        request2.setImportance(MemoryImportance.NORMAL);
        request2.setContent("用户喜欢听音乐");
        request2.setSource(MemorySource.CONVERSATION);
        request2.setConfidence(0.8);
        requests.add(request2);
        
        // 先批量保存
        mockMvc.perform(post("/api/memory/v1/users/{userId}/memories/batch", currentUserId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(asJsonString(requests)))
                .andExpect(status().isOk());
        
        // When - 搜索包含"电影"的记忆
        MvcResult result = mockMvc.perform(get("/api/memory/v1/users/{userId}/memories/search", currentUserId)
                .param("query", "电影")
                .param("limit", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data").isArray())
                .andReturn();
        
        // Then
        String responseContent = result.getResponse().getContentAsString();
        JsonNode responseJson = objectMapper.readTree(responseContent);
        JsonNode memoriesArray = responseJson.get("data");
        
        assertTrue(memoriesArray.size() > 0, "应该找到包含'电影'的记忆");
        
        // 验证返回的记忆包含"电影"
        boolean foundMovie = false;
        for (JsonNode memory : memoriesArray) {
            String content = memory.get("content").asText();
            if (content.contains("电影")) {
                foundMovie = true;
                break;
            }
        }
        assertTrue(foundMovie, "返回的记忆中应该包含'电影'");
    }
    
    /**
     * 测试权限验证 - 尝试访问其他用户的记忆
     */
    @Test
    public void testSaveMemoryWithWrongUserId() throws Exception {
        // Given
        SaveMemoryRequest request = new SaveMemoryRequest();
        request.setMemoryType(MemoryType.PREFERENCE);
        request.setImportance(MemoryImportance.IMPORTANT);
        request.setContent("测试内容");
        request.setSource(MemorySource.CONVERSATION);
        
        String wrongUserId = "99999"; // 不存在的用户ID
        
        // When & Then
        mockMvc.perform(post("/api/memory/v1/users/{userId}/memories", wrongUserId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(asJsonString(request)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").exists())
                .andExpect(jsonPath("$.message").value("无权访问该用户的数据"));
    }
    
    /**
     * 测试搜索记忆 - 空查询
     */
    @Test
    public void testSearchMemoriesWithEmptyQuery() throws Exception {
        // Given - 先保存一些记忆
        SaveMemoryRequest request = new SaveMemoryRequest();
        request.setMemoryType(MemoryType.PREFERENCE);
        request.setImportance(MemoryImportance.IMPORTANT);
        request.setContent("测试记忆内容");
        request.setSource(MemorySource.JOURNAL);
        request.setConfidence(0.9);
        
        mockMvc.perform(post("/api/memory/v1/users/{userId}/memories", currentUserId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(asJsonString(request)))
                .andExpect(status().isOk());
        
        // When - 使用空查询搜索
        MvcResult result = mockMvc.perform(get("/api/memory/v1/users/{userId}/memories/search", currentUserId)
                .param("query", "")
                .param("limit", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data").isArray())
                .andReturn();
        
        // Then
        String responseContent = result.getResponse().getContentAsString();
        JsonNode responseJson = objectMapper.readTree(responseContent);
        JsonNode memoriesArray = responseJson.get("data");
        
        assertTrue(memoriesArray.size() >= 1, "空查询应该返回所有记忆");
    }
    
    /**
     * 测试保存记忆 - 验证所有字段
     */
    @Test
    public void testSaveMemoryWithAllFields() throws Exception {
        // Given
        SaveMemoryRequest request = new SaveMemoryRequest();
        request.setMemoryType(MemoryType.EMOTIONAL_EXPERIENCE);
        request.setImportance(MemoryImportance.CORE);
        request.setContent("用户对某件事感到非常开心");
        request.setSource(MemorySource.JOURNAL);
        request.setSourceId("journal-123");
        request.setConfidence(0.95);
        request.setTags(Arrays.asList("情感", "积极", "开心"));
        
        Map<String, Object> metadata = new HashMap<>();
        metadata.put("emotion", "happiness");
        metadata.put("intensity", 0.9);
        request.setMetadata(metadata);
        
        Map<String, Object> structuredData = new HashMap<>();
        structuredData.put("emotion_type", "positive");
        structuredData.put("event", "special_occasion");
        request.setStructuredData(structuredData);
        
        // When
        MvcResult result = mockMvc.perform(post("/api/memory/v1/users/{userId}/memories", currentUserId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(asJsonString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data").exists())
                .andExpect(jsonPath("$.data.type").value("EMOTIONAL_EXPERIENCE"))
                .andExpect(jsonPath("$.data.importance").value("CORE"))
                .andExpect(jsonPath("$.data.sourceId").value("journal-123"))
                .andExpect(jsonPath("$.data.confidence").value(0.95))
                .andReturn();
        
        // Then - 验证数据库中的数据
        String responseContent = result.getResponse().getContentAsString();
        JsonNode responseJson = objectMapper.readTree(responseContent);
        String memoryId = responseJson.get("data").get("id").asText();
        
        userMemoryRepository.findById(memoryId).ifPresent(entity -> {
            assertEquals(MemoryType.EMOTIONAL_EXPERIENCE, entity.getType());
            assertEquals(MemoryImportance.CORE, entity.getImportance());
            assertEquals("journal-123", entity.getSourceId());
            assertEquals(0.95, entity.getConfidence(), 0.01);
            assertNotNull(entity.getTags());
            assertNotNull(entity.getMetadata());
            assertNotNull(entity.getStructuredData());
        });
    }
    
    /**
     * 测试使用不同测试账号
     */
    @Test
    public void testWithDifferentTestAccounts() throws Exception {
        // 测试所有三个测试账号
        for (String username : TEST_USERS) {
            String password = username.equals("tongyexin") ? "123456" : "Tyx@1234";
            
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
            
            // 为该用户保存一条记忆
            SaveMemoryRequest request = new SaveMemoryRequest();
            request.setMemoryType(MemoryType.PREFERENCE);
            request.setImportance(MemoryImportance.NORMAL);
            request.setContent("测试记忆 - " + username);
            request.setSource(MemorySource.CONVERSATION);
            request.setConfidence(0.8);
            
            mockMvc.perform(post("/api/memory/v1/users/{userId}/memories", userId)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(asJsonString(request)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.code").value(200));
            
            // 验证记忆已保存
            long count = userMemoryRepository.countByUserId(userId);
            assertTrue(count > 0, "用户 " + username + " 应该至少有一条记忆");
            
            // 清理测试数据
            userMemoryRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .forEach(userMemoryRepository::delete);
        }
    }
}
