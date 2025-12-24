package com.heartsphere.admin.service;

import com.heartsphere.admin.dto.SystemResourceDTO;
import com.heartsphere.admin.entity.SystemResource;
import com.heartsphere.admin.repository.SystemResourceRepository;
import com.heartsphere.service.ImageStorageService;
import com.heartsphere.util.ImageUrlUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;
import java.util.logging.Logger;

@Service
public class SystemResourceService {

    private static final Logger logger = Logger.getLogger(SystemResourceService.class.getName());

    @Autowired
    private SystemResourceRepository resourceRepository;

    @Autowired
    private ImageStorageService imageStorageService;

    @Autowired
    private ImageUrlUtils imageUrlUtils;

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
            // 上传图片
            String imageUrl = imageStorageService.saveImage(file, "resource_" + category);
            
            // 创建资源记录
            SystemResource resource = new SystemResource();
            resource.setName(name != null && !name.trim().isEmpty() ? name : file.getOriginalFilename());
            resource.setUrl(imageUrl);
            resource.setCategory(category);
            resource.setDescription(description);
            resource.setPrompt(prompt);
            resource.setTags(tags);
            resource.setFileSize(file.getSize());
            resource.setMimeType(file.getContentType());
            resource.setCreatedByAdminId(adminId);
            
            SystemResource saved = resourceRepository.save(resource);
            logger.info("系统资源创建成功: ID=" + saved.getId() + ", URL=" + saved.getUrl());
            
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
        if (url != null && !url.isEmpty()) resource.setUrl(url);
        
        SystemResource updated = resourceRepository.save(resource);
        return toDTO(updated);
    }

    /**
     * 删除资源
     */
    @Transactional
    public void deleteResource(Long id) {
        SystemResource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("资源不存在"));
        
        // 删除文件
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
        if (url != null && imageUrlUtils != null) {
            url = imageUrlUtils.toFullUrl(url);
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

