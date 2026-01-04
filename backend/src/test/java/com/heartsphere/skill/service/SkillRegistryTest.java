package com.heartsphere.skill.service;

import com.heartsphere.skill.entity.SkillDefinition;
import com.heartsphere.skill.entity.CharacterSkillBinding;
import com.heartsphere.skill.repository.SkillDefinitionRepository;
import com.heartsphere.skill.repository.CharacterSkillBindingRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * 技能注册表服务测试
 * 
 * @author HeartSphere
 * @version 1.0
 */
@SpringBootTest
@ActiveProfiles("test")
@Transactional
public class SkillRegistryTest {

    @Autowired
    private SkillRegistry skillRegistry;

    @Autowired
    private SkillDefinitionRepository skillDefinitionRepository;

    @Autowired
    private CharacterSkillBindingRepository bindingRepository;

    private SkillDefinition testSkill;

    @BeforeEach
    void setUp() {
        bindingRepository.deleteAll();
        skillDefinitionRepository.deleteAll();

        // 创建测试技能
        testSkill = new SkillDefinition();
        testSkill.setSkillId("test-skill-001");
        testSkill.setName("测试技能");
        testSkill.setDescription("这是一个测试技能");
        testSkill.setCategory("test");
        testSkill.setSkillType("ACTIVE");
        testSkill.setFunctionSchema("{\"type\":\"object\",\"properties\":{\"param1\":{\"type\":\"string\"}}}");
        testSkill = skillDefinitionRepository.save(testSkill);

        // 刷新缓存
        skillRegistry.refreshSkillCache();
    }

    @Test
    void testGetSkill() {
        var skill = skillRegistry.getSkill("test-skill-001");
        assertThat(skill).isPresent();
        assertThat(skill.get().getName()).isEqualTo("测试技能");
    }

    @Test
    void testGetCharacterSkills() {
        // 创建角色技能装备
        CharacterSkillBinding binding = CharacterSkillBinding.builder()
            .characterId(1L)
            .skillId("test-skill-001")
            .isEnabled(true)
            .equippedAt(java.time.LocalDateTime.now())
            .build();
        bindingRepository.save(binding);

        // 清除缓存
        skillRegistry.clearCharacterSkillCache(1L);

        List<SkillDefinition> skills = skillRegistry.getCharacterSkills(1L);
        assertThat(skills).hasSize(1);
        assertThat(skills.get(0).getSkillId()).isEqualTo("test-skill-001");
    }

    @Test
    void testToFunctionDefinitions() {
        List<SkillDefinition> skills = List.of(testSkill);
        var functionDefinitions = skillRegistry.toFunctionDefinitions(skills);
        
        assertThat(functionDefinitions).hasSize(1);
        assertThat(functionDefinitions.get(0).getName()).isEqualTo("test-skill-001");
        assertThat(functionDefinitions.get(0).getDescription()).isEqualTo("这是一个测试技能");
        assertThat(functionDefinitions.get(0).getParameters()).isNotNull();
    }

    @Test
    void testFindAutoTriggerSkills() {
        // 创建带自动触发关键词的技能
        SkillDefinition autoSkill = new SkillDefinition();
        autoSkill.setSkillId("auto-skill-001");
        autoSkill.setName("自动触发技能");
        autoSkill.setCategory("test");
        autoSkill.setSkillType("AUTOMATIC");
        autoSkill.setFunctionSchema("{\"type\":\"object\"}");
        autoSkill.setAutoTriggerKeywords("[\"危机\",\"紧急\"]");
        skillDefinitionRepository.save(autoSkill);

        // 创建装备关系
        CharacterSkillBinding binding = CharacterSkillBinding.builder()
            .characterId(1L)
            .skillId("auto-skill-001")
            .isEnabled(true)
            .equippedAt(java.time.LocalDateTime.now())
            .build();
        bindingRepository.save(binding);

        skillRegistry.clearCharacterSkillCache(1L);

        List<SkillDefinition> autoSkills = skillRegistry.findAutoTriggerSkills(1L, "出现危机情况");
        assertThat(autoSkills).hasSize(1);
        assertThat(autoSkills.get(0).getSkillId()).isEqualTo("auto-skill-001");
    }
}
