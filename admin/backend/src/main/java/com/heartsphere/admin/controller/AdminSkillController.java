package com.heartsphere.admin.controller;

import com.heartsphere.admin.dto.skill.SkillDefinitionDTO;
import com.heartsphere.admin.entity.skill.SkillDefinition;
import com.heartsphere.admin.repository.skill.SkillDefinitionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 技能管理 Controller（Admin模块）
 * 
 * 提供独立的技能管理接口，不依赖其他工程的服务
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Slf4j
@RestController
@RequestMapping("/api/admin/skills")
@RequiredArgsConstructor
public class AdminSkillController extends BaseAdminController {
    
    private final SkillDefinitionRepository skillDefinitionRepository;
    
    /**
     * 获取所有技能
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllSkills(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String skillType,
            @RequestParam(required = false) String executionType) {
        try {
            validateAdmin(authHeader);
            
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
            
            return ResponseEntity.ok(Map.of("code", 200, "data", dtos, "message", "success"));
        } catch (RuntimeException e) {
            log.error("获取技能列表失败: {}", e.getMessage());
            return ResponseEntity.status(401).body(Map.of("code", 401, "message", e.getMessage(), "data", null));
        } catch (Exception e) {
            log.error("获取技能列表异常: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(Map.of("code", 500, "message", "服务器内部错误", "data", null));
        }
    }
    
    /**
     * 根据技能ID获取技能
     */
    @GetMapping("/{skillId}")
    public ResponseEntity<Map<String, Object>> getSkillById(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable String skillId) {
        try {
            validateAdmin(authHeader);
            
            SkillDefinition skill = skillDefinitionRepository.findBySkillId(skillId)
                .orElseThrow(() -> new RuntimeException("技能不存在: " + skillId));
            
            return ResponseEntity.ok(Map.of("code", 200, "data", toDTO(skill), "message", "success"));
        } catch (RuntimeException e) {
            log.error("获取技能失败: {}", e.getMessage());
            return ResponseEntity.status(404).body(Map.of("code", 404, "message", e.getMessage(), "data", null));
        } catch (Exception e) {
            log.error("获取技能异常: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(Map.of("code", 500, "message", "服务器内部错误", "data", null));
        }
    }
    
    /**
     * 创建技能
     */
    @PostMapping
    public ResponseEntity<Map<String, Object>> createSkill(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestBody SkillDefinitionDTO dto) {
        try {
            validateAdmin(authHeader);
            
            // 检查技能ID是否已存在
            if (skillDefinitionRepository.findBySkillId(dto.getSkillId()).isPresent()) {
                return ResponseEntity.badRequest()
                    .body(Map.of("code", 400, "message", "技能ID已存在: " + dto.getSkillId(), "data", null));
            }
            
            SkillDefinition skill = toEntity(dto);
            skill = skillDefinitionRepository.save(skill);
            
            return ResponseEntity.ok(Map.of("code", 200, "data", toDTO(skill), "message", "创建成功"));
        } catch (RuntimeException e) {
            log.error("创建技能失败: {}", e.getMessage());
            return ResponseEntity.status(400).body(Map.of("code", 400, "message", e.getMessage(), "data", null));
        } catch (Exception e) {
            log.error("创建技能异常: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(Map.of("code", 500, "message", "服务器内部错误", "data", null));
        }
    }
    
    /**
     * 更新技能
     */
    @PutMapping("/{skillId}")
    public ResponseEntity<Map<String, Object>> updateSkill(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable String skillId,
            @RequestBody SkillDefinitionDTO dto) {
        try {
            validateAdmin(authHeader);
            
            SkillDefinition existingSkill = skillDefinitionRepository.findBySkillId(skillId)
                .orElseThrow(() -> new RuntimeException("技能不存在: " + skillId));
            
            // 检查是否为系统技能
            if (Boolean.TRUE.equals(existingSkill.getIsSystemSkill())) {
                return ResponseEntity.badRequest()
                    .body(Map.of("code", 400, "message", "系统技能不可修改", "data", null));
            }
            
            // 更新字段
            updateEntityFromDTO(existingSkill, dto);
            SkillDefinition skill = skillDefinitionRepository.save(existingSkill);
            
            return ResponseEntity.ok(Map.of("code", 200, "data", toDTO(skill), "message", "更新成功"));
        } catch (RuntimeException e) {
            log.error("更新技能失败: {}", e.getMessage());
            return ResponseEntity.status(400).body(Map.of("code", 400, "message", e.getMessage(), "data", null));
        } catch (Exception e) {
            log.error("更新技能异常: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(Map.of("code", 500, "message", "服务器内部错误", "data", null));
        }
    }
    
    /**
     * 删除技能
     */
    @DeleteMapping("/{skillId}")
    public ResponseEntity<Map<String, Object>> deleteSkill(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable String skillId) {
        try {
            validateAdmin(authHeader);
            
            SkillDefinition skill = skillDefinitionRepository.findBySkillId(skillId)
                .orElseThrow(() -> new RuntimeException("技能不存在: " + skillId));
            
            // 检查是否为系统技能
            if (Boolean.TRUE.equals(skill.getIsSystemSkill())) {
                return ResponseEntity.badRequest()
                    .body(Map.of("code", 400, "message", "系统技能不可删除", "data", null));
            }
            
            skillDefinitionRepository.delete(skill);
            
            return ResponseEntity.ok(Map.of("code", 200, "message", "删除成功", "data", null));
        } catch (RuntimeException e) {
            log.error("删除技能失败: {}", e.getMessage());
            return ResponseEntity.status(400).body(Map.of("code", 400, "message", e.getMessage(), "data", null));
        } catch (Exception e) {
            log.error("删除技能异常: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(Map.of("code", 500, "message", "服务器内部错误", "data", null));
        }
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
