package com.heartsphere.admin.repository.skill;

import com.heartsphere.admin.entity.skill.SkillResource;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * 技能资源 Repository（Admin模块）
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
     * 根据技能ID和资源类型查找资源
     */
    List<SkillResource> findBySkillIdAndResourceType(String skillId, String resourceType);
    
    /**
     * 根据技能ID查找资源，按类型和排序索引排序
     */
    @Query("SELECT r FROM SkillResource r WHERE r.skillId = :skillId ORDER BY r.resourceType, r.orderIndex ASC, r.createdAt ASC")
    List<SkillResource> findBySkillIdOrderByTypeAndOrder(@Param("skillId") String skillId);
    
    /**
     * 根据技能ID和资源ID查找资源
     */
    Optional<SkillResource> findBySkillIdAndId(String skillId, Long id);
    
    /**
     * 删除技能的所有资源
     */
    void deleteBySkillId(String skillId);
    
    /**
     * 统计技能的资源数量
     */
    long countBySkillId(String skillId);
    
    /**
     * 按资源类型统计数量
     */
    long countBySkillIdAndResourceType(String skillId, String resourceType);
}
