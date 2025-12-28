package com.heartsphere.service;

import com.heartsphere.dto.ScenarioEventDTO;
import com.heartsphere.entity.ScenarioEvent;
import com.heartsphere.entity.Era;
import com.heartsphere.entity.User;
import com.heartsphere.repository.ScenarioEventRepository;
import com.heartsphere.repository.EraRepository;
import com.heartsphere.exception.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ScenarioEventService {

    @Autowired
    private ScenarioEventRepository eventRepository;

    @Autowired
    private EraRepository eraRepository;

    /**
     * 获取场景的所有事件（包括系统事件和用户自定义事件）
     */
    public List<ScenarioEventDTO> getEventsByEraId(Long eraId) {
        List<ScenarioEvent> events = eventRepository.findByEraIdOrSystem(eraId);
        return events.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    /**
     * 获取所有系统预设事件
     */
    public List<ScenarioEventDTO> getSystemEvents() {
        List<ScenarioEvent> events = eventRepository.findByIsSystemTrueAndIsDeletedFalseAndIsActiveTrue();
        return events.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    /**
     * 获取用户的所有自定义事件
     */
    public List<ScenarioEventDTO> getUserEvents(Long userId) {
        List<ScenarioEvent> events = eventRepository.findByUser_IdAndIsDeletedFalse(userId);
        return events.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    /**
     * 根据ID获取事件
     */
    public ScenarioEventDTO getEventById(Long id) {
        ScenarioEvent event = eventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("事件不存在: " + id));
        return convertToDTO(event);
    }

    /**
     * 根据eventId获取事件
     */
    public ScenarioEventDTO getEventByEventId(String eventId) {
        ScenarioEvent event = eventRepository.findByEventId(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("事件不存在: " + eventId));
        return convertToDTO(event);
    }

    /**
     * 创建事件
     */
    @Transactional
    public ScenarioEventDTO createEvent(ScenarioEventDTO dto, Long userId) {
        ScenarioEvent event = new ScenarioEvent();
        event.setName(dto.getName());
        event.setEventId(dto.getEventId());
        event.setDescription(dto.getDescription());
        event.setIconUrl(dto.getIconUrl());
        event.setTags(dto.getTags());
        event.setSortOrder(dto.getSortOrder() != null ? dto.getSortOrder() : 0);
        event.setIsActive(dto.getIsActive() != null ? dto.getIsActive() : true);
        event.setIsSystem(false);
        event.setIsDeleted(false);

        if (dto.getEraId() != null) {
            Era era = eraRepository.findById(dto.getEraId())
                    .orElseThrow(() -> new ResourceNotFoundException("场景不存在: " + dto.getEraId()));
            event.setEra(era);
        }

        User user = new User();
        user.setId(userId);
        event.setUser(user);

        // 检查eventId是否已存在
        if (eventRepository.existsByEventId(dto.getEventId())) {
            throw new IllegalArgumentException("事件ID已存在: " + dto.getEventId());
        }

        ScenarioEvent saved = eventRepository.save(event);
        return convertToDTO(saved);
    }

    /**
     * 更新事件
     */
    @Transactional
    public ScenarioEventDTO updateEvent(Long id, ScenarioEventDTO dto, Long userId) {
        ScenarioEvent event = eventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("事件不存在: " + id));

        // 检查权限：只能修改自己的事件
        if (!event.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("无权修改此事件");
        }

        event.setName(dto.getName());
        event.setDescription(dto.getDescription());
        event.setIconUrl(dto.getIconUrl());
        event.setTags(dto.getTags());
        event.setSortOrder(dto.getSortOrder());
        if (dto.getIsActive() != null) {
            event.setIsActive(dto.getIsActive());
        }

        // 如果eventId改变，检查是否已存在
        if (!event.getEventId().equals(dto.getEventId())) {
            if (eventRepository.existsByEventId(dto.getEventId())) {
                throw new IllegalArgumentException("事件ID已存在: " + dto.getEventId());
            }
            event.setEventId(dto.getEventId());
        }

        ScenarioEvent saved = eventRepository.save(event);
        return convertToDTO(saved);
    }

    /**
     * 删除事件（软删除）
     */
    @Transactional
    public void deleteEvent(Long id, Long userId) {
        ScenarioEvent event = eventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("事件不存在: " + id));

        // 检查权限：只能删除自己的事件
        if (!event.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("无权删除此事件");
        }

        event.setIsDeleted(true);
        eventRepository.save(event);
    }

    /**
     * 转换为DTO
     */
    private ScenarioEventDTO convertToDTO(ScenarioEvent event) {
        ScenarioEventDTO dto = new ScenarioEventDTO();
        dto.setId(event.getId());
        dto.setName(event.getName());
        dto.setEventId(event.getEventId());
        dto.setDescription(event.getDescription());
        if (event.getEra() != null) {
            dto.setEraId(event.getEra().getId());
            dto.setEraName(event.getEra().getName());
        }
        if (event.getUser() != null) {
            dto.setUserId(event.getUser().getId());
        }
        dto.setIsSystem(event.getIsSystem());
        dto.setIconUrl(event.getIconUrl());
        dto.setTags(event.getTags());
        dto.setSortOrder(event.getSortOrder());
        dto.setIsActive(event.getIsActive());
        dto.setCreatedAt(event.getCreatedAt());
        dto.setUpdatedAt(event.getUpdatedAt());
        return dto;
    }
}

