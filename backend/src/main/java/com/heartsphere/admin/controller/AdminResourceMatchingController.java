package com.heartsphere.admin.controller;

import com.heartsphere.admin.service.ResourceMatchingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * 资源匹配管理控制器
 */
@RestController
@RequestMapping("/api/admin/system/resources")
public class AdminResourceMatchingController extends BaseAdminController {

    @Autowired
    private ResourceMatchingService resourceMatchingService;

    /**
     * 匹配资源并更新预置场景和角色的图片
     * 根据名称匹配：
     * - 场景：匹配 category='era' 且名称相同的资源，更新场景的 imageUrl
     * - 角色头像：匹配 category='character' 或 'avatar' 的资源，资源名称包含角色名称或角色名称包含资源名称
     *   匹配成功后，直接将资源图片URL复制给角色的头像
     * 
     * 注意：此接口必须放在 /resources/{id} 之前，以避免路径冲突
     */
    @PostMapping("/match-and-update")
    public ResponseEntity<Map<String, Object>> matchAndUpdateResources(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        Map<String, Object> result = resourceMatchingService.matchAndUpdateResources();
        return ResponseEntity.ok(result);
    }
}

