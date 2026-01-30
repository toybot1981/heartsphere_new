package com.heartsphere.memory.util;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Map;

/**
 * 关系深度计算器
 * 用于计算角色与用户的关系深度，基于交互频率、情感连接、共同经历等维度
 * 
 * @author HeartSphere
 * @date 2026-01-25
 */
@Slf4j
@Component
public class RelationshipDepthCalculator {
    
    /**
     * 关系阶段枚举
     */
    public enum RelationshipStage {
        STRANGER("陌生人", 0, 30),
        FRIEND("朋友", 30, 60),
        CLOSE_FRIEND("挚友", 60, 80),
        MENTOR("导师", 80, 100);
        
        private final String name;
        private final int minScore;
        private final int maxScore;
        
        RelationshipStage(String name, int minScore, int maxScore) {
            this.name = name;
            this.minScore = minScore;
            this.maxScore = maxScore;
        }
        
        public String getName() {
            return name;
        }
        
        public int getMinScore() {
            return minScore;
        }
        
        public int getMaxScore() {
            return maxScore;
        }
        
        public static RelationshipStage fromScore(int score) {
            if (score >= MENTOR.minScore) {
                return MENTOR;
            } else if (score >= CLOSE_FRIEND.minScore) {
                return CLOSE_FRIEND;
            } else if (score >= FRIEND.minScore) {
                return FRIEND;
            } else {
                return STRANGER;
            }
        }
    }
    
    /**
     * 计算关系深度分数
     * 
     * @param interactionCount 交互次数
     * @param emotionalConnectionScore 情感连接分数 (0-100)
     * @param sharedExperienceCount 共同经历数量
     * @param positiveFeedbackRatio 正面反馈比例 (0-1)
     * @param daysSinceFirstInteraction 首次交互至今的天数
     * @return 关系深度分数 (0-100)
     */
    public int calculateRelationshipDepth(
            int interactionCount,
            int emotionalConnectionScore,
            int sharedExperienceCount,
            double positiveFeedbackRatio,
            long daysSinceFirstInteraction) {
        
        // 1. 交互频率维度 (权重: 30%)
        int interactionScore = calculateInteractionScore(interactionCount, daysSinceFirstInteraction);
        
        // 2. 情感连接维度 (权重: 30%)
        int emotionalScore = emotionalConnectionScore;
        
        // 3. 共同经历维度 (权重: 20%)
        int experienceScore = calculateExperienceScore(sharedExperienceCount);
        
        // 4. 用户反馈维度 (权重: 20%)
        int feedbackScore = (int) (positiveFeedbackRatio * 100);
        
        // 加权平均
        int totalScore = (int) (
            interactionScore * 0.3 +
            emotionalScore * 0.3 +
            experienceScore * 0.2 +
            feedbackScore * 0.2
        );
        
        // 限制在 0-100 范围内
        return Math.max(0, Math.min(100, totalScore));
    }
    
    /**
     * 计算交互频率分数
     */
    private int calculateInteractionScore(int interactionCount, long daysSinceFirstInteraction) {
        if (daysSinceFirstInteraction == 0) {
            daysSinceFirstInteraction = 1; // 避免除零
        }
        
        // 平均每天交互次数
        double avgDailyInteractions = (double) interactionCount / daysSinceFirstInteraction;
        
        // 根据平均交互频率计算分数
        // 每天 >= 1 次交互: 100分
        // 每天 >= 0.5 次交互: 80分
        // 每天 >= 0.1 次交互: 60分
        // 每天 >= 0.05 次交互: 40分
        // 其他: 20分
        if (avgDailyInteractions >= 1.0) {
            return 100;
        } else if (avgDailyInteractions >= 0.5) {
            return 80;
        } else if (avgDailyInteractions >= 0.1) {
            return 60;
        } else if (avgDailyInteractions >= 0.05) {
            return 40;
        } else {
            return 20;
        }
    }
    
    /**
     * 计算共同经历分数
     */
    private int calculateExperienceScore(int sharedExperienceCount) {
        // 共同经历数量越多，分数越高
        // >= 10 个: 100分
        // >= 5 个: 80分
        // >= 3 个: 60分
        // >= 1 个: 40分
        // 0 个: 0分
        if (sharedExperienceCount >= 10) {
            return 100;
        } else if (sharedExperienceCount >= 5) {
            return 80;
        } else if (sharedExperienceCount >= 3) {
            return 60;
        } else if (sharedExperienceCount >= 1) {
            return 40;
        } else {
            return 0;
        }
    }
    
    /**
     * 根据关系深度分数确定关系阶段
     */
    public RelationshipStage determineRelationshipStage(int relationshipDepthScore) {
        return RelationshipStage.fromScore(relationshipDepthScore);
    }
    
    /**
     * 检查是否需要阶段转换
     */
    public boolean shouldTransitionStage(RelationshipStage currentStage, RelationshipStage newStage) {
        return !currentStage.equals(newStage);
    }
}
