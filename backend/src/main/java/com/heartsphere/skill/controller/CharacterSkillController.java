package com.heartsphere.skill.controller;

import com.heartsphere.dto.ApiResponse;
import com.heartsphere.skill.dto.CharacterSkillBindingDTO;
import com.heartsphere.skill.dto.EquipSkillRequest;
import com.heartsphere.skill.entity.CharacterSkillBinding;
import com.heartsphere.skill.entity.SkillDefinition;
import com.heartsphere.skill.repository.CharacterSkillBindingRepository;
import com.heartsphere.skill.repository.SkillDefinitionRepository;
import com.heartsphere.skill.service.CharacterSkillService;
import com.heartsphere.security.UserDetailsImpl;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

/**
 * 角色技能管理 Controller
 * 
 * 技能系统独立模块
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Slf4j
@RestController
@RequestMapping("/api/characters/{characterId}/skills")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CharacterSkillController {
    
    private final CharacterSkillService characterSkillService;
    private final CharacterSkillBindingRepository characterSkillBindingRepository;
    private final SkillDefinitionRepository skillDefinitionRepository;
    
    /**
     * 获取角色已装备的技能
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<CharacterSkillBindingDTO>>> getEquippedSkills(
            @PathVariable Long characterId,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        
        // TODO: 验证角色属于当前用户
        
        List<CharacterSkillBinding> bindings = characterSkillService.getEquippedSkills(characterId);
        List<CharacterSkillBindingDTO> dtos = bindings.stream()
            .map(binding -> toDTO(binding, true))
            .collect(Collectors.toList());
        
        return ResponseEntity.ok(ApiResponse.success(dtos));
    }
    
    /**
     * 获取角色已启用技能
     */
    @GetMapping("/enabled")
    public ResponseEntity<ApiResponse<List<CharacterSkillBindingDTO>>> getEnabledSkills(
            @PathVariable Long characterId,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        
        List<CharacterSkillBinding> bindings = characterSkillService.getEnabledSkills(characterId);
        List<CharacterSkillBindingDTO> dtos = bindings.stream()
            .map(binding -> toDTO(binding, true))
            .collect(Collectors.toList());
        
        return ResponseEntity.ok(ApiResponse.success(dtos));
    }
    
    /**
     * 装备技能
     */
    @PostMapping("/{skillId}/equip")
    public ResponseEntity<ApiResponse<CharacterSkillBindingDTO>> equipSkill(
            @PathVariable Long characterId,
            @PathVariable String skillId,
            @RequestBody(required = false) EquipSkillRequest request,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        
        if (request == null) {
            request = EquipSkillRequest.builder()
                .isEnabled(true)
                .autoTrigger(false)
                .priority(0)
                .build();
        }
        
        CharacterSkillBinding binding = characterSkillService.equipSkill(
            characterId,
            skillId,
            CharacterSkillService.EquipSkillRequest.builder()
                .isEnabled(request.getIsEnabled())
                .autoTrigger(request.getAutoTrigger())
                .priority(request.getPriority())
                .build()
        );
        
        return ResponseEntity.ok(ApiResponse.success(toDTO(binding, true)));
    }
    
    /**
     * 卸载技能
     */
    @DeleteMapping("/{skillId}/unequip")
    public ResponseEntity<ApiResponse<Void>> unequipSkill(
            @PathVariable Long characterId,
            @PathVariable String skillId,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        
        characterSkillService.unequipSkill(characterId, skillId);
        return ResponseEntity.ok(ApiResponse.success());
    }
    
    /**
     * 启用/禁用技能
     */
    @PutMapping("/{skillId}/toggle")
    public ResponseEntity<ApiResponse<CharacterSkillBindingDTO>> toggleSkill(
            @PathVariable Long characterId,
            @PathVariable String skillId,
            @RequestParam Boolean enabled,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        
        characterSkillService.toggleSkill(characterId, skillId, enabled);
        
        CharacterSkillBinding binding = characterSkillBindingRepository
            .findByCharacterIdAndSkillId(characterId, skillId)
            .orElseThrow(() -> new RuntimeException("技能未装备"));
        
        return ResponseEntity.ok(ApiResponse.success(toDTO(binding, true)));
    }
    
    /**
     * 设置自动触发
     */
    @PutMapping("/{skillId}/auto-trigger")
    public ResponseEntity<ApiResponse<CharacterSkillBindingDTO>> setAutoTrigger(
            @PathVariable Long characterId,
            @PathVariable String skillId,
            @RequestParam Boolean autoTrigger,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        
        characterSkillService.setAutoTrigger(characterId, skillId, autoTrigger);
        
        CharacterSkillBinding binding = characterSkillBindingRepository
            .findByCharacterIdAndSkillId(characterId, skillId)
            .orElseThrow(() -> new RuntimeException("技能未装备"));
        
        return ResponseEntity.ok(ApiResponse.success(toDTO(binding, true)));
    }
    
    /**
     * 设置优先级
     */
    @PutMapping("/{skillId}/priority")
    public ResponseEntity<ApiResponse<CharacterSkillBindingDTO>> setPriority(
            @PathVariable Long characterId,
            @PathVariable String skillId,
            @RequestParam Integer priority,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        
        characterSkillService.setPriority(characterId, skillId, priority);
        
        CharacterSkillBinding binding = characterSkillBindingRepository
            .findByCharacterIdAndSkillId(characterId, skillId)
            .orElseThrow(() -> new RuntimeException("技能未装备"));
        
        return ResponseEntity.ok(ApiResponse.success(toDTO(binding, true)));
    }
    
    /**
     * 转换为 DTO
     */
    private CharacterSkillBindingDTO toDTO(CharacterSkillBinding binding, boolean includeSkill) {
        CharacterSkillBindingDTO.CharacterSkillBindingDTOBuilder builder = CharacterSkillBindingDTO.builder()
            .id(binding.getId())
            .characterId(binding.getCharacterId())
            .skillId(binding.getSkillId())
            .isEnabled(binding.getIsEnabled())
            .autoTrigger(binding.getAutoTrigger())
            .priority(binding.getPriority())
            .usageCount(binding.getUsageCount())
            .lastUsedAt(binding.getLastUsedAt())
            .equippedAt(binding.getEquippedAt())
            .createdAt(binding.getCreatedAt())
            .updatedAt(binding.getUpdatedAt());
        
        if (includeSkill) {
            skillDefinitionRepository.findBySkillId(binding.getSkillId())
                .ifPresent(skill -> {
                    // 这里可以添加技能信息，但为了保持模块独立，暂时不添加
                    // builder.skill(toSkillDTO(skill));
                });
        }
        
        return builder.build();
    }
}
