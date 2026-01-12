package com.heartsphere.edu.dto;

import com.heartsphere.edu.entity.EduCharacter;
import lombok.Data;

import java.util.List;

/**
 * 数字人角色查询条件 DTO
 */
@Data
public class CharacterQuery {
    private EduCharacter.CharacterType characterType;
    private String ageGroup;  // "primary_6_12" or "secondary_13_18"
    private List<String> subjectTags;
    private EduCharacter.DifficultyLevel difficultyLevel;
    private String searchKeyword;  // 搜索关键词（名称或描述）
    private Long studentId;  // 学生创建的
    private Long teacherId;  // 教师创建的
    private Boolean isEnabled;  // 是否启用
}
