package com.heartsphere.mentis.service;

/**
 * Mentis 虚拟机管理服务接口
 * 
 * @author HeartSphere
 * @version 1.0
 */
public interface MentisVmService {
    
    /**
     * 为会话创建虚拟机
     * 
     * @param sessionId 会话ID
     * @param config 虚拟机配置
     * @return 虚拟机实例
     */
    VmInstance createVm(String sessionId, VmConfig config);
    
    /**
     * 获取虚拟机状态
     * 
     * @param sessionId 会话ID
     * @return 虚拟机状态
     */
    VmStatus getVmStatus(String sessionId);
    
    /**
     * 执行命令
     * 
     * @param sessionId 会话ID
     * @param command 命令
     * @return 命令执行结果
     */
    CommandResult executeCommand(String sessionId, String command);
    
    /**
     * 创建快照
     * 
     * @param sessionId 会话ID
     * @return 快照ID
     */
    String createSnapshot(String sessionId);
    
    /**
     * 恢复快照
     * 
     * @param sessionId 会话ID
     * @param snapshotId 快照ID
     */
    void restoreSnapshot(String sessionId, String snapshotId);
    
    /**
     * 虚拟机实例
     */
    class VmInstance {
        private String vmId;
        private String sessionId;
        private String status;
        
        // Getters and Setters
        public String getVmId() { return vmId; }
        public void setVmId(String vmId) { this.vmId = vmId; }
        public String getSessionId() { return sessionId; }
        public void setSessionId(String sessionId) { this.sessionId = sessionId; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
    }
    
    /**
     * 虚拟机配置
     */
    class VmConfig {
        private String imageId;
        private int cpu;
        private int memory; // MB
        private int disk; // GB
        
        // Getters and Setters
        public String getImageId() { return imageId; }
        public void setImageId(String imageId) { this.imageId = imageId; }
        public int getCpu() { return cpu; }
        public void setCpu(int cpu) { this.cpu = cpu; }
        public int getMemory() { return memory; }
        public void setMemory(int memory) { this.memory = memory; }
        public int getDisk() { return disk; }
        public void setDisk(int disk) { this.disk = disk; }
    }
    
    /**
     * 虚拟机状态
     */
    class VmStatus {
        private String vmId;
        private String status; // IDLE, RUNNING, ERROR
        private String cpuUsage;
        private String memoryUsage;
        
        // Getters and Setters
        public String getVmId() { return vmId; }
        public void setVmId(String vmId) { this.vmId = vmId; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public String getCpuUsage() { return cpuUsage; }
        public void setCpuUsage(String cpuUsage) { this.cpuUsage = cpuUsage; }
        public String getMemoryUsage() { return memoryUsage; }
        public void setMemoryUsage(String memoryUsage) { this.memoryUsage = memoryUsage; }
    }
    
    /**
     * 命令执行结果
     */
    class CommandResult {
        private int exitCode;
        private String stdout;
        private String stderr;
        
        // Getters and Setters
        public int getExitCode() { return exitCode; }
        public void setExitCode(int exitCode) { this.exitCode = exitCode; }
        public String getStdout() { return stdout; }
        public void setStdout(String stdout) { this.stdout = stdout; }
        public String getStderr() { return stderr; }
        public void setStderr(String stderr) { this.stderr = stderr; }
    }
}
