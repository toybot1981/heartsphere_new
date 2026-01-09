package com.heartsphere.mentis.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

/**
 * Mentis虚拟机状态实体
 * 记录虚拟机在不同时刻的状态快照
 */
@Entity
@Table(name = "mentis_vm_states")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MentisVmState {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * 关联的会话
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", nullable = false)
    private MentisSession session;

    /**
     * 虚拟机标识
     */
    @Column(nullable = false, length = 200)
    private String vmId;

    /**
     * 状态类型：SNAPSHOT, CHECKPOINT, SCREENSHOT
     */
    @Column(nullable = false, length = 50)
    private String stateType;

    /**
     * 状态数据（JSON格式，包含屏幕截图、文件系统状态等）
     */
    @Column(columnDefinition = "TEXT")
    private String stateData;

    /**
     * 屏幕截图URL或路径
     */
    @Column(length = 500)
    private String screenshotUrl;

    /**
     * 状态描述
     */
    @Column(length = 1000)
    private String description;

    /**
     * 创建时间
     */
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
