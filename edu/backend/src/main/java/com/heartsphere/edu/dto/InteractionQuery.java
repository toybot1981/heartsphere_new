package com.heartsphere.edu.dto;

import com.heartsphere.edu.entity.EduCharacterInteraction;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 互动记录查询条件 DTO
 */
@Data
public class InteractionQuery {
    private Long studentId;  // 学生ID（用于查询方法内部，不需要在Controller中设置）
    private Long characterId;  // 可选，筛选特定角色
    private EduCharacterInteraction.InteractionType interactionType;  // 可选，筛选特定类型
    private LocalDateTime startDate;  // 可选，开始日期
    private LocalDateTime endDate;  // 可选，结束日期
}
