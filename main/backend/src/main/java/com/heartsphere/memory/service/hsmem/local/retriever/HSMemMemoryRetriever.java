package com.heartsphere.memory.service.hsmem.local.retriever;

import com.heartsphere.memory.service.hsmem.local.store.MemoryCategoryLayer;
import com.heartsphere.memory.service.hsmem.local.store.MemoryItemLayer;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.nio.file.Path;
import java.util.*;
import java.util.stream.Collectors;

/**
 * 记忆检索器 - 与 HSMem Python MemoryRetriever 行为一致。
 * simple: 按查询关键词对分类 name/summary/description 匹配打分；若 where.user_id 存在则只保留该用户有记忆项的分类。
 * rag/llm: 当前委托 simple，可后续返回 501 或调用外部服务。
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class HSMemMemoryRetriever {

    private static final double SCORE_NAME = 0.5;
    private static final double SCORE_DESCRIPTION = 0.3;
    private static final double SCORE_SUMMARY = 0.2;

    private final MemoryCategoryLayer categoryLayer;
    private final MemoryItemLayer itemLayer;

    /**
     * 检索记忆
     *
     * @param basePath memory_data 根路径
     * @param method   simple / rag / llm（rag/llm 当前与 simple 相同）
     * @param query    查询文本
     * @param where    过滤条件（如 user_id）
     * @param limit    返回数量限制
     */
    public Map<String, Object> retrieve(Path basePath, String method,
                                        String query, Map<String, Object> where, int limit) {
        if (method == null || method.isEmpty()) {
            method = "simple";
        }
        Map<String, Object> result = simpleRetrieve(basePath, query, where, limit);
        result.put("method", method);
        return result;
    }

    private Map<String, Object> simpleRetrieve(Path basePath, String query,
                                              Map<String, Object> where, int limit) {
        Path categoriesPath = basePath.resolve("categories");
        Path itemsPath = basePath.resolve("items");

        List<Map<String, Object>> allCategories = categoryLayer.getAll(categoriesPath);
        String queryLower = (query != null ? query : "").toLowerCase();

        List<Map<String, Object>> scored = new ArrayList<>();
        for (Map<String, Object> category : allCategories) {
            double score = 0.0;

            String name = stringValue(category.get("name"));
            if (name.toLowerCase().contains(queryLower)) {
                score += SCORE_NAME;
            }
            String description = stringValue(category.get("description"));
            if (description.toLowerCase().contains(queryLower)) {
                score += SCORE_DESCRIPTION;
            }
            String summary = stringValue(category.get("summary"));
            if (summary.toLowerCase().contains(queryLower)) {
                score += SCORE_SUMMARY;
            }

            if (score <= 0) {
                continue;
            }

            if (where != null && where.containsKey("user_id")) {
                String userId = String.valueOf(where.get("user_id"));
                List<Map<String, Object>> categoryItems = itemLayer.searchByCategory(itemsPath, name);
                List<Map<String, Object>> matching = categoryItems.stream()
                        .filter(item -> userId.equals(String.valueOf(item.get("user_id"))))
                        .collect(Collectors.toList());
                if (matching.isEmpty()) {
                    continue;
                }
            }

            Map<String, Object> entry = new LinkedHashMap<>();
            entry.put("category", category);
            entry.put("score", score);
            scored.add(entry);
        }

        scored.sort((a, b) -> Double.compare((Double) b.get("score"), (Double) a.get("score")));

        List<Map<String, Object>> items = scored.stream()
                .limit(limit)
                .map(r -> (Map<String, Object>) r.get("category"))
                .collect(Collectors.toList());

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("method", "simple");
        result.put("query", query);
        result.put("items", items);
        result.put("total", scored.size());
        return result;
    }

    private static String stringValue(Object o) {
        if (o == null) {
            return "";
        }
        if (o instanceof Map) {
            return o.toString();
        }
        return o.toString();
    }
}
