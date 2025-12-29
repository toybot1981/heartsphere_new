package com.heartsphere.memory.controller;

import com.heartsphere.dto.ApiResponse;
import com.heartsphere.memory.model.MemoryType;
import com.heartsphere.memory.model.character.*;
import com.heartsphere.memory.service.CharacterMemoryService;
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
 * 角色记忆系统REST API控制器（v2）
 * 
 * @author HeartSphere
 * @date 2025-12-29
 */
@RestController
@RequestMapping("/api/memory/v2")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "角色记忆系统API", description = "角色记忆系统的REST API接口（v2）")
public class CharacterMemoryController {
    
    private final CharacterMemoryService characterMemoryService;
    
    // ========== 角色自身记忆API ==========
    
    @Operation(summary = "保存角色自身记忆", description = "保存角色的背景、性格、经历等自身记忆")
    @PostMapping("/characters/{characterId}/self-memories")
    public ResponseEntity<ApiResponse<CharacterSelfMemory>> saveCharacterSelfMemory(
            @Parameter(description = "角色ID") @PathVariable String characterId,
            @RequestBody CharacterSelfMemory memory,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            memory.setCharacterId(characterId);
            CharacterSelfMemory saved = characterMemoryService.saveCharacterSelfMemory(memory);
            return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(saved));
        } catch (Exception e) {
            log.error("保存角色自身记忆失败: characterId={}", characterId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("保存角色自身记忆失败: " + e.getMessage()));
        }
    }
    
    @Operation(summary = "获取角色自身记忆", description = "获取角色的所有自身记忆")
    @GetMapping("/characters/{characterId}/self-memories")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getCharacterSelfMemories(
            @Parameter(description = "角色ID") @PathVariable String characterId,
            @Parameter(description = "记忆类型（可选）") @RequestParam(required = false) MemoryType type,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            List<CharacterSelfMemory> memories;
            if (type != null) {
                memories = characterMemoryService.getCharacterSelfMemoriesByType(characterId, type);
            } else {
                memories = characterMemoryService.getCharacterSelfMemories(characterId);
            }
            
            Map<String, Object> result = new HashMap<>();
            result.put("memories", memories);
            result.put("total", memories.size());
            
            return ResponseEntity.ok(ApiResponse.success(result));
        } catch (Exception e) {
            log.error("获取角色自身记忆失败: characterId={}", characterId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("获取角色自身记忆失败: " + e.getMessage()));
        }
    }
    
    // ========== 角色交互记忆API ==========
    
    @Operation(summary = "保存角色交互记忆", description = "保存角色与用户的交互记忆")
    @PostMapping("/characters/{characterId}/interaction-memories")
    public ResponseEntity<ApiResponse<CharacterInteractionMemory>> saveInteractionMemory(
            @Parameter(description = "角色ID") @PathVariable String characterId,
            @RequestBody CharacterInteractionMemory memory,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            String userId = userDetails.getUsername();
            memory.setCharacterId(characterId);
            memory.setUserId(userId);
            CharacterInteractionMemory saved = characterMemoryService.saveInteractionMemory(memory);
            return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(saved));
        } catch (Exception e) {
            log.error("保存角色交互记忆失败: characterId={}", characterId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("保存角色交互记忆失败: " + e.getMessage()));
        }
    }
    
    @Operation(summary = "获取角色交互记忆", description = "获取角色与用户的交互记忆")
    @GetMapping("/characters/{characterId}/interaction-memories")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getInteractionMemories(
            @Parameter(description = "角色ID") @PathVariable String characterId,
            @Parameter(description = "场景ID（可选）") @RequestParam(required = false) String eraId,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            String userId = userDetails.getUsername();
            List<CharacterInteractionMemory> memories;
            if (eraId != null && !eraId.isEmpty()) {
                memories = characterMemoryService.getInteractionMemories(characterId, userId, eraId);
            } else {
                memories = characterMemoryService.getInteractionMemories(characterId, userId);
            }
            
            Map<String, Object> result = new HashMap<>();
            result.put("memories", memories);
            result.put("total", memories.size());
            
            return ResponseEntity.ok(ApiResponse.success(result));
        } catch (Exception e) {
            log.error("获取角色交互记忆失败: characterId={}", characterId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("获取角色交互记忆失败: " + e.getMessage()));
        }
    }
    
    // ========== 角色场景记忆API ==========
    
    @Operation(summary = "保存角色场景记忆", description = "保存角色在特定场景中的记忆")
    @PostMapping("/characters/{characterId}/scene-memories")
    public ResponseEntity<ApiResponse<CharacterSceneMemory>> saveSceneMemory(
            @Parameter(description = "角色ID") @PathVariable String characterId,
            @RequestBody CharacterSceneMemory memory,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            memory.setCharacterId(characterId);
            CharacterSceneMemory saved = characterMemoryService.saveSceneMemory(memory);
            return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(saved));
        } catch (Exception e) {
            log.error("保存角色场景记忆失败: characterId={}", characterId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("保存角色场景记忆失败: " + e.getMessage()));
        }
    }
    
    @Operation(summary = "获取角色场景记忆", description = "获取角色在特定场景中的记忆")
    @GetMapping("/characters/{characterId}/scene-memories")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getSceneMemories(
            @Parameter(description = "角色ID") @PathVariable String characterId,
            @Parameter(description = "场景ID（可选）") @RequestParam(required = false) String eraId,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            List<CharacterSceneMemory> memories;
            if (eraId != null && !eraId.isEmpty()) {
                memories = characterMemoryService.getSceneMemories(characterId, eraId);
            } else {
                memories = characterMemoryService.getSceneMemories(characterId);
            }
            
            Map<String, Object> result = new HashMap<>();
            result.put("memories", memories);
            result.put("total", memories.size());
            
            return ResponseEntity.ok(ApiResponse.success(result));
        } catch (Exception e) {
            log.error("获取角色场景记忆失败: characterId={}", characterId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("获取角色场景记忆失败: " + e.getMessage()));
        }
    }
    
    // ========== 角色关系记忆API ==========
    
    @Operation(summary = "保存或更新角色关系", description = "保存或更新角色与其他角色的关系")
    @PostMapping("/characters/{characterId}/relationships")
    public ResponseEntity<ApiResponse<CharacterRelationshipMemory>> saveRelationshipMemory(
            @Parameter(description = "角色ID") @PathVariable String characterId,
            @RequestBody CharacterRelationshipMemory memory,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            memory.setCharacterId(characterId);
            CharacterRelationshipMemory saved = characterMemoryService.saveRelationshipMemory(memory);
            return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(saved));
        } catch (Exception e) {
            log.error("保存角色关系失败: characterId={}", characterId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("保存角色关系失败: " + e.getMessage()));
        }
    }
    
    @Operation(summary = "获取角色所有关系", description = "获取角色的所有关系记忆")
    @GetMapping("/characters/{characterId}/relationships")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAllRelationships(
            @Parameter(description = "角色ID") @PathVariable String characterId,
            @Parameter(description = "关系类型（可选）") 
            @RequestParam(required = false) CharacterRelationshipMemory.RelationshipType relationshipType,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            List<CharacterRelationshipMemory> relationships;
            if (relationshipType != null) {
                relationships = characterMemoryService.getRelationshipsByType(characterId, relationshipType);
            } else {
                relationships = characterMemoryService.getAllRelationships(characterId);
            }
            
            Map<String, Object> result = new HashMap<>();
            result.put("relationships", relationships);
            result.put("total", relationships.size());
            
            return ResponseEntity.ok(ApiResponse.success(result));
        } catch (Exception e) {
            log.error("获取角色关系失败: characterId={}", characterId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("获取角色关系失败: " + e.getMessage()));
        }
    }
    
    @Operation(summary = "更新关系强度", description = "更新两个角色之间的关系强度")
    @PutMapping("/characters/{characterId}/relationships/{relatedCharacterId}/strength")
    public ResponseEntity<ApiResponse<CharacterRelationshipMemory>> updateRelationshipStrength(
            @Parameter(description = "角色ID") @PathVariable String characterId,
            @Parameter(description = "关联角色ID") @PathVariable String relatedCharacterId,
            @Parameter(description = "关系强度") @RequestParam double strength,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            CharacterRelationshipMemory updated = characterMemoryService.updateRelationshipStrength(
                characterId, relatedCharacterId, strength);
            if (updated == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("关系不存在"));
            }
            return ResponseEntity.ok(ApiResponse.success(updated));
        } catch (Exception e) {
            log.error("更新关系强度失败: characterId={}, relatedCharacterId={}", 
                characterId, relatedCharacterId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("更新关系强度失败: " + e.getMessage()));
        }
    }
    
    // ========== 角色记忆检索API ==========
    
    @Operation(summary = "检索相关记忆", description = "检索角色的相关记忆")
    @PostMapping("/characters/{characterId}/memories/search")
    public ResponseEntity<ApiResponse<Map<String, Object>>> searchMemories(
            @Parameter(description = "角色ID") @PathVariable String characterId,
            @RequestBody Map<String, Object> request,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            String query = (String) request.getOrDefault("query", "");
            Integer limit = (Integer) request.getOrDefault("limit", 10);
            
            List<CharacterMemoryService.CharacterMemory> memories = 
                characterMemoryService.retrieveRelevantMemories(characterId, query, limit);
            
            Map<String, Object> result = new HashMap<>();
            result.put("memories", memories);
            result.put("total", memories.size());
            
            return ResponseEntity.ok(ApiResponse.success(result));
        } catch (Exception e) {
            log.error("检索角色记忆失败: characterId={}", characterId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("检索角色记忆失败: " + e.getMessage()));
        }
    }
    
    // ========== 角色记忆画像API ==========
    
    @Operation(summary = "获取角色记忆画像", description = "获取角色的完整记忆画像")
    @GetMapping("/characters/{characterId}/profile")
    public ResponseEntity<ApiResponse<CharacterMemoryProfile>> getCharacterMemoryProfile(
            @Parameter(description = "角色ID") @PathVariable String characterId,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            CharacterMemoryProfile profile = characterMemoryService.getCharacterMemoryProfile(characterId);
            return ResponseEntity.ok(ApiResponse.success(profile));
        } catch (Exception e) {
            log.error("获取角色记忆画像失败: characterId={}", characterId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("获取角色记忆画像失败: " + e.getMessage()));
        }
    }
}

