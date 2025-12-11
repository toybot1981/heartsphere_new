package com.heartsphere.repository;

import com.heartsphere.entity.JournalEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JournalEntryRepository extends JpaRepository<JournalEntry, String> {
    List<JournalEntry> findByUser_Id(Long userId);
    List<JournalEntry> findByWorld_Id(Long worldId);
    List<JournalEntry> findByEra_Id(Long eraId);
    List<JournalEntry> findByCharacter_Id(Long characterId);
}