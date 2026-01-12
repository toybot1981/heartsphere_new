package com.heartsphere.mailbox.dto;

import lombok.Data;

/**
 * 对话查询请求DTO
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Data
public class ConversationQueryRequest {
    /**
     * 对话类型
     */
    private String conversationType;
    
    /**
     * 页码
     */
    private Integer page;
    
    /**
     * 每页大小
     */
    private Integer size;
}


