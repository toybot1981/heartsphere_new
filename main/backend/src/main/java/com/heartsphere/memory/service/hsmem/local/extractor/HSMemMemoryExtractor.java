package com.heartsphere.memory.service.hsmem.local.extractor;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.*;

/**
 * 记忆提取器 - 与 HSMem Python MemoryExtractor 规则一致。
 * 对话：关键词匹配提取偏好、习惯、个人信息；文本：整段单条；文档：title+content 单条。
 */
@Component
@Slf4j
public class HSMemMemoryExtractor {

    private static final List<String> PREFERENCE_KEYWORDS = Arrays.asList(
            "喜欢", "爱", "偏好", "prefer", "like", "love");
    private static final List<String> HABIT_KEYWORDS = Arrays.asList(
            "每天", "经常", "总是", "习惯", "usually", "always", "every day");
    private static final int MAX_PREFERENCES = 5;
    private static final int MAX_HABITS = 5;
    private static final int MAX_PERSONAL_INFO = 5;
    private static final int PERSONAL_INFO_MESSAGES_LIMIT = 10;
    private static final int TEXT_SUMMARY_LEN = 100;

    /**
     * 从对话中提取记忆项（偏好、习惯、个人信息）
     */
    public List<Map<String, Object>> extractFromConversation(Map<String, Object> conversationData) {
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> messages = (List<Map<String, Object>>) conversationData.getOrDefault("messages", Collections.emptyList());
        List<Map<String, Object>> memoryItems = new ArrayList<>();

        List<String> preferences = extractPreferences(messages);
        if (!preferences.isEmpty()) {
            memoryItems.add(Map.of(
                    "content", String.join("\n", preferences),
                    "summary", "用户有 " + preferences.size() + " 个偏好",
                    "memory_type", "preference",
                    "categories", List.of("preferences", "user_profile"),
                    "importance", 0.7
            ));
        }

        List<String> habits = extractHabits(messages);
        if (!habits.isEmpty()) {
            memoryItems.add(Map.of(
                    "content", String.join("\n", habits),
                    "summary", "用户有 " + habits.size() + " 个习惯",
                    "memory_type", "habit",
                    "categories", List.of("habits", "behavior"),
                    "importance", 0.6
            ));
        }

        List<String> personalInfo = extractPersonalInfo(messages);
        if (!personalInfo.isEmpty()) {
            String summaryContent = personalInfo.size() >= 3
                    ? "个人信息: " + String.join(", ", personalInfo.subList(0, 3))
                    : "个人信息: " + String.join(", ", personalInfo);
            memoryItems.add(Map.of(
                    "content", String.join("\n", personalInfo),
                    "summary", summaryContent,
                    "memory_type", "personal_info",
                    "categories", List.of("personal_info", "basic_info"),
                    "importance", 0.8
            ));
        }

        return memoryItems;
    }

    /**
     * 从文本中提取记忆 - 整段作为一条 text_memory
     */
    public List<Map<String, Object>> extractFromText(String text, Map<String, Object> context) {
        if (context == null) {
            context = Collections.emptyMap();
        }
        List<String> categories = categoriesFromContext(context);
        String summary = text.length() > TEXT_SUMMARY_LEN ? text.substring(0, TEXT_SUMMARY_LEN) + "..." : text;
        return List.of(Map.<String, Object>of(
                "content", text,
                "summary", summary,
                "memory_type", "text_memory",
                "categories", categories,
                "importance", 0.5
        ));
    }

    private static List<String> categoriesFromContext(Map<String, Object> context) {
        Object c = context.get("categories");
        if (c == null) return List.of("general");
        if (c instanceof List) {
            List<String> out = new ArrayList<>();
            for (Object x : (List<?>) c) {
                if (x != null) out.add(x.toString());
            }
            return out.isEmpty() ? List.of("general") : out;
        }
        return List.of("general");
    }

    /**
     * 从文档中提取记忆 - title + content 一条 document 记忆
     */
    public List<Map<String, Object>> extractFromDocument(Map<String, Object> documentData) {
        String title = (String) documentData.getOrDefault("title", "");
        String content = (String) documentData.getOrDefault("content", "");
        Map<String, Object> item = new LinkedHashMap<>();
        item.put("content", "标题: " + title + "\n内容: " + content);
        item.put("summary", "文档: " + title);
        item.put("memory_type", "document");
        item.put("categories", List.of("knowledge", "document"));
        item.put("importance", 0.6);
        return List.of(item);
    }

    private List<String> extractPreferences(List<Map<String, Object>> messages) {
        List<String> result = new ArrayList<>();
        for (Map<String, Object> msg : messages) {
            String contentStr = getContentString(msg);
            String lower = contentStr.toLowerCase();
            for (String keyword : PREFERENCE_KEYWORDS) {
                if (lower.contains(keyword)) {
                    for (String sentence : contentStr.split("。")) {
                        if (sentence.toLowerCase().contains(keyword)) {
                            String trimmed = sentence.trim();
                            if (!trimmed.isEmpty()) {
                                result.add(trimmed);
                            }
                            break;
                        }
                    }
                    break;
                }
            }
            if (result.size() >= MAX_PREFERENCES) {
                return result.subList(0, MAX_PREFERENCES);
            }
        }
        return result;
    }

    private List<String> extractHabits(List<Map<String, Object>> messages) {
        List<String> result = new ArrayList<>();
        for (Map<String, Object> msg : messages) {
            String contentStr = getContentString(msg);
            String lower = contentStr.toLowerCase();
            for (String keyword : HABIT_KEYWORDS) {
                if (lower.contains(keyword)) {
                    for (String sentence : contentStr.split("。")) {
                        if (sentence.toLowerCase().contains(keyword)) {
                            String trimmed = sentence.trim();
                            if (!trimmed.isEmpty()) {
                                result.add(trimmed);
                            }
                            break;
                        }
                    }
                    break;
                }
            }
            if (result.size() >= MAX_HABITS) {
                return result.subList(0, MAX_HABITS);
            }
        }
        return result;
    }

    private List<String> extractPersonalInfo(List<Map<String, Object>> messages) {
        List<String> result = new ArrayList<>();
        int limit = Math.min(messages.size(), PERSONAL_INFO_MESSAGES_LIMIT);
        for (int i = 0; i < limit; i++) {
            String contentStr = getContentString(messages.get(i));
            if (contentStr.contains("我叫") || contentStr.contains("我是")) {
                result.add(contentStr);
            }
            if (result.size() >= MAX_PERSONAL_INFO) {
                break;
            }
        }
        return result;
    }

    private static String getContentString(Map<String, Object> msg) {
        Object content = msg.get("content");
        if (content == null) {
            return "";
        }
        if (content instanceof String) {
            return (String) content;
        }
        if (content instanceof Map) {
            Object text = ((Map<?, ?>) content).get("text");
            return text != null ? text.toString() : content.toString();
        }
        return content.toString();
    }
}
