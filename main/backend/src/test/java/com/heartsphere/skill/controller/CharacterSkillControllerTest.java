package com.heartsphere.skill.controller;

import com.heartsphere.TestConfig;
import com.heartsphere.skill.entity.CharacterSkillBinding;
import com.heartsphere.skill.entity.SkillDefinition;
import com.heartsphere.skill.repository.CharacterSkillBindingRepository;
import com.heartsphere.skill.repository.SkillDefinitionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * 角色技能管理 Controller 测试
 * 
 * @author HeartSphere
 * @version 1.0
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Import(TestConfig.class)
@Transactional
public class CharacterSkillControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private SkillDefinitionRepository skillDefinitionRepository;

    @Autowired
    private CharacterSkillBindingRepository bindingRepository;

    private SkillDefinition testSkill;
    private Long testCharacterId = 1L;

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
        testSkill.setFunctionSchema("{\"type\":\"object\"}");
        testSkill = skillDefinitionRepository.save(testSkill);
    }

    @Test
    void testGetEquippedSkills() throws Exception {
        // 先装备一个技能
        CharacterSkillBinding binding = CharacterSkillBinding.builder()
            .characterId(testCharacterId)
            .skillId("test-skill-001")
            .isEnabled(true)
            .equippedAt(LocalDateTime.now())
            .build();
        bindingRepository.save(binding);

        mockMvc.perform(get("/api/characters/{characterId}/skills", testCharacterId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data[0].skillId").value("test-skill-001"));
    }

    @Test
    void testEquipSkill() throws Exception {
        String requestJson = """
            {
                "isEnabled": true,
                "autoTrigger": false,
                "priority": 10
            }
            """;

        mockMvc.perform(post("/api/characters/{characterId}/skills/{skillId}/equip", 
                testCharacterId, "test-skill-001")
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.characterId").value(testCharacterId))
                .andExpect(jsonPath("$.data.skillId").value("test-skill-001"))
                .andExpect(jsonPath("$.data.isEnabled").value(true))
                .andExpect(jsonPath("$.data.priority").value(10));
    }

    @Test
    void testEquipSkillNotFound() throws Exception {
        String requestJson = """
            {
                "isEnabled": true
            }
            """;

        mockMvc.perform(post("/api/characters/{characterId}/skills/{skillId}/equip", 
                testCharacterId, "non-existent")
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestJson))
                .andExpect(status().is5xxServerError());
    }

    @Test
    void testUnequipSkill() throws Exception {
        // 先装备技能
        CharacterSkillBinding binding = CharacterSkillBinding.builder()
            .characterId(testCharacterId)
            .skillId("test-skill-001")
            .isEnabled(true)
            .equippedAt(LocalDateTime.now())
            .build();
        bindingRepository.save(binding);

        mockMvc.perform(delete("/api/characters/{characterId}/skills/{skillId}/unequip", 
                testCharacterId, "test-skill-001"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200));

        // 验证已卸载
        assert bindingRepository.findByCharacterIdAndSkillId(testCharacterId, "test-skill-001").isEmpty();
    }

    @Test
    void testToggleSkill() throws Exception {
        // 先装备技能
        CharacterSkillBinding binding = CharacterSkillBinding.builder()
            .characterId(testCharacterId)
            .skillId("test-skill-001")
            .isEnabled(true)
            .equippedAt(LocalDateTime.now())
            .build();
        bindingRepository.save(binding);

        mockMvc.perform(put("/api/characters/{characterId}/skills/{skillId}/toggle", 
                testCharacterId, "test-skill-001")
                .param("enabled", "false"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.isEnabled").value(false));
    }

    @Test
    void testSetAutoTrigger() throws Exception {
        // 先装备技能
        CharacterSkillBinding binding = CharacterSkillBinding.builder()
            .characterId(testCharacterId)
            .skillId("test-skill-001")
            .isEnabled(true)
            .autoTrigger(false)
            .equippedAt(LocalDateTime.now())
            .build();
        bindingRepository.save(binding);

        mockMvc.perform(put("/api/characters/{characterId}/skills/{skillId}/auto-trigger", 
                testCharacterId, "test-skill-001")
                .param("autoTrigger", "true"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.autoTrigger").value(true));
    }

    @Test
    void testSetPriority() throws Exception {
        // 先装备技能
        CharacterSkillBinding binding = CharacterSkillBinding.builder()
            .characterId(testCharacterId)
            .skillId("test-skill-001")
            .isEnabled(true)
            .priority(0)
            .equippedAt(LocalDateTime.now())
            .build();
        bindingRepository.save(binding);

        mockMvc.perform(put("/api/characters/{characterId}/skills/{skillId}/priority", 
                testCharacterId, "test-skill-001")
                .param("priority", "20"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.priority").value(20));
    }
}
