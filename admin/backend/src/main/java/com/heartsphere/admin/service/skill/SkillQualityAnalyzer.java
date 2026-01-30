package com.heartsphere.admin.service.skill;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;

/**
 * 技能质量分析器
 * 分析技能描述和内容质量，提供改进建议
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Slf4j
@Service
public class SkillQualityAnalyzer {
    
    // 关键词模式
    private static final Pattern FUNCTION_KEYWORDS = Pattern.compile(
        "(功能|使用|执行|操作|处理|实现|提供|支持|帮助|协助)", Pattern.CASE_INSENSITIVE
    );
    
    private static final Pattern SCENARIO_KEYWORDS = Pattern.compile(
        "(场景|情况|当|如果|需要|适用于|用于)", Pattern.CASE_INSENSITIVE
    );
    
    /**
     * 分析描述质量
     * 
     * @param description 技能描述
     * @return 质量报告
     */
    public QualityReport analyzeDescription(String description) {
        QualityReport report = new QualityReport();
        List<String> suggestions = new ArrayList<>();
        int score = 100;
        
        if (description == null || description.trim().isEmpty()) {
            report.setScore(0);
            report.setSuggestions(List.of("技能描述不能为空"));
            return report;
        }
        
        int length = description.length();
        
        // 长度评分（20分）
        if (length < 20) {
            score -= 15;
            suggestions.add("描述过短，建议至少20字符，详细说明功能和使用场景");
        } else if (length < 50) {
            score -= 5;
            suggestions.add("描述可以更详细，建议添加使用场景说明");
        } else if (length > 500) {
            score -= 5;
            suggestions.add("描述过长，建议精简到500字符以内，保持简洁明了");
        }
        
        // 功能关键词检查（30分）
        boolean hasFunctionKeywords = FUNCTION_KEYWORDS.matcher(description).find();
        if (!hasFunctionKeywords) {
            score -= 20;
            suggestions.add("建议添加功能说明关键词（如：功能、使用、执行、提供等）");
        }
        
        // 场景关键词检查（20分）
        boolean hasScenarioKeywords = SCENARIO_KEYWORDS.matcher(description).find();
        if (!hasScenarioKeywords) {
            score -= 15;
            suggestions.add("建议添加使用场景说明（如：适用于、当...时、用于...等）");
        }
        
        // 结构检查（30分）
        boolean hasStructure = description.contains("。") || description.contains(".") || 
                              description.contains("，") || description.contains(",");
        if (!hasStructure) {
            score -= 10;
            suggestions.add("建议使用标点符号分隔，使描述更清晰");
        }
        
        // 检查是否包含技能名称
        if (description.length() < 100 && !description.contains("技能") && !description.contains("功能")) {
            score -= 5;
            suggestions.add("建议明确说明这是技能或功能");
        }
        
        // 确保分数在0-100之间
        score = Math.max(0, Math.min(100, score));
        
        report.setScore(score);
        report.setSuggestions(suggestions);
        
        // 生成质量等级
        if (score >= 80) {
            report.setLevel("优秀");
        } else if (score >= 60) {
            report.setLevel("良好");
        } else if (score >= 40) {
            report.setLevel("一般");
        } else {
            report.setLevel("需要改进");
        }
        
        return report;
    }
    
    /**
     * 检查内容完整性
     * 
     * @param skillData 技能数据
     * @return 完整性报告
     */
    public CompletenessReport checkCompleteness(java.util.Map<String, Object> skillData) {
        CompletenessReport report = new CompletenessReport();
        List<String> missingFields = new ArrayList<>();
        List<String> suggestions = new ArrayList<>();
        
        // 检查必需字段
        if (skillData.get("skillId") == null || ((String) skillData.get("skillId")).trim().isEmpty()) {
            missingFields.add("技能ID");
        }
        if (skillData.get("name") == null || ((String) skillData.get("name")).trim().isEmpty()) {
            missingFields.add("技能名称");
        }
        if (skillData.get("description") == null || ((String) skillData.get("description")).trim().isEmpty()) {
            missingFields.add("技能描述");
        }
        
        // 检查重要字段
        if (skillData.get("instruction") == null || ((String) skillData.get("instruction")).trim().isEmpty()) {
            suggestions.add("建议添加指令内容，详细说明技能的执行逻辑");
        }
        
        if (skillData.get("category") == null || ((String) skillData.get("category")).trim().isEmpty()) {
            suggestions.add("建议设置技能分类，便于管理和查找");
        }
        
        // 检查MCP工具配置
        String mcpToolConfig = (String) skillData.get("mcpToolConfig");
        if (mcpToolConfig == null || mcpToolConfig.trim().isEmpty()) {
            suggestions.add("如果技能需要使用工具，建议配置MCP工具");
        } else {
            // 验证MCP工具配置格式
            try {
                com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                var configNode = mapper.readTree(mcpToolConfig);
                if (!configNode.has("tools") || !configNode.get("tools").isArray() || 
                    configNode.get("tools").size() == 0) {
                    suggestions.add("MCP工具配置中未选择任何工具");
                }
            } catch (Exception e) {
                suggestions.add("MCP工具配置格式可能不正确，请检查JSON格式");
            }
        }
        
        // 检查是否有降级方案
        String instruction = (String) skillData.get("instruction");
        if (instruction != null && instruction.contains("MCP") && 
            (mcpToolConfig == null || mcpToolConfig.trim().isEmpty())) {
            suggestions.add("如果MCP工具不可用，建议在指令中说明降级方案（使用大模型执行）");
        }
        
        report.setMissingFields(missingFields);
        report.setSuggestions(suggestions);
        report.setComplete(missingFields.isEmpty());
        
        return report;
    }
    
    /**
     * 质量报告
     */
    public static class QualityReport {
        private int score;
        private String level;
        private List<String> suggestions;
        
        public int getScore() {
            return score;
        }
        
        public void setScore(int score) {
            this.score = score;
        }
        
        public String getLevel() {
            return level;
        }
        
        public void setLevel(String level) {
            this.level = level;
        }
        
        public List<String> getSuggestions() {
            return suggestions;
        }
        
        public void setSuggestions(List<String> suggestions) {
            this.suggestions = suggestions;
        }
    }
    
    /**
     * 完整性报告
     */
    public static class CompletenessReport {
        private boolean complete;
        private List<String> missingFields;
        private List<String> suggestions;
        
        public boolean isComplete() {
            return complete;
        }
        
        public void setComplete(boolean complete) {
            this.complete = complete;
        }
        
        public List<String> getMissingFields() {
            return missingFields;
        }
        
        public void setMissingFields(List<String> missingFields) {
            this.missingFields = missingFields;
        }
        
        public List<String> getSuggestions() {
            return suggestions;
        }
        
        public void setSuggestions(List<String> suggestions) {
            this.suggestions = suggestions;
        }
    }
}
