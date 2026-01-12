package com.heartsphere.websearch.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * 网页搜索响应
 *
 * @author HeartSphere
 * @version 1.0.0
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WebSearchResponse {

    /**
     * 原始查询
     */
    private String query;

    /**
     * AI生成的答案
     */
    private String answer;

    /**
     * 搜索结果
     */
    private List<SearchResultItem> results;

    /**
     * 结果数量
     */
    private Integer resultCount;

    /**
     * 是否来自缓存
     */
    private Boolean fromCache;

    /**
     * 搜索耗时(毫秒)
     */
    private Long duration;

    /**
     * 搜索结果项
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SearchResultItem {

        /**
         * 标题
         */
        private String title;

        /**
         * URL
         */
        private String url;

        /**
         * 内容摘要
         */
        private String content;

        /**
         * 评分
         */
        private Double score;

        /**
         * 发布日期
         */
        private String publishedDate;

        /**
         * 作者
         */
        private String author;

        /**
         * 原始内容
         */
        private String rawContent;
    }
}
