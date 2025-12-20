package com.heartsphere.repository;

import com.heartsphere.entity.NoteSync;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface NoteSyncRepository extends JpaRepository<NoteSync, Long> {
    List<NoteSync> findByUserId(Long userId);
    
    Optional<NoteSync> findByUserIdAndProvider(Long userId, String provider);
    
    List<NoteSync> findByUserIdAndIsActiveTrue(Long userId);
}




