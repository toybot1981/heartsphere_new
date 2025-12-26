package com.heartsphere.aistudio.controller;

import com.heartsphere.aistudio.context.ContextManager;
import com.heartsphere.aistudio.context.model.ContextMessage;
import com.heartsphere.aistudio.context.model.ContextSession;
import com.heartsphere.aistudio.context.model.OptimizationStrategy;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.messages.Message;
import org.springframework.ai.chat.messages.MessageType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.Map;

/**
 * 上下文管理 REST API 控制器
 */
@Slf4j
@RestController
@RequestMapping("/api/context")
@RequiredArgsConstructor
public class ContextController {

    private final ContextManager contextManager;

    /**
     * 初始化会话
     * POST /api/context/sessions
     */
    @PostMapping("/sessions")
    public ResponseEntity<Map<String, Object>> initializeSession(
        @RequestBody Map<String, String> request) {

        String sessionId = request.get("sessionId");
        String userId = request.get("userId");
        String agentId = request.get("agentId");

        if (sessionId == null || userId == null || agentId == null) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", "Missing required fields: sessionId, userId, agentId"
            ));
        }

        ContextSession session = contextManager.initializeSession(sessionId, userId, agentId);

        return ResponseEntity.ok(Map.of(
            "sessionId", session.getSessionId(),
            "userId", session.getUserId(),
            "agentId", session.getAgentId(),
            "status", session.getStatus(),
            "createdAt", session.getCreatedAt()
        ));
    }

    /**
     * 获取会话信息
     * GET /api/context/sessions/{sessionId}
     */
    @GetMapping("/sessions/{sessionId}")
    public ResponseEntity<Map<String, Object>> getSession(@PathVariable String sessionId) {
        ContextSession session = contextManager.getSession(sessionId);

        if (session == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(Map.of(
            "sessionId", session.getSessionId(),
            "userId", session.getUserId(),
            "agentId", session.getAgentId(),
            "status", session.getStatus(),
            "messageCount", session.getMessageCount(),
            "totalTokens", session.getTotalTokens(),
            "maxTokens", session.getMaxTokens(),
            "createdAt", session.getCreatedAt(),
            "lastActiveAt", session.getLastActiveAt()
        ));
    }

    /**
     * 获取会话统计信息
     * GET /api/context/sessions/{sessionId}/stats
     */
    @GetMapping("/sessions/{sessionId}/stats")
    public ResponseEntity<Map<String, Object>> getSessionStats(@PathVariable String sessionId) {
        Map<String, Object> stats = contextManager.getSessionStats(sessionId);

        if (stats.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(stats);
    }

    /**
     * 添加消息到会话
     * POST /api/context/sessions/{sessionId}/messages
     */
    @PostMapping("/sessions/{sessionId}/messages")
    public ResponseEntity<Map<String, String>> addMessage(
        @PathVariable String sessionId,
        @RequestBody Map<String, Object> request) {

        String content = (String) request.get("content");
        String type = (String) request.get("type");
        String userId = (String) request.get("userId");

        if (content == null || type == null) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", "Missing required fields: content, type"
            ));
        }

        MessageType messageType = MessageType.valueOf(type.toUpperCase());

        ContextMessage message = ContextMessage.builder()
            .messageType(messageType)
            .content(content)
            .sessionId(sessionId)
            .userId(userId)
            .timestamp(Instant.now())
            .build();

        contextManager.addMessage(sessionId, message);

        return ResponseEntity.ok(Map.of(
            "status", "success",
            "messageId", message.getMessageId()
        ));
    }

    /**
     * 获取会话消息
     * GET /api/context/sessions/{sessionId}/messages
     */
    @GetMapping("/sessions/{sessionId}/messages")
    public ResponseEntity<Map<String, Object>> getMessages(
        @PathVariable String sessionId,
        @RequestParam(defaultValue = "50") int limit,
        @RequestParam(required = false) Boolean optimized) {

        List<ContextMessage> messages;

        if (optimized != null && optimized) {
            // 获取优化后的上下文
            messages = contextManager.getOptimizedContext(sessionId, 8000);
        } else {
            // 获取最近的消息
            messages = contextManager.getRecentMessages(sessionId, limit);
        }

        return ResponseEntity.ok(Map.of(
            "sessionId", sessionId,
            "count", messages.size(),
            "messages", messages
        ));
    }

    /**
     * 获取优化后的上下文
     * GET /api/context/sessions/{sessionId}/optimized
     */
    @GetMapping("/sessions/{sessionId}/optimized")
    public ResponseEntity<Map<String, Object>> getOptimizedContext(
        @PathVariable String sessionId,
        @RequestParam(defaultValue = "8000") int maxTokens,
        @RequestParam(defaultValue = "HYBRID") String strategy) {

        List<ContextMessage> messages =
            contextManager.getOptimizedContext(sessionId, maxTokens);

        long totalTokens = messages.stream()
            .mapToLong(ContextMessage::estimateTokens)
            .sum();

        return ResponseEntity.ok(Map.of(
            "sessionId", sessionId,
            "maxTokens", maxTokens,
            "strategy", strategy,
            "messageCount", messages.size(),
            "estimatedTokens", totalTokens,
            "messages", messages
        ));
    }

    /**
     * 转换为 Spring AI Messages 格式
     * POST /api/context/sessions/{sessionId}/to-spring-ai
     */
    @PostMapping("/sessions/{sessionId}/to-spring-ai")
    public ResponseEntity<Map<String, Object>> toSpringAIMessages(
        @PathVariable String sessionId,
        @RequestBody(required = false) Map<String, Object> options) {

        List<ContextMessage> contextMessages;
        if (options != null && Boolean.TRUE.equals(options.get("optimized"))) {
            Integer maxTokens = (Integer) options.getOrDefault("maxTokens", 8000);
            contextMessages = contextManager.getOptimizedContext(sessionId, maxTokens);
        } else {
            contextMessages = contextManager.getAllMessages(sessionId);
        }

        List<Message> springAIMessages = contextManager.toSpringAIMessages(contextMessages);

        return ResponseEntity.ok(Map.of(
            "sessionId", sessionId,
            "count", springAIMessages.size(),
            "messages", springAIMessages
        ));
    }

    /**
     * 清除会话上下文
     * DELETE /api/context/sessions/{sessionId}/messages
     */
    @DeleteMapping("/sessions/{sessionId}/messages")
    public ResponseEntity<Map<String, String>> clearContext(@PathVariable String sessionId) {
        contextManager.clearContext(sessionId);

        return ResponseEntity.ok(Map.of(
            "status", "success",
            "message", "Context cleared for session: " + sessionId
        ));
    }

    /**
     * 归档会话
     * POST /api/context/sessions/{sessionId}/archive
     */
    @PostMapping("/sessions/{sessionId}/archive")
    public ResponseEntity<Map<String, String>> archiveSession(@PathVariable String sessionId) {
        contextManager.archiveSession(sessionId);

        return ResponseEntity.ok(Map.of(
            "status", "success",
            "message", "Session archived: " + sessionId
        ));
    }

    /**
     * 删除会话
     * DELETE /api/context/sessions/{sessionId}
     */
    @DeleteMapping("/sessions/{sessionId}")
    public ResponseEntity<Map<String, String>> deleteSession(@PathVariable String sessionId) {
        contextManager.deleteSession(sessionId);

        return ResponseEntity.ok(Map.of(
            "status", "success",
            "message", "Session deleted: " + sessionId
        ));
    }

    /**
     * 获取所有会话ID
     * GET /api/context/sessions
     */
    @GetMapping("/sessions")
    public ResponseEntity<Map<String, Object>> getAllSessions() {
        List<String> sessionIds = contextManager.getAllSessionIds();

        return ResponseEntity.ok(Map.of(
            "count", sessionIds.size(),
            "sessionIds", sessionIds
        ));
    }

    /**
     * 检查会话是否存在
     * HEAD /api/context/sessions/{sessionId}
     */
    @RequestMapping(value = "/sessions/{sessionId}", method = RequestMethod.HEAD)
    public ResponseEntity<Void> checkSessionExists(@PathVariable String sessionId) {
        boolean exists = contextManager.sessionExists(sessionId);
        return exists ? ResponseEntity.ok().<Void>build()
                       : ResponseEntity.notFound().<Void>build();
    }
}
