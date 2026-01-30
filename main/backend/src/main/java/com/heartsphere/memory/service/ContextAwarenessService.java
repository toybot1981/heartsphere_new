package com.heartsphere.memory.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;

/**
 * 情境感知服务
 * 用于分析对话情境和用户需求，选择最佳响应模式
 * 
 * @author HeartSphere
 * @date 2026-01-25
 */
@Slf4j
@Service
public class ContextAwarenessService {
    
    /**
     * 响应模式枚举
     */
    public enum ResponseMode {
        COMPANION("挚友模式", "温暖、理解、陪伴、支持"),
        MENTOR("导师模式", "专业、指导、启发、教育"),
        NEUTRAL("中性模式", "平衡、自然、友好");
        
        private final String name;
        private final String description;
        
        ResponseMode(String name, String description) {
            this.name = name;
            this.description = description;
        }
        
        public String getName() {
            return name;
        }
        
        public String getDescription() {
            return description;
        }
    }
    
    /**
     * 分析对话情境
     * 
     * @param userMessage 用户消息
     * @param conversationHistory 对话历史
     * @param userEmotionState 用户情绪状态
     * @return 情境分析结果
     */
    public Map<String, Object> analyzeContext(
            String userMessage,
            List<String> conversationHistory,
            String userEmotionState) {
        
        Map<String, Object> context = new LinkedHashMap<>();
        
        // 1. 检测用户意图
        String userIntent = detectUserIntent(userMessage);
        context.put("userIntent", userIntent);
        
        // 2. 检测情感需求
        boolean hasEmotionalNeed = detectEmotionalNeed(userMessage, userEmotionState);
        context.put("hasEmotionalNeed", hasEmotionalNeed);
        
        // 3. 检测学习需求
        boolean hasLearningNeed = detectLearningNeed(userMessage);
        context.put("hasLearningNeed", hasLearningNeed);
        
        // 4. 确定最佳响应模式
        ResponseMode recommendedMode = determineResponseMode(userIntent, hasEmotionalNeed, hasLearningNeed);
        context.put("recommendedMode", recommendedMode);
        context.put("recommendedModeName", recommendedMode.getName());
        context.put("recommendedModeDescription", recommendedMode.getDescription());
        
        // 5. 计算模式切换置信度
        double confidence = calculateModeConfidence(userIntent, hasEmotionalNeed, hasLearningNeed);
        context.put("confidence", confidence);
        
        return context;
    }
    
    /**
     * 检测用户意图
     */
    private String detectUserIntent(String userMessage) {
        if (userMessage == null || userMessage.trim().isEmpty()) {
            return "UNKNOWN";
        }
        
        String messageLower = userMessage.toLowerCase();
        
        // 指导相关关键词
        String[] guidanceKeywords = {
            "怎么", "如何", "怎样", "教我", "指导", "建议", "方法", "技巧",
            "学习", "学会", "掌握", "了解", "理解", "解释", "说明"
        };
        
        // 情感相关关键词
        String[] emotionalKeywords = {
            "心情", "感觉", "情绪", "难过", "开心", "焦虑", "担心", "害怕",
            "孤独", "寂寞", "陪伴", "理解", "支持", "安慰", "倾听"
        };
        
        // 检查指导意图
        for (String keyword : guidanceKeywords) {
            if (messageLower.contains(keyword)) {
                return "SEEK_GUIDANCE";
            }
        }
        
        // 检查情感意图
        for (String keyword : emotionalKeywords) {
            if (messageLower.contains(keyword)) {
                return "SEEK_EMOTIONAL_SUPPORT";
            }
        }
        
        return "GENERAL_CONVERSATION";
    }
    
    /**
     * 检测情感需求
     */
    private boolean detectEmotionalNeed(String userMessage, String userEmotionState) {
        // 如果用户情绪状态明确为负面，则存在情感需求
        if (userEmotionState != null) {
            String[] negativeEmotions = {"sad", "angry", "anxious", "frustrated", "lonely", "depressed"};
            String emotionLower = userEmotionState.toLowerCase();
            for (String emotion : negativeEmotions) {
                if (emotionLower.contains(emotion)) {
                    return true;
                }
            }
        }
        
        // 检查消息中的情感关键词
        if (userMessage != null) {
            String messageLower = userMessage.toLowerCase();
            String[] emotionalKeywords = {
                "难过", "伤心", "焦虑", "担心", "害怕", "孤独", "寂寞",
                "不开心", "心情不好", "情绪低落", "需要陪伴", "需要理解"
            };
            
            for (String keyword : emotionalKeywords) {
                if (messageLower.contains(keyword)) {
                    return true;
                }
            }
        }
        
        return false;
    }
    
    /**
     * 检测学习需求
     */
    private boolean detectLearningNeed(String userMessage) {
        if (userMessage == null) {
            return false;
        }
        
        String messageLower = userMessage.toLowerCase();
        String[] learningKeywords = {
            "怎么", "如何", "怎样", "教我", "学习", "学会", "掌握",
            "了解", "理解", "解释", "说明", "方法", "技巧", "建议"
        };
        
        for (String keyword : learningKeywords) {
            if (messageLower.contains(keyword)) {
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * 确定最佳响应模式
     */
    private ResponseMode determineResponseMode(
            String userIntent,
            boolean hasEmotionalNeed,
            boolean hasLearningNeed) {
        
        // 优先级1: 明确的情感需求 → 挚友模式
        if (hasEmotionalNeed || "SEEK_EMOTIONAL_SUPPORT".equals(userIntent)) {
            return ResponseMode.COMPANION;
        }
        
        // 优先级2: 明确的学习需求 → 导师模式
        if (hasLearningNeed || "SEEK_GUIDANCE".equals(userIntent)) {
            return ResponseMode.MENTOR;
        }
        
        // 默认: 中性模式
        return ResponseMode.NEUTRAL;
    }
    
    /**
     * 计算模式切换置信度
     */
    private double calculateModeConfidence(
            String userIntent,
            boolean hasEmotionalNeed,
            boolean hasLearningNeed) {
        
        double confidence = 0.5; // 基础置信度
        
        // 明确的意图增加置信度
        if ("SEEK_EMOTIONAL_SUPPORT".equals(userIntent) || "SEEK_GUIDANCE".equals(userIntent)) {
            confidence += 0.3;
        }
        
        // 明确的需求增加置信度
        if (hasEmotionalNeed || hasLearningNeed) {
            confidence += 0.2;
        }
        
        return Math.min(1.0, confidence);
    }
    
    /**
     * 判断是否需要主动介入
     */
    public boolean shouldIntervene(
            String userMessage,
            String userEmotionState,
            long timeSinceLastInteraction) {
        
        // 1. 检测到强烈的负面情绪
        if (userEmotionState != null) {
            String[] strongNegativeEmotions = {"depressed", "suicidal", "crisis"};
            String emotionLower = userEmotionState.toLowerCase();
            for (String emotion : strongNegativeEmotions) {
                if (emotionLower.contains(emotion)) {
                    return true;
                }
            }
        }
        
        // 2. 检测到危机关键词
        if (userMessage != null) {
            String messageLower = userMessage.toLowerCase();
            String[] crisisKeywords = {
                "不想活了", "结束", "绝望", "没有希望", "崩溃", "撑不住"
            };
            for (String keyword : crisisKeywords) {
                if (messageLower.contains(keyword)) {
                    return true;
                }
            }
        }
        
        // 3. 长时间未交互（超过7天）
        if (timeSinceLastInteraction > 7 * 24 * 60 * 60 * 1000) {
            return true;
        }
        
        return false;
    }
    
    /**
     * 生成主动介入建议
     */
    public String generateInterventionSuggestion(
            String userMessage,
            String userEmotionState,
            ResponseMode mode) {
        
        if (mode == ResponseMode.COMPANION) {
            return "我注意到你最近可能有些困扰，想和你聊聊。有什么我可以帮助你的吗？";
        } else if (mode == ResponseMode.MENTOR) {
            return "我注意到你可能需要一些指导，我可以为你提供帮助。";
        } else {
            return "好久不见，想和你聊聊。";
        }
    }
}
