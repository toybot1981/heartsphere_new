package com.heartsphere.admin.repository;

import com.heartsphere.admin.entity.SystemEraItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SystemEraItemRepository extends JpaRepository<SystemEraItem, Long> {
    // 根据物品ID查找
    Optional<SystemEraItem> findByItemId(String itemId);
    
    // 根据系统时代ID查找
    List<SystemEraItem> findBySystemEraIdAndIsDeletedFalseAndIsActiveTrue(Long systemEraId);
    
    // 查找所有启用的系统物品
    List<SystemEraItem> findByIsDeletedFalseAndIsActiveTrueOrderBySortOrderAsc();
    
    // 根据物品类型查找
    @Query("SELECT i FROM SystemEraItem i WHERE i.systemEraId = :systemEraId AND i.itemType = :itemType AND i.isDeleted = false AND i.isActive = true ORDER BY i.sortOrder ASC")
    List<SystemEraItem> findBySystemEraIdAndItemType(@Param("systemEraId") Long systemEraId, @Param("itemType") String itemType);
    
    // 检查物品ID是否已存在
    Boolean existsByItemId(String itemId);
}




