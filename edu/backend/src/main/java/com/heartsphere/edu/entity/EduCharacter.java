package com.heartsphere.edu.entity;

import com.heartsphere.edu.entity.converter.ListToJsonConverter;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * 教育版数字人角色实体
 */
@Data
@Entity
@Table(name = "edu_characters")
public class EduCharacter {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, length = 100)
    private String name;
    
    @Column(name = "avatar_url", length = 500)
    private String avatarUrl;
    
    @Column(name = "background_url", length = 500)
    private String backgroundUrl;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column(columnDefinition = "TEXT")
    private String bio;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "character_type", nullable = false, length = 50)
    private CharacterType characterType;
    
    @Column(name = "age_group_suitability", columnDefinition = "JSON")
    @Convert(converter = ListToJsonConverter.class)
    private List<String> ageGroupSuitability;
    
    @Column(name = "subject_tags", columnDefinition = "JSON")
    @Convert(converter = ListToJsonConverter.class)
    private List<String> subjectTags;
    
    @Column(name = "teaching_specialty", columnDefinition = "TEXT")
    private String teachingSpecialty;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "difficulty_level", length = 20)
    private DifficultyLevel difficultyLevel = DifficultyLevel.INTERMEDIATE;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "language_style", length = 20)
    private LanguageStyle languageStyle = LanguageStyle.FRIENDLY;
    
    @Column(name = "personality_traits", columnDefinition = "JSON")
    @Convert(converter = ListToJsonConverter.class)
    private List<String> personalityTraits;
    
    @Column(name = "first_message", columnDefinition = "TEXT")
    private String firstMessage;
    
    @Column(name = "system_instruction", columnDefinition = "TEXT")
    private String systemInstruction;
    
    @Column(name = "voice_name", length = 50)
    private String voiceName;
    
    @Column(name = "theme_color", length = 50)
    private String themeColor;
    
    @Column(name = "color_accent", length = 50)
    private String colorAccent;
    
    @Column(name = "student_id")
    private Long studentId;
    
    @Column(name = "teacher_id")
    private Long teacherId;
    
    @Column(name = "total_interactions")
    private Integer totalInteractions = 0;
    
    @Column(name = "unique_students")
    private Integer uniqueStudents = 0;
    
    @Column(name = "average_rating", precision = 3, scale = 2)
    private BigDecimal averageRating = BigDecimal.ZERO;
    
    @Column(name = "is_enabled")
    private Boolean isEnabled = true;
    
    @Column(name = "is_deleted")
    private Boolean isDeleted = false;
    
    @Column(name = "created_at")
    @CreationTimestamp
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    @UpdateTimestamp
    private LocalDateTime updatedAt;
    
    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;
    
    /**
     * 角色类型枚举
     */
    public enum CharacterType {
        TEACHING_ASSISTANT("teaching_assistant", "教学助手"),
        LEARNING_COMPANION("learning_companion", "学习伙伴"),
        COUNSELING("counseling", "心理辅导"),
        HOMEWORK_HELPER("homework_helper", "作业辅导"),
        SUBJECT_EXPLAINER("subject_explainer", "学科讲解");
        
        private final String code;
        private final String label;
        
        CharacterType(String code, String label) {
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
     * 难度等级枚举
     */
    public enum DifficultyLevel {
        BEGINNER("beginner", "初级"),
        INTERMEDIATE("intermediate", "中级"),
        ADVANCED("advanced", "高级");
        
        private final String code;
        private final String label;
        
        DifficultyLevel(String code, String label) {
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
     * 语言风格枚举
     */
    public enum LanguageStyle {
        FORMAL("formal", "正式"),
        CASUAL("casual", "随意"),
        FRIENDLY("friendly", "友好");
        
        private final String code;
        private final String label;
        
        LanguageStyle(String code, String label) {
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
