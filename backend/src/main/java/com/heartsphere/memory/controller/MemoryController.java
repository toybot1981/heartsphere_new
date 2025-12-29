package com.heartsphere.memory.controller;

import com.heartsphere.dto.ApiResponse;
import com.heartsphere.memory.dto.SaveFactRequest;
import com.heartsphere.memory.dto.SaveMessageRequest;
import com.heartsphere.memory.dto.SavePreferenceRequest;
import com.heartsphere.memory.model.*;
import com.heartsphere.memory.service.MemoryManager;
import com.heartsphere.memory.service.ShortMemoryService;
import com.heartsphere.memory.service.LongMemoryService;
import com.heartsphere.memory.service.impl.MongoLongMemoryService;
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

import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * 记忆系统REST API控制器
 * 
 * @author HeartSphere
 * @date 2025-12-28
 */
@RestController
@RequestMapping("/api/memory/v1")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "记忆系统API", description = "记忆系统的REST API接口")
public class MemoryController {
    
    private final MemoryManager memoryManager;
    private final ShortMemoryService shortMemoryService;
    private final LongMemoryService longMemoryService;
    
    // ========== 短期记忆API ==========
    
    @Operation(summary = "保存消息", description = "保存对话消息到短期记忆")
    @PostMapping("/sessions/{sessionId}/messages")
    public ResponseEntity<ApiResponse<ChatMessage>> saveMessage(
            @Parameter(description = "会话ID") @PathVariable String sessionId,
            @RequestBody SaveMessageRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            String userId = userDetails.getUsername();
            
            ChatMessage message = ChatMessage.builder()
                .id(UUID.randomUUID().toString())
                .sessionId(sessionId)
                .userId(userId)
                .role(request.getRole())
                .content(request.getContent())
                .metadata(request.getMetadata())
                .timestamp(System.currentTimeMillis())
                .importance(request.getImportance())
                .build();
            
            memoryManager.saveMessage(userId, sessionId, message);
            
            return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(message));
        } catch (Exception e) {
            log.error("保存消息失败: sessionId={}", sessionId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("保存消息失败: " + e.getMessage()));
        }
    }
    
    @Operation(summary = "获取消息", description = "获取会话的消息列表")
    @GetMapping("/sessions/{sessionId}/messages")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getMessages(
            @Parameter(description = "会话ID") @PathVariable String sessionId,
            @Parameter(description = "消息数量限制") @RequestParam(defaultValue = "20") int limit,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            List<ChatMessage> messages = shortMemoryService.getMessages(sessionId, limit);
            
            Map<String, Object> result = new HashMap<>();
            result.put("messages", messages);
            result.put("total", messages.size());
            
            return ResponseEntity.ok(ApiResponse.success(result));
        } catch (Exception e) {
            log.error("获取消息失败: sessionId={}", sessionId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("获取消息失败: " + e.getMessage()));
        }
    }
    
    @Operation(summary = "清空会话", description = "清空会话的所有消息")
    @DeleteMapping("/sessions/{sessionId}")
    public ResponseEntity<ApiResponse<Void>> clearSession(
            @Parameter(description = "会话ID") @PathVariable String sessionId,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            shortMemoryService.clearSession(sessionId);
            return ResponseEntity.ok(ApiResponse.success(null));
        } catch (Exception e) {
            log.error("清空会话失败: sessionId={}", sessionId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("清空会话失败: " + e.getMessage()));
        }
    }
    
    // ========== 长期记忆API - 用户事实 ==========
    
    @Operation(summary = "保存用户事实", description = "保存用户事实到长期记忆")
    @PostMapping("/users/{userId}/facts")
    public ResponseEntity<ApiResponse<UserFact>> saveFact(
            @Parameter(description = "用户ID") @PathVariable String userId,
            @RequestBody SaveFactRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            // 验证用户权限
            if (!userDetails.getUsername().equals(userId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("无权访问该用户的数据"));
            }
            
            UserFact fact = UserFact.builder()
                .userId(userId)
                .fact(request.getFact())
                .category(request.getCategory())
                .importance(request.getImportance() != null ? request.getImportance() : 0.5)
                .confidence(request.getConfidence() != null ? request.getConfidence() : 0.7)
                .sourceSessionId(null)
                .createdAt(Instant.now())
                .lastAccessedAt(Instant.now())
                .accessCount(0)
                .tags(request.getTags())
                .metadata(request.getMetadata())
                .build();
            
            longMemoryService.saveFact(fact);
            
            return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(fact));
        } catch (Exception e) {
            log.error("保存用户事实失败: userId={}", userId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("保存用户事实失败: " + e.getMessage()));
        }
    }
    
    @Operation(summary = "搜索用户事实", description = "搜索用户的事实")
    @GetMapping("/users/{userId}/facts/search")
    public ResponseEntity<ApiResponse<List<UserFact>>> searchFacts(
            @Parameter(description = "用户ID") @PathVariable String userId,
            @Parameter(description = "查询关键词") @RequestParam String query,
            @Parameter(description = "返回数量限制") @RequestParam(defaultValue = "10") int limit,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            // 验证用户权限
            if (!userDetails.getUsername().equals(userId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("无权访问该用户的数据"));
            }
            
            List<UserFact> facts = longMemoryService.searchFacts(userId, query);
            if (facts.size() > limit) {
                facts = facts.subList(0, limit);
            }
            
            return ResponseEntity.ok(ApiResponse.success(facts));
        } catch (Exception e) {
            log.error("搜索用户事实失败: userId={}, query={}", userId, query, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("搜索用户事实失败: " + e.getMessage()));
        }
    }
    
    @Operation(summary = "获取用户所有事实", description = "获取用户的所有事实")
    @GetMapping("/users/{userId}/facts")
    public ResponseEntity<ApiResponse<List<UserFact>>> getAllFacts(
            @Parameter(description = "用户ID") @PathVariable String userId,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            // 验证用户权限
            if (!userDetails.getUsername().equals(userId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("无权访问该用户的数据"));
            }
            
            List<UserFact> facts = longMemoryService.getAllFacts(userId);
            return ResponseEntity.ok(ApiResponse.success(facts));
        } catch (Exception e) {
            log.error("获取用户事实失败: userId={}", userId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("获取用户事实失败: " + e.getMessage()));
        }
    }
    
    // ========== 长期记忆API - 用户偏好 ==========
    
    @Operation(summary = "保存用户偏好", description = "保存用户偏好到长期记忆")
    @PostMapping("/users/{userId}/preferences")
    public ResponseEntity<ApiResponse<UserPreference>> savePreference(
            @Parameter(description = "用户ID") @PathVariable String userId,
            @RequestBody SavePreferenceRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            // 验证用户权限
            if (!userDetails.getUsername().equals(userId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("无权访问该用户的数据"));
            }
            
            UserPreference preference = UserPreference.builder()
                .userId(userId)
                .key(request.getKey())
                .value(request.getValue())
                .type(request.getType())
                .confidence(request.getConfidence() != null ? request.getConfidence() : 0.7)
                .updatedAt(Instant.now())
                .lastAccessedAt(Instant.now())
                .accessCount(0)
                .metadata(request.getMetadata())
                .build();
            
            longMemoryService.savePreference(preference);
            
            return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(preference));
        } catch (Exception e) {
            log.error("保存用户偏好失败: userId={}", userId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("保存用户偏好失败: " + e.getMessage()));
        }
    }
    
    @Operation(summary = "获取用户偏好", description = "获取用户的偏好")
    @GetMapping("/users/{userId}/preferences/{key}")
    public ResponseEntity<ApiResponse<UserPreference>> getPreference(
            @Parameter(description = "用户ID") @PathVariable String userId,
            @Parameter(description = "偏好键") @PathVariable String key,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            // 验证用户权限
            if (!userDetails.getUsername().equals(userId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("无权访问该用户的数据"));
            }
            
            UserPreference preference = longMemoryService.getPreference(userId, key);
            if (preference == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("偏好不存在"));
            }
            
            return ResponseEntity.ok(ApiResponse.success(preference));
        } catch (Exception e) {
            log.error("获取用户偏好失败: userId={}, key={}", userId, key, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("获取用户偏好失败: " + e.getMessage()));
        }
    }
    
    @Operation(summary = "获取用户所有偏好", description = "获取用户的所有偏好")
    @GetMapping("/users/{userId}/preferences")
    public ResponseEntity<ApiResponse<List<UserPreference>>> getAllPreferences(
            @Parameter(description = "用户ID") @PathVariable String userId,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            // 验证用户权限
            if (!userDetails.getUsername().equals(userId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("无权访问该用户的数据"));
            }
            
            List<UserPreference> preferences = longMemoryService.getAllPreferences(userId);
            return ResponseEntity.ok(ApiResponse.success(preferences));
        } catch (Exception e) {
            log.error("获取用户偏好失败: userId={}", userId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("获取用户偏好失败: " + e.getMessage()));
        }
    }
    
    // ========== 长期记忆API - 用户记忆 ==========
    
    @Operation(summary = "搜索用户记忆", description = "搜索用户的相关记忆")
    @GetMapping("/users/{userId}/memories/search")
    public ResponseEntity<ApiResponse<List<UserMemory>>> searchMemories(
            @Parameter(description = "用户ID") @PathVariable String userId,
            @Parameter(description = "查询关键词") @RequestParam String query,
            @Parameter(description = "返回数量限制") @RequestParam(defaultValue = "10") int limit,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            // 验证用户权限
            if (!userDetails.getUsername().equals(userId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("无权访问该用户的数据"));
            }
            
            List<UserMemory> memories = memoryManager.retrieveRelevantMemories(userId, query, limit);
            return ResponseEntity.ok(ApiResponse.success(memories));
        } catch (Exception e) {
            log.error("搜索用户记忆失败: userId={}, query={}", userId, query, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("搜索用户记忆失败: " + e.getMessage()));
        }
    }
    
    // ========== 记忆提取API ==========
    
    @Operation(summary = "从会话提取记忆", description = "从会话中提取并保存记忆")
    @PostMapping("/users/{userId}/sessions/{sessionId}/extract")
    public ResponseEntity<ApiResponse<Map<String, Object>>> extractMemories(
            @Parameter(description = "用户ID") @PathVariable String userId,
            @Parameter(description = "会话ID") @PathVariable String sessionId,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            // 验证用户权限
            if (!userDetails.getUsername().equals(userId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("无权访问该用户的数据"));
            }
            
            // 异步提取记忆
            memoryManager.extractAndSaveMemories(userId, sessionId);
            
            Map<String, Object> result = new HashMap<>();
            result.put("message", "记忆提取任务已启动");
            result.put("userId", userId);
            result.put("sessionId", sessionId);
            
            return ResponseEntity.ok(ApiResponse.success(result));
        } catch (Exception e) {
            log.error("提取记忆失败: userId={}, sessionId={}", userId, sessionId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("提取记忆失败: " + e.getMessage()));
        }
    }
    
    // ========== 用户画像API ==========
    
    @Operation(summary = "获取用户画像", description = "获取用户的完整画像")
    @GetMapping("/users/{userId}/profile")
    public ResponseEntity<ApiResponse<UserProfile>> getUserProfile(
            @Parameter(description = "用户ID") @PathVariable String userId,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            // 验证用户权限
            if (!userDetails.getUsername().equals(userId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("无权访问该用户的数据"));
            }
            
            UserProfile profile = memoryManager.getUserProfile(userId);
            return ResponseEntity.ok(ApiResponse.success(profile));
        } catch (Exception e) {
            log.error("获取用户画像失败: userId={}", userId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("获取用户画像失败: " + e.getMessage()));
        }
    }
    
    // ========== 对话上下文API ==========
    
    @Operation(summary = "获取对话上下文", description = "获取包含短期和长期记忆的对话上下文")
    @GetMapping("/users/{userId}/sessions/{sessionId}/context")
    public ResponseEntity<ApiResponse<ConversationContext>> getConversationContext(
            @Parameter(description = "用户ID") @PathVariable String userId,
            @Parameter(description = "会话ID") @PathVariable String sessionId,
            @Parameter(description = "消息数量限制") @RequestParam(defaultValue = "20") int messageLimit,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            // 验证用户权限
            if (!userDetails.getUsername().equals(userId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("无权访问该用户的数据"));
            }
            
            ConversationContext context = memoryManager.getConversationContext(userId, sessionId, messageLimit);
            return ResponseEntity.ok(ApiResponse.success(context));
        } catch (Exception e) {
            log.error("获取对话上下文失败: userId={}, sessionId={}", userId, sessionId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("获取对话上下文失败: " + e.getMessage()));
        }
    }
}

