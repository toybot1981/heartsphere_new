package com.heartsphere.admin.repository;

import com.heartsphere.admin.entity.PromptVersion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PromptVersionRepository extends JpaRepository<PromptVersion, Long> {
    List<PromptVersion> findByTemplateIdOrderByVersionDesc(Long templateId);
    Optional<PromptVersion> findByTemplateIdAndVersion(Long templateId, Integer version);
    Integer findMaxVersionByTemplateId(Long templateId);
}
