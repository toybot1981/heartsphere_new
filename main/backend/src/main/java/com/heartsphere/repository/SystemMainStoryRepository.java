package com.heartsphere.repository;

import com.heartsphere.entity.SystemMainStory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SystemMainStoryRepository extends JpaRepository<SystemMainStory, Long> {
    List<SystemMainStory> findBySystemEraId(Long systemEraId);
    
    Optional<SystemMainStory> findBySystemEraIdAndIsActiveTrue(Long systemEraId);
    
    List<SystemMainStory> findByIsActiveTrueOrderBySortOrderAsc();
}
