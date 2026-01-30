package com.heartsphere.skill.repository;

import com.heartsphere.skill.entity.SkillDefinition;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * 技能定义 Repository
 * 
 * 技能系统独立模块
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
     * 查找可用的技能（有 mcp_tool_config 的技能，用于工具调用）
     * 注意：已移除 function_schema 判断，改用 mcp_tool_config
     */
    @Query("SELECT s FROM SkillDefinition s WHERE s.mcpToolConfig IS NOT NULL AND s.mcpToolConfig != ''")
    List<SkillDefinition> findAvailableSkills();
    
    /**
     * 查找支持自动触发的技能
     */
    @Query("SELECT s FROM SkillDefinition s WHERE s.autoTriggerKeywords IS NOT NULL AND s.autoTriggerKeywords != ''")
    List<SkillDefinition> findAutoTriggerSkills();
    
    /**
     * 根据分类查找可用技能（有 mcp_tool_config 的技能）
     * 注意：已移除 function_schema 判断，改用 mcp_tool_config
     */
    @Query("SELECT s FROM SkillDefinition s WHERE s.category = :category AND s.mcpToolConfig IS NOT NULL AND s.mcpToolConfig != ''")
    List<SkillDefinition> findAvailableSkillsByCategory(@Param("category") String category);
}
