package com.heartsphere.controller;

import com.heartsphere.admin.dto.SystemScriptDTO;
import com.heartsphere.admin.service.SystemDataService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 客户端预置剧本接口（公开接口，不需要认证）
 * 用于初始化向导等客户端功能
 */
@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/preset-scripts")
public class PresetScriptController {

    @Autowired
    private SystemDataService systemDataService;

    /**
     * 获取所有系统预设剧本（客户端公开接口）
     */
    @GetMapping(produces = "application/json;charset=UTF-8")
    public ResponseEntity<List<SystemScriptDTO>> getAllScripts() {
        List<SystemScriptDTO> scripts = systemDataService.getAllScripts();
        return ResponseEntity.ok(scripts);
    }

    /**
     * 根据时代ID获取系统预设剧本（客户端公开接口）
     */
    @GetMapping(value = "/era/{eraId}", produces = "application/json;charset=UTF-8")
    public ResponseEntity<List<SystemScriptDTO>> getScriptsByEraId(@PathVariable Long eraId) {
        List<SystemScriptDTO> scripts = systemDataService.getScriptsByEraId(eraId);
        return ResponseEntity.ok(scripts);
    }

    /**
     * 根据ID获取系统预设剧本（客户端公开接口）
     */
    @GetMapping(value = "/{id}", produces = "application/json;charset=UTF-8")
    public ResponseEntity<SystemScriptDTO> getScriptById(@PathVariable Long id) {
        SystemScriptDTO script = systemDataService.getScriptById(id);
        if (script == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(script);
    }
}




