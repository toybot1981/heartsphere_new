package com.heartsphere.plugin.core;

import com.heartsphere.plugin.model.PluginEvent;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * 插件事件总线
 * 
 * 处理插件间和插件与系统的通信
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Slf4j
@Component
public class PluginEventBus {
    
    /**
     * 事件处理器映射
     * key: 事件类型
     * value: 事件处理器列表
     */
    private final Map<String, List<PluginEventHandler>> handlers = new ConcurrentHashMap<>();
    
    /**
     * 发布事件
     * 
     * @param event 事件
     */
    public void publish(PluginEvent event) {
        String eventType = event.getEventType();
        List<PluginEventHandler> eventHandlers = handlers.get(eventType);
        
        if (eventHandlers != null && !eventHandlers.isEmpty()) {
            log.debug("发布事件: {}, 处理器数量: {}", eventType, eventHandlers.size());
            for (PluginEventHandler handler : eventHandlers) {
                try {
                    handler.handle(event);
                } catch (Exception e) {
                    log.error("事件处理失败: {}", eventType, e);
                }
            }
        } else {
            log.debug("事件类型 {} 没有处理器", eventType);
        }
    }
    
    /**
     * 订阅事件
     * 
     * @param eventType 事件类型
     * @param handler 事件处理器
     */
    public void subscribe(String eventType, PluginEventHandler handler) {
        handlers.computeIfAbsent(eventType, k -> new ArrayList<>()).add(handler);
        log.debug("订阅事件: {}, 当前处理器数量: {}", eventType, handlers.get(eventType).size());
    }
    
    /**
     * 取消订阅
     * 
     * @param eventType 事件类型
     * @param handler 事件处理器
     */
    public void unsubscribe(String eventType, PluginEventHandler handler) {
        List<PluginEventHandler> eventHandlers = handlers.get(eventType);
        if (eventHandlers != null) {
            eventHandlers.remove(handler);
            log.debug("取消订阅事件: {}, 剩余处理器数量: {}", eventType, eventHandlers.size());
        }
    }
    
    /**
     * 清空所有订阅
     */
    public void clear() {
        handlers.clear();
        log.debug("清空所有事件订阅");
    }
}
