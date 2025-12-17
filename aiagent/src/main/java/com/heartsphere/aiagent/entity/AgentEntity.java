package com.heartsphere.aiagent.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.Map;

/**
 * Agent 实体类 - 用于持久化存储
 */
@Entity
@Table(name = "agents")
@Data
public class AgentEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false)
    private String agentId;
    
    @Column(nullable = false)
    private String name;
    
    private String description;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AgentType type;
    
    @Column(nullable = false)
    private String provider;
    
    @Column(nullable = false)
    private String model;
    
    @Column(columnDefinition = "TEXT")
    private String systemPrompt;
    
    @Column(columnDefinition = "TEXT")
    private String workflowConfig; // JSON 格式的工作流配置
    
    @Column(columnDefinition = "TEXT")
    private String capabilities; // JSON 格式的能力配置
    
    @Column(columnDefinition = "TEXT")
    private String tools; // JSON 格式的工具配置
    
    @Column(columnDefinition = "TEXT")
    private String config; // JSON 格式的其他配置
    
    @Column(nullable = false)
    private LocalDateTime createdAt;
    
    @Column(nullable = false)
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    public enum AgentType {
        TEXT, IMAGE, AUDIO, VIDEO, MULTIMODAL
    }
}

