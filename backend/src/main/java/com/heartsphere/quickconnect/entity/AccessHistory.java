package com.heartsphere.quickconnect.entity;

import com.heartsphere.entity.Character;
import com.heartsphere.entity.User;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * 访问历史实体
 * 用于记录用户访问E-SOUL（角色）的历史记录
 */
@Data
@Entity
@Table(name = "access_history")
public class AccessHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "character_id", nullable = false)
    private Character character;

    @Column(name = "access_time", nullable = false, updatable = false)
    @CreationTimestamp
    private LocalDateTime accessTime;

    @Column(name = "access_duration", nullable = false)
    private Integer accessDuration = 0;

    @Column(name = "conversation_rounds", nullable = false)
    private Integer conversationRounds = 0;

    @Column(name = "session_id", length = 100)
    private String sessionId;

    // 便捷方法：获取用户ID
    public Long getUserId() {
        return user != null ? user.getId() : null;
    }

    // 便捷方法：获取角色ID
    public Long getCharacterId() {
        return character != null ? character.getId() : null;
    }
}



