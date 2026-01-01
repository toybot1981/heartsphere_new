package com.heartsphere.quickconnect.controller;

import com.heartsphere.dto.ApiResponse;
import com.heartsphere.quickconnect.dto.FavoriteDTO;
import com.heartsphere.quickconnect.service.FavoriteService;
import com.heartsphere.security.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.logging.Logger;

/**
 * 收藏管理控制器
 */
@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/favorites")
public class FavoriteController {
    
    private static final Logger logger = Logger.getLogger(FavoriteController.class.getName());
    
    @Autowired
    private FavoriteService favoriteService;
    
    /**
     * 添加收藏
     */
    @PostMapping
    public ResponseEntity<ApiResponse<FavoriteDTO>> addFavorite(
            @RequestBody AddFavoriteRequest request) {
        logger.info("========== [FavoriteController] 添加收藏 ==========");
        
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        Long userId = userDetails.getId();
        
        logger.info(String.format("[FavoriteController] userId: %d, characterId: %d", userId, request.getCharacterId()));
        
        FavoriteDTO favorite = favoriteService.addFavorite(userId, request.getCharacterId(), request.getSortOrder());
        
        return ResponseEntity.ok(ApiResponse.success("收藏成功", favorite));
    }
    
    /**
     * 删除收藏
     */
    @DeleteMapping("/{characterId}")
    public ResponseEntity<ApiResponse<Void>> removeFavorite(@PathVariable Long characterId) {
        logger.info(String.format("========== [FavoriteController] 删除收藏 ========== characterId: %d", characterId));
        
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        Long userId = userDetails.getId();
        
        favoriteService.removeFavorite(userId, characterId);
        
        return ResponseEntity.ok(ApiResponse.success("取消收藏成功", null));
    }
    
    /**
     * 切换收藏状态（收藏/取消收藏）
     */
    @PostMapping("/toggle")
    public ResponseEntity<ApiResponse<FavoriteDTO>> toggleFavorite(
            @RequestBody ToggleFavoriteRequest request) {
        logger.info("========== [FavoriteController] 切换收藏状态 ==========");
        
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        Long userId = userDetails.getId();
        
        FavoriteDTO favorite = favoriteService.toggleFavorite(userId, request.getCharacterId(), request.getSortOrder());
        
        if (favorite != null) {
            return ResponseEntity.ok(ApiResponse.success("收藏成功", favorite));
        } else {
            return ResponseEntity.ok(ApiResponse.success("取消收藏成功", null));
        }
    }
    
    /**
     * 获取收藏列表
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<FavoriteDTO>>> getFavorites(
            @RequestParam(required = false, defaultValue = "created") String sortBy) {
        logger.info(String.format("========== [FavoriteController] 获取收藏列表 ========== sortBy: %s", sortBy));
        
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        Long userId = userDetails.getId();
        
        List<FavoriteDTO> favorites = favoriteService.getFavorites(userId, sortBy);
        
        return ResponseEntity.ok(ApiResponse.success(favorites));
    }
    
    /**
     * 检查是否已收藏
     */
    @GetMapping("/check/{characterId}")
    public ResponseEntity<ApiResponse<Boolean>> checkFavorite(@PathVariable Long characterId) {
        logger.info(String.format("========== [FavoriteController] 检查收藏状态 ========== characterId: %d", characterId));
        
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        Long userId = userDetails.getId();
        
        boolean isFavorite = favoriteService.isFavorite(userId, characterId);
        
        return ResponseEntity.ok(ApiResponse.success(isFavorite));
    }
    
    /**
     * 获取收藏数量
     */
    @GetMapping("/count")
    public ResponseEntity<ApiResponse<Long>> getFavoriteCount() {
        logger.info("========== [FavoriteController] 获取收藏数量 ==========");
        
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        Long userId = userDetails.getId();
        
        long count = favoriteService.getFavoriteCount(userId);
        
        return ResponseEntity.ok(ApiResponse.success(count));
    }
    
    /**
     * 调整收藏顺序
     */
    @PutMapping("/reorder")
    public ResponseEntity<ApiResponse<Void>> reorderFavorites(
            @RequestBody List<FavoriteService.FavoriteReorderItem> reorderItems) {
        logger.info("========== [FavoriteController] 调整收藏顺序 ==========");
        
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        Long userId = userDetails.getId();
        
        favoriteService.reorderFavorites(userId, reorderItems);
        
        return ResponseEntity.ok(ApiResponse.success("排序更新成功", null));
    }
    
    /**
     * 添加收藏请求
     */
    public static class AddFavoriteRequest {
        private Long characterId;
        private Integer sortOrder;
        
        public Long getCharacterId() {
            return characterId;
        }
        
        public void setCharacterId(Long characterId) {
            this.characterId = characterId;
        }
        
        public Integer getSortOrder() {
            return sortOrder;
        }
        
        public void setSortOrder(Integer sortOrder) {
            this.sortOrder = sortOrder;
        }
    }
    
    /**
     * 切换收藏请求
     */
    public static class ToggleFavoriteRequest {
        private Long characterId;
        private Integer sortOrder;
        
        public Long getCharacterId() {
            return characterId;
        }
        
        public void setCharacterId(Long characterId) {
            this.characterId = characterId;
        }
        
        public Integer getSortOrder() {
            return sortOrder;
        }
        
        public void setSortOrder(Integer sortOrder) {
            this.sortOrder = sortOrder;
        }
    }
}




