package com.heartsphere.mailbox.repository;

import com.heartsphere.mailbox.entity.NotificationSettings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * 跨时空信箱提醒设置Repository
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Repository
public interface NotificationSettingsRepository extends JpaRepository<NotificationSettings, Long> {
    
    /**
     * 根据用户ID查找提醒设置
     */
    Optional<NotificationSettings> findByUserId(Long userId);
    
    /**
     * 检查用户是否有提醒设置
     */
    boolean existsByUserId(Long userId);
}

