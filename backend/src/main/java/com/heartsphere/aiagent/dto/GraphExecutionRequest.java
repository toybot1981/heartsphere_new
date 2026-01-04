package com.heartsphere.aiagent.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

/**
 * Graph执行请求DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GraphExecutionRequest {
    /**
     * 初始状态数据（可选）
     */
    private Map<String, Object> initialState;
}
