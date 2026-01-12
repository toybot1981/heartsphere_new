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
        int characterBackgroundMatchedCount = 0;
        List<String> eraMatched = new ArrayList<>();
        List<String> characterMatched = new ArrayList<>();
        List<String> eraNotFound = new ArrayList<>();
        List<String> characterNotFound = new ArrayList<>();
        
        // 1. 匹配场景（SystemEra）和资源（category='era'）
        // 只更新没有设置图片的场景
        List<SystemEra> eras = eraRepository.findAll();
        logger.info(String.format("[ResourceMatchingService] 找到 %d 个预置场景", eras.size()));
        
        for (SystemEra era : eras) {
            try {
                // 只更新没有图片的场景（imageUrl为null、空或包含placeholder）
                String currentImageUrl = era.getImageUrl();
                boolean hasValidImage = currentImageUrl != null 
                    && !currentImageUrl.trim().isEmpty() 
                    && !currentImageUrl.toLowerCase().contains("placeholder");
                if (hasValidImage) {
                    logger.info(String.format("[ResourceMatchingService] 场景 '%s' 已有图片，跳过更新", era.getName()));
                    continue;
                }
                
                SystemResource resource = resourceRepository.findByNameAndCategory(era.getName(), "era");
                if (resource != null && resource.getUrl() != null && !resource.getUrl().trim().isEmpty()
                    && !resource.getUrl().toLowerCase().contains("placeholder")) {
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
                String characterName = character.getName() != null ? character.getName().trim() : "";
                if (characterName.isEmpty()) {
                    logger.warning(String.format("[ResourceMatchingService] 角色 (ID: %d) 名称为空，跳过", character.getId()));
                    continue;
                }
                String currentAvatarUrl = character.getAvatarUrl();
                String currentBackgroundUrl = character.getBackgroundUrl();
                // 检查头像URL：为null、空或包含placeholder都视为未设置
                boolean needsAvatar = (currentAvatarUrl == null 
                    || currentAvatarUrl.trim().isEmpty() 
                    || currentAvatarUrl.toLowerCase().contains("placeholder"));
                // 检查背景URL：为null、空或包含placeholder都视为未设置
                boolean needsBackground = (currentBackgroundUrl == null 
                    || currentBackgroundUrl.trim().isEmpty() 
                    || currentBackgroundUrl.toLowerCase().contains("placeholder"));
                
                logger.info(String.format("[ResourceMatchingService] 处理角色 '%s' (ID: %d) - 需要头像: %s, 需要背景: %s", 
                    characterName, character.getId(), needsAvatar, needsBackground));
                
                // 如果头像和背景都已设置，跳过
                if (!needsAvatar && !needsBackground) {
                    logger.info(String.format("[ResourceMatchingService] 角色 '%s' 头像和背景都已设置，跳过更新", characterName));
                    continue;
                }
                
                SystemResource matchedAvatarResource = null;
                SystemResource matchedBackgroundResource = null;
                
                // 遍历所有角色相关资源，查找匹配的资源
                logger.info(String.format("[ResourceMatchingService] 开始为角色 '%s' 匹配资源，共有 %d 个资源", 
                    characterName, allCharacterResources.size()));
                for (SystemResource resource : allCharacterResources) {
                    // 跳过没有URL或URL包含placeholder的资源
                    if (resource.getUrl() == null 
                        || resource.getUrl().trim().isEmpty() 
                        || resource.getUrl().toLowerCase().contains("placeholder")) {
                        continue;
                    }
                    
                    String resourceName = resource.getName() != null ? resource.getName().trim() : "";
                    if (resourceName.isEmpty()) {
                        continue; // 跳过没有名称的资源
                    }
                    
                    boolean nameMatches = false;
                    boolean isAvatarResource = false;
                    boolean isBackgroundResource = false;
                    
                    // 检查资源名称是否以角色名称开头（前缀匹配）
                    if (resourceName.startsWith(characterName)) {
                        logger.info(String.format("[ResourceMatchingService] 资源 '%s' 以角色名 '%s' 开头", 
                            resourceName, characterName));
                        // 如果资源名称正好等于角色名称，默认为头像
                        if (resourceName.equals(characterName)) {
                            nameMatches = true;
                            isAvatarResource = true;
                            logger.info(String.format("[ResourceMatchingService] 角色 '%s' 匹配资源 '%s' (精确匹配，默认为头像)", 
                                characterName, resourceName));
                        }
                        // 如果资源名称是"角色名-头像"
                        else if (resourceName.equals(characterName + "-头像")) {
                            nameMatches = true;
                            isAvatarResource = true;
                            logger.info(String.format("[ResourceMatchingService] 角色 '%s' 匹配资源 '%s' (头像资源)", 
                                characterName, resourceName));
                        }
                        // 如果资源名称是"角色名-背景"
                        else if (resourceName.equals(characterName + "-背景")) {
                            nameMatches = true;
                            isBackgroundResource = true;
                            logger.info(String.format("[ResourceMatchingService] 角色 '%s' 匹配资源 '%s' (背景资源)", 
                                characterName, resourceName));
                        }
                        // 如果资源名称以角色名开头，但后面还有其他内容（不是"-头像"或"-背景"），也默认为头像
                        // 例如："角色名-其他"这种情况也默认为头像
                        else if (resourceName.length() > characterName.length()) {
                            // 检查是否以"-头像"或"-背景"开头
                            String suffix = resourceName.substring(characterName.length());
                            if (suffix.startsWith("-头像")) {
                                // 可能是"角色名-头像-其他"的情况，也认为是头像
                                nameMatches = true;
                                isAvatarResource = true;
                                logger.info(String.format("[ResourceMatchingService] 角色 '%s' 匹配资源 '%s' (包含-头像后缀，默认为头像)", 
                                    characterName, resourceName));
                            } else if (suffix.startsWith("-背景")) {
                                // 可能是"角色名-背景-其他"的情况，也认为是背景
                                nameMatches = true;
                                isBackgroundResource = true;
                                logger.info(String.format("[ResourceMatchingService] 角色 '%s' 匹配资源 '%s' (包含-背景后缀，默认为背景)", 
                                    characterName, resourceName));
                            } else if (!suffix.startsWith("-头像") && !suffix.startsWith("-背景")) {
                                // 不带"-头像"或"-背景"后缀，默认为头像
                                nameMatches = true;
                                isAvatarResource = true;
                                logger.info(String.format("[ResourceMatchingService] 角色 '%s' 匹配资源 '%s' (无后缀，默认为头像)", 
                                    characterName, resourceName));
                            }
                        }
                    }
                    
                    // 根据资源类型和需求进行匹配
                    if (nameMatches) {
                        logger.info(String.format("[ResourceMatchingService] 资源 '%s' 匹配成功 - isAvatarResource: %s, isBackgroundResource: %s, needsAvatar: %s, needsBackground: %s", 
                            resourceName, isAvatarResource, isBackgroundResource, needsAvatar, needsBackground));
                        if (isAvatarResource && needsAvatar && matchedAvatarResource == null) {
                            matchedAvatarResource = resource;
                            characterAvatarMatchedCount++;
                            logger.info(String.format("[ResourceMatchingService] ✓ 角色 '%s' 头像匹配成功: 资源 '%s' -> %s", 
                                characterName, resourceName, resource.getUrl()));
                        } else if (isBackgroundResource && needsBackground && matchedBackgroundResource == null) {
                            matchedBackgroundResource = resource;
                            characterBackgroundMatchedCount++;
                            logger.info(String.format("[ResourceMatchingService] ✓ 角色 '%s' 背景匹配成功: 资源 '%s' -> %s", 
                                characterName, resourceName, resource.getUrl()));
                        } else {
                            // 记录为什么没有匹配
                            if (isAvatarResource && !needsAvatar) {
                                logger.info(String.format("[ResourceMatchingService] 角色 '%s' 资源 '%s' 是头像资源，但已有头像，跳过", 
                                    characterName, resourceName));
                            } else if (isBackgroundResource && !needsBackground) {
                                logger.warning(String.format("[ResourceMatchingService] 角色 '%s' 资源 '%s' 是背景资源，但已有背景，跳过 (当前背景: %s)", 
                                    characterName, resourceName, currentBackgroundUrl != null ? currentBackgroundUrl : "null"));
                            } else if (isAvatarResource && matchedAvatarResource != null) {
                                logger.info(String.format("[ResourceMatchingService] 角色 '%s' 资源 '%s' 是头像资源，但已匹配其他头像资源，跳过", 
                                    characterName, resourceName));
                            } else if (isBackgroundResource && matchedBackgroundResource != null) {
                                logger.info(String.format("[ResourceMatchingService] 角色 '%s' 资源 '%s' 是背景资源，但已匹配其他背景资源，跳过", 
                                    characterName, resourceName));
                            } else {
                                logger.warning(String.format("[ResourceMatchingService] 角色 '%s' 资源 '%s' 匹配但未应用 - isAvatarResource: %s, isBackgroundResource: %s, needsAvatar: %s, needsBackground: %s, matchedAvatarResource: %s, matchedBackgroundResource: %s", 
                                    characterName, resourceName, isAvatarResource, isBackgroundResource, needsAvatar, needsBackground,
                                    matchedAvatarResource != null ? "已匹配" : "null", matchedBackgroundResource != null ? "已匹配" : "null"));
                            }
                        }
                    }
                }
                
                // 更新角色的头像和背景URL
                logger.info(String.format("[ResourceMatchingService] 角色 '%s' 匹配结果 - matchedAvatarResource: %s, matchedBackgroundResource: %s", 
                    characterName, matchedAvatarResource != null ? matchedAvatarResource.getName() : "null",
                    matchedBackgroundResource != null ? matchedBackgroundResource.getName() : "null"));
                
                boolean hasUpdate = false;
                if (matchedAvatarResource != null) {
                    String oldAvatarUrl = character.getAvatarUrl();
                    character.setAvatarUrl(matchedAvatarResource.getUrl());
                    hasUpdate = true;
                    characterMatched.add(String.format("角色 '%s' (ID: %d) - 头像已更新: 资源 '%s'", 
                        character.getName(), character.getId(), matchedAvatarResource.getName()));
                    logger.info(String.format("[ResourceMatchingService] 角色 '%s' 头像已设置 - 旧值: %s, 新值: %s", 
                        characterName, oldAvatarUrl != null ? oldAvatarUrl : "null", matchedAvatarResource.getUrl()));
                }
                if (matchedBackgroundResource != null) {
                    String oldBackgroundUrl = character.getBackgroundUrl();
                    character.setBackgroundUrl(matchedBackgroundResource.getUrl());
                    hasUpdate = true;
                    characterMatched.add(String.format("角色 '%s' (ID: %d) - 背景已更新: 资源 '%s'", 
                        character.getName(), character.getId(), matchedBackgroundResource.getName()));
                    logger.info(String.format("[ResourceMatchingService] 角色 '%s' 背景已设置 - 旧值: %s, 新值: %s", 
                        characterName, oldBackgroundUrl != null ? oldBackgroundUrl : "null", matchedBackgroundResource.getUrl()));
                }
                
                if (hasUpdate) {
                    SystemCharacter saved = characterRepository.save(character);
                    logger.info(String.format("[ResourceMatchingService] 角色 '%s' 已保存 - 头像: %s, 背景: %s", 
                        characterName, 
                        saved.getAvatarUrl() != null ? saved.getAvatarUrl() : "null",
                        saved.getBackgroundUrl() != null ? saved.getBackgroundUrl() : "null"));
                } else {
                    // 如果既没有匹配到头像也没有匹配到背景，记录为未找到
                    if (needsAvatar && needsBackground) {
                        characterNotFound.add(String.format("角色 '%s' (ID: %d) - 未找到匹配的头像和背景资源", characterName, character.getId()));
                    } else if (needsAvatar) {
                        characterNotFound.add(String.format("角色 '%s' (ID: %d) - 未找到匹配的头像资源", characterName, character.getId()));
                    } else {
                        characterNotFound.add(String.format("角色 '%s' (ID: %d) - 未找到匹配的背景资源", characterName, character.getId()));
                    }
                    logger.warning(String.format("[ResourceMatchingService] ✗ 角色 '%s' 未找到匹配的资源", characterName));
                }
            } catch (Exception e) {
                logger.severe(String.format("[ResourceMatchingService] 匹配角色 '%s' 时出错: %s", character.getName(), e.getMessage()));
                characterNotFound.add(String.format("角色 '%s' (ID: %d) - 匹配出错: %s", character.getName(), character.getId(), e.getMessage()));
            }
        }
        
        // 汇总结果
        result.put("eraMatchedCount", eraMatchedCount);
        result.put("characterAvatarMatchedCount", characterAvatarMatchedCount);
        result.put("characterBackgroundMatchedCount", characterBackgroundMatchedCount);
        result.put("eraMatched", eraMatched);
        result.put("characterMatched", characterMatched);
        result.put("eraNotFound", eraNotFound);
        result.put("characterNotFound", characterNotFound);
        result.put("totalEras", eras.size());
        result.put("totalCharacters", characters.size());
        
        logger.info(String.format("========== [ResourceMatchingService] 匹配完成 =========="));
        logger.info(String.format("场景匹配: %d/%d", eraMatchedCount, eras.size()));
        logger.info(String.format("角色头像匹配: %d/%d", characterAvatarMatchedCount, characters.size()));
        logger.info(String.format("角色背景匹配: %d/%d", characterBackgroundMatchedCount, characters.size()));
        
        return result;
    }
}




