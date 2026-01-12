package com.heartsphere.service;

import com.heartsphere.entity.Script;
import com.heartsphere.entity.UserScenarioEvent;
import com.heartsphere.repository.ScriptRepository;
import com.heartsphere.repository.UserScenarioEventRepository;
import com.heartsphere.exception.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * 用户场景事件服务
 * 用于管理用户在创建场景时，与场景节点关联的事件
 */
@Service
public class UserScenarioEventService {

    @Autowired
    private UserScenarioEventRepository eventRepository;

    @Autowired
    private ScriptRepository scriptRepository;

    /**
     * 根据剧本ID获取所有事件
     */
    public List<UserScenarioEvent> getEventsByScriptId(Long scriptId) {
        if (scriptId == null) {
            throw new IllegalArgumentException("剧本ID不能为空");
        }
        return eventRepository.findByScript_Id(scriptId);
    }

    /**
     * 根据剧本ID和节点ID获取事件
     */
    public List<UserScenarioEvent> getEventsByScriptIdAndNodeId(Long scriptId, String nodeId) {
        if (scriptId == null) {
            throw new IllegalArgumentException("剧本ID不能为空");
        }
        return eventRepository.findByScript_IdAndNodeId(scriptId, nodeId);
    }

    /**
     * 根据ID获取事件
     */
    public UserScenarioEvent getEventById(Long id) {
        return eventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("用户场景事件不存在: " + id));
    }

    /**
     * 创建用户场景事件
     */
    @Transactional
    public UserScenarioEvent createEvent(UserScenarioEvent event, Long scriptId) {
        if (scriptId == null) {
            throw new IllegalArgumentException("剧本ID不能为空");
        }
        Script script = scriptRepository.findById(scriptId)
                .orElseThrow(() -> new ResourceNotFoundException("剧本不存在: " + scriptId));
        event.setScript(script);
        return eventRepository.save(event);
    }

    /**
     * 更新用户场景事件
     */
    @Transactional
    public UserScenarioEvent updateEvent(Long id, UserScenarioEvent event) {
        UserScenarioEvent existing = getEventById(id);
        
        existing.setNodeId(event.getNodeId());
        existing.setSystemEraEventId(event.getSystemEraEventId());
        existing.setName(event.getName());
        existing.setEventId(event.getEventId());
        existing.setDescription(event.getDescription());
        existing.setIconUrl(event.getIconUrl());
        existing.setTags(event.getTags());
        existing.setIsCustom(event.getIsCustom());
        existing.setSortOrder(event.getSortOrder());
        
        return eventRepository.save(existing);
    }

    /**
     * 删除用户场景事件
     */
    @Transactional
    public void deleteEvent(Long id) {
        eventRepository.deleteById(id);
    }

    /**
     * 批量删除节点下的所有事件
     */
    @Transactional
    public void deleteEventsByScriptIdAndNodeId(Long scriptId, String nodeId) {
        if (scriptId == null) {
            throw new IllegalArgumentException("剧本ID不能为空");
        }
        List<UserScenarioEvent> events = eventRepository.findByScript_IdAndNodeId(scriptId, nodeId);
        if (!events.isEmpty()) {
            eventRepository.deleteAll(events);
        }
    }
}

