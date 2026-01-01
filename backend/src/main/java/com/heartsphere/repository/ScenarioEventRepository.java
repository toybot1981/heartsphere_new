package com.heartsphere.repository;

import com.heartsphere.entity.ScenarioEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ScenarioEventRepository extends JpaRepository<ScenarioEvent, Long> {
    // 根据事件ID查找
    Optional<ScenarioEvent> findByEventId(String eventId);
    
    // 根据场景查找（包括系统事件和用户自定义事件）
    @Query("SELECT e FROM ScenarioEvent e WHERE (e.era.id = :eraId OR e.isSystem = true) AND e.isDeleted = false AND e.isActive = true ORDER BY e.isSystem DESC, e.sortOrder ASC, e.createdAt DESC")
    List<ScenarioEvent> findByEraIdOrSystem(@Param("eraId") Long eraId);
    
    // 根据用户查找
    List<ScenarioEvent> findByUser_IdAndIsDeletedFalse(Long userId);
    
    // 查找所有系统事件
    List<ScenarioEvent> findByIsSystemTrueAndIsDeletedFalseAndIsActiveTrue();
    
    // 检查事件ID是否已存在
    Boolean existsByEventId(String eventId);
}




