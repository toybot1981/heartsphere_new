package com.heartsphere.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * 联系表单实体
 * 存储官网联系表单提交的数据
 */
@Data
@Entity
@Table(name = "contact_forms", indexes = {
    @Index(name = "idx_email", columnList = "email"),
    @Index(name = "idx_created_at", columnList = "created_at")
})
public class ContactForm {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    /**
     * 姓名
     */
    @Column(nullable = false, length = 50)
    private String name;
    
    /**
     * 邮箱
     */
    @Column(nullable = false, length = 100)
    private String email;
    
    /**
     * 电话
     */
    @Column(nullable = false, length = 20)
    private String phone;
    
    /**
     * 公司名称（可选）
     */
    @Column(length = 100)
    private String company;
    
    /**
     * 咨询内容
     */
    @Column(columnDefinition = "TEXT", nullable = false)
    private String message;
    
    /**
     * 是否已处理
     */
    @Column(name = "is_processed", nullable = false)
    private Boolean isProcessed = false;
    
    /**
     * 处理备注
     */
    @Column(name = "process_notes", columnDefinition = "TEXT")
    private String processNotes;
    
    /**
     * 创建时间
     */
    @Column(name = "created_at", nullable = false, updatable = false)
    @CreationTimestamp
    private LocalDateTime createdAt;
    
    /**
     * 更新时间
     */
    @Column(name = "updated_at")
    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
