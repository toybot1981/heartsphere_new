package com.heartsphere.memory.util;

import com.heartsphere.memory.dto.SaveMemoryRequest;
import com.heartsphere.memory.dto.hsmem.HSMemItemInput;
import com.heartsphere.memory.model.MemoryImportance;
import com.heartsphere.memory.model.MemoryType;
import com.heartsphere.memory.model.UserMemory;

import java.time.Instant;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * HSMem 记忆项与 UserMemory / SaveMemoryRequest 之间的映射。
 * 用于「长期记忆统一走 HSMem」后 /memories/* 与 HSMem 的转换。
 */
public final class HSMemMemoryMapper {

    private HSMemMemoryMapper() {}

    /**
     * HSMem 单条 item（Map）转为 UserMemory。
     */
    public static UserMemory fromHSMemItem(Map<String, Object> item) {
        if (item == null) return null;
        String id = (String) item.get("id");
        String userId = (String) item.get("user_id");
        String content = (String) item.get("content");
        String summary = (String) item.get("summary");
        String memoryTypeStr = (String) item.get("memory_type");
        Object impObj = item.get("importance");
        double importanceNum = impObj instanceof Number ? ((Number) impObj).doubleValue() : 0.5;
        @SuppressWarnings("unchecked")
        List<String> categories = (List<String>) item.get("categories");
        String createdAtStr = (String) item.get("created_at");
        @SuppressWarnings("unchecked")
        Map<String, Object> metadata = (Map<String, Object>) item.get("metadata");
        if (metadata == null) metadata = Collections.emptyMap();

        MemoryType type = null;
        if (memoryTypeStr != null && !memoryTypeStr.isEmpty()) {
            try {
                type = MemoryType.fromString(memoryTypeStr);
            } catch (Exception ignored) {
                type = MemoryType.PREFERENCE;
            }
        }
        if (type == null) type = MemoryType.PREFERENCE;

        MemoryImportance importance = importanceToEnum(importanceNum);
        Instant createdAt = null;
        if (createdAtStr != null && !createdAtStr.isEmpty()) {
            try {
                createdAt = Instant.parse(createdAtStr);
            } catch (Exception ignored) {}
        }
        if (createdAt == null) createdAt = Instant.now();

        return UserMemory.builder()
                .id(id)
                .userId(userId)
                .type(type)
                .importance(importance)
                .content(content != null ? content : "")
                .structuredData(null)
                .source(null)
                .sourceId((String) item.get("resource_id"))
                .createdAt(createdAt)
                .lastAccessedAt(createdAt)
                .accessCount(0)
                .confidence(null)
                .tags(categories)
                .metadata(metadata)
                .build();
    }

    /**
     * UserMemory 转为 HSMemItemInput（用于 memorizeItems）。
     */
    public static HSMemItemInput fromUserMemory(UserMemory m, String userId) {
        if (m == null) return null;
        HSMemItemInput input = new HSMemItemInput();
        input.setContent(m.getContent());
        input.setSummary(m.getContent() != null && m.getContent().length() > 200
                ? m.getContent().substring(0, 200) : m.getContent());
        input.setMemory_type(m.getType() != null ? m.getType().name().toLowerCase() : "general");
        input.setImportance(enumToImportance(m.getImportance()));
        input.setCategories(m.getTags() != null ? m.getTags() : Collections.emptyList());
        input.setMetadata(m.getMetadata());
        return input;
    }

    /**
     * SaveMemoryRequest 转为 HSMemItemInput。
     */
    public static HSMemItemInput fromSaveMemoryRequest(SaveMemoryRequest req, String userId) {
        if (req == null) return null;
        HSMemItemInput input = new HSMemItemInput();
        input.setContent(req.getContent());
        input.setSummary(req.getContent() != null && req.getContent().length() > 200
                ? req.getContent().substring(0, 200) : req.getContent());
        input.setMemory_type(req.getMemoryType() != null ? req.getMemoryType().name().toLowerCase() : "general");
        input.setImportance(enumToImportance(req.getImportance()));
        input.setCategories(req.getTags() != null ? req.getTags() : Collections.emptyList());
        input.setMetadata(req.getMetadata());
        return input;
    }

    private static MemoryImportance importanceToEnum(double v) {
        if (v >= 0.8) return MemoryImportance.CORE;
        if (v >= 0.6) return MemoryImportance.IMPORTANT;
        if (v >= 0.4) return MemoryImportance.NORMAL;
        return MemoryImportance.TEMPORARY;
    }

    private static double enumToImportance(MemoryImportance imp) {
        if (imp == null) return 0.5;
        switch (imp) {
            case CORE: return 0.9;
            case IMPORTANT: return 0.8;
            case TEMPORARY: return 0.3;
            default: return 0.5;
        }
    }

    /**
     * 构建用于 updateItem 的 updates Map（仅包含允许更新的字段）。
     */
    public static Map<String, Object> toUpdateMap(SaveMemoryRequest req) {
        if (req == null) return Collections.emptyMap();
        Map<String, Object> m = new LinkedHashMap<>();
        if (req.getContent() != null) m.put("content", req.getContent());
        if (req.getImportance() != null) m.put("importance", enumToImportance(req.getImportance()));
        if (req.getTags() != null) m.put("categories", req.getTags());
        if (req.getMetadata() != null) m.put("metadata", req.getMetadata());
        if (req.getContent() != null) m.put("summary", req.getContent().length() > 200 ? req.getContent().substring(0, 200) : req.getContent());
        return m;
    }
}
