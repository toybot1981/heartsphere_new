package com.heartsphere.admin.repository;

import com.heartsphere.admin.entity.SystemScript;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SystemScriptRepository extends JpaRepository<SystemScript, Long> {
    List<SystemScript> findByIsActiveTrueOrderBySortOrderAsc();
    
    @Query("SELECT s FROM SystemScript s WHERE s.isActive = true AND s.systemEra.id = :eraId ORDER BY s.sortOrder ASC, s.id ASC")
    List<SystemScript> findByEraIdAndIsActiveTrue(Long eraId);
    
    @Query("SELECT s FROM SystemScript s WHERE s.isActive = true ORDER BY s.sortOrder ASC, s.id ASC")
    List<SystemScript> findAllActiveOrdered();
}



