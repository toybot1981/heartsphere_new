package com.heartsphere.admin.repository;

import com.heartsphere.admin.entity.PromptVariable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PromptVariableRepository extends JpaRepository<PromptVariable, Long> {
    List<PromptVariable> findByTemplateId(Long templateId);
    Optional<PromptVariable> findByTemplateIdAndVariableName(Long templateId, String variableName);
    void deleteByTemplateId(Long templateId);
}
