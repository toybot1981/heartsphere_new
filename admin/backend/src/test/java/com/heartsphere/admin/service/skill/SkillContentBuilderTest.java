package com.heartsphere.admin.service.skill;

import com.heartsphere.admin.entity.skill.SkillDefinition;
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
 * SkillContentBuilder 单元测试
 * 
 * @author HeartSphere
 * @version 1.0
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("技能内容构建器测试")
class SkillContentBuilderTest {
    
    @InjectMocks
    private SkillContentBuilder contentBuilder;
    
    private SkillDefinition skill;
    private Map<String, Object> skillData;
    
    @BeforeEach
    void setUp() {
        skill = new SkillDefinition();
        skill.setSkillId("test-skill");
        skill.setName("测试技能");
        skill.setDescription("这是一个测试技能");
        skill.setCategory("utility");
        skill.setVersion("1.0.0");
        skill.setAuthor("Test Author");
        skill.setLicense("MIT");
        
        skillData = new HashMap<>();
        skillData.put("instruction", "这是技能指令内容。");
    }
    
    @Test
    @DisplayName("构建完整的SKILL.md内容")
    void testBuildSkillContent_Complete() {
        // When
        String content = contentBuilder.buildSkillContent(skill, skillData);
        
        // Then
        assertThat(content).isNotNull();
        assertThat(content).contains("---");
        assertThat(content).contains("name: 测试技能");
        assertThat(content).contains("description: 这是一个测试技能");
        assertThat(content).contains("version: 1.0.0");
        assertThat(content).contains("author: Test Author");
        assertThat(content).contains("category: utility");
        assertThat(content).contains("license: MIT");
        assertThat(content).contains("这是技能指令内容。");
    }
    
    @Test
    @DisplayName("构建缺少可选字段的SKILL.md内容")
    void testBuildSkillContent_Minimal() {
        // Given
        SkillDefinition minimalSkill = new SkillDefinition();
        minimalSkill.setSkillId("minimal-skill");
        minimalSkill.setName("最小技能");
        minimalSkill.setDescription("最小描述");
        
        Map<String, Object> minimalData = new HashMap<>();
        minimalData.put("instruction", "最小指令");
        
        // When
        String content = contentBuilder.buildSkillContent(minimalSkill, minimalData);
        
        // Then
        assertThat(content).isNotNull();
        assertThat(content).contains("name: 最小技能");
        assertThat(content).contains("description: 最小描述");
        assertThat(content).contains("最小指令");
    }
    
    @Test
    @DisplayName("构建包含MCP工具配置的SKILL.md内容")
    void testBuildSkillContent_WithMcpToolConfig() {
        // Given
        skill.setMcpToolConfig("""
            {
                "mcpConfigId": 1,
                "tools": [{"name": "tool1"}]
            }
            """);
        
        // When
        String content = contentBuilder.buildSkillContent(skill, skillData);
        
        // Then
        assertThat(content).isNotNull();
        assertThat(content).contains("## MCP Tools");
        assertThat(content).contains("mcpConfigId");
    }
    
    @Test
    @DisplayName("构建缺少指令的SKILL.md内容 - 使用描述作为后备")
    void testBuildSkillContent_NoInstruction_UsesDescription() {
        // Given
        Map<String, Object> dataWithoutInstruction = new HashMap<>();
        
        // When
        String content = contentBuilder.buildSkillContent(skill, dataWithoutInstruction);
        
        // Then
        assertThat(content).isNotNull();
        assertThat(content).contains("这是一个测试技能");
    }
    
    @Test
    @DisplayName("构建包含特殊字符的YAML内容 - 正确转义")
    void testBuildSkillContent_SpecialCharacters_Escaped() {
        // Given
        skill.setName("技能: 测试\"名称'");
        skill.setDescription("描述包含: 冒号和\"引号");
        
        // When
        String content = contentBuilder.buildSkillContent(skill, skillData);
        
        // Then
        assertThat(content).isNotNull();
        // 应该包含转义后的引号
        assertThat(content).contains("\"");
    }
}
