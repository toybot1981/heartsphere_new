package com.heartsphere.quickconnect.controller;

import com.heartsphere.dto.ApiResponse;
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
        
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        Long userId = userDetails.getId();
        
        GetQuickConnectCharactersResponse response = quickConnectService.getQuickConnectCharacters(
                userId, filter, sceneId, sortBy, limit, offset, search);
        
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
        
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        Long userId = userDetails.getId();
        
        SearchCharactersResponse response = quickConnectService.searchCharacters(userId, query, filter, limit);
        
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}

