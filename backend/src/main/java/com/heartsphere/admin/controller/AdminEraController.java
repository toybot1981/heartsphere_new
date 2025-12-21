package com.heartsphere.admin.controller;

import com.heartsphere.admin.dto.SystemEraDTO;
import com.heartsphere.admin.service.SystemEraService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 系统时代管理控制器
 */
@RestController
@RequestMapping("/api/admin/system/eras")
public class AdminEraController extends BaseAdminController {

    @Autowired
    private SystemEraService eraService;

    @GetMapping(produces = "application/json;charset=UTF-8")
    public ResponseEntity<List<SystemEraDTO>> getAllEras(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        return ResponseEntity.ok(eraService.getAllEras());
    }

    @GetMapping(value = "/{id}", produces = "application/json;charset=UTF-8")
    public ResponseEntity<SystemEraDTO> getEraById(
            @PathVariable Long id,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        return ResponseEntity.ok(eraService.getEraById(id));
    }

    @PostMapping(produces = "application/json;charset=UTF-8")
    public ResponseEntity<SystemEraDTO> createEra(
            @RequestBody SystemEraDTO dto,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        return ResponseEntity.ok(eraService.createEra(dto));
    }

    @PutMapping(value = "/{id}", produces = "application/json;charset=UTF-8")
    public ResponseEntity<SystemEraDTO> updateEra(
            @PathVariable Long id,
            @RequestBody SystemEraDTO dto,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        return ResponseEntity.ok(eraService.updateEra(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEra(
            @PathVariable Long id,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        eraService.deleteEra(id);
        return ResponseEntity.noContent().build();
    }
}

