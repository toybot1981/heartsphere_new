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
import com.heartsphere.admin.repository.SystemScriptRepository;
import com.heartsphere.admin.repository.SystemWorldRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
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
}

