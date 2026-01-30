package com.heartsphere.admin.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * 远程服务器配置实体
 */
@Data
@Entity
@Table(name = "remote_servers", indexes = {
    @Index(name = "idx_remote_server_name", columnList = "name"),
    @Index(name = "idx_remote_server_enabled", columnList = "enabled")
})
public class RemoteServer {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    /**
     * 服务器名称
     */
    @Column(name = "name", nullable = false, length = 200)
    private String name;
    
    /**
     * 服务器描述
     */
    @Column(name = "description", length = 500)
    private String description;
    
    /**
     * 主机地址
     */
    @Column(name = "host", nullable = false, length = 255)
    private String host;
    
    /**
     * SSH 端口
     */
    @Column(name = "port", nullable = false)
    private Integer port = 22;
    
    /**
     * SSH 用户名
     */
    @Column(name = "username", nullable = false, length = 100)
    private String username;
    
    /**
     * SSH 私钥（加密存储）
     */
    @Column(name = "private_key", columnDefinition = "TEXT")
    private String privateKey;
    
    /**
     * SSH 私钥密码（加密存储）
     */
    @Column(name = "key_passphrase", length = 500)
    private String keyPassphrase;
    
    /**
     * 远程部署路径
     */
    @Column(name = "deploy_path", length = 500)
    private String deployPath = "/opt/deploy";
    
    /**
     * 是否启用
     */
    @Column(name = "enabled", nullable = false)
    private Boolean enabled = true;
    
    /**
     * 创建时间
     */
    @Column(name = "created_at", nullable = false)
    @CreationTimestamp
    private LocalDateTime createdAt;
    
    /**
     * 更新时间
     */
    @Column(name = "updated_at", nullable = false)
    @UpdateTimestamp
    private LocalDateTime updatedAt;
    
    /**
     * 创建者
     */
    @Column(name = "created_by", length = 100)
    private String createdBy;
    
    /**
     * 最后连接测试时间
     */
    @Column(name = "last_connection_test")
    private LocalDateTime lastConnectionTest;
    
    /**
     * 最后连接测试结果
     */
    @Column(name = "last_connection_result", length = 1000)
    private String lastConnectionResult;
}
