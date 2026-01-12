package com.heartsphere.repository;

import com.heartsphere.entity.Script;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ScriptRepository extends JpaRepository<Script, Long> {
    @Query("SELECT s FROM Script s WHERE s.user.id = :userId AND s.isDeleted = false")
    List<Script> findByUser_Id(@Param("userId") Long userId);
    
    @Query("SELECT s FROM Script s WHERE s.world.id = :worldId AND s.isDeleted = false")
    List<Script> findByWorld_Id(@Param("worldId") Long worldId);
    
    @Query("SELECT s FROM Script s WHERE s.era.id = :eraId AND s.isDeleted = false")
    List<Script> findByEra_Id(@Param("eraId") Long eraId);
    
    // 查找所有引用某个era的脚本（包括已删除的），用于强制删除
    @Query("SELECT s FROM Script s WHERE s.era.id = :eraId")
    List<Script> findAllByEra_Id(@Param("eraId") Long eraId);
    
    // 查找所有引用某个world的脚本（包括已删除的），用于强制删除
    @Query("SELECT s FROM Script s WHERE s.world.id = :worldId")
    List<Script> findAllByWorld_Id(@Param("worldId") Long worldId);
    
    // 回收站：获取已删除的剧本
    @Query("SELECT s FROM Script s WHERE s.user.id = :userId AND s.isDeleted = true")
    List<Script> findDeletedByUser_Id(@Param("userId") Long userId);
}