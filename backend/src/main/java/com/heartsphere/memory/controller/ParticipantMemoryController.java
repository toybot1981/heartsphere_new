package com.heartsphere.memory.controller;

import com.heartsphere.dto.ApiResponse;
import com.heartsphere.memory.model.participant.*;
import com.heartsphere.memory.service.ParticipantMemoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 参与者记忆系统REST API控制器（v3）
 * 
 * @author HeartSphere
 * @date 2025-12-29
 */
@RestController
@RequestMapping("/api/memory/v3")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "参与者记忆系统API", description = "参与者记忆系统的REST API接口（v3）")
public class ParticipantMemoryController {
    
    private final ParticipantMemoryService participantMemoryService;
    
    // ========== 参与者身份记忆API ==========
    
    @Operation(summary = "保存参与者身份记忆", description = "保存参与者在系统中的身份、角色、权限等信息")
    @PostMapping("/participants/{participantId}/identity-memories")
    public ResponseEntity<ApiResponse<ParticipantIdentityMemory>> saveIdentityMemory(
            @Parameter(description = "参与者ID") @PathVariable String participantId,
            @RequestBody ParticipantIdentityMemory memory,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            memory.setParticipantId(participantId);
            ParticipantIdentityMemory saved = participantMemoryService.saveIdentityMemory(memory);
            return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(saved));
        } catch (Exception e) {
            log.error("保存参与者身份记忆失败: participantId={}", participantId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("保存参与者身份记忆失败: " + e.getMessage()));
        }
    }
    
    @Operation(summary = "获取参与者身份记忆", description = "获取参与者的身份记忆")
    @GetMapping("/participants/{participantId}/identity-memories")
    public ResponseEntity<ApiResponse<ParticipantIdentityMemory>> getIdentityMemory(
            @Parameter(description = "参与者ID") @PathVariable String participantId,
            @Parameter(description = "场景ID（可选）") @RequestParam(required = false) String sceneId,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            ParticipantIdentityMemory memory;
            if (sceneId != null) {
                memory = participantMemoryService.getIdentityMemory(participantId, sceneId);
            } else {
                memory = participantMemoryService.getIdentityMemory(participantId);
            }
            
            if (memory == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("参与者身份记忆不存在"));
            }
            
            return ResponseEntity.ok(ApiResponse.success(memory));
        } catch (Exception e) {
            log.error("获取参与者身份记忆失败: participantId={}", participantId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("获取参与者身份记忆失败: " + e.getMessage()));
        }
    }
    
    // ========== 参与者交互记忆API ==========
    
    @Operation(summary = "保存参与者交互记忆", description = "保存参与者之间的交互记忆")
    @PostMapping("/participants/{participantId}/interaction-memories")
    public ResponseEntity<ApiResponse<ParticipantInteractionMemory>> saveInteractionMemory(
            @Parameter(description = "参与者ID") @PathVariable String participantId,
            @RequestBody ParticipantInteractionMemory memory,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            memory.setParticipantId(participantId);
            ParticipantInteractionMemory saved = participantMemoryService.saveInteractionMemory(memory);
            return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(saved));
        } catch (Exception e) {
            log.error("保存参与者交互记忆失败: participantId={}", participantId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("保存参与者交互记忆失败: " + e.getMessage()));
        }
    }
    
    @Operation(summary = "获取参与者交互记忆", description = "获取参与者的交互记忆")
    @GetMapping("/participants/{participantId}/interaction-memories")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getInteractionMemories(
            @Parameter(description = "参与者ID") @PathVariable String participantId,
            @Parameter(description = "关联参与者ID（可选）") @RequestParam(required = false) String relatedParticipantId,
            @Parameter(description = "场景ID（可选）") @RequestParam(required = false) String sceneId,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            List<ParticipantInteractionMemory> memories;
            if (relatedParticipantId != null) {
                memories = participantMemoryService.getInteractionMemories(participantId, relatedParticipantId);
            } else if (sceneId != null) {
                memories = participantMemoryService.getInteractionMemoriesByScene(participantId, sceneId);
            } else {
                memories = participantMemoryService.getInteractionMemories(participantId);
            }
            
            Map<String, Object> result = new HashMap<>();
            result.put("memories", memories);
            result.put("total", memories.size());
            
            return ResponseEntity.ok(ApiResponse.success(result));
        } catch (Exception e) {
            log.error("获取参与者交互记忆失败: participantId={}", participantId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("获取参与者交互记忆失败: " + e.getMessage()));
        }
    }
    
    // ========== 参与者关系API ==========
    
    @Operation(summary = "保存或更新参与者关系", description = "保存或更新参与者之间的关系")
    @PostMapping("/participants/{participantId}/relationships")
    public ResponseEntity<ApiResponse<ParticipantRelationship>> saveRelationship(
            @Parameter(description = "参与者ID") @PathVariable String participantId,
            @RequestBody ParticipantRelationship relationship,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            relationship.setParticipantId(participantId);
            ParticipantRelationship saved = participantMemoryService.saveRelationship(relationship);
            return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(saved));
        } catch (Exception e) {
            log.error("保存参与者关系失败: participantId={}", participantId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("保存参与者关系失败: " + e.getMessage()));
        }
    }
    
    @Operation(summary = "获取参与者关系", description = "获取参与者之间的关系")
    @GetMapping("/participants/{participantId}/relationships")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getRelationships(
            @Parameter(description = "参与者ID") @PathVariable String participantId,
            @Parameter(description = "关联参与者ID（可选）") @RequestParam(required = false) String relatedParticipantId,
            @Parameter(description = "关系类型（可选）") @RequestParam(required = false) ParticipantRelationship.RelationshipType relationshipType,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            List<ParticipantRelationship> relationships;
            if (relatedParticipantId != null) {
                ParticipantRelationship relationship = participantMemoryService.getRelationship(participantId, relatedParticipantId);
                relationships = relationship != null ? List.of(relationship) : List.of();
            } else if (relationshipType != null) {
                relationships = participantMemoryService.getRelationshipsByType(participantId, relationshipType);
            } else {
                relationships = participantMemoryService.getAllRelationships(participantId);
            }
            
            Map<String, Object> result = new HashMap<>();
            result.put("relationships", relationships);
            result.put("total", relationships.size());
            
            return ResponseEntity.ok(ApiResponse.success(result));
        } catch (Exception e) {
            log.error("获取参与者关系失败: participantId={}", participantId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("获取参与者关系失败: " + e.getMessage()));
        }
    }
    
    @Operation(summary = "更新关系强度", description = "更新参与者之间的关系强度")
    @PutMapping("/participants/{participantId}/relationships/{relatedParticipantId}/strength")
    public ResponseEntity<ApiResponse<ParticipantRelationship>> updateRelationshipStrength(
            @Parameter(description = "参与者ID") @PathVariable String participantId,
            @Parameter(description = "关联参与者ID") @PathVariable String relatedParticipantId,
            @Parameter(description = "关系强度") @RequestParam double strength,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            ParticipantRelationship relationship = participantMemoryService.updateRelationshipStrength(
                participantId, relatedParticipantId, strength);
            if (relationship == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("参与者关系不存在"));
            }
            return ResponseEntity.ok(ApiResponse.success(relationship));
        } catch (Exception e) {
            log.error("更新关系强度失败: participantId={}, relatedParticipantId={}", participantId, relatedParticipantId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("更新关系强度失败: " + e.getMessage()));
        }
    }
    
    // ========== 参与者偏好API ==========
    
    @Operation(summary = "保存或更新参与者偏好", description = "保存或更新参与者的偏好")
    @PostMapping("/participants/{participantId}/preferences")
    public ResponseEntity<ApiResponse<ParticipantPreference>> savePreference(
            @Parameter(description = "参与者ID") @PathVariable String participantId,
            @RequestBody ParticipantPreference preference,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            preference.setParticipantId(participantId);
            ParticipantPreference saved = participantMemoryService.savePreference(preference);
            return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(saved));
        } catch (Exception e) {
            log.error("保存参与者偏好失败: participantId={}", participantId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("保存参与者偏好失败: " + e.getMessage()));
        }
    }
    
    @Operation(summary = "获取参与者偏好", description = "获取参与者的偏好")
    @GetMapping("/participants/{participantId}/preferences")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getPreferences(
            @Parameter(description = "参与者ID") @PathVariable String participantId,
            @Parameter(description = "场景ID（可选）") @RequestParam(required = false) String sceneId,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            List<ParticipantPreference> preferences;
            if (sceneId != null) {
                preferences = participantMemoryService.getPreferencesByScene(participantId, sceneId);
            } else {
                preferences = participantMemoryService.getAllPreferences(participantId);
            }
            
            Map<String, Object> result = new HashMap<>();
            result.put("preferences", preferences);
            result.put("total", preferences.size());
            
            return ResponseEntity.ok(ApiResponse.success(result));
        } catch (Exception e) {
            log.error("获取参与者偏好失败: participantId={}", participantId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("获取参与者偏好失败: " + e.getMessage()));
        }
    }
    
    // ========== 参与者场景记忆API ==========
    
    @Operation(summary = "保存参与者场景记忆", description = "保存参与者在特定场景中的记忆")
    @PostMapping("/participants/{participantId}/scene-memories")
    public ResponseEntity<ApiResponse<ParticipantSceneMemory>> saveSceneMemory(
            @Parameter(description = "参与者ID") @PathVariable String participantId,
            @RequestBody ParticipantSceneMemory memory,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            memory.setParticipantId(participantId);
            ParticipantSceneMemory saved = participantMemoryService.saveSceneMemory(memory);
            return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(saved));
        } catch (Exception e) {
            log.error("保存参与者场景记忆失败: participantId={}", participantId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("保存参与者场景记忆失败: " + e.getMessage()));
        }
    }
    
    @Operation(summary = "获取参与者场景记忆", description = "获取参与者在特定场景中的记忆")
    @GetMapping("/participants/{participantId}/scene-memories")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getSceneMemories(
            @Parameter(description = "参与者ID") @PathVariable String participantId,
            @Parameter(description = "场景ID（可选）") @RequestParam(required = false) String sceneId,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            List<ParticipantSceneMemory> memories;
            if (sceneId != null) {
                memories = participantMemoryService.getSceneMemories(participantId, sceneId);
            } else {
                memories = participantMemoryService.getAllSceneMemories(participantId);
            }
            
            Map<String, Object> result = new HashMap<>();
            result.put("memories", memories);
            result.put("total", memories.size());
            
            return ResponseEntity.ok(ApiResponse.success(result));
        } catch (Exception e) {
            log.error("获取参与者场景记忆失败: participantId={}", participantId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("获取参与者场景记忆失败: " + e.getMessage()));
        }
    }
    
    // ========== 记忆检索API ==========
    
    @Operation(summary = "检索参与者相关记忆", description = "检索与参与者相关的记忆")
    @PostMapping("/participants/{participantId}/memories/search")
    public ResponseEntity<ApiResponse<Map<String, Object>>> searchMemories(
            @Parameter(description = "参与者ID") @PathVariable String participantId,
            @RequestBody Map<String, Object> request,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            String query = (String) request.get("query");
            Integer limit = (Integer) request.getOrDefault("limit", 10);
            
            List<ParticipantMemoryService.ParticipantMemory> memories = 
                participantMemoryService.retrieveRelevantMemories(participantId, query, limit);
            
            Map<String, Object> result = new HashMap<>();
            result.put("memories", memories);
            result.put("total", memories.size());
            
            return ResponseEntity.ok(ApiResponse.success(result));
        } catch (Exception e) {
            log.error("检索参与者记忆失败: participantId={}", participantId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("检索参与者记忆失败: " + e.getMessage()));
        }
    }
}

