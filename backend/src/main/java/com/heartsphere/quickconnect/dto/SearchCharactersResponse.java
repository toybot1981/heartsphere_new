package com.heartsphere.quickconnect.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

/**
 * 搜索E-SOUL响应DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SearchCharactersResponse {
    private List<QuickConnectCharacterDTO> characters;
    private Integer totalCount;
    private String searchQuery;
    
    // 高亮字段（前端使用）
    // key: characterId, value: 高亮位置信息
    private Map<String, HighlightedFields> highlightedFields;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class HighlightedFields {
        private List<Integer> name;  // 名称中匹配的位置
        private List<Integer> sceneName;  // 场景名称中匹配的位置
        private List<Integer> tags;  // 标签中匹配的位置
    }
}




