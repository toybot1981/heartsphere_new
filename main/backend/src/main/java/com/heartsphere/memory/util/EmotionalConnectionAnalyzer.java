package com.heartsphere.memory.util;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

/**
 * 情感连接分析器
 * 用于分析角色与用户之间的情感连接深度
 * 
 * @author HeartSphere
 * @date 2026-01-25
 */
@Slf4j
@Component
public class EmotionalConnectionAnalyzer {
    
    /**
     * 计算情感连接分数
     * 
     * @param emotionalResonanceCount 情感共鸣次数
     * @param emotionalMemoryCount 情感记忆数量
     * @param positiveEmotionRatio 正面情绪比例 (0-1)
     * @param deepConversationCount 深度对话次数
     * @return 情感连接分数 (0-100)
     */
    public int calculateEmotionalConnectionScore(
            int emotionalResonanceCount,
            int emotionalMemoryCount,
            double positiveEmotionRatio,
            int deepConversationCount) {
        
        // 1. 情感共鸣维度 (权重: 30%)
        int resonanceScore = calculateResonanceScore(emotionalResonanceCount);
        
        // 2. 情感记忆维度 (权重: 30%)
        int memoryScore = calculateMemoryScore(emotionalMemoryCount);
        
        // 3. 情绪倾向维度 (权重: 20%)
        int emotionScore = (int) (positiveEmotionRatio * 100);
        
        // 4. 深度对话维度 (权重: 20%)
        int conversationScore = calculateConversationScore(deepConversationCount);
        
        // 加权平均
        int totalScore = (int) (
            resonanceScore * 0.3 +
            memoryScore * 0.3 +
            emotionScore * 0.2 +
            conversationScore * 0.2
        );
        
        // 限制在 0-100 范围内
        return Math.max(0, Math.min(100, totalScore));
    }
    
    /**
     * 计算情感共鸣分数
     */
    private int calculateResonanceScore(int emotionalResonanceCount) {
        // 情感共鸣次数越多，分数越高
        // >= 20 次: 100分
        // >= 10 次: 80分
        // >= 5 次: 60分
        // >= 2 次: 40分
        // >= 1 次: 20分
        // 0 次: 0分
        if (emotionalResonanceCount >= 20) {
            return 100;
        } else if (emotionalResonanceCount >= 10) {
            return 80;
        } else if (emotionalResonanceCount >= 5) {
            return 60;
        } else if (emotionalResonanceCount >= 2) {
            return 40;
        } else if (emotionalResonanceCount >= 1) {
            return 20;
        } else {
            return 0;
        }
    }
    
    /**
     * 计算情感记忆分数
     */
    private int calculateMemoryScore(int emotionalMemoryCount) {
        // 情感记忆数量越多，分数越高
        // >= 15 个: 100分
        // >= 8 个: 80分
        // >= 4 个: 60分
        // >= 2 个: 40分
        // >= 1 个: 20分
        // 0 个: 0分
        if (emotionalMemoryCount >= 15) {
            return 100;
        } else if (emotionalMemoryCount >= 8) {
            return 80;
        } else if (emotionalMemoryCount >= 4) {
            return 60;
        } else if (emotionalMemoryCount >= 2) {
            return 40;
        } else if (emotionalMemoryCount >= 1) {
            return 20;
        } else {
            return 0;
        }
    }
    
    /**
     * 计算深度对话分数
     */
    private int calculateConversationScore(int deepConversationCount) {
        // 深度对话次数越多，分数越高
        // >= 10 次: 100分
        // >= 5 次: 80分
        // >= 3 次: 60分
        // >= 1 次: 40分
        // 0 次: 0分
        if (deepConversationCount >= 10) {
            return 100;
        } else if (deepConversationCount >= 5) {
            return 80;
        } else if (deepConversationCount >= 3) {
            return 60;
        } else if (deepConversationCount >= 1) {
            return 40;
        } else {
            return 0;
        }
    }
    
    /**
     * 检测情感共鸣时刻
     * 在实际应用中，这里可以集成AI分析对话内容
     */
    public boolean detectEmotionalResonance(String userMessage, String characterResponse) {
        // TODO: 集成AI分析对话内容，检测情感共鸣
        // 当前实现：简单检测关键词
        if (userMessage == null || characterResponse == null) {
            return false;
        }
        
        String[] resonanceKeywords = {
            "理解", "感同身受", "共鸣", "心有灵犀", "懂我",
            "理解", "明白", "知道", "体会", "感受"
        };
        
        String combined = userMessage.toLowerCase() + " " + characterResponse.toLowerCase();
        for (String keyword : resonanceKeywords) {
            if (combined.contains(keyword)) {
                return true;
            }
        }
        
        return false;
    }
}
