package com.heartsphere.quickconnect.entity;

import com.heartsphere.entity.Character;
import com.heartsphere.entity.User;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * 用户收藏实体
 * 用于存储用户收藏的E-SOUL（角色）
 */
@Data
@Entity
@Table(name = "user_favorites")
public class UserFavorite {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "character_id", nullable = false)
    private Character character;

    @Column(name = "sort_order", nullable = false)
    private Integer sortOrder = 0;

    @Column(name = "created_at", nullable = false, updatable = false)
    @CreationTimestamp
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    @UpdateTimestamp
    private LocalDateTime updatedAt;

    // 便捷方法：获取用户ID
    public Long getUserId() {
        return user != null ? user.getId() : null;
    }

    // 便捷方法：获取角色ID
    public Long getCharacterId() {
        return character != null ? character.getId() : null;
    }
}



