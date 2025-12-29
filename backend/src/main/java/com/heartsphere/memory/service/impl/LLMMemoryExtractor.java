package com.heartsphere.memory.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.heartsphere.aiagent.dto.request.TextGenerationRequest;
import com.heartsphere.aiagent.dto.response.TextGenerationResponse;
import com.heartsphere.aiagent.service.AIService;
import com.heartsphere.memory.model.*;
import com.heartsphere.memory.model.character.CharacterInteractionMemory;
import com.heartsphere.memory.model.character.CharacterSceneMemory;
import com.heartsphere.memory.service.MemoryExtractor;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

/**
 * LLM记忆提取器实现
 * 使用大模型从对话中提取用户事实、偏好和记忆
 * 
 * @author HeartSphere
 * @date 2025-12-28
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class LLMMemoryExtractor implements MemoryExtractor {
    
    private final AIService aiService;
    private final ObjectMapper objectMapper;
    
    @Value("${heartsphere.memory.extraction.enable-llm-extraction:true}")
    private boolean enableLlmExtraction;
    
    @Value("${heartsphere.memory.long-memory.extraction-confidence-threshold:0.6}")
    private double confidenceThreshold;
    
    // ========== 提取用户事实 ==========
    
    @Override
    public List<UserFact> extractFacts(String userId, List<ChatMessage> messages) {
        if (!enableLlmExtraction || messages == null || messages.isEmpty()) {
            return Collections.emptyList();
        }
        
        try {
            // 构建提取提示词
            String prompt = buildFactExtractionPrompt(messages);
            
            // 调用AI服务
            TextGenerationRequest request = new TextGenerationRequest();
            request.setPrompt(prompt);
            request.setSystemInstruction("你是一个专业的记忆提取专家，擅长从对话中提取用户的事实信息。请以JSON格式返回结果。");
            request.setTemperature(0.3); // 较低温度以获得更一致的结果
            request.setMaxTokens(2000);
            
            TextGenerationResponse response = aiService.generateText(Long.parseLong(userId), request);
            
            // 解析响应
            List<UserFact> facts = parseFactsFromResponse(response.getContent(), userId, messages);
            
            // 验证和清理
            return validateAndCleanFacts(facts);
            
        } catch (Exception e) {
            log.error("LLM提取用户事实失败: userId={}", userId, e);
            return Collections.emptyList();
        }
    }
    
    /**
     * 构建事实提取提示词
     */
    private String buildFactExtractionPrompt(List<ChatMessage> messages) {
        StringBuilder prompt = new StringBuilder();
        prompt.append("请从以下对话中提取用户的事实信息，返回JSON格式。\n\n");
        prompt.append("对话内容：\n");
        
        for (ChatMessage message : messages) {
            if (message.getRole() == MessageRole.USER) {
                prompt.append("用户: ").append(message.getContent()).append("\n");
            }
        }
        
        prompt.append("\n请提取以下类型的事实：\n");
        prompt.append("1. 个人信息：姓名、年龄、生日、职业等\n");
        prompt.append("2. 偏好：喜欢的事物、不喜欢的食物等\n");
        prompt.append("3. 习惯：作息习惯、使用习惯等\n");
        prompt.append("4. 关系：家人、朋友、同事等\n");
        prompt.append("5. 其他重要信息\n\n");
        
        prompt.append("返回格式（JSON数组）：\n");
        prompt.append("[\n");
        prompt.append("  {\n");
        prompt.append("    \"fact\": \"事实描述\",\n");
        prompt.append("    \"category\": \"PERSONAL|PREFERENCE|HABIT|RELATIONSHIP|WORK|HEALTH|FINANCE|LOCATION|CONTACT|SKILL|GOAL|OTHER\",\n");
        prompt.append("    \"importance\": 0.0-1.0,\n");
        prompt.append("    \"confidence\": 0.0-1.0,\n");
        prompt.append("    \"tags\": [\"标签1\", \"标签2\"]\n");
        prompt.append("  }\n");
        prompt.append("]\n");
        
        return prompt.toString();
    }
    
    /**
     * 从AI响应中解析事实
     */
    private List<UserFact> parseFactsFromResponse(String responseContent, String userId, List<ChatMessage> messages) {
        List<UserFact> facts = new ArrayList<>();
        
        try {
            // 尝试提取JSON部分（可能包含markdown代码块）
            String jsonContent = extractJsonFromResponse(responseContent);
            
            // 解析JSON
            JsonNode rootNode = objectMapper.readTree(jsonContent);
            
            if (rootNode.isArray()) {
                for (JsonNode factNode : rootNode) {
                    try {
                        UserFact fact = parseFactNode(factNode, userId, messages);
                        if (fact != null) {
                            facts.add(fact);
                        }
                    } catch (Exception e) {
                        log.warn("解析事实节点失败", e);
                    }
                }
            }
            
        } catch (Exception e) {
            log.error("解析AI响应失败", e);
        }
        
        return facts;
    }
    
    /**
     * 解析单个事实节点
     */
    private UserFact parseFactNode(JsonNode factNode, String userId, List<ChatMessage> messages) {
        try {
            String fact = factNode.has("fact") ? factNode.get("fact").asText() : null;
            if (fact == null || fact.trim().isEmpty()) {
                return null;
            }
            
            // 解析类别
            FactCategory category = FactCategory.OTHER;
            if (factNode.has("category")) {
                try {
                    category = FactCategory.valueOf(factNode.get("category").asText());
                } catch (IllegalArgumentException e) {
                    log.warn("无效的事实类别: {}", factNode.get("category").asText());
                }
            }
            
            // 解析重要性
            double importance = factNode.has("importance") ? 
                factNode.get("importance").asDouble() : 0.5;
            importance = Math.max(0.0, Math.min(1.0, importance));
            
            // 解析置信度
            double confidence = factNode.has("confidence") ? 
                factNode.get("confidence").asDouble() : 0.7;
            confidence = Math.max(0.0, Math.min(1.0, confidence));
            
            // 解析标签
            List<String> tags = new ArrayList<>();
            if (factNode.has("tags") && factNode.get("tags").isArray()) {
                for (JsonNode tagNode : factNode.get("tags")) {
                    tags.add(tagNode.asText());
                }
            }
            
            // 获取来源会话ID（从消息中提取）
            String sourceSessionId = messages.stream()
                .map(ChatMessage::getSessionId)
                .filter(Objects::nonNull)
                .findFirst()
                .orElse(null);
            
            return UserFact.builder()
                .userId(userId)
                .fact(fact)
                .category(category)
                .importance(importance)
                .confidence(confidence)
                .sourceSessionId(sourceSessionId)
                .createdAt(Instant.now())
                .lastAccessedAt(Instant.now())
                .accessCount(0)
                .tags(tags)
                .build();
                
        } catch (Exception e) {
            log.error("解析事实节点失败", e);
            return null;
        }
    }
    
    // ========== 提取用户偏好 ==========
    
    @Override
    public List<UserPreference> extractPreferences(String userId, List<ChatMessage> messages) {
        if (!enableLlmExtraction || messages == null || messages.isEmpty()) {
            return Collections.emptyList();
        }
        
        try {
            // 构建提取提示词
            String prompt = buildPreferenceExtractionPrompt(messages);
            
            // 调用AI服务
            TextGenerationRequest request = new TextGenerationRequest();
            request.setPrompt(prompt);
            request.setSystemInstruction("你是一个专业的偏好提取专家，擅长从对话中提取用户的偏好信息。请以JSON格式返回结果。");
            request.setTemperature(0.3);
            request.setMaxTokens(1500);
            
            TextGenerationResponse response = aiService.generateText(Long.parseLong(userId), request);
            
            // 解析响应
            List<UserPreference> preferences = parsePreferencesFromResponse(response.getContent(), userId);
            
            // 验证和清理
            return validateAndCleanPreferences(preferences);
            
        } catch (Exception e) {
            log.error("LLM提取用户偏好失败: userId={}", userId, e);
            return Collections.emptyList();
        }
    }
    
    /**
     * 构建偏好提取提示词
     */
    private String buildPreferenceExtractionPrompt(List<ChatMessage> messages) {
        StringBuilder prompt = new StringBuilder();
        prompt.append("请从以下对话中提取用户的偏好信息，返回JSON格式。\n\n");
        prompt.append("对话内容：\n");
        
        for (ChatMessage message : messages) {
            if (message.getRole() == MessageRole.USER) {
                prompt.append("用户: ").append(message.getContent()).append("\n");
            }
        }
        
        prompt.append("\n请提取以下类型的偏好：\n");
        prompt.append("1. 食物偏好：喜欢的食物、不喜欢的食物等\n");
        prompt.append("2. 活动偏好：喜欢的活动、兴趣爱好等\n");
        prompt.append("3. 时间偏好：偏好的时间段、作息习惯等\n");
        prompt.append("4. 交互偏好：喜欢的对话风格、回应方式等\n");
        prompt.append("5. 其他偏好\n\n");
        
        prompt.append("返回格式（JSON数组）：\n");
        prompt.append("[\n");
        prompt.append("  {\n");
        prompt.append("    \"key\": \"偏好键（如：favorite_food）\",\n");
        prompt.append("    \"value\": \"偏好值\",\n");
        prompt.append("    \"type\": \"STRING|NUMBER|BOOLEAN|JSON|LIST|RATING\",\n");
        prompt.append("    \"confidence\": 0.0-1.0\n");
        prompt.append("  }\n");
        prompt.append("]\n");
        
        return prompt.toString();
    }
    
    /**
     * 从AI响应中解析偏好
     */
    private List<UserPreference> parsePreferencesFromResponse(String responseContent, String userId) {
        List<UserPreference> preferences = new ArrayList<>();
        
        try {
            String jsonContent = extractJsonFromResponse(responseContent);
            JsonNode rootNode = objectMapper.readTree(jsonContent);
            
            if (rootNode.isArray()) {
                for (JsonNode prefNode : rootNode) {
                    try {
                        UserPreference preference = parsePreferenceNode(prefNode, userId);
                        if (preference != null) {
                            preferences.add(preference);
                        }
                    } catch (Exception e) {
                        log.warn("解析偏好节点失败", e);
                    }
                }
            }
            
        } catch (Exception e) {
            log.error("解析AI响应失败", e);
        }
        
        return preferences;
    }
    
    /**
     * 解析单个偏好节点
     */
    private UserPreference parsePreferenceNode(JsonNode prefNode, String userId) {
        try {
            String key = prefNode.has("key") ? prefNode.get("key").asText() : null;
            if (key == null || key.trim().isEmpty()) {
                return null;
            }
            
            // 解析值
            Object value = null;
            if (prefNode.has("value")) {
                JsonNode valueNode = prefNode.get("value");
                if (valueNode.isTextual()) {
                    value = valueNode.asText();
                } else if (valueNode.isNumber()) {
                    value = valueNode.asDouble();
                } else if (valueNode.isBoolean()) {
                    value = valueNode.asBoolean();
                } else {
                    value = valueNode.toString();
                }
            }
            
            // 解析类型
            PreferenceType type = PreferenceType.STRING;
            if (prefNode.has("type")) {
                try {
                    type = PreferenceType.valueOf(prefNode.get("type").asText());
                } catch (IllegalArgumentException e) {
                    log.warn("无效的偏好类型: {}", prefNode.get("type").asText());
                }
            }
            
            // 解析置信度
            double confidence = prefNode.has("confidence") ? 
                prefNode.get("confidence").asDouble() : 0.7;
            confidence = Math.max(0.0, Math.min(1.0, confidence));
            
            return UserPreference.builder()
                .userId(userId)
                .key(key)
                .value(value)
                .type(type)
                .confidence(confidence)
                .updatedAt(Instant.now())
                .lastAccessedAt(Instant.now())
                .accessCount(0)
                .build();
                
        } catch (Exception e) {
            log.error("解析偏好节点失败", e);
            return null;
        }
    }
    
    // ========== 提取用户记忆 ==========
    
    @Override
    public List<UserMemory> extractMemories(String userId, List<ChatMessage> messages) {
        if (!enableLlmExtraction || messages == null || messages.isEmpty()) {
            return Collections.emptyList();
        }
        
        try {
            // 构建提取提示词
            String prompt = buildMemoryExtractionPrompt(messages);
            
            // 调用AI服务
            TextGenerationRequest request = new TextGenerationRequest();
            request.setPrompt(prompt);
            request.setSystemInstruction("你是一个专业的记忆提取专家，擅长从对话中提取重要的用户记忆。请以JSON格式返回结果。");
            request.setTemperature(0.3);
            request.setMaxTokens(2000);
            
            TextGenerationResponse response = aiService.generateText(Long.parseLong(userId), request);
            
            // 解析响应
            return parseMemoriesFromResponse(response.getContent(), userId, messages);
            
        } catch (Exception e) {
            log.error("LLM提取用户记忆失败: userId={}", userId, e);
            return Collections.emptyList();
        }
    }
    
    /**
     * 构建记忆提取提示词
     */
    private String buildMemoryExtractionPrompt(List<ChatMessage> messages) {
        StringBuilder prompt = new StringBuilder();
        prompt.append("请从以下对话中提取重要的用户记忆，返回JSON格式。\n\n");
        prompt.append("对话内容：\n");
        
        for (ChatMessage message : messages) {
            prompt.append(message.getRole().name()).append(": ")
                  .append(message.getContent()).append("\n");
        }
        
        prompt.append("\n请提取以下类型的记忆：\n");
        prompt.append("1. 重要时刻：生日、纪念日、重要事件等\n");
        prompt.append("2. 情感经历：强烈的情感体验\n");
        prompt.append("3. 成长轨迹：用户的成长和变化\n");
        prompt.append("4. 其他重要记忆\n\n");
        
        prompt.append("返回格式（JSON数组）：\n");
        prompt.append("[\n");
        prompt.append("  {\n");
        prompt.append("    \"type\": \"IMPORTANT_MOMENT|EMOTIONAL_EXPERIENCE|GROWTH_TRAJECTORY|...\",\n");
        prompt.append("    \"importance\": \"CORE|IMPORTANT|NORMAL|TEMPORARY\",\n");
        prompt.append("    \"content\": \"记忆内容\",\n");
        prompt.append("    \"confidence\": 0.0-1.0,\n");
        prompt.append("    \"tags\": [\"标签1\", \"标签2\"]\n");
        prompt.append("  }\n");
        prompt.append("]\n");
        
        return prompt.toString();
    }
    
    /**
     * 从AI响应中解析记忆
     */
    private List<UserMemory> parseMemoriesFromResponse(String responseContent, String userId, List<ChatMessage> messages) {
        List<UserMemory> memories = new ArrayList<>();
        
        try {
            String jsonContent = extractJsonFromResponse(responseContent);
            JsonNode rootNode = objectMapper.readTree(jsonContent);
            
            if (rootNode.isArray()) {
                for (JsonNode memoryNode : rootNode) {
                    try {
                        UserMemory memory = parseMemoryNode(memoryNode, userId, messages);
                        if (memory != null) {
                            memories.add(memory);
                        }
                    } catch (Exception e) {
                        log.warn("解析记忆节点失败", e);
                    }
                }
            }
            
        } catch (Exception e) {
            log.error("解析AI响应失败", e);
        }
        
        return memories;
    }
    
    /**
     * 解析单个记忆节点
     */
    private UserMemory parseMemoryNode(JsonNode memoryNode, String userId, List<ChatMessage> messages) {
        try {
            String content = memoryNode.has("content") ? memoryNode.get("content").asText() : null;
            if (content == null || content.trim().isEmpty()) {
                return null;
            }
            
            // 解析类型
            MemoryType type = MemoryType.PERSONAL_INFO;
            if (memoryNode.has("type")) {
                try {
                    type = MemoryType.valueOf(memoryNode.get("type").asText());
                } catch (IllegalArgumentException e) {
                    log.warn("无效的记忆类型: {}", memoryNode.get("type").asText());
                }
            }
            
            // 解析重要性
            MemoryImportance importance = MemoryImportance.NORMAL;
            if (memoryNode.has("importance")) {
                try {
                    importance = MemoryImportance.valueOf(memoryNode.get("importance").asText());
                } catch (IllegalArgumentException e) {
                    log.warn("无效的重要性: {}", memoryNode.get("importance").asText());
                }
            }
            
            // 解析置信度
            double confidence = memoryNode.has("confidence") ? 
                memoryNode.get("confidence").asDouble() : 0.7;
            confidence = Math.max(0.0, Math.min(1.0, confidence));
            
            // 解析标签
            List<String> tags = new ArrayList<>();
            if (memoryNode.has("tags") && memoryNode.get("tags").isArray()) {
                for (JsonNode tagNode : memoryNode.get("tags")) {
                    tags.add(tagNode.asText());
                }
            }
            
            // 获取来源会话ID
            String sourceSessionId = messages.stream()
                .map(ChatMessage::getSessionId)
                .filter(Objects::nonNull)
                .findFirst()
                .orElse(null);
            
            return UserMemory.builder()
                .userId(userId)
                .type(type)
                .importance(importance)
                .content(content)
                .source(MemorySource.CONVERSATION)
                .sourceId(sourceSessionId)
                .confidence(confidence)
                .createdAt(Instant.now())
                .lastAccessedAt(Instant.now())
                .accessCount(0)
                .tags(tags)
                .build();
                
        } catch (Exception e) {
            log.error("解析记忆节点失败", e);
            return null;
        }
    }
    
    // ========== 提取角色交互记忆 ==========
    
    @Override
    public List<CharacterInteractionMemory> extractCharacterInteractionMemories(
            String characterId, String userId, List<ChatMessage> messages) {
        if (!enableLlmExtraction || messages == null || messages.isEmpty()) {
            return Collections.emptyList();
        }
        
        try {
            // 构建提取提示词
            String prompt = buildCharacterInteractionMemoryExtractionPrompt(characterId, userId, messages);
            
            // 调用AI服务
            TextGenerationRequest request = new TextGenerationRequest();
            request.setPrompt(prompt);
            request.setSystemInstruction("你是一个专业的角色记忆提取专家，擅长从对话中提取角色与用户的交互记忆。请以JSON格式返回结果。");
            request.setTemperature(0.3);
            request.setMaxTokens(2000);
            
            TextGenerationResponse response = aiService.generateText(Long.parseLong(userId), request);
            
            // 解析响应
            List<CharacterInteractionMemory> memories = parseCharacterInteractionMemoriesFromResponse(
                response.getContent(), characterId, userId, messages);
            
            return memories;
            
        } catch (Exception e) {
            log.error("LLM提取角色交互记忆失败: characterId={}, userId={}", characterId, userId, e);
            return Collections.emptyList();
        }
    }
    
    // ========== 提取角色场景记忆 ==========
    
    @Override
    public List<CharacterSceneMemory> extractCharacterSceneMemories(
            String characterId, String eraId, List<ChatMessage> messages) {
        if (!enableLlmExtraction || messages == null || messages.isEmpty()) {
            return Collections.emptyList();
        }
        
        try {
            // 构建提取提示词
            String prompt = buildCharacterSceneMemoryExtractionPrompt(characterId, eraId, messages);
            
            // 调用AI服务
            TextGenerationRequest request = new TextGenerationRequest();
            request.setPrompt(prompt);
            request.setSystemInstruction("你是一个专业的角色场景记忆提取专家，擅长从对话中提取角色在特定场景中的记忆。请以JSON格式返回结果。");
            request.setTemperature(0.3);
            request.setMaxTokens(2000);
            
            TextGenerationResponse response = aiService.generateText(Long.parseLong(characterId), request);
            
            // 解析响应
            List<CharacterSceneMemory> memories = parseCharacterSceneMemoriesFromResponse(
                response.getContent(), characterId, eraId, messages);
            
            return memories;
            
        } catch (Exception e) {
            log.error("LLM提取角色场景记忆失败: characterId={}, eraId={}", characterId, eraId, e);
            return Collections.emptyList();
        }
    }
    
    // ========== 验证和清理 ==========
    
    @Override
    public List<UserFact> validateAndCleanFacts(List<UserFact> facts) {
        if (facts == null || facts.isEmpty()) {
            return Collections.emptyList();
        }
        
        return facts.stream()
            .filter(fact -> fact != null)
            .filter(fact -> fact.getFact() != null && !fact.getFact().trim().isEmpty())
            .filter(fact -> fact.getConfidence() != null && fact.getConfidence() >= confidenceThreshold)
            .filter(fact -> fact.getUserId() != null && !fact.getUserId().isEmpty())
            .distinct() // 去重（基于fact内容）
            .collect(Collectors.toList());
    }
    
    @Override
    public List<UserPreference> validateAndCleanPreferences(List<UserPreference> preferences) {
        if (preferences == null || preferences.isEmpty()) {
            return Collections.emptyList();
        }
        
        return preferences.stream()
            .filter(pref -> pref != null)
            .filter(pref -> pref.getKey() != null && !pref.getKey().trim().isEmpty())
            .filter(pref -> pref.getValue() != null)
            .filter(pref -> pref.getConfidence() != null && pref.getConfidence() >= confidenceThreshold)
            .filter(pref -> pref.getUserId() != null && !pref.getUserId().isEmpty())
            .collect(Collectors.toMap(
                UserPreference::getKey,
                p -> p,
                (existing, replacement) -> 
                    existing.getConfidence() >= replacement.getConfidence() ? existing : replacement
            ))
            .values()
            .stream()
            .collect(Collectors.toList());
    }
    
    // ========== 辅助方法 ==========
    
    /**
     * 从响应中提取JSON内容（可能包含markdown代码块）
     */
    private String extractJsonFromResponse(String response) {
        if (response == null || response.trim().isEmpty()) {
            return "[]";
        }
        
        // 移除markdown代码块标记
        String cleaned = response.trim();
        if (cleaned.startsWith("```json")) {
            cleaned = cleaned.substring(7);
        } else if (cleaned.startsWith("```")) {
            cleaned = cleaned.substring(3);
        }
        
        if (cleaned.endsWith("```")) {
            cleaned = cleaned.substring(0, cleaned.length() - 3);
        }
        
        cleaned = cleaned.trim();
        
        // 如果仍然不是有效的JSON，尝试提取JSON数组
        if (!cleaned.startsWith("[") && !cleaned.startsWith("{")) {
            // 尝试找到第一个[或{
            int startIndex = cleaned.indexOf('[');
            if (startIndex == -1) {
                startIndex = cleaned.indexOf('{');
            }
            if (startIndex != -1) {
                cleaned = cleaned.substring(startIndex);
                // 找到匹配的结束符
                int endIndex = findMatchingBracket(cleaned, startIndex == cleaned.indexOf('[') ? '[' : '{');
                if (endIndex != -1) {
                    cleaned = cleaned.substring(0, endIndex + 1);
                }
            }
        }
        
        return cleaned.isEmpty() ? "[]" : cleaned;
    }
    
    /**
     * 找到匹配的括号
     */
    private int findMatchingBracket(String str, char openBracket) {
        char closeBracket = openBracket == '[' ? ']' : '}';
        int depth = 0;
        for (int i = 0; i < str.length(); i++) {
            if (str.charAt(i) == openBracket) {
                depth++;
            } else if (str.charAt(i) == closeBracket) {
                depth--;
                if (depth == 0) {
                    return i;
                }
            }
        }
        return -1;
    }
    
    // ========== 角色记忆提取辅助方法 ==========
    
    /**
     * 构建角色交互记忆提取提示词
     */
    private String buildCharacterInteractionMemoryExtractionPrompt(
            String characterId, String userId, List<ChatMessage> messages) {
        StringBuilder prompt = new StringBuilder();
        prompt.append("请从以下对话中提取角色与用户的交互记忆，返回JSON格式。\n\n");
        prompt.append("对话内容：\n");
        
        for (ChatMessage message : messages) {
            if (message.getRole() == MessageRole.USER) {
                prompt.append("用户: ").append(message.getContent()).append("\n");
            } else if (message.getRole() == MessageRole.ASSISTANT) {
                prompt.append("角色: ").append(message.getContent()).append("\n");
            }
        }
        
        prompt.append("\n请提取以下类型的交互记忆：\n");
        prompt.append("1. 对话话题：用户喜欢谈论的话题\n");
        prompt.append("2. 用户偏好：用户的偏好和习惯\n");
        prompt.append("3. 情感互动：与用户的情感互动\n");
        prompt.append("4. 重要时刻：与用户的重要时刻\n\n");
        
        prompt.append("返回格式（JSON数组）：\n");
        prompt.append("[\n");
        prompt.append("  {\n");
        prompt.append("    \"type\": \"CONVERSATION_TOPIC|USER_PREFERENCE|EMOTIONAL_EXPERIENCE|IMPORTANT_MOMENT\",\n");
        prompt.append("    \"importance\": \"CORE|IMPORTANT|NORMAL|TEMPORARY\",\n");
        prompt.append("    \"content\": \"记忆内容\",\n");
        prompt.append("    \"interactionType\": \"CONVERSATION|ACTION|EVENT|EMOTION\",\n");
        prompt.append("    \"userRelatedData\": {\"key\": \"value\"},\n");
        prompt.append("    \"confidence\": 0.0-1.0,\n");
        prompt.append("    \"tags\": [\"标签1\", \"标签2\"]\n");
        prompt.append("  }\n");
        prompt.append("]\n");
        
        return prompt.toString();
    }
    
    /**
     * 构建角色场景记忆提取提示词
     */
    private String buildCharacterSceneMemoryExtractionPrompt(
            String characterId, String eraId, List<ChatMessage> messages) {
        StringBuilder prompt = new StringBuilder();
        prompt.append("请从以下对话中提取角色在场景中的记忆，返回JSON格式。\n\n");
        prompt.append("场景ID: ").append(eraId).append("\n");
        prompt.append("对话内容：\n");
        
        for (ChatMessage message : messages) {
            if (message.getRole() == MessageRole.USER) {
                prompt.append("用户: ").append(message.getContent()).append("\n");
            } else if (message.getRole() == MessageRole.ASSISTANT) {
                prompt.append("角色: ").append(message.getContent()).append("\n");
            }
        }
        
        prompt.append("\n请提取以下类型的场景记忆：\n");
        prompt.append("1. 场景上下文：角色在场景中的表现和状态\n");
        prompt.append("2. 场景事件：场景中发生的重要事件\n");
        prompt.append("3. 场景状态：角色在场景中的状态变化\n\n");
        
        prompt.append("返回格式（JSON数组）：\n");
        prompt.append("[\n");
        prompt.append("  {\n");
        prompt.append("    \"type\": \"SCENE_CONTEXT|SCENE_EVENT|SCENE_STATE\",\n");
        prompt.append("    \"importance\": \"CORE|IMPORTANT|NORMAL|TEMPORARY\",\n");
        prompt.append("    \"content\": \"记忆内容\",\n");
        prompt.append("    \"sceneContext\": \"场景上下文描述\",\n");
        prompt.append("    \"inheritable\": true/false,\n");
        prompt.append("    \"confidence\": 0.0-1.0,\n");
        prompt.append("    \"tags\": [\"标签1\", \"标签2\"]\n");
        prompt.append("  }\n");
        prompt.append("]\n");
        
        return prompt.toString();
    }
    
    /**
     * 从AI响应中解析角色交互记忆
     */
    private List<CharacterInteractionMemory> parseCharacterInteractionMemoriesFromResponse(
            String responseContent, String characterId, String userId, List<ChatMessage> messages) {
        List<CharacterInteractionMemory> memories = new ArrayList<>();
        
        try {
            String jsonContent = extractJsonFromResponse(responseContent);
            JsonNode rootNode = objectMapper.readTree(jsonContent);
            
            if (rootNode.isArray()) {
                for (JsonNode memoryNode : rootNode) {
                    try {
                        CharacterInteractionMemory memory = parseCharacterInteractionMemoryNode(
                            memoryNode, characterId, userId, messages);
                        if (memory != null) {
                            memories.add(memory);
                        }
                    } catch (Exception e) {
                        log.warn("解析角色交互记忆节点失败", e);
                    }
                }
            }
            
        } catch (Exception e) {
            log.error("解析AI响应失败", e);
        }
        
        return memories;
    }
    
    /**
     * 从AI响应中解析角色场景记忆
     */
    private List<CharacterSceneMemory> parseCharacterSceneMemoriesFromResponse(
            String responseContent, String characterId, String eraId, List<ChatMessage> messages) {
        List<CharacterSceneMemory> memories = new ArrayList<>();
        
        try {
            String jsonContent = extractJsonFromResponse(responseContent);
            JsonNode rootNode = objectMapper.readTree(jsonContent);
            
            if (rootNode.isArray()) {
                for (JsonNode memoryNode : rootNode) {
                    try {
                        CharacterSceneMemory memory = parseCharacterSceneMemoryNode(
                            memoryNode, characterId, eraId, messages);
                        if (memory != null) {
                            memories.add(memory);
                        }
                    } catch (Exception e) {
                        log.warn("解析角色场景记忆节点失败", e);
                    }
                }
            }
            
        } catch (Exception e) {
            log.error("解析AI响应失败", e);
        }
        
        return memories;
    }
    
    /**
     * 解析角色交互记忆节点
     */
    private CharacterInteractionMemory parseCharacterInteractionMemoryNode(
            JsonNode node, String characterId, String userId, List<ChatMessage> messages) {
        try {
            String content = node.has("content") ? node.get("content").asText() : "";
            if (content.isEmpty()) {
                return null;
            }
            
            MemoryType type = node.has("type") ? 
                MemoryType.valueOf(node.get("type").asText()) : MemoryType.CONVERSATION_TOPIC;
            
            MemoryImportance importance = node.has("importance") ? 
                MemoryImportance.valueOf(node.get("importance").asText()) : MemoryImportance.NORMAL;
            
            CharacterInteractionMemory.InteractionType interactionType = 
                node.has("interactionType") ? 
                    CharacterInteractionMemory.InteractionType.valueOf(node.get("interactionType").asText()) :
                    CharacterInteractionMemory.InteractionType.CONVERSATION;
            
            Double confidence = node.has("confidence") ? 
                node.get("confidence").asDouble() : 0.7;
            
            List<String> tags = new ArrayList<>();
            if (node.has("tags") && node.get("tags").isArray()) {
                for (JsonNode tagNode : node.get("tags")) {
                    tags.add(tagNode.asText());
                }
            }
            
            Map<String, Object> userRelatedData = new HashMap<>();
            if (node.has("userRelatedData") && node.get("userRelatedData").isObject()) {
                JsonNode userDataNode = node.get("userRelatedData");
                userDataNode.fields().forEachRemaining(entry -> {
                    userRelatedData.put(entry.getKey(), entry.getValue().asText());
                });
            }
            
            String sessionId = messages.stream()
                .map(ChatMessage::getSessionId)
                .filter(Objects::nonNull)
                .findFirst()
                .orElse(null);
            
            return CharacterInteractionMemory.builder()
                .characterId(characterId)
                .userId(userId)
                .type(type)
                .importance(importance)
                .content(content)
                .interactionType(interactionType)
                .userRelatedData(userRelatedData)
                .interactionSessionId(sessionId)
                .interactionTime(Instant.now())
                .source(MemorySource.CONVERSATION)
                .confidence(confidence)
                .createdAt(Instant.now())
                .lastAccessedAt(Instant.now())
                .accessCount(0)
                .tags(tags)
                .build();
                
        } catch (Exception e) {
            log.error("解析角色交互记忆节点失败", e);
            return null;
        }
    }
    
    /**
     * 解析角色场景记忆节点
     */
    private CharacterSceneMemory parseCharacterSceneMemoryNode(
            JsonNode node, String characterId, String eraId, List<ChatMessage> messages) {
        try {
            String content = node.has("content") ? node.get("content").asText() : "";
            if (content.isEmpty()) {
                return null;
            }
            
            MemoryType type = node.has("type") ? 
                MemoryType.valueOf(node.get("type").asText()) : MemoryType.CONVERSATION_TOPIC;
            
            MemoryImportance importance = node.has("importance") ? 
                MemoryImportance.valueOf(node.get("importance").asText()) : MemoryImportance.NORMAL;
            
            String sceneContext = node.has("sceneContext") ? 
                node.get("sceneContext").asText() : "";
            
            Boolean inheritable = node.has("inheritable") ? 
                node.get("inheritable").asBoolean() : false;
            
            Double confidence = node.has("confidence") ? 
                node.get("confidence").asDouble() : 0.7;
            
            List<String> tags = new ArrayList<>();
            if (node.has("tags") && node.get("tags").isArray()) {
                for (JsonNode tagNode : node.get("tags")) {
                    tags.add(tagNode.asText());
                }
            }
            
            return CharacterSceneMemory.builder()
                .characterId(characterId)
                .eraId(eraId)
                .type(type)
                .importance(importance)
                .content(content)
                .sceneContext(sceneContext)
                .inheritable(inheritable)
                .source(MemorySource.CONVERSATION)
                .confidence(confidence)
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .lastAccessedAt(Instant.now())
                .accessCount(0)
                .tags(tags)
                .build();
                
        } catch (Exception e) {
            log.error("解析角色场景记忆节点失败", e);
            return null;
        }
    }
}

