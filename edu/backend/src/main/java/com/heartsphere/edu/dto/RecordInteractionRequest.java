package com.heartsphere.edu.dto;

import com.heartsphere.edu.entity.EduCharacterInteraction;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 记录互动请求 DTO
 */
@Data
public class RecordInteractionRequest {
    private Long studentId;
    private Long characterId;
    private EduCharacterInteraction.InteractionType interactionType;
    private String conversationContent;  // JSON 格式的对话内容
    private List<String> learningTopics;
    private EduCharacterInteraction.ComprehensionLevel comprehensionLevel;
    private Integer studentRating;  // 1-5 星
    private String studentFeedback;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
}
