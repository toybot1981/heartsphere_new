package com.heartsphere.quickconnect.controller;

import com.heartsphere.dto.ApiResponse;
import com.heartsphere.heartconnect.context.SharedModeContext;
import com.heartsphere.quickconnect.dto.GetQuickConnectCharactersResponse;
import com.heartsphere.quickconnect.dto.SearchCharactersResponse;
import com.heartsphere.quickconnect.service.QuickConnectService;
import com.heartsphere.security.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.logging.Logger;

/**
 * 快速连接控制器
 */
@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/quick-connect")
public class QuickConnectController {
    
    private static final Logger logger = Logger.getLogger(QuickConnectController.class.getName());
    
    @Autowired
    private QuickConnectService quickConnectService;
    
    /**
     * 获取快速连接列表
     */
    @GetMapping("/characters")
    public ResponseEntity<ApiResponse<GetQuickConnectCharactersResponse>> getCharacters(
            @RequestParam(required = false, defaultValue = "all") String filter,
            @RequestParam(required = false) Long sceneId,
            @RequestParam(required = false, defaultValue = "frequency") String sortBy,
            @RequestParam(required = false, defaultValue = "50") Integer limit,
            @RequestParam(required = false, defaultValue = "0") Integer offset,
            @RequestParam(required = false) String search) {
        
        logger.info(String.format("========== [QuickConnectController] 获取快速连接列表 ========== filter: %s, sortBy: %s, search: %s", 
                filter, sortBy, search));
        
        // 检查是否处于共享模式
        logger.info("========== [QuickConnectController] 检查共享模式上下文 ==========");
        boolean isActive = SharedModeContext.isActive();
        Long shareConfigId = SharedModeContext.getShareConfigId();
        Long ownerId = SharedModeContext.getOwnerId();
        Long visitorId = SharedModeContext.getVisitorId();
        
        logger.info(String.format("[QuickConnectController] SharedModeContext.isActive(): %s", isActive));
        logger.info(String.format("[QuickConnectController] shareConfigId: %s", shareConfigId));
        logger.info(String.format("[QuickConnectController] ownerId: %s", ownerId));
        logger.info(String.format("[QuickConnectController] visitorId: %s", visitorId));
        
        if (isActive && ownerId != null) {
            logger.info(String.format("[QuickConnectController] ✅ 共享模式激活 - ownerId: %d, visitorId: %d, 使用ownerId查询角色列表", 
                    ownerId, visitorId));
        } else {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            ownerId = userDetails.getId();
            visitorId = ownerId; // 正常模式下，访问者就是自己
            logger.info(String.format("[QuickConnectController] 正常模式或共享模式未激活 - ownerId: %d, visitorId: %d", ownerId, visitorId));
        }
        
        logger.info(String.format("[QuickConnectController] 调用 getQuickConnectCharacters - ownerId: %d, visitorId: %d", ownerId, visitorId));
        
        GetQuickConnectCharactersResponse response = quickConnectService.getQuickConnectCharacters(
                ownerId, visitorId, filter, sceneId, sortBy, limit, offset, search);
        
        return ResponseEntity.ok(ApiResponse.success(response));
    }
    
    /**
     * 搜索E-SOUL
     */
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<SearchCharactersResponse>> searchCharacters(
            @RequestParam(required = true) String query,
            @RequestParam(required = false, defaultValue = "all") String filter,
            @RequestParam(required = false, defaultValue = "20") Integer limit) {
        
        logger.info(String.format("========== [QuickConnectController] 搜索E-SOUL ========== query: %s, filter: %s", query, filter));
        
        // 检查是否处于共享模式
        logger.info("========== [QuickConnectController] 检查共享模式上下文（搜索） ==========");
        boolean isActive = SharedModeContext.isActive();
        Long shareConfigId = SharedModeContext.getShareConfigId();
        Long ownerId = SharedModeContext.getOwnerId();
        Long visitorId = SharedModeContext.getVisitorId();
        
        logger.info(String.format("[QuickConnectController] SharedModeContext.isActive(): %s", isActive));
        logger.info(String.format("[QuickConnectController] shareConfigId: %s", shareConfigId));
        logger.info(String.format("[QuickConnectController] ownerId: %s", ownerId));
        logger.info(String.format("[QuickConnectController] visitorId: %s", visitorId));
        
        if (isActive && ownerId != null) {
            logger.info(String.format("[QuickConnectController] ✅ 共享模式激活 - ownerId: %d, visitorId: %d, 使用ownerId搜索角色", 
                    ownerId, visitorId));
        } else {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            ownerId = userDetails.getId();
            visitorId = ownerId; // 正常模式下，访问者就是自己
            logger.info(String.format("[QuickConnectController] 正常模式或共享模式未激活 - ownerId: %d, visitorId: %d", ownerId, visitorId));
        }
        
        logger.info(String.format("[QuickConnectController] 调用 searchCharacters - ownerId: %d, visitorId: %d, query: %s", 
                ownerId, visitorId, query));
        SearchCharactersResponse response = quickConnectService.searchCharacters(ownerId, visitorId, query, filter, limit);
        
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}


