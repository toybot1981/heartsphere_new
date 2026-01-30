package com.heartsphere.admin.service.skill;

import com.heartsphere.admin.dto.skill.SkillEnhancedValidationResultDTO;
import com.heartsphere.admin.entity.skill.SkillDefinition;
import com.heartsphere.admin.repository.skill.SkillResourceRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

/**
 * SkillValidationService 单元测试
 * 
 * @author HeartSphere
 * @version 1.0
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("技能验证服务测试")
class SkillValidationServiceTest {
    
    @Mock
    private SkillResourceRepository resourceRepository;
    
    @InjectMocks
    private SkillValidationService validationService;
    
    @BeforeEach
    void setUp() {
        // 设置 YAML 解析器（如果需要）
        // validationService 使用 @RequiredArgsConstructor，会自动注入 resourceRepository
    }
    
    @Test
    @DisplayName("验证有效的技能ID")
    void testValidateSkillId_Valid() {
        // Given
        String validSkillId = "time-management-helper";
        
        // When
        var result = validationService.validateSkillId(validSkillId);
        
        // Then
        assertThat(result.isValid()).isTrue();
        assertThat(result.getErrors()).isEmpty();
    }
    
    @Test
    @DisplayName("验证无效的技能ID - 包含大写字母")
    void testValidateSkillId_Invalid_Uppercase() {
        // Given
        String invalidSkillId = "TimeManagement";
        
        // When
        var result = validationService.validateSkillId(invalidSkillId);
        
        // Then
        assertThat(result.isValid()).isFalse();
        assertThat(result.getErrors()).isNotEmpty();
    }
    
    @Test
    @DisplayName("验证无效的技能ID - 包含特殊字符")
    void testValidateSkillId_Invalid_SpecialChars() {
        // Given
        String invalidSkillId = "time_management";
        
        // When
        var result = validationService.validateSkillId(invalidSkillId);
        
        // Then
        assertThat(result.isValid()).isFalse();
        assertThat(result.getErrors()).isNotEmpty();
    }
    
    @Test
    @DisplayName("验证空技能ID")
    void testValidateSkillId_Empty() {
        // Given
        String emptySkillId = "";
        
        // When
        var result = validationService.validateSkillId(emptySkillId);
        
        // Then
        assertThat(result.isValid()).isFalse();
        assertThat(result.getErrors()).contains("技能ID不能为空");
    }
    
    @Test
    @DisplayName("验证null技能ID")
    void testValidateSkillId_Null() {
        // Given
        String nullSkillId = null;
        
        // When
        var result = validationService.validateSkillId(nullSkillId);
        
        // Then
        assertThat(result.isValid()).isFalse();
        assertThat(result.getErrors()).contains("技能ID不能为空");
    }
    
    @Test
    @DisplayName("验证技能ID长度超限")
    void testValidateSkillId_TooLong() {
        // Given
        String longSkillId = "a".repeat(65);
        
        // When
        var result = validationService.validateSkillId(longSkillId);
        
        // Then
        assertThat(result.isValid()).isFalse();
        assertThat(result.getErrors()).isNotEmpty();
    }
    
    @Test
    @DisplayName("验证有效的描述")
    void testValidateDescription_Valid() {
        // Given
        String validDescription = "这是一个有效的技能描述，包含足够的内容来说明技能的用途和功能。";
        
        // When
        var result = validationService.validateDescription(validDescription);
        
        // Then
        assertThat(result.isValid()).isTrue();
        assertThat(result.getErrors()).isEmpty();
    }
    
    @Test
    @DisplayName("验证空描述")
    void testValidateDescription_Empty() {
        // Given
        String emptyDescription = "";
        
        // When
        var result = validationService.validateDescription(emptyDescription);
        
        // Then
        assertThat(result.isValid()).isFalse();
        assertThat(result.getErrors()).contains("描述不能为空");
    }
    
    @Test
    @DisplayName("验证描述过长")
    void testValidateDescription_TooLong() {
        // Given
        String longDescription = "a".repeat(1025);
        
        // When
        var result = validationService.validateDescription(longDescription);
        
        // Then
        assertThat(result.isValid()).isFalse();
        assertThat(result.getErrors()).isNotEmpty();
    }
    
    @Test
    @DisplayName("验证描述过短")
    void testValidateDescription_TooShort() {
        // Given
        String shortDescription = "短";
        
        // When
        var result = validationService.validateDescription(shortDescription);
        
        // Then
        assertThat(result.isValid()).isFalse();
        assertThat(result.getErrors()).isNotEmpty();
    }
    
    @Test
    @DisplayName("验证有效的MCP工具配置JSON")
    void testValidateMcpToolConfig_Valid() {
        // Given
        String validConfig = """
            {
                "mcpConfigId": 1,
                "tools": [
                    {"name": "tool1"},
                    {"name": "tool2"}
                ],
                "parameterMapping": {}
            }
            """;
        
        // When
        var result = validationService.validateMcpToolConfig(validConfig);
        
        // Then
        assertThat(result.isValid()).isTrue();
        assertThat(result.getErrors()).isEmpty();
    }
    
    @Test
    @DisplayName("验证无效的MCP工具配置 - 无效JSON")
    void testValidateMcpToolConfig_InvalidJson() {
        // Given
        String invalidConfig = "{ invalid json }";
        
        // When
        var result = validationService.validateMcpToolConfig(invalidConfig);
        
        // Then
        assertThat(result.isValid()).isFalse();
        assertThat(result.getErrors()).isNotEmpty();
    }
    
    @Test
    @DisplayName("验证包含FunctionCall标记的返回格式")
    void testValidateReturnFormat_ContainsFunctionCall() {
        // Given
        String instructionWithFunctionCall = """
            这是一个技能指令。
            <|FunctionCallBegin|>
            调用某个函数
            <|FunctionCallEnd|>
            继续执行。
            """;
        
        // When
        var result = validationService.validateReturnFormat(instructionWithFunctionCall);
        
        // Then
        assertThat(result.isValid()).isTrue(); // 返回格式验证不阻止创建，只警告
        assertThat(result.getWarnings()).isNotEmpty();
        assertThat(result.getWarnings().get(0)).contains("FunctionCall");
    }
    
    @Test
    @DisplayName("验证不包含FunctionCall标记的返回格式")
    void testValidateReturnFormat_NoFunctionCall() {
        // Given
        String cleanInstruction = """
            这是一个技能指令。
            它不包含任何FunctionCall标记。
            应该通过验证。
            """;
        
        // When
        var result = validationService.validateReturnFormat(cleanInstruction);
        
        // Then
        assertThat(result.isValid()).isTrue();
        assertThat(result.getWarnings()).isEmpty();
    }
    
    @Test
    @DisplayName("验证元数据完整性 - 完整")
    void testValidateMetadataCompleteness_Complete() {
        // Given
        String name = "时间管理助手";
        String description = "帮助用户管理时间和任务";
        
        // When
        var result = validationService.validateMetadataCompleteness(name, description);
        
        // Then
        assertThat(result.isValid()).isTrue();
        assertThat(result.getErrors()).isEmpty();
    }
    
    @Test
    @DisplayName("验证元数据完整性 - 缺少名称")
    void testValidateMetadataCompleteness_MissingName() {
        // Given
        String name = "";
        String description = "帮助用户管理时间和任务";
        
        // When
        var result = validationService.validateMetadataCompleteness(name, description);
        
        // Then
        assertThat(result.isValid()).isFalse();
        assertThat(result.getErrors()).contains("技能名称不能为空");
    }
    
    @Test
    @DisplayName("验证元数据完整性 - 缺少描述")
    void testValidateMetadataCompleteness_MissingDescription() {
        // Given
        String name = "时间管理助手";
        String description = "";
        
        // When
        var result = validationService.validateMetadataCompleteness(name, description);
        
        // Then
        assertThat(result.isValid()).isFalse();
        assertThat(result.getErrors()).contains("技能描述不能为空");
    }

    @Test
    @DisplayName("增强验证 - 完整技能")
    void testValidateEnhanced_CompleteSkill() {
        // Given
        SkillDefinition skill = new SkillDefinition();
        skill.setSkillId("test-skill-123");
        skill.setName("测试技能");
        skill.setDescription("这是一个完整的技能描述，包含足够的内容来说明技能的用途和功能。");
        skill.setSkillContent("---\nname: test-skill-123\ndescription: 测试技能\n---\n\n这是技能指令内容。");

        when(resourceRepository.findBySkillId("test-skill-123")).thenReturn(new ArrayList<>());

        // When
        SkillEnhancedValidationResultDTO result = validationService.validateEnhanced(skill);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getBasicValidation()).isNotNull();
        assertThat(result.getStructureValidation()).isNotNull();
        assertThat(result.getQualityValidation()).isNotNull();
        assertThat(result.getProgressiveDisclosureValidation()).isNotNull();
    }

    @Test
    @DisplayName("增强验证 - 缺少技能ID")
    void testValidateEnhanced_MissingSkillId() {
        // Given
        SkillDefinition skill = new SkillDefinition();
        skill.setSkillId("");
        skill.setName("测试技能");
        skill.setDescription("描述");

        when(resourceRepository.findBySkillId("")).thenReturn(new ArrayList<>());

        // When
        SkillEnhancedValidationResultDTO result = validationService.validateEnhanced(skill);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getBasicValidation().getErrors()).isNotEmpty();
    }

    @Test
    @DisplayName("增强验证 - 无效的YAML frontmatter")
    void testValidateEnhanced_InvalidYamlFrontmatter() {
        // Given
        SkillDefinition skill = new SkillDefinition();
        skill.setSkillId("test-skill-123");
        skill.setName("测试技能");
        skill.setDescription("描述");
        skill.setSkillContent("---\ninvalid: yaml: content: [\n---\n\n内容");

        when(resourceRepository.findBySkillId("test-skill-123")).thenReturn(new ArrayList<>());

        // When
        SkillEnhancedValidationResultDTO result = validationService.validateEnhanced(skill);

        // Then
        assertThat(result).isNotNull();
        // YAML 解析失败应该产生错误
        assertThat(result.getBasicValidation().getErrors()).isNotEmpty();
    }

    @Test
    @DisplayName("增强验证 - 描述包含禁止字符")
    void testValidateEnhanced_DescriptionWithForbiddenChars() {
        // Given
        SkillDefinition skill = new SkillDefinition();
        skill.setSkillId("test-skill-123");
        skill.setName("测试技能");
        skill.setDescription("描述包含<禁止字符>");
        skill.setSkillContent("---\nname: test-skill-123\ndescription: 描述\n---\n\n内容");

        when(resourceRepository.findBySkillId("test-skill-123")).thenReturn(new ArrayList<>());

        // When
        SkillEnhancedValidationResultDTO result = validationService.validateEnhanced(skill);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getQualityValidation().getErrors()).isNotEmpty();
        assertThat(result.getQualityValidation().getErrors().get(0)).contains("尖括号");
    }
}
