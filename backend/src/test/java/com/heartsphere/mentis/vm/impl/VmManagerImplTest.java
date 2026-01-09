package com.heartsphere.mentis.vm.impl;

import com.heartsphere.mentis.service.MentisVmService;
import com.heartsphere.mentis.vm.VmProvider;
import com.heartsphere.mentis.vm.VmProvider.VmInstance;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

/**
 * VmManagerImpl 单元测试
 * 
 * @author HeartSphere
 * @version 1.0
 */
@ExtendWith(MockitoExtension.class)
class VmManagerImplTest {
    
    @Mock
    private VmProvider vmProvider;
    
    @InjectMocks
    private VmManagerImpl vmManager;
    
    private String testSessionId;
    private MentisVmService.VmConfig testVmConfig;
    private VmInstance testVmInstance;
    
    @BeforeEach
    void setUp() {
        testSessionId = "mentis_test_session_123";
        
        testVmConfig = new MentisVmService.VmConfig();
        testVmConfig.setImageId("ubuntu:latest");
        // VmConfig 可能没有 setProviderType 方法
        
        testVmInstance = new VmInstance();
        testVmInstance.setVmId("vm_test_123");
        testVmInstance.setStatus("RUNNING");
        // VmInstance 可能没有 setProviderType 方法
        
        // 由于 VmManagerImpl 构造函数需要处理 providers 列表，这里简化处理
        // 实际测试可能需要调整构造方式
    }
    
    @Test
    void testCreateVmForSession() {
        // Given
        when(vmProvider.createVm(any(MentisVmService.VmConfig.class))).thenReturn(testVmInstance);
        
        // When
        VmInstance result = vmManager.createVmForSession(testSessionId, testVmConfig);
        
        // Then
        assertNotNull(result);
        assertEquals("vm_test_123", result.getVmId());
        verify(vmProvider, times(1)).createVm(any(MentisVmService.VmConfig.class));
    }
    
    @Test
    void testGetVmStatus() {
        // Given
        String vmId = "vm_test_123";
        MentisVmService.VmStatus vmStatus = new MentisVmService.VmStatus();
        vmStatus.setVmId(vmId);
        vmStatus.setStatus("RUNNING");
        
        when(vmProvider.getVmStatus(vmId)).thenReturn(vmStatus);
        
        // When
        MentisVmService.VmStatus result = vmManager.getVmStatus(vmId);
        
        // Then
        assertNotNull(result);
        assertEquals("RUNNING", result.getStatus());
        verify(vmProvider, times(1)).getVmStatus(vmId);
    }
    
    @Test
    void testGetVmForSession() {
        // Given
        when(vmProvider.createVm(any(MentisVmService.VmConfig.class))).thenReturn(testVmInstance);
        
        // 先创建虚拟机
        vmManager.createVmForSession(testSessionId, testVmConfig);
        
        // When
        VmInstance result = vmManager.getVmForSession(testSessionId);
        
        // Then
        assertNotNull(result);
        assertEquals("vm_test_123", result.getVmId());
    }
    
    @Test
    void testGetVmForSessionNotExists() {
        // When
        VmInstance result = vmManager.getVmForSession(testSessionId);
        
        // Then
        assertNull(result);
    }
    
    @Test
    void testGetStatistics() {
        // Given
        when(vmProvider.createVm(any(MentisVmService.VmConfig.class))).thenReturn(testVmInstance);
        vmManager.createVmForSession(testSessionId, testVmConfig);
        
        // When
        Map<String, Object> stats = vmManager.getStatistics();
        
        // Then
        assertNotNull(stats);
        assertTrue(stats.containsKey("totalVms"));
        assertTrue(stats.containsKey("activeSessions"));
    }
}
