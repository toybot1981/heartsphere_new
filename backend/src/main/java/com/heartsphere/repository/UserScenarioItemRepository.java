package com.heartsphere.repository;

import com.heartsphere.entity.UserScenarioItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserScenarioItemRepository extends JpaRepository<UserScenarioItem, Long> {
    // 根据剧本ID查找
    List<UserScenarioItem> findByScript_Id(Long scriptId);
    
    // 根据剧本ID和节点ID查找
    List<UserScenarioItem> findByScript_IdAndNodeId(Long scriptId, String nodeId);
    
    // 根据系统物品ID查找（查找所有使用该系统物品的用户场景物品）
    List<UserScenarioItem> findBySystemEraItemId(Long systemEraItemId);
    
    // 根据物品ID查找
    @Query("SELECT i FROM UserScenarioItem i WHERE i.itemId = :itemId")
    List<UserScenarioItem> findByItemId(@Param("itemId") String itemId);
}




