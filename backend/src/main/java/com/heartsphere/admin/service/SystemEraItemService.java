package com.heartsphere.admin.service;

import com.heartsphere.admin.entity.SystemEraItem;
import com.heartsphere.admin.repository.SystemEraItemRepository;
import com.heartsphere.admin.repository.SystemEraRepository;
import com.heartsphere.exception.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

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
     * 获取所有系统物品
     */
    public List<SystemEraItem> getAllItems() {
        return itemRepository.findByIsDeletedFalseAndIsActiveTrueOrderBySortOrderAsc();
    }

    /**
     * 根据系统时代ID获取物品
     */
    public List<SystemEraItem> getItemsBySystemEraId(Long systemEraId) {
        return itemRepository.findBySystemEraIdAndIsDeletedFalseAndIsActiveTrue(systemEraId);
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

