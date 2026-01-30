package com.heartsphere.ai.skill.engine;

import com.heartsphere.skill.entity.SkillDefinition;

import java.util.List;

/**
 * LLM 技能选择器接口
 * 使用 LLM 进行技能选择
 * 
 * @author HeartSphere
 * @version 1.0
 */
public interface LLMSkillSelector {
    
    /**
     * Level 1 初步筛选
     * 使用 Level 1（元数据）进行初步筛选，返回候选技能列表
     * 
     * @param skills 所有可用技能
     * @param context 评估上下文
     * @return 候选技能列表
     */
    List<SkillCandidate> selectCandidatesLevel1(
        List<SkillDefinition> skills,
        SkillEvaluationContext context
    );
    
    /**
     * Level 2 深度评估
     * 使用 Level 2（指令）对候选技能进行深度评估
     * 
     * @param candidates Level 1 筛选出的候选技能
     * @param context 评估上下文
     * @return 评估后的候选技能列表
     */
    List<SkillCandidate> evaluateCandidatesLevel2(
        List<SkillCandidate> candidates,
        SkillEvaluationContext context
    );
    
    /**
     * Level 3 最终决策（可选）
     * 使用 Level 3（资源）进行最终决策和优先级排序
     * 
     * @param candidates Level 2 评估后的候选技能
     * @param context 评估上下文
     * @return 最终决策的技能列表
     */
    List<SkillCandidate> finalizeCandidatesLevel3(
        List<SkillCandidate> candidates,
        SkillEvaluationContext context
    );
}
