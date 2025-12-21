package com.heartsphere.repository;

import com.heartsphere.entity.Character;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface CharacterRepository extends JpaRepository<Character, Long> {
    @EntityGraph(attributePaths = {"world", "era", "user"})
    @Query("SELECT c FROM Character c WHERE c.user.id = :userId AND c.isDeleted = false")
    List<Character> findByUser_Id(@Param("userId") Long userId);
    
    @EntityGraph(attributePaths = {"world", "era", "user"})
    @Query("SELECT c FROM Character c WHERE c.world.id = :worldId AND c.isDeleted = false")
    List<Character> findByWorld_Id(@Param("worldId") Long worldId);
    
    @EntityGraph(attributePaths = {"world", "era", "user"})
    @Query("SELECT c FROM Character c WHERE c.era.id = :eraId AND c.isDeleted = false")
    List<Character> findByEra_Id(@Param("eraId") Long eraId);
    
    // 回收站：获取已删除的角色
    @EntityGraph(attributePaths = {"world", "era", "user"})
    @Query("SELECT c FROM Character c WHERE c.user.id = :userId AND c.isDeleted = true")
    List<Character> findDeletedByUser_Id(@Param("userId") Long userId);
    
    // 统计指定日期范围内创建的角色数
    @Query("SELECT COUNT(c) FROM Character c WHERE c.createdAt >= :startDate AND c.createdAt < :endDate")
    Long countByCreatedAtBetween(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
}