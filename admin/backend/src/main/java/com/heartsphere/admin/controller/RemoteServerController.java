package com.heartsphere.admin.controller;

import com.heartsphere.admin.dto.RemoteServerDTO;
import com.heartsphere.admin.entity.SystemAdmin;
import com.heartsphere.admin.service.RemoteServerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 远程服务器管理控制器
 */
@RestController
@RequestMapping("/api/admin/devops/remote-servers")
public class RemoteServerController extends BaseAdminController {
    
    @Autowired
    private RemoteServerService remoteServerService;
    
    /**
     * 获取所有远程服务器
     */
    @GetMapping
    public ResponseEntity<List<RemoteServerDTO>> getAllServers(
        @RequestHeader("Authorization") String token
    ) {
        SystemAdmin admin = validateAdminToken(token);
        List<RemoteServerDTO> servers = remoteServerService.getAllServers();
        return ResponseEntity.ok(servers);
    }
    
    /**
     * 获取启用的远程服务器
     */
    @GetMapping("/enabled")
    public ResponseEntity<List<RemoteServerDTO>> getEnabledServers(
        @RequestHeader("Authorization") String token
    ) {
        SystemAdmin admin = validateAdminToken(token);
        List<RemoteServerDTO> servers = remoteServerService.getEnabledServers();
        return ResponseEntity.ok(servers);
    }
    
    /**
     * 获取服务器详情
     */
    @GetMapping("/{id}")
    public ResponseEntity<RemoteServerDTO> getServer(
        @RequestHeader("Authorization") String token,
        @PathVariable Long id
    ) {
        SystemAdmin admin = validateAdminToken(token);
        RemoteServerDTO server = remoteServerService.getServer(id);
        return ResponseEntity.ok(server);
    }
    
    /**
     * 创建远程服务器
     */
    @PostMapping
    public ResponseEntity<RemoteServerDTO> createServer(
        @RequestHeader("Authorization") String token,
        @RequestBody RemoteServerDTO dto
    ) {
        SystemAdmin admin = validateAdminToken(token);
        // 只有 SUPER_ADMIN 可以创建远程服务器
        if (!admin.getRole().equals("SUPER_ADMIN")) {
            throw new RuntimeException("只有超级管理员可以创建远程服务器");
        }
        RemoteServerDTO created = remoteServerService.createServer(dto, admin);
        return ResponseEntity.ok(created);
    }
    
    /**
     * 更新远程服务器
     */
    @PutMapping("/{id}")
    public ResponseEntity<RemoteServerDTO> updateServer(
        @RequestHeader("Authorization") String token,
        @PathVariable Long id,
        @RequestBody RemoteServerDTO dto
    ) {
        SystemAdmin admin = validateAdminToken(token);
        // 只有 SUPER_ADMIN 可以更新远程服务器
        if (!admin.getRole().equals("SUPER_ADMIN")) {
            throw new RuntimeException("只有超级管理员可以更新远程服务器");
        }
        RemoteServerDTO updated = remoteServerService.updateServer(id, dto, admin);
        return ResponseEntity.ok(updated);
    }
    
    /**
     * 设置 SSH 密钥
     */
    @PostMapping("/{id}/ssh-key")
    public ResponseEntity<Void> setSshKey(
        @RequestHeader("Authorization") String token,
        @PathVariable Long id,
        @RequestBody Map<String, String> request
    ) {
        SystemAdmin admin = validateAdminToken(token);
        // 只有 SUPER_ADMIN 可以设置 SSH 密钥
        if (!admin.getRole().equals("SUPER_ADMIN")) {
            throw new RuntimeException("只有超级管理员可以设置 SSH 密钥");
        }
        String privateKey = request.get("privateKey");
        String passphrase = request.get("passphrase");
        remoteServerService.setSshKey(id, privateKey, passphrase, admin);
        return ResponseEntity.ok().build();
    }
    
    /**
     * 测试服务器连接
     */
    @PostMapping("/{id}/test-connection")
    public ResponseEntity<Map<String, Object>> testConnection(
        @RequestHeader("Authorization") String token,
        @PathVariable Long id
    ) {
        SystemAdmin admin = validateAdminToken(token);
        boolean success = remoteServerService.testConnection(id);
        return ResponseEntity.ok(Map.of("success", success, "message", success ? "连接成功" : "连接失败"));
    }
    
    /**
     * 删除远程服务器
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteServer(
        @RequestHeader("Authorization") String token,
        @PathVariable Long id
    ) {
        SystemAdmin admin = validateAdminToken(token);
        // 只有 SUPER_ADMIN 可以删除远程服务器
        if (!admin.getRole().equals("SUPER_ADMIN")) {
            throw new RuntimeException("只有超级管理员可以删除远程服务器");
        }
        remoteServerService.deleteServer(id);
        return ResponseEntity.ok().build();
    }
}
