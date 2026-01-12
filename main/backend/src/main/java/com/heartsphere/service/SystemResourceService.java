package com.heartsphere.service;

import com.heartsphere.dto.SystemResourceDTO;
import com.heartsphere.entity.SystemResource;
import com.heartsphere.repository.SystemResourceRepository;
import com.heartsphere.shared.util.ImageUrlUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.logging.Logger;
import java.util.stream.Collectors;

/**
 * 系统资源服务
 * 注意：此服务直接访问数据库，admin 只负责配置
 */
@Service
@RequiredArgsConstructor
public class SystemResourceService {

    private static final Logger logger = Logger.getLogger(SystemResourceService.class.getName());

    private final SystemResourceRepository resourceRepository;
    private final ImageUrlUtils imageUrlUtils;

    /**
     * 获取所有资源
     */
    public List<SystemResourceDTO> getAllResources() {
        return resourceRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * 根据分类获取资源
     */
    public List<SystemResourceDTO> getResourcesByCategory(String category) {
        try {
            logger.info("根据分类获取资源: category=" + category);
            List<SystemResource> resources = resourceRepository.findByCategoryOrderByCreatedAtDesc(category);
            logger.info("找到 " + resources.size() + " 个资源");
            List<SystemResourceDTO> dtos = resources.stream()
                    .map(this::toDTO)
                    .collect(Collectors.toList());
            logger.info("成功转换为 DTO，共 " + dtos.size() + " 个");
            return dtos;
        } catch (Exception e) {
            logger.severe("根据分类获取资源失败: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    /**
     * 根据ID获取资源
     */
    public SystemResourceDTO getResourceById(Long id) {
        return resourceRepository.findById(id)
                .map(this::toDTO)
                .orElseThrow(() -> new RuntimeException("资源不存在"));
    }

    /**
     * 转换为DTO
     */
    private SystemResourceDTO toDTO(SystemResource resource) {
        SystemResourceDTO dto = new SystemResourceDTO();
        dto.setId(resource.getId());
        dto.setName(resource.getName());
        // 转换图片URL（相对路径 -> 完整URL）
        String url = resource.getUrl();
        if (url != null) {
            if (imageUrlUtils != null) {
                url = imageUrlUtils.toFullUrl(url);
            } else if (!url.startsWith("http://") && !url.startsWith("https://") && !url.startsWith("placeholder://")) {
                // 如果imageUrlUtils为null，使用默认值构造完整URL
                java.util.logging.Logger.getLogger(SystemResourceService.class.getName())
                    .warning("ImageUrlUtils未初始化，使用默认baseUrl转换图片URL: " + url);
                String defaultBaseUrl = "http://localhost:8081/images";
                String normalizedPath = url.startsWith("/") ? url : "/" + url;
                url = defaultBaseUrl + normalizedPath;
            }
        }
        dto.setUrl(url);
        dto.setCategory(resource.getCategory());
        dto.setDescription(resource.getDescription());
        dto.setPrompt(resource.getPrompt());
        dto.setTags(resource.getTags());
        dto.setFileSize(resource.getFileSize());
        dto.setMimeType(resource.getMimeType());
        dto.setWidth(resource.getWidth());
        dto.setHeight(resource.getHeight());
        dto.setCreatedByAdminId(resource.getCreatedByAdminId());
        dto.setCreatedAt(resource.getCreatedAt());
        dto.setUpdatedAt(resource.getUpdatedAt());
        return dto;
    }
}
