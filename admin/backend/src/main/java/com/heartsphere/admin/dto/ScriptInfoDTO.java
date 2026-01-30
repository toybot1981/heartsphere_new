package com.heartsphere.admin.dto;

import lombok.Data;
import java.util.List;
import java.util.Map;

/**
 * 脚本信息 DTO
 */
@Data
public class ScriptInfoDTO {
    private String id;
    private String name;
    private String category;
    private String description;
    private String script;
    private String type;
    private Integer timeout;
    private List<String> requires;
    private List<ScriptParameter> parameters;
    private List<String> permissions;
    private List<String> environments;
    private Boolean confirmRequired;
    private String riskLevel;

    @Data
    public static class ScriptParameter {
        private String name;
        private String type;
        private Object defaultValue;
        private Boolean required;
        private String description;
        private List<String> values; // for enum type
    }
}
