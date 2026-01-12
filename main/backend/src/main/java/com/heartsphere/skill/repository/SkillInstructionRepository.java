package com.heartsphere.skill.repository;

import com.heartsphere.skill.entity.SkillInstruction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * 技能指令 Repository
 * 
 * 技能系统独立模块
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Repository
public interface SkillInstructionRepository extends JpaRepository<SkillInstruction, Long> {
    
    /**
     * 根据技能ID查找所有指令
     */
    List<SkillInstruction> findBySkillId(String skillId);
    
    /**
     * 根据技能ID和指令层级查找
     */
    List<SkillInstruction> findBySkillIdAndInstructionLevel(String skillId, Integer instructionLevel);
    
    /**
     * 根据技能ID查找指定层级的指令
     */
    Optional<SkillInstruction> findBySkillIdAndInstructionLevelAndExecutionOrder(
        String skillId, 
        Integer instructionLevel, 
        Integer executionOrder
    );
    
    /**
     * 根据技能ID列表查找所有指令
     */
    List<SkillInstruction> findBySkillIdIn(List<String> skillIds);
    
    /**
     * 根据技能ID删除所有指令
     */
    void deleteBySkillId(String skillId);
    
    /**
     * 根据技能ID和层级删除指令
     */
    void deleteBySkillIdAndInstructionLevel(String skillId, Integer instructionLevel);
    
    /**
     * 查找技能的所有 Level 2 指令（详细指令）
     */
    @Query("SELECT si FROM SkillInstruction si WHERE si.skillId = :skillId AND si.instructionLevel = 2 ORDER BY si.executionOrder")
    List<SkillInstruction> findLevel2Instructions(@Param("skillId") String skillId);
    
    /**
     * 查找技能的所有 Level 3 指令（高级指令）
     */
    @Query("SELECT si FROM SkillInstruction si WHERE si.skillId = :skillId AND si.instructionLevel = 3 ORDER BY si.executionOrder")
    List<SkillInstruction> findLevel3Instructions(@Param("skillId") String skillId);
}
