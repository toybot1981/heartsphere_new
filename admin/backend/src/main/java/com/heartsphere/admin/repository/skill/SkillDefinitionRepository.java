package com.heartsphere.admin.repository.skill;

import com.heartsphere.admin.entity.skill.SkillDefinition;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * 技能定义 Repository（Admin模块）
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Repository
public interface SkillDefinitionRepository extends JpaRepository<SkillDefinition, Long> {
    
    /**
     * 根据技能ID查找技能定义
     */
    Optional<SkillDefinition> findBySkillId(String skillId);
    
    /**
     * 根据技能ID列表查找技能定义
     */
    List<SkillDefinition> findBySkillIdIn(List<String> skillIds);
    
    /**
     * 根据分类查找技能定义
     */
    List<SkillDefinition> findByCategory(String category);
    
    /**
     * 根据技能类型查找技能定义
     */
    List<SkillDefinition> findBySkillType(String skillType);
    
    /**
     * 根据执行类型查找技能定义
     */
    List<SkillDefinition> findByExecutionType(String executionType);
    
    /**
     * 查找所有系统技能
     */
    List<SkillDefinition> findByIsSystemSkillTrue();
    
    /**
     * 查找所有非系统技能
     */
    List<SkillDefinition> findByIsSystemSkillFalse();
    
    /**
     * 根据分类和技能类型查找
     */
    List<SkillDefinition> findByCategoryAndSkillType(String category, String skillType);
    
    /**
     * 根据名称模糊查询
     */
    List<SkillDefinition> findByNameContaining(String name);
    
    /**
     * 根据描述模糊查询
     */
    List<SkillDefinition> findByDescriptionContaining(String keyword);
    
    /**
     * 检查技能ID是否存在
     */
    boolean existsBySkillId(String skillId);
    
    /**
     * 根据技能ID删除
     */
    void deleteBySkillId(String skillId);
    
    /**
     * 查找可用的技能（有 function_schema 的技能）
     */
    @Query("SELECT s FROM SkillDefinition s WHERE s.functionSchema IS NOT NULL AND s.functionSchema != ''")
    List<SkillDefinition> findAvailableSkills();
    
    /**
     * 查找支持自动触发的技能
     */
    @Query("SELECT s FROM SkillDefinition s WHERE s.autoTriggerKeywords IS NOT NULL AND s.autoTriggerKeywords != ''")
    List<SkillDefinition> findAutoTriggerSkills();
    
    /**
     * 根据分类查找可用技能
     */
    @Query("SELECT s FROM SkillDefinition s WHERE s.category = :category AND s.functionSchema IS NOT NULL AND s.functionSchema != ''")
    List<SkillDefinition> findAvailableSkillsByCategory(@Param("category") String category);
}
