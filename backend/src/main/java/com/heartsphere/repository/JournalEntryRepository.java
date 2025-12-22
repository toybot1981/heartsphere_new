package com.heartsphere.repository;

import com.heartsphere.entity.JournalEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JournalEntryRepository extends JpaRepository<JournalEntry, String> {
    List<JournalEntry> findByUser_Id(Long userId);
    List<JournalEntry> findByWorld_Id(Long worldId);
    List<JournalEntry> findByEra_Id(Long eraId);
    List<JournalEntry> findByCharacter_Id(Long characterId);
    
    // 搜索功能：按标题、内容、标签搜索
    @Query("SELECT j FROM JournalEntry j WHERE j.user.id = :userId AND " +
           "(LOWER(j.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(j.content) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(j.tags) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    List<JournalEntry> searchByKeyword(@Param("userId") Long userId, @Param("keyword") String keyword);
    
    // 按标签筛选
    @Query("SELECT j FROM JournalEntry j WHERE j.user.id = :userId AND " +
           "LOWER(j.tags) LIKE LOWER(CONCAT('%', :tag, '%'))")
    List<JournalEntry> findByTag(@Param("userId") Long userId, @Param("tag") String tag);
}
