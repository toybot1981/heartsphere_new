package com.heartsphere.admin.service;

import com.heartsphere.admin.entity.SystemCharacter;
import com.heartsphere.admin.entity.SystemEra;
import com.heartsphere.admin.entity.SystemResource;
import com.heartsphere.admin.repository.SystemCharacterRepository;
import com.heartsphere.admin.repository.SystemEraRepository;
import com.heartsphere.admin.repository.SystemResourceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.logging.Logger;

/**
 * 资源匹配服务
 * 提供资源与实体（场景、角色）的匹配和更新功能
 */
@Service
public class ResourceMatchingService {

    private static final Logger logger = Logger.getLogger(ResourceMatchingService.class.getName());

    @Autowired
    private SystemEraRepository eraRepository;

    @Autowired
    private SystemCharacterRepository characterRepository;

    @Autowired
    private SystemResourceRepository resourceRepository;

    /**
     * 根据名称匹配资源并更新预置场景和角色的图片
     * @return 匹配结果统计
     */
    @Transactional
    public Map<String, Object> matchAndUpdateResources() {
        logger.info("========== [ResourceMatchingService] 开始匹配资源并更新场景和角色图片 ==========");
        
        Map<String, Object> result = new HashMap<>();
        int eraMatchedCount = 0;
        int characterAvatarMatchedCount = 0;
        List<String> eraMatched = new ArrayList<>();
        List<String> characterMatched = new ArrayList<>();
        List<String> eraNotFound = new ArrayList<>();
        List<String> characterNotFound = new ArrayList<>();
        
        // 1. 匹配场景（SystemEra）和资源（category='era'）
        List<SystemEra> eras = eraRepository.findAll();
        logger.info(String.format("[ResourceMatchingService] 找到 %d 个预置场景", eras.size()));
        
        for (SystemEra era : eras) {
            try {
                SystemResource resource = resourceRepository.findByNameAndCategory(era.getName(), "era");
                if (resource != null && resource.getUrl() != null && !resource.getUrl().trim().isEmpty()) {
                    era.setImageUrl(resource.getUrl());
                    eraRepository.save(era);
                    eraMatchedCount++;
                    eraMatched.add(String.format("场景 '%s' (ID: %d) -> 资源 '%s' (URL: %s)", 
                        era.getName(), era.getId(), resource.getName(), resource.getUrl()));
                    logger.info(String.format("[ResourceMatchingService] ✓ 场景 '%s' 匹配成功，已更新图片", era.getName()));
                } else {
                    eraNotFound.add(String.format("场景 '%s' (ID: %d) - 未找到匹配的资源", era.getName(), era.getId()));
                    logger.warning(String.format("[ResourceMatchingService] ✗ 场景 '%s' 未找到匹配的资源", era.getName()));
                }
            } catch (Exception e) {
                logger.severe(String.format("[ResourceMatchingService] 匹配场景 '%s' 时出错: %s", era.getName(), e.getMessage()));
                eraNotFound.add(String.format("场景 '%s' (ID: %d) - 匹配出错: %s", era.getName(), era.getId(), e.getMessage()));
            }
        }
        
        // 2. 匹配角色（SystemCharacter）和资源
        // 只更新角色头像：资源名称和角色名称匹配时，直接将资源图片URL复制给角色头像
        List<SystemCharacter> characters = characterRepository.findAll();
        logger.info(String.format("[ResourceMatchingService] 找到 %d 个预置角色", characters.size()));
        
        // 获取所有角色相关的资源（category='character' 或 'avatar'）
        List<SystemResource> characterResources = resourceRepository.findByCategory("character");
        List<SystemResource> avatarResources = resourceRepository.findByCategory("avatar");
        List<SystemResource> allCharacterResources = new ArrayList<>();
        allCharacterResources.addAll(characterResources);
        allCharacterResources.addAll(avatarResources);
        logger.info(String.format("[ResourceMatchingService] 找到 %d 个角色相关资源", allCharacterResources.size()));
        
        for (SystemCharacter character : characters) {
            try {
                boolean avatarMatched = false;
                SystemResource matchedAvatarResource = null;
                
                String characterName = character.getName();
                
                // 遍历所有角色相关资源，查找匹配的资源
                for (SystemResource resource : allCharacterResources) {
                    if (resource.getUrl() == null || resource.getUrl().trim().isEmpty()) {
                        continue; // 跳过没有URL的资源
                    }
                    
                    String resourceName = resource.getName();
                    
                    // 检查资源名称是否匹配角色名称
                    boolean nameMatches = false;
                    
                    // 如果资源名称包含"-头像"或"-背景"等后缀，需要精确匹配
                    if (resourceName.contains("-头像") || resourceName.contains("-背景")) {
                        // 格式：角色名称-头像 或 角色名称-背景
                        String baseName = resourceName.replace("-头像", "").replace("-背景", "");
                        nameMatches = baseName.equals(characterName);
                    } else {
                        // 直接匹配：资源名称包含角色名称，或角色名称包含资源名称
                        nameMatches = resourceName.contains(characterName) || characterName.contains(resourceName);
                    }
                    
                    // 如果名称匹配，且还没有匹配到头像，则匹配为头像
                    if (nameMatches && !avatarMatched) {
                        matchedAvatarResource = resource;
                        avatarMatched = true;
                        characterAvatarMatchedCount++;
                        logger.info(String.format("[ResourceMatchingService] ✓ 角色 '%s' 头像匹配成功: 资源 '%s' -> %s", 
                            character.getName(), resourceName, resource.getUrl()));
                    }
                }
                
                // 更新角色的头像URL
                if (matchedAvatarResource != null) {
                    character.setAvatarUrl(matchedAvatarResource.getUrl());
                    characterRepository.save(character);
                    characterMatched.add(String.format("角色 '%s' (ID: %d) - 头像已更新: 资源 '%s'", 
                        character.getName(), character.getId(), matchedAvatarResource.getName()));
                } else {
                    characterNotFound.add(String.format("角色 '%s' (ID: %d) - 未找到匹配的资源", character.getName(), character.getId()));
                    logger.warning(String.format("[ResourceMatchingService] ✗ 角色 '%s' 未找到匹配的资源", character.getName()));
                }
            } catch (Exception e) {
                logger.severe(String.format("[ResourceMatchingService] 匹配角色 '%s' 时出错: %s", character.getName(), e.getMessage()));
                characterNotFound.add(String.format("角色 '%s' (ID: %d) - 匹配出错: %s", character.getName(), character.getId(), e.getMessage()));
            }
        }
        
        // 汇总结果
        result.put("eraMatchedCount", eraMatchedCount);
        result.put("characterAvatarMatchedCount", characterAvatarMatchedCount);
        result.put("characterBackgroundMatchedCount", 0); // 不再匹配背景
        result.put("eraMatched", eraMatched);
        result.put("characterMatched", characterMatched);
        result.put("eraNotFound", eraNotFound);
        result.put("characterNotFound", characterNotFound);
        result.put("totalEras", eras.size());
        result.put("totalCharacters", characters.size());
        
        logger.info(String.format("========== [ResourceMatchingService] 匹配完成 =========="));
        logger.info(String.format("场景匹配: %d/%d", eraMatchedCount, eras.size()));
        logger.info(String.format("角色头像匹配: %d/%d", characterAvatarMatchedCount, characters.size()));
        
        return result;
    }
}

