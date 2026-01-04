package com.heartsphere.skill.controller;

import com.heartsphere.TestConfig;
import com.heartsphere.skill.entity.SkillDefinition;
import com.heartsphere.skill.repository.SkillDefinitionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * 技能管理 Controller 测试
 * 
 * @author HeartSphere
 * @version 1.0
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Import(TestConfig.class)
@Transactional
public class SkillControllerTest {

    @Autowired
    private MockMvc mockMvc;

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
    void testGetAllSkills() throws Exception {
        mockMvc.perform(get("/api/skills"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data[0].skillId").value("test-skill-001"));
    }

    @Test
    void testGetAllSkillsByCategory() throws Exception {
        mockMvc.perform(get("/api/skills")
                .param("category", "test"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data[0].category").value("test"));
    }

    @Test
    void testGetAvailableSkills() throws Exception {
        // 创建没有 function_schema 的技能
        SkillDefinition skillNoSchema = new SkillDefinition();
        skillNoSchema.setSkillId("test-skill-no-schema");
        skillNoSchema.setName("无Schema技能");
        skillNoSchema.setCategory("test");
        skillNoSchema.setSkillType("ACTIVE");
        skillNoSchema.setFunctionSchema(null);
        skillDefinitionRepository.save(skillNoSchema);

        mockMvc.perform(get("/api/skills/available"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data[0].skillId").value("test-skill-001"));
    }

    @Test
    void testGetSkillById() throws Exception {
        mockMvc.perform(get("/api/skills/test-skill-001"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.skillId").value("test-skill-001"))
                .andExpect(jsonPath("$.data.name").value("测试技能"));
    }

    @Test
    void testGetSkillByIdNotFound() throws Exception {
        mockMvc.perform(get("/api/skills/non-existent"))
                .andExpect(status().is5xxServerError());
    }
}
