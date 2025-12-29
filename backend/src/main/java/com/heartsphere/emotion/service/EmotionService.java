package com.heartsphere.emotion.service;

import com.heartsphere.emotion.dto.EmotionAnalysisRequest;
import com.heartsphere.emotion.dto.EmotionAnalysisResponse;
import com.heartsphere.emotion.entity.EmotionRecord;
import com.heartsphere.emotion.repository.EmotionRecordRepository;
import com.heartsphere.aiagent.service.AIService;
import com.heartsphere.aiagent.dto.request.TextGenerationRequest;
import com.heartsphere.aiagent.dto.response.TextGenerationResponse;
import com.heartsphere.memory.service.TemperatureMemoryService;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.JsonNode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * 情绪服务
 * 集成AI分析，支持温度感相关的情绪识别
 */
@Service
public class EmotionService {
    
    private static final Logger log = LoggerFactory.getLogger(EmotionService.class);
    
    @Autowired
    private EmotionRecordRepository emotionRecordRepository;
    
    @Autowired
    private AIService aiService;
    
    private final ObjectMapper objectMapper = new com.fasterxml.jackson.databind.ObjectMapper();
    
    @Autowired(required = false)
    private TemperatureMemoryService temperatureMemoryService;
    
    @Autowired(required = false)
    private com.heartsphere.heartconnect.storage.TemporaryDataStorage temporaryDataStorage;
    
    /**
     * 情绪类型枚举
     */
    private static final List<String> EMOTION_TYPES = Arrays.asList(
        "happy", "excited", "content", "peaceful", "hopeful", "grateful",
        "calm", "thoughtful", "focused", "relaxed",
        "sad", "anxious", "angry", "lonely", "tired", "confused"
    );
    
    /**
     * 情绪强度枚举
     */
    private static final List<String> INTENSITY_LEVELS = Arrays.asList(
        "mild", "moderate", "strong"
    );
    
    /**
     * 分析情绪（集成AI分析）
     */
    public EmotionAnalysisResponse analyzeEmotion(EmotionAnalysisRequest request) {
        if (request.getText() == null || request.getText().trim().isEmpty()) {
            return createDefaultResponse();
        }
        
        try {
            // 使用AI进行情绪分析
            String prompt = buildEmotionAnalysisPrompt(request);
            
            TextGenerationRequest aiRequest = new TextGenerationRequest();
            aiRequest.setPrompt(prompt);
            aiRequest.setSystemInstruction("你是一个专业的情绪分析专家，擅长深入理解文本中的情绪和情感。");
            aiRequest.setTemperature(0.3); // 较低温度以获得更一致的分析
            aiRequest.setMaxTokens(500);
            
            TextGenerationResponse aiResponse = aiService.generateText(
                request.getUserId(),
                aiRequest
            );
            
            // 解析AI响应
            return parseAIResponse(aiResponse.getContent(), request);
            
        } catch (Exception e) {
            // AI分析失败，使用基础分析
            return analyzeEmotionBasic(request);
        }
    }
    
    /**
     * 构建情绪分析提示词
     */
    private String buildEmotionAnalysisPrompt(EmotionAnalysisRequest request) {
        StringBuilder prompt = new StringBuilder();
        prompt.append("请分析以下文本的情绪状态，并返回JSON格式的结果。\n\n");
        prompt.append("文本内容：\n");
        prompt.append(request.getText()).append("\n\n");
        
        // 添加上下文信息
        if (request.getContext() != null && !request.getContext().isEmpty()) {
            prompt.append("上下文信息：\n");
            if (request.getConversationHistory() != null && !request.getConversationHistory().isEmpty()) {
                prompt.append("- 对话历史: ");
                prompt.append(String.join(" | ", 
                    request.getConversationHistory().stream()
                        .limit(3)
                        .collect(Collectors.toList())));
                prompt.append("\n");
            }
            if (request.getTimeOfDay() != null) {
                prompt.append("- 时间: ").append(request.getTimeOfDay()).append("点\n");
            }
            if (request.getDayOfWeek() != null) {
                String[] days = {"周日", "周一", "周二", "周三", "周四", "周五", "周六"};
                prompt.append("- 星期: ").append(days[request.getDayOfWeek()]).append("\n");
            }
            prompt.append("\n");
        }
        
        prompt.append("请分析并返回JSON格式结果，包含以下字段：\n");
        prompt.append("{\n");
        prompt.append("  \"primaryEmotion\": \"主要情绪类型（happy/excited/content/peaceful/hopeful/grateful/calm/thoughtful/focused/relaxed/sad/anxious/angry/lonely/tired/confused）\",\n");
        prompt.append("  \"secondaryEmotions\": [\"次要情绪类型数组（可选）\"],\n");
        prompt.append("  \"intensity\": \"情绪强度（mild/moderate/strong）\",\n");
        prompt.append("  \"confidence\": 分析置信度（0-1之间的小数）,\n");
        prompt.append("  \"emotionTags\": [\"情绪标签数组，如['工作压力', '情感困扰']\"],\n");
        prompt.append("  \"keyPhrases\": [\"关键短语数组，最能体现情绪的短语\"],\n");
        prompt.append("  \"reasoning\": \"分析理由（简要说明为什么得出这个结论）\"\n");
        prompt.append("}\n\n");
        prompt.append("注意：\n");
        prompt.append("- 要深入理解文本的隐含情绪，不仅仅是表面文字\n");
        prompt.append("- 考虑上下文的情绪背景\n");
        prompt.append("- 识别情绪的混合状态\n");
        prompt.append("- 评估情绪的强度和真实性\n");
        prompt.append("- 只返回JSON，不要包含其他文字\n");
        
        return prompt.toString();
    }
    
    /**
     * 解析AI响应
     */
    private EmotionAnalysisResponse parseAIResponse(String aiResponse, EmotionAnalysisRequest request) {
        try {
            // 清理响应文本（移除markdown代码块等）
            String jsonStr = cleanJsonResponse(aiResponse);
            
            // 解析JSON
            JsonNode jsonNode = objectMapper.readTree(jsonStr);
            
            EmotionAnalysisResponse response = new EmotionAnalysisResponse();
            
            // 解析主要情绪
            String primaryEmotion = jsonNode.has("primaryEmotion") 
                ? jsonNode.get("primaryEmotion").asText() 
                : "calm";
            response.setPrimaryEmotion(validateEmotionType(primaryEmotion));
            
            // 解析次要情绪
            if (jsonNode.has("secondaryEmotions") && jsonNode.get("secondaryEmotions").isArray()) {
                List<String> secondaryEmotions = new ArrayList<>();
                for (JsonNode emotion : jsonNode.get("secondaryEmotions")) {
                    String emotionStr = validateEmotionType(emotion.asText());
                    if (emotionStr != null) {
                        secondaryEmotions.add(emotionStr);
                    }
                }
                response.setSecondaryEmotions(secondaryEmotions);
            }
            
            // 解析强度
            String intensity = jsonNode.has("intensity") 
                ? jsonNode.get("intensity").asText() 
                : "moderate";
            response.setIntensity(validateIntensity(intensity));
            
            // 解析置信度
            double confidence = jsonNode.has("confidence") 
                ? Math.max(0.0, Math.min(1.0, jsonNode.get("confidence").asDouble())) 
                : 0.7;
            response.setConfidence(confidence);
            
            // 解析标签
            if (jsonNode.has("emotionTags") && jsonNode.get("emotionTags").isArray()) {
                List<String> tags = new ArrayList<>();
                for (JsonNode tag : jsonNode.get("emotionTags")) {
                    tags.add(tag.asText());
                }
                response.setEmotionTags(tags);
            } else {
                response.setEmotionTags(List.of());
            }
            
            // 解析关键短语
            if (jsonNode.has("keyPhrases") && jsonNode.get("keyPhrases").isArray()) {
                List<String> phrases = new ArrayList<>();
                for (JsonNode phrase : jsonNode.get("keyPhrases")) {
                    phrases.add(phrase.asText());
                }
                response.setKeyPhrases(phrases);
            } else {
                // 如果没有关键短语，从文本中提取
                response.setKeyPhrases(extractKeyPhrases(request.getText()));
            }
            
            // 解析理由
            if (jsonNode.has("reasoning")) {
                response.setReasoning(jsonNode.get("reasoning").asText());
            } else {
                response.setReasoning("AI分析结果");
            }
            
            return response;
            
        } catch (Exception e) {
            // 解析失败，使用基础分析
            return analyzeEmotionBasic(request);
        }
    }
    
    /**
     * 清理JSON响应（移除markdown代码块等）
     */
    private String cleanJsonResponse(String response) {
        String cleaned = response.trim();
        
        // 移除markdown代码块
        if (cleaned.startsWith("```")) {
            String[] lines = cleaned.split("\n");
            if (lines.length > 1) {
                // 移除第一行和最后一行
                cleaned = String.join("\n", Arrays.copyOfRange(lines, 1, lines.length - 1));
            }
        }
        
        // 移除json标记
        cleaned = cleaned.replaceFirst("^```json\\s*", "");
        cleaned = cleaned.replaceFirst("```\\s*$", "");
        
        return cleaned.trim();
    }
    
    /**
     * 验证情绪类型
     */
    private String validateEmotionType(String emotion) {
        if (emotion == null) {
            return "calm";
        }
        String lowerEmotion = emotion.toLowerCase();
        return EMOTION_TYPES.contains(lowerEmotion) ? lowerEmotion : "calm";
    }
    
    /**
     * 验证强度
     */
    private String validateIntensity(String intensity) {
        if (intensity == null) {
            return "moderate";
        }
        String lowerIntensity = intensity.toLowerCase();
        return INTENSITY_LEVELS.contains(lowerIntensity) ? lowerIntensity : "moderate";
    }
    
    /**
     * 基础情绪分析（降级方案）
     */
    private EmotionAnalysisResponse analyzeEmotionBasic(EmotionAnalysisRequest request) {
        String text = request.getText().toLowerCase();
        
        EmotionAnalysisResponse response = new EmotionAnalysisResponse();
        response.setIntensity("moderate");
        response.setConfidence(0.5);
        response.setEmotionTags(List.of());
        response.setKeyPhrases(extractKeyPhrases(request.getText()));
        response.setReasoning("基础关键词分析");
        
        // 简单的关键词匹配
        if (text.contains("开心") || text.contains("高兴") || text.contains("快乐")) {
            response.setPrimaryEmotion("happy");
        } else if (text.contains("难过") || text.contains("伤心") || text.contains("悲伤")) {
            response.setPrimaryEmotion("sad");
        } else if (text.contains("焦虑") || text.contains("担心") || text.contains("紧张")) {
            response.setPrimaryEmotion("anxious");
        } else if (text.contains("生气") || text.contains("愤怒")) {
            response.setPrimaryEmotion("angry");
        } else if (text.contains("累") || text.contains("疲惫")) {
            response.setPrimaryEmotion("tired");
        } else {
            response.setPrimaryEmotion("calm");
        }
        
        return response;
    }
    
    /**
     * 提取关键短语
     */
    private List<String> extractKeyPhrases(String text) {
        if (text == null || text.trim().isEmpty()) {
            return List.of();
        }
        
        // 简单的句子分割
        String[] sentences = text.split("[。！？\n]");
        return Arrays.stream(sentences)
            .filter(s -> s.trim().length() > 5)
            .limit(3)
            .map(String::trim)
            .collect(Collectors.toList());
    }
    
    /**
     * 创建默认响应
     */
    private EmotionAnalysisResponse createDefaultResponse() {
        EmotionAnalysisResponse response = new EmotionAnalysisResponse();
        response.setPrimaryEmotion("calm");
        response.setIntensity("mild");
        response.setConfidence(0.3);
        response.setEmotionTags(List.of());
        response.setKeyPhrases(List.of());
        return response;
    }
    
    /**
     * 保存情绪记录
     */
    @Transactional
    public EmotionRecord saveEmotionRecord(EmotionAnalysisResponse analysis, EmotionAnalysisRequest request) {
        // 检查是否处于体验模式
        if (com.heartsphere.heartconnect.context.ExperienceModeContext.isActive()) {
            Long shareConfigId = com.heartsphere.heartconnect.context.ExperienceModeContext.getShareConfigId();
            Long visitorId = com.heartsphere.heartconnect.context.ExperienceModeContext.getVisitorId();
            
            if (shareConfigId != null && visitorId != null && temporaryDataStorage != null) {
                // 体验模式：保存到临时存储
                EmotionRecord record = new EmotionRecord();
                record.setUserId(request.getUserId());
                record.setEmotionType(analysis.getPrimaryEmotion());
                record.setEmotionIntensity(analysis.getIntensity());
                record.setConfidence(analysis.getConfidence());
                record.setSource(request.getSource());
                record.setContext(request.getText());
                record.setTimestamp(LocalDateTime.now());
                
                if (analysis.getEmotionTags() != null && !analysis.getEmotionTags().isEmpty()) {
                    record.setEmotionTags(String.join(",", analysis.getEmotionTags()));
                }
                if (analysis.getKeyPhrases() != null && !analysis.getKeyPhrases().isEmpty()) {
                    record.setKeyPhrases(String.join(",", analysis.getKeyPhrases()));
                }
                if (analysis.getReasoning() != null) {
                    record.setReasoning(analysis.getReasoning());
                }
                
                // 保存到临时存储
                temporaryDataStorage.save(
                    shareConfigId.toString(),
                    visitorId.toString(),
                    "emotion",
                    record
                );
                log.debug("体验模式：保存情绪记录到临时存储: shareConfigId={}, visitorId={}", 
                    shareConfigId, visitorId);
                
                return record; // 返回记录但不保存到数据库
            }
        }
        
        // 正常模式：保存到数据库
        EmotionRecord record = new EmotionRecord();
        record.setUserId(request.getUserId());
        record.setEmotionType(analysis.getPrimaryEmotion());
        record.setEmotionIntensity(analysis.getIntensity());
        record.setConfidence(analysis.getConfidence());
        record.setSource(request.getSource());
        record.setContext(request.getText());
        record.setTimestamp(LocalDateTime.now());
        
        // 保存标签和关键短语（JSON格式）
        if (analysis.getEmotionTags() != null && !analysis.getEmotionTags().isEmpty()) {
            record.setEmotionTags(String.join(",", analysis.getEmotionTags()));
        }
        if (analysis.getKeyPhrases() != null && !analysis.getKeyPhrases().isEmpty()) {
            record.setKeyPhrases(String.join(",", analysis.getKeyPhrases()));
        }
        
        if (analysis.getReasoning() != null) {
            record.setReasoning(analysis.getReasoning());
        }
        
        return emotionRecordRepository.save(record);
    }
    
    /**
     * 获取用户情绪历史
     */
    public List<EmotionRecord> getEmotionHistory(Long userId, LocalDateTime startDate, LocalDateTime endDate) {
        if (startDate != null && endDate != null) {
            return emotionRecordRepository.findByUserIdAndTimeRange(userId, startDate, endDate);
        }
        return emotionRecordRepository.findByUserIdOrderByTimestampDesc(userId);
    }
    
    /**
     * 获取当前情绪
     */
    public EmotionRecord getCurrentEmotion(Long userId) {
        return emotionRecordRepository.findFirstByUserIdOrderByTimestampDesc(userId);
    }
    
    /**
     * 获取情绪统计
     * 用于温度感系统的统计分析和可视化
     */
    public List<Object[]> getEmotionStatistics(Long userId, LocalDateTime startDate) {
        return emotionRecordRepository.countByEmotionType(userId, startDate);
    }
    
    /**
     * 获取情绪趋势数据
     * 用于温度感系统的趋势分析和预测
     */
    public Map<String, Object> getEmotionTrend(Long userId, LocalDateTime startDate, LocalDateTime endDate) {
        List<EmotionRecord> records = getEmotionHistory(userId, startDate, endDate);
        
        Map<String, Object> trend = new HashMap<>();
        trend.put("total", records.size());
        trend.put("records", records);
        
        // 计算情绪分布
        Map<String, Long> emotionDistribution = records.stream()
            .collect(Collectors.groupingBy(
                EmotionRecord::getEmotionType,
                Collectors.counting()
            ));
        trend.put("distribution", emotionDistribution);
        
        // 计算平均置信度
        double avgConfidence = records.stream()
            .mapToDouble(EmotionRecord::getConfidence)
            .average()
            .orElse(0.0);
        trend.put("averageConfidence", avgConfidence);
        
        // 计算情绪强度分布
        Map<String, Long> intensityDistribution = records.stream()
            .collect(Collectors.groupingBy(
                EmotionRecord::getEmotionIntensity,
                Collectors.counting()
            ));
        trend.put("intensityDistribution", intensityDistribution);
        
        return trend;
    }
    
    /**
     * 根据情绪类型获取最近的记录
     * 用于温度感系统的情绪模式识别
     */
    public List<EmotionRecord> getRecentEmotionsByType(Long userId, String emotionType, int limit) {
        List<EmotionRecord> records = emotionRecordRepository
            .findByUserIdAndEmotionTypeOrderByTimestampDesc(userId, emotionType);
        return records.stream()
            .limit(limit)
            .collect(Collectors.toList());
    }
}

