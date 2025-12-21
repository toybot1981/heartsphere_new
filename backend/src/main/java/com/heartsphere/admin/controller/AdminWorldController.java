package com.heartsphere.admin.controller;

import com.heartsphere.admin.dto.SystemWorldDTO;
import com.heartsphere.admin.service.SystemWorldService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 系统世界管理控制器
 */
@RestController
@RequestMapping("/api/admin/system/worlds")
public class AdminWorldController extends BaseAdminController {

    @Autowired
    private SystemWorldService worldService;

    @GetMapping
    public ResponseEntity<List<SystemWorldDTO>> getAllWorlds(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        return ResponseEntity.ok(worldService.getAllWorlds());
    }

    @GetMapping("/{id}")
    public ResponseEntity<SystemWorldDTO> getWorldById(
            @PathVariable Long id,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        return ResponseEntity.ok(worldService.getWorldById(id));
    }

    @PostMapping
    public ResponseEntity<SystemWorldDTO> createWorld(
            @RequestBody SystemWorldDTO dto,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        return ResponseEntity.ok(worldService.createWorld(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<SystemWorldDTO> updateWorld(
            @PathVariable Long id,
            @RequestBody SystemWorldDTO dto,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        return ResponseEntity.ok(worldService.updateWorld(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteWorld(
            @PathVariable Long id,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        worldService.deleteWorld(id);
        return ResponseEntity.noContent().build();
    }
}

