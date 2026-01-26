package com.heartsphere.mentis.vm.impl;

import com.heartsphere.mentis.config.ToolConfiguration;
import com.heartsphere.mentis.service.MentisVmService;
import com.heartsphere.mentis.service.SessionRealtimeService;
import com.heartsphere.mentis.vm.VmInitializationService;
import com.heartsphere.mentis.vm.VmManager;
import com.heartsphere.mentis.vm.VmNotFoundException;
import com.heartsphere.mentis.vm.VmProvider;
import com.heartsphere.mentis.vm.VmProvider.VmInstance;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Component;
import org.springframework.beans.factory.annotation.Autowired;

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
    private final SessionRealtimeService sessionRealtimeService;
    private final VmInitializationService vmInitializationService;
    
    // 使用 @Lazy 延迟加载，避免循环依赖
    // ToolConfiguration -> TerminalExecTool -> VmManager -> ToolConfiguration
    @Lazy
    @Autowired
    private ToolConfiguration toolConfiguration;
    
    // 会话到虚拟机的映射
    private final Map<String, String> sessionToVmMap = new ConcurrentHashMap<>();
    
    // 虚拟机实例缓存
    private final Map<String, VmInstance> vmCache = new ConcurrentHashMap<>();
    
    // 虚拟机创建时间映射（用于判断是否超过1小时）
    private final Map<String, Long> vmCreatedAtMap = new ConcurrentHashMap<>();
    
    // 虚拟机初始化状态映射（用于判断是否已完成预安装）
    private final Map<String, Boolean> vmInitializedMap = new ConcurrentHashMap<>();
    
    // 虚拟机保留时间（1小时，单位：毫秒）
    private static final long VM_RETENTION_TIME_MS = 60 * 60 * 1000L; // 1小时
    
    @Override
    public VmInstance createVmForSession(String sessionId, MentisVmService.VmConfig config) {
        log.info("为会话创建虚拟机: sessionId={}", sessionId);
        
        // 检查是否已存在有效的虚拟机（未超过1小时）
        String existingVmId = sessionToVmMap.get(sessionId);
        if (existingVmId != null) {
            VmInstance existingInstance = vmCache.get(existingVmId);
            if (existingInstance != null) {
                Long createdAt = vmCreatedAtMap.get(existingVmId);
                if (createdAt != null) {
                    long age = System.currentTimeMillis() - createdAt;
                    if (age < VM_RETENTION_TIME_MS) {
                        // 检查虚拟机状态是否正常
                        MentisVmService.VmStatus status = vmProvider.getVmStatus(existingVmId);
                        if (status != null && "RUNNING".equalsIgnoreCase(status.getStatus())) {
                            log.info("复用现有虚拟机: sessionId={}, vmId={}, age={}ms", sessionId, existingVmId, age);
                            return existingInstance;
                        } else {
                            log.warn("现有虚拟机状态异常，创建新虚拟机: sessionId={}, vmId={}, status={}", 
                                    sessionId, existingVmId, status != null ? status.getStatus() : "null");
                        }
                    } else {
                        log.info("现有虚拟机已过期（超过1小时），创建新虚拟机: sessionId={}, vmId={}, age={}ms", 
                                sessionId, existingVmId, age);
                    }
                }
            }
            // 删除旧的虚拟机
            deleteVmForSession(sessionId);
        }
        
        // 创建新虚拟机
        VmInstance instance = vmProvider.createVm(config);
        long createdAt = System.currentTimeMillis();
        
        // 保存映射关系
        sessionToVmMap.put(sessionId, instance.getVmId());
        vmCache.put(instance.getVmId(), instance);
        vmCreatedAtMap.put(instance.getVmId(), createdAt);
        vmInitializedMap.put(instance.getVmId(), false); // 标记为未初始化
        
        log.info("虚拟机创建成功: sessionId={}, vmId={}, createdAt={}", sessionId, instance.getVmId(), createdAt);
        
        // 发送虚拟机状态更新事件（启动中）
        sendVmStatusUpdate(sessionId, instance.getVmId(), "STARTING", "虚拟机正在启动");
        
        // 异步检查虚拟机状态，当就绪时发送 RUNNING 事件
        checkVmReadyAndNotify(sessionId, instance.getVmId());
        
        // 异步初始化虚拟机（预安装依赖包）
        initializeVmAsync(sessionId, instance.getVmId());
        
        // MCP Gateway 相关逻辑已禁用（MCP Gateway 是可选功能，避免阻塞执行）
        // registerMcpToolsAsync(sessionId);
        
        return instance;
    }
    
    @Override
    public VmInstance getVmForSession(String sessionId) {
        log.info("获取会话的虚拟机: sessionId={}", sessionId);
        
        String vmId = sessionToVmMap.get(sessionId);
        if (vmId == null) {
            return null;
        }
        
        // 检查虚拟机是否过期（超过1小时）
        Long createdAt = vmCreatedAtMap.get(vmId);
        if (createdAt != null) {
            long age = System.currentTimeMillis() - createdAt;
            if (age >= VM_RETENTION_TIME_MS) {
                log.info("虚拟机已过期（超过1小时），清除映射: sessionId={}, vmId={}, age={}ms", sessionId, vmId, age);
                sessionToVmMap.remove(sessionId);
                vmCache.remove(vmId);
                vmCreatedAtMap.remove(vmId);
                vmInitializedMap.remove(vmId);
                return null;
            }
        }
        
        VmInstance instance = vmCache.get(vmId);
        if (instance == null) {
            // 从提供者获取最新状态
            MentisVmService.VmStatus status = vmProvider.getVmStatus(vmId);
            
            // 如果沙箱不存在或已停止（可能 Bridge Service 重启或沙箱停止导致），清除映射关系
            if (status != null && ("NOT_FOUND".equals(status.getStatus()) || "STOPPED".equals(status.getStatus()))) {
                log.warn("虚拟机不存在或已停止，清除会话映射: sessionId={}, vmId={}, status={}", sessionId, vmId, status.getStatus());
                sessionToVmMap.remove(sessionId);
                vmCache.remove(vmId);
                vmCreatedAtMap.remove(vmId);
                vmInitializedMap.remove(vmId);
                return null;
            }
            
            instance = new VmInstance();
            instance.setVmId(vmId);
            instance.setStatus(status != null ? status.getStatus() : "UNKNOWN");
            vmCache.put(vmId, instance);
        } else {
            // 即使缓存中有实例，也定期检查状态，确保沙箱还在运行
            try {
                MentisVmService.VmStatus status = vmProvider.getVmStatus(vmId);
                if (status != null && ("NOT_FOUND".equals(status.getStatus()) || "STOPPED".equals(status.getStatus()))) {
                    log.warn("缓存的虚拟机已停止，清除映射: sessionId={}, vmId={}, status={}", sessionId, vmId, status.getStatus());
                    sessionToVmMap.remove(sessionId);
                    vmCache.remove(vmId);
                    vmCreatedAtMap.remove(vmId);
                    vmInitializedMap.remove(vmId);
                    return null;
                }
            } catch (Exception e) {
                // 状态检查失败，可能是沙箱已停止，但不立即清除，等待下次执行命令时处理
                log.info("检查虚拟机状态失败（可能是沙箱已停止）: sessionId={}, vmId={}", sessionId, vmId, e);
            }
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
                // 发送虚拟机状态更新事件（删除中）
                sendVmStatusUpdate(sessionId, vmId, "DELETING", "虚拟机正在删除");
                
                vmProvider.deleteVm(vmId);
                vmCache.remove(vmId);
                vmCreatedAtMap.remove(vmId);
                vmInitializedMap.remove(vmId);
                log.info("虚拟机删除成功: sessionId={}, vmId={}", sessionId, vmId);
                
                // 发送虚拟机状态更新事件（已删除）
                sendVmStatusUpdate(sessionId, vmId, "DELETED", "虚拟机已删除");
            } catch (Exception e) {
                log.error("删除虚拟机失败: sessionId={}, vmId={}", sessionId, vmId, e);
                // 清理本地映射，即使删除失败
                vmCache.remove(vmId);
                vmCreatedAtMap.remove(vmId);
                vmInitializedMap.remove(vmId);
                // 发送错误事件
                sendVmStatusUpdate(sessionId, vmId, "ERROR", "删除虚拟机失败: " + e.getMessage());
            }
        }
    }
    
    @Override
    public void startVm(String vmId) {
        log.info("启动虚拟机: vmId={}", vmId);
        // TODO: 实现启动逻辑
        // 查找关联的 sessionId
        String sessionId = findSessionIdByVmId(vmId);
        if (sessionId != null) {
            sendVmStatusUpdate(sessionId, vmId, "STARTING", "虚拟机正在启动");
        }
    }
    
    @Override
    public void stopVm(String vmId) {
        log.info("停止虚拟机: vmId={}", vmId);
        // TODO: 实现停止逻辑
        // 查找关联的 sessionId
        String sessionId = findSessionIdByVmId(vmId);
        if (sessionId != null) {
            sendVmStatusUpdate(sessionId, vmId, "STOPPING", "虚拟机正在停止");
        }
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
    
    @Override
    public String getVmScreenshot(String vmId) {
        log.info("获取虚拟机截图（已禁用）: vmId={}", vmId);
        // 截图功能已禁用，直接返回 null
        return null;
        
        /* 截图功能已注释
        try {
            return vmProvider.getScreenshot(vmId);
        } catch (Exception e) {
            log.error("获取虚拟机截图失败: vmId={}", vmId, e);
            return null;
        }
        */
    }
    
    @Override
    public Map<String, Object> getVncInfo(String vmId) {
        log.info("获取虚拟机 VNC 连接信息: vmId={}", vmId);
        try {
            // 检查是否是 E2B Provider
            if (vmProvider instanceof com.heartsphere.mentis.vm.impl.E2BVmProviderImpl) {
                com.heartsphere.mentis.vm.impl.E2BVmProviderImpl e2bProvider = 
                    (com.heartsphere.mentis.vm.impl.E2BVmProviderImpl) vmProvider;
                com.heartsphere.mentis.vm.e2b.E2BVncInfo vncInfo = e2bProvider.getVncConnectionInfo(vmId);
                
                if (vncInfo != null) {
                    Map<String, Object> result = new HashMap<>();
                    if (vncInfo.getUrl() != null) {
                        result.put("url", vncInfo.getUrl());
                    }
                    if (vncInfo.getPassword() != null) {
                        result.put("password", vncInfo.getPassword());
                    }
                    if (vncInfo.getHost() != null) {
                        result.put("host", vncInfo.getHost());
                    }
                    if (vncInfo.getPort() != null) {
                        result.put("port", vncInfo.getPort());
                    }
                    return result;
                }
            }
            
            // 其他 Provider 可能不支持 VNC，返回 null
            log.warn("当前 Provider 不支持 VNC 连接信息获取: vmId={}, provider={}", vmId, vmProvider.getClass().getName());
            return null;
            
        } catch (Exception e) {
            log.error("获取虚拟机 VNC 连接信息失败: vmId={}", vmId, e);
            return null;
        }
    }
    
    @Override
    public MentisVmService.CommandResult executeCommand(String vmId, String command) {
        log.info("在虚拟机中执行命令: vmId={}, command={}", vmId, command);
        try {
            return vmProvider.executeCommand(vmId, command);
        } catch (Exception e) {
            log.error("在虚拟机中执行命令失败: vmId={}, command={}", vmId, command, e);
            MentisVmService.CommandResult result = new MentisVmService.CommandResult();
            result.setExitCode(1);
            result.setStderr("执行命令失败: " + e.getMessage());
            return result;
        }
    }
    
    @Override
    public MentisVmService.CommandResult executeCommandForSession(String sessionId, String command) {
        log.info("在会话的虚拟机中执行命令: sessionId={}, command={}", sessionId, command);
        
        try {
            // 获取会话的虚拟机
            VmInstance vmInstance = getVmForSession(sessionId);
            if (vmInstance == null) {
                log.warn("会话没有关联的虚拟机: sessionId={}", sessionId);
                MentisVmService.CommandResult result = new MentisVmService.CommandResult();
                result.setExitCode(1);
                result.setStderr("会话未关联虚拟机");
                return result;
            }
            
            // 在虚拟机中执行命令
            return executeCommand(vmInstance.getVmId(), command);
            
        } catch (VmNotFoundException e) {
            // 虚拟机不存在，清除过期的沙箱 ID 并重新创建
            log.warn("虚拟机不存在，清除过期映射并重新创建: sessionId={}, vmId={}", sessionId, e.getVmId());
            
            // 清除过期的沙箱 ID 映射
            String staleVmId = e.getVmId();
            log.info("清除过期的沙箱 ID 映射: sessionId={}, vmId={}", sessionId, staleVmId);
            sessionToVmMap.remove(sessionId);
            vmCache.remove(staleVmId);
            vmCreatedAtMap.remove(staleVmId);
            vmInitializedMap.remove(staleVmId);
            
            // 重新创建虚拟机
            try {
                log.info("重新创建虚拟机: sessionId={}", sessionId);
                VmInstance newVmInstance = createVmForSession(sessionId, null);
                if (newVmInstance != null) {
                    // 重新执行命令
                    return executeCommand(newVmInstance.getVmId(), command);
                } else {
                    MentisVmService.CommandResult result = new MentisVmService.CommandResult();
                    result.setExitCode(1);
                    result.setStderr("重新创建虚拟机失败");
                    return result;
                }
            } catch (Exception createEx) {
                log.error("重新创建虚拟机失败: sessionId={}", sessionId, createEx);
                MentisVmService.CommandResult result = new MentisVmService.CommandResult();
                result.setExitCode(1);
                result.setStderr("重新创建虚拟机失败: " + createEx.getMessage());
                return result;
            }
        } catch (Exception e) {
            log.error("在会话的虚拟机中执行命令失败: sessionId={}, command={}", sessionId, command, e);
            MentisVmService.CommandResult result = new MentisVmService.CommandResult();
            result.setExitCode(1);
            result.setStderr("执行命令失败: " + e.getMessage());
            return result;
        }
    }
    
    /**
     * 发送虚拟机状态更新事件
     */
    private void sendVmStatusUpdate(String sessionId, String vmId, String status, String message) {
        try {
            Map<String, Object> statusData = new HashMap<>();
            statusData.put("vmId", vmId);
            statusData.put("status", status);
            statusData.put("message", message);
            statusData.put("timestamp", System.currentTimeMillis());
            
            sessionRealtimeService.sendEvent(sessionId, "vm_status_changed", statusData);
            log.info("发送虚拟机状态更新事件: sessionId={}, vmId={}, status={}", sessionId, vmId, status);
        } catch (Exception e) {
            log.warn("发送虚拟机状态更新事件失败: sessionId={}, vmId={}", sessionId, vmId, e);
        }
    }
    
    /**
     * 异步检查虚拟机是否就绪，就绪时发送 RUNNING 事件
     */
    private void checkVmReadyAndNotify(String sessionId, String vmId) {
        new Thread(() -> {
            try {
                // 等待一段时间后检查状态
                Thread.sleep(2000);
                
                MentisVmService.VmStatus status = vmProvider.getVmStatus(vmId);
                if (status != null && "RUNNING".equalsIgnoreCase(status.getStatus())) {
                    sendVmStatusUpdate(sessionId, vmId, "RUNNING", "虚拟机运行中");
                } else if (status != null && "ERROR".equalsIgnoreCase(status.getStatus())) {
                    sendVmStatusUpdate(sessionId, vmId, "ERROR", "虚拟机启动失败");
                }
            } catch (Exception e) {
                log.warn("检查虚拟机就绪状态失败: sessionId={}, vmId={}", sessionId, vmId, e);
            }
        }).start();
    }
    
    /**
     * 根据 vmId 查找关联的 sessionId
     */
    private String findSessionIdByVmId(String vmId) {
        for (Map.Entry<String, String> entry : sessionToVmMap.entrySet()) {
            if (vmId.equals(entry.getValue())) {
                return entry.getKey();
            }
        }
        return null;
    }
    
    /**
     * 异步初始化虚拟机（预安装依赖包）
     */
    private void initializeVmAsync(String sessionId, String vmId) {
        log.info("开始异步初始化虚拟机: sessionId={}, vmId={}", sessionId, vmId);
        
        // 发送初始化开始事件
        sendVmStatusUpdate(sessionId, vmId, "INITIALIZING", "正在初始化虚拟机环境（安装依赖包）");
        
        // 异步执行初始化
        vmInitializationService.initializeVm(this, vmId, sessionId)
            .thenRun(() -> {
                log.info("虚拟机初始化完成: sessionId={}, vmId={}", sessionId, vmId);
                // 标记为已初始化
                vmInitializedMap.put(vmId, true);
                // 发送初始化完成事件
                sendVmStatusUpdate(sessionId, vmId, "READY", "虚拟机环境已就绪");
            })
            .exceptionally(ex -> {
                log.error("虚拟机初始化失败: sessionId={}, vmId={}", sessionId, vmId, ex);
                // 标记为已初始化（即使失败，也允许使用，依赖会在执行时安装）
                vmInitializedMap.put(vmId, true);
                // 发送初始化失败事件（但不影响虚拟机使用）
                sendVmStatusUpdate(sessionId, vmId, "READY", "虚拟机已就绪（部分依赖将在使用时安装）");
                return null;
            });
    }
    
    /**
     * 异步注册 MCP 工具（如果虚拟机支持 MCP Gateway）
     * 
     * MCP Gateway 相关逻辑已禁用（MCP Gateway 是可选功能，避免阻塞执行）
     */
    private void registerMcpToolsAsync(String sessionId) {
        // MCP Gateway 相关逻辑已禁用，直接返回，避免阻塞
        log.info("MCP 工具注册已禁用: sessionId={}", sessionId);
        return;
        
        /* 原代码已注释
        log.info("开始异步注册 MCP 工具: sessionId={}", sessionId);
        
        // 异步执行，避免阻塞虚拟机创建流程
        new Thread(() -> {
            try {
                // 等待一段时间，确保虚拟机已创建并可能已初始化 MCP Gateway
                Thread.sleep(3000);
                
                // 检查会话是否还有关联的虚拟机
                VmInstance vmInstance = getVmForSession(sessionId);
                if (vmInstance == null) {
                    log.warn("会话已无关联虚拟机，跳过 MCP 工具注册: sessionId={}", sessionId);
                    return;
                }
                
                // 注册 MCP 工具
                toolConfiguration.registerMcpToolsForSession(sessionId);
                log.info("MCP 工具注册完成: sessionId={}", sessionId);
                
            } catch (Exception e) {
                log.warn("注册 MCP 工具失败（这是正常的，MCP Gateway 是可选功能）: sessionId={}", sessionId, e);
            }
        }).start();
        */
    }
    
    /**
     * 检查虚拟机是否已完成初始化
     */
    public boolean isVmInitialized(String vmId) {
        Boolean initialized = vmInitializedMap.get(vmId);
        return initialized != null && initialized;
    }
    
    /**
     * 等待虚拟机初始化完成（最多等待指定时间）
     */
    public void waitForVmInitialization(String vmId, int maxWaitSeconds) {
        log.info("等待虚拟机初始化完成: vmId={}, maxWaitSeconds={}", vmId, maxWaitSeconds);
        
        long startTime = System.currentTimeMillis();
        long timeout = maxWaitSeconds * 1000L;
        
        while (System.currentTimeMillis() - startTime < timeout) {
            if (isVmInitialized(vmId)) {
                log.info("虚拟机初始化已完成: vmId={}", vmId);
                return;
            }
            
            try {
                Thread.sleep(500); // 等待 500ms 后重试
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                log.warn("等待虚拟机初始化被中断: vmId={}", vmId);
                return;
            }
        }
        
        log.warn("等待虚拟机初始化超时: vmId={}, maxWaitSeconds={}", vmId, maxWaitSeconds);
    }
}
