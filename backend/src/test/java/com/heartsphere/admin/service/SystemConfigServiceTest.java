package com.heartsphere.admin.service;

import com.heartsphere.admin.entity.SystemConfig;
import com.heartsphere.admin.repository.SystemConfigRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
public class SystemConfigServiceTest {

    @Autowired
    private SystemConfigService systemConfigService;

    @Autowired
    private SystemConfigRepository configRepository;

    @BeforeEach
    public void setUp() {
        // 清理测试数据
        configRepository.findByConfigKey("invite_code_required")
                .ifPresent(configRepository::delete);
    }

    @Test
    public void testIsInviteCodeRequiredDefault() {
        // 默认应该返回false
        boolean required = systemConfigService.isInviteCodeRequired();
        assertFalse(required);
    }

    @Test
    public void testSetInviteCodeRequired() {
        // 设置为true
        systemConfigService.setInviteCodeRequired(true);
        assertTrue(systemConfigService.isInviteCodeRequired());

        // 设置为false
        systemConfigService.setInviteCodeRequired(false);
        assertFalse(systemConfigService.isInviteCodeRequired());
    }

    @Test
    public void testSetInviteCodeRequiredPersists() {
        systemConfigService.setInviteCodeRequired(true);
        
        // 验证持久化
        assertTrue(systemConfigService.isInviteCodeRequired());
        
        // 再次查询验证
        boolean required = systemConfigService.isInviteCodeRequired();
        assertTrue(required);
    }

    @Test
    public void testGetConfigValue() {
        SystemConfig config = new SystemConfig();
        config.setConfigKey("test_key");
        config.setConfigValue("test_value");
        config.setDescription("Test description");
        configRepository.save(config);

        String value = systemConfigService.getConfigValue("test_key");
        assertEquals("test_value", value);
    }

    @Test
    public void testGetConfigValueNotFound() {
        String value = systemConfigService.getConfigValue("non_existent_key");
        assertNull(value);
    }

    @Test
    public void testSetConfigValue() {
        systemConfigService.setConfigValue("test_key", "test_value", "Test description");
        
        String value = systemConfigService.getConfigValue("test_key");
        assertEquals("test_value", value);
    }

    @Test
    public void testSetConfigValueUpdatesExisting() {
        systemConfigService.setConfigValue("test_key", "initial_value", "Initial description");
        systemConfigService.setConfigValue("test_key", "updated_value", "Updated description");
        
        String value = systemConfigService.getConfigValue("test_key");
        assertEquals("updated_value", value);
    }
}

