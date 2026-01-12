package com.heartsphere.edu.repository;

import com.heartsphere.edu.entity.EduCharacterInteraction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;

/**
 * 教育版数字人互动记录仓库接口
 */
@Repository
public interface EduCharacterInteractionRepository extends JpaRepository<EduCharacterInteraction, Long> {
    
    /**
     * 根据学生ID查找互动记录
     */
    Page<EduCharacterInteraction> findByStudentIdOrderByCreatedAtDesc(
            Long studentId, 
            Pageable pageable
    );
    
    /**
     * 根据角色ID查找互动记录
     */
    Page<EduCharacterInteraction> findByCharacterIdOrderByCreatedAtDesc(
            Long characterId, 
            Pageable pageable
    );
    
    /**
     * 根据学生ID和角色ID查找互动记录
     */
    Page<EduCharacterInteraction> findByStudentIdAndCharacterIdOrderByCreatedAtDesc(
            Long studentId, 
            Long characterId, 
            Pageable pageable
    );
    
    /**
     * 根据互动类型查找
     */
    Page<EduCharacterInteraction> findByStudentIdAndInteractionTypeOrderByCreatedAtDesc(
            Long studentId, 
            EduCharacterInteraction.InteractionType interactionType, 
            Pageable pageable
    );
    
    /**
     * 根据时间范围查找
     */
    @Query("SELECT i FROM EduCharacterInteraction i WHERE " +
           "i.studentId = :studentId AND " +
           "i.startTime >= :startDate AND i.startTime <= :endDate " +
           "ORDER BY i.createdAt DESC")
    Page<EduCharacterInteraction> findByStudentIdAndDateRange(
            @Param("studentId") Long studentId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            Pageable pageable
    );
    
    /**
     * 统计学生的总互动次数
     */
    long countByStudentId(Long studentId);
    
    /**
     * 统计角色的总互动次数
     */
    long countByCharacterId(Long characterId);
    
    /**
     * 统计学生与特定角色的互动次数
     */
    long countByStudentIdAndCharacterId(Long studentId, Long characterId);
    
    /**
     * 计算学生的总学习时长（分钟）
     */
    @Query("SELECT COALESCE(SUM(i.durationMinutes), 0) FROM EduCharacterInteraction i WHERE i.studentId = :studentId")
    Long sumDurationByStudentId(@Param("studentId") Long studentId);
    
    /**
     * 计算角色的总互动时长（分钟）
     */
    @Query("SELECT COALESCE(SUM(i.durationMinutes), 0) FROM EduCharacterInteraction i WHERE i.characterId = :characterId")
    Long sumDurationByCharacterId(@Param("characterId") Long characterId);
}
