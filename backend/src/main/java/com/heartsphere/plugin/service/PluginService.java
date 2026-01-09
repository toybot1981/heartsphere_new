package com.heartsphere.plugin.service;

import com.heartsphere.plugin.dto.*;
import com.heartsphere.plugin.entity.Plugin;
import com.heartsphere.plugin.repository.PluginRepository;
import com.heartsphere.plugin.repository.UserPluginRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 插件服务
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Slf4j
@Service
public class PluginService {
    
    @Autowired
    private PluginRepository pluginRepository;
    
    @Autowired
    private UserPluginRepository userPluginRepository;
    
    @Autowired
    private ObjectMapper objectMapper;
    
    /**
     * 获取插件列表
     */
    public PluginListResponse getPluginList(PluginListRequest request) {
        return getPluginList(request, null);
    }
    
    /**
     * 获取插件列表（支持publishStatus过滤）
     */
    public PluginListResponse getPluginList(PluginListRequest request, String publishStatus) {
        Pageable pageable = createPageable(request);
        Page<Plugin> page;
        
        // 构建查询条件
        String keyword = request.getKeyword();
        String category = request.getCategory();
        String status = request.getStatus();
        
        // 如果status是"ALL"，则传null
        if ("ALL".equals(status)) {
            status = null;
        }
        
        // 如果publishStatus是"ALL"，则传null
        if (publishStatus != null && "ALL".equals(publishStatus)) {
            publishStatus = null;
        }
        
        // 执行查询
        page = pluginRepository.searchPlugins(keyword, category, status, publishStatus, pageable);
        
        // 转换为DTO
        List<PluginDTO> pluginDTOs = page.getContent().stream()
            .map(this::toDTO)
            .collect(Collectors.toList());
        
        // 填充用户数
        for (PluginDTO dto : pluginDTOs) {
            Long userCount = userPluginRepository.countByPluginId(dto.getPluginId());
            dto.setUserCount(userCount);
        }
        
        return PluginListResponse.builder()
            .plugins(pluginDTOs)
            .total(page.getTotalElements())
            .page(request.getPage())
            .size(request.getSize())
            .build();
    }
    
    /**
     * 根据ID获取插件详情
     */
    public PluginDTO getPluginById(String pluginId) {
        Plugin plugin = pluginRepository.findByPluginId(pluginId)
            .orElseThrow(() -> new RuntimeException("插件不存在: " + pluginId));
        
        PluginDTO dto = toDTO(plugin);
        Long userCount = userPluginRepository.countByPluginId(pluginId);
        dto.setUserCount(userCount);
        
        return dto;
    }
    
    /**
     * 启用插件
     */
    @Transactional
    public void enablePlugin(String pluginId) {
        Plugin plugin = pluginRepository.findByPluginId(pluginId)
            .orElseThrow(() -> new RuntimeException("插件不存在: " + pluginId));
        
        plugin.setStatus("ACTIVE");
        pluginRepository.save(plugin);
        
        log.info("插件已启用: {}", pluginId);
    }
    
    /**
     * 禁用插件
     */
    @Transactional
    public void disablePlugin(String pluginId, boolean force) {
        Plugin plugin = pluginRepository.findByPluginId(pluginId)
            .orElseThrow(() -> new RuntimeException("插件不存在: " + pluginId));
        
        // 检查是否有用户在使用
        long userCount = userPluginRepository.countByPluginId(pluginId);
        if (userCount > 0 && !force) {
            throw new RuntimeException("插件正在被 " + userCount + " 个用户使用，无法禁用");
        }
        
        plugin.setStatus("INACTIVE");
        pluginRepository.save(plugin);
        
        log.info("插件已禁用: {}, 强制: {}", pluginId, force);
    }
    
    /**
     * 更新插件配置
     */
    @Transactional
    public void updatePluginConfig(String pluginId, PluginConfigRequest request) {
        Plugin plugin = pluginRepository.findByPluginId(pluginId)
            .orElseThrow(() -> new RuntimeException("插件不存在: " + pluginId));
        
        try {
            String configJson = objectMapper.writeValueAsString(request.getConfig());
            plugin.setDefaultConfig(configJson);
            pluginRepository.save(plugin);
            
            log.info("插件配置已更新: {}", pluginId);
        } catch (Exception e) {
            throw new RuntimeException("更新插件配置失败", e);
        }
    }
    
    /**
     * 发布插件
     */
    @Transactional
    public void publishPlugin(String pluginId, String publishNote) {
        Plugin plugin = pluginRepository.findByPluginId(pluginId)
            .orElseThrow(() -> new RuntimeException("插件不存在: " + pluginId));
        
        // 检查插件状态
        if (!"ACTIVE".equals(plugin.getStatus())) {
            throw new RuntimeException("只有已启用的插件才能发布");
        }
        
        plugin.setPublishStatus("PUBLISHED");
        plugin.setPublishNote(publishNote);
        plugin.setPublishedAt(LocalDateTime.now());
        pluginRepository.save(plugin);
        
        log.info("插件已发布: {}", pluginId);
    }
    
    /**
     * 取消发布插件
     */
    @Transactional
    public void unpublishPlugin(String pluginId) {
        Plugin plugin = pluginRepository.findByPluginId(pluginId)
            .orElseThrow(() -> new RuntimeException("插件不存在: " + pluginId));
        
        plugin.setPublishStatus("DRAFT");
        plugin.setPublishedAt(null);
        pluginRepository.save(plugin);
        
        log.info("插件已取消发布: {}", pluginId);
    }
    
    /**
     * 获取插件预览信息
     */
    public PluginPreviewDTO getPluginPreview(String pluginId) {
        Plugin plugin = pluginRepository.findByPluginId(pluginId)
            .orElseThrow(() -> new RuntimeException("插件不存在: " + pluginId));
        
        PluginDTO pluginDTO = toDTO(plugin);
        
        return PluginPreviewDTO.builder()
            .plugin(pluginDTO)
            .previewUrl(plugin.getPreviewUrl())
            .canPublish("ACTIVE".equals(plugin.getStatus()) && !"PUBLISHED".equals(plugin.getPublishStatus()))
            .build();
    }
    
    /**
     * 创建Pageable
     */
    private Pageable createPageable(PluginListRequest request) {
        Sort sort = Sort.by(Sort.Direction.ASC, "name");
        
        if (request.getSort() != null) {
            switch (request.getSort()) {
                case "usage_count":
                    sort = Sort.by(Sort.Direction.DESC, "usageCount");
                    break;
                case "rating":
                    sort = Sort.by(Sort.Direction.DESC, "rating");
                    break;
                case "created_at":
                    sort = Sort.by(Sort.Direction.DESC, "createdAt");
                    break;
                default:
                    sort = Sort.by(Sort.Direction.ASC, "name");
            }
        }
        
        return PageRequest.of(request.getPage(), request.getSize(), sort);
    }
    
    /**
     * 转换为DTO
     */
    private PluginDTO toDTO(Plugin plugin) {
        PluginDTO.PluginDTOBuilder builder = PluginDTO.builder()
            .id(plugin.getId())
            .pluginId(plugin.getPluginId())
            .name(plugin.getName())
            .version(plugin.getVersion())
            .description(plugin.getDescription())
            .author(plugin.getAuthor())
            .iconUrl(plugin.getIconUrl())
            .category(plugin.getCategory())
            .status(plugin.getStatus())
            .publishStatus(plugin.getPublishStatus())
            .previewUrl(plugin.getPreviewUrl())
            .publishNote(plugin.getPublishNote())
            .publishedAt(plugin.getPublishedAt())
            .minSystemVersion(plugin.getMinSystemVersion())
            .configSchema(plugin.getConfigSchema())
            .isSystemPlugin(plugin.getIsSystemPlugin())
            .usageCount(plugin.getUsageCount())
            .rating(plugin.getRating())
            .createdAt(plugin.getCreatedAt())
            .updatedAt(plugin.getUpdatedAt());
        
        // 解析JSON字段
        try {
            if (plugin.getPermissions() != null) {
                List<String> permissions = objectMapper.readValue(
                    plugin.getPermissions(), 
                    new TypeReference<List<String>>() {}
                );
                builder.permissions(permissions);
            }
            
            if (plugin.getDependencies() != null) {
                List<String> dependencies = objectMapper.readValue(
                    plugin.getDependencies(), 
                    new TypeReference<List<String>>() {}
                );
                builder.dependencies(dependencies);
            }
            
            if (plugin.getDefaultConfig() != null) {
                Object defaultConfig = objectMapper.readValue(
                    plugin.getDefaultConfig(), 
                    Object.class
                );
                builder.defaultConfig(defaultConfig);
            }
        } catch (Exception e) {
            log.warn("解析插件JSON字段失败: {}", plugin.getPluginId(), e);
        }
        
        return builder.build();
    }
}
