package com.heartsphere.ai.skill.engine;

import com.heartsphere.ai.skill.util.SkillTestUtils;
import com.heartsphere.skill.entity.SkillDefinition;
import com.heartsphere.skill.entity.SkillInstruction;
import com.heartsphere.skill.entity.SkillResource;
import com.heartsphere.skill.repository.SkillDefinitionRepository;
import com.heartsphere.skill.repository.SkillInstructionRepository;
import com.heartsphere.skill.repository.SkillResourceRepository;
import com.heartsphere.skill.service.SkillRegistry;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * ProgressiveSkillLoader 单元测试
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("渐进式技能加载器测试")
public class ProgressiveSkillLoaderTest {
    
    @Mock
    private SkillRegistry skillRegistry;
    
    @Mock
    private SkillDefinitionRepository skillDefinitionRepository;
    
    @Mock
    private SkillInstructionRepository skillInstructionRepository;
    
    @Mock
    private SkillResourceRepository skillResourceRepository;
    
    @InjectMocks
    private ProgressiveSkillLoaderImpl skillLoader;
    
    private List<SkillDefinition> testSkills;
    
    @BeforeEach
    void setUp() {
        testSkills = Arrays.asList(
            SkillTestUtils.createWorkAssistantSkill(),
            SkillTestUtils.createLifeAssistantSkill()
        );
    }
    
    @Test
    @DisplayName("应该正确加载 Level 1（元数据）")
    void testLoadLevel1() {
        // Given
        Long characterId = 1L;
        when(skillRegistry.getCharacterSkills(characterId)).thenReturn(testSkills);
        
        // When
        List<SkillDefinition> result = skillLoader.loadLevel1(characterId);
        
        // Then
        assertNotNull(result);
        assertEquals(2, result.size());
        assertEquals("work_assistant", result.get(0).getSkillId());
        assertEquals("life_assistant", result.get(1).getSkillId());
        
        verify(skillRegistry, times(1)).getCharacterSkills(characterId);
    }
    
    @Test
    @DisplayName("应该正确加载 Level 2（指令）")
    void testLoadLevel2() {
        // Given
        String skillId = "work_assistant";
        List<SkillInstruction> instructions = Arrays.asList(
            SkillTestUtils.createLevel2Instruction(skillId, "工作助手指令1"),
            SkillTestUtils.createLevel2Instruction(skillId, "工作助手指令2")
        );
        when(skillInstructionRepository.findBySkillIdAndInstructionLevel(skillId, 2))
            .thenReturn(instructions);
        
        // When
        List<SkillInstruction> result = skillLoader.loadLevel2(skillId);
        
        // Then
        assertNotNull(result);
        assertEquals(2, result.size());
        assertEquals(2, result.get(0).getInstructionLevel());
        
        verify(skillInstructionRepository, times(1))
            .findBySkillIdAndInstructionLevel(skillId, 2);
    }
    
    @Test
    @DisplayName("应该正确加载 Level 3（资源）")
    void testLoadLevel3() {
        // Given
        String skillId = "work_assistant";
        List<SkillResource> resources = Arrays.asList(
            SkillTestUtils.createLevel3Resource(skillId, "template", "模板1", "内容1"),
            SkillTestUtils.createLevel3Resource(skillId, "script", "脚本1", "内容2")
        );
        when(skillResourceRepository.findBySkillId(skillId)).thenReturn(resources);
        
        // When
        List<SkillResource> result = skillLoader.loadLevel3(skillId);
        
        // Then
        assertNotNull(result);
        assertEquals(2, result.size());
        assertEquals("template", result.get(0).getResourceType());
        
        verify(skillResourceRepository, times(1)).findBySkillId(skillId);
    }
    
    @Test
    @DisplayName("应该正确批量加载 Level 2")
    void testLoadLevel2Batch() {
        // Given
        List<String> skillIds = Arrays.asList("work_assistant", "life_assistant");
        List<SkillInstruction> allInstructions = Arrays.asList(
            SkillTestUtils.createLevel2Instruction("work_assistant", "指令1"),
            SkillTestUtils.createLevel2Instruction("life_assistant", "指令2")
        );
        when(skillInstructionRepository.findBySkillIdIn(skillIds))
            .thenReturn(allInstructions);
        
        // When
        Map<String, List<SkillInstruction>> result = skillLoader.loadLevel2Batch(skillIds);
        
        // Then
        assertNotNull(result);
        assertEquals(2, result.size());
        assertTrue(result.containsKey("work_assistant"));
        assertTrue(result.containsKey("life_assistant"));
        assertEquals(1, result.get("work_assistant").size());
        
        verify(skillInstructionRepository, times(1)).findBySkillIdIn(skillIds);
    }
    
    @Test
    @DisplayName("应该正确批量加载 Level 3")
    void testLoadLevel3Batch() {
        // Given
        List<String> skillIds = Arrays.asList("work_assistant", "life_assistant");
        List<SkillResource> allResources = Arrays.asList(
            SkillTestUtils.createLevel3Resource("work_assistant", "template", "模板1", "内容1"),
            SkillTestUtils.createLevel3Resource("life_assistant", "script", "脚本1", "内容2")
        );
        when(skillResourceRepository.findBySkillIdIn(skillIds))
            .thenReturn(allResources);
        
        // When
        Map<String, List<SkillResource>> result = skillLoader.loadLevel3Batch(skillIds);
        
        // Then
        assertNotNull(result);
        assertEquals(2, result.size());
        assertTrue(result.containsKey("work_assistant"));
        assertTrue(result.containsKey("life_assistant"));
        assertEquals(1, result.get("work_assistant").size());
        
        verify(skillResourceRepository, times(1)).findBySkillIdIn(skillIds);
    }
}
