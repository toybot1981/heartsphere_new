package com.heartsphere.admin.controller.cmdb;

import com.heartsphere.admin.controller.BaseAdminController;
import com.heartsphere.admin.dto.cmdb.*;
import com.heartsphere.admin.entity.SystemAdmin;
import com.heartsphere.admin.service.cmdb.CMDBService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * CMDB管理控制器
 */
@RestController
@RequestMapping("/api/admin/cmdb")
public class CMDBController extends BaseAdminController {
    
    @Autowired
    private CMDBService cmdbService;
    
    // ========== Asset Type APIs ==========
    
    /**
     * 获取所有资产类型
     */
    @GetMapping("/asset-types")
    public ResponseEntity<List<AssetTypeDTO>> getAllAssetTypes(
            @RequestHeader("Authorization") String token) {
        SystemAdmin admin = validateAdminToken(token);
        List<AssetTypeDTO> types = cmdbService.getAllAssetTypes();
        return ResponseEntity.ok(types);
    }
    
    /**
     * 获取资产类型详情
     */
    @GetMapping("/asset-types/{id}")
    public ResponseEntity<AssetTypeDTO> getAssetType(
            @RequestHeader("Authorization") String token,
            @PathVariable Long id) {
        SystemAdmin admin = validateAdminToken(token);
        AssetTypeDTO type = cmdbService.getAssetType(id);
        return ResponseEntity.ok(type);
    }
    
    // ========== Asset APIs ==========
    
    /**
     * 创建资产
     */
    @PostMapping("/assets")
    public ResponseEntity<AssetDTO> createAsset(
            @RequestHeader("Authorization") String token,
            @RequestBody AssetDTO dto) {
        SystemAdmin admin = validateAdminToken(token);
        AssetDTO created = cmdbService.createAsset(dto, admin);
        return ResponseEntity.ok(created);
    }
    
    /**
     * 更新资产
     */
    @PutMapping("/assets/{id}")
    public ResponseEntity<AssetDTO> updateAsset(
            @RequestHeader("Authorization") String token,
            @PathVariable Long id,
            @RequestBody AssetDTO dto) {
        SystemAdmin admin = validateAdminToken(token);
        AssetDTO updated = cmdbService.updateAsset(id, dto, admin);
        return ResponseEntity.ok(updated);
    }
    
    /**
     * 删除资产
     */
    @DeleteMapping("/assets/{id}")
    public ResponseEntity<Void> deleteAsset(
            @RequestHeader("Authorization") String token,
            @PathVariable Long id) {
        SystemAdmin admin = validateAdminToken(token);
        cmdbService.deleteAsset(id, admin);
        return ResponseEntity.ok().build();
    }
    
    /**
     * 获取资产详情
     */
    @GetMapping("/assets/{id}")
    public ResponseEntity<AssetDTO> getAsset(
            @RequestHeader("Authorization") String token,
            @PathVariable Long id) {
        SystemAdmin admin = validateAdminToken(token);
        AssetDTO asset = cmdbService.getAsset(id);
        return ResponseEntity.ok(asset);
    }
    
    /**
     * 搜索资产
     */
    @PostMapping("/assets/search")
    public ResponseEntity<Page<AssetDTO>> searchAssets(
            @RequestHeader("Authorization") String token,
            @RequestBody AssetSearchRequest request,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        SystemAdmin admin = validateAdminToken(token);
        if (request.getPage() == null) request.setPage(page);
        if (request.getSize() == null) request.setSize(size);
        Page<AssetDTO> assets = cmdbService.searchAssets(request);
        return ResponseEntity.ok(assets);
    }
    
    /**
     * 获取资产列表（简化版，支持查询参数）
     */
    @GetMapping("/assets")
    public ResponseEntity<Page<AssetDTO>> getAssets(
            @RequestHeader("Authorization") String token,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) Long typeId,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        SystemAdmin admin = validateAdminToken(token);
        AssetSearchRequest request = new AssetSearchRequest();
        request.setName(name);
        request.setTypeId(typeId);
        request.setStatus(status);
        request.setPage(page);
        request.setSize(size);
        Page<AssetDTO> assets = cmdbService.searchAssets(request);
        return ResponseEntity.ok(assets);
    }
    
    // ========== Relationship APIs ==========
    
    /**
     * 创建资产关系
     */
    @PostMapping("/relationships")
    public ResponseEntity<AssetRelationshipDTO> createRelationship(
            @RequestHeader("Authorization") String token,
            @RequestBody AssetRelationshipDTO dto) {
        SystemAdmin admin = validateAdminToken(token);
        AssetRelationshipDTO created = cmdbService.createRelationship(dto, admin);
        return ResponseEntity.ok(created);
    }
    
    /**
     * 获取资产的所有关系
     */
    @GetMapping("/assets/{assetId}/relationships")
    public ResponseEntity<List<AssetRelationshipDTO>> getAssetRelationships(
            @RequestHeader("Authorization") String token,
            @PathVariable Long assetId) {
        SystemAdmin admin = validateAdminToken(token);
        List<AssetRelationshipDTO> relationships = cmdbService.getAssetRelationships(assetId);
        return ResponseEntity.ok(relationships);
    }
    
    // ========== History APIs ==========
    
    /**
     * 获取资产历史
     */
    @GetMapping("/assets/{assetId}/history")
    public ResponseEntity<List<AssetHistoryDTO>> getAssetHistory(
            @RequestHeader("Authorization") String token,
            @PathVariable Long assetId) {
        SystemAdmin admin = validateAdminToken(token);
        List<AssetHistoryDTO> history = cmdbService.getAssetHistory(assetId);
        return ResponseEntity.ok(history);
    }
    
    // ========== Audit Log APIs ==========
    
    /**
     * 获取审计日志
     */
    @GetMapping("/audit-logs")
    public ResponseEntity<Page<AssetAuditLogDTO>> getAuditLogs(
            @RequestHeader("Authorization") String token,
            @RequestParam(required = false) Long assetId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        SystemAdmin admin = validateAdminToken(token);
        Pageable pageable = PageRequest.of(page, size);
        Page<AssetAuditLogDTO> logs = cmdbService.getAuditLogs(assetId, pageable);
        return ResponseEntity.ok(logs);
    }
    
    // ========== Asset Discovery APIs ==========
    
    /**
     * 执行资产自动发现
     */
    @PostMapping("/discovery/start")
    public ResponseEntity<Map<String, String>> startDiscovery(
            @RequestHeader("Authorization") String token) {
        SystemAdmin admin = validateAdminToken(token);
        // TODO: 调用 AssetDiscoveryService.performFullDiscovery
        Map<String, String> response = new java.util.HashMap<>();
        response.put("message", "资产发现已启动（功能开发中）");
        return ResponseEntity.ok(response);
    }
    
    // ========== Asset Monitoring APIs ==========
    
    /**
     * 检查资产健康状态
     */
    @PostMapping("/assets/{id}/health-check")
    public ResponseEntity<Map<String, String>> checkAssetHealth(
            @RequestHeader("Authorization") String token,
            @PathVariable Long id) {
        SystemAdmin admin = validateAdminToken(token);
        // TODO: 调用 AssetMonitoringService.checkAssetHealth
        Map<String, String> response = new java.util.HashMap<>();
        response.put("message", "健康检查已执行（功能开发中）");
        return ResponseEntity.ok(response);
    }
}
