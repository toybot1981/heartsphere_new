package com.heartsphere.memory.repository.jpa;

import com.heartsphere.memory.entity.CharacterGrowthEventEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 角色成长事件 Repository
 * 
 * @author HeartSphere
 * @date 2026-01-25
 */
@Repository
public interface CharacterGrowthEventRepository extends JpaRepository<CharacterGrowthEventEntity, Long> {
    
    /**
     * 根据角色ID和用户ID查询成长事件
     */
    List<CharacterGrowthEventEntity> findByCharacterIdAndUserIdOrderByCreatedAtDesc(
        Long characterId, Long userId);
    
    /**
     * 根据角色ID和用户ID分页查询成长事件
     */
    Page<CharacterGrowthEventEntity> findByCharacterIdAndUserIdOrderByCreatedAtDesc(
        Long characterId, Long userId, Pageable pageable);
    
    /**
     * 根据角色ID查询成长事件
     */
    List<CharacterGrowthEventEntity> findByCharacterIdOrderByCreatedAtDesc(Long characterId);
    
    /**
     * 根据事件类型查询成长事件
     */
    List<CharacterGrowthEventEntity> findByCharacterIdAndUserIdAndEventTypeOrderByCreatedAtDesc(
        Long characterId, Long userId, String eventType);
    
    /**
     * 根据事件分类查询成长事件
     */
    List<CharacterGrowthEventEntity> findByCharacterIdAndUserIdAndEventCategoryOrderByCreatedAtDesc(
        Long characterId, Long userId, String eventCategory);
    
    /**
     * 查询指定时间范围内的成长事件
     */
    @Query("SELECT e FROM CharacterGrowthEventEntity e " +
           "WHERE e.characterId = :characterId AND e.userId = :userId " +
           "AND e.createdAt BETWEEN :startTime AND :endTime " +
           "ORDER BY e.createdAt DESC")
    List<CharacterGrowthEventEntity> findByCharacterIdAndUserIdAndTimeRange(
        @Param("characterId") Long characterId,
        @Param("userId") Long userId,
        @Param("startTime") LocalDateTime startTime,
        @Param("endTime") LocalDateTime endTime);
    
    /**
     * 统计指定角色和用户的成长事件数量
     */
    long countByCharacterIdAndUserId(Long characterId, Long userId);
}
