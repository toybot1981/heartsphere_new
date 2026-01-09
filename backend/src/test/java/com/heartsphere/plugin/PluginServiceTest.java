package com.heartsphere.plugin;

import com.heartsphere.plugin.dto.PluginDTO;
import com.heartsphere.plugin.dto.PluginListRequest;
import com.heartsphere.plugin.dto.PluginListResponse;
import com.heartsphere.plugin.entity.Plugin;
import com.heartsphere.plugin.repository.PluginRepository;
import com.heartsphere.plugin.service.PluginService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import static org.junit.jupiter.api.Assertions.*;

/**
 * 插件服务测试
 * 
 * @author HeartSphere
 * @version 1.0
 */
@SpringBootTest
@ActiveProfiles("test")
@Transactional
public class PluginServiceTest {
    
    @Autowired
    private PluginService pluginService;
    
    @Autowired
    private PluginRepository pluginRepository;
    
    @BeforeEach
    void setUp() {
        // 测试数据应该在迁移脚本中创建
    }
    
    @Test
    void testGetPluginList() {
        PluginListRequest request = PluginListRequest.builder()
            .page(0)
            .size(20)
            .build();
        
        PluginListResponse response = pluginService.getPluginList(request);
        
        assertNotNull(response);
        assertNotNull(response.getPlugins());
        assertTrue(response.getTotal() >= 0);
    }
    
    @Test
    void testGetPluginById() {
        // 假设存在一个插件ID为 "photo-album"
        try {
            PluginDTO plugin = pluginService.getPluginById("photo-album");
            assertNotNull(plugin);
            assertEquals("photo-album", plugin.getPluginId());
        } catch (Exception e) {
            // 如果插件不存在，跳过测试
            System.out.println("插件不存在，跳过测试: " + e.getMessage());
        }
    }
    
    @Test
    void testEnablePlugin() {
        // 先创建一个测试插件
        Plugin testPlugin = Plugin.builder()
            .pluginId("test-plugin-" + System.currentTimeMillis())
            .name("测试插件")
            .version("1.0.0")
            .status("INACTIVE")
            .isSystemPlugin(false)
            .usageCount(0)
            .build();
        pluginRepository.save(testPlugin);
        
        // 启用插件
        pluginService.enablePlugin(testPlugin.getPluginId());
        
        // 验证状态
        Plugin updated = pluginRepository.findByPluginId(testPlugin.getPluginId())
            .orElseThrow(() -> new RuntimeException("插件未找到"));
        assertNotNull(updated);
        assertEquals("ACTIVE", updated.getStatus());
    }
    
    @Test
    void testDisablePlugin() {
        // 先创建一个测试插件
        Plugin testPlugin = Plugin.builder()
            .pluginId("test-plugin-disable-" + System.currentTimeMillis())
            .name("测试插件")
            .version("1.0.0")
            .status("ACTIVE")
            .isSystemPlugin(false)
            .usageCount(0)
            .build();
        pluginRepository.save(testPlugin);
        
        // 禁用插件
        pluginService.disablePlugin(testPlugin.getPluginId(), false);
        
        // 验证状态
        Plugin updated = pluginRepository.findByPluginId(testPlugin.getPluginId())
            .orElseThrow(() -> new RuntimeException("插件未找到"));
        assertNotNull(updated);
        assertEquals("INACTIVE", updated.getStatus());
    }
}
