package com.heartsphere.quickconnect.service;

import com.heartsphere.entity.Character;
import com.heartsphere.quickconnect.dto.GetQuickConnectCharactersResponse;
import com.heartsphere.quickconnect.dto.QuickConnectCharacterDTO;
import com.heartsphere.quickconnect.dto.SearchCharactersResponse;
import com.heartsphere.quickconnect.repository.AccessHistoryRepository;
import com.heartsphere.quickconnect.repository.UserFavoriteRepository;
import com.heartsphere.quickconnect.util.QuickConnectDTOMapper;
import com.heartsphere.repository.CharacterRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.logging.Logger;
import java.util.stream.Collectors;

/**
 * 快速连接服务
 * 提供快速连接E-SOUL的核心业务逻辑
 */
@Service
public class QuickConnectService {
    
    private static final Logger logger = Logger.getLogger(QuickConnectService.class.getName());
    
    @Autowired
    private CharacterRepository characterRepository;
    
    @Autowired
    private UserFavoriteRepository userFavoriteRepository;
    
    @Autowired
    private AccessHistoryRepository accessHistoryRepository;
    
    @Autowired
    private RecommendationService recommendationService;
    
    /**
     * 获取快速连接列表
     */
    @Transactional(readOnly = true)
    public GetQuickConnectCharactersResponse getQuickConnectCharacters(
            Long userId,
            String filter,
            Long sceneId,
            String sortBy,
            Integer limit,
            Integer offset,
            String search) {
        
        logger.info(String.format("[QuickConnectService] 获取快速连接列表 - userId: %d, filter: %s, sortBy: %s, search: %s", 
                userId, filter, sortBy, search));
        
        // 1. 获取用户的所有角色
        List<Character> characters = characterRepository.findByUser_Id(userId);
        
        // 2. 转换为DTO
        List<QuickConnectCharacterDTO> characterDTOs = characters.stream()
                .map(QuickConnectDTOMapper::toQuickConnectCharacterDTO)
                .collect(Collectors.toList());
        
        // 3. 填充收藏状态、访问历史、推荐分数（批量优化）
        fillCharacterDetails(characterDTOs, userId);
        
        // 4. 应用搜索过滤
        if (search != null && !search.trim().isEmpty()) {
            characterDTOs = filterBySearch(characterDTOs, search.trim());
        }
        
        // 5. 应用筛选
        if (filter != null) {
            characterDTOs = filterByType(characterDTOs, filter, userId);
        }
        
        // 6. 应用场景筛选
        if (sceneId != null) {
            characterDTOs = characterDTOs.stream()
                    .filter(dto -> dto.getSceneId() != null && dto.getSceneId().equals(sceneId))
                    .collect(Collectors.toList());
        }
        
        // 7. 排序
        characterDTOs = sortCharacters(characterDTOs, sortBy);
        
        // 8. 统计信息
        int totalCount = characterDTOs.size();
        int favoriteCount = (int) characterDTOs.stream()
                .filter(QuickConnectCharacterDTO::getIsFavorite)
                .count();
        int recentCount = (int) characterDTOs.stream()
                .filter(dto -> dto.getLastAccessTime() != null)
                .count();
        
        // 9. 分页
        int start = offset != null ? offset : 0;
        int end = limit != null ? Math.min(start + limit, totalCount) : totalCount;
        List<QuickConnectCharacterDTO> pagedCharacters = characterDTOs.subList(start, end);
        
        // 10. 构建响应
        GetQuickConnectCharactersResponse response = new GetQuickConnectCharactersResponse();
        response.setCharacters(pagedCharacters);
        response.setTotalCount(totalCount);
        response.setFavoriteCount(favoriteCount);
        response.setRecentCount(recentCount);
        
        GetQuickConnectCharactersResponse.PaginationInfo pagination = new GetQuickConnectCharactersResponse.PaginationInfo();
        pagination.setLimit(limit != null ? limit : 50);
        pagination.setOffset(start);
        pagination.setHasMore(end < totalCount);
        response.setPagination(pagination);
        
        logger.info(String.format("[QuickConnectService] 返回 %d 个角色（共 %d 个）", pagedCharacters.size(), totalCount));
        
        return response;
    }
    
    /**
     * 搜索E-SOUL
     */
    @Transactional(readOnly = true)
    public SearchCharactersResponse searchCharacters(Long userId, String query, String filter, Integer limit) {
        logger.info(String.format("[QuickConnectService] 搜索E-SOUL - userId: %d, query: %s, filter: %s", userId, query, filter));
        
        if (query == null || query.trim().isEmpty()) {
            return new SearchCharactersResponse(new ArrayList<>(), 0, query, new HashMap<>());
        }
        
        // 获取快速连接列表（应用搜索）
        GetQuickConnectCharactersResponse response = getQuickConnectCharacters(
                userId, filter, null, "frequency", limit, 0, query);
        
        // 构建搜索响应
        SearchCharactersResponse searchResponse = new SearchCharactersResponse();
        searchResponse.setCharacters(response.getCharacters());
        searchResponse.setTotalCount(response.getTotalCount());
        searchResponse.setSearchQuery(query);
        searchResponse.setHighlightedFields(new HashMap<>());  // 高亮字段后续实现
        
        logger.info(String.format("[QuickConnectService] 搜索到 %d 个结果", searchResponse.getTotalCount()));
        
        return searchResponse;
    }
    
    /**
     * 填充角色详细信息（收藏状态、访问历史、推荐分数）
     * 优化：批量查询和批量计算推荐分数
     */
    private void fillCharacterDetails(List<QuickConnectCharacterDTO> characterDTOs, Long userId) {
        if (characterDTOs == null || characterDTOs.isEmpty()) {
            return;
        }
        
        // 获取所有角色ID
        List<Long> characterIds = characterDTOs.stream()
                .map(QuickConnectCharacterDTO::getCharacterId)
                .collect(Collectors.toList());
        
        // 批量查询收藏状态
        Set<Long> favoriteCharacterIds = userFavoriteRepository.findByUserIdAndCharacterIdIn(userId, characterIds)
                .stream()
                .map(uf -> uf.getCharacter().getId())
                .collect(Collectors.toSet());
        
        // 批量填充访问历史（减少数据库查询）
        Map<Long, AccessHistoryData> accessHistoryMap = batchLoadAccessHistory(userId, characterIds);
        
        // 填充每个角色的详细信息
        for (QuickConnectCharacterDTO dto : characterDTOs) {
            Long characterId = dto.getCharacterId();
            
            // 填充收藏状态
            dto.setIsFavorite(favoriteCharacterIds.contains(characterId));
            
            // 填充访问历史（从批量加载的数据）
            AccessHistoryData historyData = accessHistoryMap.get(characterId);
            if (historyData != null) {
                dto.setAccessCount(historyData.accessCount);
                if (historyData.lastAccessTime != null) {
                    dto.setLastAccessTime(historyData.lastAccessTime);
                }
                dto.setTotalConversationTime(historyData.totalDuration);
            }
        }
        
        // 批量计算推荐分数（优化性能）
        recommendationService.fillRecommendationFields(characterDTOs, userId);
    }
    
    /**
     * 批量加载访问历史数据
     */
    private Map<Long, AccessHistoryData> batchLoadAccessHistory(Long userId, List<Long> characterIds) {
        Map<Long, AccessHistoryData> result = new HashMap<>();
        
        for (Long characterId : characterIds) {
            AccessHistoryData data = new AccessHistoryData();
            data.accessCount = (int) accessHistoryRepository.countByUserIdAndCharacterId(userId, characterId);
            LocalDateTime lastAccessTime = accessHistoryRepository.findLastAccessTimeByUserIdAndCharacterId(userId, characterId);
            if (lastAccessTime != null) {
                data.lastAccessTime = QuickConnectDTOMapper.localDateTimeToTimestamp(lastAccessTime);
            }
            Long totalDuration = accessHistoryRepository.sumAccessDurationByUserIdAndCharacterId(userId, characterId);
            data.totalDuration = totalDuration != null ? totalDuration : 0L;
            result.put(characterId, data);
        }
        
        return result;
    }
    
    /**
     * 访问历史数据内部类
     */
    private static class AccessHistoryData {
        int accessCount = 0;
        Long lastAccessTime = null;
        Long totalDuration = 0L;
    }
    
    
    /**
     * 按搜索关键词过滤
     */
    private List<QuickConnectCharacterDTO> filterBySearch(List<QuickConnectCharacterDTO> characters, String search) {
        String lowerSearch = search.toLowerCase();
        return characters.stream()
                .filter(dto -> {
                    // 搜索角色名称
                    if (dto.getCharacterName() != null && dto.getCharacterName().toLowerCase().contains(lowerSearch)) {
                        return true;
                    }
                    // 搜索场景名称
                    if (dto.getSceneName() != null && dto.getSceneName().toLowerCase().contains(lowerSearch)) {
                        return true;
                    }
                    // 搜索标签
                    if (dto.getTags() != null && dto.getTags().toLowerCase().contains(lowerSearch)) {
                        return true;
                    }
                    // 搜索简介
                    if (dto.getBio() != null && dto.getBio().toLowerCase().contains(lowerSearch)) {
                        return true;
                    }
                    return false;
                })
                .collect(Collectors.toList());
    }
    
    /**
     * 按类型过滤
     */
    private List<QuickConnectCharacterDTO> filterByType(List<QuickConnectCharacterDTO> characters, String filter, Long userId) {
        switch (filter.toLowerCase()) {
            case "favorite":
                return characters.stream()
                        .filter(QuickConnectCharacterDTO::getIsFavorite)
                        .collect(Collectors.toList());
            
            case "recent":
                return characters.stream()
                        .filter(dto -> dto.getLastAccessTime() != null)
                        .sorted(Comparator.comparing(QuickConnectCharacterDTO::getLastAccessTime).reversed())
                        .collect(Collectors.toList());
            
            case "scene":
                // 场景筛选需要额外的sceneId参数，这里不做处理
                return characters;
            
            case "all":
            default:
                return characters;
        }
    }
    
    /**
     * 排序
     */
    private List<QuickConnectCharacterDTO> sortCharacters(List<QuickConnectCharacterDTO> characters, String sortBy) {
        if (sortBy == null || sortBy.isEmpty()) {
            sortBy = "frequency";
        }
        
        Comparator<QuickConnectCharacterDTO> comparator;
        
        switch (sortBy.toLowerCase()) {
            case "frequency":
                // 按访问频率排序（访问次数）
                comparator = Comparator.comparing((QuickConnectCharacterDTO dto) -> 
                        dto.getAccessCount() != null ? dto.getAccessCount() : 0).reversed();
                break;
            
            case "recent":
                // 按最近访问时间排序
                comparator = Comparator.comparing((QuickConnectCharacterDTO dto) -> 
                        dto.getLastAccessTime() != null ? dto.getLastAccessTime() : 0L).reversed();
                break;
            
            case "name":
                // 按名称排序
                comparator = Comparator.comparing((QuickConnectCharacterDTO dto) -> 
                        dto.getCharacterName() != null ? dto.getCharacterName() : "");
                break;
            
            case "favorite":
                // 收藏优先，然后按推荐分数
                comparator = Comparator.comparing(QuickConnectCharacterDTO::getIsFavorite).reversed()
                        .thenComparing((QuickConnectCharacterDTO dto) -> 
                                dto.getRecommendationScore() != null ? dto.getRecommendationScore() : 0.0).reversed();
                break;
            
            default:
                // 默认按推荐分数排序
                comparator = Comparator.comparing((QuickConnectCharacterDTO dto) -> 
                        dto.getRecommendationScore() != null ? dto.getRecommendationScore() : 0.0).reversed();
        }
        
        return characters.stream()
                .sorted(comparator)
                .collect(Collectors.toList());
    }
}

