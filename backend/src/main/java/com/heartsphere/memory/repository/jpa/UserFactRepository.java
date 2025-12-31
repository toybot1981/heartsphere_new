package com.heartsphere.memory.repository.jpa;

import com.heartsphere.memory.entity.UserFactEntity;
import com.heartsphere.memory.model.FactCategory;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * 用户事实Repository（JPA）
 * 
 * @author HeartSphere
 * @date 2025-12-31
 */
@Repository
public interface UserFactRepository extends JpaRepository<UserFactEntity, String> {
    
    /**
     * 根据用户ID获取所有事实
     */
    List<UserFactEntity> findByUserIdOrderByCreatedAtDesc(String userId);
    
    /**
     * 根据用户ID和类别获取事实
     */
    List<UserFactEntity> findByUserIdAndCategoryOrderByCreatedAtDesc(
        String userId,
        FactCategory category
    );
    
    /**
     * 根据用户ID和最小重要性获取事实
     */
    @Query("SELECT f FROM UserFactEntity f WHERE f.userId = :userId " +
           "AND f.importance >= :minImportance " +
           "ORDER BY f.importance DESC, f.createdAt DESC")
    List<UserFactEntity> findByUserIdAndMinImportance(
        @Param("userId") String userId,
        @Param("minImportance") Double minImportance
    );
    
    /**
     * 搜索事实（内容包含关键词）
     */
    @Query("SELECT f FROM UserFactEntity f WHERE f.userId = :userId " +
           "AND f.fact LIKE %:query% " +
           "ORDER BY f.importance DESC, f.createdAt DESC")
    List<UserFactEntity> searchFacts(
        @Param("userId") String userId,
        @Param("query") String query
    );
    
    /**
     * 根据用户ID统计事实数量
     */
    long countByUserId(String userId);
    
    /**
     * 删除用户事实
     */
    @Modifying
    @Query("DELETE FROM UserFactEntity f WHERE f.id = :factId")
    void deleteById(@Param("factId") String factId);
}

