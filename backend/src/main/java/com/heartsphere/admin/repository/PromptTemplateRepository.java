package com.heartsphere.admin.repository;

import com.heartsphere.admin.entity.PromptTemplate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PromptTemplateRepository extends JpaRepository<PromptTemplate, Long> {
    Page<PromptTemplate> findByCategoryCodeAndIsActiveTrue(String categoryCode, Pageable pageable);
    Page<PromptTemplate> findByNameContainingIgnoreCaseAndIsActiveTrue(String name, Pageable pageable);
    
    @Query("SELECT p FROM PromptTemplate p WHERE " +
           "(:categoryCode IS NULL OR p.categoryCode = :categoryCode) AND " +
           "(:keyword IS NULL OR p.name LIKE %:keyword%) AND " +
           "p.isActive = true")
    Page<PromptTemplate> searchTemplates(
        @Param("categoryCode") String categoryCode,
        @Param("keyword") String keyword,
        Pageable pageable
    );
    
    List<PromptTemplate> findByCategoryCodeAndIsActiveTrue(String categoryCode);
    Optional<PromptTemplate> findByIdAndIsActiveTrue(Long id);
}
