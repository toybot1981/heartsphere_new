package com.heartsphere.admin.service.skill;

import com.heartsphere.admin.entity.skill.SkillResource;
import com.heartsphere.admin.repository.skill.SkillResourceRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * SkillResourceService 单元测试
 * 
 * @author HeartSphere
 * @version 1.0
 */
@ExtendWith(MockitoExtension.class)
class SkillResourceServiceTest {

    @Mock
    private SkillResourceRepository resourceRepository;

    @InjectMocks
    private SkillResourceService resourceService;

    private String testSkillId = "test-skill-123";
    private String testStoragePath = "./test-uploads/skill-resources";

    @BeforeEach
    void setUp() {
        // 设置测试配置
        ReflectionTestUtils.setField(resourceService, "resourceStoragePath", testStoragePath);
        ReflectionTestUtils.setField(resourceService, "maxFileSize", 10485760L); // 10MB
    }

    @Test
    void testUploadResource_ScriptFile() throws IOException {
        // 准备测试数据
        MultipartFile file = new MockMultipartFile(
            "test.py",
            "test.py",
            "text/x-python",
            "print('Hello, World!')".getBytes()
        );

        SkillResource savedResource = new SkillResource();
        savedResource.setId(1L);
        savedResource.setSkillId(testSkillId);
        savedResource.setResourceType("SCRIPT");
        savedResource.setResourceName("test.py");
        savedResource.setFileSize(file.getSize());
        savedResource.setMimeType("text/x-python");

        when(resourceRepository.save(any(SkillResource.class))).thenReturn(savedResource);

        // 执行测试
        SkillResource result = resourceService.uploadResource(testSkillId, file, "SCRIPT", "测试脚本");

        // 验证结果
        assertNotNull(result);
        assertEquals(testSkillId, result.getSkillId());
        assertEquals("SCRIPT", result.getResourceType());
        assertEquals("test.py", result.getResourceName());
        verify(resourceRepository, times(1)).save(any(SkillResource.class));
    }

    @Test
    void testUploadResource_InvalidFileType() {
        // 准备测试数据
        MultipartFile file = new MockMultipartFile(
            "test.exe",
            "test.exe",
            "application/x-msdownload",
            "binary content".getBytes()
        );

        // 执行测试并验证异常
        assertThrows(RuntimeException.class, () -> {
            resourceService.uploadResource(testSkillId, file, "SCRIPT", null);
        });
    }

    @Test
    void testGetResourcesBySkillId() {
        // 准备测试数据
        SkillResource resource1 = new SkillResource();
        resource1.setId(1L);
        resource1.setSkillId(testSkillId);
        resource1.setResourceType("SCRIPT");

        SkillResource resource2 = new SkillResource();
        resource2.setId(2L);
        resource2.setSkillId(testSkillId);
        resource2.setResourceType("REFERENCE");

        List<SkillResource> resources = Arrays.asList(resource1, resource2);
        when(resourceRepository.findBySkillIdOrderByTypeAndOrder(testSkillId)).thenReturn(resources);

        // 执行测试
        List<SkillResource> result = resourceService.getResourcesBySkillId(testSkillId);

        // 验证结果
        assertNotNull(result);
        assertEquals(2, result.size());
        verify(resourceRepository, times(1)).findBySkillIdOrderByTypeAndOrder(testSkillId);
    }

    @Test
    void testGetResourcesByType() {
        // 准备测试数据
        SkillResource resource = new SkillResource();
        resource.setId(1L);
        resource.setSkillId(testSkillId);
        resource.setResourceType("SCRIPT");

        List<SkillResource> resources = Arrays.asList(resource);
        when(resourceRepository.findBySkillIdAndResourceType(testSkillId, "SCRIPT")).thenReturn(resources);

        // 执行测试
        List<SkillResource> result = resourceService.getResourcesByType(testSkillId, "SCRIPT");

        // 验证结果
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("SCRIPT", result.get(0).getResourceType());
        verify(resourceRepository, times(1)).findBySkillIdAndResourceType(testSkillId, "SCRIPT");
    }

    @Test
    void testDeleteResource() {
        // 准备测试数据
        SkillResource resource = new SkillResource();
        resource.setId(1L);
        resource.setSkillId(testSkillId);
        resource.setFilePath("test/path/file.py");

        when(resourceRepository.findBySkillIdAndId(testSkillId, 1L)).thenReturn(Optional.of(resource));

        // 执行测试
        resourceService.deleteResource(testSkillId, 1L);

        // 验证结果
        verify(resourceRepository, times(1)).findBySkillIdAndId(testSkillId, 1L);
        verify(resourceRepository, times(1)).delete(resource);
    }

    @Test
    void testDeleteResource_NotFound() {
        // 准备测试数据
        when(resourceRepository.findBySkillIdAndId(testSkillId, 1L)).thenReturn(Optional.empty());

        // 执行测试并验证异常
        assertThrows(IllegalArgumentException.class, () -> {
            resourceService.deleteResource(testSkillId, 1L);
        });
    }

    @Test
    void testUpdateResourceDescription() {
        // 准备测试数据
        SkillResource resource = new SkillResource();
        resource.setId(1L);
        resource.setSkillId(testSkillId);
        resource.setDescription("旧描述");

        SkillResource updatedResource = new SkillResource();
        updatedResource.setId(1L);
        updatedResource.setSkillId(testSkillId);
        updatedResource.setDescription("新描述");

        when(resourceRepository.findBySkillIdAndId(testSkillId, 1L)).thenReturn(Optional.of(resource));
        when(resourceRepository.save(any(SkillResource.class))).thenReturn(updatedResource);

        // 执行测试
        SkillResource result = resourceService.updateResourceDescription(testSkillId, 1L, "新描述");

        // 验证结果
        assertNotNull(result);
        assertEquals("新描述", result.getDescription());
        verify(resourceRepository, times(1)).save(any(SkillResource.class));
    }

    @Test
    void testUpdateResourceOrder() {
        // 准备测试数据
        SkillResource resource = new SkillResource();
        resource.setId(1L);
        resource.setSkillId(testSkillId);
        resource.setOrderIndex(0);

        SkillResource updatedResource = new SkillResource();
        updatedResource.setId(1L);
        updatedResource.setSkillId(testSkillId);
        updatedResource.setOrderIndex(1);

        when(resourceRepository.findBySkillIdAndId(testSkillId, 1L)).thenReturn(Optional.of(resource));
        when(resourceRepository.save(any(SkillResource.class))).thenReturn(updatedResource);

        // 执行测试
        SkillResource result = resourceService.updateResourceOrder(testSkillId, 1L, 1);

        // 验证结果
        assertNotNull(result);
        assertEquals(1, result.getOrderIndex());
        verify(resourceRepository, times(1)).save(any(SkillResource.class));
    }
}
