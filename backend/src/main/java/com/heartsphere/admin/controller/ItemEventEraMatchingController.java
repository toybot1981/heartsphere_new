package com.heartsphere.admin.controller;

import com.heartsphere.admin.service.ItemEventEraMatchingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * 物品和事件与系统时代匹配控制器
 */
@RestController
@RequestMapping("/api/admin/system/item-event-era-matching")
public class ItemEventEraMatchingController extends BaseAdminController {

    @Autowired
    private ItemEventEraMatchingService matchingService;

    /**
     * 匹配并更新所有物品和事件到正确的系统时代
     */
    @PostMapping("/match")
    public ResponseEntity<Map<String, Object>> matchItemsAndEventsToSystemEras(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        
        Map<String, Object> result = matchingService.matchItemsAndEventsToSystemEras();
        return ResponseEntity.ok(result);
    }

    /**
     * 临时接口：直接执行匹配（用于内部调用，不需要认证）
     * 注意：生产环境应移除此接口或添加其他安全措施
     */
    @PostMapping("/match-direct")
    public ResponseEntity<Map<String, Object>> matchItemsAndEventsToSystemErasDirect() {
        Map<String, Object> result = matchingService.matchItemsAndEventsToSystemEras();
        return ResponseEntity.ok(result);
    }
}

