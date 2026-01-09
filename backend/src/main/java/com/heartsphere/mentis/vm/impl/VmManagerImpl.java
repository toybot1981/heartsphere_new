package com.heartsphere.mentis.vm.impl;

import com.heartsphere.mentis.service.MentisVmService;
import com.heartsphere.mentis.vm.VmManager;
import com.heartsphere.mentis.vm.VmProvider;
import com.heartsphere.mentis.vm.VmProvider.VmInstance;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

/**
 * 虚拟机管理器实现
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Slf4j
@Lazy
@Component
@RequiredArgsConstructor
public class VmManagerImpl implements VmManager {
    
    private final VmProvider vmProvider;
    
    // 会话到虚拟机的映射
    private final Map<String, String> sessionToVmMap = new ConcurrentHashMap<>();
    
    // 虚拟机实例缓存
    private final Map<String, VmInstance> vmCache = new ConcurrentHashMap<>();
    
    @Override
    public VmInstance createVmForSession(String sessionId, MentisVmService.VmConfig config) {
        log.info("为会话创建虚拟机: sessionId={}", sessionId);
        
        // 检查是否已存在虚拟机
        String existingVmId = sessionToVmMap.get(sessionId);
        if (existingVmId != null) {
            log.warn("会话已有虚拟机，先删除: sessionId={}, vmId={}", sessionId, existingVmId);
            deleteVmForSession(sessionId);
        }
        
        // 创建新虚拟机
        VmInstance instance = vmProvider.createVm(config);
        
        // 保存映射关系
        sessionToVmMap.put(sessionId, instance.getVmId());
        vmCache.put(instance.getVmId(), instance);
        
        log.info("虚拟机创建成功: sessionId={}, vmId={}", sessionId, instance.getVmId());
        
        return instance;
    }
    
    @Override
    public VmInstance getVmForSession(String sessionId) {
        log.debug("获取会话的虚拟机: sessionId={}", sessionId);
        
        String vmId = sessionToVmMap.get(sessionId);
        if (vmId == null) {
            return null;
        }
        
        VmInstance instance = vmCache.get(vmId);
        if (instance == null) {
            // 从提供者获取最新状态
            MentisVmService.VmStatus status = vmProvider.getVmStatus(vmId);
            instance = new VmInstance();
            instance.setVmId(vmId);
            instance.setStatus(status.getStatus());
            vmCache.put(vmId, instance);
        }
        
        return instance;
    }
    
    @Override
    public MentisVmService.VmStatus getVmStatus(String vmId) {
        return vmProvider.getVmStatus(vmId);
    }
    
    @Override
    public void deleteVmForSession(String sessionId) {
        log.info("删除会话的虚拟机: sessionId={}", sessionId);
        
        String vmId = sessionToVmMap.remove(sessionId);
        if (vmId != null) {
            try {
                vmProvider.deleteVm(vmId);
                vmCache.remove(vmId);
                log.info("虚拟机删除成功: sessionId={}, vmId={}", sessionId, vmId);
            } catch (Exception e) {
                log.error("删除虚拟机失败: sessionId={}, vmId={}", sessionId, vmId, e);
            }
        }
    }
    
    @Override
    public void startVm(String vmId) {
        log.info("启动虚拟机: vmId={}", vmId);
        // TODO: 实现启动逻辑
    }
    
    @Override
    public void stopVm(String vmId) {
        log.info("停止虚拟机: vmId={}", vmId);
        // TODO: 实现停止逻辑
    }
    
    @Override
    public void restartVm(String vmId) {
        log.info("重启虚拟机: vmId={}", vmId);
        stopVm(vmId);
        startVm(vmId);
    }
    
    @Override
    public String createSnapshot(String vmId) {
        log.info("创建快照: vmId={}", vmId);
        return vmProvider.createSnapshot(vmId);
    }
    
    @Override
    public void restoreSnapshot(String vmId, String snapshotId) {
        log.info("恢复快照: vmId={}, snapshotId={}", vmId, snapshotId);
        vmProvider.restoreSnapshot(vmId, snapshotId);
    }
    
    @Override
    public List<VmInstance> getAllVms() {
        return new ArrayList<>(vmCache.values());
    }
    
    @Override
    public Map<String, Object> getStatistics() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalVms", vmCache.size());
        stats.put("activeSessions", sessionToVmMap.size());
        // TODO: 添加更多统计信息
        return stats;
    }
    
    @Override
    public void cleanupExpiredVms(int maxAge) {
        log.info("清理过期虚拟机: maxAge={}小时", maxAge);
        // TODO: 实现清理逻辑
    }
    
    @Override
    public boolean healthCheck(String vmId) {
        try {
            MentisVmService.VmStatus status = vmProvider.getVmStatus(vmId);
            return "RUNNING".equalsIgnoreCase(status.getStatus());
        } catch (Exception e) {
            log.warn("虚拟机健康检查失败: vmId={}", vmId, e);
            return false;
        }
    }
}
