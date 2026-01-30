package com.heartsphere.capability.repository;

import com.heartsphere.capability.entity.CapabilityAssessment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * 能力评估记录 Repository
 * 
 * @author HeartSphere
 * @date 2026-01-26
 */
@Repository
public interface CapabilityAssessmentRepository extends JpaRepository<CapabilityAssessment, Long> {
    
    /**
     * 根据角色ID查询最新的评估记录
     */
    Optional<CapabilityAssessment> findFirstByCharacterIdOrderByCreatedAtDesc(Long characterId);
    
    /**
     * 根据角色ID和评估类型查询评估记录
     */
    List<CapabilityAssessment> findByCharacterIdAndAssessmentTypeOrderByCreatedAtDesc(
        Long characterId, String assessmentType);
    
    /**
     * 根据角色ID分页查询评估记录
     */
    Page<CapabilityAssessment> findByCharacterIdOrderByCreatedAtDesc(
        Long characterId, Pageable pageable);
    
    /**
     * 查询指定时间范围内的评估记录
     */
    @Query("SELECT a FROM CapabilityAssessment a " +
           "WHERE a.characterId = :characterId " +
           "AND a.createdAt BETWEEN :startTime AND :endTime " +
           "ORDER BY a.createdAt DESC")
    List<CapabilityAssessment> findByCharacterIdAndTimeRange(
        @Param("characterId") Long characterId,
        @Param("startTime") LocalDateTime startTime,
        @Param("endTime") LocalDateTime endTime);
}
