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
 * 记忆分类层 - 聚合的结构化记忆，与 HSMem Python MemoryCategoryLayer 行为一致。
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class MemoryCategoryLayer {

    private static final String CATEGORIES_INDEX_FILE = "categories_index.json";
    private static final TypeReference<Map<String, Object>> INDEX_TYPE = new TypeReference<>() {};

    private final ObjectMapper objectMapper;

    /**
     * 存储记忆分类
     *
     * @param categoriesBasePath categories 目录路径（memory_data/categories）
     * @param category           分类数据（name、summary、description、metadata）
     * @param itemIds            关联的记忆项 ID 列表
     * @return 分类 ID
     */
    public String store(Path categoriesBasePath, Map<String, Object> category, List<String> itemIds) throws Exception {
        Files.createDirectories(categoriesBasePath);
        String categoryId = UUID.randomUUID().toString();

        String now = Instant.now().toString();
        Map<String, Object> memoryCategory = new LinkedHashMap<>();
        memoryCategory.put("id", categoryId);
        memoryCategory.put("name", category.getOrDefault("name", "general"));
        memoryCategory.put("summary", category.getOrDefault("summary", ""));
        memoryCategory.put("description", category.getOrDefault("description", ""));
        memoryCategory.put("item_ids", itemIds != null ? itemIds : Collections.emptyList());
        memoryCategory.put("metadata", category.getOrDefault("metadata", Collections.emptyMap()));
        memoryCategory.put("created_at", now);
        memoryCategory.put("updated_at", now);
        memoryCategory.put("version", 1);

        Path filePath = categoriesBasePath.resolve(categoryId + ".json");
        objectMapper.writerWithDefaultPrettyPrinter().writeValue(filePath.toFile(), memoryCategory);

        saveMarkdown(categoriesBasePath.resolve(categoryId + ".md"), memoryCategory, itemIds != null ? itemIds : Collections.emptyList());

        Map<String, Object> index = loadIndex(categoriesBasePath);
        Map<String, Object> entry = new LinkedHashMap<>();
        entry.put("name", memoryCategory.get("name"));
        entry.put("item_count", (itemIds != null ? itemIds.size() : 0));
        entry.put("created_at", now);
        entry.put("updated_at", now);
        index.put(categoryId, entry);
        saveIndex(categoriesBasePath, index);

        return categoryId;
    }

    public Optional<Map<String, Object>> get(Path categoriesBasePath, String categoryId) {
        try {
            Path filePath = categoriesBasePath.resolve(categoryId + ".json");
            if (!Files.exists(filePath)) {
                return Optional.empty();
            }
            @SuppressWarnings("unchecked")
            Map<String, Object> category = objectMapper.readValue(filePath.toFile(), Map.class);
            return Optional.of(category);
        } catch (Exception e) {
            log.warn("MemoryCategoryLayer.get failed: categoryId={}", categoryId, e);
            return Optional.empty();
        }
    }

    /** 获取所有分类 */
    public List<Map<String, Object>> getAll(Path categoriesBasePath) {
        Map<String, Object> index = loadIndex(categoriesBasePath);
        List<Map<String, Object>> results = new ArrayList<>();
        for (String categoryId : index.keySet()) {
            get(categoriesBasePath, categoryId).ifPresent(results::add);
        }
        return results;
    }

    /** 按 name 查找分类（第一个匹配） */
    public Optional<Map<String, Object>> getByName(Path categoriesBasePath, String name) {
        Map<String, Object> index = loadIndex(categoriesBasePath);
        for (Map.Entry<String, Object> e : index.entrySet()) {
            @SuppressWarnings("unchecked")
            Map<String, Object> info = (Map<String, Object>) e.getValue();
            if (name.equals(info.get("name"))) {
                return get(categoriesBasePath, e.getKey());
            }
        }
        return Optional.empty();
    }

    /** 更新分类 */
    public void update(Path categoriesBasePath, String categoryId, Map<String, Object> updates) {
        Optional<Map<String, Object>> opt = get(categoriesBasePath, categoryId);
        if (opt.isEmpty()) {
            return;
        }
        Map<String, Object> category = new LinkedHashMap<>(opt.get());
        for (Map.Entry<String, Object> e : updates.entrySet()) {
            if (category.containsKey(e.getKey())) {
                category.put(e.getKey(), e.getValue());
            }
        }
        String now = Instant.now().toString();
        category.put("updated_at", now);
        int version = ((Number) category.getOrDefault("version", 1)).intValue();
        category.put("version", version + 1);

        try {
            Path filePath = categoriesBasePath.resolve(categoryId + ".json");
            objectMapper.writerWithDefaultPrettyPrinter().writeValue(filePath.toFile(), category);
            @SuppressWarnings("unchecked")
            List<String> itemIds = (List<String>) category.getOrDefault("item_ids", Collections.emptyList());
            saveMarkdown(categoriesBasePath.resolve(categoryId + ".md"), category, itemIds);

            Map<String, Object> index = loadIndex(categoriesBasePath);
            if (index.containsKey(categoryId)) {
                @SuppressWarnings("unchecked")
                Map<String, Object> entry = new LinkedHashMap<>((Map<String, Object>) index.get(categoryId));
                entry.put("updated_at", now);
                index.put(categoryId, entry);
                saveIndex(categoriesBasePath, index);
            }
        } catch (Exception e) {
            log.warn("MemoryCategoryLayer.update failed: categoryId={}", categoryId, e);
        }
    }

    public int count(Path categoriesBasePath) {
        try {
            if (!Files.isDirectory(categoriesBasePath)) {
                return 0;
            }
            long c = Files.list(categoriesBasePath)
                    .filter(p -> p.getFileName().toString().endsWith(".json") && !CATEGORIES_INDEX_FILE.equals(p.getFileName().toString()))
                    .count();
            return (int) c;
        } catch (Exception e) {
            log.warn("MemoryCategoryLayer.count failed", e);
            return 0;
        }
    }

    private void saveMarkdown(Path mdPath, Map<String, Object> category, List<String> itemIds) {
        try {
            String content = "# " + category.get("name") + "\n\n"
                    + "## 概述\n" + category.getOrDefault("summary", "") + "\n\n"
                    + "## 描述\n" + category.getOrDefault("description", "") + "\n\n"
                    + "## 包含记忆项数量\n" + (itemIds != null ? itemIds.size() : 0) + "\n\n"
                    + "## 创建时间\n" + category.get("created_at") + "\n\n"
                    + "## 更新时间\n" + category.get("updated_at") + "\n\n"
                    + "## 版本\n" + category.get("version") + "\n";
            Files.writeString(mdPath, content);
        } catch (Exception e) {
            log.warn("MemoryCategoryLayer.saveMarkdown failed: {}", mdPath, e);
        }
    }

    private Map<String, Object> loadIndex(Path categoriesBasePath) {
        Path indexPath = categoriesBasePath.resolve(CATEGORIES_INDEX_FILE);
        try {
            if (Files.exists(indexPath)) {
                return objectMapper.readValue(indexPath.toFile(), INDEX_TYPE);
            }
        } catch (Exception e) {
            log.warn("MemoryCategoryLayer.loadIndex failed", e);
        }
        return new LinkedHashMap<>();
    }

    private void saveIndex(Path categoriesBasePath, Map<String, Object> index) {
        try {
            Path indexPath = categoriesBasePath.resolve(CATEGORIES_INDEX_FILE);
            objectMapper.writerWithDefaultPrettyPrinter().writeValue(indexPath.toFile(), index);
        } catch (Exception e) {
            log.warn("MemoryCategoryLayer.saveIndex failed", e);
        }
    }
}
