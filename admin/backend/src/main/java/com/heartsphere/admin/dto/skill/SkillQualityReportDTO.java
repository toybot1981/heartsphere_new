package com.heartsphere.admin.dto.skill;

import lombok.Data;
import java.util.List;

/**
 * 技能质量报告DTO
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Data
public class SkillQualityReportDTO {
    private int totalScore;
    private int descriptionScore;
    private String descriptionLevel;
    private List<String> descriptionSuggestions;
    private int completenessScore;
    private List<String> missingFields;
    private List<String> completenessSuggestions;
}
