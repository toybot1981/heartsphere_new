package com.heartsphere.aistudio.repository;

import com.heartsphere.aistudio.entity.CreationEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CreationRepository extends JpaRepository<CreationEntity, Long> {
    
    Optional<CreationEntity> findByCreationId(String creationId);
    
    List<CreationEntity> findByTypeOrderByCreatedAtDesc(String type);
    
    List<CreationEntity> findByUserIdOrderByCreatedAtDesc(String userId);
    
    List<CreationEntity> findAllByOrderByCreatedAtDesc();
}








