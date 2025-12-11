package com.heartsphere.repository;

import com.heartsphere.entity.World;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface WorldRepository extends JpaRepository<World, Long> {
    // 按照其他Repository的模式，添加根据用户ID查询世界的方法
    List<World> findByUserId(Long userId);
}