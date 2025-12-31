package com.heartsphere.memory.controller;

import com.heartsphere.dto.ApiResponse;
import com.heartsphere.memory.dto.SaveMemoryRequest;
import com.heartsphere.memory.model.UserMemory;
import com.heartsphere.memory.service.LongMemoryService;
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
}
