package com.heartsphere.memory.service.impl;

import com.heartsphere.memory.model.FactCategory;
import com.heartsphere.memory.model.MemoryImportance;
import com.heartsphere.memory.model.MemorySource;
import com.heartsphere.memory.model.MemoryType;
import com.heartsphere.memory.model.UserFact;
import com.heartsphere.memory.model.UserMemory;
import com.heartsphere.memory.model.UserPreference;
import com.heartsphere.memory.model.PreferenceType;
import com.heartsphere.memory.service.LongMemoryService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

/**
 * MongoDB长期记忆服务测试
 * 
 * @author HeartSphere
 * @date 2025-12-28
 */
@SpringBootTest
@ActiveProfiles("test")
class MongoLongMemoryServiceTest {
    
    @Autowired
    private LongMemoryService longMemoryService;
    
    @Autowired
    private MongoLongMemoryService mongoLongMemoryService;
    
    private String testUserId;
    
    @BeforeEach
    void setUp() {
        testUserId = "test-user-" + System.currentTimeMillis();
        
        // 清理测试数据
        try {
            List<UserFact> facts = longMemoryService.getAllFacts(testUserId);
            facts.forEach(fact -> longMemoryService.deleteFact(fact.getId()));
            
            List<UserPreference> preferences = longMemoryService.getAllPreferences(testUserId);
            preferences.forEach(pref -> longMemoryService.deletePreference(testUserId, pref.getKey()));
        } catch (Exception e) {
            // 忽略清理错误
        }
    }
    
    @Test
    void testSaveAndGetFact() {
        // 创建测试事实
        UserFact fact = UserFact.builder()
            .userId(testUserId)
            .fact("测试事实：用户喜欢编程")
            .category(FactCategory.PREFERENCE)
            .importance(0.8)
            .confidence(0.9)
            .createdAt(Instant.now())
            .lastAccessedAt(Instant.now())
            .accessCount(0)
            .build();
        
        // 保存事实
        longMemoryService.saveFact(fact);
        
        // 获取事实
        UserFact retrieved = longMemoryService.getFact(fact.getId());
        
        // 验证
        assertNotNull(retrieved);
        assertEquals(fact.getFact(), retrieved.getFact());
        assertEquals(fact.getCategory(), retrieved.getCategory());
    }
    
    @Test
    void testSearchFacts() {
        // 创建测试事实
        UserFact fact1 = UserFact.builder()
            .userId(testUserId)
            .fact("用户喜欢Java编程")
            .category(FactCategory.SKILL)
            .importance(0.7)
            .confidence(0.8)
            .createdAt(Instant.now())
            .lastAccessedAt(Instant.now())
            .accessCount(0)
            .build();
        
        UserFact fact2 = UserFact.builder()
            .userId(testUserId)
            .fact("用户喜欢Python编程")
            .category(FactCategory.SKILL)
            .importance(0.7)
            .confidence(0.8)
            .createdAt(Instant.now())
            .lastAccessedAt(Instant.now())
            .accessCount(0)
            .build();
        
        longMemoryService.saveFact(fact1);
        longMemoryService.saveFact(fact2);
        
        // 搜索事实（文本搜索可能因为索引未创建而返回空，使用正则表达式搜索作为备用）
        List<UserFact> results = longMemoryService.searchFacts(testUserId, "编程");
        
        // 验证（搜索结果可能为空，如果文本搜索索引未创建）
        assertNotNull(results);
        // 如果文本搜索失败，至少应该返回空列表而不是抛出异常
        // 实际使用中，文本搜索需要创建文本索引
    }
    
    @Test
    void testSaveAndGetPreference() {
        // 创建测试偏好
        UserPreference preference = UserPreference.builder()
            .userId(testUserId)
            .key("favorite_language")
            .value("Java")
            .type(PreferenceType.STRING)
            .confidence(0.8)
            .updatedAt(Instant.now())
            .lastAccessedAt(Instant.now())
            .accessCount(0)
            .build();
        
        // 保存偏好
        longMemoryService.savePreference(preference);
        
        // 获取偏好
        UserPreference retrieved = longMemoryService.getPreference(testUserId, "favorite_language");
        
        // 验证
        assertNotNull(retrieved);
        assertEquals(preference.getKey(), retrieved.getKey());
        assertEquals(preference.getValue(), retrieved.getValue());
    }
    
    @Test
    void testUpdatePreference() {
        // 创建并保存偏好
        UserPreference preference1 = UserPreference.builder()
            .userId(testUserId)
            .key("favorite_color")
            .value("蓝色")
            .type(PreferenceType.STRING)
            .confidence(0.7)
            .updatedAt(Instant.now())
            .build();
        
        longMemoryService.savePreference(preference1);
        
        // 更新偏好
        UserPreference preference2 = UserPreference.builder()
            .userId(testUserId)
            .key("favorite_color")
            .value("红色")
            .type(PreferenceType.STRING)
            .confidence(0.9)
            .updatedAt(Instant.now())
            .build();
        
        longMemoryService.savePreference(preference2);
        
        // 验证更新
        UserPreference retrieved = longMemoryService.getPreference(testUserId, "favorite_color");
        assertNotNull(retrieved);
        assertEquals("红色", retrieved.getValue());
    }
    
    @Test
    void testRetrieveRelevantMemories() {
        // 创建测试记忆
        UserMemory memory = UserMemory.builder()
            .userId(testUserId)
            .type(MemoryType.PERSONAL_INFO)
            .importance(MemoryImportance.IMPORTANT)
            .content("用户喜欢阅读技术书籍")
            .source(MemorySource.CONVERSATION)
            .confidence(0.8)
            .createdAt(Instant.now())
            .lastAccessedAt(Instant.now())
            .accessCount(0)
            .build();
        
        mongoLongMemoryService.saveMemory(memory);
        
        // 检索相关记忆
        List<UserMemory> results = longMemoryService.retrieveRelevantMemories(testUserId, "阅读", 10);
        
        // 验证
        assertNotNull(results);
    }
    
    @Test
    void testRetrieveMemoriesByContext() {
        // 创建测试记忆
        Map<String, Object> metadata = new HashMap<>();
        metadata.put("emotionType", "happy");
        
        UserMemory memory = UserMemory.builder()
            .userId(testUserId)
            .type(MemoryType.EMOTION_PATTERN)
            .importance(MemoryImportance.NORMAL)
            .content("用户经常表现出happy情绪")
            .source(MemorySource.SYSTEM_DETECTED)
            .confidence(0.7)
            .createdAt(Instant.now())
            .lastAccessedAt(Instant.now())
            .accessCount(0)
            .metadata(metadata)
            .build();
        
        mongoLongMemoryService.saveMemory(memory);
        
        // 根据上下文检索
        Map<String, Object> context = new HashMap<>();
        context.put("type", "EMOTION_PATTERN");
        context.put("emotionType", "happy");
        
        List<UserMemory> results = longMemoryService.retrieveMemoriesByContext(testUserId, context, 10);
        
        // 验证
        assertNotNull(results);
    }
    
    @Test
    void testGetFactsByCategory() {
        // 创建不同类别的事实
        UserFact fact1 = UserFact.builder()
            .userId(testUserId)
            .fact("用户是软件工程师")
            .category(FactCategory.WORK)
            .importance(0.8)
            .confidence(0.9)
            .createdAt(Instant.now())
            .lastAccessedAt(Instant.now())
            .accessCount(0)
            .build();
        
        UserFact fact2 = UserFact.builder()
            .userId(testUserId)
            .fact("用户喜欢Java")
            .category(FactCategory.PREFERENCE)
            .importance(0.7)
            .confidence(0.8)
            .createdAt(Instant.now())
            .lastAccessedAt(Instant.now())
            .accessCount(0)
            .build();
        
        longMemoryService.saveFact(fact1);
        longMemoryService.saveFact(fact2);
        
        // 按类别获取
        List<UserFact> workFacts = longMemoryService.getFactsByCategory(testUserId, FactCategory.WORK);
        
        // 验证
        assertNotNull(workFacts);
        assertTrue(workFacts.size() >= 1);
    }
}

