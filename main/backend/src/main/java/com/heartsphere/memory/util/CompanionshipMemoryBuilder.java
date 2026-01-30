package com.heartsphere.memory.util;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.*;

/**
 * 陪伴记忆构建器
 * 用于构建和管理陪伴相关的记忆，包括共同经历、情感共鸣时刻等
 * 
 * @author HeartSphere
 * @date 2026-01-25
 */
@Slf4j
@Component
public class CompanionshipMemoryBuilder {
    
    /**
     * 构建共同经历记忆
     * 
     * @param eventTitle 事件标题
     * @param eventDescription 事件描述
     * @param eventType 事件类型
     * @param emotionalTags 情感标签
     * @return 共同经历记忆对象
     */
    public Map<String, Object> buildSharedExperienceMemory(
            String eventTitle,
            String eventDescription,
            String eventType,
            List<String> emotionalTags) {
        
        Map<String, Object> memory = new LinkedHashMap<>();
        memory.put("type", "SHARED_EXPERIENCE");
        memory.put("title", eventTitle);
        memory.put("description", eventDescription);
        memory.put("eventType", eventType);
        memory.put("emotionalTags", emotionalTags != null ? emotionalTags : Collections.emptyList());
        memory.put("timestamp", LocalDateTime.now().toString());
        memory.put("significance", calculateSignificance(eventDescription, emotionalTags));
        
        return memory;
    }
    
    /**
     * 构建情感共鸣记忆
     * 
     * @param resonanceType 共鸣类型
     * @param userMessage 用户消息
     * @param characterResponse 角色回应
     * @param emotionalIntensity 情感强度 (0-100)
     * @return 情感共鸣记忆对象
     */
    public Map<String, Object> buildEmotionalResonanceMemory(
            String resonanceType,
            String userMessage,
            String characterResponse,
            int emotionalIntensity) {
        
        Map<String, Object> memory = new LinkedHashMap<>();
        memory.put("type", "EMOTIONAL_RESONANCE");
        memory.put("resonanceType", resonanceType);
        memory.put("userMessage", userMessage);
        memory.put("characterResponse", characterResponse);
        memory.put("emotionalIntensity", emotionalIntensity);
        memory.put("timestamp", LocalDateTime.now().toString());
        memory.put("significance", calculateResonanceSignificance(emotionalIntensity));
        
        return memory;
    }
    
    /**
     * 构建陪伴关怀记忆
     * 
     * @param careType 关怀类型（主动关怀/定期问候/情感支持）
     * @param careMessage 关怀消息
     * @param userEmotionState 用户情绪状态
     * @return 陪伴关怀记忆对象
     */
    public Map<String, Object> buildCompanionshipCareMemory(
            String careType,
            String careMessage,
            String userEmotionState) {
        
        Map<String, Object> memory = new LinkedHashMap<>();
        memory.put("type", "COMPANIONSHIP_CARE");
        memory.put("careType", careType);
        memory.put("careMessage", careMessage);
        memory.put("userEmotionState", userEmotionState);
        memory.put("timestamp", LocalDateTime.now().toString());
        memory.put("significance", calculateCareSignificance(careType, userEmotionState));
        
        return memory;
    }
    
    /**
     * 计算事件重要性
     */
    private int calculateSignificance(String description, List<String> emotionalTags) {
        int significance = 50; // 基础分数
        
        // 描述长度影响重要性
        if (description != null) {
            if (description.length() > 200) {
                significance += 20;
            } else if (description.length() > 100) {
                significance += 10;
            }
        }
        
        // 情感标签数量影响重要性
        if (emotionalTags != null && !emotionalTags.isEmpty()) {
            significance += emotionalTags.size() * 5;
        }
        
        return Math.min(100, significance);
    }
    
    /**
     * 计算共鸣重要性
     */
    private int calculateResonanceSignificance(int emotionalIntensity) {
        // 情感强度直接影响重要性
        return Math.min(100, emotionalIntensity);
    }
    
    /**
     * 计算关怀重要性
     */
    private int calculateCareSignificance(String careType, String userEmotionState) {
        int significance = 50; // 基础分数
        
        // 主动关怀比定期问候更重要
        if ("ACTIVE_CARE".equals(careType)) {
            significance += 30;
        } else if ("SCHEDULED_GREETING".equals(careType)) {
            significance += 10;
        }
        
        // 用户情绪低落时，关怀更重要
        if (userEmotionState != null) {
            String[] negativeEmotions = {"sad", "angry", "anxious", "frustrated", "lonely"};
            for (String emotion : negativeEmotions) {
                if (userEmotionState.toLowerCase().contains(emotion)) {
                    significance += 20;
                    break;
                }
            }
        }
        
        return Math.min(100, significance);
    }
    
    /**
     * 合并多个记忆为记忆集合
     */
    public List<Map<String, Object>> mergeMemories(List<Map<String, Object>> memories) {
        if (memories == null || memories.isEmpty()) {
            return new ArrayList<>();
        }
        
        // 按时间排序
        memories.sort((m1, m2) -> {
            String t1 = (String) m1.get("timestamp");
            String t2 = (String) m2.get("timestamp");
            if (t1 == null || t2 == null) {
                return 0;
            }
            return t2.compareTo(t1); // 降序
        });
        
        return memories;
    }
}
