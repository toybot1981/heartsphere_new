package com.heartsphere.memory.repository.jpa;

import com.heartsphere.memory.entity.CharacterRelationshipMilestoneEntity;
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
 * 角色关系里程碑 Repository
 * 
 * @author HeartSphere
 * @date 2026-01-25
 */
@Repository
public interface CharacterRelationshipMilestoneRepository extends JpaRepository<CharacterRelationshipMilestoneEntity, Long> {
    
    /**
     * 根据角色ID和用户ID查询关系里程碑
     */
    List<CharacterRelationshipMilestoneEntity> findByCharacterIdAndUserIdOrderByCreatedAtDesc(
        Long characterId, Long userId);
    
    /**
     * 根据角色ID和用户ID分页查询关系里程碑
     */
    Page<CharacterRelationshipMilestoneEntity> findByCharacterIdAndUserIdOrderByCreatedAtDesc(
        Long characterId, Long userId, Pageable pageable);
    
    /**
     * 根据里程碑类型查询关系里程碑
     */
    List<CharacterRelationshipMilestoneEntity> findByCharacterIdAndUserIdAndMilestoneTypeOrderByCreatedAtDesc(
        Long characterId, Long userId, String milestoneType);
    
    /**
     * 查询阶段转换里程碑
     */
    @Query("SELECT m FROM CharacterRelationshipMilestoneEntity m " +
           "WHERE m.characterId = :characterId AND m.userId = :userId " +
           "AND m.milestoneType = 'STAGE_TRANSITION' " +
           "ORDER BY m.createdAt DESC")
    List<CharacterRelationshipMilestoneEntity> findStageTransitions(
        @Param("characterId") Long characterId,
        @Param("userId") Long userId);
    
    /**
     * 查询最新的阶段转换里程碑
     */
    @Query("SELECT m FROM CharacterRelationshipMilestoneEntity m " +
           "WHERE m.characterId = :characterId AND m.userId = :userId " +
           "AND m.milestoneType = 'STAGE_TRANSITION' " +
           "ORDER BY m.createdAt DESC")
    Optional<CharacterRelationshipMilestoneEntity> findLatestStageTransition(
        @Param("characterId") Long characterId,
        @Param("userId") Long userId);
    
    /**
     * 查询指定时间范围内的关系里程碑
     */
    @Query("SELECT m FROM CharacterRelationshipMilestoneEntity m " +
           "WHERE m.characterId = :characterId AND m.userId = :userId " +
           "AND m.createdAt BETWEEN :startTime AND :endTime " +
           "ORDER BY m.createdAt DESC")
    List<CharacterRelationshipMilestoneEntity> findByCharacterIdAndUserIdAndTimeRange(
        @Param("characterId") Long characterId,
        @Param("userId") Long userId,
        @Param("startTime") LocalDateTime startTime,
        @Param("endTime") LocalDateTime endTime);
    
    /**
     * 统计指定角色和用户的关系里程碑数量
     */
    long countByCharacterIdAndUserId(Long characterId, Long userId);
}
