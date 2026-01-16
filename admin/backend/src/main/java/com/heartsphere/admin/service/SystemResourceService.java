package com.heartsphere.admin.service;

import com.heartsphere.admin.dto.SystemResourceDTO;
import com.heartsphere.admin.entity.SystemResource;
import com.heartsphere.admin.repository.SystemResourceRepository;
import com.heartsphere.admin.service.ImageStorageService;
import com.heartsphere.shared.util.ImageUrlUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;
import java.util.logging.Logger;

@Service
@RequiredArgsConstructor
public class SystemResourceService {

    private static final Logger logger = Logger.getLogger(SystemResourceService.class.getName());

    private final SystemResourceRepository resourceRepository;
    private final ImageStorageService imageStorageService;
    private final ImageUrlUtils imageUrlUtils;
    
    @Autowired(required = false)
    private ThumbnailGenerationService thumbnailGenerationService;

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
     * 创建资源（上传图片）
     */
    @Transactional
    public SystemResourceDTO createResource(MultipartFile file, String category, String name, String description, String prompt, String tags, Long adminId) {
        logger.info("创建系统资源: category=" + category + ", name=" + name);
        
        try {
            // 使用迁移后的 ImageStorageService
            String imageUrl = imageStorageService.saveImage(file, category);
            
            // 确定资源名称，如果没有提供则使用文件名
            String resourceName = name != null && !name.trim().isEmpty() ? name : 
                    (file.getOriginalFilename() != null ? file.getOriginalFilename() : "uploaded_image");
            
            // 确保名称唯一：如果同一 category 下已存在相同名称，则添加时间戳后缀
            String uniqueName = ensureUniqueName(resourceName, category);
            
            // 创建资源记录
            SystemResource resource = new SystemResource();
            resource.setName(uniqueName);
            resource.setUrl(imageUrl);
            resource.setCategory(category);
            resource.setDescription(description);
            resource.setPrompt(prompt);
            resource.setTags(tags);
            resource.setFileSize(file.getSize());
            resource.setMimeType(file.getContentType());
            resource.setCreatedByAdminId(adminId);
            
            SystemResource saved;
            try {
                saved = resourceRepository.save(resource);
            } catch (org.springframework.dao.DataIntegrityViolationException e) {
                // 如果仍然出现唯一约束冲突（可能是并发导致的），重试一次
                logger.warning("首次保存失败（可能因并发），尝试重新生成唯一名称并重试: " + e.getMessage());
                // 基于原始名称重新生成唯一名称（增加时间戳以确保唯一性）
                String retryUniqueName = ensureUniqueName(resourceName + "_" + System.currentTimeMillis(), category);
                resource.setName(retryUniqueName);
                saved = resourceRepository.save(resource);
                logger.info("重试保存成功: ID=" + saved.getId() + ", 名称=" + saved.getName());
            }
            logger.info("系统资源创建成功: ID=" + saved.getId() + ", URL=" + saved.getUrl());
            
            // 异步生成缩略图
            if (thumbnailGenerationService != null) {
                try {
                    thumbnailGenerationService.generateAllThumbnailsAsync(saved.getUrl());
                    logger.info("已启动异步生成缩略图任务: " + saved.getUrl());
                } catch (Exception e) {
                    logger.warning("启动异步生成缩略图任务失败（不影响上传）: " + e.getMessage());
                }
            }
            
            return toDTO(saved);
        } catch (Exception e) {
            logger.severe("创建系统资源失败: " + e.getMessage());
            throw new RuntimeException("创建资源失败: " + e.getMessage(), e);
        }
    }

    /**
     * 更新资源信息
     */
    @Transactional
    public SystemResourceDTO updateResource(Long id, String name, String description, String prompt, String tags, String url) {
        SystemResource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("资源不存在"));
        
        if (name != null) resource.setName(name);
        if (description != null) resource.setDescription(description);
        if (prompt != null) resource.setPrompt(prompt);
        if (tags != null) resource.setTags(tags);
        // 将完整URL转换为相对路径存储
        if (url != null && !url.isEmpty()) {
            resource.setUrl(imageUrlUtils.toRelativePath(url));
        }
        
        SystemResource updated = resourceRepository.save(resource);
        return toDTO(updated);
    }

    /**
     * 更新资源的图片（上传新图片并更新URL，不创建新资源记录）
     */
    @Transactional
    public SystemResourceDTO updateResourceImage(Long id, MultipartFile file) {
        SystemResource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("资源不存在"));
        
        try {
            // 保存新图片文件
            String newImageUrl = imageStorageService.saveImage(file, resource.getCategory());
            
            // 删除旧图片文件（如果存在）
            try {
                imageStorageService.deleteImage(resource.getUrl());
            } catch (Exception e) {
                logger.warning("删除旧图片文件失败: " + e.getMessage());
            }
            
            // 更新资源的URL和文件信息
            resource.setUrl(newImageUrl);
            resource.setFileSize(file.getSize());
            resource.setMimeType(file.getContentType());
            
            SystemResource updated = resourceRepository.save(resource);
            logger.info("资源图片更新成功: ID=" + updated.getId() + ", URL=" + updated.getUrl());
            
            // 异步生成缩略图
            if (thumbnailGenerationService != null) {
                try {
                    thumbnailGenerationService.generateAllThumbnailsAsync(updated.getUrl());
                    logger.info("已启动异步生成缩略图任务: " + updated.getUrl());
                } catch (Exception e) {
                    logger.warning("启动异步生成缩略图任务失败（不影响上传）: " + e.getMessage());
                }
            }
            
            return toDTO(updated);
        } catch (Exception e) {
            logger.severe("更新资源图片失败: " + e.getMessage());
            throw new RuntimeException("更新资源图片失败: " + e.getMessage(), e);
        }
    }

    /**
     * 确保资源名称在同一分类下唯一
     * 如果名称已存在，则添加时间戳后缀
     * 注意：名称会被限制在100个字符以内（数据库限制）
     */
    private String ensureUniqueName(String name, String category) {
        // 先限制名称长度（数据库限制为100个字符）
        // 如果名称太长，先截断，但保留一些空间给后缀
        String baseName = name.length() > 100 ? name.substring(0, 100) : name;
        String uniqueName = baseName;
        
        // 检查是否已存在相同名称（同一分类下）
        int suffix = 1;
        int maxAttempts = 100;
        
        while (resourceRepository.findByNameAndCategory(uniqueName, category) != null && suffix <= maxAttempts) {
            // 如果名称已存在，添加后缀
            // 格式：原名称_时间戳_序号
            String timestamp = String.valueOf(System.currentTimeMillis());
            // 使用时间戳的后6位 + 序号作为后缀
            String suffixStr = "_" + timestamp.substring(timestamp.length() - 6) + "_" + suffix;
            
            // 确保总长度不超过100个字符
            // 计算可以保留的基础名称长度
            int suffixLength = suffixStr.length();
            int maxBaseLength = 100 - suffixLength;
            
            if (maxBaseLength < 10) {
                // 如果后缀太长，只使用时间戳作为名称
                uniqueName = "resource_" + timestamp.substring(timestamp.length() - 80) + "_" + suffix;
            } else {
                // 截断基础名称以容纳后缀
                String truncatedBase = baseName.length() > maxBaseLength ? 
                        baseName.substring(0, maxBaseLength) : baseName;
                uniqueName = truncatedBase + suffixStr;
            }
            
            suffix++;
        }
        
        // 如果尝试次数过多，使用时间戳作为名称
        if (suffix > maxAttempts) {
            String timestamp = String.valueOf(System.currentTimeMillis());
            uniqueName = "resource_" + timestamp.substring(timestamp.length() - 80);
            logger.warning("名称唯一性检查超过最大尝试次数，使用时间戳名称: " + uniqueName);
        }
        
        // 最后确保名称不超过100个字符（双重检查）
        if (uniqueName.length() > 100) {
            uniqueName = uniqueName.substring(0, 100);
        }
        
        if (!uniqueName.equals(baseName)) {
            logger.info("资源名称已存在，自动重命名: " + baseName + " -> " + uniqueName);
        }
        
        return uniqueName;
    }

    /**
     * 删除资源
     */
    @Transactional
    public void deleteResource(Long id) {
        SystemResource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("资源不存在"));
        
        // 使用迁移后的 ImageStorageService 删除文件
        try {
            imageStorageService.deleteImage(resource.getUrl());
        } catch (Exception e) {
            logger.warning("删除资源文件失败: " + e.getMessage());
        }
        
        // 删除记录
        resourceRepository.delete(resource);
        logger.info("系统资源已删除: ID=" + id);
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

