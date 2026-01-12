package com.heartsphere.mentis.vm;

import com.heartsphere.mentis.service.MentisVmService;
import com.heartsphere.mentis.vm.VmProvider.VmInstance;

import java.util.List;
import java.util.Map;

/**
 * 虚拟机管理器
 * 统一管理虚拟机的生命周期
 * 
 * @author HeartSphere
 * @version 1.0
 */
public interface VmManager {
    
    /**
     * 为会话创建虚拟机
     * 
     * @param sessionId 会话ID
     * @param config 虚拟机配置
     * @return 虚拟机实例
     */
    VmInstance createVmForSession(String sessionId, MentisVmService.VmConfig config);
    
    /**
     * 获取会话的虚拟机
     * 
     * @param sessionId 会话ID
     * @return 虚拟机实例
     */
    VmInstance getVmForSession(String sessionId);
    
    /**
     * 获取虚拟机状态
     * 
     * @param vmId 虚拟机ID
     * @return 虚拟机状态
     */
    MentisVmService.VmStatus getVmStatus(String vmId);
    
    /**
     * 删除会话的虚拟机
     * 
     * @param sessionId 会话ID
     */
    void deleteVmForSession(String sessionId);
    
    /**
     * 启动虚拟机
     * 
     * @param vmId 虚拟机ID
     */
    void startVm(String vmId);
    
    /**
     * 停止虚拟机
     * 
     * @param vmId 虚拟机ID
     */
    void stopVm(String vmId);
    
    /**
     * 重启虚拟机
     * 
     * @param vmId 虚拟机ID
     */
    void restartVm(String vmId);
    
    /**
     * 创建快照
     * 
     * @param vmId 虚拟机ID
     * @return 快照ID
     */
    String createSnapshot(String vmId);
    
    /**
     * 恢复快照
     * 
     * @param vmId 虚拟机ID
     * @param snapshotId 快照ID
     */
    void restoreSnapshot(String vmId, String snapshotId);
    
    /**
     * 获取所有虚拟机
     * 
     * @return 虚拟机列表
     */
    List<VmInstance> getAllVms();
    
    /**
     * 获取虚拟机统计信息
     * 
     * @return 统计信息
     */
    Map<String, Object> getStatistics();
    
    /**
     * 清理过期虚拟机
     * 
     * @param maxAge 最大存活时间（小时）
     */
    void cleanupExpiredVms(int maxAge);
    
    /**
     * 健康检查
     * 
     * @param vmId 虚拟机ID
     * @return 是否健康
     */
    boolean healthCheck(String vmId);
}
