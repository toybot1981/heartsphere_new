package com.heartsphere.repository;

import com.heartsphere.entity.UserScenarioEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserScenarioEventRepository extends JpaRepository<UserScenarioEvent, Long> {
    // 根据剧本ID查找
    List<UserScenarioEvent> findByScript_Id(Long scriptId);
    
    // 根据剧本ID和节点ID查找
    List<UserScenarioEvent> findByScript_IdAndNodeId(Long scriptId, String nodeId);
    
    // 根据系统事件ID查找（查找所有使用该系统事件的用户场景事件）
    List<UserScenarioEvent> findBySystemEraEventId(Long systemEraEventId);
    
    // 根据事件ID查找
    @Query("SELECT e FROM UserScenarioEvent e WHERE e.eventId = :eventId")
    List<UserScenarioEvent> findByEventId(@Param("eventId") String eventId);
}



