package com.heartsphere.websearch.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

/**
 * Tavily搜索请求
 *
 * @author HeartSphere
 * @version 1.0.0
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TavilySearchRequest {

    /**
     * 搜索查询
     */
    private String query;

    /**
     * 搜索类型: search, answer
     */
    @JsonProperty("search_depth")
    @Builder.Default
    private String searchDepth = "basic";

    /**
     * 最大结果数
     */
    @JsonProperty("max_results")
    @Builder.Default
    private Integer maxResults = 10;

    /**
     * 包含答案(仅search类型)
     */
    @JsonProperty("include_answer")
    @Builder.Default
    private Boolean includeAnswer = true;

    /**
     * 包含原始内容
     */
    @JsonProperty("include_raw_content")
    @Builder.Default
    private Boolean includeRawContent = false;

    /**
     * 包含域名
     */
    @JsonProperty("include_domains")
    private List<String> includeDomains;

    /**
     * 排除域名
     */
    @JsonProperty("exclude_domains")
    private List<String> excludeDomains;

    /**
     * 主题范围: general, news
     */
    @Builder.Default
    private String topic = "general";

    /**
     * 时间范围: day, week, month, year, datetime
     */
    @JsonProperty("days_range")
    private Integer daysRange;

    /**
     * API密钥
     */
    @JsonProperty("api_key")
    private String apiKey;
}
