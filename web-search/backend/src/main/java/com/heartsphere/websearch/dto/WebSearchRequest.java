package com.heartsphere.websearch.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * 网页搜索请求
 *
 * @author HeartSphere
 * @version 1.0.0
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WebSearchRequest {

    /**
     * 搜索查询
     */
    @NotBlank(message = "搜索查询不能为空")
    private String query;

    /**
     * 最大结果数
     */
    @Min(value = 1, message = "最大结果数至少为1")
    @Max(value = 100, message = "最大结果数不能超过100")
    @Builder.Default
    private Integer maxResults = 10;

    /**
     * 搜索深度: basic, advanced
     */
    @Builder.Default
    private String searchDepth = "basic";

    /**
     * 是否包含AI答案
     */
    @Builder.Default
    private Boolean includeAnswer = true;

    /**
     * 是否包含原始内容
     */
    @Builder.Default
    private Boolean includeRawContent = false;

    /**
     * 包含的域名列表
     */
    private List<String> includeDomains;

    /**
     * 排除的域名列表
     */
    private List<String> excludeDomains;

    /**
     * 主题: general, news
     */
    @Builder.Default
    private String topic = "general";

    /**
     * 时间范围(天)
     */
    @Min(value = 1, message = "时间范围至少为1天")
    @Max(value = 365, message = "时间范围不能超过365天")
    private Integer daysRange;

    /**
     * 是否跳过缓存
     */
    @Builder.Default
    private Boolean skipCache = false;
}
