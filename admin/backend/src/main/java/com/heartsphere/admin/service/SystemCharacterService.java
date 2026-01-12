package com.heartsphere.admin.service;

import com.heartsphere.admin.dto.SystemCharacterDTO;
import com.heartsphere.admin.entity.SystemCharacter;
import com.heartsphere.admin.entity.SystemEra;
import com.heartsphere.admin.repository.SystemCharacterRepository;
import com.heartsphere.admin.repository.SystemEraRepository;
import com.heartsphere.admin.util.SystemDTOMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.logging.Logger;
import java.util.stream.Collectors;

/**
 * 系统角色服务
 * 提供SystemCharacter的CRUD操作
 */
@Service
public class SystemCharacterService {

    private static final Logger logger = Logger.getLogger(SystemCharacterService.class.getName());

    @Autowired
    private SystemCharacterRepository characterRepository;

    @Autowired
    private SystemEraRepository eraRepository;

    /**
     * 获取所有系统角色
     */
    public List<SystemCharacterDTO> getAllCharacters() {
        logger.info("========== [SystemCharacterService] 获取所有系统角色 ==========");
        List<SystemCharacter> characters = characterRepository.findAll();
        logger.info(String.format("[SystemCharacterService] 查询到 %d 个系统角色", characters.size()));
        List<SystemCharacterDTO> result = characters.stream()
                .map(SystemDTOMapper::toCharacterDTO)
                .collect(Collectors.toList());
        logger.info(String.format("[SystemCharacterService] 返回 %d 个系统角色DTO", result.size()));
        return result;
    }

    /**
     * 根据ID获取系统角色
     */
    public SystemCharacterDTO getCharacterById(Long id) {
        logger.info(String.format("========== [SystemCharacterService] 获取系统角色详情 ========== ID: %d", id));
        SystemCharacter character = characterRepository.findById(id)
                .orElseThrow(() -> {
                    logger.warning(String.format("[SystemCharacterService] 系统角色不存在: ID=%d", id));
                    return new RuntimeException("系统角色不存在: " + id);
                });
        logger.info(String.format("[SystemCharacterService] 成功获取系统角色: ID=%d, name=%s", id, character.getName()));
        return SystemDTOMapper.toCharacterDTO(character);
    }

    /**
     * 创建系统角色
     */
    @Transactional
    public SystemCharacterDTO createCharacter(SystemCharacterDTO dto) {
        logger.info("========== [SystemCharacterService] 创建系统角色 ==========");
        logger.info(String.format("[SystemCharacterService] 请求参数: name=%s, role=%s, systemEraId=%s, isActive=%s", 
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
        
        logger.info(String.format("[SystemCharacterService] 角色对象已创建: name=%s, role=%s, bio长度=%d", 
            character.getName(), character.getRole(), character.getBio() != null ? character.getBio().length() : 0));
        
        if (dto.getSystemEraId() != null) {
            logger.info(String.format("[SystemCharacterService] 关联系统时代: eraId=%d", dto.getSystemEraId()));
            SystemEra era = eraRepository.findById(dto.getSystemEraId())
                    .orElseThrow(() -> {
                        logger.warning(String.format("[SystemCharacterService] 系统时代不存在: ID=%d", dto.getSystemEraId()));
                        return new RuntimeException("系统时代不存在: " + dto.getSystemEraId());
                    });
            character.setSystemEra(era);
            logger.info(String.format("[SystemCharacterService] 时代关联成功: eraId=%d, eraName=%s", era.getId(), era.getName()));
        }
        character.setIsActive(dto.getIsActive() != null ? dto.getIsActive() : true);
        character.setSortOrder(dto.getSortOrder() != null ? dto.getSortOrder() : 0);
        
        character = characterRepository.save(character);
        logger.info(String.format("[SystemCharacterService] 系统角色保存成功: ID=%d, name=%s", character.getId(), character.getName()));
        return SystemDTOMapper.toCharacterDTO(character);
    }

    /**
     * 更新系统角色
     */
    @Transactional
    public SystemCharacterDTO updateCharacter(Long id, SystemCharacterDTO dto) {
        logger.info(String.format("========== [SystemCharacterService] 更新系统角色 ========== ID: %d", id));
        logger.info(String.format("[SystemCharacterService] 请求参数: name=%s, role=%s, systemEraId=%s, isActive=%s", 
            dto.getName(), dto.getRole(), dto.getSystemEraId(), dto.getIsActive()));
        
        SystemCharacter character = characterRepository.findById(id)
                .orElseThrow(() -> {
                    logger.warning(String.format("[SystemCharacterService] 系统角色不存在: ID=%d", id));
                    return new RuntimeException("系统角色不存在: " + id);
                });
        
        logger.info(String.format("[SystemCharacterService] 原角色信息: name=%s, role=%s, isActive=%s", 
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
            logger.info(String.format("[SystemCharacterService] 更新系统时代关联: eraId=%d", dto.getSystemEraId()));
            SystemEra era = eraRepository.findById(dto.getSystemEraId())
                    .orElseThrow(() -> {
                        logger.warning(String.format("[SystemCharacterService] 系统时代不存在: ID=%d", dto.getSystemEraId()));
                        return new RuntimeException("系统时代不存在: " + dto.getSystemEraId());
                    });
            character.setSystemEra(era);
            logger.info(String.format("[SystemCharacterService] 时代关联更新成功: eraId=%d, eraName=%s", era.getId(), era.getName()));
        }
        if (dto.getIsActive() != null) character.setIsActive(dto.getIsActive());
        if (dto.getSortOrder() != null) character.setSortOrder(dto.getSortOrder());
        
        character = characterRepository.save(character);
        logger.info(String.format("[SystemCharacterService] 系统角色更新成功: ID=%d, name=%s, role=%s", 
            character.getId(), character.getName(), character.getRole()));
        return SystemDTOMapper.toCharacterDTO(character);
    }

    /**
     * 删除系统角色
     */
    @Transactional
    public void deleteCharacter(Long id) {
        logger.info(String.format("========== [SystemCharacterService] 删除系统角色 ========== ID: %d", id));
        SystemCharacter character = characterRepository.findById(id)
                .orElse(null);
        if (character != null) {
            logger.info(String.format("[SystemCharacterService] 找到系统角色: ID=%d, name=%s", id, character.getName()));
            characterRepository.deleteById(id);
            logger.info(String.format("[SystemCharacterService] 系统角色删除成功: ID=%d, name=%s", id, character.getName()));
        } else {
            logger.warning(String.format("[SystemCharacterService] 系统角色不存在，无法删除: ID=%d", id));
            throw new RuntimeException("系统角色不存在: " + id);
        }
    }
}




