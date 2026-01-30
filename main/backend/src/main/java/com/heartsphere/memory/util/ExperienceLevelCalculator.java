package com.heartsphere.memory.util;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

/**
 * 经验等级计算工具
 * 用于计算角色的经验等级和成长阶段
 * 
 * @author HeartSphere
 * @date 2026-01-24
 */
@Slf4j
@Component
public class ExperienceLevelCalculator {
    
    /**
     * 等级定义
     */
    public enum ExperienceLevel {
        L1_NOVICE(1, "新手", 0, 5, 0),           // 资产数 0-5
        L2_BEGINNER(2, "初级", 6, 20, 60),       // 资产数 6-20，平均信任度 >= 60
        L3_INTERMEDIATE(3, "中级", 21, 50, 70),  // 资产数 21-50，平均信任度 >= 70
        L4_ADVANCED(4, "高级", 51, 100, 80),     // 资产数 51-100，平均信任度 >= 80
        L5_EXPERT(5, "专家", 101, Integer.MAX_VALUE, 85);  // 资产数 > 100，平均信任度 >= 85
        
        public final int level;
        public final String name;
        public final int minAssets;
        public final int maxAssets;
        public final int minTrustScore;
        
        ExperienceLevel(int level, String name, int minAssets, int maxAssets, int minTrustScore) {
            this.level = level;
            this.name = name;
            this.minAssets = minAssets;
            this.maxAssets = maxAssets;
            this.minTrustScore = minTrustScore;
        }
    }
    
    /**
     * 计算角色的经验等级
     * 
     * @param assetCount 知识资产总数
     * @param averageTrustScore 平均信任度 (0-100)
     * @return 经验等级
     */
    public ExperienceLevel calculateLevel(long assetCount, double averageTrustScore) {
        // 处理 null 情况
        if (Double.isNaN(averageTrustScore)) {
            averageTrustScore = 0;
        }
        
        int trustScore = (int) Math.round(averageTrustScore);
        
        // 按资产数量和信任度判断等级
        if (assetCount >= ExperienceLevel.L5_EXPERT.minAssets && trustScore >= ExperienceLevel.L5_EXPERT.minTrustScore) {
            return ExperienceLevel.L5_EXPERT;
        }
        
        if (assetCount >= ExperienceLevel.L4_ADVANCED.minAssets && trustScore >= ExperienceLevel.L4_ADVANCED.minTrustScore) {
            return ExperienceLevel.L4_ADVANCED;
        }
        
        if (assetCount >= ExperienceLevel.L3_INTERMEDIATE.minAssets && trustScore >= ExperienceLevel.L3_INTERMEDIATE.minTrustScore) {
            return ExperienceLevel.L3_INTERMEDIATE;
        }
        
        if (assetCount >= ExperienceLevel.L2_BEGINNER.minAssets && trustScore >= ExperienceLevel.L2_BEGINNER.minTrustScore) {
            return ExperienceLevel.L2_BEGINNER;
        }
        
        return ExperienceLevel.L1_NOVICE;
    }
    
    /**
     * 根据前一个等级判断是否发生了晋升
     * 
     * @param previousLevel 前一个等级
     * @param currentLevel 当前等级
     * @return 是否发生了晋升
     */
    public boolean isLevelUp(ExperienceLevel previousLevel, ExperienceLevel currentLevel) {
        if (previousLevel == null || currentLevel == null) {
            return false;
        }
        return currentLevel.level > previousLevel.level;
    }
    
    /**
     * 获取晋升到下一等级需要的资产数量
     * 
     * @param currentLevel 当前等级
     * @return 需要的资产数量
     */
    public long getNextLevelAssetRequirement(ExperienceLevel currentLevel) {
        if (currentLevel == null || currentLevel == ExperienceLevel.L5_EXPERT) {
            return Long.MAX_VALUE;
        }
        
        return switch (currentLevel) {
            case L1_NOVICE -> ExperienceLevel.L2_BEGINNER.minAssets;
            case L2_BEGINNER -> ExperienceLevel.L3_INTERMEDIATE.minAssets;
            case L3_INTERMEDIATE -> ExperienceLevel.L4_ADVANCED.minAssets;
            case L4_ADVANCED -> ExperienceLevel.L5_EXPERT.minAssets;
            default -> Long.MAX_VALUE;
        };
    }
    
    /**
     * 获取晋升到下一等级需要的信任度
     * 
     * @param currentLevel 当前等级
     * @return 需要的信任度百分比
     */
    public int getNextLevelTrustRequirement(ExperienceLevel currentLevel) {
        if (currentLevel == null || currentLevel == ExperienceLevel.L5_EXPERT) {
            return 100;
        }
        
        return switch (currentLevel) {
            case L1_NOVICE -> ExperienceLevel.L2_BEGINNER.minTrustScore;
            case L2_BEGINNER -> ExperienceLevel.L3_INTERMEDIATE.minTrustScore;
            case L3_INTERMEDIATE -> ExperienceLevel.L4_ADVANCED.minTrustScore;
            case L4_ADVANCED -> ExperienceLevel.L5_EXPERT.minTrustScore;
            default -> 100;
        };
    }
    
    /**
     * 获取等级的进度百分比（0-100）
     * 用于显示进度条
     * 
     * @param assetCount 当前资产数
     * @param currentLevel 当前等级
     * @return 进度百分比
     */
    public int getProgressPercentage(long assetCount, ExperienceLevel currentLevel) {
        if (currentLevel == null || currentLevel == ExperienceLevel.L5_EXPERT) {
            return 100;
        }
        
        long currentLevelMin = currentLevel.minAssets;
        long nextLevelMin = getNextLevelAssetRequirement(currentLevel);
        
        if (assetCount < currentLevelMin) {
            return 0;
        }
        
        if (nextLevelMin == Long.MAX_VALUE) {
            return 100;
        }
        
        long range = nextLevelMin - currentLevelMin;
        long progress = assetCount - currentLevelMin;
        
        return (int) Math.min(100, (progress * 100) / range);
    }
    
    /**
     * 获取等级的描述信息
     */
    public String getLevelDescription(ExperienceLevel level) {
        if (level == null) {
            return "未知";
        }
        
        return switch (level) {
            case L1_NOVICE -> "角色刚开始学习，知识积累还很有限";
            case L2_BEGINNER -> "角色已有基础知识，但经验还不足";
            case L3_INTERMEDIATE -> "角色知识系统完整，可靠性较高";
            case L4_ADVANCED -> "角色经验丰富，判断相对可信";
            case L5_EXPERT -> "角色是该领域的顶级专家，知识深度和广度都很高";
        };
    }
}
