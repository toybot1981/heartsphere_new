package com.heartsphere.edu.dto;

import com.heartsphere.edu.entity.EduCharacter;
import lombok.AllArgsConstructor;
import lombok.Data;

/**
 * 数字人角色推荐结果 DTO
 */
@Data
@AllArgsConstructor
public class CharacterRecommendation {
    private EduCharacter character;
    private String reason;  // 推荐原因
    private Double relevanceScore;  // 相关性分数（0-1）
}
