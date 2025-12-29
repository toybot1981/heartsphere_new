package com.heartsphere.memory.service.impl;

import com.heartsphere.heartconnect.context.ExperienceModeContext;
import com.heartsphere.heartconnect.storage.TemporaryDataStorage;
import com.heartsphere.memory.model.ChatMessage;
import com.heartsphere.memory.model.ConversationContext;
import com.heartsphere.memory.model.UserFact;
import com.heartsphere.memory.model.UserMemory;
import com.heartsphere.memory.model.UserPreference;
import com.heartsphere.memory.model.UserProfile;
import com.heartsphere.memory.model.character.CharacterInteractionMemory;
import com.heartsphere.memory.model.character.CharacterSceneMemory;
import com.heartsphere.memory.service.CharacterMemoryService;
import com.heartsphere.memory.service.LongMemoryService;
import com.heartsphere.memory.service.MemoryExtractor;
import com.heartsphere.memory.service.MemoryManager;
import com.heartsphere.memory.service.ShortMemoryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import org.springframework.scheduling.annotation.Async;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

/**
 * 记忆管理器实现
 * 协调短期和长期记忆，提供统一的记忆访问接口
 * 支持温度感系统的情感记忆管理
 * 
 * @author HeartSphere
 * @date 2025-12-28
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class MemoryManagerImpl implements MemoryManager {
    
    private final ShortMemoryService shortMemoryService;
    private final LongMemoryService longMemoryService;
    private final MemoryExtractor memoryExtractor;
    private final CharacterMemoryService characterMemoryService;
    
    // 用于访问MongoLongMemoryService的saveMemory方法
    private final MongoLongMemoryService mongoLongMemoryService;
    
    @Autowired(required = false)
    private TemporaryDataStorage temporaryDataStorage;
    
    // ========== 消息管理 ==========
    
    @Override
    public void saveMessage(String userId, String sessionId, ChatMessage message) {
        try {
            // 检查是否处于体验模式
            if (ExperienceModeContext.isActive()) {
                Long shareConfigId = ExperienceModeContext.getShareConfigId();
                Long visitorId = ExperienceModeContext.getVisitorId();
                
                if (shareConfigId != null && visitorId != null && temporaryDataStorage != null) {
                    // 体验模式：保存到临时存储
                    message.setUserId(userId);
                    message.setSessionId(sessionId);
                    temporaryDataStorage.save(
                        shareConfigId.toString(),
                        visitorId.toString(),
                        "dialogue",
                        message
                    );
                    log.debug("体验模式：保存消息到临时存储: shareConfigId={}, visitorId={}, sessionId={}", 
                        shareConfigId, visitorId, sessionId);
                    return;
                }
            }
            
            // 正常模式：保存到短期记忆
            message.setUserId(userId);
            message.setSessionId(sessionId);
            shortMemoryService.saveMessage(sessionId, message);
            
            log.debug("保存消息: userId={}, sessionId={}, messageId={}", 
                userId, sessionId, message.getId());
        } catch (Exception e) {
            log.error("保存消息失败: userId={}, sessionId={}", userId, sessionId, e);
            throw new RuntimeException("保存消息失败", e);
        }
    }
    
    @Override
    public ConversationContext getConversationContext(String userId, String sessionId, int messageLimit) {
        try {
            // 1. 获取短期记忆（对话消息）
            List<ChatMessage> messages = shortMemoryService.getMessages(sessionId, messageLimit);
            
            // 2. 获取相关长期记忆
            // 从最近的消息中提取关键词用于检索
            String query = extractQueryFromMessages(messages);
            List<UserMemory> relevantMemories = new ArrayList<>();
            if (query != null && !query.isEmpty()) {
                relevantMemories = longMemoryService.retrieveRelevantMemories(userId, query, 10);
            }
            
            // 3. 获取用户偏好
            List<UserPreference> userPreferences = longMemoryService.getAllPreferences(userId);
            
            // 4. 构建对话上下文
            return ConversationContext.builder()
                .userId(userId)
                .sessionId(sessionId)
                .messages(messages)
                .relevantMemories(relevantMemories)
                .userPreferences(userPreferences)
                .characterInteractionMemories(new ArrayList<>())
                .characterSceneMemories(new ArrayList<>())
                .metadata(new HashMap<>())
                .build();
        } catch (Exception e) {
            log.error("获取对话上下文失败: userId={}, sessionId={}", userId, sessionId, e);
            // 返回空上下文而不是抛出异常
            return ConversationContext.builder()
                .userId(userId)
                .sessionId(sessionId)
                .messages(new ArrayList<>())
                .relevantMemories(new ArrayList<>())
                .userPreferences(new ArrayList<>())
                .characterInteractionMemories(new ArrayList<>())
                .characterSceneMemories(new ArrayList<>())
                .metadata(new HashMap<>())
                .build();
        }
    }
    
    // ========== 角色对话上下文 ==========
    
    @Override
    public ConversationContext getCharacterConversationContext(
            String characterId, String userId, String sessionId, String eraId, int messageLimit) {
        try {
            // 1. 获取短期记忆（对话消息）
            List<ChatMessage> messages = shortMemoryService.getMessages(sessionId, messageLimit);
            
            // 2. 获取相关长期记忆
            String query = extractQueryFromMessages(messages);
            List<UserMemory> relevantMemories = new ArrayList<>();
            if (query != null && !query.isEmpty()) {
                relevantMemories = longMemoryService.retrieveRelevantMemories(userId, query, 10);
            }
            
            // 3. 获取用户偏好
            List<UserPreference> userPreferences = longMemoryService.getAllPreferences(userId);
            
            // 4. 获取角色交互记忆
            List<CharacterInteractionMemory> characterInteractionMemories = new ArrayList<>();
            if (characterId != null && !characterId.isEmpty()) {
                if (eraId != null && !eraId.isEmpty()) {
                    characterInteractionMemories = characterMemoryService.getInteractionMemories(
                        characterId, userId, eraId);
                } else {
                    characterInteractionMemories = characterMemoryService.getInteractionMemories(
                        characterId, userId);
                }
                // 限制数量
                if (characterInteractionMemories.size() > 10) {
                    characterInteractionMemories = characterInteractionMemories.subList(0, 10);
                }
            }
            
            // 5. 获取角色场景记忆
            List<CharacterSceneMemory> characterSceneMemories = new ArrayList<>();
            if (characterId != null && !characterId.isEmpty() && eraId != null && !eraId.isEmpty()) {
                characterSceneMemories = characterMemoryService.getSceneMemories(characterId, eraId);
                // 限制数量
                if (characterSceneMemories.size() > 10) {
                    characterSceneMemories = characterSceneMemories.subList(0, 10);
                }
            }
            
            // 6. 构建角色对话上下文
            return ConversationContext.builder()
                .userId(userId)
                .sessionId(sessionId)
                .characterId(characterId)
                .eraId(eraId)
                .messages(messages)
                .relevantMemories(relevantMemories)
                .userPreferences(userPreferences)
                .characterInteractionMemories(characterInteractionMemories)
                .characterSceneMemories(characterSceneMemories)
                .metadata(new HashMap<>())
                .build();
        } catch (Exception e) {
            log.error("获取角色对话上下文失败: characterId={}, userId={}, sessionId={}", 
                characterId, userId, sessionId, e);
            // 返回空上下文而不是抛出异常
            return ConversationContext.builder()
                .userId(userId)
                .sessionId(sessionId)
                .characterId(characterId)
                .eraId(eraId)
                .messages(new ArrayList<>())
                .relevantMemories(new ArrayList<>())
                .userPreferences(new ArrayList<>())
                .characterInteractionMemories(new ArrayList<>())
                .characterSceneMemories(new ArrayList<>())
                .metadata(new HashMap<>())
                .build();
        }
    }
    
    // ========== 记忆提取 ==========
    
    @Override
    @Async("memoryExtractionExecutor")
    public void extractAndSaveMemories(String userId, String sessionId) {
        try {
            // 检查是否处于体验模式
            if (ExperienceModeContext.isActive()) {
                Long shareConfigId = ExperienceModeContext.getShareConfigId();
                Long visitorId = ExperienceModeContext.getVisitorId();
                
                if (shareConfigId != null && visitorId != null && temporaryDataStorage != null) {
                    // 体验模式：从临时存储获取消息并保存到临时存储
                    List<ChatMessage> messages = temporaryDataStorage.get(
                        shareConfigId.toString(),
                        visitorId.toString(),
                        "dialogue",
                        ChatMessage.class
                    );
                    
                    if (!messages.isEmpty()) {
                        // 提取记忆并保存到临时存储
                        List<UserMemory> memories = memoryExtractor.extractMemories(userId, messages);
                        for (UserMemory memory : memories) {
                            temporaryDataStorage.save(
                                shareConfigId.toString(),
                                visitorId.toString(),
                                "memory",
                                memory
                            );
                        }
                        log.debug("体验模式：提取并保存记忆到临时存储: shareConfigId={}, visitorId={}, count={}", 
                            shareConfigId, visitorId, memories.size());
                    }
                    return;
                }
            }
            
            // 正常模式：异步提取记忆
            CompletableFuture.runAsync(() -> {
                try {
                    // 获取会话消息
                    List<ChatMessage> messages = shortMemoryService.getMessages(sessionId, 100);
                    
                    if (messages.isEmpty()) {
                        return;
                    }
                    
                    // 提取事实
                    List<UserFact> facts = memoryExtractor.extractFacts(userId, messages);
                    if (!facts.isEmpty()) {
                        longMemoryService.saveFacts(facts);
                        log.debug("提取并保存事实: userId={}, count={}", userId, facts.size());
                    }
                    
                    // 提取偏好
                    List<UserPreference> preferences = memoryExtractor.extractPreferences(userId, messages);
                    for (UserPreference preference : preferences) {
                        longMemoryService.savePreference(preference);
                    }
                    log.debug("提取并保存偏好: userId={}, count={}", userId, preferences.size());
                    
                    // 提取记忆
                    List<UserMemory> memories = memoryExtractor.extractMemories(userId, messages);
                    if (!memories.isEmpty()) {
                        // 使用MongoLongMemoryService保存记忆
                        mongoLongMemoryService.saveMemories(memories);
                        log.debug("提取并保存记忆: userId={}, count={}", userId, memories.size());
                    }
                } catch (Exception e) {
                    log.error("异步提取记忆失败: userId={}, sessionId={}", userId, sessionId, e);
                }
            });
        } catch (Exception e) {
            log.error("启动记忆提取失败: userId={}, sessionId={}", userId, sessionId, e);
        }
    }
    
    // ========== 角色记忆提取 ==========
    
    @Override
    @Async("memoryExtractionExecutor")
    public void extractAndSaveCharacterMemories(
            String characterId, String userId, String sessionId, String eraId) {
        try {
            // 检查是否处于体验模式
            if (ExperienceModeContext.isActive()) {
                // 体验模式下暂不支持角色记忆提取
                log.debug("体验模式：跳过角色记忆提取");
                return;
            }
            
            // 异步提取角色记忆
            CompletableFuture.runAsync(() -> {
                try {
                    // 获取会话消息
                    List<ChatMessage> messages = shortMemoryService.getMessages(sessionId, 100);
                    
                    if (messages.isEmpty()) {
                        return;
                    }
                    
                    // 提取角色交互记忆
                    List<CharacterInteractionMemory> interactionMemories = 
                        memoryExtractor.extractCharacterInteractionMemories(characterId, userId, messages);
                    for (CharacterInteractionMemory memory : interactionMemories) {
                        memory.setEraId(eraId);
                        characterMemoryService.saveInteractionMemory(memory);
                    }
                    log.debug("提取并保存角色交互记忆: characterId={}, userId={}, count={}", 
                        characterId, userId, interactionMemories.size());
                    
                    // 提取角色场景记忆（如果有场景ID）
                    if (eraId != null && !eraId.isEmpty()) {
                        List<CharacterSceneMemory> sceneMemories = 
                            memoryExtractor.extractCharacterSceneMemories(characterId, eraId, messages);
                        for (CharacterSceneMemory memory : sceneMemories) {
                            characterMemoryService.saveSceneMemory(memory);
                        }
                        log.debug("提取并保存角色场景记忆: characterId={}, eraId={}, count={}", 
                            characterId, eraId, sceneMemories.size());
                    }
                } catch (Exception e) {
                    log.error("异步提取角色记忆失败: characterId={}, userId={}, sessionId={}", 
                        characterId, userId, sessionId, e);
                }
            });
        } catch (Exception e) {
            log.error("启动角色记忆提取失败: characterId={}, userId={}, sessionId={}", 
                characterId, userId, sessionId, e);
        }
    }
    
    @Override
    public List<UserFact> extractFacts(String userId, List<ChatMessage> messages) {
        try {
            return memoryExtractor.extractFacts(userId, messages);
        } catch (Exception e) {
            log.error("提取事实失败: userId={}", userId, e);
            return new ArrayList<>();
        }
    }
    
    // ========== 记忆检索 ==========
    
    @Override
    public List<UserMemory> retrieveRelevantMemories(String userId, String query, int limit) {
        try {
            return longMemoryService.retrieveRelevantMemories(userId, query, limit);
        } catch (Exception e) {
            log.error("检索相关记忆失败: userId={}, query={}", userId, query, e);
            return new ArrayList<>();
        }
    }
    
    @Override
    public List<UserMemory> retrieveMemoriesByContext(String userId, Map<String, Object> context, int limit) {
        try {
            return longMemoryService.retrieveMemoriesByContext(userId, context, limit);
        } catch (Exception e) {
            log.error("根据上下文检索记忆失败: userId={}, context={}", userId, context, e);
            return new ArrayList<>();
        }
    }
    
    // ========== 用户画像 ==========
    
    @Override
    public UserProfile getUserProfile(String userId) {
        try {
            // 获取用户事实
            List<UserFact> facts = longMemoryService.getAllFacts(userId);
            
            // 获取用户偏好
            List<UserPreference> preferences = longMemoryService.getAllPreferences(userId);
            
            // 获取用户记忆（通过MongoLongMemoryService）
            List<UserMemory> memories = mongoLongMemoryService.getMemoriesByType(userId, null, 100);
            
            // 构建统计信息
            UserProfile.ProfileStatistics statistics = UserProfile.ProfileStatistics.builder()
                .totalFacts(facts.size())
                .totalPreferences(preferences.size())
                .totalMemories(memories.size())
                .coreMemories((int) memories.stream()
                    .filter(m -> m.getImportance() == com.heartsphere.memory.model.MemoryImportance.CORE)
                    .count())
                .importantMemories((int) memories.stream()
                    .filter(m -> m.getImportance() == com.heartsphere.memory.model.MemoryImportance.IMPORTANT)
                    .count())
                .build();
            
            return UserProfile.builder()
                .userId(userId)
                .facts(facts)
                .preferences(preferences)
                .memories(memories)
                .statistics(statistics)
                .build();
        } catch (Exception e) {
            log.error("获取用户画像失败: userId={}", userId, e);
            return UserProfile.builder()
                .userId(userId)
                .facts(new ArrayList<>())
                .preferences(new ArrayList<>())
                .memories(new ArrayList<>())
                .statistics(UserProfile.ProfileStatistics.builder()
                    .totalFacts(0)
                    .totalPreferences(0)
                    .totalMemories(0)
                    .coreMemories(0)
                    .importantMemories(0)
                    .build())
                .build();
        }
    }
    
    /**
     * 保存用户记忆（用于TemperatureMemoryService）
     */
    public void saveMemory(UserMemory memory) {
        try {
            mongoLongMemoryService.saveMemory(memory);
        } catch (Exception e) {
            log.error("保存用户记忆失败: userId={}", memory.getUserId(), e);
            throw new RuntimeException("保存用户记忆失败", e);
        }
    }
    
    /**
     * 批量保存用户记忆（用于TemperatureMemoryService）
     */
    public void saveMemories(List<UserMemory> memories) {
        try {
            mongoLongMemoryService.saveMemories(memories);
        } catch (Exception e) {
            log.error("批量保存用户记忆失败", e);
            throw new RuntimeException("批量保存用户记忆失败", e);
        }
    }
    
    // ========== 辅助方法 ==========
    
    /**
     * 从消息中提取查询关键词
     */
    private String extractQueryFromMessages(List<ChatMessage> messages) {
        if (messages.isEmpty()) {
            return null;
        }
        
        // 取最近几条消息的内容作为查询关键词
        int messageCount = Math.min(3, messages.size());
        StringBuilder query = new StringBuilder();
        
        for (int i = messages.size() - messageCount; i < messages.size(); i++) {
            ChatMessage message = messages.get(i);
            if (message.getContent() != null && !message.getContent().isEmpty()) {
                if (query.length() > 0) {
                    query.append(" ");
                }
                // 只取前50个字符
                String content = message.getContent();
                if (content.length() > 50) {
                    content = content.substring(0, 50);
                }
                query.append(content);
            }
        }
        
        return query.toString();
    }
}

