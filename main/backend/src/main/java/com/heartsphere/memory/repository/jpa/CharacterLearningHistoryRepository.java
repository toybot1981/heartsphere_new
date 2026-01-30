package com.heartsphere.memory.repository.jpa;

import com.heartsphere.memory.entity.CharacterLearningHistoryEntity;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 角色学习历史 Repository（JPA）
 * 
 * @author HeartSphere
 * @date 2026-01-24
 */
@Repository
public interface CharacterLearningHistoryRepository extends JpaRepository<CharacterLearningHistoryEntity, Long> {
    
    /**
     * 根据角色ID获取学习历史（按时间倒序）
     */
    List<CharacterLearningHistoryEntity> findByCharacterIdOrderByCreatedAtDesc(Long characterId, Pageable pageable);
    
    /**
     * 根据角色ID和事件类型获取历史
     */
    List<CharacterLearningHistoryEntity> findByCharacterIdAndEventTypeOrderByCreatedAtDesc(
        Long characterId,
        String eventType,
        Pageable pageable
    );
    
    /**
     * 根据角色ID统计学习历史数量
     */
    long countByCharacterId(Long characterId);
    
    /**
     * 根据角色ID统计特定事件类型的数量
     */
    long countByCharacterIdAndEventType(Long characterId, String eventType);
    
    /**
     * 获取最近一条LEVEL_UP事件
     */
    @Query("SELECT h FROM CharacterLearningHistoryEntity h " +
           "WHERE h.characterId = :characterId AND h.eventType = 'LEVEL_UP' " +
           "ORDER BY h.createdAt DESC LIMIT 1")
    CharacterLearningHistoryEntity findLatestLevelUpEvent(@Param("characterId") Long characterId);
    
    /**
     * 根据角色ID和时间范围获取历史
     */
    List<CharacterLearningHistoryEntity> findByCharacterIdAndCreatedAtBetweenOrderByCreatedAtDesc(
        Long characterId,
        LocalDateTime startTime,
        LocalDateTime endTime
    );
    
    /**
     * 删除指定日期之前的历史记录（保留最近1年的数据）
     */
    @Modifying
    @Query("DELETE FROM CharacterLearningHistoryEntity h WHERE h.characterId = :characterId AND h.createdAt < :beforeDate")
    void deleteOldHistory(@Param("characterId") Long characterId, @Param("beforeDate") LocalDateTime beforeDate);
}
