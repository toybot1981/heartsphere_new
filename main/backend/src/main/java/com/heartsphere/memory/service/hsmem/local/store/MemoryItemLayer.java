package com.heartsphere.memory.service.hsmem.local.store;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

/**
 * 记忆项层 - 存储提取的记忆单元，与 HSMem Python MemoryItemLayer 行为一致。
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class MemoryItemLayer {

    private static final String INDEX_FILE = "index.json";
    private static final TypeReference<Map<String, Object>> INDEX_TYPE = new TypeReference<>() {};

    private final ObjectMapper objectMapper;

    /**
     * 存储记忆项
     *
     * @param itemsBasePath items 目录路径（memory_data/items）
     * @param item          记忆项数据（含 content、summary、memory_type、importance、categories、user_id、agent_id 等）
     * @param resourceId    关联的资源 ID
     * @return 记忆项 ID
     */
    public String store(Path itemsBasePath, Map<String, Object> item, String resourceId) throws Exception {
        Files.createDirectories(itemsBasePath);
        String itemId = UUID.randomUUID().toString();

        String now = Instant.now().toString();
        Map<String, Object> memoryItem = new LinkedHashMap<>();
        memoryItem.put("id", itemId);
        memoryItem.put("resource_id", resourceId);
        memoryItem.put("content", item.getOrDefault("content", ""));
        memoryItem.put("summary", item.getOrDefault("summary", ""));
        memoryItem.put("memory_type", item.getOrDefault("memory_type", "general"));
        memoryItem.put("importance", item.getOrDefault("importance", 0.5));
        memoryItem.put("categories", item.getOrDefault("categories", Collections.emptyList()));
        memoryItem.put("metadata", item.getOrDefault("metadata", Collections.emptyMap()));
        memoryItem.put("created_at", now);
        memoryItem.put("updated_at", now);
        if (item.containsKey("user_id")) {
            memoryItem.put("user_id", item.get("user_id"));
        }
        if (item.containsKey("agent_id")) {
            memoryItem.put("agent_id", item.get("agent_id"));
        }

        Path filePath = itemsBasePath.resolve(itemId + ".json");
        objectMapper.writerWithDefaultPrettyPrinter().writeValue(filePath.toFile(), memoryItem);

        Map<String, Object> index = loadIndex(itemsBasePath);
        Map<String, Object> entry = new LinkedHashMap<>();
        entry.put("resource_id", resourceId);
        entry.put("memory_type", memoryItem.get("memory_type"));
        entry.put("categories", memoryItem.get("categories"));
        entry.put("created_at", now);
        index.put(itemId, entry);
        saveIndex(itemsBasePath, index);

        return itemId;
    }

    public Optional<Map<String, Object>> get(Path itemsBasePath, String itemId) {
        try {
            Path filePath = itemsBasePath.resolve(itemId + ".json");
            if (!Files.exists(filePath)) {
                return Optional.empty();
            }
            @SuppressWarnings("unchecked")
            Map<String, Object> item = objectMapper.readValue(filePath.toFile(), Map.class);
            return Optional.of(item);
        } catch (Exception e) {
            log.warn("MemoryItemLayer.get failed: itemId={}", itemId, e);
            return Optional.empty();
        }
    }

    /** 按分类名搜索记忆项 */
    public List<Map<String, Object>> searchByCategory(Path itemsBasePath, String categoryName) {
        Map<String, Object> index = loadIndex(itemsBasePath);
        List<Map<String, Object>> results = new ArrayList<>();
        for (String itemId : index.keySet()) {
            Object entry = index.get(itemId);
            if (!(entry instanceof Map)) continue;
            Object c = ((Map<?, ?>) entry).get("categories");
            if (!(c instanceof List)) continue;
            @SuppressWarnings("unchecked")
            List<String> categories = (List<String>) (List<?>) c;
            if (categories.contains(categoryName)) {
                get(itemsBasePath, itemId).ifPresent(results::add);
            }
        }
        return results;
    }

    /** 按资源 ID 获取所有记忆项 */
    public List<Map<String, Object>> getByResource(Path itemsBasePath, String resourceId) {
        Map<String, Object> index = loadIndex(itemsBasePath);
        List<Map<String, Object>> results = new ArrayList<>();
        for (Map.Entry<String, Object> e : index.entrySet()) {
            @SuppressWarnings("unchecked")
            Map<String, Object> info = (Map<String, Object>) e.getValue();
            if (resourceId.equals(info.get("resource_id"))) {
                get(itemsBasePath, e.getKey()).ifPresent(results::add);
            }
        }
        return results;
    }

    /** 获取所有记忆项 */
    public List<Map<String, Object>> getAll(Path itemsBasePath) {
        Map<String, Object> index = loadIndex(itemsBasePath);
        List<Map<String, Object>> results = new ArrayList<>();
        for (String itemId : index.keySet()) {
            get(itemsBasePath, itemId).ifPresent(results::add);
        }
        return results;
    }

    /** 按 user_id 过滤记忆项 */
    public List<Map<String, Object>> searchByUserId(Path itemsBasePath, String userId) {
        return getAll(itemsBasePath).stream()
                .filter(item -> userId.equals(item.get("user_id")))
                .collect(Collectors.toList());
    }

    public int count(Path itemsBasePath) {
        try {
            if (!Files.isDirectory(itemsBasePath)) {
                return 0;
            }
            long c = Files.list(itemsBasePath)
                    .filter(p -> p.getFileName().toString().endsWith(".json") && !INDEX_FILE.equals(p.getFileName().toString()))
                    .count();
            return (int) c;
        } catch (Exception e) {
            log.warn("MemoryItemLayer.count failed", e);
            return 0;
        }
    }

    /** 删除记忆项（文件 + 索引） */
    public boolean delete(Path itemsBasePath, String itemId) {
        try {
            Path filePath = itemsBasePath.resolve(itemId + ".json");
            if (Files.exists(filePath)) {
                Files.delete(filePath);
            }
            Map<String, Object> index = loadIndex(itemsBasePath);
            if (index.remove(itemId) != null) {
                saveIndex(itemsBasePath, index);
            }
            return true;
        } catch (Exception e) {
            log.warn("MemoryItemLayer.delete failed: itemId={}", itemId, e);
            return false;
        }
    }

    /** 部分更新记忆项（仅更新允许的字段：content、summary、importance、categories、metadata、updated_at） */
    public boolean update(Path itemsBasePath, String itemId, Map<String, Object> updates) {
        Optional<Map<String, Object>> opt = get(itemsBasePath, itemId);
        if (opt.isEmpty()) return false;
        Map<String, Object> item = new LinkedHashMap<>(opt.get());
        if (updates.containsKey("content")) item.put("content", updates.get("content"));
        if (updates.containsKey("summary")) item.put("summary", updates.get("summary"));
        if (updates.containsKey("importance")) item.put("importance", updates.get("importance"));
        if (updates.containsKey("categories")) item.put("categories", updates.get("categories"));
        if (updates.containsKey("metadata")) item.put("metadata", updates.get("metadata"));
        item.put("updated_at", Instant.now().toString());
        try {
            Path filePath = itemsBasePath.resolve(itemId + ".json");
            objectMapper.writerWithDefaultPrettyPrinter().writeValue(filePath.toFile(), item);
            Map<String, Object> index = loadIndex(itemsBasePath);
            Object entry = index.get(itemId);
            if (entry instanceof Map) {
                @SuppressWarnings("unchecked")
                Map<String, Object> indexEntry = (Map<String, Object>) entry;
                if (updates.containsKey("categories")) indexEntry.put("categories", updates.get("categories"));
                indexEntry.put("updated_at", item.get("updated_at"));
                saveIndex(itemsBasePath, index);
            }
            return true;
        } catch (Exception e) {
            log.warn("MemoryItemLayer.update failed: itemId={}", itemId, e);
            return false;
        }
    }

    private Map<String, Object> loadIndex(Path itemsBasePath) {
        Path indexPath = itemsBasePath.resolve(INDEX_FILE);
        try {
            if (Files.exists(indexPath)) {
                return objectMapper.readValue(indexPath.toFile(), INDEX_TYPE);
            }
        } catch (Exception e) {
            log.warn("MemoryItemLayer.loadIndex failed", e);
        }
        return new LinkedHashMap<>();
    }

    private void saveIndex(Path itemsBasePath, Map<String, Object> index) {
        try {
            Path indexPath = itemsBasePath.resolve(INDEX_FILE);
            objectMapper.writerWithDefaultPrettyPrinter().writeValue(indexPath.toFile(), index);
        } catch (Exception e) {
            log.warn("MemoryItemLayer.saveIndex failed", e);
        }
    }
}
