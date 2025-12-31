package com.heartsphere.memory.dto;

import com.heartsphere.memory.model.MemoryImportance;
import com.heartsphere.memory.model.MemorySource;
import com.heartsphere.memory.model.MemoryType;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.util.List;
import java.util.Map;

/**
 * 保存用户记忆请求DTO
 * 
 * @author HeartSphere
 * @date 2025-12-30
 */
@Data
@Schema(description = "保存用户记忆请求")
public class SaveMemoryRequest {
    
    @Schema(description = "记忆类型", requiredMode = Schema.RequiredMode.REQUIRED, example = "PERSONAL_INFO")
    private MemoryType memoryType;
    
    @Schema(description = "重要性", requiredMode = Schema.RequiredMode.REQUIRED, example = "IMPORTANT")
    private MemoryImportance importance;
    
    @Schema(description = "记忆内容", requiredMode = Schema.RequiredMode.REQUIRED, example = "用户喜欢看电影")
    private String content;
    
    @Schema(description = "结构化数据", example = "{\"key\": \"favorite_movie\", \"value\": \"星际穿越\"}")
    private Map<String, Object> structuredData;
    
    @Schema(description = "记忆来源", requiredMode = Schema.RequiredMode.REQUIRED, example = "JOURNAL")
    private MemorySource source;
    
    @Schema(description = "来源ID", example = "journal_entry_123")
    private String sourceId;
    
    @Schema(description = "提取置信度 (0.0-1.0)", example = "0.8")
    private Double confidence;
    
    @Schema(description = "标签", example = "[\"偏好\", \"娱乐\"]")
    private List<String> tags;
    
    @Schema(description = "扩展元数据", example = "{\"emotion\": \"HAPPY\", \"eraId\": 1}")
    private Map<String, Object> metadata;
}


