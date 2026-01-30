package com.heartsphere.multiagent.orchestrator;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.regex.Pattern;

/**
 * 结果质量评估器
 * 
 * <p>评估和优化协作结果的质量，包括：
 * <ul>
 *   <li>结果完整性检查</li>
 *   <li>结果相关性评估</li>
 *   <li>结果一致性检查</li>
 *   <li>结果优化建议</li>
 * </ul>
 * </p>
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Slf4j
@Service
public class ResultQualityAssessor {
    
    /**
     * 质量评估结果
     */
    public static class QualityAssessment {
        private double overallScore;  // 总体质量分数（0-1）
        private Map<String, Double> dimensionScores;  // 各维度分数
        private List<String> issues;  // 发现的问题
        private List<String> suggestions;  // 优化建议
        
        public QualityAssessment() {
            this.overallScore = 0.0;
            this.dimensionScores = new HashMap<>();
            this.issues = new ArrayList<>();
            this.suggestions = new ArrayList<>();
        }
        
        // Getters and Setters
        public double getOverallScore() {
            return overallScore;
        }
        
        public void setOverallScore(double overallScore) {
            this.overallScore = overallScore;
        }
        
        public Map<String, Double> getDimensionScores() {
            return dimensionScores;
        }
        
        public void setDimensionScores(Map<String, Double> dimensionScores) {
            this.dimensionScores = dimensionScores;
        }
        
        public List<String> getIssues() {
            return issues;
        }
        
        public void setIssues(List<String> issues) {
            this.issues = issues;
        }
        
        public List<String> getSuggestions() {
            return suggestions;
        }
        
        public void setSuggestions(List<String> suggestions) {
            this.suggestions = suggestions;
        }
        
        /**
         * 判断质量是否可接受
         */
        public boolean isAcceptable() {
            return overallScore >= 0.6;  // 阈值可配置
        }
    }
    
    /**
     * 评估结果质量
     * 
     * @param result 协作结果
     * @param agentResults 各智能体的结果
     * @param originalTask 原始任务描述
     * @return 质量评估结果
     */
    public QualityAssessment assess(CollaborationOrchestrator.CollaborationResult result,
                                   Map<String, Object> agentResults,
                                   String originalTask) {
        QualityAssessment assessment = new QualityAssessment();
        
        // 1. 完整性检查
        double completenessScore = assessCompleteness(result, agentResults);
        assessment.getDimensionScores().put("completeness", completenessScore);
        
        // 2. 相关性评估
        double relevanceScore = assessRelevance(result, originalTask);
        assessment.getDimensionScores().put("relevance", relevanceScore);
        
        // 3. 一致性检查
        double consistencyScore = assessConsistency(agentResults);
        assessment.getDimensionScores().put("consistency", consistencyScore);
        
        // 4. 计算总体分数
        double overallScore = (completenessScore * 0.4 + 
                              relevanceScore * 0.4 + 
                              consistencyScore * 0.2);
        assessment.setOverallScore(overallScore);
        
        // 5. 生成优化建议
        generateSuggestions(assessment, result, agentResults);
        
        log.info("结果质量评估: 总体分数={:.2f}, 完整性={:.2f}, 相关性={:.2f}, 一致性={:.2f}",
            overallScore, completenessScore, relevanceScore, consistencyScore);
        
        return assessment;
    }
    
    /**
     * 评估完整性
     */
    private double assessCompleteness(CollaborationOrchestrator.CollaborationResult result,
                                     Map<String, Object> agentResults) {
        if (result == null || !result.isSuccess()) {
            return 0.0;
        }
        
        // 检查是否有结果
        if (result.getResult() == null || result.getResult().trim().isEmpty()) {
            return 0.0;
        }
        
        // 检查智能体结果数量
        int agentResultCount = agentResults != null ? agentResults.size() : 0;
        if (agentResultCount == 0) {
            return 0.5;  // 有总体结果但没有智能体结果
        }
        
        // 检查结果长度（简单启发式：结果应该有一定长度）
        int resultLength = result.getResult().length();
        double lengthScore = Math.min(resultLength / 100.0, 1.0);  // 100字符为满分
        
        return 0.5 + lengthScore * 0.5;
    }
    
    /**
     * 评估相关性
     */
    private double assessRelevance(CollaborationOrchestrator.CollaborationResult result,
                                   String originalTask) {
        if (result == null || result.getResult() == null || originalTask == null) {
            return 0.0;
        }
        
        String resultText = result.getResult().toLowerCase();
        String taskText = originalTask.toLowerCase();
        
        // 简单的关键词匹配
        String[] taskKeywords = taskText.split("\\s+");
        int matchedKeywords = 0;
        for (String keyword : taskKeywords) {
            if (keyword.length() > 2 && resultText.contains(keyword)) {
                matchedKeywords++;
            }
        }
        
        double relevanceScore = taskKeywords.length > 0 ? 
            matchedKeywords / (double) taskKeywords.length : 0.0;
        
        return Math.min(relevanceScore, 1.0);
    }
    
    /**
     * 评估一致性
     */
    private double assessConsistency(Map<String, Object> agentResults) {
        if (agentResults == null || agentResults.isEmpty()) {
            return 1.0;  // 没有结果，认为一致
        }
        
        if (agentResults.size() == 1) {
            return 1.0;  // 只有一个结果，认为一致
        }
        
        // 检查结果是否都成功
        long successCount = agentResults.values().stream()
            .filter(result -> result != null && !result.toString().trim().isEmpty())
            .count();
        
        double consistencyScore = successCount / (double) agentResults.size();
        
        return consistencyScore;
    }
    
    /**
     * 生成优化建议
     */
    private void generateSuggestions(QualityAssessment assessment,
                                     CollaborationOrchestrator.CollaborationResult result,
                                     Map<String, Object> agentResults) {
        // 完整性建议
        if (assessment.getDimensionScores().get("completeness") < 0.6) {
            assessment.getSuggestions().add("结果不够完整，建议增加更多细节");
        }
        
        // 相关性建议
        if (assessment.getDimensionScores().get("relevance") < 0.6) {
            assessment.getSuggestions().add("结果与任务相关性较低，建议重新分析任务需求");
        }
        
        // 一致性建议
        if (assessment.getDimensionScores().get("consistency") < 0.8) {
            assessment.getSuggestions().add("智能体结果不一致，建议检查任务分配和协调机制");
        }
        
        // 总体建议
        if (assessment.getOverallScore() < 0.6) {
            assessment.getSuggestions().add("整体质量较低，建议重新执行协作任务");
        }
    }
    
    /**
     * 优化结果
     * 
     * <p>根据质量评估结果，尝试优化协作结果</p>
     * 
     * @param result 原始结果
     * @param assessment 质量评估
     * @return 优化后的结果
     */
    public CollaborationOrchestrator.CollaborationResult optimize(
            CollaborationOrchestrator.CollaborationResult result,
            QualityAssessment assessment) {
        
        if (assessment.isAcceptable()) {
            log.info("结果质量可接受，无需优化");
            return result;
        }
        
        log.info("结果质量不足（分数={:.2f}），尝试优化", assessment.getOverallScore());
        
        // 简单的优化：如果结果为空或太短，添加提示
        if (result.getResult() == null || result.getResult().trim().isEmpty()) {
            result.setResult("协作已完成，但结果为空。建议检查智能体执行情况。");
        } else if (result.getResult().length() < 50) {
            result.setResult(result.getResult() + "\n\n注意：结果可能不够完整，建议提供更多信息。");
        }
        
        return result;
    }
}
