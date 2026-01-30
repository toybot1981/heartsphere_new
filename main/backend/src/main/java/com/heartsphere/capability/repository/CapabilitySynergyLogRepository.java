package com.heartsphere.capability.repository;

import com.heartsphere.capability.entity.CapabilitySynergyLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 能力协同日志 Repository
 * 
 * @author HeartSphere
 * @date 2026-01-26
 */
@Repository
public interface CapabilitySynergyLogRepository extends JpaRepository<CapabilitySynergyLog, Long> {
    
    /**
     * 根据角色ID查询协同日志
     */
    List<CapabilitySynergyLog> findByCharacterIdOrderByCreatedAtDesc(Long characterId);
    
    /**
     * 根据角色ID和协同类型查询协同日志
     */
    List<CapabilitySynergyLog> findByCharacterIdAndSynergyTypeOrderByCreatedAtDesc(
        Long characterId, String synergyType);
    
    /**
     * 根据角色ID分页查询协同日志
     */
    Page<CapabilitySynergyLog> findByCharacterIdOrderByCreatedAtDesc(
        Long characterId, Pageable pageable);
    
    /**
     * 查询指定时间范围内的协同日志
     */
    @Query("SELECT l FROM CapabilitySynergyLog l " +
           "WHERE l.characterId = :characterId " +
           "AND l.createdAt BETWEEN :startTime AND :endTime " +
           "ORDER BY l.createdAt DESC")
    List<CapabilitySynergyLog> findByCharacterIdAndTimeRange(
        @Param("characterId") Long characterId,
        @Param("startTime") LocalDateTime startTime,
        @Param("endTime") LocalDateTime endTime);
}
