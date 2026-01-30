package com.heartsphere.admin.repository.agentmind;

import com.heartsphere.admin.config.DataSource;
import com.heartsphere.admin.entity.agentmind.AgentStateHistory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 智能体状态历史Repository
 * 使用 agent-mind 数据源
 */
@Repository
@DataSource("agent-mind")
public interface AgentStateHistoryRepository extends JpaRepository<AgentStateHistory, Long> {
    
    /**
     * 根据角色ID查找状态历史（按时间倒序）
     */
    List<AgentStateHistory> findByCharacterIdOrderByCreatedAtDesc(Long characterId);
    
    /**
     * 根据角色ID分页查找状态历史（按时间倒序）
     */
    Page<AgentStateHistory> findByCharacterIdOrderByCreatedAtDesc(Long characterId, Pageable pageable);
    
    /**
     * 根据角色ID和状态类型查找状态历史
     */
    List<AgentStateHistory> findByCharacterIdAndStateTypeOrderByCreatedAtDesc(Long characterId, String stateType);
    
    /**
     * 根据角色ID查找最新的状态记录
     */
    @Query("SELECT a FROM AgentStateHistory a WHERE a.characterId = :characterId ORDER BY a.createdAt DESC")
    List<AgentStateHistory> findLatestByCharacterId(@Param("characterId") Long characterId, Pageable pageable);
    
    /**
     * 根据角色ID和时间范围查找状态历史
     */
    @Query("SELECT a FROM AgentStateHistory a WHERE a.characterId = :characterId AND a.createdAt >= :startTime AND a.createdAt <= :endTime ORDER BY a.createdAt DESC")
    List<AgentStateHistory> findByCharacterIdAndTimeRange(
        @Param("characterId") Long characterId,
        @Param("startTime") LocalDateTime startTime,
        @Param("endTime") LocalDateTime endTime
    );
    
    /**
     * 统计角色各状态类型的出现次数
     */
    @Query("SELECT a.stateType, COUNT(a) FROM AgentStateHistory a WHERE a.characterId = :characterId GROUP BY a.stateType")
    List<Object[]> countByStateType(@Param("characterId") Long characterId);
}
