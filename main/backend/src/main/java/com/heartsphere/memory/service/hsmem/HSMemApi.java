package com.heartsphere.memory.service.hsmem;

import com.heartsphere.memory.dto.hsmem.*;

/**
 * HSMem 统一 API：remote（外部服务）与 local（Main 内置）均实现此接口。
 * Controller 依赖本接口，通过配置 memory.hsmem.mode 切换实现。
 */
public interface HSMemApi {

    HSMemResponse.MemorizeData memorizeConversation(HSMemConversationRequest request);

    HSMemResponse.MemorizeData memorizeText(HSMemTextRequest request);

    HSMemResponse.MemorizeData memorizeDocument(HSMemDocumentRequest request);

    HSMemResponse.RetrieveData retrieve(HSMemRetrieveRequest request);

    HSMemResponse.StatisticsData getStatistics();

    HSMemResponse.CategoriesData getCategories();

    HSMemResponse.ItemsData getItems(String userId);

    HSMemResponse.ResourcesData getResources();

    /**
     * 批量写入已提取的记忆项（用于 saveMemory/saveMemories、从会话提取等）。
     * remote 模式可抛 UnsupportedOperationException。
     */
    HSMemResponse.MemorizeData memorizeItems(HSMemItemsRequest request);

    /**
     * 按 ID 获取单条记忆项，不存在返回 null。
     */
    java.util.Map<String, Object> getItem(String itemId);

    /**
     * 删除单条记忆项，不存在或失败返回 false。
     */
    boolean deleteItem(String itemId);

    /**
     * 部分更新单条记忆项（content/summary/importance/categories），不存在或失败返回 false。
     */
    boolean updateItem(String itemId, java.util.Map<String, Object> updates);
}
