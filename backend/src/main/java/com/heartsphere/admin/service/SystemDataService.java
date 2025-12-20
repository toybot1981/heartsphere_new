package com.heartsphere.admin.service;

import com.heartsphere.admin.dto.SystemCharacterDTO;
import com.heartsphere.admin.dto.SystemEraDTO;
import com.heartsphere.admin.dto.SystemMainStoryDTO;
import com.heartsphere.admin.dto.SystemScriptDTO;
import com.heartsphere.admin.dto.SystemWorldDTO;
import com.heartsphere.admin.entity.SystemCharacter;
import com.heartsphere.admin.entity.SystemEra;
import com.heartsphere.admin.entity.SystemMainStory;
import com.heartsphere.admin.entity.SystemScript;
import com.heartsphere.admin.entity.SystemWorld;
import com.heartsphere.admin.repository.SystemCharacterRepository;
import com.heartsphere.admin.repository.SystemEraRepository;
import com.heartsphere.admin.repository.SystemMainStoryRepository;
import com.heartsphere.admin.repository.SystemResourceRepository;
import com.heartsphere.admin.repository.SystemScriptRepository;
import com.heartsphere.admin.repository.SystemWorldRepository;
import com.heartsphere.admin.entity.SystemResource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.logging.Logger;
import java.util.stream.Collectors;

@Service
public class SystemDataService {

    private static final Logger logger = Logger.getLogger(SystemDataService.class.getName());

    @Autowired
    private SystemWorldRepository worldRepository;

    @Autowired
    private SystemEraRepository eraRepository;

    @Autowired
    private SystemCharacterRepository characterRepository;

    @Autowired
    private SystemScriptRepository scriptRepository;

    @Autowired
    private SystemMainStoryRepository mainStoryRepository;

    @Autowired
    private SystemResourceRepository resourceRepository;

    // ========== SystemWorld CRUD ==========
    public List<SystemWorldDTO> getAllWorlds() {
        return worldRepository.findAll().stream()
                .map(this::toWorldDTO)
                .collect(Collectors.toList());
    }

    public SystemWorldDTO getWorldById(Long id) {
        SystemWorld world = worldRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("系统世界不存在: " + id));
        return toWorldDTO(world);
    }

    @Transactional
    public SystemWorldDTO createWorld(SystemWorldDTO dto) {
        SystemWorld world = new SystemWorld();
        world.setName(dto.getName());
        world.setDescription(dto.getDescription());
        world.setIsActive(dto.getIsActive() != null ? dto.getIsActive() : true);
        world.setSortOrder(dto.getSortOrder() != null ? dto.getSortOrder() : 0);
        world = worldRepository.save(world);
        return toWorldDTO(world);
    }

    @Transactional
    public SystemWorldDTO updateWorld(Long id, SystemWorldDTO dto) {
        SystemWorld world = worldRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("系统世界不存在: " + id));
        world.setName(dto.getName());
        world.setDescription(dto.getDescription());
        if (dto.getIsActive() != null) world.setIsActive(dto.getIsActive());
        if (dto.getSortOrder() != null) world.setSortOrder(dto.getSortOrder());
        world = worldRepository.save(world);
        return toWorldDTO(world);
    }

    @Transactional
    public void deleteWorld(Long id) {
        worldRepository.deleteById(id);
    }

    // ========== SystemEra CRUD ==========
    public List<SystemEraDTO> getAllEras() {
        return eraRepository.findAll().stream()
                .map(this::toEraDTO)
                .collect(Collectors.toList());
    }

    public SystemEraDTO getEraById(Long id) {
        SystemEra era = eraRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("系统时代不存在: " + id));
        return toEraDTO(era);
    }

    @Transactional
    public SystemEraDTO createEra(SystemEraDTO dto) {
        SystemEra era = new SystemEra();
        era.setName(dto.getName());
        era.setDescription(dto.getDescription());
        era.setStartYear(dto.getStartYear());
        era.setEndYear(dto.getEndYear());
        era.setImageUrl(dto.getImageUrl());
        era.setIsActive(dto.getIsActive() != null ? dto.getIsActive() : true);
        era.setSortOrder(dto.getSortOrder() != null ? dto.getSortOrder() : 0);
        era = eraRepository.save(era);
        return toEraDTO(era);
    }

    @Transactional
    public SystemEraDTO updateEra(Long id, SystemEraDTO dto) {
        SystemEra era = eraRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("系统时代不存在: " + id));
        era.setName(dto.getName());
        era.setDescription(dto.getDescription());
        era.setStartYear(dto.getStartYear());
        era.setEndYear(dto.getEndYear());
        era.setImageUrl(dto.getImageUrl());
        if (dto.getIsActive() != null) era.setIsActive(dto.getIsActive());
        if (dto.getSortOrder() != null) era.setSortOrder(dto.getSortOrder());
        era = eraRepository.save(era);
        return toEraDTO(era);
    }

    @Transactional
    public void deleteEra(Long id) {
        eraRepository.deleteById(id);
    }

    // ========== SystemCharacter CRUD ==========
    public List<SystemCharacterDTO> getAllCharacters() {
        logger.info("========== [SystemDataService] 获取所有系统角色 ==========");
        List<SystemCharacter> characters = characterRepository.findAll();
        logger.info(String.format("[SystemDataService] 查询到 %d 个系统角色", characters.size()));
        List<SystemCharacterDTO> result = characters.stream()
                .map(this::toCharacterDTO)
                .collect(Collectors.toList());
        logger.info(String.format("[SystemDataService] 返回 %d 个系统角色DTO", result.size()));
        return result;
    }

    public SystemCharacterDTO getCharacterById(Long id) {
        logger.info(String.format("========== [SystemDataService] 获取系统角色详情 ========== ID: %d", id));
        SystemCharacter character = characterRepository.findById(id)
                .orElseThrow(() -> {
                    logger.warning(String.format("[SystemDataService] 系统角色不存在: ID=%d", id));
                    return new RuntimeException("系统角色不存在: " + id);
                });
        logger.info(String.format("[SystemDataService] 成功获取系统角色: ID=%d, name=%s", id, character.getName()));
        return toCharacterDTO(character);
    }

    @Transactional
    public SystemCharacterDTO createCharacter(SystemCharacterDTO dto) {
        logger.info("========== [SystemDataService] 创建系统角色 ==========");
        logger.info(String.format("[SystemDataService] 请求参数: name=%s, role=%s, systemEraId=%s, isActive=%s", 
            dto.getName(), dto.getRole(), dto.getSystemEraId(), dto.getIsActive()));
        
        SystemCharacter character = new SystemCharacter();
        character.setName(dto.getName());
        character.setDescription(dto.getDescription());
        character.setAge(dto.getAge());
        character.setGender(dto.getGender());
        character.setRole(dto.getRole());
        character.setBio(dto.getBio());
        character.setAvatarUrl(dto.getAvatarUrl());
        character.setBackgroundUrl(dto.getBackgroundUrl());
        character.setThemeColor(dto.getThemeColor());
        character.setColorAccent(dto.getColorAccent());
        character.setFirstMessage(dto.getFirstMessage());
        character.setSystemInstruction(dto.getSystemInstruction());
        character.setVoiceName(dto.getVoiceName());
        character.setMbti(dto.getMbti());
        character.setTags(dto.getTags());
        character.setSpeechStyle(dto.getSpeechStyle());
        character.setCatchphrases(dto.getCatchphrases());
        character.setSecrets(dto.getSecrets());
        character.setMotivations(dto.getMotivations());
        character.setRelationships(dto.getRelationships());
        
        logger.info(String.format("[SystemDataService] 角色对象已创建: name=%s, role=%s, bio长度=%d", 
            character.getName(), character.getRole(), character.getBio() != null ? character.getBio().length() : 0));
        
        if (dto.getSystemEraId() != null) {
            logger.info(String.format("[SystemDataService] 关联系统时代: eraId=%d", dto.getSystemEraId()));
            SystemEra era = eraRepository.findById(dto.getSystemEraId())
                    .orElseThrow(() -> {
                        logger.warning(String.format("[SystemDataService] 系统时代不存在: ID=%d", dto.getSystemEraId()));
                        return new RuntimeException("系统时代不存在: " + dto.getSystemEraId());
                    });
            character.setSystemEra(era);
            logger.info(String.format("[SystemDataService] 时代关联成功: eraId=%d, eraName=%s", era.getId(), era.getName()));
        }
        character.setIsActive(dto.getIsActive() != null ? dto.getIsActive() : true);
        character.setSortOrder(dto.getSortOrder() != null ? dto.getSortOrder() : 0);
        
        character = characterRepository.save(character);
        logger.info(String.format("[SystemDataService] 系统角色保存成功: ID=%d, name=%s", character.getId(), character.getName()));
        return toCharacterDTO(character);
    }

    @Transactional
    public SystemCharacterDTO updateCharacter(Long id, SystemCharacterDTO dto) {
        logger.info(String.format("========== [SystemDataService] 更新系统角色 ========== ID: %d", id));
        logger.info(String.format("[SystemDataService] 请求参数: name=%s, role=%s, systemEraId=%s, isActive=%s", 
            dto.getName(), dto.getRole(), dto.getSystemEraId(), dto.getIsActive()));
        
        SystemCharacter character = characterRepository.findById(id)
                .orElseThrow(() -> {
                    logger.warning(String.format("[SystemDataService] 系统角色不存在: ID=%d", id));
                    return new RuntimeException("系统角色不存在: " + id);
                });
        
        logger.info(String.format("[SystemDataService] 原角色信息: name=%s, role=%s, isActive=%s", 
            character.getName(), character.getRole(), character.getIsActive()));
        
        character.setName(dto.getName());
        character.setDescription(dto.getDescription());
        character.setAge(dto.getAge());
        character.setGender(dto.getGender());
        character.setRole(dto.getRole());
        character.setBio(dto.getBio());
        character.setAvatarUrl(dto.getAvatarUrl());
        character.setBackgroundUrl(dto.getBackgroundUrl());
        character.setThemeColor(dto.getThemeColor());
        character.setColorAccent(dto.getColorAccent());
        character.setFirstMessage(dto.getFirstMessage());
        character.setSystemInstruction(dto.getSystemInstruction());
        character.setVoiceName(dto.getVoiceName());
        character.setMbti(dto.getMbti());
        character.setTags(dto.getTags());
        character.setSpeechStyle(dto.getSpeechStyle());
        character.setCatchphrases(dto.getCatchphrases());
        character.setSecrets(dto.getSecrets());
        character.setMotivations(dto.getMotivations());
        character.setRelationships(dto.getRelationships());
        
        if (dto.getSystemEraId() != null) {
            logger.info(String.format("[SystemDataService] 更新系统时代关联: eraId=%d", dto.getSystemEraId()));
            SystemEra era = eraRepository.findById(dto.getSystemEraId())
                    .orElseThrow(() -> {
                        logger.warning(String.format("[SystemDataService] 系统时代不存在: ID=%d", dto.getSystemEraId()));
                        return new RuntimeException("系统时代不存在: " + dto.getSystemEraId());
                    });
            character.setSystemEra(era);
            logger.info(String.format("[SystemDataService] 时代关联更新成功: eraId=%d, eraName=%s", era.getId(), era.getName()));
        }
        if (dto.getIsActive() != null) character.setIsActive(dto.getIsActive());
        if (dto.getSortOrder() != null) character.setSortOrder(dto.getSortOrder());
        
        character = characterRepository.save(character);
        logger.info(String.format("[SystemDataService] 系统角色更新成功: ID=%d, name=%s, role=%s", 
            character.getId(), character.getName(), character.getRole()));
        return toCharacterDTO(character);
    }

    @Transactional
    public void deleteCharacter(Long id) {
        logger.info(String.format("========== [SystemDataService] 删除系统角色 ========== ID: %d", id));
        SystemCharacter character = characterRepository.findById(id)
                .orElse(null);
        if (character != null) {
            logger.info(String.format("[SystemDataService] 找到系统角色: ID=%d, name=%s", id, character.getName()));
            characterRepository.deleteById(id);
            logger.info(String.format("[SystemDataService] 系统角色删除成功: ID=%d, name=%s", id, character.getName()));
        } else {
            logger.warning(String.format("[SystemDataService] 系统角色不存在，无法删除: ID=%d", id));
            throw new RuntimeException("系统角色不存在: " + id);
        }
    }

    // ========== SystemScript CRUD ==========
    public List<SystemScriptDTO> getAllScripts() {
        return scriptRepository.findAllActiveOrdered().stream()
                .map(this::toScriptDTO)
                .collect(Collectors.toList());
    }

    public List<SystemScriptDTO> getScriptsByEraId(Long eraId) {
        return scriptRepository.findByEraIdAndIsActiveTrue(eraId).stream()
                .map(this::toScriptDTO)
                .collect(Collectors.toList());
    }

    public SystemScriptDTO getScriptById(Long id) {
        SystemScript script = scriptRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("系统剧本不存在: " + id));
        return toScriptDTO(script);
    }

    // ========== SystemMainStory CRUD ==========
    public List<SystemMainStoryDTO> getAllMainStories() {
        return mainStoryRepository.findByIsActiveTrueOrderBySortOrderAsc().stream()
                .map(this::toMainStoryDTO)
                .collect(Collectors.toList());
    }

    public SystemMainStoryDTO getMainStoryById(Long id) {
        SystemMainStory story = mainStoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("系统主线剧情不存在: " + id));
        return toMainStoryDTO(story);
    }

    public SystemMainStoryDTO getMainStoryByEraId(Long eraId) {
        return mainStoryRepository.findBySystemEraIdAndIsActiveTrue(eraId)
                .map(this::toMainStoryDTO)
                .orElse(null);
    }

    @Transactional
    public SystemMainStoryDTO createMainStory(SystemMainStoryDTO dto) {
        logger.info(String.format("========== [SystemDataService] 创建系统主线剧情 ========== eraId: %d", dto.getSystemEraId()));
        
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
        logger.info(String.format("[SystemDataService] 系统主线剧情创建成功: ID=%d, name=%s", story.getId(), story.getName()));
        return toMainStoryDTO(story);
    }

    @Transactional
    public SystemMainStoryDTO updateMainStory(Long id, SystemMainStoryDTO dto) {
        logger.info(String.format("========== [SystemDataService] 更新系统主线剧情 ========== ID: %d", id));
        
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
        logger.info(String.format("[SystemDataService] 系统主线剧情更新成功: ID=%d, name=%s", story.getId(), story.getName()));
        return toMainStoryDTO(story);
    }

    @Transactional
    public void deleteMainStory(Long id) {
        logger.info(String.format("========== [SystemDataService] 删除系统主线剧情 ========== ID: %d", id));
        SystemMainStory story = mainStoryRepository.findById(id)
                .orElse(null);
        if (story != null) {
            logger.info(String.format("[SystemDataService] 找到系统主线剧情: ID=%d, name=%s", id, story.getName()));
            mainStoryRepository.deleteById(id);
            logger.info(String.format("[SystemDataService] 系统主线剧情删除成功: ID=%d, name=%s", id, story.getName()));
        } else {
            logger.warning(String.format("[SystemDataService] 系统主线剧情不存在，无法删除: ID=%d", id));
            throw new RuntimeException("系统主线剧情不存在: " + id);
        }
    }

    // ========== DTO转换方法 ==========
    private SystemWorldDTO toWorldDTO(SystemWorld world) {
        return new SystemWorldDTO(
                world.getId(),
                world.getName(),
                world.getDescription(),
                world.getIsActive(),
                world.getSortOrder(),
                world.getCreatedAt(),
                world.getUpdatedAt()
        );
    }

    private SystemEraDTO toEraDTO(SystemEra era) {
        return new SystemEraDTO(
                era.getId(),
                era.getName(),
                era.getDescription(),
                era.getStartYear(),
                era.getEndYear(),
                era.getImageUrl(),
                era.getIsActive(),
                era.getSortOrder(),
                era.getCreatedAt(),
                era.getUpdatedAt()
        );
    }

    private SystemScriptDTO toScriptDTO(SystemScript script) {
        return new SystemScriptDTO(
                script.getId(),
                script.getTitle(),
                script.getDescription(),
                script.getContent(),
                script.getSceneCount(),
                script.getSystemEra() != null ? script.getSystemEra().getId() : null,
                script.getSystemEra() != null ? script.getSystemEra().getName() : null,
                script.getCharacterIds(),
                script.getTags(),
                script.getIsActive(),
                script.getSortOrder(),
                script.getCreatedAt(),
                script.getUpdatedAt()
        );
    }

    private SystemCharacterDTO toCharacterDTO(SystemCharacter character) {
        return new SystemCharacterDTO(
                character.getId(),
                character.getName(),
                character.getDescription(),
                character.getAge(),
                character.getGender(),
                character.getRole(),
                character.getBio(),
                character.getAvatarUrl(),
                character.getBackgroundUrl(),
                character.getThemeColor(),
                character.getColorAccent(),
                character.getFirstMessage(),
                character.getSystemInstruction(),
                character.getVoiceName(),
                character.getMbti(),
                character.getTags(),
                character.getSpeechStyle(),
                character.getCatchphrases(),
                character.getSecrets(),
                character.getMotivations(),
                character.getRelationships(),
                character.getSystemEra() != null ? character.getSystemEra().getId() : null,
                character.getIsActive(),
                character.getSortOrder(),
                character.getCreatedAt(),
                character.getUpdatedAt()
        );
    }

    private SystemMainStoryDTO toMainStoryDTO(SystemMainStory story) {
        SystemMainStoryDTO dto = new SystemMainStoryDTO();
        dto.setId(story.getId());
        dto.setSystemEraId(story.getSystemEra() != null ? story.getSystemEra().getId() : null);
        dto.setSystemEraName(story.getSystemEra() != null ? story.getSystemEra().getName() : null);
        dto.setName(story.getName());
        dto.setAge(story.getAge());
        dto.setRole(story.getRole());
        dto.setBio(story.getBio());
        dto.setAvatarUrl(story.getAvatarUrl());
        dto.setBackgroundUrl(story.getBackgroundUrl());
        dto.setThemeColor(story.getThemeColor());
        dto.setColorAccent(story.getColorAccent());
        dto.setFirstMessage(story.getFirstMessage());
        dto.setSystemInstruction(story.getSystemInstruction());
        dto.setVoiceName(story.getVoiceName());
        dto.setTags(story.getTags());
        dto.setSpeechStyle(story.getSpeechStyle());
        dto.setCatchphrases(story.getCatchphrases());
        dto.setSecrets(story.getSecrets());
        dto.setMotivations(story.getMotivations());
        dto.setIsActive(story.getIsActive());
        dto.setSortOrder(story.getSortOrder());
        return dto;
    }

    // ========== 批量更新剧本节点提示词 ==========
    @Transactional
    public int updateAllScriptsWithPrompts() {
        logger.info("========== [SystemDataService] 开始为所有系统预置剧本添加AI旁白提示词 ==========");
        
        List<SystemScript> scripts = scriptRepository.findAll();
        int updatedCount = 0;
        
        for (SystemScript script : scripts) {
            if (script.getContent() == null || script.getContent().trim().isEmpty()) {
                logger.warning(String.format("[SystemDataService] 剧本ID %d 内容为空，跳过", script.getId()));
                continue;
            }
            
            try {
                // 解析JSON内容
                com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                com.fasterxml.jackson.databind.JsonNode contentJson = mapper.readTree(script.getContent());
                
                if (!contentJson.has("nodes")) {
                    logger.warning(String.format("[SystemDataService] 剧本ID %d 没有nodes字段，跳过", script.getId()));
                    continue;
                }
                
                com.fasterxml.jackson.databind.node.ObjectNode nodesObj = (com.fasterxml.jackson.databind.node.ObjectNode) contentJson.get("nodes");
                boolean hasChanges = false;
                
                // 遍历所有节点
                java.util.Iterator<String> nodeIds = nodesObj.fieldNames();
                while (nodeIds.hasNext()) {
                    String nodeId = nodeIds.next();
                    com.fasterxml.jackson.databind.node.ObjectNode node = (com.fasterxml.jackson.databind.node.ObjectNode) nodesObj.get(nodeId);
                    
                    // 检查是否已有prompt字段
                    if (node.has("prompt") && node.get("prompt").asText() != null && !node.get("prompt").asText().trim().isEmpty()) {
                        // 已有prompt，跳过
                        continue;
                    }
                    
                    // 生成AI旁白提示词
                    String text = node.has("text") ? node.get("text").asText() : "";
                    String backgroundHint = node.has("backgroundHint") ? node.get("backgroundHint").asText() : "";
                    String title = node.has("title") ? node.get("title").asText() : (node.has("id") ? node.get("id").asText() : nodeId);
                    
                    // 基于text和backgroundHint生成prompt
                    String prompt = generatePromptFromNode(text, backgroundHint, title, script.getTitle(), script.getDescription());
                    
                    // 添加prompt字段
                    node.put("prompt", prompt);
                    hasChanges = true;
                    
                    logger.info(String.format("[SystemDataService] 为剧本ID %d 的节点 %s 添加了prompt", script.getId(), nodeId));
                }
                
                // 如果有更改，更新数据库
                if (hasChanges) {
                    script.setContent(mapper.writeValueAsString(contentJson));
                    scriptRepository.save(script);
                    updatedCount++;
                    logger.info(String.format("[SystemDataService] 成功更新剧本ID %d: %s", script.getId(), script.getTitle()));
                }
                
            } catch (Exception e) {
                logger.severe(String.format("[SystemDataService] 更新剧本ID %d 失败: %s", script.getId(), e.getMessage()));
                e.printStackTrace();
            }
        }
        
        logger.info(String.format("========== [SystemDataService] 完成，共更新 %d 个剧本 ==========", updatedCount));
        return updatedCount;
    }
    
    /**
     * 根据节点信息生成AI旁白提示词
     */
    private String generatePromptFromNode(String text, String backgroundHint, String nodeTitle, String scriptTitle, String scriptDescription) {
        // 如果text不为空，优先使用text作为prompt的基础
        if (text != null && !text.trim().isEmpty()) {
            // 如果text已经是描述性的，直接使用
            if (text.length() > 20) {
                // 添加背景提示以增强描述
                if (backgroundHint != null && !backgroundHint.trim().isEmpty()) {
                    return String.format("%s。场景：%s", text, backgroundHint);
                }
                return text;
            }
        }
        
        // 如果没有text或text太短，根据节点标题和剧本信息生成
        StringBuilder promptBuilder = new StringBuilder();
        
        if (scriptTitle != null && !scriptTitle.trim().isEmpty()) {
            promptBuilder.append("在").append(scriptTitle).append("的故事中，");
        }
        
        if (nodeTitle != null && !nodeTitle.trim().isEmpty() && !nodeTitle.equals("start") && !nodeTitle.equals("end")) {
            promptBuilder.append("你来到了").append(nodeTitle).append("的场景。");
        }
        
        if (text != null && !text.trim().isEmpty()) {
            promptBuilder.append(text);
        } else {
            promptBuilder.append("描述这个场景中发生的事情，包括环境、氛围和角色的互动。");
        }
        
        if (backgroundHint != null && !backgroundHint.trim().isEmpty()) {
            promptBuilder.append("背景环境：").append(backgroundHint);
        }
        
        return promptBuilder.toString();
    }

    // ========== 匹配资源并更新场景和角色图片 ==========
    /**
     * 根据名称匹配资源并更新预置场景和角色的图片
     * @return 匹配结果统计
     */
    @Transactional
    public Map<String, Object> matchAndUpdateResources() {
        logger.info("========== [SystemDataService] 开始匹配资源并更新场景和角色图片 ==========");
        
        Map<String, Object> result = new HashMap<>();
        int eraMatchedCount = 0;
        int characterAvatarMatchedCount = 0;
        List<String> eraMatched = new ArrayList<>();
        List<String> characterMatched = new ArrayList<>();
        List<String> eraNotFound = new ArrayList<>();
        List<String> characterNotFound = new ArrayList<>();
        
        // 1. 匹配场景（SystemEra）和资源（category='era'）
        List<SystemEra> eras = eraRepository.findAll();
        logger.info(String.format("[SystemDataService] 找到 %d 个预置场景", eras.size()));
        
        for (SystemEra era : eras) {
            try {
                SystemResource resource = resourceRepository.findByNameAndCategory(era.getName(), "era");
                if (resource != null && resource.getUrl() != null && !resource.getUrl().trim().isEmpty()) {
                    era.setImageUrl(resource.getUrl());
                    eraRepository.save(era);
                    eraMatchedCount++;
                    eraMatched.add(String.format("场景 '%s' (ID: %d) -> 资源 '%s' (URL: %s)", 
                        era.getName(), era.getId(), resource.getName(), resource.getUrl()));
                    logger.info(String.format("[SystemDataService] ✓ 场景 '%s' 匹配成功，已更新图片", era.getName()));
                } else {
                    eraNotFound.add(String.format("场景 '%s' (ID: %d) - 未找到匹配的资源", era.getName(), era.getId()));
                    logger.warning(String.format("[SystemDataService] ✗ 场景 '%s' 未找到匹配的资源", era.getName()));
                }
            } catch (Exception e) {
                logger.severe(String.format("[SystemDataService] 匹配场景 '%s' 时出错: %s", era.getName(), e.getMessage()));
                eraNotFound.add(String.format("场景 '%s' (ID: %d) - 匹配出错: %s", era.getName(), era.getId(), e.getMessage()));
            }
        }
        
        // 2. 匹配角色（SystemCharacter）和资源
        // 只更新角色头像：资源名称和角色名称匹配时，直接将资源图片URL复制给角色头像
        List<SystemCharacter> characters = characterRepository.findAll();
        logger.info(String.format("[SystemDataService] 找到 %d 个预置角色", characters.size()));
        
        // 获取所有角色相关的资源（category='character' 或 'avatar'）
        List<SystemResource> characterResources = resourceRepository.findByCategory("character");
        List<SystemResource> avatarResources = resourceRepository.findByCategory("avatar");
        List<SystemResource> allCharacterResources = new ArrayList<>();
        allCharacterResources.addAll(characterResources);
        allCharacterResources.addAll(avatarResources);
        logger.info(String.format("[SystemDataService] 找到 %d 个角色相关资源", allCharacterResources.size()));
        
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
                        logger.info(String.format("[SystemDataService] ✓ 角色 '%s' 头像匹配成功: 资源 '%s' -> %s", 
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
                    logger.warning(String.format("[SystemDataService] ✗ 角色 '%s' 未找到匹配的资源", character.getName()));
                }
            } catch (Exception e) {
                logger.severe(String.format("[SystemDataService] 匹配角色 '%s' 时出错: %s", character.getName(), e.getMessage()));
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
        
        logger.info(String.format("========== [SystemDataService] 匹配完成 =========="));
        logger.info(String.format("场景匹配: %d/%d", eraMatchedCount, eras.size()));
        logger.info(String.format("角色头像匹配: %d/%d", characterAvatarMatchedCount, characters.size()));
        
        return result;
    }
}

