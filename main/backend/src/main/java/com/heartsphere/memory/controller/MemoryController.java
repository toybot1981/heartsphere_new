package com.heartsphere.memory.controller;

import com.heartsphere.dto.ApiResponse;
import com.heartsphere.memory.dto.SaveMemoryRequest;
import com.heartsphere.memory.model.ChatMessage;
import com.heartsphere.memory.model.MemorySource;
import com.heartsphere.memory.model.UserMemory;
import com.heartsphere.memory.dto.hsmem.*;
import com.heartsphere.memory.service.LongMemoryService;
import com.heartsphere.memory.service.MemoryExtractor;
import com.heartsphere.memory.service.ShortMemoryService;
import com.heartsphere.memory.service.hsmem.HSMemClientService;
import com.heartsphere.memory.service.impl.MySQLLongMemoryService;
import com.heartsphere.security.UserDetailsImpl;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
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
@RequiredArgsConstructor
@Slf4j
@Tag(name = "记忆系统", description = "记忆系统API")
public class MemoryController {
    
    private final LongMemoryService longMemoryService;
    private final MySQLLongMemoryService mySQLLongMemoryService;
    private final ShortMemoryService shortMemoryService;
    private final MemoryExtractor memoryExtractor;
    private final HSMemClientService hsmemClientService;
    private final com.heartsphere.service.MembershipService membershipService;
    
    /**
     * 验证用户权限
     * 优先从 SecurityContext 获取，如果 @AuthenticationPrincipal 为 null
     */
    private String getAuthenticatedUserId(UserDetails userDetails) {
        // 如果 @AuthenticationPrincipal 不为 null，直接使用
        if (userDetails != null) {
            if (userDetails instanceof UserDetailsImpl) {
                return String.valueOf(((UserDetailsImpl) userDetails).getId());
            } else {
                try {
                    return userDetails.getUsername();
                } catch (Exception e) {
                    log.warn("无法从 UserDetails 获取用户ID: {}", e.getMessage());
                }
            }
        }
        
        // 如果 @AuthenticationPrincipal 为 null，尝试从 SecurityContext 获取
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication != null && authentication.isAuthenticated() 
                && !"anonymousUser".equals(authentication.getPrincipal())) {
                
                Object principal = authentication.getPrincipal();
                log.debug("[MemoryController] 从 SecurityContext 获取认证信息: principal={}", 
                    principal != null ? principal.getClass().getSimpleName() : "null");
                
                if (principal instanceof UserDetailsImpl) {
                    Long id = ((UserDetailsImpl) principal).getId();
                    log.debug("[MemoryController] 从 UserDetailsImpl 获取用户ID: {}", id);
                    return String.valueOf(id);
                } else if (principal instanceof UserDetails) {
                    String username = ((UserDetails) principal).getUsername();
                    log.debug("[MemoryController] 从 UserDetails 获取用户名: {}", username);
                    return username;
                } else if (principal instanceof String) {
                    log.debug("[MemoryController] 从 String principal 获取: {}", principal);
                    // 如果是 "anonymousUser"，跳过
                    if (!"anonymousUser".equals(principal)) {
                        return (String) principal;
                    }
                }
            } else {
                log.debug("[MemoryController] SecurityContext 中没有有效认证信息: authentication={}, authenticated={}", 
                    authentication != null, 
                    authentication != null ? authentication.isAuthenticated() : false);
            }
            
            // 检查是否是匿名用户
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.getPrincipal() instanceof String 
                && "anonymousUser".equals(auth.getPrincipal())) {
                log.warn("[MemoryController] 检测到匿名用户，JWT token 可能无效或未传递");
            }
        } catch (Exception e) {
            log.warn("[MemoryController] 从 SecurityContext 获取用户ID失败: {}", e.getMessage());
        }
        
        return null;
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
            
            // 检查是否为游客（体验会员）- 游客不生成记忆
            try {
                Long userIdLong = Long.parseLong(userId);
                if (com.heartsphere.util.GuestAccessChecker.isGuest(membershipService)) {
                    log.debug("游客用户尝试批量保存记忆，已跳过: userId={}", userId);
                    return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(ApiResponse.error(403, com.heartsphere.util.GuestAccessChecker.GUEST_ACCESS_DENIED_MESSAGE));
                }
            } catch (NumberFormatException e) {
                // 如果userId不是数字，继续执行
                log.debug("用户ID格式不是数字，跳过游客检查: userId={}", userId);
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
            
            // 检查是否为游客（体验会员）- 游客不生成记忆，返回空列表或提示
            try {
                Long userIdLong = Long.parseLong(userId);
                if (com.heartsphere.util.GuestAccessChecker.isGuest(membershipService)) {
                    log.debug("游客用户尝试查询记忆，返回空列表: userId={}", userId);
                    return ResponseEntity.ok(ApiResponse.success(List.of()));
                }
            } catch (NumberFormatException e) {
                // 如果userId不是数字，继续执行
                log.debug("用户ID格式不是数字，跳过游客检查: userId={}", userId);
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
            
            // 检查是否为游客（体验会员）- 游客不生成记忆
            try {
                Long userIdLong = Long.parseLong(userId);
                if (com.heartsphere.util.GuestAccessChecker.isGuest(membershipService)) {
                    log.debug("游客用户尝试提取记忆，已跳过: userId={}, sessionId={}", userId, sessionId);
                    return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(ApiResponse.error(403, com.heartsphere.util.GuestAccessChecker.GUEST_ACCESS_DENIED_MESSAGE));
                }
            } catch (NumberFormatException e) {
                // 如果userId不是数字，继续执行
                log.debug("用户ID格式不是数字，跳过游客检查: userId={}", userId);
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
    
    // ==================== HSMem 记忆服务 API ====================
    
    /**
     * 将用户ID转换为 hsmem 格式（user_{userId}）
     */
    private String formatUserIdForHsmem(String userId) {
        if (userId == null || userId.isEmpty()) {
            return null;
        }
        // 如果已经是 user_ 格式，直接返回；否则添加前缀
        if (userId.startsWith("user_")) {
            return userId;
        }
        return "user_" + userId;
    }
    
    @Operation(summary = "记忆化对话", description = "将对话内容提取为记忆")
    @PostMapping("/hsmem/memorize/conversation")
    public ResponseEntity<ApiResponse<HSMemResponse.MemorizeData>> memorizeConversation(
            @Parameter(description = "对话记忆化请求") @RequestBody HSMemConversationRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            log.debug("[MemoryController] 收到记忆化对话请求: messages={}, userDetails={}, authentication={}", 
                request.getMessages() != null ? request.getMessages().size() : 0, 
                userDetails != null ? userDetails.getUsername() : "null",
                SecurityContextHolder.getContext().getAuthentication() != null);
            
            // 从认证信息中提取用户ID（支持从 SecurityContext 获取）
            String authenticatedUserId = getAuthenticatedUserId(userDetails);
            if (authenticatedUserId == null) {
                log.warn("[MemoryController] 记忆化对话失败: 无法获取用户ID, userDetails={}, securityContext={}", 
                    userDetails, SecurityContextHolder.getContext().getAuthentication());
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("未登录或无法获取用户信息"));
            }
            
            log.debug("[MemoryController] 用户认证成功: userId={}, 准备调用 HSMemClientService", authenticatedUserId);
            
            // 自动设置 user_id（如果请求中没有提供）
            if (request.getUser_id() == null || request.getUser_id().isEmpty()) {
                request.setUser_id(formatUserIdForHsmem(authenticatedUserId));
            } else {
                // 验证 user_id 是否与认证用户一致
                String formattedUserId = formatUserIdForHsmem(authenticatedUserId);
                if (!formattedUserId.equals(request.getUser_id()) && !authenticatedUserId.equals(request.getUser_id())) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(ApiResponse.error("无权为其他用户创建记忆"));
                }
            }
            
            // 调用 hsmem 服务
            log.debug("[MemoryController] 调用 HSMemClientService.memorizeConversation");
            HSMemResponse.MemorizeData result = hsmemClientService.memorizeConversation(request);
            log.debug("[MemoryController] HSMemClientService 调用成功: resourceId={}, itemsCount={}", 
                result.getResource_id(), result.getItems_count());
            return ResponseEntity.ok(ApiResponse.success(result));
        } catch (Exception e) {
            log.error("[MemoryController] 记忆化对话失败", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("记忆化对话失败: " + e.getMessage()));
        }
    }
    
    @Operation(summary = "记忆化文本", description = "将文本内容提取为记忆")
    @PostMapping("/hsmem/memorize/text")
    public ResponseEntity<ApiResponse<HSMemResponse.MemorizeData>> memorizeText(
            @Parameter(description = "文本记忆化请求") @RequestBody HSMemTextRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            // 从认证信息中提取用户ID
            String authenticatedUserId = getAuthenticatedUserId(userDetails);
            if (authenticatedUserId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("未登录或无法获取用户信息"));
            }
            
            // 自动设置 user_id
            if (request.getUser_id() == null || request.getUser_id().isEmpty()) {
                request.setUser_id(formatUserIdForHsmem(authenticatedUserId));
            }
            
            // 调用 hsmem 服务
            HSMemResponse.MemorizeData result = hsmemClientService.memorizeText(request);
            return ResponseEntity.ok(ApiResponse.success(result));
        } catch (Exception e) {
            log.error("记忆化文本失败", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("记忆化文本失败: " + e.getMessage()));
        }
    }
    
    @Operation(summary = "记忆化文档", description = "将文档内容提取为记忆")
    @PostMapping("/hsmem/memorize/document")
    public ResponseEntity<ApiResponse<HSMemResponse.MemorizeData>> memorizeDocument(
            @Parameter(description = "文档记忆化请求") @RequestBody HSMemDocumentRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            // 从认证信息中提取用户ID
            String authenticatedUserId = getAuthenticatedUserId(userDetails);
            if (authenticatedUserId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("未登录或无法获取用户信息"));
            }
            
            // 自动设置 user_id
            if (request.getUser_id() == null || request.getUser_id().isEmpty()) {
                request.setUser_id(formatUserIdForHsmem(authenticatedUserId));
            }
            
            // 调用 hsmem 服务
            HSMemResponse.MemorizeData result = hsmemClientService.memorizeDocument(request);
            return ResponseEntity.ok(ApiResponse.success(result));
        } catch (Exception e) {
            log.error("记忆化文档失败", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("记忆化文档失败: " + e.getMessage()));
        }
    }
    
    @Operation(summary = "检索记忆", description = "根据查询检索相关记忆")
    @PostMapping("/hsmem/retrieve")
    public ResponseEntity<ApiResponse<HSMemResponse.RetrieveData>> retrieve(
            @Parameter(description = "检索请求") @RequestBody HSMemRetrieveRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            // 从认证信息中提取用户ID
            String authenticatedUserId = getAuthenticatedUserId(userDetails);
            if (authenticatedUserId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("未登录或无法获取用户信息"));
            }
            
            // 自动添加 user_id 到过滤条件
            String formattedUserId = formatUserIdForHsmem(authenticatedUserId);
            if (request.getWhere() == null) {
                request.setWhere(new java.util.HashMap<>());
            }
            // 如果 where 中没有 user_id，自动添加
            if (!request.getWhere().containsKey("user_id")) {
                request.getWhere().put("user_id", formattedUserId);
            } else {
                // 验证 user_id 是否与认证用户一致
                Object userIdInWhere = request.getWhere().get("user_id");
                if (!formattedUserId.equals(userIdInWhere) && !authenticatedUserId.equals(userIdInWhere)) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(ApiResponse.error("无权查询其他用户的记忆"));
                }
            }
            
            // 调用 hsmem 服务
            HSMemResponse.RetrieveData result = hsmemClientService.retrieve(request);
            return ResponseEntity.ok(ApiResponse.success(result));
        } catch (Exception e) {
            log.error("检索记忆失败", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("检索记忆失败: " + e.getMessage()));
        }
    }
    
    @Operation(summary = "获取统计信息", description = "获取记忆系统统计信息")
    @GetMapping("/hsmem/statistics")
    public ResponseEntity<ApiResponse<HSMemResponse.StatisticsData>> getStatistics() {
        try {
            HSMemResponse.StatisticsData result = hsmemClientService.getStatistics();
            return ResponseEntity.ok(ApiResponse.success(result));
        } catch (Exception e) {
            log.error("获取统计信息失败", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("获取统计信息失败: " + e.getMessage()));
        }
    }
    
    @Operation(summary = "获取分类列表", description = "获取所有记忆分类")
    @GetMapping("/hsmem/categories")
    public ResponseEntity<ApiResponse<HSMemResponse.CategoriesData>> getCategories() {
        try {
            HSMemResponse.CategoriesData result = hsmemClientService.getCategories();
            return ResponseEntity.ok(ApiResponse.success(result));
        } catch (Exception e) {
            log.error("获取分类列表失败", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("获取分类列表失败: " + e.getMessage()));
        }
    }
    
    @Operation(summary = "获取记忆项列表", description = "获取所有记忆项（可选项按用户ID过滤）")
    @GetMapping("/hsmem/items")
    public ResponseEntity<ApiResponse<HSMemResponse.ItemsData>> getItems(
            @Parameter(description = "用户ID（可选）") @RequestParam(required = false) String user_id,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            // 从认证信息中提取用户ID
            String authenticatedUserId = getAuthenticatedUserId(userDetails);
            if (authenticatedUserId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("未登录或无法获取用户信息"));
            }
            
            // 如果没有提供 user_id，使用认证用户的ID
            String userIdToQuery = user_id;
            if (userIdToQuery == null || userIdToQuery.isEmpty()) {
                userIdToQuery = formatUserIdForHsmem(authenticatedUserId);
            } else {
                // 验证 user_id 是否与认证用户一致
                String formattedUserId = formatUserIdForHsmem(authenticatedUserId);
                if (!formattedUserId.equals(userIdToQuery) && !authenticatedUserId.equals(userIdToQuery)) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(ApiResponse.error("无权查询其他用户的记忆"));
                }
            }
            
            // 调用 hsmem 服务
            HSMemResponse.ItemsData result = hsmemClientService.getItems(userIdToQuery);
            return ResponseEntity.ok(ApiResponse.success(result));
        } catch (Exception e) {
            log.error("获取记忆项列表失败: user_id={}", user_id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("获取记忆项列表失败: " + e.getMessage()));
        }
    }
    
    @Operation(summary = "获取资源列表", description = "获取所有资源（仅管理员可访问）")
    @GetMapping("/hsmem/resources")
    public ResponseEntity<ApiResponse<HSMemResponse.ResourcesData>> getResources() {
        try {
            // TODO: 添加管理员权限验证
            HSMemResponse.ResourcesData result = hsmemClientService.getResources();
            return ResponseEntity.ok(ApiResponse.success(result));
        } catch (Exception e) {
            log.error("获取资源列表失败", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("获取资源列表失败: " + e.getMessage()));
        }
    }
}
