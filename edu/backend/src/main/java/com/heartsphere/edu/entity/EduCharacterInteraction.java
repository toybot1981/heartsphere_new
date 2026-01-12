package com.heartsphere.edu.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * 教育版数字人互动记录实体
 */
@Data
@Entity
@Table(name = "edu_character_interactions")
public class EduCharacterInteraction {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "student_id", nullable = false)
    private Long studentId;
    
    @Column(name = "character_id", nullable = false)
    private Long characterId;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "interaction_type", nullable = false, length = 50)
    private InteractionType interactionType;
    
    @Column(name = "conversation_content", columnDefinition = "TEXT")
    private String conversationContent; // JSON 格式存储对话内容
    
    @Column(name = "learning_topics", columnDefinition = "JSON")
    @Convert(converter = com.heartsphere.edu.entity.converter.ListToJsonConverter.class)
    private java.util.List<String> learningTopics;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "comprehension_level", length = 30)
    private ComprehensionLevel comprehensionLevel;
    
    @Column(name = "student_rating")
    private Integer studentRating; // 1-5 星
    
    @Column(name = "student_feedback", columnDefinition = "TEXT")
    private String studentFeedback;
    
    @Column(name = "start_time", nullable = false)
    private LocalDateTime startTime;
    
    @Column(name = "end_time")
    private LocalDateTime endTime;
    
    @Column(name = "duration_minutes")
    private Integer durationMinutes;
    
    @Column(name = "created_at")
    @CreationTimestamp
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    @UpdateTimestamp
    private LocalDateTime updatedAt;
    
    /**
     * 互动类型枚举
     */
    public enum InteractionType {
        TEACHING_DIALOGUE("teaching_dialogue", "教学对话"),
        HOMEWORK_HELP("homework_help", "作业辅导"),
        COUNSELING("counseling", "心理疏导"),
        KNOWLEDGE_EXPLANATION("knowledge_explanation", "知识讲解"),
        PRACTICE_EXERCISE("practice_exercise", "练习训练");
        
        private final String code;
        private final String label;
        
        InteractionType(String code, String label) {
            this.code = code;
            this.label = label;
        }
        
        public String getCode() {
            return code;
        }
        
        public String getLabel() {
            return label;
        }
    }
    
    /**
     * 理解程度枚举
     */
    public enum ComprehensionLevel {
        NOT_UNDERSTOOD("not_understood", "不理解"),
        PARTIALLY_UNDERSTOOD("partially_understood", "部分理解"),
        WELL_UNDERSTOOD("well_understood", "理解良好"),
        MASTERED("mastered", "已掌握");
        
        private final String code;
        private final String label;
        
        ComprehensionLevel(String code, String label) {
            this.code = code;
            this.label = label;
        }
        
        public String getCode() {
            return code;
        }
        
        public String getLabel() {
            return label;
        }
    }
}
