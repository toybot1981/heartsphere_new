package com.heartsphere.admin.service;

import com.heartsphere.admin.repository.MentisToolConfigRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Mentis 工具配置服务
 * 提供工具配置的读取和更新功能，访问 Mentis 数据库
 */
@Slf4j
@Service("mentisToolConfigService")
@RequiredArgsConstructor
public class MentisToolConfigService {
    
    private final MentisToolConfigRepository mentisToolConfigRepository;
    
    /**
     * 根据工具名称获取配置
     */
    public Optional<MentisToolConfigDTO> getConfigByToolName(String toolName) {
        return mentisToolConfigRepository.findByToolName(toolName)
            .map(this::toDTO);
    }
    
    /**
     * 根据分类获取所有启用的配置
     */
    public List<MentisToolConfigDTO> getConfigsByCategory(String category) {
        return mentisToolConfigRepository.findByCategoryAndIsActiveTrue(category).stream()
            .map(this::toDTO)
            .collect(Collectors.toList());
    }
    
    /**
     * 获取所有启用的配置
     */
    public List<MentisToolConfigDTO> getAllActiveConfigs() {
        return mentisToolConfigRepository.findByIsActiveTrue().stream()
            .map(this::toDTO)
            .collect(Collectors.toList());
    }
    
    /**
     * 保存或更新工具配置
     */
    @Transactional
    public MentisToolConfigDTO saveConfig(MentisToolConfigDTO dto) {
        log.info("保存工具配置: toolName={}", dto.getToolName());
        MentisToolConfigRepository.MentisToolConfigEntity entity = toEntity(dto);
        MentisToolConfigRepository.MentisToolConfigEntity saved = mentisToolConfigRepository.save(entity);
        return toDTO(saved);
    }
    
    /**
     * 删除工具配置
     */
    @Transactional
    public void deleteConfig(String toolName) {
        log.info("删除工具配置: toolName={}", toolName);
        mentisToolConfigRepository.deleteByToolName(toolName);
    }
    
    /**
     * 检查工具配置是否存在
     */
    public boolean existsByToolName(String toolName) {
        return mentisToolConfigRepository.existsByToolName(toolName);
    }
    
    /**
     * 转换为 DTO
     */
    private MentisToolConfigDTO toDTO(MentisToolConfigRepository.MentisToolConfigEntity entity) {
        MentisToolConfigDTO dto = new MentisToolConfigDTO();
        dto.setId(entity.getId());
        dto.setToolName(entity.getToolName());
        dto.setDescription(entity.getDescription());
        dto.setCategory(entity.getCategory());
        dto.setPromptTemplateCategory(entity.getPromptTemplateCategory());
        dto.setInstructionTemplate(entity.getInstructionTemplate());
        dto.setScriptTemplate(entity.getScriptTemplate());
        dto.setParametersSchema(entity.getParametersSchema());
        dto.setIsActive(entity.getIsActive());
        dto.setCreatedAt(entity.getCreatedAt() != null ? entity.getCreatedAt().toString() : null);
        dto.setUpdatedAt(entity.getUpdatedAt() != null ? entity.getUpdatedAt().toString() : null);
        return dto;
    }
    
    /**
     * 转换为 Entity
     */
    private MentisToolConfigRepository.MentisToolConfigEntity toEntity(MentisToolConfigDTO dto) {
        MentisToolConfigRepository.MentisToolConfigEntity entity = new MentisToolConfigRepository.MentisToolConfigEntity();
        if (dto.getId() != null) {
            entity.setId(dto.getId());
        }
        entity.setToolName(dto.getToolName());
        entity.setDescription(dto.getDescription());
        entity.setCategory(dto.getCategory());
        entity.setPromptTemplateCategory(dto.getPromptTemplateCategory());
        entity.setInstructionTemplate(dto.getInstructionTemplate());
        entity.setScriptTemplate(dto.getScriptTemplate());
        entity.setParametersSchema(dto.getParametersSchema());
        entity.setIsActive(dto.getIsActive() != null ? dto.getIsActive() : true);
        return entity;
    }
    
    /**
     * Mentis 工具配置 DTO
     */
    public static class MentisToolConfigDTO {
        private Long id;
        private String toolName;
        private String description;
        private String category;
        private String promptTemplateCategory;
        private String instructionTemplate;
        private String scriptTemplate;
        private String parametersSchema;
        private Boolean isActive;
        private String createdAt;
        private String updatedAt;
        
        // Getters and setters
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getToolName() { return toolName; }
        public void setToolName(String toolName) { this.toolName = toolName; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public String getCategory() { return category; }
        public void setCategory(String category) { this.category = category; }
        public String getPromptTemplateCategory() { return promptTemplateCategory; }
        public void setPromptTemplateCategory(String promptTemplateCategory) { this.promptTemplateCategory = promptTemplateCategory; }
        public String getInstructionTemplate() { return instructionTemplate; }
        public void setInstructionTemplate(String instructionTemplate) { this.instructionTemplate = instructionTemplate; }
        public String getScriptTemplate() { return scriptTemplate; }
        public void setScriptTemplate(String scriptTemplate) { this.scriptTemplate = scriptTemplate; }
        public String getParametersSchema() { return parametersSchema; }
        public void setParametersSchema(String parametersSchema) { this.parametersSchema = parametersSchema; }
        public Boolean getIsActive() { return isActive; }
        public void setIsActive(Boolean isActive) { this.isActive = isActive; }
        public String getCreatedAt() { return createdAt; }
        public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
        public String getUpdatedAt() { return updatedAt; }
        public void setUpdatedAt(String updatedAt) { this.updatedAt = updatedAt; }
    }
}
