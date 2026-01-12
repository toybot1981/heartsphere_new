package com.heartsphere.admin.dto.graph;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Graph执行暂停请求DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GraphExecutionPauseRequest {
    /**
     * 暂停原因（可选）
     */
    private String reason;
}
