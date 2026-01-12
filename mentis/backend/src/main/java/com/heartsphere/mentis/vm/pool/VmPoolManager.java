package com.heartsphere.mentis.vm.pool;

import com.heartsphere.mentis.service.MentisVmService;
import com.heartsphere.mentis.vm.VmProvider.VmInstance;

import java.util.List;

/**
 * 虚拟机池管理器
 * 
 * @author HeartSphere
 * @version 1.0
 */
public interface VmPoolManager {
    
    /**
     * 从池中获取虚拟机
     * 
     * @param config 虚拟机配置
     * @return 虚拟机实例
     */
    VmInstance acquireVm(MentisVmService.VmConfig config);
    
    /**
     * 归还虚拟机到池中
     * 
     * @param vmId 虚拟机ID
     */
    void releaseVm(String vmId);
    
    /**
     * 初始化虚拟机池
     * 
     * @param poolSize 池大小
     * @param config 虚拟机配置
     */
    void initializePool(int poolSize, MentisVmService.VmConfig config);
    
    /**
     * 获取池状态
     * 
     * @return 池状态信息
     */
    PoolStatus getPoolStatus();
    
    /**
     * 清理空闲虚拟机
     */
    void cleanupIdleVms();
    
    /**
     * 池状态
     */
    class PoolStatus {
        private int totalSize;
        private int availableSize;
        private int inUseSize;
        private List<String> availableVmIds;
        private List<String> inUseVmIds;
        
        // Getters and Setters
        public int getTotalSize() { return totalSize; }
        public void setTotalSize(int totalSize) { this.totalSize = totalSize; }
        public int getAvailableSize() { return availableSize; }
        public void setAvailableSize(int availableSize) { this.availableSize = availableSize; }
        public int getInUseSize() { return inUseSize; }
        public void setInUseSize(int inUseSize) { this.inUseSize = inUseSize; }
        public List<String> getAvailableVmIds() { return availableVmIds; }
        public void setAvailableVmIds(List<String> availableVmIds) { this.availableVmIds = availableVmIds; }
        public List<String> getInUseVmIds() { return inUseVmIds; }
        public void setInUseVmIds(List<String> inUseVmIds) { this.inUseVmIds = inUseVmIds; }
    }
}
