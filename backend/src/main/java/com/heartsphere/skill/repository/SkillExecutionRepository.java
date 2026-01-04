package com.heartsphere.skill.repository;

import com.heartsphere.skill.entity.SkillExecution;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 技能执行记录 Repository
 * 
 * 技能系统独立模块
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Repository
public interface SkillExecutionRepository extends JpaRepository<SkillExecution, Long> {
    
    /**
     * 根据技能ID查找执行记录
     */
    List<SkillExecution> findBySkillId(String skillId);
    
    /**
     * 根据角色ID查找执行记录
     */
    List<SkillExecution> findByCharacterId(Long characterId);
    
    /**
     * 根据用户ID查找执行记录
     */
    List<SkillExecution> findByUserId(Long userId);
    
    /**
     * 根据技能ID和角色ID查找执行记录
     */
    List<SkillExecution> findBySkillIdAndCharacterId(String skillId, Long characterId);
    
    /**
     * 根据执行类型查找
     */
    List<SkillExecution> findByExecutionType(String executionType);
    
    /**
     * 查找成功的执行记录
     */
    List<SkillExecution> findBySuccessTrue();
    
    /**
     * 查找失败的执行记录
     */
    List<SkillExecution> findBySuccessFalse();
    
    /**
     * 根据时间范围查找执行记录
     */
    @Query("SELECT se FROM SkillExecution se WHERE se.createdAt BETWEEN :startTime AND :endTime")
    List<SkillExecution> findByCreatedAtBetween(@Param("startTime") LocalDateTime startTime, @Param("endTime") LocalDateTime endTime);
    
    /**
     * 统计技能的执行次数
     */
    @Query("SELECT COUNT(se) FROM SkillExecution se WHERE se.skillId = :skillId")
    long countBySkillId(@Param("skillId") String skillId);
    
    /**
     * 统计角色使用技能的次数
     */
    @Query("SELECT COUNT(se) FROM SkillExecution se WHERE se.characterId = :characterId AND se.skillId = :skillId")
    long countByCharacterIdAndSkillId(@Param("characterId") Long characterId, @Param("skillId") String skillId);
    
    /**
     * 统计今日使用次数
     */
    @Query("SELECT COUNT(se) FROM SkillExecution se WHERE se.skillId = :skillId AND se.characterId = :characterId AND DATE(se.createdAt) = CURRENT_DATE")
    long countTodayUsage(@Param("skillId") String skillId, @Param("characterId") Long characterId);
    
    /**
     * 查找最近的执行记录
     */
    @Query("SELECT se FROM SkillExecution se WHERE se.characterId = :characterId ORDER BY se.createdAt DESC")
    List<SkillExecution> findRecentByCharacterId(@Param("characterId") Long characterId);
    
    /**
     * 查找最近的执行记录（限制数量）
     */
    @Query(value = "SELECT * FROM skill_executions WHERE character_id = :characterId ORDER BY created_at DESC LIMIT :limit", nativeQuery = true)
    List<SkillExecution> findRecentByCharacterIdWithLimit(@Param("characterId") Long characterId, @Param("limit") int limit);
    
    /**
     * 统计平均执行时间
     */
    @Query("SELECT AVG(se.executionTimeMs) FROM SkillExecution se WHERE se.skillId = :skillId AND se.success = true")
    Double getAverageExecutionTime(@Param("skillId") String skillId);
    
    /**
     * 统计成功率
     */
    @Query("SELECT CAST(SUM(CASE WHEN se.success = true THEN 1 ELSE 0 END) AS DOUBLE) / COUNT(se) FROM SkillExecution se WHERE se.skillId = :skillId")
    Double getSuccessRate(@Param("skillId") String skillId);
}
