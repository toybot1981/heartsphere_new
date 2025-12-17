package com.heartsphere.aiagent.controller;

import com.heartsphere.aiagent.service.AgentService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

/**
 * 旅游助手对话控制器
 * 提供对话式交互接口
 */
@Slf4j
@RestController
@RequestMapping("/api/travel/chat")
@RequiredArgsConstructor
public class TravelChatController {
    
    private final AgentService agentService;
    
    private static final String TRAVEL_ASSISTANT_AGENT_ID = "travel-chat-assistant";
    
    /**
     * 对话接口（流式响应）
     */
    @PostMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter chatStream(@RequestBody ChatRequest request) {
        SseEmitter emitter = new SseEmitter(60000L); // 60秒超时
        
        new Thread(() -> {
            try {
                // 获取旅游助手 Agent
                var agent = agentService.getAgent(TRAVEL_ASSISTANT_AGENT_ID);
                if (agent == null) {
                    emitter.send(SseEmitter.event().name("error").data("旅游助手 Agent 未找到"));
                    emitter.complete();
                    return;
                }
                
                // 发送开始事件
                emitter.send(SseEmitter.event().name("start").data("开始处理..."));
                
                // 构建输入（包含对话历史）
                Map<String, Object> input = new HashMap<>();
                input.put("message", request.getMessage());
                input.put("userId", request.getUserId());
                if (request.getHistory() != null) {
                    input.put("history", request.getHistory());
                }
                
                // 执行 Agent（这里简化处理，实际应该支持流式输出）
                Object result = agent.execute(input);
                
                // 发送结果
                if (result instanceof Map) {
                    @SuppressWarnings("unchecked")
                    Map<String, Object> resultMap = (Map<String, Object>) result;
                    if (resultMap.containsKey("text")) {
                        String text = resultMap.get("text").toString();
                        // 模拟流式输出
                        String[] words = text.split("");
                        for (String word : words) {
                            emitter.send(SseEmitter.event().name("message").data(word));
                            Thread.sleep(50); // 模拟打字效果
                        }
                    }
                } else {
                    emitter.send(SseEmitter.event().name("message").data(result.toString()));
                }
                
                // 发送完成事件
                emitter.send(SseEmitter.event().name("complete").data("完成"));
                emitter.complete();
                
            } catch (Exception e) {
                log.error("对话处理失败", e);
                try {
                    emitter.send(SseEmitter.event().name("error").data(e.getMessage()));
                } catch (IOException ex) {
                    log.error("发送错误失败", ex);
                }
                emitter.completeWithError(e);
            }
        }).start();
        
        return emitter;
    }
    
    /**
     * 对话接口（同步响应）
     */
    @PostMapping("/message")
    public ResponseEntity<ChatResponse> chat(@RequestBody ChatRequest request) {
        try {
            // 获取旅游助手 Agent
            var agent = agentService.getAgent(TRAVEL_ASSISTANT_AGENT_ID);
            if (agent == null) {
                return ResponseEntity.ok(new ChatResponse(false, null, "旅游助手 Agent 未找到"));
            }
            
            // 构建输入
            Map<String, Object> input = new HashMap<>();
            input.put("message", request.getMessage());
            input.put("userId", request.getUserId());
            if (request.getHistory() != null) {
                input.put("history", request.getHistory());
            }
            
            // 执行 Agent
            Object result = agent.execute(input);
            
            // 构建响应
            String responseText = result != null ? result.toString() : "抱歉，我无法处理您的请求。";
            
            return ResponseEntity.ok(new ChatResponse(true, responseText, null));
            
        } catch (Exception e) {
            log.error("对话处理失败", e);
            return ResponseEntity.ok(new ChatResponse(false, null, e.getMessage()));
        }
    }
    
    /**
     * 获取对话历史
     */
    @GetMapping("/history")
    public ResponseEntity<Map<String, Object>> getHistory(@RequestParam String userId) {
        // TODO: 从数据库或缓存中获取对话历史
        Map<String, Object> history = new HashMap<>();
        history.put("userId", userId);
        history.put("messages", new java.util.ArrayList<>());
        return ResponseEntity.ok(history);
    }
    
    @Data
    public static class ChatRequest {
        private String message;
        private String userId;
        private java.util.List<Map<String, String>> history; // 对话历史
    }
    
    @Data
    public static class ChatResponse {
        private boolean success;
        private String message;
        private String error;
        
        public ChatResponse(boolean success, String message, String error) {
            this.success = success;
            this.message = message;
            this.error = error;
        }
    }
}





