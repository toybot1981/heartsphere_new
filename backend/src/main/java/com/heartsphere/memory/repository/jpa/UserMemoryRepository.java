package com.heartsphere.memory.repository.jpa;

import com.heartsphere.memory.entity.UserMemoryEntity;
import com.heartsphere.memory.model.MemoryImportance;
import com.heartsphere.memory.model.MemorySource;
import com.heartsphere.memory.model.MemoryType;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 用户记忆Repository（JPA）
 * 
 * @author HeartSphere
 * @date 2025-12-31
 */
@Repository
public interface UserMemoryRepository extends JpaRepository<UserMemoryEntity, String> {
    
    /**
     * 根据用户ID获取所有记忆
     */
    List<UserMemoryEntity> findByUserIdOrderByCreatedAtDesc(String userId);
    
    /**
     * 根据用户ID和类型获取记忆
     */
    List<UserMemoryEntity> findByUserIdAndTypeOrderByCreatedAtDesc(
        String userId, 
        MemoryType type,
        Pageable pageable
    );
    
    /**
     * 根据用户ID和重要性获取记忆
     */
    List<UserMemoryEntity> findByUserIdAndImportanceOrderByCreatedAtDesc(
        String userId,
        MemoryImportance importance,
        Pageable pageable
    );
    
    /**
     * 根据用户ID和来源获取记忆
     */
    List<UserMemoryEntity> findByUserIdAndSourceOrderByCreatedAtDesc(
        String userId,
        MemorySource source,
        Pageable pageable
    );
    
    /**
     * 根据用户ID和来源ID获取记忆
     */
    List<UserMemoryEntity> findByUserIdAndSourceId(String userId, String sourceId);
    
    /**
     * 搜索记忆（内容包含关键词）
     */
    @Query("SELECT m FROM UserMemoryEntity m WHERE m.userId = :userId " +
           "AND m.content LIKE %:keyword% " +
           "ORDER BY m.createdAt DESC")
    List<UserMemoryEntity> searchByContent(
        @Param("userId") String userId,
        @Param("keyword") String keyword,
        Pageable pageable
    );
    
    /**
     * 根据用户ID统计记忆数量
     */
    long countByUserId(String userId);
    
    /**
     * 根据用户ID和类型统计记忆数量
     */
    long countByUserIdAndType(String userId, MemoryType type);
    
    /**
     * 根据用户ID和重要性统计记忆数量
     */
    long countByUserIdAndImportance(String userId, MemoryImportance importance);
    
    /**
     * 删除用户记忆
     */
    @Modifying
    @Query("DELETE FROM UserMemoryEntity m WHERE m.id = :memoryId AND m.userId = :userId")
    void deleteByIdAndUserId(@Param("memoryId") String memoryId, @Param("userId") String userId);
    
    /**
     * 更新访问信息
     */
    @Modifying
    @Query("UPDATE UserMemoryEntity m SET m.lastAccessedAt = :lastAccessedAt, " +
           "m.accessCount = m.accessCount + 1 WHERE m.id = :memoryId")
    void updateAccessInfo(@Param("memoryId") String memoryId, @Param("lastAccessedAt") LocalDateTime lastAccessedAt);
}


