package com.heartsphere.skill.repository;

import com.heartsphere.skill.entity.SkillResource;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * 技能资源 Repository
 * 
 * 技能系统独立模块
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Repository
public interface SkillResourceRepository extends JpaRepository<SkillResource, Long> {
    
    /**
     * 根据技能ID查找所有资源
     */
    List<SkillResource> findBySkillId(String skillId);
    
    /**
     * 根据技能ID和资源类型查找
     */
    List<SkillResource> findBySkillIdAndResourceType(String skillId, String resourceType);
    
    /**
     * 根据技能ID和资源名称查找
     */
    Optional<SkillResource> findBySkillIdAndResourceName(String skillId, String resourceName);
    
    /**
     * 根据技能ID列表查找所有资源
     */
    List<SkillResource> findBySkillIdIn(List<String> skillIds);
    
    /**
     * 根据技能ID删除所有资源
     */
    void deleteBySkillId(String skillId);
    
    /**
     * 根据技能ID和资源类型删除
     */
    void deleteBySkillIdAndResourceType(String skillId, String resourceType);
    
    /**
     * 查找脚本类型的资源
     */
    @Query("SELECT sr FROM SkillResource sr WHERE sr.skillId = :skillId AND sr.resourceType = 'script' ORDER BY sr.resourceOrder")
    List<SkillResource> findScriptResources(@Param("skillId") String skillId);
    
    /**
     * 查找模板类型的资源
     */
    @Query("SELECT sr FROM SkillResource sr WHERE sr.skillId = :skillId AND sr.resourceType = 'template' ORDER BY sr.resourceOrder")
    List<SkillResource> findTemplateResources(@Param("skillId") String skillId);
}
