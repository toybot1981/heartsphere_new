package com.heartsphere.admin.controller;

import com.heartsphere.admin.service.PresetScriptGeneratorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * 预置剧本生成控制器
 */
@RestController
@RequestMapping("/api/admin/preset-scripts")
public class PresetScriptGeneratorController extends BaseAdminController {

    @Autowired
    private PresetScriptGeneratorService generatorService;

    /**
     * 为所有预置场景生成剧本
     */
    @PostMapping("/generate")
    public ResponseEntity<Map<String, Object>> generateScripts(
            @RequestHeader("Authorization") String authHeader
    ) {
        validateAdmin(authHeader);
        
        try {
            int count = generatorService.generateScriptsForAllEras();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", String.format("成功生成 %d 个预置剧本", count));
            response.put("count", count);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "生成剧本失败: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }
}





