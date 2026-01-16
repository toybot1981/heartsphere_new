package com.heartsphere.memory.dto.hsmem;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

/**
 * HSMem 记忆检索请求DTO
 * 
 * @author HeartSphere
 * @date 2026-01-16
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class HSMemRetrieveRequest {
    
    /**
     * 查询消息列表
     */
    private List<HSMemMessage> queries;
    
    /**
     * 过滤条件（可选）
     * 例如：{"user_id": "user_123"}
     */
    private Map<String, Object> where;
    
    /**
     * 返回数量限制（可选）
     */
    private Integer limit;
}
