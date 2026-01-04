package com.heartsphere.skill.integration;

import com.heartsphere.TestConfig;
import com.heartsphere.skill.entity.CharacterSkillBinding;
import com.heartsphere.skill.entity.SkillDefinition;
import com.heartsphere.skill.repository.CharacterSkillBindingRepository;
import com.heartsphere.skill.repository.SkillDefinitionRepository;
import com.heartsphere.skill.service.CharacterSkillService;
import com.heartsphere.skill.service.SkillExecutor;
import com.heartsphere.skill.service.SkillRegistry;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * 技能系统集成测试
 * 
 * 测试技能系统的完整流程：
 * 1. 创建技能定义
 * 2. 装备技能到角色
 * 3. 获取角色可用技能
 * 4. 转换为 Function Definitions
 * 5. 执行技能
 * 
 * @author HeartSphere
 * @version 1.0
 */
@SpringBootTest
@ActiveProfiles("test")
@Import(TestConfig.class)
@Transactional
public class SkillSystemIntegrationTest {

    @Autowired
    private SkillDefinitionRepository skillDefinitionRepository;

    @Autowired
    private CharacterSkillBindingRepository bindingRepository;

    @Autowired
    private SkillRegistry skillRegistry;

    @Autowired
    private CharacterSkillService characterSkillService;

    @Autowired
    private SkillExecutor skillExecutor;

    private SkillDefinition testSkill;
    private Long testCharacterId = 1L;

    @BeforeEach
    void setUp() {
        bindingRepository.deleteAll();
        skillDefinitionRepository.deleteAll();

        // 创建测试技能
        testSkill = new SkillDefinition();
        testSkill.setSkillId("integration-test-skill");
        testSkill.setName("集成测试技能");
        testSkill.setDescription("用于集成测试的技能");
        testSkill.setCategory("test");
        testSkill.setSkillType("ACTIVE");
        testSkill.setExecutionType("RULE_BASED");
        testSkill.setFunctionSchema("""
            {
                "type": "object",
                "properties": {
                    "action": {
                        "type": "string",
                        "enum": ["test", "execute"]
                    },
                    "param1": {
                        "type": "string"
                    }
                },
                "required": ["action"]
            }
            """);
        testSkill.setVersion("1.0.0");
        testSkill.setIsSystemSkill(false);
        testSkill = skillDefinitionRepository.save(testSkill);

        // 刷新缓存
        skillRegistry.refreshSkillCache();
    }

    @Test
    void testCompleteSkillWorkflow() {
        // 步骤 1: 装备技能
        var equipRequest = CharacterSkillService.EquipSkillRequest.builder()
            .isEnabled(true)
            .autoTrigger(false)
            .priority(10)
            .build();

        CharacterSkillBinding binding = characterSkillService.equipSkill(
            testCharacterId,
            "integration-test-skill",
            equipRequest
        );

        assertThat(binding).isNotNull();
        assertThat(binding.getCharacterId()).isEqualTo(testCharacterId);
        assertThat(binding.getSkillId()).isEqualTo("integration-test-skill");
        assertThat(binding.getIsEnabled()).isTrue();

        // 步骤 2: 获取角色可用技能
        skillRegistry.clearCharacterSkillCache(testCharacterId);
        List<SkillDefinition> characterSkills = skillRegistry.getCharacterSkills(testCharacterId);
        assertThat(characterSkills).hasSize(1);
        assertThat(characterSkills.get(0).getSkillId()).isEqualTo("integration-test-skill");

        // 步骤 3: 转换为 Function Definitions
        var functionDefinitions = skillRegistry.toFunctionDefinitions(characterSkills);
        assertThat(functionDefinitions).hasSize(1);
        assertThat(functionDefinitions.get(0).getName()).isEqualTo("integration-test-skill");
        assertThat(functionDefinitions.get(0).getParameters()).isNotNull();

        // 步骤 4: 执行技能
        Map<String, Object> parameters = Map.of(
            "action", "test",
            "param1", "test-value"
        );

        var context = SkillExecutor.SkillExecutionContext.builder()
            .characterId(testCharacterId)
            .userId(1L)
            .build();

        var result = skillExecutor.execute(
            "integration-test-skill",
            parameters,
            context
        );

        assertThat(result).isNotNull();
        assertThat(result.isSuccess()).isTrue();
        assertThat(result.getSkillId()).isEqualTo("integration-test-skill");
    }

    @Test
    void testSkillEquipAndExecuteFlow() {
        // 装备技能
        var equipRequest = CharacterSkillService.EquipSkillRequest.builder()
            .isEnabled(true)
            .build();
        characterSkillService.equipSkill(testCharacterId, "integration-test-skill", equipRequest);

        // 验证已装备
        List<CharacterSkillBinding> bindings = characterSkillService.getEquippedSkills(testCharacterId);
        assertThat(bindings).hasSize(1);

        // 执行技能
        Map<String, Object> parameters = Map.of("action", "execute");
        var context = SkillExecutor.SkillExecutionContext.builder()
            .characterId(testCharacterId)
            .userId(1L)
            .build();

        var result = skillExecutor.execute(
            "integration-test-skill",
            parameters,
            context
        );

        assertThat(result.isSuccess()).isTrue();
    }

    @Test
    void testSkillToggleAndExecute() {
        // 装备技能
        var equipRequest = CharacterSkillService.EquipSkillRequest.builder()
            .isEnabled(true)
            .build();
        characterSkillService.equipSkill(testCharacterId, "integration-test-skill", equipRequest);

        // 禁用技能
        characterSkillService.toggleSkill(testCharacterId, "integration-test-skill", false);

        // 验证已禁用
        var binding = bindingRepository.findByCharacterIdAndSkillId(testCharacterId, "integration-test-skill");
        assertThat(binding).isPresent();
        assertThat(binding.get().getIsEnabled()).isFalse();

        // 重新启用
        characterSkillService.toggleSkill(testCharacterId, "integration-test-skill", true);
        binding = bindingRepository.findByCharacterIdAndSkillId(testCharacterId, "integration-test-skill");
        assertThat(binding).isPresent();
        assertThat(binding.get().getIsEnabled()).isTrue();
    }

    @Test
    void testAutoTriggerSkills() {
        // 创建带自动触发关键词的技能
        SkillDefinition autoSkill = new SkillDefinition();
        autoSkill.setSkillId("auto-trigger-skill");
        autoSkill.setName("自动触发技能");
        autoSkill.setCategory("test");
        autoSkill.setSkillType("AUTOMATIC");
        autoSkill.setFunctionSchema("{\"type\":\"object\"}");
        autoSkill.setAutoTriggerKeywords("[\"危机\",\"紧急\",\"危险\"]");
        skillDefinitionRepository.save(autoSkill);

        // 装备技能
        var equipRequest = CharacterSkillService.EquipSkillRequest.builder()
            .isEnabled(true)
            .autoTrigger(true)
            .build();
        characterSkillService.equipSkill(testCharacterId, "auto-trigger-skill", equipRequest);

        skillRegistry.refreshSkillCache();
        skillRegistry.clearCharacterSkillCache(testCharacterId);

        // 测试自动触发检测
        List<SkillDefinition> autoSkills = skillRegistry.findAutoTriggerSkills(
            testCharacterId,
            "出现危机情况，需要立即处理"
        );

        assertThat(autoSkills).hasSize(1);
        assertThat(autoSkills.get(0).getSkillId()).isEqualTo("auto-trigger-skill");
    }

    @Test
    void testMultipleSkillsEquipAndExecute() {
        // 创建第二个技能
        SkillDefinition skill2 = new SkillDefinition();
        skill2.setSkillId("test-skill-2");
        skill2.setName("测试技能2");
        skill2.setCategory("test");
        skill2.setSkillType("ACTIVE");
        skill2.setExecutionType("RULE_BASED");
        skill2.setFunctionSchema("{\"type\":\"object\"}");
        skillDefinitionRepository.save(skill2);

        // 装备两个技能
        var equipRequest = CharacterSkillService.EquipSkillRequest.builder()
            .isEnabled(true)
            .build();
        characterSkillService.equipSkill(testCharacterId, "integration-test-skill", equipRequest);
        characterSkillService.equipSkill(testCharacterId, "test-skill-2", equipRequest);

        // 获取所有已装备技能
        List<CharacterSkillBinding> bindings = characterSkillService.getEquippedSkills(testCharacterId);
        assertThat(bindings).hasSize(2);

        // 获取可用技能（用于 Function Calling）
        skillRegistry.refreshSkillCache();
        skillRegistry.clearCharacterSkillCache(testCharacterId);
        List<SkillDefinition> availableSkills = skillRegistry.getCharacterSkills(testCharacterId);
        assertThat(availableSkills).hasSize(2);

        // 转换为 Function Definitions
        var functionDefinitions = skillRegistry.toFunctionDefinitions(availableSkills);
        assertThat(functionDefinitions).hasSize(2);
    }
}
