package com.heartsphere.skill.repository;

import com.heartsphere.skill.entity.SkillPrerequisite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * 技能前置条件 Repository
 * 
 * 技能系统独立模块
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Repository
public interface SkillPrerequisiteRepository extends JpaRepository<SkillPrerequisite, Long> {
    
    /**
     * 根据技能ID查找所有前置条件
     */
    List<SkillPrerequisite> findBySkillId(String skillId);
    
    /**
     * 根据前置技能ID查找（查找哪些技能需要该技能作为前置）
     */
    List<SkillPrerequisite> findByPrerequisiteSkillId(String prerequisiteSkillId);
    
    /**
     * 根据技能ID删除所有前置条件
     */
    void deleteBySkillId(String skillId);
    
    /**
     * 根据前置技能ID删除
     */
    void deleteByPrerequisiteSkillId(String prerequisiteSkillId);
    
    /**
     * 检查技能是否有前置条件
     */
    boolean existsBySkillId(String skillId);
    
    /**
     * 查找技能的所有前置技能ID
     */
    @Query("SELECT sp.prerequisiteSkillId FROM SkillPrerequisite sp WHERE sp.skillId = :skillId AND sp.prerequisiteSkillId IS NOT NULL")
    List<String> findPrerequisiteSkillIds(@Param("skillId") String skillId);
    
    /**
     * 查找需要指定技能作为前置的所有技能
     */
    @Query("SELECT sp.skillId FROM SkillPrerequisite sp WHERE sp.prerequisiteSkillId = :prerequisiteSkillId")
    List<String> findSkillsRequiringPrerequisite(@Param("prerequisiteSkillId") String prerequisiteSkillId);
}
