package com.heartsphere.skill.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.heartsphere.dto.ApiResponse;
import com.heartsphere.skill.dto.SkillExecutionRequest;
import com.heartsphere.skill.dto.SkillExecutionResultDTO;
import com.heartsphere.skill.service.SkillExecutor;
import com.heartsphere.security.UserDetailsImpl;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

/**
 * 技能执行 Controller
 * 
 * 技能系统独立模块
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Slf4j
@RestController
@RequestMapping("/api/skills/execute")
@RequiredArgsConstructor
public class SkillExecutionController {

    private static final long SSE_TIMEOUT_MS = 300_000L; // 5 分钟

    private final SkillExecutor skillExecutor;
    private final ObjectMapper objectMapper;

    /**
     * 执行技能
     */
    @PostMapping
    public ResponseEntity<ApiResponse<SkillExecutionResultDTO>> executeSkill(
            @RequestBody SkillExecutionRequest request,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        
        // 构建执行上下文
        SkillExecutor.SkillExecutionContext context = SkillExecutor.SkillExecutionContext.builder()
            .characterId(request.getCharacterId())
            .userId(userDetails.getId())
            .additionalContext(request.getAdditionalContext())
            .build();
        
        // 执行技能
        SkillExecutor.SkillExecutionResult result = skillExecutor.execute(
            request.getSkillId(),
            request.getParameters(),
            context
        );
        
        // 转换为 DTO
        SkillExecutionResultDTO dto = SkillExecutionResultDTO.builder()
            .skillId(result.getSkillId())
            .success(result.isSuccess())
            .result(result.getResult())
            .errorMessage(result.getErrorMessage())
            .executionTimeMs(result.getExecutionTimeMs())
            .build();
        
        if (result.isSuccess()) {
            return ResponseEntity.ok(ApiResponse.success(dto));
        } else {
            return ResponseEntity.ok(ApiResponse.error(500, result.getErrorMessage()));
        }
    }

    /**
     * 流式执行技能（SSE）
     * 事件顺序：start -> result 或 error -> complete
     */
    @PostMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter executeSkillStream(
            @RequestBody SkillExecutionRequest request,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        SseEmitter emitter = new SseEmitter(SSE_TIMEOUT_MS);

        emitter.onError(e -> log.warn("[SkillExecution] SSE 连接错误 - skillId={}", request.getSkillId(), e));
        emitter.onTimeout(() -> log.warn("[SkillExecution] SSE 连接超时 - skillId={}", request.getSkillId()));
        emitter.onCompletion(() -> log.debug("[SkillExecution] SSE 连接完成 - skillId={}", request.getSkillId()));

        CompletableFuture.runAsync(() -> {
            try {
                sendEvent(emitter, "start", Map.of("event", "start", "skillId", request.getSkillId() != null ? request.getSkillId() : ""));

                SkillExecutor.SkillExecutionContext context = SkillExecutor.SkillExecutionContext.builder()
                        .characterId(request.getCharacterId())
                        .userId(userDetails != null ? userDetails.getId() : null)
                        .additionalContext(request.getAdditionalContext())
                        .build();

                SkillExecutor.SkillExecutionResult result = skillExecutor.execute(
                        request.getSkillId(),
                        request.getParameters(),
                        context
                );

                SkillExecutionResultDTO dto = SkillExecutionResultDTO.builder()
                        .skillId(result.getSkillId())
                        .success(result.isSuccess())
                        .result(result.getResult())
                        .errorMessage(result.getErrorMessage())
                        .executionTimeMs(result.getExecutionTimeMs())
                        .build();

                Map<String, Object> resultPayload = new HashMap<>();
                resultPayload.put("event", "result");
                resultPayload.put("skillId", dto.getSkillId());
                resultPayload.put("success", Boolean.TRUE.equals(dto.getSuccess()));
                resultPayload.put("result", dto.getResult());
                resultPayload.put("errorMessage", dto.getErrorMessage());
                resultPayload.put("executionTimeMs", dto.getExecutionTimeMs());
                sendEvent(emitter, "result", resultPayload);
            } catch (Exception e) {
                log.error("[SkillExecution] 流式执行失败 - skillId={}", request.getSkillId(), e);
                try {
                    sendEvent(emitter, "error", Map.of("event", "error", "message", e.getMessage() != null ? e.getMessage() : "执行失败"));
                } catch (IOException ignored) {
                    // already failed
                }
            } finally {
                try {
                    emitter.complete();
                } catch (Exception ignored) {
                    // no-op
                }
            }
        });

        return emitter;
    }

    private void sendEvent(SseEmitter emitter, String eventName, Object data) throws IOException {
        String json = objectMapper.writeValueAsString(data);
        emitter.send(SseEmitter.event().name(eventName).data(json));
    }
}
