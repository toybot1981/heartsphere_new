package com.heartsphere.admin.service.skill;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * SkillTemplateService 单元测试
 * 
 * @author HeartSphere
 * @version 1.0
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("技能模板服务测试")
class SkillTemplateServiceTest {
    
    @InjectMocks
    private SkillTemplateService templateService;
    
    @BeforeEach
    void setUp() {
        // 服务是纯逻辑，无需额外设置
    }
    
    @Test
    @DisplayName("获取所有模板")
    void testGetAllTemplates() {
        // When
        List<SkillTemplateService.SkillTemplate> templates = templateService.getAllTemplates();
        
        // Then
        assertThat(templates).isNotNull();
        assertThat(templates).isNotEmpty();
        assertThat(templates.size()).isGreaterThanOrEqualTo(4); // 至少4个预定义模板
    }
    
    @Test
    @DisplayName("根据分类获取模板")
    void testGetTemplatesByCategory() {
        // When
        List<SkillTemplateService.SkillTemplate> templates = templateService.getTemplatesByCategory("UTILITY");
        
        // Then
        assertThat(templates).isNotNull();
        assertThat(templates).isNotEmpty();
        assertThat(templates.get(0).getCategory()).isEqualTo("UTILITY");
    }
    
    @Test
    @DisplayName("获取不存在的分类模板")
    void testGetTemplatesByCategory_NotFound() {
        // When
        List<SkillTemplateService.SkillTemplate> templates = templateService.getTemplatesByCategory("NON_EXISTENT");
        
        // Then
        assertThat(templates).isNotNull();
        assertThat(templates).isEmpty();
    }
    
    @Test
    @DisplayName("模板包含必要字段")
    void testTemplateHasRequiredFields() {
        // When
        List<SkillTemplateService.SkillTemplate> templates = templateService.getAllTemplates();
        
        // Then
        for (SkillTemplateService.SkillTemplate template : templates) {
            assertThat(template.getId()).isNotNull();
            assertThat(template.getName()).isNotNull();
            assertThat(template.getCategory()).isNotNull();
            assertThat(template.getDescription()).isNotNull();
        }
    }
    
    @Test
    @DisplayName("UTILITY模板存在")
    void testUtilityTemplateExists() {
        // When
        List<SkillTemplateService.SkillTemplate> templates = templateService.getTemplatesByCategory("UTILITY");
        
        // Then
        assertThat(templates).isNotEmpty();
        boolean hasUtility = templates.stream()
            .anyMatch(t -> "UTILITY".equals(t.getCategory()));
        assertThat(hasUtility).isTrue();
    }
}
