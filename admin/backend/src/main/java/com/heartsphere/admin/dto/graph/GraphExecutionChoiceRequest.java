package com.heartsphere.admin.dto.graph;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Graph执行用户选择请求DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GraphExecutionChoiceRequest {
    /**
     * 用户选择的选项ID
     */
    private String optionId;
}
