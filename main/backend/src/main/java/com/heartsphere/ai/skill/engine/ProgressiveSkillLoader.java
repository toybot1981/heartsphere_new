package com.heartsphere.ai.skill.engine;

import com.heartsphere.skill.entity.SkillDefinition;
import com.heartsphere.skill.entity.SkillInstruction;
import com.heartsphere.skill.entity.SkillResource;

import java.util.List;

/**
 * 渐进式技能加载器接口
 * 负责按需加载不同层级的技能内容
 * 
 * @author HeartSphere
 * @version 1.0
 */
public interface ProgressiveSkillLoader {
    
    /**
     * 加载 Level 1（元数据）
     * 从数据库加载角色的所有可用技能定义
     * 
     * @param characterId 角色ID
     * @return 技能定义列表
     */
    List<SkillDefinition> loadLevel1(Long characterId);
    
    /**
     * 加载 Level 2（指令）
     * 加载指定技能的指令信息
     * 
     * @param skillId 技能ID
     * @return 技能指令列表
     */
    List<SkillInstruction> loadLevel2(String skillId);
    
    /**
     * 批量加载 Level 2（指令）
     * 批量加载多个技能的指令信息
     * 
     * @param skillIds 技能ID列表
     * @return 技能ID到指令列表的映射
     */
    java.util.Map<String, List<SkillInstruction>> loadLevel2Batch(List<String> skillIds);
    
    /**
     * 加载 Level 3（资源）
     * 加载指定技能的资源信息
     * 
     * @param skillId 技能ID
     * @return 技能资源列表
     */
    List<SkillResource> loadLevel3(String skillId);
    
    /**
     * 批量加载 Level 3（资源）
     * 批量加载多个技能的资源信息
     * 
     * @param skillIds 技能ID列表
     * @return 技能ID到资源列表的映射
     */
    java.util.Map<String, List<SkillResource>> loadLevel3Batch(List<String> skillIds);
}
