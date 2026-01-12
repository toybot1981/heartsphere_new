package com.heartsphere.service;

import com.heartsphere.entity.Script;
import com.heartsphere.entity.UserScenarioItem;
import com.heartsphere.repository.ScriptRepository;
import com.heartsphere.repository.UserScenarioItemRepository;
import com.heartsphere.exception.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * 用户场景物品服务
 * 用于管理用户在创建场景时，与场景节点关联的物品
 */
@Service
public class UserScenarioItemService {

    @Autowired
    private UserScenarioItemRepository itemRepository;

    @Autowired
    private ScriptRepository scriptRepository;

    /**
     * 根据剧本ID获取所有物品
     */
    public List<UserScenarioItem> getItemsByScriptId(Long scriptId) {
        if (scriptId == null) {
            throw new IllegalArgumentException("剧本ID不能为空");
        }
        return itemRepository.findByScript_Id(scriptId);
    }

    /**
     * 根据剧本ID和节点ID获取物品
     */
    public List<UserScenarioItem> getItemsByScriptIdAndNodeId(Long scriptId, String nodeId) {
        if (scriptId == null) {
            throw new IllegalArgumentException("剧本ID不能为空");
        }
        return itemRepository.findByScript_IdAndNodeId(scriptId, nodeId);
    }

    /**
     * 根据ID获取物品
     */
    public UserScenarioItem getItemById(Long id) {
        return itemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("用户场景物品不存在: " + id));
    }

    /**
     * 创建用户场景物品
     */
    @Transactional
    public UserScenarioItem createItem(UserScenarioItem item, Long scriptId) {
        if (scriptId == null) {
            throw new IllegalArgumentException("剧本ID不能为空");
        }
        Script script = scriptRepository.findById(scriptId)
                .orElseThrow(() -> new ResourceNotFoundException("剧本不存在: " + scriptId));
        item.setScript(script);
        return itemRepository.save(item);
    }

    /**
     * 更新用户场景物品
     */
    @Transactional
    public UserScenarioItem updateItem(Long id, UserScenarioItem item) {
        UserScenarioItem existing = getItemById(id);
        
        existing.setNodeId(item.getNodeId());
        existing.setSystemEraItemId(item.getSystemEraItemId());
        existing.setName(item.getName());
        existing.setItemId(item.getItemId());
        existing.setDescription(item.getDescription());
        existing.setIconUrl(item.getIconUrl());
        existing.setItemType(item.getItemType());
        existing.setTags(item.getTags());
        existing.setQuantity(item.getQuantity());
        existing.setIsCustom(item.getIsCustom());
        existing.setSortOrder(item.getSortOrder());
        
        return itemRepository.save(existing);
    }

    /**
     * 删除用户场景物品
     */
    @Transactional
    public void deleteItem(Long id) {
        itemRepository.deleteById(id);
    }

    /**
     * 批量删除节点下的所有物品
     */
    @Transactional
    public void deleteItemsByScriptIdAndNodeId(Long scriptId, String nodeId) {
        if (scriptId == null) {
            throw new IllegalArgumentException("剧本ID不能为空");
        }
        List<UserScenarioItem> items = itemRepository.findByScript_IdAndNodeId(scriptId, nodeId);
        if (!items.isEmpty()) {
            itemRepository.deleteAll(items);
        }
    }
}

