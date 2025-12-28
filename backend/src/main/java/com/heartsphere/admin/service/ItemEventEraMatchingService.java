package com.heartsphere.admin.service;

import com.heartsphere.admin.entity.SystemEra;
import com.heartsphere.admin.entity.SystemEraEvent;
import com.heartsphere.admin.entity.SystemEraItem;
import com.heartsphere.admin.repository.SystemEraRepository;
import com.heartsphere.admin.repository.SystemEraEventRepository;
import com.heartsphere.admin.repository.SystemEraItemRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 物品和事件与系统时代的匹配服务
 * 用于修复物品和事件与场景的关联关系
 */
@Slf4j
@Service
public class ItemEventEraMatchingService {

    @Autowired
    private SystemEraItemRepository itemRepository;

    @Autowired
    private SystemEraEventRepository eventRepository;

    @Autowired
    private SystemEraRepository systemEraRepository;

    /**
     * 匹配并更新所有物品和事件到正确的系统时代
     * @return 匹配结果统计
     */
    @Transactional
    public Map<String, Object> matchItemsAndEventsToSystemEras() {
        log.info("========== 开始匹配物品和事件到系统时代 ==========");
        
        Map<String, Object> result = new HashMap<>();
        int itemsMatched = 0;
        int eventsMatched = 0;
        int itemsNotMatched = 0;
        int eventsNotMatched = 0;
        List<String> itemMatches = new ArrayList<>();
        List<String> eventMatches = new ArrayList<>();
        List<String> itemUnmatched = new ArrayList<>();
        List<String> eventUnmatched = new ArrayList<>();
        
        // 获取所有系统时代
        List<SystemEra> systemEras = systemEraRepository.findAllActiveOrdered();
        log.info("找到 {} 个系统时代", systemEras.size());
        
        // 创建时代名称到ID的映射（用于快速查找）
        Map<String, Long> eraNameMap = new HashMap<>();
        for (SystemEra era : systemEras) {
            eraNameMap.put(era.getName().toLowerCase(), era.getId());
        }
        
        // 1. 匹配物品
        List<SystemEraItem> items = itemRepository.findAll();
        log.info("找到 {} 个物品", items.size());
        
        for (SystemEraItem item : items) {
            try {
                Long matchedEraId = null;
                
                // 1. 如果已经有 systemEraId，检查是否需要重新匹配
                if (item.getSystemEraId() != null) {
                    // 如果已有systemEraId，可以选择跳过或重新匹配
                    // 这里选择重新匹配以确保准确性
                    matchedEraId = item.getSystemEraId();
                    log.debug("物品 '{}' 已有 systemEraId: {}，将重新验证", item.getName(), matchedEraId);
                }
                
                // 2. 如果还没有匹配，通过名称、标签、描述匹配
                if (matchedEraId == null) {
                    matchedEraId = findMatchingSystemEra(item.getName(), item.getTags(), item.getDescription(), eraNameMap, systemEras);
                }
                
                final Long finalMatchedEraId = matchedEraId;
                if (finalMatchedEraId != null) {
                    item.setSystemEraId(finalMatchedEraId);
                    itemRepository.save(item);
                    itemsMatched++;
                    SystemEra era = systemEras.stream().filter(e -> e.getId().equals(finalMatchedEraId)).findFirst().orElse(null);
                    itemMatches.add(String.format("物品 '%s' (ID: %d) -> 系统时代 '%s' (ID: %d)", 
                        item.getName(), item.getId(), era != null ? era.getName() : "未知", finalMatchedEraId));
                    log.info("✓ 物品 '{}' 匹配到系统时代 ID: {}", item.getName(), finalMatchedEraId);
                } else {
                    itemsNotMatched++;
                    itemUnmatched.add(String.format("物品 '%s' (ID: %d) - 未找到匹配的系统时代", item.getName(), item.getId()));
                    log.warn("✗ 物品 '{}' 未找到匹配的系统时代", item.getName());
                }
            } catch (Exception e) {
                log.error("匹配物品 '{}' 时出错: {}", item.getName(), e.getMessage(), e);
                itemsNotMatched++;
                itemUnmatched.add(String.format("物品 '%s' (ID: %d) - 匹配出错: %s", item.getName(), item.getId(), e.getMessage()));
            }
        }
        
        // 2. 匹配事件
        List<SystemEraEvent> events = eventRepository.findAll();
        log.info("找到 {} 个事件", events.size());
        
        for (SystemEraEvent event : events) {
            try {
                Long matchedEraId = null;
                
                // 1. 如果已经有 systemEraId，检查是否需要重新匹配
                if (event.getSystemEraId() != null) {
                    // 如果已有systemEraId，可以选择跳过或重新匹配
                    // 这里选择重新匹配以确保准确性
                    matchedEraId = event.getSystemEraId();
                    log.debug("事件 '{}' 已有 systemEraId: {}，将重新验证", event.getName(), matchedEraId);
                }
                
                // 2. 如果还没有匹配，通过名称、标签、描述匹配
                if (matchedEraId == null) {
                    matchedEraId = findMatchingSystemEra(event.getName(), event.getTags(), event.getDescription(), eraNameMap, systemEras);
                }
                
                final Long finalMatchedEraId = matchedEraId;
                if (finalMatchedEraId != null) {
                    event.setSystemEraId(finalMatchedEraId);
                    eventRepository.save(event);
                    eventsMatched++;
                    SystemEra era = systemEras.stream().filter(e -> e.getId().equals(finalMatchedEraId)).findFirst().orElse(null);
                    eventMatches.add(String.format("事件 '%s' (ID: %d) -> 系统时代 '%s' (ID: %d)", 
                        event.getName(), event.getId(), era != null ? era.getName() : "未知", finalMatchedEraId));
                    log.info("✓ 事件 '{}' 匹配到系统时代 ID: {}", event.getName(), finalMatchedEraId);
                } else {
                    eventsNotMatched++;
                    eventUnmatched.add(String.format("事件 '%s' (ID: %d) - 未找到匹配的系统时代", event.getName(), event.getId()));
                    log.warn("✗ 事件 '{}' 未找到匹配的系统时代", event.getName());
                }
            } catch (Exception e) {
                log.error("匹配事件 '{}' 时出错: {}", event.getName(), e.getMessage(), e);
                eventsNotMatched++;
                eventUnmatched.add(String.format("事件 '%s' (ID: %d) - 匹配出错: %s", event.getName(), event.getId(), e.getMessage()));
            }
        }
        
        result.put("itemsMatched", itemsMatched);
        result.put("eventsMatched", eventsMatched);
        result.put("itemsNotMatched", itemsNotMatched);
        result.put("eventsNotMatched", eventsNotMatched);
        result.put("itemMatches", itemMatches);
        result.put("eventMatches", eventMatches);
        result.put("itemUnmatched", itemUnmatched);
        result.put("eventUnmatched", eventUnmatched);
        result.put("totalItems", items.size());
        result.put("totalEvents", events.size());
        
        log.info("========== 匹配完成 ==========");
        log.info("物品匹配: {}/{}", itemsMatched, items.size());
        log.info("事件匹配: {}/{}", eventsMatched, events.size());
        
        return result;
    }
    
    /**
     * 根据名称、标签、描述等信息查找匹配的系统时代
     */
    private Long findMatchingSystemEra(String name, String tags, String description, 
                                       Map<String, Long> eraNameMap, List<SystemEra> systemEras) {
        if (name == null || name.trim().isEmpty()) {
            return null;
        }
        
        String nameLower = name.toLowerCase().trim();
        
        // 1. 直接名称匹配
        if (eraNameMap.containsKey(nameLower)) {
            return eraNameMap.get(nameLower);
        }
        
        // 2. 关键词匹配（根据物品/事件名称中的关键词匹配时代）
        Map<String, String> keywordMap = createEraKeywordMap();
        for (Map.Entry<String, String> entry : keywordMap.entrySet()) {
            if (nameLower.contains(entry.getKey())) {
                String eraName = entry.getValue();
                if (eraNameMap.containsKey(eraName.toLowerCase())) {
                    return eraNameMap.get(eraName.toLowerCase());
                }
            }
        }
        
        // 3. 标签匹配
        if (tags != null && !tags.trim().isEmpty()) {
            String[] tagArray = tags.split(",");
            for (String tag : tagArray) {
                String tagLower = tag.trim().toLowerCase();
                if (eraNameMap.containsKey(tagLower)) {
                    return eraNameMap.get(tagLower);
                }
                // 关键词匹配标签
                for (Map.Entry<String, String> entry : keywordMap.entrySet()) {
                    if (tagLower.contains(entry.getKey())) {
                        String eraName = entry.getValue();
                        if (eraNameMap.containsKey(eraName.toLowerCase())) {
                            return eraNameMap.get(eraName.toLowerCase());
                        }
                    }
                }
            }
        }
        
        // 4. 描述匹配
        if (description != null && !description.trim().isEmpty()) {
            String descLower = description.toLowerCase();
            for (Map.Entry<String, String> entry : keywordMap.entrySet()) {
                if (descLower.contains(entry.getKey())) {
                    String eraName = entry.getValue();
                    if (eraNameMap.containsKey(eraName.toLowerCase())) {
                        return eraNameMap.get(eraName.toLowerCase());
                    }
                }
            }
        }
        
        return null;
    }
    
    /**
     * 创建时代关键词映射
     * 用于根据物品/事件的名称、标签、描述中的关键词匹配到对应的系统时代
     */
    private Map<String, String> createEraKeywordMap() {
        Map<String, String> keywordMap = new HashMap<>();
        
        // 古代相关关键词
        keywordMap.put("古代", "古代");
        keywordMap.put("先秦", "古代");
        keywordMap.put("春秋", "古代");
        keywordMap.put("战国", "古代");
        keywordMap.put("秦汉", "古代");
        keywordMap.put("汉朝", "古代");
        keywordMap.put("唐朝", "古代");
        keywordMap.put("宋朝", "古代");
        keywordMap.put("明朝", "古代");
        keywordMap.put("清朝", "古代");
        keywordMap.put("皇帝", "古代");
        keywordMap.put("宫廷", "古代");
        keywordMap.put("皇宫", "古代");
        keywordMap.put("武林", "古代");
        keywordMap.put("江湖", "古代");
        keywordMap.put("武侠", "古代");
        keywordMap.put("剑", "古代");
        keywordMap.put("刀", "古代");
        keywordMap.put("弓箭", "古代");
        keywordMap.put("马", "古代");
        keywordMap.put("马车", "古代");
        keywordMap.put("古装", "古代");
        
        // 现代相关关键词
        keywordMap.put("现代", "现代");
        keywordMap.put("当代", "现代");
        keywordMap.put("城市", "现代");
        keywordMap.put("都市", "现代");
        keywordMap.put("汽车", "现代");
        keywordMap.put("手机", "现代");
        keywordMap.put("电脑", "现代");
        keywordMap.put("网络", "现代");
        keywordMap.put("互联网", "现代");
        keywordMap.put("公司", "现代");
        keywordMap.put("办公室", "现代");
        keywordMap.put("学校", "现代");
        keywordMap.put("医院", "现代");
        keywordMap.put("警察", "现代");
        keywordMap.put("律师", "现代");
        keywordMap.put("医生", "现代");
        keywordMap.put("教师", "现代");
        keywordMap.put("学生", "现代");
        keywordMap.put("校园", "现代");
        keywordMap.put("学校", "现代");
        keywordMap.put("大学", "现代");
        keywordMap.put("中学", "现代");
        keywordMap.put("小学", "现代");
        keywordMap.put("教室", "现代");
        keywordMap.put("课堂", "现代");
        keywordMap.put("图书馆", "现代");
        keywordMap.put("食堂", "现代");
        keywordMap.put("宿舍", "现代");
        keywordMap.put("考试", "现代");
        keywordMap.put("作业", "现代");
        keywordMap.put("课本", "现代");
        keywordMap.put("笔记本", "现代");
        keywordMap.put("学生证", "现代");
        keywordMap.put("校园卡", "现代");
        keywordMap.put("毕业", "现代");
        keywordMap.put("论文", "现代");
        keywordMap.put("社团", "现代");
        keywordMap.put("上课", "现代");
        keywordMap.put("课间", "现代");
        keywordMap.put("选课", "现代");
        keywordMap.put("实验", "现代");
        keywordMap.put("奖学金", "现代");
        keywordMap.put("校服", "现代");
        
        // 未来相关关键词
        keywordMap.put("未来", "未来");
        keywordMap.put("科幻", "未来");
        keywordMap.put("太空", "未来");
        keywordMap.put("宇宙", "未来");
        keywordMap.put("机器人", "未来");
        keywordMap.put("人工智能", "未来");
        keywordMap.put("AI", "未来");
        keywordMap.put("飞船", "未来");
        keywordMap.put("星际", "未来");
        keywordMap.put("激光", "未来");
        keywordMap.put("能量", "未来");
        keywordMap.put("虚拟", "未来");
        keywordMap.put("数字", "未来");
        keywordMap.put("赛博", "未来");
        keywordMap.put("赛博朋克", "未来");
        
        // 奇幻相关关键词
        keywordMap.put("奇幻", "奇幻");
        keywordMap.put("魔法", "奇幻");
        keywordMap.put("巫师", "奇幻");
        keywordMap.put("精灵", "奇幻");
        keywordMap.put("龙", "奇幻");
        keywordMap.put("兽人", "奇幻");
        keywordMap.put("矮人", "奇幻");
        keywordMap.put("城堡", "奇幻");
        keywordMap.put("魔法师", "奇幻");
        keywordMap.put("法术", "奇幻");
        keywordMap.put("魔杖", "奇幻");
        keywordMap.put("水晶", "奇幻");
        
        // 末日相关关键词
        keywordMap.put("末日", "末日");
        keywordMap.put("末世", "末日");
        keywordMap.put("丧尸", "末日");
        keywordMap.put("僵尸", "末日");
        keywordMap.put("废墟", "末日");
        keywordMap.put("生存", "末日");
        keywordMap.put("避难所", "末日");
        keywordMap.put("病毒", "末日");
        keywordMap.put("感染", "末日");
        keywordMap.put("武器", "末日");
        keywordMap.put("枪", "末日");
        keywordMap.put("弹药", "末日");
        
        return keywordMap;
    }
}

