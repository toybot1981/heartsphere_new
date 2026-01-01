package com.heartsphere.memory.controller;

import com.heartsphere.dto.ApiResponse;
import com.heartsphere.memory.dto.SaveMemoryRequest;
import com.heartsphere.memory.model.ChatMessage;
import com.heartsphere.memory.model.MemorySource;
import com.heartsphere.memory.model.UserMemory;
import com.heartsphere.memory.service.LongMemoryService;
import com.heartsphere.memory.service.MemoryExtractor;
import com.heartsphere.memory.service.ShortMemoryService;
import com.heartsphere.memory.service.impl.MySQLLongMemoryService;
import com.heartsphere.security.UserDetailsImpl;
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
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * 记忆系统REST API控制器
 * 
 * @author HeartSphere
 * @date 2025-12-31
 */
@RestController
@RequestMapping("/api/memory/v1")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "记忆系统", description = "记忆系统API")
public class MemoryController {
    
    private final LongMemoryService longMemoryService;
    private final MySQLLongMemoryService mySQLLongMemoryService;
    private final ShortMemoryService shortMemoryService;
    private final MemoryExtractor memoryExtractor;
    
    /**
     * 验证用户权限
     */
    private String getAuthenticatedUserId(UserDetails userDetails) {
        if (userDetails instanceof UserDetailsImpl) {
            return String.valueOf(((UserDetailsImpl) userDetails).getId());
        } else {
            try {
                return userDetails.getUsername();
            } catch (Exception e) {
                log.warn("无法获取用户ID: {}", e.getMessage());
                return null;
            }
        }
    }
    
    @Operation(summary = "保存用户记忆", description = "保存用户记忆到长期记忆")
    @PostMapping("/users/{userId}/memories")
    public ResponseEntity<ApiResponse<UserMemory>> saveMemory(
            @Parameter(description = "用户ID") @PathVariable String userId,
            @Parameter(description = "保存记忆请求") @RequestBody SaveMemoryRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            // 验证用户权限
            String authenticatedUserId = getAuthenticatedUserId(userDetails);
            if (authenticatedUserId == null || !authenticatedUserId.equals(userId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("无权访问该用户的数据"));
            }
            
            // 转换为UserMemory
            UserMemory memory = UserMemory.builder()
                .id(UUID.randomUUID().toString())
                .userId(userId)
                .type(request.getMemoryType())
                .importance(request.getImportance())
                .content(request.getContent())
                .structuredData(request.getStructuredData())
                .source(request.getSource())
                .sourceId(request.getSourceId())
                .confidence(request.getConfidence() != null ? request.getConfidence() : 0.7)
                .tags(request.getTags())
                .metadata(request.getMetadata())
                .createdAt(Instant.now())
                .lastAccessedAt(Instant.now())
                .accessCount(0)
                .build();
            
            // 保存记忆
            mySQLLongMemoryService.saveMemory(memory);
            
            return ResponseEntity.ok(ApiResponse.success(memory));
        } catch (Exception e) {
            log.error("保存用户记忆失败: userId={}", userId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("保存记忆失败: " + e.getMessage()));
        }
    }
    
    @Operation(summary = "批量保存用户记忆", description = "批量保存用户记忆到长期记忆")
    @PostMapping("/users/{userId}/memories/batch")
    public ResponseEntity<ApiResponse<List<UserMemory>>> saveMemories(
            @Parameter(description = "用户ID") @PathVariable String userId,
            @Parameter(description = "保存记忆请求列表") @RequestBody List<SaveMemoryRequest> requests,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            // 验证用户权限
            String authenticatedUserId = getAuthenticatedUserId(userDetails);
            if (authenticatedUserId == null || !authenticatedUserId.equals(userId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("无权访问该用户的数据"));
            }
            
            // 转换为UserMemory列表
            List<UserMemory> memories = requests.stream()
                .map(request -> UserMemory.builder()
                    .id(UUID.randomUUID().toString())
                    .userId(userId)
                    .type(request.getMemoryType())
                    .importance(request.getImportance())
                    .content(request.getContent())
                    .structuredData(request.getStructuredData())
                    .source(request.getSource())
                    .sourceId(request.getSourceId())
                    .confidence(request.getConfidence() != null ? request.getConfidence() : 0.7)
                    .tags(request.getTags())
                    .metadata(request.getMetadata())
                    .createdAt(Instant.now())
                    .lastAccessedAt(Instant.now())
                    .accessCount(0)
                    .build())
                .collect(Collectors.toList());
            
            // 批量保存记忆
            mySQLLongMemoryService.saveMemories(memories);
            
            return ResponseEntity.ok(ApiResponse.success(memories));
        } catch (Exception e) {
            log.error("批量保存用户记忆失败: userId={}", userId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("批量保存记忆失败: " + e.getMessage()));
        }
    }
    
    @Operation(summary = "搜索用户记忆", description = "搜索用户的相关记忆")
    @GetMapping("/users/{userId}/memories/search")
    public ResponseEntity<ApiResponse<List<UserMemory>>> searchMemories(
            @Parameter(description = "用户ID") @PathVariable String userId,
            @Parameter(description = "查询关键词") @RequestParam(required = false, defaultValue = "") String query,
            @Parameter(description = "返回数量限制") @RequestParam(defaultValue = "10") int limit,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            // 验证用户权限
            String authenticatedUserId = getAuthenticatedUserId(userDetails);
            if (authenticatedUserId == null || !authenticatedUserId.equals(userId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("无权访问该用户的数据"));
            }
            
            List<UserMemory> memories = longMemoryService.retrieveRelevantMemories(userId, query, limit);
            return ResponseEntity.ok(ApiResponse.success(memories));
        } catch (Exception e) {
            log.error("搜索用户记忆失败: userId={}, query={}", userId, query, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("搜索记忆失败: " + e.getMessage()));
        }
    }
    
    @Operation(summary = "获取单个记忆", description = "根据记忆ID获取用户记忆")
    @GetMapping("/users/{userId}/memories/{memoryId}")
    public ResponseEntity<ApiResponse<UserMemory>> getMemoryById(
            @Parameter(description = "用户ID") @PathVariable String userId,
            @Parameter(description = "记忆ID") @PathVariable String memoryId,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            // 验证用户权限
            String authenticatedUserId = getAuthenticatedUserId(userDetails);
            if (authenticatedUserId == null || !authenticatedUserId.equals(userId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("无权访问该用户的数据"));
            }
            
            // 获取记忆
            UserMemory memory = mySQLLongMemoryService.getMemoryById(memoryId);
            if (memory == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("记忆不存在"));
            }
            
            // 验证记忆属于该用户
            if (!memory.getUserId().equals(userId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("无权访问该记忆"));
            }
            
            return ResponseEntity.ok(ApiResponse.success(memory));
        } catch (Exception e) {
            log.error("获取记忆失败: userId={}, memoryId={}", userId, memoryId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("获取记忆失败: " + e.getMessage()));
        }
    }
    
    @Operation(summary = "更新记忆", description = "更新用户记忆")
    @PutMapping("/users/{userId}/memories/{memoryId}")
    public ResponseEntity<ApiResponse<UserMemory>> updateMemory(
            @Parameter(description = "用户ID") @PathVariable String userId,
            @Parameter(description = "记忆ID") @PathVariable String memoryId,
            @Parameter(description = "更新记忆请求") @RequestBody SaveMemoryRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            // 验证用户权限
            String authenticatedUserId = getAuthenticatedUserId(userDetails);
            if (authenticatedUserId == null || !authenticatedUserId.equals(userId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("无权访问该用户的数据"));
            }
            
            // 获取现有记忆
            UserMemory existingMemory = mySQLLongMemoryService.getMemoryById(memoryId);
            if (existingMemory == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("记忆不存在"));
            }
            
            // 验证记忆属于该用户
            if (!existingMemory.getUserId().equals(userId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("无权更新该记忆"));
            }
            
            // 更新记忆（只更新提供的字段）
            UserMemory updatedMemory = UserMemory.builder()
                .id(memoryId)
                .userId(userId)
                .type(request.getMemoryType() != null ? request.getMemoryType() : existingMemory.getType())
                .importance(request.getImportance() != null ? request.getImportance() : existingMemory.getImportance())
                .content(request.getContent() != null ? request.getContent() : existingMemory.getContent())
                .structuredData(request.getStructuredData() != null ? request.getStructuredData() : existingMemory.getStructuredData())
                .source(request.getSource() != null ? request.getSource() : existingMemory.getSource())
                .sourceId(request.getSourceId() != null ? request.getSourceId() : existingMemory.getSourceId())
                .confidence(request.getConfidence() != null ? request.getConfidence() : existingMemory.getConfidence())
                .tags(request.getTags() != null ? request.getTags() : existingMemory.getTags())
                .metadata(request.getMetadata() != null ? request.getMetadata() : existingMemory.getMetadata())
                .createdAt(existingMemory.getCreatedAt()) // 保留创建时间
                .lastAccessedAt(Instant.now())
                .accessCount(existingMemory.getAccessCount())
                .build();
            
            // 更新记忆
            mySQLLongMemoryService.updateMemory(updatedMemory);
            
            // 重新获取更新后的记忆
            UserMemory result = mySQLLongMemoryService.getMemoryById(memoryId);
            return ResponseEntity.ok(ApiResponse.success(result));
        } catch (Exception e) {
            log.error("更新记忆失败: userId={}, memoryId={}", userId, memoryId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("更新记忆失败: " + e.getMessage()));
        }
    }
    
    @Operation(summary = "删除记忆", description = "删除用户记忆")
    @DeleteMapping("/users/{userId}/memories/{memoryId}")
    public ResponseEntity<ApiResponse<Void>> deleteMemory(
            @Parameter(description = "用户ID") @PathVariable String userId,
            @Parameter(description = "记忆ID") @PathVariable String memoryId,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            // 验证用户权限
            String authenticatedUserId = getAuthenticatedUserId(userDetails);
            if (authenticatedUserId == null || !authenticatedUserId.equals(userId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("无权访问该用户的数据"));
            }
            
            // 获取记忆以验证所有权
            UserMemory memory = mySQLLongMemoryService.getMemoryById(memoryId);
            if (memory == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("记忆不存在"));
            }
            
            // 验证记忆属于该用户
            if (!memory.getUserId().equals(userId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("无权删除该记忆"));
            }
            
            // 删除记忆
            mySQLLongMemoryService.deleteMemory(memoryId);
            
            return ResponseEntity.ok(ApiResponse.success(null));
        } catch (Exception e) {
            log.error("删除记忆失败: userId={}, memoryId={}", userId, memoryId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("删除记忆失败: " + e.getMessage()));
        }
    }
    
    @Operation(summary = "从会话提取记忆", description = "从指定会话的消息中提取并保存记忆")
    @PostMapping("/users/{userId}/sessions/{sessionId}/extract")
    public ResponseEntity<ApiResponse<List<UserMemory>>> extractMemoriesFromSession(
            @Parameter(description = "用户ID") @PathVariable String userId,
            @Parameter(description = "会话ID") @PathVariable String sessionId,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            // 验证用户权限
            String authenticatedUserId = getAuthenticatedUserId(userDetails);
            if (authenticatedUserId == null || !authenticatedUserId.equals(userId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("无权访问该用户的数据"));
            }
            
            // 获取会话消息
            List<ChatMessage> messages = shortMemoryService.getMessages(sessionId, 100);
            if (messages == null || messages.isEmpty()) {
                return ResponseEntity.ok(ApiResponse.success(List.of()));
            }
            
            // 提取记忆
            List<UserMemory> extractedMemories = memoryExtractor.extractMemories(userId, messages);
            if (extractedMemories == null || extractedMemories.isEmpty()) {
                return ResponseEntity.ok(ApiResponse.success(List.of()));
            }
            
            // 设置sourceId为会话ID
            extractedMemories.forEach(memory -> {
                if (memory.getSourceId() == null || memory.getSourceId().isEmpty()) {
                    memory.setSourceId(sessionId);
                }
                if (memory.getSource() == null) {
                    memory.setSource(MemorySource.CONVERSATION);
                }
            });
            
            // 保存提取的记忆
            mySQLLongMemoryService.saveMemories(extractedMemories);
            
            log.debug("从会话提取记忆成功: userId={}, sessionId={}, count={}", 
                userId, sessionId, extractedMemories.size());
            
            return ResponseEntity.ok(ApiResponse.success(extractedMemories));
        } catch (Exception e) {
            log.error("从会话提取记忆失败: userId={}, sessionId={}", userId, sessionId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("提取记忆失败: " + e.getMessage()));
        }
    }
}
