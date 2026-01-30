package com.heartsphere.admin.controller;

import com.heartsphere.admin.dto.skill.SkillDefinitionDTO;
import com.heartsphere.admin.dto.skill.SkillCreatorRequest;
import com.heartsphere.admin.dto.skill.SkillCreatorResponse;
import com.heartsphere.admin.dto.skill.SkillValidationResultDTO;
import com.heartsphere.admin.dto.skill.SkillQualityReportDTO;
import com.heartsphere.admin.entity.skill.SkillDefinition;
import com.heartsphere.admin.repository.skill.SkillDefinitionRepository;
import com.heartsphere.admin.service.skill.McpToolValidator;
import com.heartsphere.admin.service.skill.SkillCreatorService;
import com.heartsphere.admin.service.skill.SkillMigrationService;
import com.heartsphere.admin.service.skill.SkillResourceService;
import com.heartsphere.admin.service.skill.SkillTemplateService;
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
    private final SkillCreatorService skillCreatorService;
    private final McpToolValidator mcpToolValidator;
    private final SkillTemplateService skillTemplateService;
    private final SkillMigrationService skillMigrationService;
    private final SkillResourceService skillResourceService;
    private final com.heartsphere.admin.service.skill.SkillValidationService skillValidationService;

    /** 构建错误响应 body，避免 Map.of 因 null 导致 NPE */
    private static Map<String, Object> errorBody(int code, String message) {
        Map<String, Object> m = new HashMap<>();
        m.put("code", code);
        m.put("message", message != null ? message : "未知错误");
        m.put("data", null);
        return m;
    }
    
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
            return ResponseEntity.status(401).body(errorBody(401, e.getMessage()));
        } catch (Exception e) {
            log.error("获取技能列表异常: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(errorBody(500, "服务器内部错误"));
        }
    }
    
    /**
     * 根据技能ID获取技能。
     * 若 includeResources=true，返回技能主信息及关联的 Bundled Resources（skill_resources），便于单表视图一次性加载。
     */
    @GetMapping("/{skillId}")
    public ResponseEntity<Map<String, Object>> getSkillById(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable String skillId,
            @RequestParam(value = "includeResources", required = false, defaultValue = "false") boolean includeResources) {
        try {
            validateAdmin(authHeader);

            SkillDefinition skill = skillDefinitionRepository.findBySkillId(skillId)
                .orElseThrow(() -> new RuntimeException("技能不存在: " + skillId));

            if (includeResources) {
                List<Map<String, Object>> resourceList = new java.util.ArrayList<>();
                try {
                    List<com.heartsphere.admin.entity.skill.SkillResource> resources =
                        skillResourceService.getResourcesBySkillId(skillId);
                    for (com.heartsphere.admin.entity.skill.SkillResource r : resources) {
                        Map<String, Object> m = new HashMap<>();
                        m.put("id", r.getId());
                        m.put("skillId", r.getSkillId());
                        m.put("resourceType", r.getResourceType());
                        m.put("resourceName", r.getResourceName());
                        m.put("fileName", r.getFileName());
                        m.put("filePath", r.getFilePath());
                        m.put("fileSize", r.getFileSize());
                        m.put("mimeType", r.getMimeType());
                        m.put("description", r.getDescription());
                        m.put("orderIndex", r.getOrderIndex());
                        m.put("createdAt", r.getCreatedAt());
                        m.put("updatedAt", r.getUpdatedAt());
                        resourceList.add(m);
                    }
                } catch (Exception resourceEx) {
                    log.warn("加载技能资源失败（如缺表列请执行迁移 V20260131），返回空资源列表: skillId={}, error={}", skillId, resourceEx.getMessage());
                }
                Map<String, Object> data = new HashMap<>();
                data.put("skill", toDTO(skill));
                data.put("resources", resourceList);
                return ResponseEntity.ok(Map.of("code", 200, "data", data, "message", "success"));
            }
            return ResponseEntity.ok(Map.of("code", 200, "data", toDTO(skill), "message", "success"));
        } catch (RuntimeException e) {
            log.error("获取技能失败: {}", e.getMessage());
            return ResponseEntity.status(404).body(errorBody(404, e.getMessage()));
        } catch (Exception e) {
            log.error("获取技能异常: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(errorBody(500, "服务器内部错误"));
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
                    .body(errorBody(400, "技能ID已存在: " + dto.getSkillId()));
            }
            
            SkillDefinition skill = toEntity(dto);
            skill = skillDefinitionRepository.save(skill);
            
            return ResponseEntity.ok(Map.of("code", 200, "data", toDTO(skill), "message", "创建成功"));
        } catch (RuntimeException e) {
            log.error("创建技能失败: {}", e.getMessage());
            return ResponseEntity.status(400).body(errorBody(400, e.getMessage()));
        } catch (Exception e) {
            log.error("创建技能异常: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(errorBody(500, "服务器内部错误"));
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
                    .body(errorBody(400, "系统技能不可修改"));
            }
            
            // 更新字段
            updateEntityFromDTO(existingSkill, dto);
            SkillDefinition skill = skillDefinitionRepository.save(existingSkill);
            
            return ResponseEntity.ok(Map.of("code", 200, "data", toDTO(skill), "message", "更新成功"));
        } catch (RuntimeException e) {
            log.error("更新技能失败: {}", e.getMessage());
            return ResponseEntity.status(400).body(errorBody(400, e.getMessage()));
        } catch (Exception e) {
            log.error("更新技能异常: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(errorBody(500, "服务器内部错误"));
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
                    .body(errorBody(400, "系统技能不可删除"));
            }
            
            skillDefinitionRepository.delete(skill);
            
            return ResponseEntity.ok(errorBody(200, "删除成功"));
        } catch (RuntimeException e) {
            log.error("删除技能失败: {}", e.getMessage());
            return ResponseEntity.status(400).body(errorBody(400, e.getMessage()));
        } catch (Exception e) {
            log.error("删除技能异常: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(errorBody(500, "服务器内部错误"));
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
            // 已移除：functionSchema (废弃，改用 mcpToolConfig)
            .executionType(skill.getExecutionType())
            .executionConfig(skill.getExecutionConfig())
            .autoTriggerKeywords(skill.getAutoTriggerKeywords())
            .requiredPermissions(skill.getRequiredPermissions())
            .maxUsagePerDay(skill.getMaxUsagePerDay())
            .version(skill.getVersion())
            .author(skill.getAuthor())
            .isSystemSkill(skill.getIsSystemSkill())
            .license(skill.getLicense())
            .compatibility(skill.getCompatibility())
            .metadata(skill.getMetadata())
            .skillContent(skill.getSkillContent())
            .mcpToolConfig(skill.getMcpToolConfig())
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
        // 已移除：functionSchema (废弃，改用 mcpToolConfig)
        skill.setExecutionType(dto.getExecutionType() != null ? dto.getExecutionType() : "RULE_BASED");
        skill.setExecutionConfig(dto.getExecutionConfig());
        skill.setAutoTriggerKeywords(dto.getAutoTriggerKeywords());
        skill.setRequiredPermissions(dto.getRequiredPermissions());
        skill.setMaxUsagePerDay(dto.getMaxUsagePerDay() != null ? dto.getMaxUsagePerDay() : -1);
        skill.setVersion(dto.getVersion() != null ? dto.getVersion() : "1.0.0");
        skill.setAuthor(dto.getAuthor());
        skill.setIsSystemSkill(dto.getIsSystemSkill() != null ? dto.getIsSystemSkill() : false);
        skill.setLicense(dto.getLicense());
        skill.setCompatibility(dto.getCompatibility());
        skill.setMetadata(dto.getMetadata());
        skill.setSkillContent(dto.getSkillContent());
        skill.setMcpToolConfig(dto.getMcpToolConfig());
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
        // 已移除：functionSchema (废弃，改用 mcpToolConfig)
        if (dto.getExecutionType() != null) skill.setExecutionType(dto.getExecutionType());
        if (dto.getExecutionConfig() != null) skill.setExecutionConfig(dto.getExecutionConfig());
        if (dto.getAutoTriggerKeywords() != null) skill.setAutoTriggerKeywords(dto.getAutoTriggerKeywords());
        if (dto.getRequiredPermissions() != null) skill.setRequiredPermissions(dto.getRequiredPermissions());
        if (dto.getMaxUsagePerDay() != null) skill.setMaxUsagePerDay(dto.getMaxUsagePerDay());
        if (dto.getVersion() != null) skill.setVersion(dto.getVersion());
        if (dto.getAuthor() != null) skill.setAuthor(dto.getAuthor());
        if (dto.getLicense() != null) skill.setLicense(dto.getLicense());
        if (dto.getCompatibility() != null) skill.setCompatibility(dto.getCompatibility());
        if (dto.getMetadata() != null) skill.setMetadata(dto.getMetadata());
        if (dto.getSkillContent() != null) skill.setSkillContent(dto.getSkillContent());
        if (dto.getMcpToolConfig() != null) skill.setMcpToolConfig(dto.getMcpToolConfig());
    }
    
    // ============================================
    // Skill Creator 相关接口
    // ============================================
    
    /**
     * 开始创建流程
     */
    @PostMapping("/creator/start")
    public ResponseEntity<Map<String, Object>> startCreation(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            validateAdmin(authHeader);
            String sessionId = skillCreatorService.startCreation();
            SkillCreatorResponse response = new SkillCreatorResponse();
            response.setSessionId(sessionId);
            response.setSuccess(true);
            response.setMessage("创建流程已开始");
            return ResponseEntity.ok(Map.of("code", 200, "data", response, "message", "success"));
        } catch (RuntimeException e) {
            log.error("开始创建流程失败: {}", e.getMessage());
            return ResponseEntity.status(401).body(errorBody(401, e.getMessage()));
        } catch (Exception e) {
            log.error("开始创建流程异常: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(errorBody(500, "服务器内部错误"));
        }
    }
    
    /**
     * 保存草稿
     */
    @PostMapping("/creator/save-draft")
    public ResponseEntity<Map<String, Object>> saveDraft(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestBody(required = false) SkillCreatorRequest request) {
        try {
            validateAdmin(authHeader);
            if (request == null) {
                return ResponseEntity.status(400).body(errorBody(400, "请求体不能为空"));
            }
            String sessionId = request.getSessionId();
            if (sessionId == null || sessionId.isBlank()) {
                return ResponseEntity.status(400).body(errorBody(400, "sessionId 不能为空"));
            }
            skillCreatorService.saveDraft(sessionId, request.getSkillData() != null ? request.getSkillData() : new HashMap<>());
            Map<String, Object> ok = new HashMap<>();
            ok.put("code", 200);
            ok.put("message", "草稿已保存");
            ok.put("data", null);
            return ResponseEntity.ok(ok);
        } catch (RuntimeException e) {
            log.error("保存草稿失败: {}", e.getMessage());
            return ResponseEntity.status(401).body(errorBody(401, e.getMessage() != null ? e.getMessage() : "未授权"));
        } catch (Exception e) {
            String msg = e.getMessage() != null ? e.getMessage() : e.getClass().getSimpleName();
            log.error("保存草稿异常: {}", msg, e);
            return ResponseEntity.status(500).body(errorBody(500, "服务器内部错误: " + msg));
        }
    }
    
    /**
     * 验证技能
     */
    @PostMapping("/creator/validate")
    public ResponseEntity<Map<String, Object>> validateSkill(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestBody SkillCreatorRequest request) {
        try {
            validateAdmin(authHeader);
            var validationResult = skillCreatorService.validateSkill(request.getSkillData());
            
            SkillValidationResultDTO dto = new SkillValidationResultDTO();
            dto.setValid(validationResult.isValid());
            dto.setErrors(validationResult.getErrors());
            dto.setWarnings(validationResult.getWarnings());
            
            return ResponseEntity.ok(Map.of("code", 200, "data", dto, "message", "success"));
        } catch (RuntimeException e) {
            log.error("验证技能失败: {}", e.getMessage());
            return ResponseEntity.status(401).body(errorBody(401, e.getMessage()));
        } catch (Exception e) {
            log.error("验证技能异常: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(errorBody(500, "服务器内部错误"));
        }
    }
    
    /**
     * 完成创建
     */
    @PostMapping("/creator/finalize")
    public ResponseEntity<Map<String, Object>> finalizeSkill(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestBody SkillCreatorRequest request) {
        try {
            validateAdmin(authHeader);
            SkillDefinition skill = skillCreatorService.finalizeSkill(request.getSkillData());
            return ResponseEntity.ok(Map.of("code", 200, "data", toDTO(skill), "message", "创建成功"));
        } catch (IllegalArgumentException e) {
            log.error("完成创建失败: {}", e.getMessage());
            return ResponseEntity.status(400).body(errorBody(400, e.getMessage()));
        } catch (RuntimeException e) {
            log.error("完成创建失败: {}", e.getMessage());
            return ResponseEntity.status(401).body(errorBody(401, e.getMessage()));
        } catch (Exception e) {
            log.error("完成创建异常: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(errorBody(500, "服务器内部错误"));
        }
    }
    
    /**
     * 获取可用MCP工具列表
     * Mentis(8082) 不可用时返回空列表，不 500，保证技能创建器可正常使用。
     */
    @GetMapping("/creator/mcp-tools")
    public ResponseEntity<Map<String, Object>> getMcpTools(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            validateAdmin(authHeader);
            var tools = mcpToolValidator.getAvailableTools();
            return ResponseEntity.ok(Map.of("code", 200, "data", tools != null ? tools : java.util.Collections.emptyList(), "message", "success"));
        } catch (RuntimeException e) {
            if (e.getMessage() != null && (e.getMessage().contains("token") || e.getMessage().contains("认证") || e.getMessage().contains("登录"))) {
                log.error("获取MCP工具列表失败: {}", e.getMessage());
                return ResponseEntity.status(401).body(errorBody(401, e.getMessage()));
            }
            log.warn("获取MCP工具列表失败（Mentis 可能未启动），返回空列表: {}", e.getMessage());
            return ResponseEntity.ok(Map.of("code", 200, "data", java.util.Collections.emptyList(), "message", "success"));
        } catch (Exception e) {
            log.warn("获取MCP工具列表异常，返回空列表: {}", e.getMessage());
            return ResponseEntity.ok(Map.of("code", 200, "data", java.util.Collections.emptyList(), "message", "success"));
        }
    }
    
    /**
     * 验证MCP工具可用性
     */
    @PostMapping("/creator/validate-mcp-tool")
    public ResponseEntity<Map<String, Object>> validateMcpTool(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestBody Map<String, Object> request) {
        try {
            validateAdmin(authHeader);
            Long mcpConfigId = Long.valueOf(request.get("mcpConfigId").toString());
            @SuppressWarnings("unchecked")
            List<String> toolNames = (List<String>) request.get("toolNames");
            
            var result = mcpToolValidator.validateToolAvailability(mcpConfigId, toolNames);
            
            Map<String, Object> resultMap = new HashMap<>();
            resultMap.put("valid", result.isValid());
            resultMap.put("errors", result.getErrors());
            resultMap.put("warnings", result.getWarnings());
            
            return ResponseEntity.ok(Map.of("code", 200, "data", resultMap, "message", "success"));
        } catch (RuntimeException e) {
            log.error("验证MCP工具失败: {}", e.getMessage());
            return ResponseEntity.status(401).body(errorBody(401, e.getMessage()));
        } catch (Exception e) {
            log.error("验证MCP工具异常: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(errorBody(500, "服务器内部错误"));
        }
    }
    
    /**
     * 从描述生成技能（AI生成）
     */
    @PostMapping("/creator/generate-from-description")
    public ResponseEntity<Map<String, Object>> generateSkillFromDescription(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestBody Map<String, Object> request) {
        try {
            validateAdmin(authHeader);
            String sessionId = (String) request.getOrDefault("sessionId", "");
            String description = (String) request.get("description");
            
            log.info("[技能创建] 收到生成请求: sessionId={}, descriptionLength={}, description={}",
                    sessionId, description != null ? description.length() : 0, description);
            
            if (description == null || description.trim().isEmpty()) {
                log.warn("[技能创建] 描述为空，返回400");
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("code", 400);
                errorResponse.put("message", "描述不能为空");
                errorResponse.put("data", null);
                return ResponseEntity.status(400).body(errorResponse);
            }
            
            // 从请求头提取认证Token，用于调用AI服务
            String authToken = null;
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                authToken = authHeader.substring(7);
            }
            
            Map<String, Object> skillDefinition = skillCreatorService.generateSkillFromDescription(description, sessionId, authToken);
            
            // 返回前端的 data 为完整技能对象（含所有字段值），此处仅日志打印摘要便于排查
            Object desc = skillDefinition.get("description");
            Object instr = skillDefinition.get("instruction");
            log.info("[技能创建] 生成成功，返回前端的 data 为完整技能对象: skillId={}, name={}, descriptionLength={}, instructionLength={}, 全部字段={}",
                    skillDefinition.get("skillId"), skillDefinition.get("name"),
                    desc != null ? desc.toString().length() : 0,
                    instr != null ? instr.toString().length() : 0,
                    skillDefinition.keySet());
            return ResponseEntity.ok(Map.of("code", 200, "data", skillDefinition, "message", "生成成功"));
        } catch (RuntimeException e) {
            log.error("[技能创建] AI生成技能失败: {}", e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("code", 500);
            errorResponse.put("message", e.getMessage());
            errorResponse.put("data", null);
            return ResponseEntity.status(500).body(errorResponse);
        } catch (Exception e) {
            log.error("[技能创建] AI生成技能异常: {}", e.getMessage(), e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("code", 500);
            errorResponse.put("message", "服务器内部错误: " + e.getMessage());
            errorResponse.put("data", null);
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
    
    /**
     * 从文件内容解析技能（文件导入）
     */
    @PostMapping("/creator/parse-from-content")
    public ResponseEntity<Map<String, Object>> parseSkillFromMdContent(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestBody Map<String, Object> request) {
        try {
            validateAdmin(authHeader);
            String sessionId = (String) request.getOrDefault("sessionId", "");
            String content = (String) request.get("content");
            
            if (content == null || content.trim().isEmpty()) {
                return ResponseEntity.status(400).body(Map.of(
                    "code", 400, 
                    "message", "内容不能为空", 
                    "data", null
                ));
            }
            
            Map<String, Object> skillDefinition = skillCreatorService.parseSkillFromMdContent(content, sessionId);
            
            return ResponseEntity.ok(Map.of("code", 200, "data", skillDefinition, "message", "解析成功"));
        } catch (RuntimeException e) {
            log.error("解析技能文件失败: {}", e.getMessage());
            return ResponseEntity.status(401).body(errorBody(401, e.getMessage()));
        } catch (Exception e) {
            log.error("解析技能文件异常: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(errorBody(500, "服务器内部错误: " + (e.getMessage() != null ? e.getMessage() : "")));
        }
    }
    
    /**
     * 从上传的文件解析技能（文件导入）
     */
    @PostMapping("/creator/parse-from-file")
    public ResponseEntity<Map<String, Object>> parseSkillFromMdFile(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestParam("file") org.springframework.web.multipart.MultipartFile file,
            @RequestParam(value = "sessionId", required = false) String sessionId) {
        try {
            validateAdmin(authHeader);
            
            if (file == null || file.isEmpty()) {
                return ResponseEntity.status(400).body(Map.of(
                    "code", 400, 
                    "message", "文件不能为空", 
                    "data", null
                ));
            }
            
            // 验证文件类型
            String filename = file.getOriginalFilename();
            if (filename == null || !filename.toLowerCase().endsWith(".md")) {
                return ResponseEntity.status(400).body(Map.of(
                    "code", 400, 
                    "message", "只支持 .md 文件", 
                    "data", null
                ));
            }
            
            // 验证文件大小（最大1MB）
            if (file.getSize() > 1024 * 1024) {
                return ResponseEntity.status(400).body(Map.of(
                    "code", 400, 
                    "message", "文件大小不能超过1MB", 
                    "data", null
                ));
            }
            
            // 读取文件内容
            String content = new String(file.getBytes(), java.nio.charset.StandardCharsets.UTF_8);
            
            // 解析内容
            Map<String, Object> skillDefinition = skillCreatorService.parseSkillFromMdContent(content, sessionId != null ? sessionId : "");
            
            return ResponseEntity.ok(Map.of("code", 200, "data", skillDefinition, "message", "解析成功"));
        } catch (RuntimeException e) {
            log.error("解析技能文件失败: {}", e.getMessage());
            return ResponseEntity.status(401).body(errorBody(401, e.getMessage()));
        } catch (Exception e) {
            log.error("解析技能文件异常: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(errorBody(500, "服务器内部错误: " + (e.getMessage() != null ? e.getMessage() : "")));
        }
    }
    
    /**
     * 获取模板列表
     */
    @GetMapping("/creator/templates")
    public ResponseEntity<Map<String, Object>> getTemplates(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            validateAdmin(authHeader);
            var templates = skillTemplateService.getAllTemplates();
            return ResponseEntity.ok(Map.of("code", 200, "data", templates, "message", "success"));
        } catch (RuntimeException e) {
            log.error("获取模板列表失败: {}", e.getMessage());
            return ResponseEntity.status(401).body(errorBody(401, e.getMessage()));
        } catch (Exception e) {
            log.error("获取模板列表异常: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(errorBody(500, "服务器内部错误"));
        }
    }
    
    /**
     * 根据分类获取模板
     */
    @GetMapping("/creator/templates/{category}")
    public ResponseEntity<Map<String, Object>> getTemplatesByCategory(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable String category) {
        try {
            validateAdmin(authHeader);
            var templates = skillTemplateService.getTemplatesByCategory(category);
            return ResponseEntity.ok(Map.of("code", 200, "data", templates, "message", "success"));
        } catch (RuntimeException e) {
            log.error("获取分类模板失败: {}", e.getMessage());
            return ResponseEntity.status(401).body(errorBody(401, e.getMessage()));
        } catch (Exception e) {
            log.error("获取分类模板异常: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(errorBody(500, "服务器内部错误"));
        }
    }
    
    /**
     * 分析技能质量
     */
    @PostMapping("/creator/analyze-quality")
    public ResponseEntity<Map<String, Object>> analyzeQuality(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestBody SkillCreatorRequest request) {
        try {
            validateAdmin(authHeader);
            var qualityReport = skillCreatorService.analyzeQuality(request.getSkillData());
            
            SkillQualityReportDTO dto = new SkillQualityReportDTO();
            dto.setTotalScore(qualityReport.getTotalScore());
            dto.setDescriptionScore(qualityReport.getDescriptionScore());
            dto.setDescriptionLevel(qualityReport.getDescriptionLevel());
            dto.setDescriptionSuggestions(qualityReport.getDescriptionSuggestions());
            dto.setCompletenessScore(qualityReport.getCompletenessScore());
            dto.setMissingFields(qualityReport.getMissingFields());
            dto.setCompletenessSuggestions(qualityReport.getCompletenessSuggestions());
            
            return ResponseEntity.ok(Map.of("code", 200, "data", dto, "message", "success"));
        } catch (RuntimeException e) {
            log.error("分析技能质量失败: {}", e.getMessage());
            return ResponseEntity.status(401).body(errorBody(401, e.getMessage()));
        } catch (Exception e) {
            log.error("分析技能质量异常: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(errorBody(500, "服务器内部错误"));
        }
    }
    
    // ============================================
    // Skill Resource Management 相关接口
    // ============================================
    
    /**
     * 上传技能资源
     */
    @PostMapping("/{skillId}/resources")
    public ResponseEntity<Map<String, Object>> uploadResource(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable String skillId,
            @RequestParam("file") org.springframework.web.multipart.MultipartFile file,
            @RequestParam("resourceType") String resourceType,
            @RequestParam(value = "description", required = false) String description) {
        try {
            validateAdmin(authHeader);
            
            com.heartsphere.admin.entity.skill.SkillResource resource = skillResourceService.uploadResource(skillId, file, resourceType, description);
            
            Map<String, Object> resourceData = new HashMap<>();
            resourceData.put("id", resource.getId());
            resourceData.put("skillId", resource.getSkillId());
            resourceData.put("resourceType", resource.getResourceType());
            resourceData.put("resourceName", resource.getResourceName());
            resourceData.put("fileName", resource.getFileName());
            resourceData.put("filePath", resource.getFilePath());
            resourceData.put("fileSize", resource.getFileSize());
            resourceData.put("mimeType", resource.getMimeType());
            resourceData.put("description", resource.getDescription());
            resourceData.put("orderIndex", resource.getOrderIndex());
            resourceData.put("createdAt", resource.getCreatedAt());
            
            return ResponseEntity.ok(Map.of("code", 200, "data", resourceData, "message", "资源上传成功"));
        } catch (RuntimeException e) {
            log.error("上传资源失败: {}", e.getMessage());
            return ResponseEntity.status(401).body(errorBody(401, e.getMessage()));
        } catch (Exception e) {
            log.error("上传资源异常: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(errorBody(500, "服务器内部错误: " + (e.getMessage() != null ? e.getMessage() : "")));
        }
    }
    
    /**
     * 获取技能资源列表
     */
    @GetMapping("/{skillId}/resources")
    public ResponseEntity<Map<String, Object>> getResources(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable String skillId,
            @RequestParam(value = "resourceType", required = false) String resourceType) {
        try {
            validateAdmin(authHeader);
            
            List<com.heartsphere.admin.entity.skill.SkillResource> resources;
            if (resourceType != null && !resourceType.isEmpty()) {
                resources = skillResourceService.getResourcesByType(skillId, resourceType);
            } else {
                resources = skillResourceService.getResourcesBySkillId(skillId);
            }
            
            List<Map<String, Object>> resourceList = resources.stream().map(resource -> {
                Map<String, Object> data = new HashMap<>();
                data.put("id", resource.getId());
                data.put("skillId", resource.getSkillId());
                data.put("resourceType", resource.getResourceType());
                data.put("resourceName", resource.getResourceName());
                data.put("fileName", resource.getFileName());
                data.put("filePath", resource.getFilePath());
                data.put("fileSize", resource.getFileSize());
                data.put("mimeType", resource.getMimeType());
                data.put("description", resource.getDescription());
                data.put("orderIndex", resource.getOrderIndex());
                data.put("createdAt", resource.getCreatedAt());
                data.put("updatedAt", resource.getUpdatedAt());
                return data;
            }).collect(Collectors.toList());
            
            return ResponseEntity.ok(Map.of("code", 200, "data", resourceList, "message", "success"));
        } catch (RuntimeException e) {
            log.error("获取资源列表失败: {}", e.getMessage());
            return ResponseEntity.status(401).body(errorBody(401, e.getMessage()));
        } catch (Exception e) {
            log.error("获取资源列表异常: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(errorBody(500, "服务器内部错误"));
        }
    }
    
    /**
     * 删除技能资源
     */
    @DeleteMapping("/{skillId}/resources/{resourceId}")
    public ResponseEntity<Map<String, Object>> deleteResource(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable String skillId,
            @PathVariable Long resourceId) {
        try {
            validateAdmin(authHeader);
            
            skillResourceService.deleteResource(skillId, resourceId);
            
            return ResponseEntity.ok(errorBody(200, "资源删除成功"));
        } catch (RuntimeException e) {
            log.error("删除资源失败: {}", e.getMessage());
            return ResponseEntity.status(401).body(errorBody(401, e.getMessage()));
        } catch (Exception e) {
            log.error("删除资源异常: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(errorBody(500, "服务器内部错误: " + (e.getMessage() != null ? e.getMessage() : "")));
        }
    }
    
    /**
     * 更新资源描述
     */
    @PutMapping("/{skillId}/resources/{resourceId}")
    public ResponseEntity<Map<String, Object>> updateResource(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable String skillId,
            @PathVariable Long resourceId,
            @RequestBody Map<String, String> request) {
        try {
            validateAdmin(authHeader);
            
            String description = request.get("description");
            Integer orderIndex = request.containsKey("orderIndex") ? Integer.parseInt(request.get("orderIndex")) : null;
            
            com.heartsphere.admin.entity.skill.SkillResource resource;
            if (description != null) {
                resource = skillResourceService.updateResourceDescription(skillId, resourceId, description);
            } else if (orderIndex != null) {
                resource = skillResourceService.updateResourceOrder(skillId, resourceId, orderIndex);
            } else {
                return ResponseEntity.status(400).body(errorBody(400, "请提供 description 或 orderIndex"));
            }
            
            Map<String, Object> resourceData = new HashMap<>();
            resourceData.put("id", resource.getId());
            resourceData.put("skillId", resource.getSkillId());
            resourceData.put("resourceType", resource.getResourceType());
            resourceData.put("resourceName", resource.getResourceName());
            resourceData.put("description", resource.getDescription());
            resourceData.put("orderIndex", resource.getOrderIndex());
            resourceData.put("updatedAt", resource.getUpdatedAt());
            
            return ResponseEntity.ok(Map.of("code", 200, "data", resourceData, "message", "资源更新成功"));
        } catch (RuntimeException e) {
            log.error("更新资源失败: {}", e.getMessage());
            return ResponseEntity.status(401).body(errorBody(401, e.getMessage()));
        } catch (Exception e) {
            log.error("更新资源异常: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(errorBody(500, "服务器内部错误: " + (e.getMessage() != null ? e.getMessage() : "")));
        }
    }
    
    // ============================================
    // Skill Enhanced Validation 相关接口
    // ============================================
    
    /**
     * 增强验证技能
     */
    @PostMapping("/{skillId}/validate-enhanced")
    public ResponseEntity<Map<String, Object>> validateEnhanced(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable String skillId) {
        try {
            validateAdmin(authHeader);
            
            SkillDefinition skill = skillDefinitionRepository.findBySkillId(skillId)
                .orElseThrow(() -> new RuntimeException("技能不存在: " + skillId));
            
            com.heartsphere.admin.dto.skill.SkillEnhancedValidationResultDTO result = 
                skillValidationService.validateEnhanced(skill);
            
            Map<String, Object> resultData = new HashMap<>();
            resultData.put("valid", result.isValid());
            resultData.put("basicValidation", convertValidationSection(result.getBasicValidation()));
            resultData.put("structureValidation", convertValidationSection(result.getStructureValidation()));
            resultData.put("qualityValidation", convertValidationSection(result.getQualityValidation()));
            resultData.put("progressiveDisclosureValidation", convertValidationSection(result.getProgressiveDisclosureValidation()));
            resultData.put("allErrors", result.getAllErrors());
            resultData.put("allWarnings", result.getAllWarnings());
            
            return ResponseEntity.ok(Map.of("code", 200, "data", resultData, "message", "验证完成"));
        } catch (RuntimeException e) {
            log.error("增强验证失败: {}", e.getMessage());
            return ResponseEntity.status(401).body(errorBody(401, e.getMessage()));
        } catch (Exception e) {
            String msg = e.getMessage() != null ? e.getMessage() : e.getClass().getSimpleName();
            log.error("增强验证异常: {}", msg, e);
            return ResponseEntity.status(500).body(errorBody(500, "服务器内部错误: " + (msg != null ? msg : "")));
        }
    }
    
    private Map<String, Object> convertValidationSection(
            com.heartsphere.admin.dto.skill.SkillEnhancedValidationResultDTO.ValidationSection section) {
        Map<String, Object> map = new HashMap<>();
        if (section == null) {
            map.put("passed", true);
            map.put("errors", List.of());
            map.put("warnings", List.of());
            return map;
        }
        map.put("passed", section.isPassed());
        map.put("errors", section.getErrors() != null ? section.getErrors() : List.of());
        map.put("warnings", section.getWarnings() != null ? section.getWarnings() : List.of());
        return map;
    }
    
    // ============================================
    // Skill Migration 相关接口
    // ============================================
    
    /**
     * 分析需要迁移的技能
     */
    @GetMapping("/migration/analyze")
    public ResponseEntity<Map<String, Object>> analyzeMigration(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            validateAdmin(authHeader);
            var analysis = skillMigrationService.analyzeSkills();
            
            // 转换为DTO格式
            Map<String, Object> result = new HashMap<>();
            result.put("totalSkills", analysis.getTotalSkills());
            result.put("migrationCount", analysis.getMigrationCount());
            result.put("skillsToMigrate", analysis.getSkillsToMigrate().stream()
                .map(info -> {
                    Map<String, Object> skillInfo = new HashMap<>();
                    skillInfo.put("skillId", info.getSkillId());
                    skillInfo.put("name", info.getName());
                    skillInfo.put("missingFields", info.getMissingFields());
                    skillInfo.put("issues", info.getIssues());
                    // 已移除：hasFunctionSchema（旧格式已不再支持）
                    skillInfo.put("hasMcpToolConfig", 
                        info.getCurrentSkill() != null && 
                        info.getCurrentSkill().getMcpToolConfig() != null && 
                        !info.getCurrentSkill().getMcpToolConfig().isEmpty());
                    return skillInfo;
                })
                .collect(Collectors.toList()));
            
            return ResponseEntity.ok(Map.of("code", 200, "data", result, "message", "分析完成"));
        } catch (RuntimeException e) {
            log.error("分析迁移失败: {}", e.getMessage());
            return ResponseEntity.status(401).body(errorBody(401, e.getMessage()));
        } catch (Exception e) {
            log.error("分析迁移异常: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(errorBody(500, "服务器内部错误"));
        }
    }
    
    /**
     * 迁移单个技能
     */
    @PostMapping("/migration/migrate/{skillId}")
    public ResponseEntity<Map<String, Object>> migrateSkill(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable String skillId) {
        try {
            validateAdmin(authHeader);
            var result = skillMigrationService.migrateSkill(skillId);
            
            Map<String, Object> resultData = new HashMap<>();
            resultData.put("success", result.isSuccess());
            resultData.put("skillId", result.getSkillId());
            resultData.put("message", result.getMessage());
            if (result.getValidationResult() != null) {
                Map<String, Object> validation = new HashMap<>();
                validation.put("valid", result.getValidationResult().isValid());
                validation.put("errors", result.getValidationResult().getErrors());
                validation.put("warnings", result.getValidationResult().getWarnings());
                resultData.put("validation", validation);
            }
            
            return ResponseEntity.ok(Map.of("code", 200, "data", resultData, "message", result.getMessage()));
        } catch (IllegalArgumentException e) {
            log.error("迁移技能失败: {}", e.getMessage());
            return ResponseEntity.status(400).body(errorBody(400, e.getMessage()));
        } catch (RuntimeException e) {
            log.error("迁移技能失败: {}", e.getMessage());
            return ResponseEntity.status(401).body(errorBody(401, e.getMessage()));
        } catch (Exception e) {
            log.error("迁移技能异常: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(errorBody(500, "服务器内部错误"));
        }
    }
    
    /**
     * 批量迁移技能
     */
    @PostMapping("/migration/migrate-batch")
    public ResponseEntity<Map<String, Object>> migrateSkillsBatch(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestBody Map<String, Object> request) {
        try {
            validateAdmin(authHeader);
            
            @SuppressWarnings("unchecked")
            List<String> skillIds = (List<String>) request.get("skillIds");
            if (skillIds == null || skillIds.isEmpty()) {
                return ResponseEntity.status(400).body(errorBody(400, "技能ID列表不能为空"));
            }
            
            var results = skillMigrationService.migrateSkills(skillIds);
            
            // 统计结果
            long successCount = results.stream().filter(SkillMigrationService.MigrationResult::isSuccess).count();
            long failureCount = results.size() - successCount;
            
            Map<String, Object> resultData = new HashMap<>();
            resultData.put("total", results.size());
            resultData.put("success", successCount);
            resultData.put("failure", failureCount);
            resultData.put("results", results.stream()
                .map(result -> {
                    Map<String, Object> r = new HashMap<>();
                    r.put("success", result.isSuccess());
                    r.put("skillId", result.getSkillId());
                    r.put("message", result.getMessage());
                    return r;
                })
                .collect(Collectors.toList()));
            
            return ResponseEntity.ok(Map.of("code", 200, "data", resultData, "message", 
                String.format("批量迁移完成，成功: %d, 失败: %d", successCount, failureCount)));
        } catch (RuntimeException e) {
            log.error("批量迁移失败: {}", e.getMessage());
            return ResponseEntity.status(401).body(errorBody(401, e.getMessage()));
        } catch (Exception e) {
            log.error("批量迁移异常: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(errorBody(500, "服务器内部错误"));
        }
    }
}
