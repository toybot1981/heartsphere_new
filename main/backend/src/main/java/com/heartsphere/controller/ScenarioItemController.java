package com.heartsphere.controller;

import com.heartsphere.dto.ApiResponse;
import com.heartsphere.dto.ScenarioItemDTO;
import com.heartsphere.security.UserDetailsImpl;
import com.heartsphere.service.ScenarioItemService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/scenario-items")
public class ScenarioItemController {

    @Autowired
    private ScenarioItemService itemService;

    /**
     * 获取场景的所有物品
     */
    @GetMapping("/era/{eraId}")
    public ResponseEntity<ApiResponse<List<ScenarioItemDTO>>> getItemsByEraId(@PathVariable Long eraId) {
        List<ScenarioItemDTO> items = itemService.getItemsByEraId(eraId);
        return ResponseEntity.ok(ApiResponse.success(items));
    }

    /**
     * 根据物品类型获取场景的物品
     */
    @GetMapping("/era/{eraId}/type/{itemType}")
    public ResponseEntity<ApiResponse<List<ScenarioItemDTO>>> getItemsByEraIdAndType(
            @PathVariable Long eraId, @PathVariable String itemType) {
        List<ScenarioItemDTO> items = itemService.getItemsByEraIdAndType(eraId, itemType);
        return ResponseEntity.ok(ApiResponse.success(items));
    }

    /**
     * 获取所有系统预设物品
     */
    @GetMapping("/system/all")
    public ResponseEntity<ApiResponse<List<ScenarioItemDTO>>> getSystemItems() {
        List<ScenarioItemDTO> items = itemService.getSystemItems();
        return ResponseEntity.ok(ApiResponse.success(items));
    }

    /**
     * 获取用户的所有自定义物品
     */
    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<ScenarioItemDTO>>> getMyItems() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (!(authentication.getPrincipal() instanceof UserDetailsImpl)) {
            return ResponseEntity.status(401).body(ApiResponse.error(401, "未登录"));
        }
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        List<ScenarioItemDTO> items = itemService.getUserItems(userDetails.getId());
        return ResponseEntity.ok(ApiResponse.success(items));
    }

    /**
     * 根据ID获取物品
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ScenarioItemDTO>> getItemById(@PathVariable Long id) {
        ScenarioItemDTO item = itemService.getItemById(id);
        return ResponseEntity.ok(ApiResponse.success(item));
    }

    /**
     * 根据itemId获取物品
     */
    @GetMapping("/by-item-id/{itemId}")
    public ResponseEntity<ApiResponse<ScenarioItemDTO>> getItemByItemId(@PathVariable String itemId) {
        ScenarioItemDTO item = itemService.getItemByItemId(itemId);
        return ResponseEntity.ok(ApiResponse.success(item));
    }

    /**
     * 创建物品
     */
    @PostMapping
    public ResponseEntity<ApiResponse<ScenarioItemDTO>> createItem(@RequestBody ScenarioItemDTO dto) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (!(authentication.getPrincipal() instanceof UserDetailsImpl)) {
            return ResponseEntity.status(401).body(ApiResponse.error(401, "未登录"));
        }
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        ScenarioItemDTO created = itemService.createItem(dto, userDetails.getId());
        return ResponseEntity.ok(ApiResponse.success(created));
    }

    /**
     * 更新物品
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ScenarioItemDTO>> updateItem(@PathVariable Long id, @RequestBody ScenarioItemDTO dto) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (!(authentication.getPrincipal() instanceof UserDetailsImpl)) {
            return ResponseEntity.status(401).body(ApiResponse.error(401, "未登录"));
        }
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        ScenarioItemDTO updated = itemService.updateItem(id, dto, userDetails.getId());
        return ResponseEntity.ok(ApiResponse.success(updated));
    }

    /**
     * 删除物品
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteItem(@PathVariable Long id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (!(authentication.getPrincipal() instanceof UserDetailsImpl)) {
            return ResponseEntity.status(401).body(ApiResponse.error(401, "未登录"));
        }
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        itemService.deleteItem(id, userDetails.getId());
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}

