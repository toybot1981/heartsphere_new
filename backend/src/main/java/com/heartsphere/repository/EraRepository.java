package com.heartsphere.repository;

import com.heartsphere.entity.Era;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EraRepository extends JpaRepository<Era, Long> {
    @EntityGraph(attributePaths = {"world", "user"})
    @Query("SELECT e FROM Era e WHERE e.user.id = :userId AND e.isDeleted = false")
    List<Era> findByUser_Id(@Param("userId") Long userId);
    
    @EntityGraph(attributePaths = {"world", "user"})
    @Query("SELECT e FROM Era e WHERE e.world.id = :worldId AND e.isDeleted = false")
    List<Era> findByWorld_Id(@Param("worldId") Long worldId);
    
    @EntityGraph(attributePaths = {"world", "user"})
    @Query("SELECT e FROM Era e WHERE e.world.id = :worldId AND e.user.id = :userId AND e.isDeleted = false")
    List<Era> findByWorld_IdAndUser_Id(@Param("worldId") Long worldId, @Param("userId") Long userId);
    
    // 回收站：获取已删除的时代
    @EntityGraph(attributePaths = {"world", "user"})
    @Query("SELECT e FROM Era e WHERE e.user.id = :userId AND e.isDeleted = true")
    List<Era> findDeletedByUser_Id(@Param("userId") Long userId);
}