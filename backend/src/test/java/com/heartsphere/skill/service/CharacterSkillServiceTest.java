package com.heartsphere.skill.service;

import com.heartsphere.skill.entity.CharacterSkillBinding;
import com.heartsphere.skill.entity.SkillDefinition;
import com.heartsphere.skill.repository.CharacterSkillBindingRepository;
import com.heartsphere.skill.repository.SkillDefinitionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * 角色技能服务测试
 * 
 * @author HeartSphere
 * @version 1.0
 */
@SpringBootTest
@ActiveProfiles("test")
@Transactional
public class CharacterSkillServiceTest {

    @Autowired
    private CharacterSkillService characterSkillService;

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
        testSkill = skillDefinitionRepository.save(testSkill);
    }

    @Test
    void testEquipSkill() {
        var request = CharacterSkillService.EquipSkillRequest.builder()
            .isEnabled(true)
            .autoTrigger(false)
            .priority(10)
            .build();

        CharacterSkillBinding binding = characterSkillService.equipSkill(
            1L,
            "test-skill-001",
            request
        );

        assertThat(binding).isNotNull();
        assertThat(binding.getCharacterId()).isEqualTo(1L);
        assertThat(binding.getSkillId()).isEqualTo("test-skill-001");
        assertThat(binding.getIsEnabled()).isTrue();
        assertThat(binding.getPriority()).isEqualTo(10);
    }

    @Test
    void testEquipSkillAlreadyEquipped() {
        // 先装备一次
        var request = CharacterSkillService.EquipSkillRequest.builder()
            .isEnabled(true)
            .build();
        characterSkillService.equipSkill(1L, "test-skill-001", request);

        // 再次装备应该失败
        assertThatThrownBy(() -> {
            characterSkillService.equipSkill(1L, "test-skill-001", request);
        }).isInstanceOf(CharacterSkillService.SkillAlreadyEquippedException.class);
    }

    @Test
    void testUnequipSkill() {
        // 先装备
        var request = CharacterSkillService.EquipSkillRequest.builder()
            .isEnabled(true)
            .build();
        characterSkillService.equipSkill(1L, "test-skill-001", request);

        // 卸载
        characterSkillService.unequipSkill(1L, "test-skill-001");

        // 验证已卸载
        assertThat(bindingRepository.existsByCharacterIdAndSkillId(1L, "test-skill-001")).isFalse();
    }

    @Test
    void testToggleSkill() {
        // 先装备
        var request = CharacterSkillService.EquipSkillRequest.builder()
            .isEnabled(true)
            .build();
        characterSkillService.equipSkill(1L, "test-skill-001", request);

        // 禁用
        characterSkillService.toggleSkill(1L, "test-skill-001", false);

        var binding = bindingRepository.findByCharacterIdAndSkillId(1L, "test-skill-001");
        assertThat(binding).isPresent();
        assertThat(binding.get().getIsEnabled()).isFalse();
    }

    @Test
    void testGetEquippedSkills() {
        // 装备两个技能
        var request = CharacterSkillService.EquipSkillRequest.builder()
            .isEnabled(true)
            .build();
        characterSkillService.equipSkill(1L, "test-skill-001", request);

        // 创建第二个技能
        SkillDefinition skill2 = new SkillDefinition();
        skill2.setSkillId("test-skill-002");
        skill2.setName("测试技能2");
        skill2.setCategory("test");
        skill2.setSkillType("ACTIVE");
        skillDefinitionRepository.save(skill2);

        characterSkillService.equipSkill(1L, "test-skill-002", request);

        List<CharacterSkillBinding> bindings = characterSkillService.getEquippedSkills(1L);
        assertThat(bindings).hasSize(2);
    }
}
