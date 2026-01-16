package com.heartsphere.mailbox.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.heartsphere.aiagent.dto.request.TextGenerationRequest;
import com.heartsphere.aiagent.dto.response.TextGenerationResponse;
import com.heartsphere.aiagent.service.AIService;
import com.heartsphere.shared.dto.PromptRenderResponse;
import com.heartsphere.shared.service.PromptTemplateIntegrationService;
import com.heartsphere.emotion.entity.EmotionRecord;
import com.heartsphere.emotion.service.EmotionService;
import com.heartsphere.entity.Character;
import com.heartsphere.entity.JournalEntry;
import com.heartsphere.mailbox.dto.ESoulLetterContent;
import com.heartsphere.mailbox.enums.ESoulLetterType;
import com.heartsphere.repository.CharacterRepository;
import com.heartsphere.repository.JournalEntryRepository;
import com.heartsphere.memory.repository.jpa.UserMemoryRepository;
import com.heartsphere.memory.entity.UserMemoryEntity;
import com.heartsphere.memory.model.MemoryImportance;
import org.springframework.data.domain.PageRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * E-SOUL来信生成器
 * 负责使用AI生成个性化的来信内容
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ESoulLetterGenerator {
    
    private final AIService aiService;
    private final EmotionService emotionService;
    private final JournalEntryRepository journalEntryRepository;
    private final CharacterRepository characterRepository;
    private final PromptTemplateIntegrationService templateService;
    private final UserMemoryRepository userMemoryRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    /**
     * 生成来信内容
     */
    public ESoulLetterContent generateLetterContent(
            Long userId,
            Long characterId,
            ESoulLetterType letterType) {
        
        try {
            // 获取角色信息
            Character character = characterRepository.findById(characterId)
                .orElseThrow(() -> new RuntimeException("角色不存在: " + characterId));
            
            // 获取用户当前情绪
            EmotionRecord currentEmotion = emotionService.getCurrentEmotion(userId);
            
            // 获取用户最近的日记（用于个性化）
            List<JournalEntry> recentJournals = journalEntryRepository.findByUserIdWithAssociations(userId)
                .stream()
                .limit(5) // 只取最近5条日记
                .collect(Collectors.toList());
            
            // 获取用户的重要记忆（用于了解用户心境）
            List<UserMemoryEntity> importantMemories = userMemoryRepository
                .findByUserIdAndImportanceOrderByCreatedAtDesc(
                    String.valueOf(userId),
                    MemoryImportance.IMPORTANT,
                    PageRequest.of(0, 10) // 获取最近10条重要记忆
                );
            
            // 如果没有重要记忆，获取最近的记忆
            if (importantMemories == null || importantMemories.isEmpty()) {
                List<UserMemoryEntity> recentMemories = userMemoryRepository
                    .findByUserIdOrderByCreatedAtDesc(String.valueOf(userId));
                if (recentMemories != null && !recentMemories.isEmpty()) {
                    importantMemories = recentMemories.stream()
                        .limit(10)
                        .collect(Collectors.toList());
                }
            }
            
            // 构建AI提示词（硬编码作为fallback）
            String defaultPrompt = buildLetterPrompt(character, letterType, currentEmotion, recentJournals, importantMemories);
            
            // 从提示词管理系统读取提示词，如果不存在则使用硬编码作为fallback
            Map<String, Object> variables = new HashMap<>();
            variables.put("characterName", character.getName());
            variables.put("characterRole", character.getRole());
            variables.put("characterBio", character.getBio());
            variables.put("speechStyle", character.getSpeechStyle() != null ? character.getSpeechStyle() : "");
            variables.put("letterType", letterType.getDescription());
            
            // 构建情绪信息
            StringBuilder emotionInfo = new StringBuilder();
            if (currentEmotion != null) {
                emotionInfo.append("用户当前情绪状态：\n");
                emotionInfo.append(String.format("情绪类型：%s\n", currentEmotion.getEmotionType()));
                emotionInfo.append(String.format("情绪强度：%s\n", currentEmotion.getEmotionIntensity()));
                if (currentEmotion.getReasoning() != null && !currentEmotion.getReasoning().isEmpty()) {
                    emotionInfo.append(String.format("情绪分析：%s\n", currentEmotion.getReasoning()));
                }
            }
            variables.put("emotionInfo", emotionInfo.toString());
            
            // 构建日记信息
            StringBuilder journalInfo = new StringBuilder();
            if (recentJournals != null && !recentJournals.isEmpty()) {
                journalInfo.append("用户最近的日记（用于了解用户的心境和想法）：\n");
                for (JournalEntry journal : recentJournals) {
                    if (journal.getTitle() != null && !journal.getTitle().isEmpty()) {
                        journalInfo.append(String.format("- %s：%s\n", 
                            journal.getTitle(), 
                            journal.getContent() != null && journal.getContent().length() > 100 
                                ? journal.getContent().substring(0, 100) + "..." 
                                : journal.getContent()));
                    }
                }
            }
            variables.put("journalInfo", journalInfo.toString());
            
            // 构建记忆信息
            StringBuilder memoryInfo = new StringBuilder();
            if (importantMemories != null && !importantMemories.isEmpty()) {
                memoryInfo.append("用户的重要记忆（用于了解用户的心境和经历）：\n");
                for (UserMemoryEntity memory : importantMemories) {
                    if (memory.getContent() != null && !memory.getContent().isEmpty()) {
                        String content = memory.getContent().length() > 150 
                            ? memory.getContent().substring(0, 150) + "..." 
                            : memory.getContent();
                        memoryInfo.append(String.format("- %s\n", content));
                    }
                }
            }
            variables.put("memoryInfo", memoryInfo.toString());
            
            // 构建系统提示词，强调角色定位
            String systemPrompt = String.format(
                "你是%s，%s。你的性格特点：%s。\n" +
                "你正在给用户写一封充满情感的信件。请用第一人称，完全符合你的角色定位和说话风格。\n" +
                "信件应该体现你的性格特点，同时结合用户的心境（情绪、日记、记忆）来表达关心。",
                character.getName(),
                character.getRole() != null ? character.getRole() : "一个温暖的朋友",
                character.getBio() != null && !character.getBio().isEmpty() 
                    ? character.getBio() 
                    : (character.getSpeechStyle() != null && !character.getSpeechStyle().isEmpty()
                        ? character.getSpeechStyle()
                        : "温暖、体贴、真诚")
            );
            
            PromptRenderResponse prompts = templateService.getPrompts(
                "main-letter-generation",
                variables,
                systemPrompt,
                defaultPrompt
            );
            
            // 调用AI生成来信内容
            TextGenerationRequest aiRequest = new TextGenerationRequest();
            aiRequest.setPrompt(prompts.getUserPrompt());
            aiRequest.setSystemInstruction(prompts.getSystemPrompt());
            aiRequest.setTemperature(0.8); // 较高的温度以获得更有创造性的内容
            aiRequest.setMaxTokens(1000);
            
            TextGenerationResponse aiResponse = aiService.generateText(userId, aiRequest);
            
            // 解析AI响应（期望JSON格式：{"title": "...", "content": "..."}）
            return parseLetterResponse(aiResponse.getContent(), letterType);
            
        } catch (Exception e) {
            log.error("生成E-SOUL来信失败 - userId={}, characterId={}, type={}", 
                userId, characterId, letterType, e);
            // 返回默认内容
            return createDefaultLetterContent(letterType);
        }
    }
    
    /**
     * 构建来信提示词
     */
    private String buildLetterPrompt(
            Character character,
            ESoulLetterType letterType,
            EmotionRecord emotion,
            List<JournalEntry> journals,
            List<UserMemoryEntity> memories) {
        
        StringBuilder prompt = new StringBuilder();
        
        // 角色信息（强调角色定位）
        prompt.append("角色信息（请严格按照角色定位和性格特点来写这封信）：\n");
        prompt.append(String.format("姓名：%s\n", character.getName()));
        prompt.append(String.format("角色定位：%s\n", character.getRole() != null ? character.getRole() : "朋友"));
        prompt.append(String.format("角色简介：%s\n", character.getBio() != null ? character.getBio() : ""));
        if (character.getSpeechStyle() != null && !character.getSpeechStyle().isEmpty()) {
            prompt.append(String.format("说话风格：%s（请严格按照这个风格来写）\n", character.getSpeechStyle()));
        }
        if (character.getCatchphrases() != null && !character.getCatchphrases().isEmpty()) {
            prompt.append(String.format("常用语：%s\n", character.getCatchphrases()));
        }
        prompt.append("\n");
        
        // 来信类型
        prompt.append(String.format("来信类型：%s\n", letterType.getDescription()));
        prompt.append("\n");
        
        // 用户情绪信息
        if (emotion != null) {
            prompt.append("用户当前情绪状态：\n");
            prompt.append(String.format("情绪类型：%s\n", emotion.getEmotionType()));
            prompt.append(String.format("情绪强度：%s\n", emotion.getEmotionIntensity()));
            if (emotion.getReasoning() != null && !emotion.getReasoning().isEmpty()) {
                prompt.append(String.format("情绪分析：%s\n", emotion.getReasoning()));
            }
            prompt.append("\n");
        }
        
        // 用户日记信息
        if (journals != null && !journals.isEmpty()) {
            prompt.append("用户最近的日记（用于了解用户的心境和想法，请自然地融入信件中）：\n");
            for (JournalEntry journal : journals) {
                if (journal.getTitle() != null && !journal.getTitle().isEmpty()) {
                    prompt.append(String.format("- %s：%s\n", 
                        journal.getTitle(), 
                        journal.getContent() != null && journal.getContent().length() > 100 
                            ? journal.getContent().substring(0, 100) + "..." 
                            : journal.getContent()));
                }
            }
            prompt.append("\n");
        }
        
        // 用户记忆信息
        if (memories != null && !memories.isEmpty()) {
            prompt.append("用户的重要记忆（用于了解用户的心境和经历，请自然地融入信件中）：\n");
            for (UserMemoryEntity memory : memories) {
                if (memory.getContent() != null && !memory.getContent().isEmpty()) {
                    String content = memory.getContent().length() > 150 
                        ? memory.getContent().substring(0, 150) + "..." 
                        : memory.getContent();
                    prompt.append(String.format("- %s\n", content));
                }
            }
            prompt.append("\n");
        }
        
        // 信件要求
        prompt.append("请根据以上信息，生成一封温暖的信件。要求：\n");
        prompt.append("1. 使用JSON格式返回：{\"title\": \"信件标题\", \"content\": \"信件正文\"}\n");
        prompt.append("2. 信件必须完全符合角色的定位、性格特点和说话风格\n");
        prompt.append("3. 信件应该充满情感，结合用户的心境（情绪、日记、记忆）来表达关心\n");
        prompt.append("4. 如果提到了用户的日记或记忆，请自然地融入，不要显得生硬\n");
        
        switch (letterType) {
            case GREETING:
                prompt.append("3. 这是日常问候，应该轻松、友好\n");
                break;
            case CARE:
                prompt.append("3. 这是主动关怀，应该温暖、体贴，表达对用户的关心\n");
                if (emotion != null && isNegativeEmotion(emotion.getEmotionType())) {
                    prompt.append("4. 用户当前情绪较为负面，请给予鼓励和支持\n");
                }
                break;
            case SHARE:
                prompt.append("3. 这是分享内容，应该分享一些有趣的想法或回忆\n");
                break;
            case REMINDER:
                prompt.append("3. 这是提醒通知，应该友好地提醒用户重要的事情\n");
                break;
        }
        
        prompt.append("4. 如果提到了用户的日记，请自然地融入，不要显得生硬\n");
        prompt.append("5. 信件长度控制在200-500字之间\n");
        prompt.append("6. 使用中文，语言自然流畅\n");
        
        return prompt.toString();
    }
    
    /**
     * 判断是否为负面情绪
     */
    private boolean isNegativeEmotion(String emotionType) {
        if (emotionType == null) {
            return false;
        }
        String lower = emotionType.toLowerCase();
        return lower.contains("sad") || lower.contains("anxious") || 
               lower.contains("angry") || lower.contains("lonely") || 
               lower.contains("tired") || lower.contains("confused");
    }
    
    /**
     * 解析AI响应
     */
    private ESoulLetterContent parseLetterResponse(String aiResponse, ESoulLetterType letterType) {
        try {
            // 尝试解析JSON
            ESoulLetterContent content = objectMapper.readValue(aiResponse, ESoulLetterContent.class);
            if (content.getTitle() != null && content.getContent() != null) {
                return content;
            }
        } catch (Exception e) {
            log.warn("AI响应不是有效的JSON，尝试提取内容", e);
        }
        
        // 如果不是JSON格式，尝试提取标题和内容
        ESoulLetterContent content = new ESoulLetterContent();
        
        // 查找标题（可能包含"title"字段）
        int titleIndex = aiResponse.indexOf("\"title\"");
        int contentIndex = aiResponse.indexOf("\"content\"");
        
        if (titleIndex >= 0 && contentIndex >= 0) {
            // 提取标题
            String titlePart = aiResponse.substring(titleIndex, contentIndex);
            String title = extractJsonValue(titlePart, "title");
            content.setTitle(title != null ? title : getDefaultTitle(letterType));
            
            // 提取内容
            String contentPart = aiResponse.substring(contentIndex);
            String letterContent = extractJsonValue(contentPart, "content");
            content.setContent(letterContent != null ? letterContent : aiResponse);
        } else {
            // 如果没有找到JSON结构，使用默认标题，内容为AI响应
            content.setTitle(getDefaultTitle(letterType));
            content.setContent(aiResponse);
        }
        
        return content;
    }
    
    /**
     * 从JSON字符串中提取值
     */
    private String extractJsonValue(String json, String key) {
        try {
            int keyIndex = json.indexOf("\"" + key + "\"");
            if (keyIndex < 0) {
                return null;
            }
            
            int colonIndex = json.indexOf(":", keyIndex);
            if (colonIndex < 0) {
                return null;
            }
            
            int startQuote = json.indexOf("\"", colonIndex);
            if (startQuote < 0) {
                return null;
            }
            
            int endQuote = json.indexOf("\"", startQuote + 1);
            if (endQuote < 0) {
                return null;
            }
            
            return json.substring(startQuote + 1, endQuote);
        } catch (Exception e) {
            return null;
        }
    }
    
    /**
     * 获取默认标题
     */
    private String getDefaultTitle(ESoulLetterType letterType) {
        return switch (letterType) {
            case GREETING -> "来自我的问候";
            case CARE -> "想你了";
            case SHARE -> "想和你分享";
            case REMINDER -> "温馨提醒";
        };
    }
    
    /**
     * 创建默认来信内容（当AI生成失败时使用）
     */
    private ESoulLetterContent createDefaultLetterContent(ESoulLetterType letterType) {
        ESoulLetterContent content = new ESoulLetterContent();
        content.setTitle(getDefaultTitle(letterType));
        
        String defaultContent = switch (letterType) {
            case GREETING -> "你好！我想你了，最近过得怎么样？";
            case CARE -> "想你了，想看看你最近是否一切都好。";
            case SHARE -> "想和你分享一些有趣的事情。";
            case REMINDER -> "想提醒你一些重要的事情。";
        };
        
        content.setContent(defaultContent);
        return content;
    }
}


