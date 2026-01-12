package com.heartsphere.skill.repository;

import com.heartsphere.skill.entity.CharacterSkillBinding;
import com.heartsphere.skill.entity.SkillDefinition;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * 角色技能装备 Repository 测试
 * 
 * @author HeartSphere
 * @version 1.0
 */
@DataJpaTest
@ActiveProfiles("test")
public class CharacterSkillBindingRepositoryTest {

    @Autowired
    private CharacterSkillBindingRepository bindingRepository;

    @Autowired
    private SkillDefinitionRepository skillDefinitionRepository;

    private SkillDefinition testSkill;
    private CharacterSkillBinding testBinding;

    @BeforeEach
    void setUp() {
        bindingRepository.deleteAll();
        skillDefinitionRepository.deleteAll();

        // 创建测试技能
        testSkill = new SkillDefinition();
        testSkill.setSkillId("test-skill-001");
        testSkill.setName("测试技能");
        testSkill.setCategory("test");
        testSkill.setSkillType("ACTIVE");
        testSkill = skillDefinitionRepository.save(testSkill);

        // 创建测试装备关系
        testBinding = CharacterSkillBinding.builder()
            .characterId(1L)
            .skillId("test-skill-001")
            .isEnabled(true)
            .autoTrigger(false)
            .priority(10)
            .usageCount(0)
            .equippedAt(LocalDateTime.now())
            .build();
        testBinding = bindingRepository.save(testBinding);
    }

    @Test
    void testFindByCharacterId() {
        List<CharacterSkillBinding> bindings = bindingRepository.findByCharacterId(1L);
        assertThat(bindings).hasSize(1);
        assertThat(bindings.get(0).getSkillId()).isEqualTo("test-skill-001");
    }

    @Test
    void testFindByCharacterIdAndIsEnabledTrue() {
        // 创建禁用的技能
        CharacterSkillBinding disabledBinding = CharacterSkillBinding.builder()
            .characterId(1L)
            .skillId("test-skill-002")
            .isEnabled(false)
            .equippedAt(LocalDateTime.now())
            .build();
        bindingRepository.save(disabledBinding);

        List<CharacterSkillBinding> enabledBindings = bindingRepository.findByCharacterIdAndIsEnabledTrue(1L);
        assertThat(enabledBindings).hasSize(1);
        assertThat(enabledBindings.get(0).getIsEnabled()).isTrue();
    }

    @Test
    void testFindByCharacterIdAndSkillId() {
        Optional<CharacterSkillBinding> binding = bindingRepository.findByCharacterIdAndSkillId(1L, "test-skill-001");
        assertThat(binding).isPresent();
        assertThat(binding.get().getCharacterId()).isEqualTo(1L);
    }

    @Test
    void testExistsByCharacterIdAndSkillId() {
        assertThat(bindingRepository.existsByCharacterIdAndSkillId(1L, "test-skill-001")).isTrue();
        assertThat(bindingRepository.existsByCharacterIdAndSkillId(1L, "non-existent")).isFalse();
    }

    @Test
    void testFindSkillIdsByCharacterId() {
        List<String> skillIds = bindingRepository.findSkillIdsByCharacterId(1L);
        assertThat(skillIds).hasSize(1);
        assertThat(skillIds.get(0)).isEqualTo("test-skill-001");
    }

    @Test
    void testCountByCharacterId() {
        long count = bindingRepository.countByCharacterId(1L);
        assertThat(count).isEqualTo(1);
    }
}
