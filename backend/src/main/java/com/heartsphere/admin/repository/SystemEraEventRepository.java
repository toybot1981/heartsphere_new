package com.heartsphere.admin.repository;

import com.heartsphere.admin.entity.SystemEraEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SystemEraEventRepository extends JpaRepository<SystemEraEvent, Long> {
    // 根据事件ID查找
    Optional<SystemEraEvent> findByEventId(String eventId);
    
    // 根据系统时代ID查找
    List<SystemEraEvent> findBySystemEraIdAndIsDeletedFalseAndIsActiveTrue(Long systemEraId);
    
    // 查找所有启用的系统事件
    List<SystemEraEvent> findByIsDeletedFalseAndIsActiveTrueOrderBySortOrderAsc();
    
    // 检查事件ID是否已存在
    Boolean existsByEventId(String eventId);
}




