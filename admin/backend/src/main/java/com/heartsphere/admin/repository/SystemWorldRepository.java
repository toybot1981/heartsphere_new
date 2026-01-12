package com.heartsphere.admin.repository;

import com.heartsphere.admin.entity.SystemWorld;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SystemWorldRepository extends JpaRepository<SystemWorld, Long> {
    List<SystemWorld> findByIsActiveTrueOrderBySortOrderAsc();
    
    @Query("SELECT w FROM SystemWorld w WHERE w.isActive = true ORDER BY w.sortOrder ASC, w.id ASC")
    List<SystemWorld> findAllActiveOrdered();
}



