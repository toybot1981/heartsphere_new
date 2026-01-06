package com.heartsphere.skill.controller;

import com.heartsphere.dto.ApiResponse;
import com.heartsphere.skill.dto.FunctionDefinitionDTO;
import com.heartsphere.skill.dto.SkillDefinitionDTO;
import com.heartsphere.skill.entity.SkillDefinition;
import com.heartsphere.skill.repository.SkillDefinitionRepository;
import com.heartsphere.skill.service.SkillRegistry;
import com.heartsphere.security.UserDetailsImpl;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 技能管理 Controller
 * 
 * 技能系统独立模块
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Slf4j
@RestController
@RequestMapping("/api/skills")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class SkillController {
    
    private final SkillDefinitionRepository skillDefinitionRepository;
    private final SkillRegistry skillRegistry;
    
    /**
     * 获取所有技能
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<SkillDefinitionDTO>>> getAllSkills(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String skillType,
            @RequestParam(required = false) String executionType) {
        
        List<SkillDefinition> skills;
        
        if (category != null && skillType != null) {
            skills = skillDefinitionRepository.findByCategoryAndSkillType(category, skillType);
        } else if (category != null) {
            skills = skillDefinitionRepository.findByCategory(category);
        } else if (skillType != null) {
            skills = skillDefinitionRepository.findBySkillType(skillType);
        } else if (executionType != null) {
            skills = skillDefinitionRepository.findByExecutionType(executionType);
        } else {
            skills = skillDefinitionRepository.findAll();
        }
        
        List<SkillDefinitionDTO> dtos = skills.stream()
            .map(this::toDTO)
            .collect(Collectors.toList());
        
        return ResponseEntity.ok(ApiResponse.success(dtos));
    }
    
    /**
     * 获取可用技能（有 function_schema 的技能）
     */
    @GetMapping("/available")
    public ResponseEntity<ApiResponse<List<SkillDefinitionDTO>>> getAvailableSkills() {
        List<SkillDefinition> skills = skillDefinitionRepository.findAvailableSkills();
        List<SkillDefinitionDTO> dtos = skills.stream()
            .map(this::toDTO)
            .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(dtos));
    }
    
    /**
     * 根据技能ID获取技能
     */
    @GetMapping("/{skillId}")
    public ResponseEntity<ApiResponse<SkillDefinitionDTO>> getSkillById(
            @PathVariable String skillId) {
        
        SkillDefinition skill = skillDefinitionRepository.findBySkillId(skillId)
            .orElseThrow(() -> new RuntimeException("技能不存在: " + skillId));
        
        return ResponseEntity.ok(ApiResponse.success(toDTO(skill)));
    }
    
    /**
     * 获取角色可用技能（用于 Function Calling）
     * 支持用户服务和管理服务两种模式：
     * - 用户服务：需要认证，验证角色属于当前用户
     * - 管理服务：可选认证，如果提供token则验证，否则允许访问（用于内部调用）
     */
    @GetMapping("/character/{characterId}/available")
    public ResponseEntity<ApiResponse<List<FunctionDefinitionDTO>>> getCharacterAvailableSkills(
            @PathVariable Long characterId,
            @AuthenticationPrincipal(required = false) UserDetailsImpl userDetails) {
        
        // 如果提供了认证信息，验证角色属于当前用户（用户服务模式）
        // 如果没有认证信息，允许访问（管理服务模式，用于内部调用）
        // TODO: 在用户服务模式下，验证角色属于当前用户
        
        List<SkillDefinition> skills = skillRegistry.getCharacterSkills(characterId);
        List<FunctionDefinitionDTO> functionDefinitions = skillRegistry.toFunctionDefinitions(skills)
            .stream()
            .map(fd -> FunctionDefinitionDTO.builder()
                .name(fd.getName())
                .description(fd.getDescription())
                .parameters(fd.getParameters())
                .build())
            .collect(Collectors.toList());
        
        return ResponseEntity.ok(ApiResponse.success(functionDefinitions));
    }
    
    /**
     * 检查自动触发技能
     */
    @PostMapping("/character/{characterId}/auto-trigger")
    public ResponseEntity<ApiResponse<List<SkillDefinitionDTO>>> checkAutoTriggerSkills(
            @PathVariable Long characterId,
            @RequestBody Map<String, String> request,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        
        String userInput = request.get("input");
        if (userInput == null || userInput.isEmpty()) {
            return ResponseEntity.ok(ApiResponse.success(List.of()));
        }
        
        List<SkillDefinition> skills = skillRegistry.findAutoTriggerSkills(characterId, userInput);
        List<SkillDefinitionDTO> dtos = skills.stream()
            .map(this::toDTO)
            .collect(Collectors.toList());
        
        return ResponseEntity.ok(ApiResponse.success(dtos));
    }
    
    /**
     * 创建技能
     */
    @PostMapping
    public ResponseEntity<ApiResponse<SkillDefinitionDTO>> createSkill(
            @RequestBody SkillDefinitionDTO dto,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        
        // 检查技能ID是否已存在
        if (skillDefinitionRepository.findBySkillId(dto.getSkillId()).isPresent()) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("技能ID已存在: " + dto.getSkillId()));
        }
        
        SkillDefinition skill = toEntity(dto);
        skill = skillDefinitionRepository.save(skill);
        
        // 刷新缓存
        skillRegistry.loadAllSkills();
        
        return ResponseEntity.ok(ApiResponse.success(toDTO(skill)));
    }
    
    /**
     * 更新技能
     */
    @PutMapping("/{skillId}")
    public ResponseEntity<ApiResponse<SkillDefinitionDTO>> updateSkill(
            @PathVariable String skillId,
            @RequestBody SkillDefinitionDTO dto,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        
        SkillDefinition existingSkill = skillDefinitionRepository.findBySkillId(skillId)
            .orElseThrow(() -> new RuntimeException("技能不存在: " + skillId));
        
        // 检查是否为系统技能
        if (Boolean.TRUE.equals(existingSkill.getIsSystemSkill())) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("系统技能不可修改"));
        }
        
        // 更新字段
        updateEntityFromDTO(existingSkill, dto);
        SkillDefinition skill = skillDefinitionRepository.save(existingSkill);
        
        // 刷新缓存
        skillRegistry.loadAllSkills();
        
        return ResponseEntity.ok(ApiResponse.success(toDTO(skill)));
    }
    
    /**
     * 删除技能
     */
    @DeleteMapping("/{skillId}")
    public ResponseEntity<ApiResponse<Void>> deleteSkill(
            @PathVariable String skillId,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        
        SkillDefinition skill = skillDefinitionRepository.findBySkillId(skillId)
            .orElseThrow(() -> new RuntimeException("技能不存在: " + skillId));
        
        // 检查是否为系统技能
        if (Boolean.TRUE.equals(skill.getIsSystemSkill())) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("系统技能不可删除"));
        }
        
        skillDefinitionRepository.delete(skill);
        
        // 刷新缓存
        skillRegistry.loadAllSkills();
        
        return ResponseEntity.ok(ApiResponse.success(null));
    }
    
    /**
     * 转换为 DTO
     */
    private SkillDefinitionDTO toDTO(SkillDefinition skill) {
        return SkillDefinitionDTO.builder()
            .id(skill.getId())
            .skillId(skill.getSkillId())
            .name(skill.getName())
            .description(skill.getDescription())
            .category(skill.getCategory())
            .skillType(skill.getSkillType())
            .maxLevel(skill.getMaxLevel())
            .baseValue(skill.getBaseValue())
            .iconUrl(skill.getIconUrl())
            .functionSchema(skill.getFunctionSchema())
            .executionType(skill.getExecutionType())
            .executionConfig(skill.getExecutionConfig())
            .autoTriggerKeywords(skill.getAutoTriggerKeywords())
            .requiredPermissions(skill.getRequiredPermissions())
            .maxUsagePerDay(skill.getMaxUsagePerDay())
            .version(skill.getVersion())
            .author(skill.getAuthor())
            .isSystemSkill(skill.getIsSystemSkill())
            .createdAt(skill.getCreatedAt())
            .updatedAt(skill.getUpdatedAt())
            .build();
    }
    
    /**
     * 转换为实体
     */
    private SkillDefinition toEntity(SkillDefinitionDTO dto) {
        SkillDefinition skill = new SkillDefinition();
        skill.setSkillId(dto.getSkillId());
        skill.setName(dto.getName());
        skill.setDescription(dto.getDescription());
        skill.setCategory(dto.getCategory());
        skill.setSkillType(dto.getSkillType() != null ? dto.getSkillType() : "PASSIVE");
        skill.setMaxLevel(dto.getMaxLevel() != null ? dto.getMaxLevel() : 100);
        skill.setBaseValue(dto.getBaseValue() != null ? dto.getBaseValue() : 0);
        skill.setIconUrl(dto.getIconUrl());
        skill.setFunctionSchema(dto.getFunctionSchema());
        skill.setExecutionType(dto.getExecutionType() != null ? dto.getExecutionType() : "RULE_BASED");
        skill.setExecutionConfig(dto.getExecutionConfig());
        skill.setAutoTriggerKeywords(dto.getAutoTriggerKeywords());
        skill.setRequiredPermissions(dto.getRequiredPermissions());
        skill.setMaxUsagePerDay(dto.getMaxUsagePerDay() != null ? dto.getMaxUsagePerDay() : -1);
        skill.setVersion(dto.getVersion() != null ? dto.getVersion() : "1.0.0");
        skill.setAuthor(dto.getAuthor());
        skill.setIsSystemSkill(dto.getIsSystemSkill() != null ? dto.getIsSystemSkill() : false);
        return skill;
    }
    
    /**
     * 从 DTO 更新实体
     */
    private void updateEntityFromDTO(SkillDefinition skill, SkillDefinitionDTO dto) {
        if (dto.getName() != null) skill.setName(dto.getName());
        if (dto.getDescription() != null) skill.setDescription(dto.getDescription());
        if (dto.getCategory() != null) skill.setCategory(dto.getCategory());
        if (dto.getSkillType() != null) skill.setSkillType(dto.getSkillType());
        if (dto.getMaxLevel() != null) skill.setMaxLevel(dto.getMaxLevel());
        if (dto.getBaseValue() != null) skill.setBaseValue(dto.getBaseValue());
        if (dto.getIconUrl() != null) skill.setIconUrl(dto.getIconUrl());
        if (dto.getFunctionSchema() != null) skill.setFunctionSchema(dto.getFunctionSchema());
        if (dto.getExecutionType() != null) skill.setExecutionType(dto.getExecutionType());
        if (dto.getExecutionConfig() != null) skill.setExecutionConfig(dto.getExecutionConfig());
        if (dto.getAutoTriggerKeywords() != null) skill.setAutoTriggerKeywords(dto.getAutoTriggerKeywords());
        if (dto.getRequiredPermissions() != null) skill.setRequiredPermissions(dto.getRequiredPermissions());
        if (dto.getMaxUsagePerDay() != null) skill.setMaxUsagePerDay(dto.getMaxUsagePerDay());
        if (dto.getVersion() != null) skill.setVersion(dto.getVersion());
        if (dto.getAuthor() != null) skill.setAuthor(dto.getAuthor());
    }
}
