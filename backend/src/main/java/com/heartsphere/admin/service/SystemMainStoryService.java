package com.heartsphere.admin.service;

import com.heartsphere.admin.dto.SystemMainStoryDTO;
import com.heartsphere.admin.entity.SystemEra;
import com.heartsphere.admin.entity.SystemMainStory;
import com.heartsphere.admin.repository.SystemEraRepository;
import com.heartsphere.admin.repository.SystemMainStoryRepository;
import com.heartsphere.admin.util.SystemDTOMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.logging.Logger;
import java.util.stream.Collectors;

/**
 * 系统主线剧情服务
 * 提供SystemMainStory的CRUD操作
 */
@Service
public class SystemMainStoryService {

    private static final Logger logger = Logger.getLogger(SystemMainStoryService.class.getName());

    @Autowired
    private SystemMainStoryRepository mainStoryRepository;

    @Autowired
    private SystemEraRepository eraRepository;

    /**
     * 获取所有激活的主线剧情（按排序）
     */
    public List<SystemMainStoryDTO> getAllMainStories() {
        return mainStoryRepository.findByIsActiveTrueOrderBySortOrderAsc().stream()
                .map(SystemDTOMapper::toMainStoryDTO)
                .collect(Collectors.toList());
    }

    /**
     * 根据ID获取主线剧情
     */
    public SystemMainStoryDTO getMainStoryById(Long id) {
        SystemMainStory story = mainStoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("系统主线剧情不存在: " + id));
        return SystemDTOMapper.toMainStoryDTO(story);
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
     * 创建主线剧情
     */
    @Transactional
    public SystemMainStoryDTO createMainStory(SystemMainStoryDTO dto) {
        logger.info(String.format("========== [SystemMainStoryService] 创建系统主线剧情 ========== eraId: %d", dto.getSystemEraId()));
        
        // 检查该场景是否已有主线剧情
        mainStoryRepository.findBySystemEraIdAndIsActiveTrue(dto.getSystemEraId())
                .ifPresent(existing -> {
                    throw new RuntimeException("该场景已存在主线剧情，请先删除或更新现有剧情");
                });
        
        SystemEra era = eraRepository.findById(dto.getSystemEraId())
                .orElseThrow(() -> new RuntimeException("系统场景不存在: " + dto.getSystemEraId()));
        
        SystemMainStory story = new SystemMainStory();
        story.setSystemEra(era);
        story.setName(dto.getName());
        story.setAge(dto.getAge());
        story.setRole(dto.getRole() != null ? dto.getRole() : "叙事者");
        story.setBio(dto.getBio());
        story.setAvatarUrl(dto.getAvatarUrl());
        story.setBackgroundUrl(dto.getBackgroundUrl());
        story.setThemeColor(dto.getThemeColor());
        story.setColorAccent(dto.getColorAccent());
        story.setFirstMessage(dto.getFirstMessage());
        story.setSystemInstruction(dto.getSystemInstruction());
        story.setVoiceName(dto.getVoiceName());
        story.setTags(dto.getTags());
        story.setSpeechStyle(dto.getSpeechStyle());
        story.setCatchphrases(dto.getCatchphrases());
        story.setSecrets(dto.getSecrets());
        story.setMotivations(dto.getMotivations());
        story.setIsActive(dto.getIsActive() != null ? dto.getIsActive() : true);
        story.setSortOrder(dto.getSortOrder() != null ? dto.getSortOrder() : 0);
        
        story = mainStoryRepository.save(story);
        logger.info(String.format("[SystemMainStoryService] 系统主线剧情创建成功: ID=%d, name=%s", story.getId(), story.getName()));
        return SystemDTOMapper.toMainStoryDTO(story);
    }

    /**
     * 更新主线剧情
     */
    @Transactional
    public SystemMainStoryDTO updateMainStory(Long id, SystemMainStoryDTO dto) {
        logger.info(String.format("========== [SystemMainStoryService] 更新系统主线剧情 ========== ID: %d", id));
        
        SystemMainStory story = mainStoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("系统主线剧情不存在: " + id));
        
        if (dto.getSystemEraId() != null && !story.getSystemEra().getId().equals(dto.getSystemEraId())) {
            // 检查新场景是否已有主线剧情
            mainStoryRepository.findBySystemEraIdAndIsActiveTrue(dto.getSystemEraId())
                    .ifPresent(existing -> {
                        if (!existing.getId().equals(id)) {
                            throw new RuntimeException("目标场景已存在主线剧情");
                        }
                    });
            
            SystemEra era = eraRepository.findById(dto.getSystemEraId())
                    .orElseThrow(() -> new RuntimeException("系统场景不存在: " + dto.getSystemEraId()));
            story.setSystemEra(era);
        }
        
        if (dto.getName() != null) story.setName(dto.getName());
        if (dto.getAge() != null) story.setAge(dto.getAge());
        if (dto.getRole() != null) story.setRole(dto.getRole());
        if (dto.getBio() != null) story.setBio(dto.getBio());
        if (dto.getAvatarUrl() != null) story.setAvatarUrl(dto.getAvatarUrl());
        if (dto.getBackgroundUrl() != null) story.setBackgroundUrl(dto.getBackgroundUrl());
        if (dto.getThemeColor() != null) story.setThemeColor(dto.getThemeColor());
        if (dto.getColorAccent() != null) story.setColorAccent(dto.getColorAccent());
        if (dto.getFirstMessage() != null) story.setFirstMessage(dto.getFirstMessage());
        if (dto.getSystemInstruction() != null) story.setSystemInstruction(dto.getSystemInstruction());
        if (dto.getVoiceName() != null) story.setVoiceName(dto.getVoiceName());
        if (dto.getTags() != null) story.setTags(dto.getTags());
        if (dto.getSpeechStyle() != null) story.setSpeechStyle(dto.getSpeechStyle());
        if (dto.getCatchphrases() != null) story.setCatchphrases(dto.getCatchphrases());
        if (dto.getSecrets() != null) story.setSecrets(dto.getSecrets());
        if (dto.getMotivations() != null) story.setMotivations(dto.getMotivations());
        if (dto.getIsActive() != null) story.setIsActive(dto.getIsActive());
        if (dto.getSortOrder() != null) story.setSortOrder(dto.getSortOrder());
        
        story = mainStoryRepository.save(story);
        logger.info(String.format("[SystemMainStoryService] 系统主线剧情更新成功: ID=%d, name=%s", story.getId(), story.getName()));
        return SystemDTOMapper.toMainStoryDTO(story);
    }

    /**
     * 删除主线剧情
     */
    @Transactional
    public void deleteMainStory(Long id) {
        logger.info(String.format("========== [SystemMainStoryService] 删除系统主线剧情 ========== ID: %d", id));
        SystemMainStory story = mainStoryRepository.findById(id)
                .orElse(null);
        if (story != null) {
            logger.info(String.format("[SystemMainStoryService] 找到系统主线剧情: ID=%d, name=%s", id, story.getName()));
            mainStoryRepository.deleteById(id);
            logger.info(String.format("[SystemMainStoryService] 系统主线剧情删除成功: ID=%d, name=%s", id, story.getName()));
        } else {
            logger.warning(String.format("[SystemMainStoryService] 系统主线剧情不存在，无法删除: ID=%d", id));
            throw new RuntimeException("系统主线剧情不存在: " + id);
        }
    }
}




