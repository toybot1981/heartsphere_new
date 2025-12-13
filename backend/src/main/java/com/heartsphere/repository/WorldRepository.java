package com.heartsphere.repository;

import com.heartsphere.entity.World;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface WorldRepository extends JpaRepository<World, Long> {
    // 按照其他Repository的模式，添加根据用户ID查询世界的方法
    @Query("SELECT w FROM World w WHERE w.userId = :userId AND w.isDeleted = false")
    List<World> findByUserId(@Param("userId") Long userId);
    
    // 回收站：获取已删除的世界
    @Query("SELECT w FROM World w WHERE w.userId = :userId AND w.isDeleted = true")
    List<World> findDeletedByUserId(@Param("userId") Long userId);
}