package com.heartsphere.admin.controller;

import com.heartsphere.admin.entity.SystemEraItem;
import com.heartsphere.admin.service.SystemEraItemService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 系统预置时代物品管理控制器
 */
@RestController
@RequestMapping("/api/admin/system/era-items")
public class AdminSystemEraItemController extends BaseAdminController {

    @Autowired
    private SystemEraItemService itemService;

    /**
     * 获取所有系统物品
     */
    @GetMapping
    public ResponseEntity<List<SystemEraItem>> getAllItems(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        return ResponseEntity.ok(itemService.getAllItems());
    }

    /**
     * 根据系统时代ID获取物品
     */
    @GetMapping("/era/{systemEraId}")
    public ResponseEntity<List<SystemEraItem>> getItemsBySystemEraId(
            @PathVariable Long systemEraId,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        return ResponseEntity.ok(itemService.getItemsBySystemEraId(systemEraId));
    }

    /**
     * 根据物品类型获取物品
     */
    @GetMapping("/era/{systemEraId}/type/{itemType}")
    public ResponseEntity<List<SystemEraItem>> getItemsBySystemEraIdAndType(
            @PathVariable Long systemEraId,
            @PathVariable String itemType,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        return ResponseEntity.ok(itemService.getItemsBySystemEraIdAndType(systemEraId, itemType));
    }

    /**
     * 根据ID获取物品
     */
    @GetMapping("/{id}")
    public ResponseEntity<SystemEraItem> getItemById(
            @PathVariable Long id,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        return ResponseEntity.ok(itemService.getItemById(id));
    }

    /**
     * 创建系统物品
     */
    @PostMapping
    public ResponseEntity<SystemEraItem> createItem(
            @RequestBody SystemEraItem item,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        return ResponseEntity.ok(itemService.createItem(item));
    }

    /**
     * 更新系统物品
     */
    @PutMapping("/{id}")
    public ResponseEntity<SystemEraItem> updateItem(
            @PathVariable Long id,
            @RequestBody SystemEraItem item,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        return ResponseEntity.ok(itemService.updateItem(id, item));
    }

    /**
     * 删除系统物品
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteItem(
            @PathVariable Long id,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        itemService.deleteItem(id);
        return ResponseEntity.ok().build();
    }
}

