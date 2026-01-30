package com.heartsphere.memory.repository.jpa;

import com.heartsphere.memory.entity.CharacterMentorshipSessionEntity;
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
 * 角色导师指导会话 Repository
 * 
 * @author HeartSphere
 * @date 2026-01-25
 */
@Repository
public interface CharacterMentorshipSessionRepository extends JpaRepository<CharacterMentorshipSessionEntity, Long> {
    
    /**
     * 根据角色ID和用户ID查询指导会话
     */
    List<CharacterMentorshipSessionEntity> findByCharacterIdAndUserIdOrderByStartedAtDesc(
        Long characterId, Long userId);
    
    /**
     * 根据角色ID和用户ID分页查询指导会话
     */
    Page<CharacterMentorshipSessionEntity> findByCharacterIdAndUserIdOrderByStartedAtDesc(
        Long characterId, Long userId, Pageable pageable);
    
    /**
     * 根据会话类型查询指导会话
     */
    List<CharacterMentorshipSessionEntity> findByCharacterIdAndUserIdAndSessionTypeOrderByStartedAtDesc(
        Long characterId, Long userId, String sessionType);
    
    /**
     * 根据状态查询指导会话
     */
    List<CharacterMentorshipSessionEntity> findByCharacterIdAndUserIdAndStatusOrderByStartedAtDesc(
        Long characterId, Long userId, String status);
    
    /**
     * 查询活跃的指导会话
     */
    @Query("SELECT s FROM CharacterMentorshipSessionEntity s " +
           "WHERE s.characterId = :characterId AND s.userId = :userId " +
           "AND s.status = 'ACTIVE' " +
           "ORDER BY s.startedAt DESC")
    List<CharacterMentorshipSessionEntity> findActiveSessions(
        @Param("characterId") Long characterId,
        @Param("userId") Long userId);
    
    /**
     * 查询最新的活跃指导会话
     */
    @Query("SELECT s FROM CharacterMentorshipSessionEntity s " +
           "WHERE s.characterId = :characterId AND s.userId = :userId " +
           "AND s.status = 'ACTIVE' " +
           "ORDER BY s.startedAt DESC")
    Optional<CharacterMentorshipSessionEntity> findLatestActiveSession(
        @Param("characterId") Long characterId,
        @Param("userId") Long userId);
    
    /**
     * 查询指定时间范围内的指导会话
     */
    @Query("SELECT s FROM CharacterMentorshipSessionEntity s " +
           "WHERE s.characterId = :characterId AND s.userId = :userId " +
           "AND s.startedAt BETWEEN :startTime AND :endTime " +
           "ORDER BY s.startedAt DESC")
    List<CharacterMentorshipSessionEntity> findByCharacterIdAndUserIdAndTimeRange(
        @Param("characterId") Long characterId,
        @Param("userId") Long userId,
        @Param("startTime") LocalDateTime startTime,
        @Param("endTime") LocalDateTime endTime);
    
    /**
     * 统计指定角色和用户的指导会话数量
     */
    long countByCharacterIdAndUserId(Long characterId, Long userId);
    
    /**
     * 统计指定角色和用户已完成的指导会话数量
     */
    long countByCharacterIdAndUserIdAndStatus(Long characterId, Long userId, String status);
}
