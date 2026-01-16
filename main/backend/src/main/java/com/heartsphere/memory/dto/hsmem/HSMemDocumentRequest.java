package com.heartsphere.memory.dto.hsmem;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * HSMem 文档记忆化请求DTO
 * 
 * @author HeartSphere
 * @date 2026-01-16
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class HSMemDocumentRequest {
    
    /**
     * 文档标题
     */
    private String title;
    
    /**
     * 文档内容
     */
    private String content;
    
    /**
     * 作者（可选）
     */
    private String author;
    
    /**
     * 用户ID（可选）
     */
    private String user_id;
}
