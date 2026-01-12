package com.heartsphere.edu.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;

/**
 * 数字人角色统计信息 DTO
 */
@Data
@AllArgsConstructor
public class CharacterStatistics {
    private Long characterId;
    private String characterName;
    private Long totalInteractions;  // 总互动次数
    private Long uniqueStudents;  // 互动过的学生数量
    private BigDecimal averageRating;  // 平均评分
    private Long totalDurationMinutes;  // 总互动时长（分钟）
}
