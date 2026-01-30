package com.heartsphere.memory.util;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.stream.Collectors;

/**
 * 相似度计算工具
 * 用于检测重复或相似的知识资产
 * 
 * @author HeartSphere
 * @date 2026-01-24
 */
@Slf4j
@Component
public class SimilarityCalculator {
    
    /**
     * 使用 Levenshtein 距离计算两个文本的相似度
     * 
     * @param text1 文本1
     * @param text2 文本2
     * @return 相似度 (0-100)
     */
    public double calculateSimilarity(String text1, String text2) {
        if (text1 == null || text2 == null) {
            return 0;
        }
        
        // 标准化文本
        text1 = normalizeText(text1);
        text2 = normalizeText(text2);
        
        if (text1.isEmpty() && text2.isEmpty()) {
            return 100;
        }
        
        if (text1.isEmpty() || text2.isEmpty()) {
            return 0;
        }
        
        // 计算 Levenshtein 距离
        int distance = levenshteinDistance(text1, text2);
        
        // 转换为相似度百分比
        int maxLength = Math.max(text1.length(), text2.length());
        double similarity = (1.0 - (double) distance / maxLength) * 100;
        
        return Math.max(0, Math.min(100, similarity));
    }
    
    /**
     * 使用 Jaccard 相似度计算基于词汇的相似性
     * 更适合于长文本的语义相似性
     * 
     * @param text1 文本1
     * @param text2 文本2
     * @return 相似度 (0-100)
     */
    public double calculateJaccardSimilarity(String text1, String text2) {
        if (text1 == null || text2 == null) {
            return 0;
        }
        
        Set<String> set1 = tokenize(text1);
        Set<String> set2 = tokenize(text2);
        
        if (set1.isEmpty() && set2.isEmpty()) {
            return 100;
        }
        
        if (set1.isEmpty() || set2.isEmpty()) {
            return 0;
        }
        
        Set<String> intersection = new HashSet<>(set1);
        intersection.retainAll(set2);
        
        Set<String> union = new HashSet<>(set1);
        union.addAll(set2);
        
        double similarity = (double) intersection.size() / union.size() * 100;
        
        return Math.max(0, Math.min(100, similarity));
    }
    
    /**
     * 计算组合相似度（Levenshtein + Jaccard 的加权平均）
     * 
     * @param text1 文本1
     * @param text2 文本2
     * @param levenshteinWeight Levenshtein 权重 (0-1)
     * @return 相似度 (0-100)
     */
    public double calculateCombinedSimilarity(String text1, String text2, double levenshteinWeight) {
        if (levenshteinWeight < 0 || levenshteinWeight > 1) {
            levenshteinWeight = 0.4;
        }
        
        double levenshteinScore = calculateSimilarity(text1, text2);
        double jaccardScore = calculateJaccardSimilarity(text1, text2);
        
        return levenshteinScore * levenshteinWeight + jaccardScore * (1 - levenshteinWeight);
    }
    
    /**
     * 标准化文本
     */
    private String normalizeText(String text) {
        if (text == null) {
            return "";
        }
        
        return text
            .toLowerCase()
            .replaceAll("[^a-z0-9\\u4e00-\\u9fff\\s]", "")  // 保留中英文和数字
            .replaceAll("\\s+", " ")  // 合并多个空格
            .trim();
    }
    
    /**
     * 分词
     */
    private Set<String> tokenize(String text) {
        if (text == null || text.isEmpty()) {
            return new HashSet<>();
        }
        
        String normalized = normalizeText(text);
        
        Set<String> tokens = new HashSet<>();
        
        // 按空格分割
        String[] words = normalized.split("\\s+");
        
        for (String word : words) {
            if (word.length() > 0) {
                tokens.add(word);
                
                // 添加 2-gram
                if (word.length() > 2) {
                    for (int i = 0; i < word.length() - 1; i++) {
                        tokens.add(word.substring(i, i + 2));
                    }
                }
            }
        }
        
        return tokens;
    }
    
    /**
     * Levenshtein 距离算法
     */
    private int levenshteinDistance(String str1, String str2) {
        int[][] dp = new int[str1.length() + 1][str2.length() + 1];
        
        for (int i = 0; i <= str1.length(); i++) {
            dp[i][0] = i;
        }
        
        for (int j = 0; j <= str2.length(); j++) {
            dp[0][j] = j;
        }
        
        for (int i = 1; i <= str1.length(); i++) {
            for (int j = 1; j <= str2.length(); j++) {
                int cost = str1.charAt(i - 1) == str2.charAt(j - 1) ? 0 : 1;
                
                dp[i][j] = Math.min(
                    Math.min(
                        dp[i - 1][j] + 1,      // 删除
                        dp[i][j - 1] + 1       // 插入
                    ),
                    dp[i - 1][j - 1] + cost   // 替换
                );
            }
        }
        
        return dp[str1.length()][str2.length()];
    }
}
