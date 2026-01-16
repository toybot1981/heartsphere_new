package com.heartsphere.mentis.vm;

import com.heartsphere.mentis.service.MentisVmService;

/**
 * 虚拟机提供者接口
 * 定义虚拟机管理的基本操作
 * 
 * @author HeartSphere
 * @version 1.0
 */
public interface VmProvider {
    
    /**
     * 创建虚拟机
     * 
     * @param config 虚拟机配置
     * @return 虚拟机实例
     */
    VmInstance createVm(MentisVmService.VmConfig config);
    
    /**
     * 获取虚拟机状态
     * 
     * @param vmId 虚拟机ID
     * @return 虚拟机状态
     */
    MentisVmService.VmStatus getVmStatus(String vmId);
    
    /**
     * 删除虚拟机
     * 
     * @param vmId 虚拟机ID
     */
    void deleteVm(String vmId);
    
    /**
     * 执行命令
     * 
     * @param vmId 虚拟机ID
     * @param command 命令
     * @return 命令执行结果
     */
    MentisVmService.CommandResult executeCommand(String vmId, String command);
    
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
     * 获取虚拟机屏幕截图
     * 
     * @param vmId 虚拟机ID
     * @return Base64 编码的截图（data URI 格式），如果无法获取则返回 null
     */
    default String getScreenshot(String vmId) {
        // 默认实现返回 null，由具体实现类提供
        return null;
    }
    
    /**
     * 虚拟机实例
     */
    class VmInstance {
        private String vmId;
        private String status;
        
        // Getters and Setters
        public String getVmId() { return vmId; }
        public void setVmId(String vmId) { this.vmId = vmId; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
    }
}
