package com.heartsphere.admin.controller;

import com.heartsphere.admin.dto.ApiKeyDTO;
import com.heartsphere.admin.dto.CreateApiKeyRequest;
import com.heartsphere.admin.entity.SystemAdmin;
import com.heartsphere.admin.service.ApiKeyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * API Key管理控制器
 */
@RestController
@RequestMapping("/api/admin/api-keys")
public class AdminApiKeyController extends BaseAdminController {

    @Autowired
    private ApiKeyService apiKeyService;

    /**
     * 获取所有API Key
     */
    @GetMapping
    public ResponseEntity<List<ApiKeyDTO>> getAllApiKeys(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        return ResponseEntity.ok(apiKeyService.getAllApiKeys());
    }

    /**
     * 根据ID获取API Key
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiKeyDTO> getApiKeyById(
            @PathVariable Long id,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        return ResponseEntity.ok(apiKeyService.getApiKeyById(id));
    }

    /**
     * 创建API Key
     */
    @PostMapping
    public ResponseEntity<ApiKeyDTO> createApiKey(
            @RequestBody CreateApiKeyRequest request,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        SystemAdmin admin = validateAdmin(authHeader);
        return ResponseEntity.ok(apiKeyService.createApiKey(request, admin.getId()));
    }

    /**
     * 启用/禁用API Key
     */
    @PutMapping("/{id}/toggle")
    public ResponseEntity<ApiKeyDTO> toggleApiKey(
            @PathVariable Long id,
            @RequestParam Boolean isActive,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        return ResponseEntity.ok(apiKeyService.toggleApiKey(id, isActive));
    }

    /**
     * 删除API Key
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteApiKey(
            @PathVariable Long id,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        apiKeyService.deleteApiKey(id);
        return ResponseEntity.ok().build();
    }
}



