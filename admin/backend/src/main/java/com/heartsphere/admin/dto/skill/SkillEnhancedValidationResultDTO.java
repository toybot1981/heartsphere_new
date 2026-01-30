package com.heartsphere.admin.dto.skill;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

/**
 * 增强验证结果 DTO
 * 包含基础验证、结构验证、质量验证、渐进式披露验证结果
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SkillEnhancedValidationResultDTO {
    
    /**
     * 整体验证是否通过
     */
    private boolean valid;
    
    /**
     * 基础验证结果
     */
    private ValidationSection basicValidation;
    
    /**
     * 结构验证结果
     */
    private ValidationSection structureValidation;
    
    /**
     * 质量验证结果
     */
    private ValidationSection qualityValidation;
    
    /**
     * 渐进式披露验证结果
     */
    private ValidationSection progressiveDisclosureValidation;
    
    /**
     * 所有错误列表
     */
    @Builder.Default
    private List<String> allErrors = new ArrayList<>();
    
    /**
     * 所有警告列表
     */
    @Builder.Default
    private List<String> allWarnings = new ArrayList<>();
    
    /**
     * 验证部分
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ValidationSection {
        /**
         * 是否通过
         */
        private boolean passed;
        
        /**
         * 错误列表
         */
        @Builder.Default
        private List<String> errors = new ArrayList<>();
        
        /**
         * 警告列表
         */
        @Builder.Default
        private List<String> warnings = new ArrayList<>();
    }
}
