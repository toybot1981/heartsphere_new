package com.heartsphere.quickconnect.service;

import com.heartsphere.entity.Character;
import com.heartsphere.entity.User;
import com.heartsphere.exception.BusinessException;
import com.heartsphere.exception.ResourceNotFoundException;
import com.heartsphere.quickconnect.dto.FavoriteDTO;
import com.heartsphere.quickconnect.entity.UserFavorite;
import com.heartsphere.quickconnect.repository.UserFavoriteRepository;
import com.heartsphere.quickconnect.util.QuickConnectDTOMapper;
import com.heartsphere.repository.CharacterRepository;
import com.heartsphere.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.logging.Logger;
import java.util.stream.Collectors;

/**
 * 收藏服务
 * 提供用户收藏E-SOUL的业务逻辑
 */
@Service
public class FavoriteService {
    
    private static final Logger logger = Logger.getLogger(FavoriteService.class.getName());
    
    @Autowired
    private UserFavoriteRepository userFavoriteRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private CharacterRepository characterRepository;
    
    /**
     * 添加收藏
     */
    @Transactional
    public FavoriteDTO addFavorite(Long userId, Long characterId, Integer sortOrder) {
        logger.info(String.format("[FavoriteService] 添加收藏 - userId: %d, characterId: %d", userId, characterId));
        
        // 验证用户存在
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("用户", userId));
        
        // 验证角色存在
        Character character = characterRepository.findById(characterId)
                .orElseThrow(() -> new ResourceNotFoundException("角色", characterId));
        
        // 验证角色属于当前用户
        if (!character.getUser().getId().equals(userId)) {
            throw new BusinessException(403, "无权收藏该角色");
        }
        
        // 检查是否已收藏
        Optional<UserFavorite> existingFavorite = userFavoriteRepository.findByUserIdAndCharacterId(userId, characterId);
        if (existingFavorite.isPresent()) {
            throw new BusinessException(409, "该角色已收藏");
        }
        
        // 创建收藏记录
        UserFavorite userFavorite = new UserFavorite();
        userFavorite.setUser(user);
        userFavorite.setCharacter(character);
        userFavorite.setSortOrder(sortOrder != null ? sortOrder : 0);
        
        UserFavorite saved = userFavoriteRepository.save(userFavorite);
        logger.info(String.format("[FavoriteService] 收藏成功 - id: %d", saved.getId()));
        
        return QuickConnectDTOMapper.toFavoriteDTO(saved);
    }
    
    /**
     * 删除收藏
     */
    @Transactional
    public void removeFavorite(Long userId, Long characterId) {
        logger.info(String.format("[FavoriteService] 删除收藏 - userId: %d, characterId: %d", userId, characterId));
        
        Optional<UserFavorite> favorite = userFavoriteRepository.findByUserIdAndCharacterId(userId, characterId);
        if (favorite.isEmpty()) {
            throw new ResourceNotFoundException("收藏记录", characterId);
        }
        
        userFavoriteRepository.delete(favorite.get());
        logger.info(String.format("[FavoriteService] 删除收藏成功 - characterId: %d", characterId));
    }
    
    /**
     * 切换收藏状态（收藏/取消收藏）
     */
    @Transactional
    public FavoriteDTO toggleFavorite(Long userId, Long characterId, Integer sortOrder) {
        logger.info(String.format("[FavoriteService] 切换收藏状态 - userId: %d, characterId: %d", userId, characterId));
        
        Optional<UserFavorite> existingFavorite = userFavoriteRepository.findByUserIdAndCharacterId(userId, characterId);
        
        if (existingFavorite.isPresent()) {
            // 已收藏，取消收藏
            removeFavorite(userId, characterId);
            return null;
        } else {
            // 未收藏，添加收藏
            return addFavorite(userId, characterId, sortOrder);
        }
    }
    
    /**
     * 获取用户的收藏列表
     */
    public List<FavoriteDTO> getFavorites(Long userId, String sortBy) {
        logger.info(String.format("[FavoriteService] 获取收藏列表 - userId: %d, sortBy: %s", userId, sortBy));
        
        List<UserFavorite> favorites = userFavoriteRepository.findByUserIdOrderBySortOrderAscCreatedAtDesc(userId);
        
        // 如果按访问时间排序，需要额外查询访问历史（后续实现）
        // 目前只支持按创建时间和排序顺序
        
        List<FavoriteDTO> result = favorites.stream()
                .map(QuickConnectDTOMapper::toFavoriteDTO)
                .collect(Collectors.toList());
        
        logger.info(String.format("[FavoriteService] 获取到 %d 个收藏", result.size()));
        return result;
    }
    
    /**
     * 检查用户是否已收藏某个角色
     */
    public boolean isFavorite(Long userId, Long characterId) {
        return userFavoriteRepository.existsByUserIdAndCharacterId(userId, characterId);
    }
    
    /**
     * 获取用户的收藏数量
     */
    public long getFavoriteCount(Long userId) {
        return userFavoriteRepository.countByUserId(userId);
    }
    
    /**
     * 调整收藏顺序
     */
    @Transactional
    public void reorderFavorites(Long userId, List<FavoriteReorderItem> reorderItems) {
        logger.info(String.format("[FavoriteService] 调整收藏顺序 - userId: %d, items: %d", userId, reorderItems.size()));
        
        for (FavoriteReorderItem item : reorderItems) {
            Optional<UserFavorite> favorite = userFavoriteRepository.findByUserIdAndCharacterId(userId, item.getCharacterId());
            if (favorite.isPresent()) {
                favorite.get().setSortOrder(item.getSortOrder());
                userFavoriteRepository.save(favorite.get());
            }
        }
        
        logger.info("[FavoriteService] 调整收藏顺序成功");
    }
    
    /**
     * 收藏排序项
     */
    public static class FavoriteReorderItem {
        private Long characterId;
        private Integer sortOrder;
        
        public FavoriteReorderItem() {}
        
        public FavoriteReorderItem(Long characterId, Integer sortOrder) {
            this.characterId = characterId;
            this.sortOrder = sortOrder;
        }
        
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




