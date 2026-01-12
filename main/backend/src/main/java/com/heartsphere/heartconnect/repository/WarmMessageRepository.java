package com.heartsphere.heartconnect.repository;

import com.heartsphere.heartconnect.entity.WarmMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * 暖心留言Repository
 */
@Repository
public interface WarmMessageRepository extends JpaRepository<WarmMessage, Long> {
    
    /**
     * 根据共享配置ID查找所有留言
     */
    List<WarmMessage> findByShareConfigIdOrderByCreatedAtDesc(Long shareConfigId);
    
    /**
     * 根据访问者ID查找所有留言
     */
    List<WarmMessage> findByVisitorIdOrderByCreatedAtDesc(Long visitorId);
    
    /**
     * 统计共享配置的留言数量
     */
    long countByShareConfigId(Long shareConfigId);
}

