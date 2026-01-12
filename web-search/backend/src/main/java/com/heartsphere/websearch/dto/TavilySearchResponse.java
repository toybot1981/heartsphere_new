package com.heartsphere.websearch.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Tavily搜索响应
 *
 * @author HeartSphere
 * @version 1.0.0
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TavilySearchResponse {

    /**
     * AI生成的答案
     */
    private String answer;

    /**
     * 搜索查询
     */
    private String query;

    /**
     * 搜索结果列表
     */
    private List<SearchResult> results;

    /**
     * 搜索结果项
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SearchResult {

        /**
         * 网页标题
         */
        private String title;

        /**
         * 网页URL
         */
        private String url;

        /**
         * 页面内容摘要
         */
        private String content;

        /**
         * 评分
         */
        private Double score;

        /**
         * 原始内容
         */
        private String rawContent;

        /**
         * 发布日期
         */
        @JsonProperty("published_date")
        private String publishedDate;

        /**
         * 作者
         */
        private String author;

        /**
         * HTML内容
         */
        @JsonProperty("markdown_content")
        private String markdownContent;
    }
}
