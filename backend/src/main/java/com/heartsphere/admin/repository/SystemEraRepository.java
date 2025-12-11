package com.heartsphere.admin.repository;

import com.heartsphere.admin.entity.SystemEra;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SystemEraRepository extends JpaRepository<SystemEra, Long> {
    List<SystemEra> findByIsActiveTrueOrderBySortOrderAsc();
    
    @Query("SELECT e FROM SystemEra e WHERE e.isActive = true ORDER BY e.sortOrder ASC, e.id ASC")
    List<SystemEra> findAllActiveOrdered();
}

