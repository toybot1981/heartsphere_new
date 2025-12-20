package com.heartsphere.aiagent.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.heartsphere.aiagent.entity.CreationEntity;
import com.heartsphere.aiagent.repository.CreationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

/**
 * 作品管理服务
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class CreationService {
    
    private final CreationRepository creationRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    /**
     * 保存作品
     */
    @Transactional
    public CreationEntity saveCreation(String type, String title, String prompt, 
                                      String fileUrl, String thumbnailUrl, 
                                      Map<String, Object> metadata, String userId) {
        CreationEntity entity = new CreationEntity();
        entity.setType(type);
        entity.setTitle(title);
        entity.setPrompt(prompt);
        entity.setFileUrl(fileUrl);
        entity.setThumbnailUrl(thumbnailUrl);
        entity.setUserId(userId);
        
        try {
            if (metadata != null) {
                entity.setMetadata(objectMapper.writeValueAsString(metadata));
            }
        } catch (JsonProcessingException e) {
            log.error("序列化元数据失败", e);
        }
        
        return creationRepository.save(entity);
    }
    
    /**
     * 获取所有作品
     */
    public List<CreationEntity> getAllCreations() {
        return creationRepository.findAllByOrderByCreatedAtDesc();
    }
    
    /**
     * 按类型获取作品
     */
    public List<CreationEntity> getCreationsByType(String type) {
        return creationRepository.findByTypeOrderByCreatedAtDesc(type);
    }
    
    /**
     * 获取用户作品
     */
    public List<CreationEntity> getUserCreations(String userId) {
        return creationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }
    
    /**
     * 获取作品详情
     */
    public CreationEntity getCreation(String creationId) {
        return creationRepository.findByCreationId(creationId)
            .orElseThrow(() -> new IllegalArgumentException("作品不存在: " + creationId));
    }
    
    /**
     * 删除作品
     */
    @Transactional
    public void deleteCreation(String creationId) {
        creationRepository.findByCreationId(creationId)
            .ifPresent(creationRepository::delete);
    }
}








