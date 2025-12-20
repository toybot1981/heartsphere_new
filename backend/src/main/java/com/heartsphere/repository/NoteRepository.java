package com.heartsphere.repository;

import com.heartsphere.entity.Note;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface NoteRepository extends JpaRepository<Note, Long> {
    List<Note> findByUserId(Long userId);
    
    List<Note> findByUserIdAndIsDeletedFalse(Long userId);
    
    Optional<Note> findByUserIdAndProviderAndProviderNoteId(Long userId, String provider, String providerNoteId);
    
    List<Note> findByUserIdAndProvider(Long userId, String provider);
    
    @Query("SELECT n FROM Note n WHERE n.userId = :userId AND n.isDeleted = false ORDER BY n.updatedAtProvider DESC")
    List<Note> findRecentNotesByUserId(@Param("userId") Long userId);
}




