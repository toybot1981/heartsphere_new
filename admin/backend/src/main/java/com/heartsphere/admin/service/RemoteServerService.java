package com.heartsphere.admin.service;

import com.heartsphere.admin.dto.RemoteServerDTO;
import com.heartsphere.admin.entity.RemoteServer;
import com.heartsphere.admin.entity.SystemAdmin;
import com.heartsphere.admin.repository.RemoteServerRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 远程服务器管理服务
 */
@Service
public class RemoteServerService {
    
    private static final Logger logger = LoggerFactory.getLogger(RemoteServerService.class);
    
    @Autowired
    private RemoteServerRepository remoteServerRepository;
    
    @Autowired(required = false)
    private SshKeyEncryptionService sshKeyEncryptionService;
    
    @Autowired(required = false)
    private ScpFileTransferService scpFileTransferService;
    
    /**
     * 获取所有远程服务器
     */
    @Transactional(readOnly = true)
    public List<RemoteServerDTO> getAllServers() {
        return remoteServerRepository.findAll().stream()
            .map(this::toDTO)
            .collect(Collectors.toList());
    }
    
    /**
     * 获取启用的远程服务器
     */
    @Transactional(readOnly = true)
    public List<RemoteServerDTO> getEnabledServers() {
        return remoteServerRepository.findByEnabledTrue().stream()
            .map(this::toDTO)
            .collect(Collectors.toList());
    }
    
    /**
     * 获取服务器详情
     */
    @Transactional(readOnly = true)
    public RemoteServerDTO getServer(Long id) {
        RemoteServer server = remoteServerRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("远程服务器不存在"));
        return toDTO(server);
    }
    
    /**
     * 创建远程服务器
     */
    @Transactional
    public RemoteServerDTO createServer(RemoteServerDTO dto, SystemAdmin admin) {
        // 验证服务器名称唯一性
        if (remoteServerRepository.findByName(dto.getName()).isPresent()) {
            throw new RuntimeException("服务器名称已存在: " + dto.getName());
        }
        
        // 验证主机和端口唯一性
        if (remoteServerRepository.findByHostAndPort(dto.getHost(), dto.getPort()).isPresent()) {
            throw new RuntimeException("该主机和端口已配置: " + dto.getHost() + ":" + dto.getPort());
        }
        
        RemoteServer server = new RemoteServer();
        server.setName(dto.getName());
        server.setDescription(dto.getDescription());
        server.setHost(dto.getHost());
        server.setPort(dto.getPort() != null ? dto.getPort() : 22);
        server.setUsername(dto.getUsername());
        server.setDeployPath(dto.getDeployPath() != null ? dto.getDeployPath() : "/opt/deploy");
        server.setEnabled(dto.getEnabled() != null ? dto.getEnabled() : true);
        server.setCreatedBy(admin.getUsername());
        
        // 注意：privateKey 和 keyPassphrase 应该通过单独的接口设置，这里不处理
        
        server = remoteServerRepository.save(server);
        logger.info("Created remote server: {} by {}", server.getName(), admin.getUsername());
        return toDTO(server);
    }
    
    /**
     * 更新远程服务器
     */
    @Transactional
    public RemoteServerDTO updateServer(Long id, RemoteServerDTO dto, SystemAdmin admin) {
        RemoteServer server = remoteServerRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("远程服务器不存在"));
        
        // 验证名称唯一性（如果更改）
        if (!server.getName().equals(dto.getName())) {
            if (remoteServerRepository.findByName(dto.getName()).isPresent()) {
                throw new RuntimeException("服务器名称已存在: " + dto.getName());
            }
        }
        
        server.setName(dto.getName());
        server.setDescription(dto.getDescription());
        server.setHost(dto.getHost());
        server.setPort(dto.getPort() != null ? dto.getPort() : 22);
        server.setUsername(dto.getUsername());
        server.setDeployPath(dto.getDeployPath());
        server.setEnabled(dto.getEnabled());
        
        server = remoteServerRepository.save(server);
        logger.info("Updated remote server: {} by {}", server.getName(), admin.getUsername());
        
        // 记录审计日志
        logAudit("UPDATE_REMOTE_SERVER", server.getId(), server.getName(), admin.getUsername(), "更新远程服务器");
        
        return toDTO(server);
    }
    
    /**
     * 设置 SSH 密钥
     */
    @Transactional
    public void setSshKey(Long id, String privateKey, String passphrase, SystemAdmin admin) {
        if (sshKeyEncryptionService == null) {
            throw new RuntimeException("SSH 密钥加密服务未配置");
        }
        
        RemoteServer server = remoteServerRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("远程服务器不存在"));
        
        // 加密并存储密钥
        String encryptedKey = sshKeyEncryptionService.encryptKey(privateKey);
        String encryptedPassphrase = passphrase != null && !passphrase.isEmpty()
            ? sshKeyEncryptionService.encryptPassphrase(passphrase)
            : null;
        
        server.setPrivateKey(encryptedKey);
        server.setKeyPassphrase(encryptedPassphrase);
        
        remoteServerRepository.save(server);
        logger.info("SSH key set for remote server: {} by {}", server.getName(), admin.getUsername());
        
        // 记录审计日志
        logAudit("SET_SSH_KEY", server.getId(), server.getName(), admin.getUsername(), "设置 SSH 密钥");
    }
    
    /**
     * 测试服务器连接
     */
    @Transactional
    public boolean testConnection(Long id) {
        RemoteServer server = remoteServerRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("远程服务器不存在"));
        
        if (scpFileTransferService == null) {
            throw new RuntimeException("SCP 文件传输服务未配置");
        }
        
        boolean success = scpFileTransferService.testConnection(server);
        
        // 更新连接测试结果
        server.setLastConnectionTest(LocalDateTime.now());
        server.setLastConnectionResult(success ? "连接成功" : "连接失败");
        remoteServerRepository.save(server);
        
        return success;
    }
    
    /**
     * 删除远程服务器
     */
    @Transactional
    public void deleteServer(Long id) {
        RemoteServer server = remoteServerRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("远程服务器不存在"));
        String serverName = server.getName();
        Long serverId = server.getId();
        remoteServerRepository.delete(server);
        logger.info("Deleted remote server: {}", serverName);
        
        // 记录审计日志
        logAudit("DELETE_REMOTE_SERVER", serverId, serverName, "system", "删除远程服务器");
    }
    
    /**
     * 转换为 DTO
     */
    private RemoteServerDTO toDTO(RemoteServer server) {
        RemoteServerDTO dto = new RemoteServerDTO();
        dto.setId(server.getId());
        dto.setName(server.getName());
        dto.setDescription(server.getDescription());
        dto.setHost(server.getHost());
        dto.setPort(server.getPort());
        dto.setUsername(server.getUsername());
        dto.setDeployPath(server.getDeployPath());
        dto.setEnabled(server.getEnabled());
        dto.setCreatedAt(server.getCreatedAt());
        dto.setUpdatedAt(server.getUpdatedAt());
        dto.setCreatedBy(server.getCreatedBy());
        dto.setLastConnectionTest(server.getLastConnectionTest());
        dto.setLastConnectionResult(server.getLastConnectionResult());
        return dto;
    }
    
    /**
     * 记录审计日志
     */
    private void logAudit(String operation, Long serverId, String serverName, String username, String description) {
        // 记录到应用日志（详细审计日志功能待完善）
        logger.info("Audit: {} - Server: {} (ID: {}) by {} - {}", operation, serverName, serverId, username, description);
    }
}
