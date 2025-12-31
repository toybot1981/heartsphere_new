package com.heartsphere.repository;

import com.heartsphere.entity.ScenarioItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ScenarioItemRepository extends JpaRepository<ScenarioItem, Long> {
    // 根据物品ID查找
    Optional<ScenarioItem> findByItemId(String itemId);
    
    // 根据场景查找（包括系统物品和用户自定义物品）
    @Query("SELECT i FROM ScenarioItem i WHERE (i.era.id = :eraId OR i.isSystem = true) AND i.isDeleted = false AND i.isActive = true ORDER BY i.isSystem DESC, i.sortOrder ASC, i.createdAt DESC")
    List<ScenarioItem> findByEraIdOrSystem(@Param("eraId") Long eraId);
    
    // 根据用户查找
    List<ScenarioItem> findByUser_IdAndIsDeletedFalse(Long userId);
    
    // 查找所有系统物品
    List<ScenarioItem> findByIsSystemTrueAndIsDeletedFalseAndIsActiveTrue();
    
    // 根据物品类型查找
    @Query("SELECT i FROM ScenarioItem i WHERE (i.era.id = :eraId OR i.isSystem = true) AND i.itemType = :itemType AND i.isDeleted = false AND i.isActive = true ORDER BY i.isSystem DESC, i.sortOrder ASC")
    List<ScenarioItem> findByEraIdOrSystemAndItemType(@Param("eraId") Long eraId, @Param("itemType") String itemType);
    
    // 检查物品ID是否已存在
    Boolean existsByItemId(String itemId);
}



