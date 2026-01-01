package com.heartsphere.mailbox.dto;

import com.heartsphere.mailbox.enums.MessageCategory;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 消息查询请求DTO
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Data
public class MessageQueryRequest {
    /**
     * 消息分类
     */
    private MessageCategory category;
    
    /**
     * 是否已读
     */
    private Boolean isRead;
    
    /**
     * 是否重要
     */
    private Boolean isImportant;
    
    /**
     * 是否收藏
     */
    private Boolean isStarred;
    
    /**
     * 开始日期
     */
    private LocalDateTime startDate;
    
    /**
     * 结束日期
     */
    private LocalDateTime endDate;
    
    /**
     * 搜索关键词
     */
    private String keyword;
    
    /**
     * 页码（从0开始）
     */
    private Integer page = 0;
    
    /**
     * 每页数量
     */
    private Integer size = 20;
}


