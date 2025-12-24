package com.heartsphere.controller;

import com.heartsphere.admin.dto.SystemCharacterDTO;
import com.heartsphere.admin.entity.SystemCharacter;
import com.heartsphere.admin.repository.SystemCharacterRepository;
import com.heartsphere.admin.util.SystemDTOMapper;
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
        
        // 使用SystemDTOMapper转换，会自动处理URL转换（相对路径 -> 完整URL）
        List<SystemCharacterDTO> characterDTOs = characters.stream()
            .map(SystemDTOMapper::toCharacterDTO)
            .collect(Collectors.toList());
        return ResponseEntity.ok(characterDTOs);
    }
}
