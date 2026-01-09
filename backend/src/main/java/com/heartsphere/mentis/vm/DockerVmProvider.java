package com.heartsphere.mentis.vm;

import com.heartsphere.mentis.service.MentisVmService;
import lombok.extern.slf4j.Slf4j;
// import org.springframework.stereotype.Component; // 已移除，因为类已弃用

/**
 * Docker 虚拟机提供者
 * 
 * @author HeartSphere
 * @version 1.0
 * @deprecated 请使用 DockerVmProviderImpl
 */
@Deprecated
@Slf4j
// @Component 已移除，因为已弃用，使用 DockerVmProviderImpl 替代
public class DockerVmProvider implements VmProvider {
    
    @Override
    public VmInstance createVm(MentisVmService.VmConfig config) {
        // log.info("创建Docker容器: imageId={}", config.getImageId());
        
        // TODO: 实现Docker容器创建逻辑
        VmInstance instance = new VmInstance();
        instance.setVmId("docker_" + System.currentTimeMillis());
        instance.setStatus("RUNNING");
        
        return instance;
    }
    
    @Override
    public MentisVmService.VmStatus getVmStatus(String vmId) {
        log.debug("获取Docker容器状态: vmId={}", vmId);
        
        // TODO: 实现状态查询逻辑
        MentisVmService.VmStatus status = new MentisVmService.VmStatus();
        status.setVmId(vmId);
        status.setStatus("RUNNING");
        
        return status;
    }
    
    @Override
    public void deleteVm(String vmId) {
        log.info("删除Docker容器: vmId={}", vmId);
        
        // TODO: 实现容器删除逻辑
    }
    
    @Override
    public MentisVmService.CommandResult executeCommand(String vmId, String command) {
        log.info("在Docker容器中执行命令: vmId={}, command={}", vmId, command);
        
        // TODO: 实现命令执行逻辑
        MentisVmService.CommandResult result = new MentisVmService.CommandResult();
        result.setExitCode(0);
        result.setStdout("功能开发中...");
        
        return result;
    }
    
    @Override
    public String createSnapshot(String vmId) {
        log.info("创建Docker镜像快照: vmId={}", vmId);
        
        // TODO: 实现快照创建逻辑
        return "snapshot_" + System.currentTimeMillis();
    }
    
    @Override
    public void restoreSnapshot(String vmId, String snapshotId) {
        log.info("恢复Docker镜像快照: vmId={}, snapshotId={}", vmId, snapshotId);
        
        // TODO: 实现快照恢复逻辑
    }
}
