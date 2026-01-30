package com.heartsphere.ai.mcp.controller;

import com.heartsphere.ai.mcp.entity.McpServiceTemplate;
import com.heartsphere.ai.mcp.service.McpServiceTemplateService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * MCP 服务模板 REST API（main 项目 ai/mcp）
 */
@RestController
@RequestMapping("/api/v1/ai/mcp/templates")
@RequiredArgsConstructor
@Slf4j
public class McpTemplateController {

    private final McpServiceTemplateService templateService;

    @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<String, Object>> getAllTemplates(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Boolean popular) {
        try {
            List<McpServiceTemplate> list;
            if (Boolean.TRUE.equals(popular)) {
                list = templateService.getPopularTemplates();
            } else if (category != null && !category.isBlank()) {
                list = templateService.getTemplatesByCategory(category);
            } else {
                list = templateService.getAllTemplates();
            }
            return ResponseEntity.ok(ok("success", list));
        } catch (Exception e) {
            log.error("Failed to get MCP templates", e);
            return ResponseEntity.badRequest().body(err(e.getMessage()));
        }
    }

    @GetMapping(value = "/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<String, Object>> getTemplateById(@PathVariable Long id) {
        try {
            return templateService.getTemplateById(id)
                    .map(t -> ResponseEntity.ok(ok("success", t)))
                    .orElse(ResponseEntity.ok(err("模板不存在")));
        } catch (Exception e) {
            log.error("Failed to get MCP template: {}", id, e);
            return ResponseEntity.badRequest().body(err(e.getMessage()));
        }
    }

    private static Map<String, Object> ok(String message, Object data) {
        Map<String, Object> m = new HashMap<>();
        m.put("code", 200);
        m.put("message", message);
        m.put("data", data);
        return m;
    }

    private static Map<String, Object> err(String message) {
        Map<String, Object> m = new HashMap<>();
        m.put("code", 500);
        m.put("message", message);
        m.put("data", null);
        return m;
    }
}
