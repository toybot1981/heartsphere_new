package com.heartsphere.skill.repository;

import com.heartsphere.skill.entity.SkillDefinition;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * 技能定义 Repository 测试
 * 
 * @author HeartSphere
 * @version 1.0
 */
@DataJpaTest
@ActiveProfiles("test")
public class SkillDefinitionRepositoryTest {

    @Autowired
    private SkillDefinitionRepository skillDefinitionRepository;

    private SkillDefinition testSkill;

    @BeforeEach
    void setUp() {
        skillDefinitionRepository.deleteAll();

        // 创建测试技能
        testSkill = new SkillDefinition();
        testSkill.setSkillId("test-skill-001");
        testSkill.setName("测试技能");
        testSkill.setDescription("这是一个测试技能");
        testSkill.setCategory("test");
        testSkill.setSkillType("ACTIVE");
        testSkill.setExecutionType("RULE_BASED");
        testSkill.setFunctionSchema("{\"type\":\"object\",\"properties\":{\"param1\":{\"type\":\"string\"}}}");
        testSkill.setVersion("1.0.0");
        testSkill.setIsSystemSkill(false);
        testSkill = skillDefinitionRepository.save(testSkill);
    }

    @Test
    void testFindBySkillId() {
        Optional<SkillDefinition> found = skillDefinitionRepository.findBySkillId("test-skill-001");
        assertThat(found).isPresent();
        assertThat(found.get().getName()).isEqualTo("测试技能");
    }

    @Test
    void testFindByCategory() {
        // 创建另一个同分类的技能
        SkillDefinition skill2 = new SkillDefinition();
        skill2.setSkillId("test-skill-002");
        skill2.setName("测试技能2");
        skill2.setCategory("test");
        skill2.setSkillType("ACTIVE");
        skillDefinitionRepository.save(skill2);

        List<SkillDefinition> skills = skillDefinitionRepository.findByCategory("test");
        assertThat(skills).hasSize(2);
    }

    @Test
    void testFindByExecutionType() {
        List<SkillDefinition> skills = skillDefinitionRepository.findByExecutionType("RULE_BASED");
        assertThat(skills).hasSize(1);
        assertThat(skills.get(0).getSkillId()).isEqualTo("test-skill-001");
    }

    @Test
    void testFindAvailableSkills() {
        // 创建没有 function_schema 的技能
        SkillDefinition skillNoSchema = new SkillDefinition();
        skillNoSchema.setSkillId("test-skill-no-schema");
        skillNoSchema.setName("无Schema技能");
        skillNoSchema.setCategory("test");
        skillNoSchema.setSkillType("ACTIVE");
        skillNoSchema.setFunctionSchema(null); // 没有 function_schema
        skillDefinitionRepository.save(skillNoSchema);

        List<SkillDefinition> availableSkills = skillDefinitionRepository.findAvailableSkills();
        assertThat(availableSkills).hasSize(1);
        assertThat(availableSkills.get(0).getSkillId()).isEqualTo("test-skill-001");
    }

    @Test
    void testExistsBySkillId() {
        assertThat(skillDefinitionRepository.existsBySkillId("test-skill-001")).isTrue();
        assertThat(skillDefinitionRepository.existsBySkillId("non-existent")).isFalse();
    }

    @Test
    void testFindBySkillIdIn() {
        // 创建更多技能
        SkillDefinition skill2 = new SkillDefinition();
        skill2.setSkillId("test-skill-002");
        skill2.setName("测试技能2");
        skill2.setCategory("test");
        skill2.setSkillType("ACTIVE");
        skillDefinitionRepository.save(skill2);

        List<String> skillIds = List.of("test-skill-001", "test-skill-002");
        List<SkillDefinition> skills = skillDefinitionRepository.findBySkillIdIn(skillIds);
        assertThat(skills).hasSize(2);
    }
}
