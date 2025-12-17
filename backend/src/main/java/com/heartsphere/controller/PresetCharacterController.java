package com.heartsphere.controller;

import com.heartsphere.admin.dto.SystemCharacterDTO;
import com.heartsphere.admin.entity.SystemCharacter;
import com.heartsphere.admin.repository.SystemCharacterRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/preset-characters")
public class PresetCharacterController {

    @Autowired
    private SystemCharacterRepository systemCharacterRepository;

    // 获取预置角色（客户端公共接口，不需要认证）
    // 支持按时代ID过滤
    @GetMapping
    public ResponseEntity<List<SystemCharacterDTO>> getPresetCharacters(
            @RequestParam(required = false) Long eraId) {
        List<SystemCharacter> characters;
        
        if (eraId != null) {
            // 获取指定时代的预置角色
            characters = systemCharacterRepository.findBySystemEraId(eraId);
        } else {
            // 获取所有激活的预置角色
            characters = systemCharacterRepository.findByIsActiveTrueOrderBySortOrderAsc();
        }
        
        List<SystemCharacterDTO> characterDTOs = characters.stream()
            .map(character -> {
                SystemCharacterDTO dto = new SystemCharacterDTO();
                dto.setId(character.getId());
                dto.setName(character.getName());
                dto.setDescription(character.getDescription());
                dto.setAge(character.getAge());
                dto.setGender(character.getGender());
                dto.setRole(character.getRole());
                dto.setBio(character.getBio());
                dto.setAvatarUrl(character.getAvatarUrl());
                dto.setBackgroundUrl(character.getBackgroundUrl());
                dto.setThemeColor(character.getThemeColor());
                dto.setColorAccent(character.getColorAccent());
                dto.setFirstMessage(character.getFirstMessage());
                dto.setSystemInstruction(character.getSystemInstruction());
                dto.setVoiceName(character.getVoiceName());
                dto.setMbti(character.getMbti());
                dto.setTags(character.getTags());
                dto.setSpeechStyle(character.getSpeechStyle());
                dto.setCatchphrases(character.getCatchphrases());
                dto.setSecrets(character.getSecrets());
                dto.setMotivations(character.getMotivations());
                dto.setRelationships(character.getRelationships());
                dto.setSystemEraId(character.getSystemEra() != null ? character.getSystemEra().getId() : null);
                dto.setIsActive(character.getIsActive() != null ? character.getIsActive() : true);
                dto.setSortOrder(character.getSortOrder());
                dto.setCreatedAt(character.getCreatedAt());
                dto.setUpdatedAt(character.getUpdatedAt());
                return dto;
            })
            .collect(Collectors.toList());
        return ResponseEntity.ok(characterDTOs);
    }
}
