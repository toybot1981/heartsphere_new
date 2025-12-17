package com.heartsphere.controller;

import com.heartsphere.admin.dto.SystemScriptDTO;
import com.heartsphere.admin.service.SystemDataService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/system/scripts")
public class SystemScriptController {

    @Autowired
    private SystemDataService systemDataService;

    /**
     * 获取所有系统预设剧本
     */
    @GetMapping(produces = "application/json;charset=UTF-8")
    public ResponseEntity<List<SystemScriptDTO>> getAllScripts() {
        List<SystemScriptDTO> scripts = systemDataService.getAllScripts();
        return ResponseEntity.ok(scripts);
    }

    /**
     * 根据时代ID获取系统预设剧本
     */
    @GetMapping(value = "/era/{eraId}", produces = "application/json;charset=UTF-8")
    public ResponseEntity<List<SystemScriptDTO>> getScriptsByEraId(@PathVariable Long eraId) {
        List<SystemScriptDTO> scripts = systemDataService.getScriptsByEraId(eraId);
        return ResponseEntity.ok(scripts);
    }

    /**
     * 根据ID获取系统预设剧本
     */
    @GetMapping(value = "/{id}", produces = "application/json;charset=UTF-8")
    public ResponseEntity<SystemScriptDTO> getScriptById(@PathVariable Long id) {
        SystemScriptDTO script = systemDataService.getScriptById(id);
        return ResponseEntity.ok(script);
    }
}



