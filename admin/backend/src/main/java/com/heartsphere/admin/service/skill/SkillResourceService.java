package com.heartsphere.admin.service.skill;

import com.heartsphere.admin.entity.skill.SkillResource;
import com.heartsphere.admin.repository.skill.SkillResourceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * 技能资源管理服务
 * 支持上传和管理 scripts/, references/, assets/ 资源文件
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class SkillResourceService {
    
    private final SkillResourceRepository resourceRepository;
    
    @Value("${app.skill.resource.storage.path:./uploads/skill-resources}")
    private String resourceStoragePath;
    
    @Value("${app.skill.resource.max-size:10485760}") // 10MB default
    private long maxFileSize;
    
    /**
     * 上传资源文件
     * 
     * @param skillId 技能ID
     * @param file 上传的文件
     * @param resourceType 资源类型（SCRIPT/REFERENCE/ASSET）
     * @param description 资源描述
     * @return 创建的资源实体
     */
    @Transactional
    public SkillResource uploadResource(String skillId, MultipartFile file, String resourceType, String description) {
        try {
            log.info("上传技能资源: skillId={}, resourceType={}, fileName={}", 
                skillId, resourceType, file.getOriginalFilename());
            
            // 验证文件
            validateFile(file, resourceType);
            
            // 保存文件
            String filePath = saveResourceFile(file, skillId, resourceType);
            
            // 创建资源记录
            SkillResource resource = new SkillResource();
            resource.setSkillId(skillId);
            resource.setResourceType(resourceType);
            resource.setResourceName(file.getOriginalFilename() != null ? file.getOriginalFilename() : "unnamed");
            resource.setFileName(extractFileName(filePath));
            resource.setFilePath(filePath);
            resource.setFileSize(file.getSize());
            resource.setMimeType(file.getContentType());
            resource.setDescription(description);
            resource.setOrderIndex(0); // 默认排序
            
            // 如果是小文本文件，也可以存储内容
            if (file.getSize() < 1024 * 10) { // 小于10KB的文本文件
                try {
                    String content = new String(file.getBytes(), java.nio.charset.StandardCharsets.UTF_8);
                    resource.setResourceContent(content);
                } catch (Exception e) {
                    log.warn("无法读取文件内容: {}", e.getMessage());
                }
            }
            
            SkillResource saved = resourceRepository.save(resource);
            log.info("技能资源上传成功: id={}, skillId={}, resourceType={}", 
                saved.getId(), skillId, resourceType);
            
            return saved;
            
        } catch (Exception e) {
            log.error("上传技能资源失败: skillId={}, resourceType={}", skillId, resourceType, e);
            throw new RuntimeException("上传技能资源失败: " + e.getMessage(), e);
        }
    }
    
    /**
     * 获取技能的所有资源（按类型分组）
     * 
     * @param skillId 技能ID
     * @return 资源列表（按类型和排序索引排序）
     */
    public List<SkillResource> getResourcesBySkillId(String skillId) {
        return resourceRepository.findBySkillIdOrderByTypeAndOrder(skillId);
    }
    
    /**
     * 根据类型获取资源
     * 
     * @param skillId 技能ID
     * @param resourceType 资源类型
     * @return 资源列表
     */
    public List<SkillResource> getResourcesByType(String skillId, String resourceType) {
        return resourceRepository.findBySkillIdAndResourceType(skillId, resourceType);
    }
    
    /**
     * 删除资源
     * 
     * @param skillId 技能ID
     * @param resourceId 资源ID
     */
    @Transactional
    public void deleteResource(String skillId, Long resourceId) {
        Optional<SkillResource> resourceOpt = resourceRepository.findBySkillIdAndId(skillId, resourceId);
        if (resourceOpt.isEmpty()) {
            throw new IllegalArgumentException("资源不存在: skillId=" + skillId + ", resourceId=" + resourceId);
        }
        
        SkillResource resource = resourceOpt.get();
        
        // 删除文件
        if (resource.getFilePath() != null) {
            try {
                Path filePath = Paths.get(resourceStoragePath, resource.getFilePath());
                if (Files.exists(filePath)) {
                    Files.delete(filePath);
                    log.info("删除资源文件: {}", filePath);
                }
            } catch (IOException e) {
                log.warn("删除资源文件失败: {}", resource.getFilePath(), e);
            }
        }
        
        // 删除数据库记录
        resourceRepository.delete(resource);
        log.info("删除技能资源: skillId={}, resourceId={}", skillId, resourceId);
    }
    
    /**
     * 更新资源描述
     * 
     * @param skillId 技能ID
     * @param resourceId 资源ID
     * @param description 新描述
     * @return 更新后的资源
     */
    @Transactional
    public SkillResource updateResourceDescription(String skillId, Long resourceId, String description) {
        Optional<SkillResource> resourceOpt = resourceRepository.findBySkillIdAndId(skillId, resourceId);
        if (resourceOpt.isEmpty()) {
            throw new IllegalArgumentException("资源不存在: skillId=" + skillId + ", resourceId=" + resourceId);
        }
        
        SkillResource resource = resourceOpt.get();
        resource.setDescription(description);
        
        return resourceRepository.save(resource);
    }
    
    /**
     * 更新资源排序
     * 
     * @param skillId 技能ID
     * @param resourceId 资源ID
     * @param orderIndex 新排序索引
     * @return 更新后的资源
     */
    @Transactional
    public SkillResource updateResourceOrder(String skillId, Long resourceId, Integer orderIndex) {
        Optional<SkillResource> resourceOpt = resourceRepository.findBySkillIdAndId(skillId, resourceId);
        if (resourceOpt.isEmpty()) {
            throw new IllegalArgumentException("资源不存在: skillId=" + skillId + ", resourceId=" + resourceId);
        }
        
        SkillResource resource = resourceOpt.get();
        resource.setOrderIndex(orderIndex);
        
        return resourceRepository.save(resource);
    }
    
    /**
     * 验证文件
     */
    private void validateFile(MultipartFile file, String resourceType) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("文件不能为空");
        }
        
        // 验证文件大小
        if (file.getSize() > maxFileSize) {
            throw new IllegalArgumentException("文件大小不能超过 " + (maxFileSize / 1024 / 1024) + "MB");
        }
        
        // 验证文件类型（根据资源类型）
        String filename = file.getOriginalFilename();
        if (filename == null) {
            throw new IllegalArgumentException("文件名不能为空");
        }
        
        String extension = filename.substring(filename.lastIndexOf('.') + 1).toLowerCase();
        
        switch (resourceType) {
            case "SCRIPT":
                if (!isScriptFile(extension)) {
                    throw new IllegalArgumentException("脚本资源只支持: .py, .sh, .js, .ts, .java 等");
                }
                break;
            case "REFERENCE":
                if (!isReferenceFile(extension)) {
                    throw new IllegalArgumentException("参考文档资源只支持: .md, .txt, .json, .yaml, .yml 等");
                }
                break;
            case "ASSET":
                // 资产文件类型较宽泛，基本都支持
                break;
            default:
                throw new IllegalArgumentException("无效的资源类型: " + resourceType);
        }
    }
    
    /**
     * 判断是否为脚本文件
     */
    private boolean isScriptFile(String extension) {
        return List.of("py", "sh", "bash", "js", "ts", "java", "rb", "php", "go", "rs").contains(extension);
    }
    
    /**
     * 判断是否为参考文档文件
     */
    private boolean isReferenceFile(String extension) {
        return List.of("md", "txt", "json", "yaml", "yml", "xml", "html", "css").contains(extension);
    }
    
    /**
     * 保存资源文件
     */
    private String saveResourceFile(MultipartFile file, String skillId, String resourceType) throws IOException {
        // 创建目录结构: skill-resources/{skillId}/{resourceType}/{year}/{month}/
        String year = String.valueOf(java.time.Year.now().getValue());
        String month = String.format("%02d", java.time.MonthDay.now().getMonthValue());
        
        Path resourcePath = Paths.get(resourceStoragePath, skillId, resourceType.toLowerCase(), year, month);
        Files.createDirectories(resourcePath);
        
        // 生成唯一文件名
        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        String filename = java.util.UUID.randomUUID().toString() + extension;
        
        // 保存文件
        Path targetPath = resourcePath.resolve(filename);
        Files.copy(file.getInputStream(), targetPath, java.nio.file.StandardCopyOption.REPLACE_EXISTING);
        
        // 返回相对路径
        return String.format("%s/%s/%s/%s/%s", skillId, resourceType.toLowerCase(), year, month, filename);
    }
    
    /**
     * 从文件路径提取文件名
     */
    private String extractFileName(String filePath) {
        if (filePath == null) {
            return null;
        }
        int lastSlash = filePath.lastIndexOf('/');
        return lastSlash >= 0 ? filePath.substring(lastSlash + 1) : filePath;
    }
}
