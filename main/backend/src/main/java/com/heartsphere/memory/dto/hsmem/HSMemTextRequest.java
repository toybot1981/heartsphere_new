package com.heartsphere.memory.dto.hsmem;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

/**
 * HSMem 文本记忆化请求DTO
 * 
 * @author HeartSphere
 * @date 2026-01-16
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class HSMemTextRequest {
    
    /**
     * 文本内容
     */
    private String text;
    
    /**
     * 上下文信息（可选）
     */
    private Map<String, Object> context;
    
    /**
     * 用户ID（可选）
     */
    private String user_id;
}
