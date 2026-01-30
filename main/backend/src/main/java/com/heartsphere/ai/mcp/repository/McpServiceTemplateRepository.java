package com.heartsphere.ai.mcp.repository;

import com.heartsphere.ai.mcp.entity.McpServiceTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface McpServiceTemplateRepository extends JpaRepository<McpServiceTemplate, Long> {

    Optional<McpServiceTemplate> findByTemplateName(String templateName);

    List<McpServiceTemplate> findByServerType(String serverType);

    List<McpServiceTemplate> findByCategory(String category);

    List<McpServiceTemplate> findByIsPopularTrue();
}
