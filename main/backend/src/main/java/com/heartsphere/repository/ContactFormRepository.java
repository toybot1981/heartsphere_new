package com.heartsphere.repository;

import com.heartsphere.entity.ContactForm;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 联系表单Repository
 */
@Repository
public interface ContactFormRepository extends JpaRepository<ContactForm, Long> {
    
    /**
     * 根据是否已处理查询
     */
    Page<ContactForm> findByIsProcessedOrderByCreatedAtDesc(Boolean isProcessed, Pageable pageable);
    
    /**
     * 根据邮箱查询
     */
    List<ContactForm> findByEmailOrderByCreatedAtDesc(String email);
    
    /**
     * 查询未处理的联系表单数量
     */
    @Query("SELECT COUNT(c) FROM ContactForm c WHERE c.isProcessed = false")
    Long countUnprocessed();
    
    /**
     * 根据时间范围查询
     */
    @Query("SELECT c FROM ContactForm c WHERE c.createdAt BETWEEN :startTime AND :endTime ORDER BY c.createdAt DESC")
    List<ContactForm> findByCreatedAtBetween(
        @Param("startTime") LocalDateTime startTime,
        @Param("endTime") LocalDateTime endTime
    );
}
