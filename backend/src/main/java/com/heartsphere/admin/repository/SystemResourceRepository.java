package com.heartsphere.admin.repository;

import com.heartsphere.admin.entity.SystemResource;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SystemResourceRepository extends JpaRepository<SystemResource, Long> {
    List<SystemResource> findByCategory(String category);
    List<SystemResource> findByCategoryOrderByCreatedAtDesc(String category);
    List<SystemResource> findAllByOrderByCreatedAtDesc();
}



