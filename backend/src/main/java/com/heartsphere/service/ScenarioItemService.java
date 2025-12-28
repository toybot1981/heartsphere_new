package com.heartsphere.service;

import com.heartsphere.dto.ScenarioItemDTO;
import com.heartsphere.entity.ScenarioItem;
import com.heartsphere.entity.Era;
import com.heartsphere.entity.User;
import com.heartsphere.repository.ScenarioItemRepository;
import com.heartsphere.repository.EraRepository;
import com.heartsphere.exception.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ScenarioItemService {

    @Autowired
    private ScenarioItemRepository itemRepository;

    @Autowired
    private EraRepository eraRepository;

    /**
     * 获取场景的所有物品（包括系统物品和用户自定义物品）
     */
    public List<ScenarioItemDTO> getItemsByEraId(Long eraId) {
        List<ScenarioItem> items = itemRepository.findByEraIdOrSystem(eraId);
        return items.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    /**
     * 根据物品类型获取场景的物品
     */
    public List<ScenarioItemDTO> getItemsByEraIdAndType(Long eraId, String itemType) {
        List<ScenarioItem> items = itemRepository.findByEraIdOrSystemAndItemType(eraId, itemType);
        return items.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    /**
     * 获取所有系统预设物品
     */
    public List<ScenarioItemDTO> getSystemItems() {
        List<ScenarioItem> items = itemRepository.findByIsSystemTrueAndIsDeletedFalseAndIsActiveTrue();
        return items.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    /**
     * 获取用户的所有自定义物品
     */
    public List<ScenarioItemDTO> getUserItems(Long userId) {
        List<ScenarioItem> items = itemRepository.findByUser_IdAndIsDeletedFalse(userId);
        return items.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    /**
     * 根据ID获取物品
     */
    public ScenarioItemDTO getItemById(Long id) {
        ScenarioItem item = itemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("物品不存在: " + id));
        return convertToDTO(item);
    }

    /**
     * 根据itemId获取物品
     */
    public ScenarioItemDTO getItemByItemId(String itemId) {
        ScenarioItem item = itemRepository.findByItemId(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("物品不存在: " + itemId));
        return convertToDTO(item);
    }

    /**
     * 创建物品
     */
    @Transactional
    public ScenarioItemDTO createItem(ScenarioItemDTO dto, Long userId) {
        ScenarioItem item = new ScenarioItem();
        item.setName(dto.getName());
        item.setItemId(dto.getItemId());
        item.setDescription(dto.getDescription());
        item.setIconUrl(dto.getIconUrl());
        item.setItemType(dto.getItemType());
        item.setTags(dto.getTags());
        item.setSortOrder(dto.getSortOrder() != null ? dto.getSortOrder() : 0);
        item.setIsActive(dto.getIsActive() != null ? dto.getIsActive() : true);
        item.setIsSystem(false);
        item.setIsDeleted(false);

        if (dto.getEraId() != null) {
            Era era = eraRepository.findById(dto.getEraId())
                    .orElseThrow(() -> new ResourceNotFoundException("场景不存在: " + dto.getEraId()));
            item.setEra(era);
        }

        User user = new User();
        user.setId(userId);
        item.setUser(user);

        // 检查itemId是否已存在
        if (itemRepository.existsByItemId(dto.getItemId())) {
            throw new IllegalArgumentException("物品ID已存在: " + dto.getItemId());
        }

        ScenarioItem saved = itemRepository.save(item);
        return convertToDTO(saved);
    }

    /**
     * 更新物品
     */
    @Transactional
    public ScenarioItemDTO updateItem(Long id, ScenarioItemDTO dto, Long userId) {
        ScenarioItem item = itemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("物品不存在: " + id));

        // 检查权限：只能修改自己的物品
        if (!item.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("无权修改此物品");
        }

        item.setName(dto.getName());
        item.setDescription(dto.getDescription());
        item.setIconUrl(dto.getIconUrl());
        item.setItemType(dto.getItemType());
        item.setTags(dto.getTags());
        item.setSortOrder(dto.getSortOrder());
        if (dto.getIsActive() != null) {
            item.setIsActive(dto.getIsActive());
        }

        // 如果itemId改变，检查是否已存在
        if (!item.getItemId().equals(dto.getItemId())) {
            if (itemRepository.existsByItemId(dto.getItemId())) {
                throw new IllegalArgumentException("物品ID已存在: " + dto.getItemId());
            }
            item.setItemId(dto.getItemId());
        }

        ScenarioItem saved = itemRepository.save(item);
        return convertToDTO(saved);
    }

    /**
     * 删除物品（软删除）
     */
    @Transactional
    public void deleteItem(Long id, Long userId) {
        ScenarioItem item = itemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("物品不存在: " + id));

        // 检查权限：只能删除自己的物品
        if (!item.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("无权删除此物品");
        }

        item.setIsDeleted(true);
        itemRepository.save(item);
    }

    /**
     * 转换为DTO
     */
    private ScenarioItemDTO convertToDTO(ScenarioItem item) {
        ScenarioItemDTO dto = new ScenarioItemDTO();
        dto.setId(item.getId());
        dto.setName(item.getName());
        dto.setItemId(item.getItemId());
        dto.setDescription(item.getDescription());
        if (item.getEra() != null) {
            dto.setEraId(item.getEra().getId());
            dto.setEraName(item.getEra().getName());
        }
        if (item.getUser() != null) {
            dto.setUserId(item.getUser().getId());
        }
        dto.setIsSystem(item.getIsSystem());
        dto.setIconUrl(item.getIconUrl());
        dto.setItemType(item.getItemType());
        dto.setTags(item.getTags());
        dto.setSortOrder(item.getSortOrder());
        dto.setIsActive(item.getIsActive());
        dto.setCreatedAt(item.getCreatedAt());
        dto.setUpdatedAt(item.getUpdatedAt());
        return dto;
    }
}

