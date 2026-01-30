package com.heartsphere.memory.dto.hsmem;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

/**
 * 单条待写入 HSMem 的记忆项（用于 memorizeItems）。
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class HSMemItemInput {
    private String content;
    private String summary;
    private String memory_type;
    private Double importance;
    private List<String> categories;
    private Map<String, Object> metadata;
}
