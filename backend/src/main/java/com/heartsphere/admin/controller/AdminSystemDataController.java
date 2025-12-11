package com.heartsphere.admin.controller;

import com.heartsphere.admin.dto.SystemCharacterDTO;
import com.heartsphere.admin.dto.SystemEraDTO;
import com.heartsphere.admin.dto.SystemWorldDTO;
import com.heartsphere.admin.service.AdminAuthService;
import com.heartsphere.admin.service.SystemDataService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/admin/system")
public class AdminSystemDataController {

    @Autowired
    private SystemDataService systemDataService;

    @Autowired
    private AdminAuthService adminAuthService;

    /**
     * 验证管理员token的拦截器方法
     */
    private void validateAdmin(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new RuntimeException("需要管理员认证");
        }
        String token = authHeader.substring(7);
        adminAuthService.validateToken(token);
    }

    // ========== SystemWorld APIs ==========
    @GetMapping("/worlds")
    public ResponseEntity<List<SystemWorldDTO>> getAllWorlds(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        return ResponseEntity.ok(systemDataService.getAllWorlds());
    }

    @GetMapping("/worlds/{id}")
    public ResponseEntity<SystemWorldDTO> getWorldById(
            @PathVariable Long id,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        return ResponseEntity.ok(systemDataService.getWorldById(id));
    }

    @PostMapping("/worlds")
    public ResponseEntity<SystemWorldDTO> createWorld(
            @RequestBody SystemWorldDTO dto,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        return ResponseEntity.ok(systemDataService.createWorld(dto));
    }

    @PutMapping("/worlds/{id}")
    public ResponseEntity<SystemWorldDTO> updateWorld(
            @PathVariable Long id,
            @RequestBody SystemWorldDTO dto,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        return ResponseEntity.ok(systemDataService.updateWorld(id, dto));
    }

    @DeleteMapping("/worlds/{id}")
    public ResponseEntity<Void> deleteWorld(
            @PathVariable Long id,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        systemDataService.deleteWorld(id);
        return ResponseEntity.noContent().build();
    }

    // ========== SystemEra APIs ==========
    @GetMapping("/eras")
    public ResponseEntity<List<SystemEraDTO>> getAllEras(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        return ResponseEntity.ok(systemDataService.getAllEras());
    }

    @GetMapping("/eras/{id}")
    public ResponseEntity<SystemEraDTO> getEraById(
            @PathVariable Long id,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        return ResponseEntity.ok(systemDataService.getEraById(id));
    }

    @PostMapping("/eras")
    public ResponseEntity<SystemEraDTO> createEra(
            @RequestBody SystemEraDTO dto,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        return ResponseEntity.ok(systemDataService.createEra(dto));
    }

    @PutMapping("/eras/{id}")
    public ResponseEntity<SystemEraDTO> updateEra(
            @PathVariable Long id,
            @RequestBody SystemEraDTO dto,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        return ResponseEntity.ok(systemDataService.updateEra(id, dto));
    }

    @DeleteMapping("/eras/{id}")
    public ResponseEntity<Void> deleteEra(
            @PathVariable Long id,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        systemDataService.deleteEra(id);
        return ResponseEntity.noContent().build();
    }

    // ========== SystemCharacter APIs ==========
    @GetMapping("/characters")
    public ResponseEntity<List<SystemCharacterDTO>> getAllCharacters(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        java.util.logging.Logger logger = java.util.logging.Logger.getLogger(AdminSystemDataController.class.getName());
        logger.info("========== [AdminSystemDataController] 获取所有系统角色 ==========");
        validateAdmin(authHeader);
        List<SystemCharacterDTO> result = systemDataService.getAllCharacters();
        logger.info(String.format("[AdminSystemDataController] 返回 %d 个系统角色", result.size()));
        return ResponseEntity.ok(result);
    }

    @GetMapping("/characters/{id}")
    public ResponseEntity<SystemCharacterDTO> getCharacterById(
            @PathVariable Long id,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        java.util.logging.Logger logger = java.util.logging.Logger.getLogger(AdminSystemDataController.class.getName());
        logger.info(String.format("========== [AdminSystemDataController] 获取系统角色详情 ========== ID: %d", id));
        validateAdmin(authHeader);
        SystemCharacterDTO result = systemDataService.getCharacterById(id);
        logger.info(String.format("[AdminSystemDataController] 成功获取系统角色: ID=%d, name=%s", result.getId(), result.getName()));
        return ResponseEntity.ok(result);
    }

    @PostMapping("/characters")
    public ResponseEntity<SystemCharacterDTO> createCharacter(
            @RequestBody SystemCharacterDTO dto,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        java.util.logging.Logger logger = java.util.logging.Logger.getLogger(AdminSystemDataController.class.getName());
        logger.info("========== [AdminSystemDataController] 创建系统角色 ==========");
        logger.info(String.format("[AdminSystemDataController] 请求参数: name=%s, role=%s", dto.getName(), dto.getRole()));
        validateAdmin(authHeader);
        SystemCharacterDTO result = systemDataService.createCharacter(dto);
        logger.info(String.format("[AdminSystemDataController] 系统角色创建成功: ID=%d, name=%s", result.getId(), result.getName()));
        return ResponseEntity.ok(result);
    }

    @PutMapping("/characters/{id}")
    public ResponseEntity<SystemCharacterDTO> updateCharacter(
            @PathVariable Long id,
            @RequestBody SystemCharacterDTO dto,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        java.util.logging.Logger logger = java.util.logging.Logger.getLogger(AdminSystemDataController.class.getName());
        logger.info(String.format("========== [AdminSystemDataController] 更新系统角色 ========== ID: %d", id));
        logger.info(String.format("[AdminSystemDataController] 请求参数: name=%s, role=%s", dto.getName(), dto.getRole()));
        validateAdmin(authHeader);
        SystemCharacterDTO result = systemDataService.updateCharacter(id, dto);
        logger.info(String.format("[AdminSystemDataController] 系统角色更新成功: ID=%d, name=%s", result.getId(), result.getName()));
        return ResponseEntity.ok(result);
    }

    @DeleteMapping("/characters/{id}")
    public ResponseEntity<Void> deleteCharacter(
            @PathVariable Long id,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        java.util.logging.Logger logger = java.util.logging.Logger.getLogger(AdminSystemDataController.class.getName());
        logger.info(String.format("========== [AdminSystemDataController] 删除系统角色 ========== ID: %d", id));
        validateAdmin(authHeader);
        systemDataService.deleteCharacter(id);
        logger.info(String.format("[AdminSystemDataController] 系统角色删除成功: ID=%d", id));
        return ResponseEntity.noContent().build();
    }
}

