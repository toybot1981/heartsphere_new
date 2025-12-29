package com.heartsphere.memory.service.impl;

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
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

/**
 * 基于规则的记忆提取器实现
 * 使用规则和正则表达式从对话中提取用户事实、偏好和记忆
 * 作为LLM提取的备用方案
 * 
 * @author HeartSphere
 * @date 2025-12-28
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class RuleBasedMemoryExtractor implements MemoryExtractor {
    
    @Value("${heartsphere.memory.extraction.enable-rule-extraction:true}")
    private boolean enableRuleExtraction;
    
    @Value("${heartsphere.memory.long-memory.extraction-confidence-threshold:0.6}")
    private double confidenceThreshold;
    
    // 正则表达式模式
    private static final Pattern NAME_PATTERN = Pattern.compile(
        "(?:我|我的)?(?:名字|姓名|叫)(?:是|为)?[：:：]?([\\u4e00-\\u9fa5a-zA-Z]{2,10})"
    );
    
    private static final Pattern AGE_PATTERN = Pattern.compile(
        "(?:我|今年)?(?:已经|已经)?(\\d{1,3})(?:岁|岁了)"
    );
    
    private static final Pattern BIRTHDAY_PATTERN = Pattern.compile(
        "(?:我|我的)?(?:生日|出生日期)(?:是|为)?[：:：]?(\\d{1,4})[年\\-/.](\\d{1,2})[月\\-/.](\\d{1,2})[日]?"
    );
    
    private static final Pattern LOCATION_PATTERN = Pattern.compile(
        "(?:我|我)(?:在|住在|来自)([\\u4e00-\\u9fa5]{2,20})(?:市|省|区|县)?"
    );
    
    private static final Pattern JOB_PATTERN = Pattern.compile(
        "(?:我|我的)?(?:工作|职业|是)(?:是|为)?[：:：]?([\\u4e00-\\u9fa5a-zA-Z]{2,20})(?:师|员|家|者)?"
    );
    
    private static final Pattern LIKE_PATTERN = Pattern.compile(
        "(?:我|我)(?:喜欢|爱好|爱|偏好)(?:是|为)?[：:：]?([\\u4e00-\\u9fa5a-zA-Z\\s]{2,30})"
    );
    
    private static final Pattern DISLIKE_PATTERN = Pattern.compile(
        "(?:我|我)(?:不喜欢|讨厌|厌恶)(?:是|为)?[：:：]?([\\u4e00-\\u9fa5a-zA-Z\\s]{2,30})"
    );
    
    private static final Pattern HABIT_PATTERN = Pattern.compile(
        "(?:我|我的)?(?:习惯|经常|总是)(?:是|为)?[：:：]?([\\u4e00-\\u9fa5a-zA-Z\\s]{2,30})"
    );
    
    // ========== 提取用户事实 ==========
    
    @Override
    public List<UserFact> extractFacts(String userId, List<ChatMessage> messages) {
        if (!enableRuleExtraction || messages == null || messages.isEmpty()) {
            return Collections.emptyList();
        }
        
        List<UserFact> facts = new ArrayList<>();
        
        try {
            // 提取所有用户消息
            String allText = messages.stream()
                .filter(msg -> msg.getRole() == MessageRole.USER)
                .map(ChatMessage::getContent)
                .filter(Objects::nonNull)
                .collect(Collectors.joining(" "));
            
            if (allText.isEmpty()) {
                return Collections.emptyList();
            }
            
            // 提取姓名
            extractName(allText, userId, messages, facts);
            
            // 提取年龄
            extractAge(allText, userId, messages, facts);
            
            // 提取生日
            extractBirthday(allText, userId, messages, facts);
            
            // 提取位置
            extractLocation(allText, userId, messages, facts);
            
            // 提取职业
            extractJob(allText, userId, messages, facts);
            
            // 提取习惯
            extractHabits(allText, userId, messages, facts);
            
            // 验证和清理
            return validateAndCleanFacts(facts);
            
        } catch (Exception e) {
            log.error("规则提取用户事实失败: userId={}", userId, e);
            return Collections.emptyList();
        }
    }
    
    /**
     * 提取姓名
     */
    private void extractName(String text, String userId, List<ChatMessage> messages, List<UserFact> facts) {
        Matcher matcher = NAME_PATTERN.matcher(text);
        if (matcher.find()) {
            String name = matcher.group(1);
            UserFact fact = UserFact.builder()
                .userId(userId)
                .fact("用户姓名是" + name)
                .category(FactCategory.PERSONAL)
                .importance(0.9)
                .confidence(0.8)
                .sourceSessionId(getSessionId(messages))
                .createdAt(Instant.now())
                .lastAccessedAt(Instant.now())
                .accessCount(0)
                .tags(Arrays.asList("姓名", "个人信息"))
                .metadata(Map.of("name", name))
                .build();
            facts.add(fact);
        }
    }
    
    /**
     * 提取年龄
     */
    private void extractAge(String text, String userId, List<ChatMessage> messages, List<UserFact> facts) {
        Matcher matcher = AGE_PATTERN.matcher(text);
        if (matcher.find()) {
            String ageStr = matcher.group(1);
            try {
                int age = Integer.parseInt(ageStr);
                if (age > 0 && age < 150) {
                    UserFact fact = UserFact.builder()
                        .userId(userId)
                        .fact("用户年龄是" + age + "岁")
                        .category(FactCategory.PERSONAL)
                        .importance(0.7)
                        .confidence(0.75)
                        .sourceSessionId(getSessionId(messages))
                        .createdAt(Instant.now())
                        .lastAccessedAt(Instant.now())
                        .accessCount(0)
                        .tags(Arrays.asList("年龄", "个人信息"))
                        .metadata(Map.of("age", age))
                        .build();
                    facts.add(fact);
                }
            } catch (NumberFormatException e) {
                log.warn("解析年龄失败: {}", ageStr);
            }
        }
    }
    
    /**
     * 提取生日
     */
    private void extractBirthday(String text, String userId, List<ChatMessage> messages, List<UserFact> facts) {
        Matcher matcher = BIRTHDAY_PATTERN.matcher(text);
        if (matcher.find()) {
            String year = matcher.group(1);
            String month = matcher.group(2);
            String day = matcher.group(3);
            String birthday = year + "-" + month + "-" + day;
            
            UserFact fact = UserFact.builder()
                .userId(userId)
                .fact("用户生日是" + birthday)
                .category(FactCategory.PERSONAL)
                .importance(0.95)
                .confidence(0.85)
                .sourceSessionId(getSessionId(messages))
                .createdAt(Instant.now())
                .lastAccessedAt(Instant.now())
                .accessCount(0)
                .tags(Arrays.asList("生日", "个人信息"))
                .metadata(Map.of("birthday", birthday))
                .build();
            facts.add(fact);
        }
    }
    
    /**
     * 提取位置
     */
    private void extractLocation(String text, String userId, List<ChatMessage> messages, List<UserFact> facts) {
        Matcher matcher = LOCATION_PATTERN.matcher(text);
        if (matcher.find()) {
            String location = matcher.group(1);
            UserFact fact = UserFact.builder()
                .userId(userId)
                .fact("用户位置是" + location)
                .category(FactCategory.LOCATION)
                .importance(0.6)
                .confidence(0.7)
                .sourceSessionId(getSessionId(messages))
                .createdAt(Instant.now())
                .lastAccessedAt(Instant.now())
                .accessCount(0)
                .tags(Arrays.asList("位置", "地理位置"))
                .metadata(Map.of("location", location))
                .build();
            facts.add(fact);
        }
    }
    
    /**
     * 提取职业
     */
    private void extractJob(String text, String userId, List<ChatMessage> messages, List<UserFact> facts) {
        Matcher matcher = JOB_PATTERN.matcher(text);
        if (matcher.find()) {
            String job = matcher.group(1);
            UserFact fact = UserFact.builder()
                .userId(userId)
                .fact("用户职业是" + job)
                .category(FactCategory.WORK)
                .importance(0.7)
                .confidence(0.75)
                .sourceSessionId(getSessionId(messages))
                .createdAt(Instant.now())
                .lastAccessedAt(Instant.now())
                .accessCount(0)
                .tags(Arrays.asList("职业", "工作"))
                .metadata(Map.of("job", job))
                .build();
            facts.add(fact);
        }
    }
    
    /**
     * 提取习惯
     */
    private void extractHabits(String text, String userId, List<ChatMessage> messages, List<UserFact> facts) {
        Matcher matcher = HABIT_PATTERN.matcher(text);
        while (matcher.find()) {
            String habit = matcher.group(1);
            UserFact fact = UserFact.builder()
                .userId(userId)
                .fact("用户习惯是" + habit)
                .category(FactCategory.HABIT)
                .importance(0.6)
                .confidence(0.7)
                .sourceSessionId(getSessionId(messages))
                .createdAt(Instant.now())
                .lastAccessedAt(Instant.now())
                .accessCount(0)
                .tags(Arrays.asList("习惯"))
                .metadata(Map.of("habit", habit))
                .build();
            facts.add(fact);
        }
    }
    
    // ========== 提取用户偏好 ==========
    
    @Override
    public List<UserPreference> extractPreferences(String userId, List<ChatMessage> messages) {
        if (!enableRuleExtraction || messages == null || messages.isEmpty()) {
            return Collections.emptyList();
        }
        
        List<UserPreference> preferences = new ArrayList<>();
        
        try {
            String allText = messages.stream()
                .filter(msg -> msg.getRole() == MessageRole.USER)
                .map(ChatMessage::getContent)
                .filter(Objects::nonNull)
                .collect(Collectors.joining(" "));
            
            if (allText.isEmpty()) {
                return Collections.emptyList();
            }
            
            // 提取喜欢的事物
            extractLikes(allText, userId, preferences);
            
            // 提取不喜欢的事物
            extractDislikes(allText, userId, preferences);
            
            // 验证和清理
            return validateAndCleanPreferences(preferences);
            
        } catch (Exception e) {
            log.error("规则提取用户偏好失败: userId={}", userId, e);
            return Collections.emptyList();
        }
    }
    
    /**
     * 提取喜欢的事物
     */
    private void extractLikes(String text, String userId, List<UserPreference> preferences) {
        Matcher matcher = LIKE_PATTERN.matcher(text);
        int index = 0;
        while (matcher.find()) {
            String like = matcher.group(1).trim();
            UserPreference preference = UserPreference.builder()
                .userId(userId)
                .key("like_" + index++)
                .value(like)
                .type(PreferenceType.STRING)
                .confidence(0.7)
                .updatedAt(Instant.now())
                .lastAccessedAt(Instant.now())
                .accessCount(0)
                .metadata(Map.of("category", "like"))
                .build();
            preferences.add(preference);
        }
    }
    
    /**
     * 提取不喜欢的事物
     */
    private void extractDislikes(String text, String userId, List<UserPreference> preferences) {
        Matcher matcher = DISLIKE_PATTERN.matcher(text);
        int index = 0;
        while (matcher.find()) {
            String dislike = matcher.group(1).trim();
            UserPreference preference = UserPreference.builder()
                .userId(userId)
                .key("dislike_" + index++)
                .value(dislike)
                .type(PreferenceType.STRING)
                .confidence(0.7)
                .updatedAt(Instant.now())
                .lastAccessedAt(Instant.now())
                .accessCount(0)
                .metadata(Map.of("category", "dislike"))
                .build();
            preferences.add(preference);
        }
    }
    
    // ========== 提取用户记忆 ==========
    
    @Override
    public List<UserMemory> extractMemories(String userId, List<ChatMessage> messages) {
        // 规则提取器主要关注事实和偏好，记忆提取能力有限
        // 可以提取一些明显的重要时刻
        if (!enableRuleExtraction || messages == null || messages.isEmpty()) {
            return Collections.emptyList();
        }
        
        List<UserMemory> memories = new ArrayList<>();
        
        try {
            String allText = messages.stream()
                .filter(msg -> msg.getRole() == MessageRole.USER)
                .map(ChatMessage::getContent)
                .filter(Objects::nonNull)
                .collect(Collectors.joining(" "));
            
            if (allText.isEmpty()) {
                return Collections.emptyList();
            }
            
            // 提取重要时刻（包含"生日"、"纪念日"等关键词）
            if (allText.contains("生日") || allText.contains("纪念日") || allText.contains("重要")) {
                UserMemory memory = UserMemory.builder()
                    .userId(userId)
                    .type(MemoryType.IMPORTANT_MOMENT)
                    .importance(MemoryImportance.IMPORTANT)
                    .content("用户提到了重要时刻：" + extractRelevantSentence(allText, "生日|纪念日|重要"))
                    .source(MemorySource.CONVERSATION)
                    .sourceId(getSessionId(messages))
                    .confidence(0.6)
                    .createdAt(Instant.now())
                    .lastAccessedAt(Instant.now())
                    .accessCount(0)
                    .tags(Arrays.asList("重要时刻"))
                    .build();
                memories.add(memory);
            }
            
        } catch (Exception e) {
            log.error("规则提取用户记忆失败: userId={}", userId, e);
        }
        
        return memories;
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
            .distinct()
            .collect(Collectors.toList());
    }
    
    // ========== 提取角色交互记忆 ==========
    
    @Override
    public List<CharacterInteractionMemory> extractCharacterInteractionMemories(
            String characterId, String userId, List<ChatMessage> messages) {
        if (!enableRuleExtraction || messages == null || messages.isEmpty()) {
            return Collections.emptyList();
        }
        
        List<CharacterInteractionMemory> memories = new ArrayList<>();
        
        try {
            for (ChatMessage message : messages) {
                if (message.getRole() == MessageRole.USER) {
                    String content = message.getContent();
                    
                    // 简单规则：如果包含"喜欢"或"偏好"，可能是用户偏好记忆
                    if (content.contains("喜欢") || content.contains("偏好") || content.contains("爱好")) {
                        CharacterInteractionMemory memory = CharacterInteractionMemory.builder()
                            .characterId(characterId)
                            .userId(userId)
                            .type(MemoryType.INTERACTION_PREFERENCE)
                            .importance(MemoryImportance.NORMAL)
                            .content(content)
                            .interactionType(CharacterInteractionMemory.InteractionType.CONVERSATION)
                            .interactionSessionId(message.getSessionId())
                            .interactionTime(Instant.ofEpochMilli(message.getTimestamp()))
                            .source(MemorySource.CONVERSATION)
                            .confidence(0.6)
                            .createdAt(Instant.now())
                            .lastAccessedAt(Instant.now())
                            .accessCount(0)
                            .build();
                        memories.add(memory);
                    }
                    
                    // 如果包含"记得"或"记住"，可能是重要时刻
                    if (content.contains("记得") || content.contains("记住") || content.contains("重要")) {
                        CharacterInteractionMemory memory = CharacterInteractionMemory.builder()
                            .characterId(characterId)
                            .userId(userId)
                            .type(MemoryType.IMPORTANT_MOMENT)
                            .importance(MemoryImportance.IMPORTANT)
                            .content(content)
                            .interactionType(CharacterInteractionMemory.InteractionType.CONVERSATION)
                            .interactionSessionId(message.getSessionId())
                            .interactionTime(Instant.ofEpochMilli(message.getTimestamp()))
                            .source(MemorySource.CONVERSATION)
                            .confidence(0.7)
                            .createdAt(Instant.now())
                            .lastAccessedAt(Instant.now())
                            .accessCount(0)
                            .build();
                        memories.add(memory);
                    }
                }
            }
            
        } catch (Exception e) {
            log.error("规则提取角色交互记忆失败: characterId={}, userId={}", characterId, userId, e);
        }
        
        return memories;
    }
    
    // ========== 提取角色场景记忆 ==========
    
    @Override
    public List<CharacterSceneMemory> extractCharacterSceneMemories(
            String characterId, String eraId, List<ChatMessage> messages) {
        if (!enableRuleExtraction || messages == null || messages.isEmpty()) {
            return Collections.emptyList();
        }
        
        List<CharacterSceneMemory> memories = new ArrayList<>();
        
        try {
            // 简单规则：如果对话中包含场景相关信息，提取为场景记忆
            String allContent = messages.stream()
                .map(ChatMessage::getContent)
                .filter(Objects::nonNull)
                .collect(Collectors.joining(" "));
            
            // 如果包含场景相关关键词，创建场景记忆
            if (allContent.contains("场景") || allContent.contains("环境") || allContent.contains("地点")) {
                CharacterSceneMemory memory = CharacterSceneMemory.builder()
                    .characterId(characterId)
                    .eraId(eraId)
                    .type(MemoryType.CONVERSATION_TOPIC)
                    .importance(MemoryImportance.NORMAL)
                    .content(allContent.substring(0, Math.min(200, allContent.length())))
                    .sceneContext("从对话中提取的场景信息")
                    .inheritable(false)
                    .source(MemorySource.CONVERSATION)
                    .confidence(0.6)
                    .createdAt(Instant.now())
                    .updatedAt(Instant.now())
                    .lastAccessedAt(Instant.now())
                    .accessCount(0)
                    .build();
                memories.add(memory);
            }
            
        } catch (Exception e) {
            log.error("规则提取角色场景记忆失败: characterId={}, eraId={}", characterId, eraId, e);
        }
        
        return memories;
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
     * 获取会话ID
     */
    private String getSessionId(List<ChatMessage> messages) {
        return messages.stream()
            .map(ChatMessage::getSessionId)
            .filter(Objects::nonNull)
            .findFirst()
            .orElse(null);
    }
    
    /**
     * 提取包含关键词的句子
     */
    private String extractRelevantSentence(String text, String keywordPattern) {
        Pattern pattern = Pattern.compile("([^。！？]*" + keywordPattern + "[^。！？]*[。！？])");
        Matcher matcher = pattern.matcher(text);
        if (matcher.find()) {
            return matcher.group(1).trim();
        }
        // 如果找不到完整句子，返回包含关键词的部分
        int maxLength = 50;
        int index = text.indexOf(keywordPattern.split("\\|")[0]);
        if (index != -1) {
            int start = Math.max(0, index - 20);
            int end = Math.min(text.length(), index + 30);
            return text.substring(start, end).trim();
        }
        return text.substring(0, Math.min(maxLength, text.length()));
    }
}

