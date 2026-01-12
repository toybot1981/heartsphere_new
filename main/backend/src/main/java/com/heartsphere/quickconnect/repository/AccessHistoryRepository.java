package com.heartsphere.quickconnect.repository;

import com.heartsphere.quickconnect.entity.AccessHistory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 访问历史Repository
 */
@Repository
public interface AccessHistoryRepository extends JpaRepository<AccessHistory, Long> {
    
    /**
     * 根据用户ID查找访问历史，按访问时间倒序
     * 使用EntityGraph优化查询，避免N+1问题
     */
    @EntityGraph(attributePaths = {"user", "character"})
    @Query("SELECT ah FROM AccessHistory ah WHERE ah.user.id = :userId ORDER BY ah.accessTime DESC")
    List<AccessHistory> findByUserIdOrderByAccessTimeDesc(@Param("userId") Long userId);
    
    /**
     * 根据用户ID分页查找访问历史
     */
    @EntityGraph(attributePaths = {"user", "character"})
    @Query("SELECT ah FROM AccessHistory ah WHERE ah.user.id = :userId ORDER BY ah.accessTime DESC")
    Page<AccessHistory> findByUserIdOrderByAccessTimeDesc(@Param("userId") Long userId, Pageable pageable);
    
    /**
     * 根据用户ID和角色ID查找访问历史
     */
    @EntityGraph(attributePaths = {"user", "character"})
    @Query("SELECT ah FROM AccessHistory ah WHERE ah.user.id = :userId AND ah.character.id = :characterId ORDER BY ah.accessTime DESC")
    List<AccessHistory> findByUserIdAndCharacterIdOrderByAccessTimeDesc(
        @Param("userId") Long userId, 
        @Param("characterId") Long characterId
    );
    
    /**
     * 根据用户ID和角色ID分页查找访问历史
     */
    @EntityGraph(attributePaths = {"user", "character"})
    @Query("SELECT ah FROM AccessHistory ah WHERE ah.user.id = :userId AND ah.character.id = :characterId ORDER BY ah.accessTime DESC")
    Page<AccessHistory> findByUserIdAndCharacterIdOrderByAccessTimeDesc(
        @Param("userId") Long userId, 
        @Param("characterId") Long characterId,
        Pageable pageable
    );
    
    /**
     * 根据用户ID和时间范围查找访问历史
     */
    @EntityGraph(attributePaths = {"user", "character"})
    @Query("SELECT ah FROM AccessHistory ah WHERE ah.user.id = :userId AND ah.accessTime BETWEEN :startTime AND :endTime ORDER BY ah.accessTime DESC")
    List<AccessHistory> findByUserIdAndAccessTimeBetween(
        @Param("userId") Long userId,
        @Param("startTime") LocalDateTime startTime,
        @Param("endTime") LocalDateTime endTime
    );
    
    /**
     * 统计用户的访问次数
     */
    @Query("SELECT COUNT(ah) FROM AccessHistory ah WHERE ah.user.id = :userId")
    long countByUserId(@Param("userId") Long userId);
    
    /**
     * 统计用户对特定角色的访问次数
     */
    @Query("SELECT COUNT(ah) FROM AccessHistory ah WHERE ah.user.id = :userId AND ah.character.id = :characterId")
    long countByUserIdAndCharacterId(@Param("userId") Long userId, @Param("characterId") Long characterId);
    
    /**
     * 获取用户最后访问某个角色的时间
     */
    @Query("SELECT MAX(ah.accessTime) FROM AccessHistory ah WHERE ah.user.id = :userId AND ah.character.id = :characterId")
    LocalDateTime findLastAccessTimeByUserIdAndCharacterId(@Param("userId") Long userId, @Param("characterId") Long characterId);
    
    /**
     * 统计用户对特定角色的总访问时长
     */
    @Query("SELECT SUM(ah.accessDuration) FROM AccessHistory ah WHERE ah.user.id = :userId AND ah.character.id = :characterId")
    Long sumAccessDurationByUserIdAndCharacterId(@Param("userId") Long userId, @Param("characterId") Long characterId);
    
    /**
     * 统计用户对特定角色的总对话轮数
     */
    @Query("SELECT SUM(ah.conversationRounds) FROM AccessHistory ah WHERE ah.user.id = :userId AND ah.character.id = :characterId")
    Long sumConversationRoundsByUserIdAndCharacterId(@Param("userId") Long userId, @Param("characterId") Long characterId);
}

