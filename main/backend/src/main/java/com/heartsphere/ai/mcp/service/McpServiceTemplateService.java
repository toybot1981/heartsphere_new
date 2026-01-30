package com.heartsphere.ai.mcp.service;

import com.heartsphere.ai.mcp.entity.McpServiceTemplate;
import com.heartsphere.ai.mcp.repository.McpServiceTemplateRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class McpServiceTemplateService {

    private final McpServiceTemplateRepository templateRepository;

    public List<McpServiceTemplate> getAllTemplates() {
        return templateRepository.findAll();
    }

    public List<McpServiceTemplate> getPopularTemplates() {
        return templateRepository.findByIsPopularTrue();
    }

    public List<McpServiceTemplate> getTemplatesByCategory(String category) {
        return templateRepository.findByCategory(category);
    }

    public List<McpServiceTemplate> getTemplatesByServerType(String serverType) {
        return templateRepository.findByServerType(serverType);
    }

    public Optional<McpServiceTemplate> getTemplateById(Long id) {
        return templateRepository.findById(id);
    }

    public Optional<McpServiceTemplate> getTemplateByName(String templateName) {
        return templateRepository.findByTemplateName(templateName);
    }

    @Transactional
    public McpServiceTemplate createTemplate(McpServiceTemplate template) {
        return templateRepository.save(template);
    }

    @Transactional
    public McpServiceTemplate updateTemplate(Long id, McpServiceTemplate template) {
        McpServiceTemplate existing = templateRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("模板不存在: " + id));
        existing.setTemplateName(template.getTemplateName());
        existing.setServerType(template.getServerType());
        existing.setCategory(template.getCategory());
        existing.setDefaultUrl(template.getDefaultUrl());
        existing.setDefaultUrlTemplate(template.getDefaultUrlTemplate());
        existing.setRequiredParams(template.getRequiredParams());
        existing.setOptionalParams(template.getOptionalParams());
        existing.setDescription(template.getDescription());
        existing.setSetupInstructions(template.getSetupInstructions());
        existing.setIconUrl(template.getIconUrl());
        existing.setIsPopular(template.getIsPopular());
        return templateRepository.save(existing);
    }

    @Transactional
    public void deleteTemplate(Long id) {
        templateRepository.deleteById(id);
    }
}
