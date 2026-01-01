package com.heartsphere.admin.service;

import com.heartsphere.admin.dto.SystemEraItemDTO;
import com.heartsphere.admin.entity.SystemEra;
import com.heartsphere.admin.entity.SystemEraItem;
import com.heartsphere.admin.repository.SystemEraItemRepository;
import com.heartsphere.admin.repository.SystemEraRepository;
import com.heartsphere.exception.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 系统预置时代物品服务
 */
@Service
public class SystemEraItemService {

    @Autowired
    private SystemEraItemRepository itemRepository;

    @Autowired
    private SystemEraRepository systemEraRepository;

    /**
     * 获取所有系统物品（包含场景名称）
     */
    public List<SystemEraItemDTO> getAllItems() {
        List<SystemEraItem> items = itemRepository.findByIsDeletedFalseAndIsActiveTrueOrderBySortOrderAsc();
        return convertToDTOsWithEraNames(items);
    }

    /**
     * 根据系统时代ID获取物品（包含场景名称）
     */
    public List<SystemEraItemDTO> getItemsBySystemEraId(Long systemEraId) {
        List<SystemEraItem> items = itemRepository.findBySystemEraIdAndIsDeletedFalseAndIsActiveTrue(systemEraId);
        return convertToDTOsWithEraNames(items);
    }

    /**
     * 转换物品列表为DTO列表，并填充场景名称
     */
    private List<SystemEraItemDTO> convertToDTOsWithEraNames(List<SystemEraItem> items) {
        // 获取所有相关的系统时代
        List<Long> eraIds = items.stream()
                .map(SystemEraItem::getSystemEraId)
                .filter(id -> id != null)
                .distinct()
                .toList();

        Map<Long, String> eraNameMap = systemEraRepository.findAllById(eraIds).stream()
                .collect(Collectors.toMap(SystemEra::getId, SystemEra::getName));

        // 转换为DTO并填充场景名称
        return items.stream().map(item -> {
            SystemEraItemDTO dto = new SystemEraItemDTO();
            dto.setId(item.getId());
            dto.setName(item.getName());
            dto.setItemId(item.getItemId());
            dto.setDescription(item.getDescription());
            dto.setSystemEraId(item.getSystemEraId());
            dto.setSystemEraName(item.getSystemEraId() != null ? eraNameMap.get(item.getSystemEraId()) : null);
            dto.setIconUrl(item.getIconUrl());
            dto.setItemType(item.getItemType());
            dto.setTags(item.getTags());
            dto.setSortOrder(item.getSortOrder());
            dto.setIsActive(item.getIsActive());
            dto.setIsDeleted(item.getIsDeleted());
            dto.setCreatedAt(item.getCreatedAt());
            dto.setUpdatedAt(item.getUpdatedAt());
            return dto;
        }).collect(Collectors.toList());
    }

    /**
     * 根据物品类型获取物品
     */
    public List<SystemEraItem> getItemsBySystemEraIdAndType(Long systemEraId, String itemType) {
        return itemRepository.findBySystemEraIdAndItemType(systemEraId, itemType);
    }

    /**
     * 根据ID获取物品
     */
    public SystemEraItem getItemById(Long id) {
        return itemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("系统物品不存在: " + id));
    }

    /**
     * 根据itemId获取物品
     */
    public SystemEraItem getItemByItemId(String itemId) {
        return itemRepository.findByItemId(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("系统物品不存在: " + itemId));
    }

    /**
     * 创建系统物品
     */
    @Transactional
    public SystemEraItem createItem(SystemEraItem item) {
        if (item.getSystemEraId() != null) {
            systemEraRepository.findById(item.getSystemEraId())
                    .orElseThrow(() -> new ResourceNotFoundException("系统时代不存在: " + item.getSystemEraId()));
        }
        
        if (itemRepository.existsByItemId(item.getItemId())) {
            throw new IllegalArgumentException("物品ID已存在: " + item.getItemId());
        }
        
        return itemRepository.save(item);
    }

    /**
     * 更新系统物品
     */
    @Transactional
    public SystemEraItem updateItem(Long id, SystemEraItem item) {
        SystemEraItem existing = getItemById(id);
        
        if (item.getSystemEraId() != null) {
            systemEraRepository.findById(item.getSystemEraId())
                    .orElseThrow(() -> new ResourceNotFoundException("系统时代不存在: " + item.getSystemEraId()));
        }
        
        if (!existing.getItemId().equals(item.getItemId()) && itemRepository.existsByItemId(item.getItemId())) {
            throw new IllegalArgumentException("物品ID已存在: " + item.getItemId());
        }
        
        existing.setName(item.getName());
        existing.setItemId(item.getItemId());
        existing.setDescription(item.getDescription());
        existing.setSystemEraId(item.getSystemEraId());
        existing.setIconUrl(item.getIconUrl());
        existing.setItemType(item.getItemType());
        existing.setTags(item.getTags());
        existing.setSortOrder(item.getSortOrder());
        existing.setIsActive(item.getIsActive());
        
        return itemRepository.save(existing);
    }

    /**
     * 删除系统物品（软删除）
     */
    @Transactional
    public void deleteItem(Long id) {
        SystemEraItem item = getItemById(id);
        item.setIsDeleted(true);
        itemRepository.save(item);
    }
}




