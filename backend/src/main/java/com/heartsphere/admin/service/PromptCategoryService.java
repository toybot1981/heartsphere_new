package com.heartsphere.admin.service;

import com.heartsphere.admin.dto.PromptCategoryDTO;
import com.heartsphere.admin.entity.PromptCategory;
import com.heartsphere.admin.repository.PromptCategoryRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * 提示词分类服务
 */
@Service
public class PromptCategoryService {
    
    private static final Logger logger = LoggerFactory.getLogger(PromptCategoryService.class);
    
    @Autowired
    private PromptCategoryRepository categoryRepository;
    
    /**
     * 获取所有启用的分类
     */
    public List<PromptCategoryDTO> getAllActiveCategories() {
        return categoryRepository.findByIsActiveTrueOrderBySortOrderAsc()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    /**
     * 根据代码获取分类
     */
    public PromptCategoryDTO getCategoryByCode(String code) {
        PromptCategory category = categoryRepository.findByCode(code)
                .orElseThrow(() -> new RuntimeException("分类不存在: " + code));
        return convertToDTO(category);
    }
    
    /**
     * 创建分类
     */
    @Transactional
    public PromptCategoryDTO createCategory(PromptCategoryDTO dto) {
        if (categoryRepository.existsByCode(dto.getCode())) {
            throw new RuntimeException("分类代码已存在: " + dto.getCode());
        }
        
        PromptCategory category = new PromptCategory();
        category.setCode(dto.getCode());
        category.setName(dto.getName());
        category.setDescription(dto.getDescription());
        category.setParentId(dto.getParentId());
        category.setSortOrder(dto.getSortOrder() != null ? dto.getSortOrder() : 0);
        category.setIsActive(dto.getIsActive() != null ? dto.getIsActive() : true);
        
        category = categoryRepository.save(category);
        logger.info("创建提示词分类成功: ID={}, code={}, name={}", category.getId(), category.getCode(), category.getName());
        return convertToDTO(category);
    }
    
    /**
     * 更新分类
     */
    @Transactional
    public PromptCategoryDTO updateCategory(Long id, PromptCategoryDTO dto) {
        PromptCategory category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("分类不存在"));
        
        if (dto.getName() != null) category.setName(dto.getName());
        if (dto.getDescription() != null) category.setDescription(dto.getDescription());
        if (dto.getParentId() != null) category.setParentId(dto.getParentId());
        if (dto.getSortOrder() != null) category.setSortOrder(dto.getSortOrder());
        if (dto.getIsActive() != null) category.setIsActive(dto.getIsActive());
        
        category = categoryRepository.save(category);
        logger.info("更新提示词分类成功: ID={}, code={}, name={}", category.getId(), category.getCode(), category.getName());
        return convertToDTO(category);
    }
    
    /**
     * 删除分类
     */
    @Transactional
    public void deleteCategory(Long id) {
        PromptCategory category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("分类不存在"));
        category.setIsActive(false);
        categoryRepository.save(category);
        logger.info("删除提示词分类成功: ID={}, code={}", category.getId(), category.getCode());
    }
    
    /**
     * 转换为DTO
     */
    private PromptCategoryDTO convertToDTO(PromptCategory category) {
        PromptCategoryDTO dto = new PromptCategoryDTO();
        dto.setId(category.getId());
        dto.setCode(category.getCode());
        dto.setName(category.getName());
        dto.setDescription(category.getDescription());
        dto.setParentId(category.getParentId());
        dto.setSortOrder(category.getSortOrder());
        dto.setIsActive(category.getIsActive());
        dto.setCreatedAt(category.getCreatedAt());
        dto.setUpdatedAt(category.getUpdatedAt());
        return dto;
    }
}
