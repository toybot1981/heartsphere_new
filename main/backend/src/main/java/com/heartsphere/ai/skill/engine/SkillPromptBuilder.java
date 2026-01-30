package com.heartsphere.ai.skill.engine;

import com.heartsphere.skill.entity.SkillDefinition;
import com.heartsphere.skill.entity.SkillInstruction;
import com.heartsphere.skill.entity.SkillResource;

import java.util.List;

/**
 * 技能提示词构建器接口
 * 负责构建不同层级的技能提示词
 * 
 * @author HeartSphere
 * @version 1.0
 */
public interface SkillPromptBuilder {
    
    /**
     * 构建 Level 1 提示词（元数据）
     * 用于初步筛选候选技能
     * 
     * @param skills 技能列表
     * @param context 评估上下文
     * @return 构建的提示词
     */
    String buildLevel1Prompt(List<SkillDefinition> skills, SkillEvaluationContext context);
    
    /**
     * 构建 Level 2 提示词（指令）
     * 用于深度评估候选技能
     * 
     * @param skill 技能定义
     * @param instructions 技能指令列表
     * @param context 评估上下文
     * @return 构建的提示词
     */
    String buildLevel2Prompt(SkillDefinition skill, List<SkillInstruction> instructions, SkillEvaluationContext context);
    
    /**
     * 构建 Level 3 提示词（资源）
     * 用于最终决策
     * 
     * @param skill 技能定义
     * @param resources 技能资源列表
     * @param context 评估上下文
     * @return 构建的提示词
     */
    String buildLevel3Prompt(SkillDefinition skill, List<SkillResource> resources, SkillEvaluationContext context);
    
    /**
     * 构建批量 Level 2 提示词（用于批量评估多个技能）
     * 
     * @param candidates 候选技能列表（包含技能和指令）
     * @param context 评估上下文
     * @return 构建的提示词
     */
    String buildLevel2BatchPrompt(List<SkillCandidate> candidates, SkillEvaluationContext context);
    
    /**
     * 构建批量 Level 3 提示词（用于批量最终决策）
     * 
     * @param candidates 候选技能列表（包含技能、指令和资源）
     * @param context 评估上下文
     * @return 构建的提示词
     */
    String buildLevel3BatchPrompt(List<SkillCandidate> candidates, SkillEvaluationContext context);
}
