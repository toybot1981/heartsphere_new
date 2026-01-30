package com.heartsphere.ai.skill.util;

import com.heartsphere.ai.skill.engine.SkillEvaluationContext;
import com.heartsphere.skill.entity.SkillDefinition;
import com.heartsphere.skill.entity.SkillInstruction;
import com.heartsphere.skill.entity.SkillResource;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * 技能测试工具类
 * 提供测试辅助方法和测试数据工厂
 */
public class SkillTestUtils {
    
    /**
     * 创建测试技能定义
     */
    public static SkillDefinition createTestSkill(Long id, String skillId, String name, String description, String category) {
        SkillDefinition skill = new SkillDefinition();
        skill.setId(id);
        skill.setSkillId(skillId);
        skill.setName(name);
        skill.setDescription(description);
        skill.setCategory(category);
        skill.setSkillType("FUNCTION_CALLING");
        skill.setExecutionType("RULE_BASED");
        skill.setIsSystemSkill(false);
        return skill;
    }
    
    /**
     * 创建工作助手技能
     */
    public static SkillDefinition createWorkAssistantSkill() {
        return createTestSkill(1L, "work_assistant", "工作助手", "帮助处理工作任务", "work");
    }
    
    /**
     * 创建生活助手技能
     */
    public static SkillDefinition createLifeAssistantSkill() {
        return createTestSkill(2L, "life_assistant", "生活助手", "帮助处理生活事务", "life");
    }
    
    /**
     * 创建学习助手技能
     */
    public static SkillDefinition createLearningAssistantSkill() {
        return createTestSkill(3L, "learning_assistant", "学习助手", "帮助学习和教育", "education");
    }
    
    /**
     * 创建测试技能列表
     */
    public static List<SkillDefinition> createTestSkills(int count) {
        List<SkillDefinition> skills = new ArrayList<>();
        for (int i = 1; i <= count; i++) {
            skills.add(createTestSkill(
                (long) i,
                "test_skill_" + i,
                "测试技能" + i,
                "这是测试技能" + i + "的描述",
                i % 2 == 0 ? "work" : "life"
            ));
        }
        return skills;
    }
    
    /**
     * 创建测试评估上下文
     */
    public static SkillEvaluationContext createTestContext(String userMessage) {
        return SkillEvaluationContext.builder()
            .userMessage(userMessage)
            .roleId(1L)
            .conversationHistory(new ArrayList<>())
            .relatedMemoryIds(new ArrayList<>())
            .timestamp(LocalDateTime.now())
            .build();
    }
    
    /**
     * 创建带对话历史的测试上下文
     */
    public static SkillEvaluationContext createTestContextWithHistory(String userMessage, List<String> history) {
        return SkillEvaluationContext.builder()
            .userMessage(userMessage)
            .roleId(1L)
            .conversationHistory(history)
            .relatedMemoryIds(new ArrayList<>())
            .timestamp(LocalDateTime.now())
            .build();
    }
    
    /**
     * 创建 Level 2 指令
     */
    public static SkillInstruction createLevel2Instruction(String skillId, String instructionText) {
        SkillInstruction instruction = new SkillInstruction();
        instruction.setSkillId(skillId);
        instruction.setInstructionLevel(2);
        instruction.setInstructionText(instructionText);
        instruction.setExecutionOrder(0);
        return instruction;
    }
    
    /**
     * 创建 Level 3 资源
     */
    public static SkillResource createLevel3Resource(String skillId, String resourceType, String resourceName, String content) {
        SkillResource resource = new SkillResource();
        resource.setSkillId(skillId);
        resource.setResourceType(resourceType);
        resource.setResourceName(resourceName);
        resource.setResourceContent(content);
        resource.setResourceOrder(0);
        return resource;
    }
}
