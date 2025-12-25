package com.heartsphere.admin.repository;

import com.heartsphere.admin.entity.SystemCharacter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SystemCharacterRepository extends JpaRepository<SystemCharacter, Long> {
    List<SystemCharacter> findByIsActiveTrueOrderBySortOrderAsc();
    List<SystemCharacter> findBySystemEraId(Long systemEraId);
    
    @Query("SELECT c FROM SystemCharacter c WHERE c.isActive = true ORDER BY c.sortOrder ASC, c.id ASC")
    List<SystemCharacter> findAllActiveOrdered();
    
    @Query("SELECT c FROM SystemCharacter c WHERE c.systemEra.id = :eraId AND c.isActive = true ORDER BY c.sortOrder ASC, c.id ASC")
    List<SystemCharacter> findBySystemEraIdAndIsActiveTrue(@org.springframework.data.repository.query.Param("eraId") Long eraId);
}



