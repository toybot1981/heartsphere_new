package com.heartsphere.skill.repository;

import com.heartsphere.skill.entity.SkillConflict;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * 技能冲突 Repository
 * 
 * 技能系统独立模块
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Repository
public interface SkillConflictRepository extends JpaRepository<SkillConflict, Long> {
    
    /**
     * 查找技能1的所有冲突
     */
    List<SkillConflict> findBySkillId1(String skillId1);
    
    /**
     * 查找技能2的所有冲突
     */
    List<SkillConflict> findBySkillId2(String skillId2);
    
    /**
     * 查找两个技能之间的冲突（双向）
     */
    @Query("SELECT sc FROM SkillConflict sc WHERE (sc.skillId1 = :skillId1 AND sc.skillId2 = :skillId2) OR (sc.skillId1 = :skillId2 AND sc.skillId2 = :skillId1)")
    Optional<SkillConflict> findConflictBetween(@Param("skillId1") String skillId1, @Param("skillId2") String skillId2);
    
    /**
     * 检查两个技能是否冲突
     */
    @Query("SELECT COUNT(sc) > 0 FROM SkillConflict sc WHERE (sc.skillId1 = :skillId1 AND sc.skillId2 = :skillId2) OR (sc.skillId1 = :skillId2 AND sc.skillId2 = :skillId1)")
    boolean existsConflictBetween(@Param("skillId1") String skillId1, @Param("skillId2") String skillId2);
    
    /**
     * 查找与指定技能冲突的所有技能ID
     */
    @Query("SELECT CASE WHEN sc.skillId1 = :skillId THEN sc.skillId2 ELSE sc.skillId1 END FROM SkillConflict sc WHERE sc.skillId1 = :skillId OR sc.skillId2 = :skillId")
    List<String> findConflictingSkillIds(@Param("skillId") String skillId);
    
    /**
     * 根据冲突类型查找
     */
    List<SkillConflict> findByConflictType(String conflictType);
    
    /**
     * 删除技能的所有冲突关系
     */
    void deleteBySkillId1OrSkillId2(String skillId1, String skillId2);
}
