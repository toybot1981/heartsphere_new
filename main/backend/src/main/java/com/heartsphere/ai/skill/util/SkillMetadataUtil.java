package com.heartsphere.ai.skill.util;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.heartsphere.ai.skill.engine.SkillApplicationResult;
import lombok.extern.slf4j.Slf4j;

import java.util.HashMap;
import java.util.Map;

/**
 * 技能元数据工具类
 * 用于在聊天消息的 metadata 中添加技能应用信息
 */
@Slf4j
public class SkillMetadataUtil {
    
    private static final ObjectMapper objectMapper = new ObjectMapper();
    private static final String SKILL_APPLICATIONS_KEY = "skillApplications";
    
    /**
     * 将技能应用结果添加到现有的 metadata JSON 字符串中
     * 
     * @param existingMetadata 现有的 metadata JSON 字符串（可能为 null）
     * @param skillResult 技能应用结果
     * @return 更新后的 metadata JSON 字符串
     */
    public static String addSkillApplicationsToMetadata(
            String existingMetadata,
            SkillApplicationResult skillResult) {
        
        try {
            // 解析现有的 metadata
            Map<String, Object> metadataMap = new HashMap<>();
            if (existingMetadata != null && !existingMetadata.isEmpty()) {
                try {
                    metadataMap = objectMapper.readValue(
                        existingMetadata,
                        new TypeReference<Map<String, Object>>() {}
                    );
                } catch (Exception e) {
                    log.warn("解析现有 metadata 失败，将创建新的 metadata: {}", e.getMessage());
                    metadataMap = new HashMap<>();
                }
            }
            
            // 添加技能应用信息
            Map<String, Object> skillApplications = new HashMap<>();
            skillApplications.put("totalEvaluated", skillResult.getTotalEvaluated());
            skillApplications.put("totalApplied", skillResult.getTotalApplied());
            skillApplications.put("applicationRate", skillResult.getApplicationRate());
            skillApplications.put("appliedSkills", skillResult.getAppliedSkills());
            skillApplications.put("rejectedSkills", skillResult.getRejectedSkills());
            skillApplications.put("executionRecordIds", skillResult.getExecutionRecordIds());
            skillApplications.put("evaluationTimestamp", skillResult.getEvaluationTimestamp());
            
            metadataMap.put(SKILL_APPLICATIONS_KEY, skillApplications);
            
            // 序列化回 JSON
            return objectMapper.writeValueAsString(metadataMap);
            
        } catch (Exception e) {
            log.error("添加技能应用信息到 metadata 失败", e);
            return existingMetadata; // 失败时返回原始 metadata
        }
    }
    
    /**
     * 从 metadata JSON 字符串中提取技能应用信息
     * 
     * @param metadata metadata JSON 字符串
     * @return 技能应用信息 Map，如果不存在则返回 null
     */
    public static Map<String, Object> extractSkillApplications(String metadata) {
        if (metadata == null || metadata.isEmpty()) {
            return null;
        }
        
        try {
            Map<String, Object> metadataMap = objectMapper.readValue(
                metadata,
                new TypeReference<Map<String, Object>>() {}
            );
            
            @SuppressWarnings("unchecked")
            Map<String, Object> skillApplications = (Map<String, Object>) metadataMap.get(SKILL_APPLICATIONS_KEY);
            
            return skillApplications;
        } catch (Exception e) {
            log.warn("从 metadata 提取技能应用信息失败: {}", e.getMessage());
            return null;
        }
    }
    
    /**
     * 检查 metadata 中是否包含技能应用信息
     */
    public static boolean hasSkillApplications(String metadata) {
        Map<String, Object> skillApplications = extractSkillApplications(metadata);
        return skillApplications != null && !skillApplications.isEmpty();
    }
}
