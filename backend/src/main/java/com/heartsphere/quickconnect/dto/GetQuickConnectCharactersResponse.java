package com.heartsphere.quickconnect.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * 获取快速连接列表响应DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class GetQuickConnectCharactersResponse {
    private List<QuickConnectCharacterDTO> characters;
    private Integer totalCount;  // 总数量
    private Integer favoriteCount;  // 收藏数量
    private Integer recentCount;  // 最近访问数量
    private PaginationInfo pagination;  // 分页信息
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PaginationInfo {
        private Integer limit;
        private Integer offset;
        private Boolean hasMore;
    }
}

