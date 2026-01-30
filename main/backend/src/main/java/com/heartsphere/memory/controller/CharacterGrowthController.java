package com.heartsphere.memory.controller;

import com.heartsphere.memory.entity.CharacterGrowthEventEntity;
import com.heartsphere.memory.entity.CharacterRelationshipMilestoneEntity;
import com.heartsphere.memory.entity.CharacterMentorshipSessionEntity;
import com.heartsphere.memory.repository.jpa.CharacterRelationshipMilestoneRepository;
import com.heartsphere.memory.service.CharacterGrowthService;
import com.heartsphere.memory.service.CharacterCompanionshipService;
import com.heartsphere.memory.service.CharacterMentorshipService;
import com.heartsphere.memory.service.ContextAwarenessService;
import com.heartsphere.memory.service.CharacterModeSwitchService;
import com.heartsphere.memory.util.RelationshipDepthCalculator;
import com.heartsphere.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 角色成长系统控制器
 * 提供角色自我成长、挚友能力和导师能力的API接口
 * 
 * @author HeartSphere
 * @date 2026-01-25
 */
@Slf4j
@RestController
@RequestMapping("/api/memory/v1/character")
@RequiredArgsConstructor
@Tag(name = "角色成长系统", description = "角色自我成长、挚友能力和导师能力相关API")
public class CharacterGrowthController {
    
    private final CharacterGrowthService growthService;
    private final CharacterCompanionshipService companionshipService;
    private final CharacterMentorshipService mentorshipService;
    private final CharacterRelationshipMilestoneRepository milestoneRepository;
    private final ContextAwarenessService contextAwarenessService;
    private final CharacterModeSwitchService modeSwitchService;
    
    // ========== 成长相关API ==========
    
    @GetMapping("/{characterId}/growth")
    @Operation(summary = "获取角色成长信息", description = "获取角色的成长轨迹和统计信息")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getCharacterGrowth(
            @PathVariable Long characterId,
            @RequestParam Long userId) {
        try {
            Map<String, Object> trajectory = growthService.getGrowthTrajectory(characterId, userId);
            return ResponseEntity.ok(ApiResponse.success(trajectory));
        } catch (Exception e) {
            log.error("获取角色成长信息失败: characterId={}, userId={}", characterId, userId, e);
            return ResponseEntity.ok(ApiResponse.error("获取角色成长信息失败: " + e.getMessage()));
        }
    }
    
    @GetMapping("/{characterId}/growth/trajectory")
    @Operation(summary = "获取成长轨迹", description = "获取角色的详细成长轨迹")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getGrowthTrajectory(
            @PathVariable Long characterId,
            @RequestParam Long userId) {
        try {
            Map<String, Object> trajectory = growthService.getGrowthTrajectory(characterId, userId);
            return ResponseEntity.ok(ApiResponse.success(trajectory));
        } catch (Exception e) {
            log.error("获取成长轨迹失败: characterId={}, userId={}", characterId, userId, e);
            return ResponseEntity.ok(ApiResponse.error("获取成长轨迹失败: " + e.getMessage()));
        }
    }
    
    @PostMapping("/{characterId}/growth/reflect")
    @Operation(summary = "触发自我反思", description = "触发角色进行自我反思")
    public ResponseEntity<ApiResponse<String>> triggerSelfReflection(
            @PathVariable Long characterId,
            @RequestParam Long userId,
            @RequestParam(required = false, defaultValue = "AUTO") String reflectionType) {
        try {
            growthService.triggerSelfReflection(characterId, userId, reflectionType);
            return ResponseEntity.ok(ApiResponse.success("自我反思已触发"));
        } catch (Exception e) {
            log.error("触发自我反思失败: characterId={}, userId={}", characterId, userId, e);
            return ResponseEntity.ok(ApiResponse.error("触发自我反思失败: " + e.getMessage()));
        }
    }
    
    // ========== 关系相关API ==========
    
    @GetMapping("/{characterId}/relationship")
    @Operation(summary = "获取关系信息", description = "获取角色与用户的关系信息和阶段")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getRelationshipInfo(
            @PathVariable Long characterId,
            @RequestParam Long userId) {
        try {
            Map<String, Object> info = companionshipService.getRelationshipInfo(characterId, userId);
            return ResponseEntity.ok(ApiResponse.success(info));
        } catch (Exception e) {
            log.error("获取关系信息失败: characterId={}, userId={}", characterId, userId, e);
            return ResponseEntity.ok(ApiResponse.error("获取关系信息失败: " + e.getMessage()));
        }
    }
    
    @GetMapping("/{characterId}/relationship/milestones")
    @Operation(summary = "获取关系里程碑", description = "获取角色与用户的关系里程碑列表")
    public ResponseEntity<ApiResponse<List<CharacterRelationshipMilestoneEntity>>> getRelationshipMilestones(
            @PathVariable Long characterId,
            @RequestParam Long userId) {
        try {
            List<CharacterRelationshipMilestoneEntity> milestones =
                    milestoneRepository.findByCharacterIdAndUserIdOrderByCreatedAtDesc(characterId, userId);
            return ResponseEntity.ok(ApiResponse.success(milestones));
        } catch (Exception e) {
            log.error("获取关系里程碑失败: characterId={}, userId={}", characterId, userId, e);
            return ResponseEntity.ok(ApiResponse.error("获取关系里程碑失败: " + e.getMessage()));
        }
    }
    
    @GetMapping("/{characterId}/relationship/depth")
    @Operation(summary = "获取关系深度", description = "计算并获取角色与用户的关系深度")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getRelationshipDepth(
            @PathVariable Long characterId,
            @RequestParam Long userId,
            @RequestParam(required = false, defaultValue = "0") int interactionCount,
            @RequestParam(required = false, defaultValue = "0") int emotionalConnectionScore,
            @RequestParam(required = false, defaultValue = "0") int sharedExperienceCount,
            @RequestParam(required = false, defaultValue = "0.5") double positiveFeedbackRatio,
            @RequestParam(required = false, defaultValue = "1") long daysSinceFirstInteraction) {
        try {
            RelationshipDepthCalculator.RelationshipStage stage = 
                    companionshipService.calculateAndUpdateRelationshipStage(
                            characterId, userId, interactionCount, emotionalConnectionScore,
                            sharedExperienceCount, positiveFeedbackRatio, daysSinceFirstInteraction);
            
            Map<String, Object> result = Map.of(
                    "characterId", characterId,
                    "userId", userId,
                    "stage", stage.name(),
                    "stageName", stage.getName()
            );
            
            return ResponseEntity.ok(ApiResponse.success(result));
        } catch (Exception e) {
            log.error("获取关系深度失败: characterId={}, userId={}", characterId, userId, e);
            return ResponseEntity.ok(ApiResponse.error("获取关系深度失败: " + e.getMessage()));
        }
    }
    
    // ========== 导师相关API ==========
    
    @GetMapping("/{characterId}/mentorship/capabilities")
    @Operation(summary = "获取导师能力", description = "获取角色的导师能力评估结果")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getMentorshipCapabilities(
            @PathVariable Long characterId) {
        try {
            Map<String, Object> capabilities = mentorshipService.evaluateMentorshipCapabilities(characterId);
            return ResponseEntity.ok(ApiResponse.success(capabilities));
        } catch (Exception e) {
            log.error("获取导师能力失败: characterId={}", characterId, e);
            return ResponseEntity.ok(ApiResponse.error("获取导师能力失败: " + e.getMessage()));
        }
    }
    
    @PostMapping("/{characterId}/mentorship/sessions")
    @Operation(summary = "创建指导会话", description = "创建新的导师指导会话")
    public ResponseEntity<ApiResponse<CharacterMentorshipSessionEntity>> createMentorshipSession(
            @PathVariable Long characterId,
            @RequestParam Long userId,
            @RequestParam String sessionType,
            @RequestParam String title,
            @RequestParam(required = false) String content,
            @RequestBody(required = false) List<String> learningObjectives) {
        try {
            CharacterMentorshipSessionEntity session = mentorshipService.createMentorshipSession(
                    characterId, userId, sessionType, title, content, learningObjectives);
            return ResponseEntity.ok(ApiResponse.success(session));
        } catch (Exception e) {
            log.error("创建指导会话失败: characterId={}, userId={}", characterId, userId, e);
            return ResponseEntity.ok(ApiResponse.error("创建指导会话失败: " + e.getMessage()));
        }
    }
    
    @GetMapping("/{characterId}/mentorship/sessions")
    @Operation(summary = "获取指导会话列表", description = "获取角色与用户的指导会话列表")
    public ResponseEntity<ApiResponse<List<CharacterMentorshipSessionEntity>>> getMentorshipSessions(
            @PathVariable Long characterId,
            @RequestParam Long userId,
            @RequestParam(required = false, defaultValue = "false") boolean activeOnly) {
        try {
            List<CharacterMentorshipSessionEntity> sessions;
            if (activeOnly) {
                sessions = mentorshipService.getActiveMentorshipSessions(characterId, userId);
            } else {
                sessions = mentorshipService.getMentorshipSessions(characterId, userId);
            }
            return ResponseEntity.ok(ApiResponse.success(sessions));
        } catch (Exception e) {
            log.error("获取指导会话列表失败: characterId={}, userId={}", characterId, userId, e);
            return ResponseEntity.ok(ApiResponse.error("获取指导会话列表失败: " + e.getMessage()));
        }
    }
    
    @PostMapping("/{characterId}/mentorship/plan")
    @Operation(summary = "创建成长计划", description = "为用户创建成长规划")
    public ResponseEntity<ApiResponse<CharacterMentorshipSessionEntity>> createGrowthPlan(
            @PathVariable Long characterId,
            @RequestParam Long userId,
            @RequestParam String planTitle,
            @RequestBody List<Map<String, Object>> milestones) {
        try {
            CharacterMentorshipSessionEntity session = mentorshipService.createGrowthPlan(
                    characterId, userId, planTitle, milestones);
            return ResponseEntity.ok(ApiResponse.success(session));
        } catch (Exception e) {
            log.error("创建成长计划失败: characterId={}, userId={}", characterId, userId, e);
            return ResponseEntity.ok(ApiResponse.error("创建成长计划失败: " + e.getMessage()));
        }
    }
    
    // ========== 情境感知和模式切换API ==========
    
    @PostMapping("/{characterId}/context/analyze")
    @Operation(summary = "分析对话情境", description = "分析对话情境并推荐响应模式")
    public ResponseEntity<ApiResponse<Map<String, Object>>> analyzeContext(
            @PathVariable Long characterId,
            @RequestParam Long userId,
            @RequestParam String userMessage,
            @RequestParam(required = false) String userEmotionState,
            @RequestBody(required = false) List<String> conversationHistory) {
        try {
            Map<String, Object> context = contextAwarenessService.analyzeContext(
                    userMessage, conversationHistory, userEmotionState);
            return ResponseEntity.ok(ApiResponse.success(context));
        } catch (Exception e) {
            log.error("分析对话情境失败: characterId={}, userId={}", characterId, userId, e);
            return ResponseEntity.ok(ApiResponse.error("分析对话情境失败: " + e.getMessage()));
        }
    }
    
    @PostMapping("/{characterId}/mode/switch")
    @Operation(summary = "智能模式切换", description = "根据情境智能切换角色响应模式")
    public ResponseEntity<ApiResponse<Map<String, Object>>> switchMode(
            @PathVariable Long characterId,
            @RequestParam Long userId,
            @RequestParam String userMessage,
            @RequestParam(required = false) String currentMode,
            @RequestParam(required = false) String userEmotionState,
            @RequestBody(required = false) List<String> conversationHistory) {
        try {
            ContextAwarenessService.ResponseMode current = 
                    currentMode != null ? 
                    ContextAwarenessService.ResponseMode.valueOf(currentMode) : null;
            
            Map<String, Object> result = modeSwitchService.intelligentModeSwitch(
                    characterId, userId, userMessage, conversationHistory, 
                    userEmotionState, current);
            
            return ResponseEntity.ok(ApiResponse.success(result));
        } catch (Exception e) {
            log.error("模式切换失败: characterId={}, userId={}", characterId, userId, e);
            return ResponseEntity.ok(ApiResponse.error("模式切换失败: " + e.getMessage()));
        }
    }
}
