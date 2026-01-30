package com.heartsphere.admin.service.skill;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.HashMap;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * SkillQualityAnalyzer 单元测试
 * 
 * @author HeartSphere
 * @version 1.0
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("技能质量分析器测试")
class SkillQualityAnalyzerTest {
    
    @InjectMocks
    private SkillQualityAnalyzer qualityAnalyzer;
    
    @BeforeEach
    void setUp() {
        // 服务是纯逻辑，无需额外设置
    }
    
    @Test
    @DisplayName("分析高质量描述")
    void testAnalyzeDescription_HighQuality() {
        // Given
        String highQualityDescription = "这是一个时间管理助手技能。功能是帮助用户管理时间和任务，提供时间分析和任务分解功能。适用于需要提高工作效率的场景。";
        
        // When
        var result = qualityAnalyzer.analyzeDescription(highQualityDescription);
        
        // Then
        assertThat(result).isNotNull();
        assertThat(result.getScore()).isGreaterThanOrEqualTo(60);
        assertThat(result.getLevel()).isNotNull();
    }
    
    @Test
    @DisplayName("分析低质量描述")
    void testAnalyzeDescription_LowQuality() {
        // Given
        String lowQualityDescription = "时间管理";
        
        // When
        var result = qualityAnalyzer.analyzeDescription(lowQualityDescription);
        
        // Then
        assertThat(result).isNotNull();
        assertThat(result.getScore()).isLessThan(60);
        assertThat(result.getSuggestions()).isNotEmpty();
    }
    
    @Test
    @DisplayName("分析空描述")
    void testAnalyzeDescription_Empty() {
        // Given
        String emptyDescription = "";
        
        // When
        var result = qualityAnalyzer.analyzeDescription(emptyDescription);
        
        // Then
        assertThat(result).isNotNull();
        assertThat(result.getScore()).isEqualTo(0);
        assertThat(result.getSuggestions()).contains("技能描述不能为空");
    }
    
    @Test
    @DisplayName("分析null描述")
    void testAnalyzeDescription_Null() {
        // Given
        String nullDescription = null;
        
        // When
        var result = qualityAnalyzer.analyzeDescription(nullDescription);
        
        // Then
        assertThat(result).isNotNull();
        assertThat(result.getScore()).isEqualTo(0);
        assertThat(result.getSuggestions()).contains("技能描述不能为空");
    }
    
    @Test
    @DisplayName("检查完整技能数据")
    void testCheckCompleteness_Complete() {
        // Given
        Map<String, Object> completeSkillData = new HashMap<>();
        completeSkillData.put("skillId", "test-skill");
        completeSkillData.put("name", "测试技能");
        completeSkillData.put("description", "这是一个测试技能");
        completeSkillData.put("instruction", "技能指令内容");
        completeSkillData.put("category", "utility");
        
        // When
        var result = qualityAnalyzer.checkCompleteness(completeSkillData);
        
        // Then
        assertThat(result).isNotNull();
        assertThat(result.isComplete()).isTrue();
        assertThat(result.getMissingFields()).isEmpty();
    }
    
    @Test
    @DisplayName("检查不完整技能数据")
    void testCheckCompleteness_Incomplete() {
        // Given
        Map<String, Object> incompleteSkillData = new HashMap<>();
        incompleteSkillData.put("skillId", "test-skill");
        // 缺少 name 和 description
        
        // When
        var result = qualityAnalyzer.checkCompleteness(incompleteSkillData);
        
        // Then
        assertThat(result).isNotNull();
        assertThat(result.isComplete()).isFalse();
        assertThat(result.getMissingFields()).isNotEmpty();
        assertThat(result.getMissingFields()).contains("技能名称");
        assertThat(result.getMissingFields()).contains("技能描述");
    }
    
    @Test
    @DisplayName("检查MCP工具配置")
    void testCheckCompleteness_WithMcpToolConfig() {
        // Given
        Map<String, Object> skillData = new HashMap<>();
        skillData.put("skillId", "test-skill");
        skillData.put("name", "测试技能");
        skillData.put("description", "这是一个测试技能");
        skillData.put("mcpToolConfig", "{\"mcpConfigId\": 1, \"tools\": []}");
        
        // When
        var result = qualityAnalyzer.checkCompleteness(skillData);
        
        // Then
        assertThat(result).isNotNull();
        // 应该提示MCP工具配置中未选择任何工具
        assertThat(result.getSuggestions()).isNotEmpty();
    }
}
