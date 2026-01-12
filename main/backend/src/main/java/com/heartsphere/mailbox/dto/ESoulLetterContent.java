package com.heartsphere.mailbox.dto;

import lombok.Data;

/**
 * E-SOUL来信内容DTO
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Data
public class ESoulLetterContent {
    /**
     * 信件标题
     */
    private String title;
    
    /**
     * 信件内容
     */
    private String content;
    
    /**
     * 情感倾向（可选）
     */
    private String emotion;
}


