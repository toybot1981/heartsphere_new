package com.heartsphere.admin.dto.graph;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Graph执行列表响应DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GraphExecutionListResponse {
    /**
     * 执行列表
     */
    private List<GraphExecutionDTO> executions;
    
    /**
     * 总记录数
     */
    private Long total;
    
    /**
     * 页码（从0开始）
     */
    private Integer page;
    
    /**
     * 每页大小
     */
    private Integer size;
    
    /**
     * 总页数
     */
    private Integer totalPages;
}
