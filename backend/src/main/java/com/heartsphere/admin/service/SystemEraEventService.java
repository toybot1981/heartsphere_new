package com.heartsphere.admin.service;

import com.heartsphere.admin.dto.SystemEraEventDTO;
import com.heartsphere.admin.entity.SystemEra;
import com.heartsphere.admin.entity.SystemEraEvent;
import com.heartsphere.admin.repository.SystemEraEventRepository;
import com.heartsphere.admin.repository.SystemEraRepository;
import com.heartsphere.exception.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 系统预置时代事件服务
 */
@Service
public class SystemEraEventService {

    @Autowired
    private SystemEraEventRepository eventRepository;

    @Autowired
    private SystemEraRepository systemEraRepository;

    /**
     * 获取所有系统事件（包含场景名称）
     */
    public List<SystemEraEventDTO> getAllEvents() {
        List<SystemEraEvent> events = eventRepository.findByIsDeletedFalseAndIsActiveTrueOrderBySortOrderAsc();
        return convertToDTOsWithEraNames(events);
    }

    /**
     * 根据系统时代ID获取事件（包含场景名称）
     */
    public List<SystemEraEventDTO> getEventsBySystemEraId(Long systemEraId) {
        List<SystemEraEvent> events = eventRepository.findBySystemEraIdAndIsDeletedFalseAndIsActiveTrue(systemEraId);
        return convertToDTOsWithEraNames(events);
    }

    /**
     * 转换事件列表为DTO列表，并填充场景名称
     */
    private List<SystemEraEventDTO> convertToDTOsWithEraNames(List<SystemEraEvent> events) {
        // 获取所有相关的系统时代
        List<Long> eraIds = events.stream()
                .map(SystemEraEvent::getSystemEraId)
                .filter(id -> id != null)
                .distinct()
                .toList();

        Map<Long, String> eraNameMap = systemEraRepository.findAllById(eraIds).stream()
                .collect(Collectors.toMap(SystemEra::getId, SystemEra::getName));

        // 转换为DTO并填充场景名称
        return events.stream().map(event -> {
            SystemEraEventDTO dto = new SystemEraEventDTO();
            dto.setId(event.getId());
            dto.setName(event.getName());
            dto.setEventId(event.getEventId());
            dto.setDescription(event.getDescription());
            dto.setSystemEraId(event.getSystemEraId());
            dto.setSystemEraName(event.getSystemEraId() != null ? eraNameMap.get(event.getSystemEraId()) : null);
            dto.setIconUrl(event.getIconUrl());
            dto.setTags(event.getTags());
            dto.setSortOrder(event.getSortOrder());
            dto.setIsActive(event.getIsActive());
            dto.setIsDeleted(event.getIsDeleted());
            dto.setCreatedAt(event.getCreatedAt());
            dto.setUpdatedAt(event.getUpdatedAt());
            return dto;
        }).collect(Collectors.toList());
    }

    /**
     * 根据ID获取事件
     */
    public SystemEraEvent getEventById(Long id) {
        return eventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("系统事件不存在: " + id));
    }

    /**
     * 根据eventId获取事件
     */
    public SystemEraEvent getEventByEventId(String eventId) {
        return eventRepository.findByEventId(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("系统事件不存在: " + eventId));
    }

    /**
     * 创建系统事件
     */
    @Transactional
    public SystemEraEvent createEvent(SystemEraEvent event) {
        if (event.getSystemEraId() != null) {
            systemEraRepository.findById(event.getSystemEraId())
                    .orElseThrow(() -> new ResourceNotFoundException("系统时代不存在: " + event.getSystemEraId()));
        }
        
        if (eventRepository.existsByEventId(event.getEventId())) {
            throw new IllegalArgumentException("事件ID已存在: " + event.getEventId());
        }
        
        return eventRepository.save(event);
    }

    /**
     * 更新系统事件
     */
    @Transactional
    public SystemEraEvent updateEvent(Long id, SystemEraEvent event) {
        SystemEraEvent existing = getEventById(id);
        
        if (event.getSystemEraId() != null) {
            systemEraRepository.findById(event.getSystemEraId())
                    .orElseThrow(() -> new ResourceNotFoundException("系统时代不存在: " + event.getSystemEraId()));
        }
        
        if (!existing.getEventId().equals(event.getEventId()) && eventRepository.existsByEventId(event.getEventId())) {
            throw new IllegalArgumentException("事件ID已存在: " + event.getEventId());
        }
        
        existing.setName(event.getName());
        existing.setEventId(event.getEventId());
        existing.setDescription(event.getDescription());
        existing.setSystemEraId(event.getSystemEraId());
        existing.setIconUrl(event.getIconUrl());
        existing.setTags(event.getTags());
        existing.setSortOrder(event.getSortOrder());
        existing.setIsActive(event.getIsActive());
        
        return eventRepository.save(existing);
    }

    /**
     * 删除系统事件（软删除）
     */
    @Transactional
    public void deleteEvent(Long id) {
        SystemEraEvent event = getEventById(id);
        event.setIsDeleted(true);
        eventRepository.save(event);
    }
}

