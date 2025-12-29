package com.heartsphere.memory.service;

import com.heartsphere.memory.model.*;
import com.heartsphere.memory.service.impl.MemoryManagerImpl;
import com.heartsphere.emotion.entity.EmotionRecord;
import com.heartsphere.emotion.repository.EmotionRecordRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

/**
 * 温度感记忆服务
 * 专门处理与温度感系统相关的记忆操作
 * 包括情绪记忆、情感经历、情绪模式等
 * 
 * @author HeartSphere
 * @date 2025-12-28
 */
@Service
@Slf4j
public class TemperatureMemoryService {
    
    @Autowired
    private MemoryManager memoryManager;
    
    @Autowired
    private EmotionRecordRepository emotionRecordRepository;
    
    /**
     * 从情绪记录中提取并保存记忆
     * 
     * @param userId 用户ID
     * @param emotionRecord 情绪记录
     * @return 保存的记忆列表
     */
    public List<UserMemory> extractMemoriesFromEmotion(String userId, EmotionRecord emotionRecord) {
        List<UserMemory> memories = new ArrayList<>();
        
        // 1. 提取情绪模式记忆
        if (shouldSaveAsEmotionPattern(emotionRecord)) {
            UserMemory patternMemory = createEmotionPatternMemory(userId, emotionRecord);
            memories.add(patternMemory);
        }
        
        // 2. 提取情感经历记忆（如果是强烈情绪）
        if (isStrongEmotion(emotionRecord)) {
            UserMemory experienceMemory = createEmotionalExperienceMemory(userId, emotionRecord);
            memories.add(experienceMemory);
        }
        
        // 3. 提取情绪偏好记忆
        if (isPositiveEmotion(emotionRecord)) {
            UserMemory preferenceMemory = createEmotionalPreferenceMemory(userId, emotionRecord);
            if (preferenceMemory != null) {
                memories.add(preferenceMemory);
            }
        }
        
        // 保存记忆（通过MemoryManager）
        if (!memories.isEmpty() && memoryManager instanceof MemoryManagerImpl) {
            MemoryManagerImpl managerImpl = (MemoryManagerImpl) memoryManager;
            managerImpl.saveMemories(memories);
            log.debug("保存温度感记忆: userId={}, count={}", userId, memories.size());
        }
        
        return memories;
    }
    
    /**
     * 根据情绪检索相关记忆
     * 用于温度感系统生成个性化回应
     * 
     * @param userId 用户ID
     * @param emotionType 情绪类型
     * @param limit 返回数量限制
     * @return 相关记忆列表
     */
    public List<UserMemory> retrieveMemoriesByEmotion(String userId, String emotionType, int limit) {
        // 1. 检索情绪模式记忆
        List<UserMemory> patternMemories = memoryManager.retrieveMemoriesByContext(
            userId,
            Map.of(
                "type", MemoryType.EMOTION_PATTERN.name(),
                "emotionType", emotionType
            ),
            limit / 2
        );
        
        // 2. 检索情感经历记忆
        List<UserMemory> experienceMemories = memoryManager.retrieveMemoriesByContext(
            userId,
            Map.of(
                "type", MemoryType.EMOTIONAL_EXPERIENCE.name(),
                "emotionType", emotionType
            ),
            limit / 2
        );
        
        // 合并并去重
        List<UserMemory> allMemories = new ArrayList<>();
        allMemories.addAll(patternMemories);
        allMemories.addAll(experienceMemories);
        
        // 按重要性排序
        allMemories.sort((a, b) -> {
            int importanceCompare = b.getImportance().compareTo(a.getImportance());
            if (importanceCompare != 0) {
                return importanceCompare;
            }
            // 如果重要性相同，按访问次数排序
            return (b.getAccessCount() != null ? b.getAccessCount() : 0) - 
                   (a.getAccessCount() != null ? a.getAccessCount() : 0);
        });
        
        return allMemories.stream().limit(limit).collect(Collectors.toList());
    }
    
    /**
     * 获取用户的情绪模式记忆
     * 用于温度感系统的模式识别
     * 
     * @param userId 用户ID
     * @return 情绪模式记忆列表
     */
    public List<UserMemory> getEmotionPatterns(String userId) {
        return memoryManager.retrieveMemoriesByContext(
            userId,
            Map.of("type", MemoryType.EMOTION_PATTERN.name()),
            50
        );
    }
    
    /**
     * 获取用户的情感经历记忆
     * 用于温度感系统的个性化回应
     * 
     * @param userId 用户ID
     * @param emotionType 情绪类型（可选）
     * @param limit 返回数量限制
     * @return 情感经历记忆列表
     */
    public List<UserMemory> getEmotionalExperiences(String userId, String emotionType, int limit) {
        Map<String, Object> context = new HashMap<>();
        context.put("type", MemoryType.EMOTIONAL_EXPERIENCE.name());
        if (emotionType != null && !emotionType.isEmpty()) {
            context.put("emotionType", emotionType);
        }
        
        return memoryManager.retrieveMemoriesByContext(userId, context, limit);
    }
    
    /**
     * 分析用户的情绪趋势并保存为记忆
     * 
     * @param userId 用户ID
     * @param period 时间段（day/week/month）
     * @return 情绪趋势记忆
     */
    public UserMemory analyzeAndSaveEmotionTrend(String userId, String period) {
        // 获取时间范围
        Instant endTime = Instant.now();
        Instant startTime = endTime.minusSeconds(
            period.equals("day") ? 86400 : 
            period.equals("week") ? 604800 : 2592000
        );
        
        // 获取该时间段的情绪记录
        List<EmotionRecord> records = emotionRecordRepository.findByUserIdOrderByTimestampDesc(
            Long.parseLong(userId)
        ).stream()
        .filter(r -> r.getTimestamp().isAfter(java.time.LocalDateTime.ofInstant(startTime, java.time.ZoneId.systemDefault())))
        .filter(r -> r.getTimestamp().isBefore(java.time.LocalDateTime.ofInstant(endTime, java.time.ZoneId.systemDefault())))
        .collect(Collectors.toList());
        
        if (records.isEmpty()) {
            return null;
        }
        
        // 分析情绪趋势
        Map<String, Long> emotionDistribution = records.stream()
            .collect(Collectors.groupingBy(
                EmotionRecord::getEmotionType,
                Collectors.counting()
            ));
        
        String dominantEmotion = emotionDistribution.entrySet().stream()
            .max(Map.Entry.comparingByValue())
            .map(Map.Entry::getKey)
            .orElse("calm");
        
        double avgConfidence = records.stream()
            .mapToDouble(EmotionRecord::getConfidence)
            .average()
            .orElse(0.0);
        
        // 创建趋势记忆
        UserMemory trendMemory = UserMemory.builder()
            .userId(userId)
            .type(MemoryType.EMOTION_PATTERN)
            .importance(MemoryImportance.IMPORTANT)
            .content(String.format("在%s期间，主要情绪为%s，平均置信度%.2f", 
                period, dominantEmotion, avgConfidence))
            .structuredData(Map.of(
                "period", period,
                "dominantEmotion", dominantEmotion,
                "averageConfidence", avgConfidence,
                "emotionDistribution", emotionDistribution,
                "totalRecords", records.size()
            ))
            .source(MemorySource.SYSTEM_DETECTED)
            .confidence(0.8)
            .createdAt(Instant.now())
            .lastAccessedAt(Instant.now())
            .accessCount(0)
            .tags(Arrays.asList("情绪趋势", period, dominantEmotion))
            .metadata(Map.of(
                "emotionType", dominantEmotion,
                "analysisType", "trend"
            ))
            .build();
        
        // 保存趋势记忆（通过MemoryManager）
        if (trendMemory != null && memoryManager instanceof MemoryManagerImpl) {
            MemoryManagerImpl managerImpl = (MemoryManagerImpl) memoryManager;
            managerImpl.saveMemory(trendMemory);
            log.debug("保存情绪趋势记忆: userId={}, period={}", userId, period);
        }
        
        return trendMemory;
    }
    
    /**
     * 判断是否应该保存为情绪模式记忆
     */
    private boolean shouldSaveAsEmotionPattern(EmotionRecord emotionRecord) {
        // 如果置信度高且是常见情绪，保存为模式
        return emotionRecord.getConfidence() > 0.7 && 
               (emotionRecord.getEmotionIntensity().equals("moderate") || 
                emotionRecord.getEmotionIntensity().equals("strong"));
    }
    
    /**
     * 判断是否是强烈情绪
     */
    private boolean isStrongEmotion(EmotionRecord emotionRecord) {
        return emotionRecord.getEmotionIntensity().equals("strong") && 
               emotionRecord.getConfidence() > 0.7;
    }
    
    /**
     * 判断是否是积极情绪
     */
    private boolean isPositiveEmotion(EmotionRecord emotionRecord) {
        String emotion = emotionRecord.getEmotionType().toLowerCase();
        return emotion.equals("happy") || emotion.equals("excited") || 
               emotion.equals("content") || emotion.equals("grateful") ||
               emotion.equals("hopeful") || emotion.equals("peaceful");
    }
    
    /**
     * 创建情绪模式记忆
     */
    private UserMemory createEmotionPatternMemory(String userId, EmotionRecord emotionRecord) {
        return UserMemory.builder()
            .userId(userId)
            .type(MemoryType.EMOTION_PATTERN)
            .importance(MemoryImportance.NORMAL)
            .content(String.format("用户经常表现出%s情绪（强度：%s）", 
                emotionRecord.getEmotionType(), emotionRecord.getEmotionIntensity()))
            .structuredData(Map.of(
                "emotionType", emotionRecord.getEmotionType(),
                "intensity", emotionRecord.getEmotionIntensity(),
                "confidence", emotionRecord.getConfidence()
            ))
            .source(MemorySource.SYSTEM_DETECTED)
            .sourceId(emotionRecord.getId() != null ? emotionRecord.getId().toString() : null)
            .confidence(emotionRecord.getConfidence())
            .createdAt(Instant.now())
            .lastAccessedAt(Instant.now())
            .accessCount(0)
            .tags(parseTags(emotionRecord.getEmotionTags()))
            .metadata(Map.of(
                "emotionType", emotionRecord.getEmotionType(),
                "timestamp", emotionRecord.getTimestamp().toString()
            ))
            .build();
    }
    
    /**
     * 创建情感经历记忆
     */
    private UserMemory createEmotionalExperienceMemory(String userId, EmotionRecord emotionRecord) {
        String content = emotionRecord.getContext();
        if (content == null || content.isEmpty()) {
            content = String.format("用户经历了强烈的%s情绪", emotionRecord.getEmotionType());
        }
        
        return UserMemory.builder()
            .userId(userId)
            .type(MemoryType.EMOTIONAL_EXPERIENCE)
            .importance(MemoryImportance.IMPORTANT)
            .content(content)
            .structuredData(Map.of(
                "emotionType", emotionRecord.getEmotionType(),
                "intensity", emotionRecord.getEmotionIntensity(),
                "confidence", emotionRecord.getConfidence(),
                "triggerText", emotionRecord.getTriggerText() != null ? emotionRecord.getTriggerText() : ""
            ))
            .source(MemorySource.SYSTEM_DETECTED)
            .sourceId(emotionRecord.getId() != null ? emotionRecord.getId().toString() : null)
            .confidence(emotionRecord.getConfidence())
            .createdAt(Instant.now())
            .lastAccessedAt(Instant.now())
            .accessCount(0)
            .tags(parseTags(emotionRecord.getEmotionTags()))
            .metadata(Map.of(
                "emotionType", emotionRecord.getEmotionType(),
                "timestamp", emotionRecord.getTimestamp().toString(),
                "source", emotionRecord.getSource()
            ))
            .build();
    }
    
    /**
     * 创建情绪偏好记忆
     */
    private UserMemory createEmotionalPreferenceMemory(String userId, EmotionRecord emotionRecord) {
        // 从关键短语中提取偏好信息
        String keyPhrases = emotionRecord.getKeyPhrases();
        if (keyPhrases == null || keyPhrases.isEmpty()) {
            return null;
        }
        
        // 简单提取：如果关键短语包含偏好相关词汇
        if (!keyPhrases.contains("喜欢") && !keyPhrases.contains("爱好") && 
            !keyPhrases.contains("偏好")) {
            return null;
        }
        
        return UserMemory.builder()
            .userId(userId)
            .type(MemoryType.EMOTIONAL_PREFERENCE)
            .importance(MemoryImportance.NORMAL)
            .content(String.format("用户在%s情绪时提到：%s", 
                emotionRecord.getEmotionType(), keyPhrases))
            .structuredData(Map.of(
                "emotionType", emotionRecord.getEmotionType(),
                "keyPhrases", keyPhrases
            ))
            .source(MemorySource.SYSTEM_DETECTED)
            .sourceId(emotionRecord.getId() != null ? emotionRecord.getId().toString() : null)
            .confidence(emotionRecord.getConfidence() * 0.8) // 偏好记忆置信度稍低
            .createdAt(Instant.now())
            .lastAccessedAt(Instant.now())
            .accessCount(0)
            .tags(parseTags(emotionRecord.getEmotionTags()))
            .metadata(Map.of(
                "emotionType", emotionRecord.getEmotionType()
            ))
            .build();
    }
    
    /**
     * 解析标签字符串
     */
    private List<String> parseTags(String tagsStr) {
        if (tagsStr == null || tagsStr.isEmpty()) {
            return new ArrayList<>();
        }
        
        // 如果是逗号分隔的字符串
        if (tagsStr.contains(",")) {
            return Arrays.stream(tagsStr.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toList());
        }
        
        // 否则作为单个标签
        return Collections.singletonList(tagsStr.trim());
    }
}

