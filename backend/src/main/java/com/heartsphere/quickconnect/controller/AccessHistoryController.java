package com.heartsphere.quickconnect.controller;

import com.heartsphere.dto.ApiResponse;
import com.heartsphere.quickconnect.dto.AccessHistoryDTO;
import com.heartsphere.quickconnect.service.AccessHistoryService;
import com.heartsphere.security.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.logging.Logger;

/**
 * 访问历史控制器
 */
@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/access-history")
public class AccessHistoryController {
    
    private static final Logger logger = Logger.getLogger(AccessHistoryController.class.getName());
    
    @Autowired
    private AccessHistoryService accessHistoryService;
    
    /**
     * 记录访问历史
     */
    @PostMapping
    public ResponseEntity<ApiResponse<AccessHistoryDTO>> recordAccess(
            @RequestBody RecordAccessRequest request) {
        logger.info("========== [AccessHistoryController] 记录访问历史 ==========");
        
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        Long userId = userDetails.getId();
        
        logger.info(String.format("[AccessHistoryController] userId: %d, characterId: %d, duration: %d, rounds: %d", 
                userId, request.getCharacterId(), request.getAccessDuration(), request.getConversationRounds()));
        
        AccessHistoryDTO history = accessHistoryService.recordAccess(
                userId,
                request.getCharacterId(),
                request.getAccessDuration(),
                request.getConversationRounds(),
                request.getSessionId()
        );
        
        return ResponseEntity.ok(ApiResponse.success("访问历史记录成功", history));
    }
    
    /**
     * 获取访问历史
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<AccessHistoryDTO>>> getAccessHistory(
            @RequestParam(required = false) Long characterId,
            @RequestParam(required = false) Integer limit) {
        logger.info(String.format("========== [AccessHistoryController] 获取访问历史 ========== characterId: %s, limit: %s", 
                characterId, limit));
        
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        Long userId = userDetails.getId();
        
        List<AccessHistoryDTO> history = accessHistoryService.getAccessHistory(userId, characterId, limit);
        
        return ResponseEntity.ok(ApiResponse.success(history));
    }
    
    /**
     * 分页获取访问历史
     */
    @GetMapping("/page")
    public ResponseEntity<ApiResponse<Page<AccessHistoryDTO>>> getAccessHistoryPage(
            @RequestParam(required = false) Long characterId,
            @RequestParam(required = false, defaultValue = "0") Integer page,
            @RequestParam(required = false, defaultValue = "20") Integer size) {
        logger.info(String.format("========== [AccessHistoryController] 分页获取访问历史 ========== characterId: %s, page: %d, size: %d", 
                characterId, page, size));
        
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        Long userId = userDetails.getId();
        
        Page<AccessHistoryDTO> historyPage = accessHistoryService.getAccessHistoryPage(userId, characterId, page, size);
        
        return ResponseEntity.ok(ApiResponse.success(historyPage));
    }
    
    /**
     * 获取访问统计信息
     */
    @GetMapping("/statistics/{characterId}")
    public ResponseEntity<ApiResponse<AccessHistoryService.AccessStatistics>> getAccessStatistics(
            @PathVariable Long characterId) {
        logger.info(String.format("========== [AccessHistoryController] 获取访问统计 ========== characterId: %d", characterId));
        
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        Long userId = userDetails.getId();
        
        AccessHistoryService.AccessStatistics stats = accessHistoryService.getAccessStatistics(userId, characterId);
        
        return ResponseEntity.ok(ApiResponse.success(stats));
    }
    
    /**
     * 获取最近访问的角色ID列表
     */
    @GetMapping("/recent")
    public ResponseEntity<ApiResponse<List<Long>>> getRecentCharacterIds(
            @RequestParam(required = false, defaultValue = "10") Integer limit) {
        logger.info(String.format("========== [AccessHistoryController] 获取最近访问的角色 ========== limit: %d", limit));
        
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        Long userId = userDetails.getId();
        
        List<Long> characterIds = accessHistoryService.getRecentCharacterIds(userId, limit);
        
        return ResponseEntity.ok(ApiResponse.success(characterIds));
    }
    
    /**
     * 记录访问请求
     */
    public static class RecordAccessRequest {
        private Long characterId;
        private Integer accessDuration;  // 访问时长（秒）
        private Integer conversationRounds;  // 对话轮数
        private String sessionId;  // 会话ID
        
        public Long getCharacterId() {
            return characterId;
        }
        
        public void setCharacterId(Long characterId) {
            this.characterId = characterId;
        }
        
        public Integer getAccessDuration() {
            return accessDuration;
        }
        
        public void setAccessDuration(Integer accessDuration) {
            this.accessDuration = accessDuration;
        }
        
        public Integer getConversationRounds() {
            return conversationRounds;
        }
        
        public void setConversationRounds(Integer conversationRounds) {
            this.conversationRounds = conversationRounds;
        }
        
        public String getSessionId() {
            return sessionId;
        }
        
        public void setSessionId(String sessionId) {
            this.sessionId = sessionId;
        }
    }
}

