package com.heartsphere.admin.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.heartsphere.admin.dto.*;
import com.heartsphere.admin.entity.PromptCategory;
import com.heartsphere.shared.entity.PromptTemplate;
import com.heartsphere.admin.repository.PromptCategoryRepository;
import com.heartsphere.shared.repository.PromptTemplateRepository;
import com.heartsphere.shared.service.PromptRenderService;
import com.heartsphere.shared.dto.PromptRenderResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

/**
 * 提示词模板服务
 * 管理提示词模板的CRUD操作，使用 shared 模块的 PromptRenderService 进行渲染
 */
@Service
public class PromptTemplateService {
    
    private static final Logger logger = LoggerFactory.getLogger(PromptTemplateService.class);
    
    @Autowired
    private PromptTemplateRepository templateRepository;
    
    @Autowired
    private PromptCategoryRepository categoryRepository;
    
    @Autowired
    private PromptRenderService renderService;
    
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    /**
     * 获取模板列表（分页、搜索）
     */
    public Page<PromptTemplateDTO> getTemplates(String categoryCode, String keyword, Pageable pageable) {
        Page<PromptTemplate> templates = templateRepository.searchTemplates(categoryCode, keyword, pageable);
        return templates.map(this::convertToDTO);
    }
    
    /**
     * 根据ID获取模板
     */
    public PromptTemplateDTO getTemplateById(Long id) {
        PromptTemplate template = templateRepository.findByIdAndIsActiveTrue(id)
                .orElseThrow(() -> new RuntimeException("模板不存在或已禁用"));
        return convertToDTO(template);
    }
    
    /**
     * 创建模板
     */
    @Transactional
    public PromptTemplateDTO createTemplate(PromptTemplateDTO dto, Long createdBy) {
        // 验证分类是否存在
        PromptCategory category = categoryRepository.findByCode(dto.getCategoryCode())
                .orElseThrow(() -> new RuntimeException("分类不存在: " + dto.getCategoryCode()));
        
        PromptTemplate template = new PromptTemplate();
        template.setName(dto.getName());
        template.setCategoryCode(dto.getCategoryCode());
        template.setDescription(dto.getDescription());
        template.setSystemPrompt(dto.getSystemPrompt());
        template.setUserPrompt(dto.getUserPrompt());
        template.setVariables(convertToJson(dto.getVariables()));
        template.setExampleData(convertToJson(dto.getExampleData()));
        template.setVersion(1);
        template.setIsActive(dto.getIsActive() != null ? dto.getIsActive() : true);
        template.setCreatedBy(createdBy);
        
        template = templateRepository.save(template);
        logger.info("创建提示词模板成功: ID={}, name={}", template.getId(), template.getName());
        return convertToDTO(template);
    }
    
    /**
     * 更新模板
     */
    @Transactional
    public PromptTemplateDTO updateTemplate(Long id, PromptTemplateDTO dto) {
        PromptTemplate template = templateRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("模板不存在"));
        
        // 验证分类是否存在
        if (dto.getCategoryCode() != null && !dto.getCategoryCode().equals(template.getCategoryCode())) {
            PromptCategory category = categoryRepository.findByCode(dto.getCategoryCode())
                    .orElseThrow(() -> new RuntimeException("分类不存在: " + dto.getCategoryCode()));
        }
        
        if (dto.getName() != null) template.setName(dto.getName());
        if (dto.getCategoryCode() != null) template.setCategoryCode(dto.getCategoryCode());
        if (dto.getDescription() != null) template.setDescription(dto.getDescription());
        if (dto.getSystemPrompt() != null) template.setSystemPrompt(dto.getSystemPrompt());
        if (dto.getUserPrompt() != null) template.setUserPrompt(dto.getUserPrompt());
        if (dto.getVariables() != null) template.setVariables(convertToJson(dto.getVariables()));
        if (dto.getExampleData() != null) template.setExampleData(convertToJson(dto.getExampleData()));
        if (dto.getIsActive() != null) template.setIsActive(dto.getIsActive());
        
        // 版本号自增
        template.setVersion(template.getVersion() + 1);
        
        template = templateRepository.save(template);
        logger.info("更新提示词模板成功: ID={}, name={}, version={}", template.getId(), template.getName(), template.getVersion());
        return convertToDTO(template);
    }
    
    /**
     * 删除模板（软删除）
     */
    @Transactional
    public void deleteTemplate(Long id) {
        PromptTemplate template = templateRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("模板不存在"));
        template.setIsActive(false);
        templateRepository.save(template);
        logger.info("删除提示词模板成功: ID={}, name={}", template.getId(), template.getName());
    }
    
    /**
     * 渲染模板
     */
    public PromptRenderResponse renderTemplate(PromptRenderRequest request) {
        PromptTemplate template = templateRepository.findByIdAndIsActiveTrue(request.getTemplateId())
                .orElseThrow(() -> new RuntimeException("模板不存在或已禁用"));
        
        return renderService.render(template, request.getVariables());
    }
    
    /**
     * 预览模板（使用示例数据）
     */
    public PromptRenderResponse previewTemplate(Long templateId) {
        PromptTemplate template = templateRepository.findByIdAndIsActiveTrue(templateId)
                .orElseThrow(() -> new RuntimeException("模板不存在或已禁用"));
        
        Map<String, Object> exampleData = parseJson(template.getExampleData(), new TypeReference<Map<String, Object>>() {});
        if (exampleData == null) {
            exampleData = new HashMap<>();
        }
        
        return renderService.render(template, exampleData);
    }
    
    /**
     * 转换为DTO
     */
    private PromptTemplateDTO convertToDTO(PromptTemplate template) {
        PromptTemplateDTO dto = new PromptTemplateDTO();
        dto.setId(template.getId());
        dto.setName(template.getName());
        dto.setCategoryCode(template.getCategoryCode());
        
        // 获取分类名称
        categoryRepository.findByCode(template.getCategoryCode())
                .ifPresent(category -> dto.setCategoryName(category.getName()));
        
        dto.setDescription(template.getDescription());
        dto.setSystemPrompt(template.getSystemPrompt());
        dto.setUserPrompt(template.getUserPrompt());
        dto.setVariables(parseJson(template.getVariables(), new TypeReference<Map<String, Object>>() {}));
        dto.setExampleData(parseJson(template.getExampleData(), new TypeReference<Map<String, Object>>() {}));
        dto.setVersion(template.getVersion());
        dto.setIsActive(template.getIsActive());
        dto.setCreatedBy(template.getCreatedBy());
        dto.setCreatedAt(template.getCreatedAt());
        dto.setUpdatedAt(template.getUpdatedAt());
        return dto;
    }
    
    /**
     * 转换为JSON字符串
     */
    private String convertToJson(Object obj) {
        if (obj == null) return null;
        try {
            return objectMapper.writeValueAsString(obj);
        } catch (Exception e) {
            logger.error("JSON转换失败", e);
            return null;
        }
    }
    
    /**
     * 解析JSON字符串
     */
    private <T> T parseJson(String json, TypeReference<T> typeRef) {
        if (json == null || json.trim().isEmpty()) return null;
        try {
            return objectMapper.readValue(json, typeRef);
        } catch (Exception e) {
            logger.error("JSON解析失败: {}", json, e);
            return null;
        }
    }
}
