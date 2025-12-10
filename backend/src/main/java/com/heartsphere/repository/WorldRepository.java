package com.heartsphere.repository;

import com.heartsphere.entity.World;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WorldRepository extends JpaRepository<World, Long> {
    List<World> findByUserId(Long userId);
}