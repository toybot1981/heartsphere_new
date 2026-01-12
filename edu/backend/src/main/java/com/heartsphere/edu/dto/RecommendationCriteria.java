package com.heartsphere.edu.dto;

import lombok.Data;

import java.util.List;

/**
 * 推荐条件 DTO
 */
@Data
public class RecommendationCriteria {
    private String ageGroup;  // "primary_6_12" or "secondary_13_18"
    private List<String> subjectInterests;  // 学科兴趣
    private Integer limit = 10;  // 推荐数量限制
    private Boolean includeHistory = true;  // 是否基于历史互动推荐
}
