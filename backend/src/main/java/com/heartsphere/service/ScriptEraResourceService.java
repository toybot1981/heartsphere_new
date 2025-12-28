package com.heartsphere.service;

import com.heartsphere.admin.entity.SystemCharacter;
import com.heartsphere.admin.entity.SystemEraEvent;
import com.heartsphere.admin.entity.SystemEraItem;
import com.heartsphere.admin.repository.SystemCharacterRepository;
import com.heartsphere.admin.repository.SystemEraEventRepository;
import com.heartsphere.admin.repository.SystemEraItemRepository;
import com.heartsphere.entity.Era;
import com.heartsphere.entity.Script;
import com.heartsphere.exception.ResourceNotFoundException;
import com.heartsphere.repository.EraRepository;
import com.heartsphere.repository.ScriptRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * 剧本时代资源服务
 * 用于根据剧本ID获取对应时代的系统预置物品、事件和角色
 */
@Service
public class ScriptEraResourceService {

    @Autowired
    private ScriptRepository scriptRepository;

    @Autowired
    private EraRepository eraRepository;

    @Autowired
    private SystemEraItemRepository systemEraItemRepository;

    @Autowired
    private SystemEraEventRepository systemEraEventRepository;

    @Autowired
    private SystemCharacterRepository systemCharacterRepository;

    /**
     * 根据剧本ID获取对应的系统时代ID
     */
    private Long getSystemEraIdByScriptId(Long scriptId) {
        Script script = scriptRepository.findById(scriptId)
                .orElseThrow(() -> new ResourceNotFoundException("剧本不存在: " + scriptId));

        if (script.getEra() == null) {
            return null;
        }

        Era era = eraRepository.findById(script.getEra().getId())
                .orElseThrow(() -> new ResourceNotFoundException("时代不存在: " + script.getEra().getId()));

        return era.getSystemEraId();
    }

    /**
     * 根据剧本ID获取对应时代的系统预置物品
     */
    public List<SystemEraItem> getItemsByScriptId(Long scriptId) {
        Long systemEraId = getSystemEraIdByScriptId(scriptId);
        if (systemEraId == null) {
            return List.of();
        }
        return systemEraItemRepository.findBySystemEraIdAndIsDeletedFalseAndIsActiveTrue(systemEraId);
    }

    /**
     * 根据剧本ID和物品类型获取对应时代的系统预置物品
     */
    public List<SystemEraItem> getItemsByScriptIdAndType(Long scriptId, String itemType) {
        Long systemEraId = getSystemEraIdByScriptId(scriptId);
        if (systemEraId == null) {
            return List.of();
        }
        return systemEraItemRepository.findBySystemEraIdAndItemType(systemEraId, itemType);
    }

    /**
     * 根据剧本ID获取对应时代的系统预置事件
     */
    public List<SystemEraEvent> getEventsByScriptId(Long scriptId) {
        Long systemEraId = getSystemEraIdByScriptId(scriptId);
        if (systemEraId == null) {
            return List.of();
        }
        return systemEraEventRepository.findBySystemEraIdAndIsDeletedFalseAndIsActiveTrue(systemEraId);
    }

    /**
     * 根据剧本ID获取对应时代的系统预置角色
     */
    public List<SystemCharacter> getCharactersByScriptId(Long scriptId) {
        Long systemEraId = getSystemEraIdByScriptId(scriptId);
        if (systemEraId == null) {
            return List.of();
        }
        return systemCharacterRepository.findBySystemEraIdAndIsActiveTrue(systemEraId);
    }
}

