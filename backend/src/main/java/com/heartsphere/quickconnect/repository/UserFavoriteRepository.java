package com.heartsphere.quickconnect.repository;

import com.heartsphere.quickconnect.entity.UserFavorite;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * 用户收藏Repository
 */
@Repository
public interface UserFavoriteRepository extends JpaRepository<UserFavorite, Long> {
    
    /**
     * 根据用户ID查找所有收藏
     * 使用EntityGraph优化查询，避免N+1问题
     */
    @EntityGraph(attributePaths = {"user", "character"})
    @Query("SELECT uf FROM UserFavorite uf WHERE uf.user.id = :userId ORDER BY uf.sortOrder ASC, uf.createdAt DESC")
    List<UserFavorite> findByUserIdOrderBySortOrderAscCreatedAtDesc(@Param("userId") Long userId);
    
    /**
     * 根据用户ID和角色ID查找收藏
     */
    @EntityGraph(attributePaths = {"user", "character"})
    @Query("SELECT uf FROM UserFavorite uf WHERE uf.user.id = :userId AND uf.character.id = :characterId")
    Optional<UserFavorite> findByUserIdAndCharacterId(@Param("userId") Long userId, @Param("characterId") Long characterId);
    
    /**
     * 检查用户是否已收藏某个角色
     */
    @Query("SELECT COUNT(uf) > 0 FROM UserFavorite uf WHERE uf.user.id = :userId AND uf.character.id = :characterId")
    boolean existsByUserIdAndCharacterId(@Param("userId") Long userId, @Param("characterId") Long characterId);
    
    /**
     * 根据用户ID和角色ID删除收藏
     */
    @Query("DELETE FROM UserFavorite uf WHERE uf.user.id = :userId AND uf.character.id = :characterId")
    void deleteByUserIdAndCharacterId(@Param("userId") Long userId, @Param("characterId") Long characterId);
    
    /**
     * 统计用户的收藏数量
     */
    @Query("SELECT COUNT(uf) FROM UserFavorite uf WHERE uf.user.id = :userId")
    long countByUserId(@Param("userId") Long userId);
    
    /**
     * 根据用户ID和角色ID列表查找收藏
     */
    @EntityGraph(attributePaths = {"user", "character"})
    @Query("SELECT uf FROM UserFavorite uf WHERE uf.user.id = :userId AND uf.character.id IN :characterIds")
    List<UserFavorite> findByUserIdAndCharacterIdIn(@Param("userId") Long userId, @Param("characterIds") List<Long> characterIds);
}




