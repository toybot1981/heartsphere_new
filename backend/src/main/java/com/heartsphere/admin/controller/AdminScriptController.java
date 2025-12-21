package com.heartsphere.admin.controller;

import com.heartsphere.admin.dto.SystemScriptDTO;
import com.heartsphere.admin.service.SystemScriptService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 系统剧本管理控制器
 */
@RestController
@RequestMapping("/api/admin/system/system-scripts")
public class AdminScriptController extends BaseAdminController {

    @Autowired
    private SystemScriptService scriptService;

    @GetMapping
    public ResponseEntity<List<SystemScriptDTO>> getAllSystemScripts(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        return ResponseEntity.ok(scriptService.getAllScripts());
    }

    @GetMapping("/{id}")
    public ResponseEntity<SystemScriptDTO> getSystemScriptById(
            @PathVariable Long id,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        return ResponseEntity.ok(scriptService.getScriptById(id));
    }

    /**
     * 批量更新所有系统预置剧本的节点，为每个节点生成AI旁白提示词
     */
    @PostMapping("/update-prompts")
    public ResponseEntity<Map<String, Object>> updateAllSystemScriptsWithPrompts(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        int updatedCount = scriptService.updateAllScriptsWithPrompts();
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("updatedCount", updatedCount);
        response.put("message", String.format("成功更新 %d 个系统预置剧本的AI旁白提示词", updatedCount));
        return ResponseEntity.ok(response);
    }
}

