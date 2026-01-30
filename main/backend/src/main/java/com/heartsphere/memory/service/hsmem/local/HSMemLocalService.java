package com.heartsphere.memory.service.hsmem.local;

import com.heartsphere.memory.config.MemoryProperties;
import com.heartsphere.memory.dto.hsmem.*;
import com.heartsphere.memory.service.hsmem.HSMemApi;
import com.heartsphere.memory.service.hsmem.local.extractor.HSMemMemoryExtractor;
import com.heartsphere.memory.service.hsmem.local.retriever.HSMemMemoryRetriever;
import com.heartsphere.memory.service.hsmem.local.store.MemoryCategoryLayer;
import com.heartsphere.memory.service.hsmem.local.store.MemoryItemLayer;
import com.heartsphere.memory.service.hsmem.local.store.ResourceLayer;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.*;

/**
 * Main 内置 HSMem 等价实现：memorize、retrieve、statistics、categories、items、resources。
 * 与 HSMem Python 语义一致，存储格式与目录结构相同。
 */
@Service
@ConditionalOnProperty(name = "heartsphere.memory.hsmem.mode", havingValue = "local", matchIfMissing = true)
@RequiredArgsConstructor
@Slf4j
public class HSMemLocalService implements HSMemApi {

    private final ResourceLayer resourceLayer;
    private final MemoryItemLayer itemLayer;
    private final MemoryCategoryLayer categoryLayer;
    private final HSMemMemoryExtractor extractor;
    private final HSMemMemoryRetriever retriever;
    private final MemoryProperties memoryProperties;

    private Path basePath() {
        String raw = memoryProperties.getHsmem().getLocal().getBasePath();
        return Paths.get(raw != null ? raw : "./memory_data").toAbsolutePath().normalize();
    }

    private Path resourcesPath() {
        return basePath().resolve("resources");
    }

    private Path itemsPath() {
        return basePath().resolve("items");
    }

    private Path categoriesPath() {
        return basePath().resolve("categories");
    }

    @Override
    public HSMemResponse.MemorizeData memorizeConversation(HSMemConversationRequest request) {
        try {
            Map<String, Object> conversation = new LinkedHashMap<>();
            List<Map<String, Object>> messages = new ArrayList<>();
            if (request.getMessages() != null) {
                for (HSMemMessage m : request.getMessages()) {
                    Map<String, Object> msg = new LinkedHashMap<>();
                    msg.put("role", m.getRole());
                    msg.put("content", m.getContent());
                    messages.add(msg);
                }
            }
            conversation.put("messages", messages);

            String resourceId = resourceLayer.store(resourcesPath(), conversation, "conversation");
            List<Map<String, Object>> memoryItems = extractor.extractFromConversation(conversation);
            return memorizeImpl(resourceId, "conversation", memoryItems,
                    request.getUser_id(), request.getAgent_id());
        } catch (Exception e) {
            log.warn("HSMemLocalService.memorizeConversation failed", e);
            throw new RuntimeException("记忆化对话失败: " + e.getMessage(), e);
        }
    }

    @Override
    public HSMemResponse.MemorizeData memorizeText(HSMemTextRequest request) {
        try {
            Map<String, Object> textData = new LinkedHashMap<>();
            textData.put("text", request.getText() != null ? request.getText() : "");
            textData.put("context", request.getContext() != null ? request.getContext() : Collections.emptyMap());

            String resourceId = resourceLayer.store(resourcesPath(), textData, "text");
            Map<String, Object> ctx = request.getContext() != null ? request.getContext() : Collections.emptyMap();
            List<Map<String, Object>> memoryItems = extractor.extractFromText(
                    request.getText() != null ? request.getText() : "", ctx);

            List<Map<String, Object>> withUser = new ArrayList<>();
            for (Map<String, Object> item : memoryItems) {
                Map<String, Object> copy = new LinkedHashMap<>(item);
                if (request.getUser_id() != null) {
                    copy.put("user_id", request.getUser_id());
                }
                withUser.add(copy);
            }
            return memorizeImpl(resourceId, "text", withUser, request.getUser_id(), null);
        } catch (Exception e) {
            log.warn("HSMemLocalService.memorizeText failed", e);
            throw new RuntimeException("记忆化文本失败: " + e.getMessage(), e);
        }
    }

    @Override
    public HSMemResponse.MemorizeData memorizeDocument(HSMemDocumentRequest request) {
        try {
            Map<String, Object> documentData = new LinkedHashMap<>();
            documentData.put("title", request.getTitle() != null ? request.getTitle() : "");
            documentData.put("content", request.getContent() != null ? request.getContent() : "");
            documentData.put("author", request.getAuthor());

            String resourceId = resourceLayer.store(resourcesPath(), documentData, "document");
            List<Map<String, Object>> memoryItems = extractor.extractFromDocument(documentData);

            List<Map<String, Object>> withUser = new ArrayList<>();
            for (Map<String, Object> item : memoryItems) {
                Map<String, Object> copy = new LinkedHashMap<>(item);
                if (request.getUser_id() != null) {
                    copy.put("user_id", request.getUser_id());
                }
                withUser.add(copy);
            }
            return memorizeImpl(resourceId, "document", withUser, request.getUser_id(), null);
        } catch (Exception e) {
            log.warn("HSMemLocalService.memorizeDocument failed", e);
            throw new RuntimeException("记忆化文档失败: " + e.getMessage(), e);
        }
    }

    private HSMemResponse.MemorizeData memorizeImpl(String resourceId, String modality,
                                                     List<Map<String, Object>> memoryItems,
                                                     String userId, String agentId) throws Exception {
        List<String> itemIds = new ArrayList<>();
        Map<String, List<String>> categoryMap = new LinkedHashMap<>();

        for (Map<String, Object> itemData : memoryItems) {
            Map<String, Object> item = new LinkedHashMap<>(itemData);
            if (userId != null) item.put("user_id", userId);
            if (agentId != null) item.put("agent_id", agentId);

            String itemId = itemLayer.store(itemsPath(), item, resourceId);
            itemIds.add(itemId);

            @SuppressWarnings("unchecked")
            List<String> cats = (List<String>) item.getOrDefault("categories", List.of("general"));
            if (cats == null) cats = List.of("general");
            for (String categoryName : cats) {
                categoryMap.computeIfAbsent(categoryName, k -> new ArrayList<>()).add(itemId);
            }
        }

        List<HSMemResponse.MemorizeData.Category> categories = new ArrayList<>();
        for (Map.Entry<String, List<String>> e : categoryMap.entrySet()) {
            String name = e.getKey();
            List<String> catItemIds = e.getValue();
            Map<String, Object> category = new LinkedHashMap<>();
            category.put("name", name);
            category.put("summary", "关于 " + name + " 的记忆");
            category.put("description", "包含 " + catItemIds.size() + " 个记忆项");
            categoryLayer.store(categoriesPath(), category, catItemIds);
            categories.add(new HSMemResponse.MemorizeData.Category(name, catItemIds.size()));
        }

        return new HSMemResponse.MemorizeData(resourceId, itemIds.size(), itemIds, categories);
    }

    @Override
    public HSMemResponse.RetrieveData retrieve(HSMemRetrieveRequest request) {
        try {
            List<String> queryTexts = new ArrayList<>();
            if (request.getQueries() != null) {
                for (HSMemMessage q : request.getQueries()) {
                    String text = contentToText(q.getContent());
                    if (text != null && !text.isEmpty()) queryTexts.add(text);
                }
            }
            String combined = String.join(" ", queryTexts);
            int limit = request.getLimit() != null ? request.getLimit() : 10;
            Map<String, Object> result = retriever.retrieve(
                    basePath(), "simple", combined, request.getWhere(), limit);

            @SuppressWarnings("unchecked")
            List<Map<String, Object>> items = (List<Map<String, Object>>) result.getOrDefault("items", Collections.emptyList());
            String method = (String) result.getOrDefault("method", "simple");
            return new HSMemResponse.RetrieveData(method, items);
        } catch (Exception e) {
            log.warn("HSMemLocalService.retrieve failed", e);
            throw new RuntimeException("检索记忆失败: " + e.getMessage(), e);
        }
    }

    @Override
    public HSMemResponse.StatisticsData getStatistics() {
        try {
            int resourcesCount = resourceLayer.count(resourcesPath());
            int itemsCount = itemLayer.count(itemsPath());
            int categoriesCount = categoryLayer.count(categoriesPath());
            return new HSMemResponse.StatisticsData(resourcesCount, itemsCount, categoriesCount);
        } catch (Exception e) {
            log.warn("HSMemLocalService.getStatistics failed", e);
            throw new RuntimeException("获取统计失败: " + e.getMessage(), e);
        }
    }

    @Override
    public HSMemResponse.CategoriesData getCategories() {
        try {
            List<Map<String, Object>> categories = categoryLayer.getAll(categoriesPath());
            return new HSMemResponse.CategoriesData(categories, categories.size());
        } catch (Exception e) {
            log.warn("HSMemLocalService.getCategories failed", e);
            throw new RuntimeException("获取分类失败: " + e.getMessage(), e);
        }
    }

    @Override
    public HSMemResponse.ItemsData getItems(String userId) {
        try {
            List<Map<String, Object>> items = (userId != null && !userId.isEmpty())
                    ? itemLayer.searchByUserId(itemsPath(), userId)
                    : itemLayer.getAll(itemsPath());
            return new HSMemResponse.ItemsData(items, items.size());
        } catch (Exception e) {
            log.warn("HSMemLocalService.getItems failed", e);
            throw new RuntimeException("获取记忆项失败: " + e.getMessage(), e);
        }
    }

    @Override
    public HSMemResponse.ResourcesData getResources() {
        try {
            List<Map<String, Object>> resources = resourceLayer.getAll(resourcesPath());
            return new HSMemResponse.ResourcesData(resources, resources.size());
        } catch (Exception e) {
            log.warn("HSMemLocalService.getResources failed", e);
            throw new RuntimeException("获取资源失败: " + e.getMessage(), e);
        }
    }

    @Override
    public HSMemResponse.MemorizeData memorizeItems(HSMemItemsRequest request) {
        if (request == null || request.getItems() == null || request.getItems().isEmpty()) {
            return new HSMemResponse.MemorizeData(null, 0, List.of(), List.of());
        }
        try {
            Map<String, Object> batchData = new LinkedHashMap<>();
            batchData.put("source", "memorize_items");
            batchData.put("user_id", request.getUser_id());
            batchData.put("count", request.getItems().size());
            String resourceId = resourceLayer.store(resourcesPath(), batchData, "batch");
            List<Map<String, Object>> itemMaps = new ArrayList<>();
            for (HSMemItemInput input : request.getItems()) {
                Map<String, Object> m = new LinkedHashMap<>();
                m.put("content", input.getContent() != null ? input.getContent() : "");
                m.put("summary", input.getSummary() != null ? input.getSummary() : "");
                m.put("memory_type", input.getMemory_type() != null ? input.getMemory_type() : "general");
                m.put("importance", input.getImportance() != null ? input.getImportance() : 0.5);
                m.put("categories", input.getCategories() != null ? input.getCategories() : List.of("general"));
                m.put("metadata", input.getMetadata() != null ? input.getMetadata() : Map.of());
                if (request.getUser_id() != null) m.put("user_id", request.getUser_id());
                itemMaps.add(m);
            }
            return memorizeImpl(resourceId, "batch", itemMaps, request.getUser_id(), null);
        } catch (Exception e) {
            log.warn("HSMemLocalService.memorizeItems failed", e);
            throw new RuntimeException("批量写入记忆项失败: " + e.getMessage(), e);
        }
    }

    @Override
    public Map<String, Object> getItem(String itemId) {
        if (itemId == null || itemId.isEmpty()) return null;
        return itemLayer.get(itemsPath(), itemId).orElse(null);
    }

    @Override
    public boolean deleteItem(String itemId) {
        if (itemId == null || itemId.isEmpty()) return false;
        return itemLayer.delete(itemsPath(), itemId);
    }

    @Override
    public boolean updateItem(String itemId, Map<String, Object> updates) {
        if (itemId == null || itemId.isEmpty() || updates == null || updates.isEmpty()) return false;
        return itemLayer.update(itemsPath(), itemId, updates);
    }

    private static String contentToText(Object content) {
        if (content == null) return "";
        if (content instanceof String) return (String) content;
        if (content instanceof Map) {
            Object t = ((Map<?, ?>) content).get("text");
            return t != null ? t.toString() : content.toString();
        }
        return content.toString();
    }
}
