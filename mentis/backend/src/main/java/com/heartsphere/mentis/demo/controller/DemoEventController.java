package com.heartsphere.mentis.demo.controller;

import com.heartsphere.mentis.demo.service.DemoEventService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.UUID;

/**
 * 演示事件控制器
 * 提供 SSE 事件流接口
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Slf4j
@RestController
@RequestMapping("/api/demo/events")
@RequiredArgsConstructor
@Tag(name = "演示事件", description = "AgentScope Computer-Use 演示事件流 API")
public class DemoEventController {
    
    private final DemoEventService eventService;
    
    /**
     * 订阅会话的工具调用和虚拟机状态变更事件
     */
    @GetMapping(value = "/session/{sessionId}", produces = "text/event-stream")
    @Operation(summary = "订阅会话事件", description = "通过 SSE 订阅指定会话的工具调用和虚拟机状态变更事件")
    public SseEmitter subscribeSessionEvents(
            @Parameter(description = "会话ID") @PathVariable String sessionId) {
        
        log.info("Session SSE subscription request: sessionId={}", sessionId);
        return eventService.registerSessionEmitter(sessionId);
    }
    
    /**
     * 订阅全局事件（用于管理端监控所有会话）
     */
    @GetMapping(value = "/global", produces = "text/event-stream")
    @Operation(summary = "订阅全局事件", description = "通过 SSE 订阅所有会话的工具调用和虚拟机状态变更事件（管理端使用）")
    public SseEmitter subscribeGlobalEvents() {
        String connectionId = UUID.randomUUID().toString();
        log.info("Global SSE subscription request: connectionId={}", connectionId);
        return eventService.registerGlobalEmitter(connectionId);
    }
}
