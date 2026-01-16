package com.heartsphere.service;

import com.heartsphere.dto.SystemMainStoryDTO;
import com.heartsphere.entity.SystemMainStory;
import com.heartsphere.repository.SystemMainStoryRepository;
import com.heartsphere.util.SystemDTOMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.logging.Logger;
import java.util.stream.Collectors;

/**
 * 系统主线剧情服务
 * 提供SystemMainStory的查询操作
 * 注意：此服务直接访问数据库，admin 只负责配置
 */
@Service
public class SystemMainStoryService {

    private static final Logger logger = Logger.getLogger(SystemMainStoryService.class.getName());

    @Autowired
    private SystemMainStoryRepository mainStoryRepository;

    /**
     * 获取所有激活的主线剧情（按排序）
     */
    public List<SystemMainStoryDTO> getAllMainStories() {
        return mainStoryRepository.findByIsActiveTrueOrderBySortOrderAsc().stream()
                .map(SystemDTOMapper::toMainStoryDTO)
                .collect(Collectors.toList());
    }

    /**
     * 根据时代ID获取主线剧情
     */
    public SystemMainStoryDTO getMainStoryByEraId(Long eraId) {
        return mainStoryRepository.findBySystemEraIdAndIsActiveTrue(eraId)
                .map(SystemDTOMapper::toMainStoryDTO)
                .orElse(null);
    }

    /**
     * 根据ID获取主线剧情
     */
    public SystemMainStoryDTO getMainStoryById(Long id) {
        SystemMainStory story = mainStoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("系统主线剧情不存在: " + id));
        return SystemDTOMapper.toMainStoryDTO(story);
    }
}
