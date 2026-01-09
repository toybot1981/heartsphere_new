package com.heartsphere.admin.repository;

import com.heartsphere.admin.entity.PromptCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PromptCategoryRepository extends JpaRepository<PromptCategory, Long> {
    Optional<PromptCategory> findByCode(String code);
    List<PromptCategory> findByIsActiveTrueOrderBySortOrderAsc();
    List<PromptCategory> findByParentId(Long parentId);
    boolean existsByCode(String code);
}
