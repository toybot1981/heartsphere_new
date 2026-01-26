package com.heartsphere.mentis.vm.impl;

import com.heartsphere.mentis.service.MentisVmService;
import com.heartsphere.mentis.vm.VmProvider;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

/**
 * 占位虚拟机提供者实现
 * 临时实现，用于 mentis 后端启动
 * 当没有其他 VmProvider 实现可用时使用此实现
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Slf4j
@Component("placeholderVmProvider")
@ConditionalOnProperty(name = "mentis.vm.provider", havingValue = "placeholder", matchIfMissing = true)
public class PlaceholderVmProvider implements VmProvider {
    
    @Override
    public VmInstance createVm(MentisVmService.VmConfig config) {
        log.info("PlaceholderVmProvider.createVm 被调用，使用模拟实现创建虚拟机");
        // 模拟创建虚拟机，返回一个模拟的虚拟机实例
        VmInstance instance = new VmInstance();
        instance.setVmId("vm_placeholder_" + System.currentTimeMillis());
        instance.setStatus("RUNNING");
        log.info("模拟虚拟机创建成功: vmId={}", instance.getVmId());
        return instance;
    }
    
    @Override
    public MentisVmService.VmStatus getVmStatus(String vmId) {
        log.info("PlaceholderVmProvider.getVmStatus 被调用，使用模拟实现获取虚拟机状态: vmId={}", vmId);
        // 模拟获取虚拟机状态
        MentisVmService.VmStatus status = new MentisVmService.VmStatus();
        status.setVmId(vmId);
        status.setStatus("RUNNING");
        status.setCpuUsage("50%");
        status.setMemoryUsage("60%");
        return status;
    }
    
    @Override
    public void deleteVm(String vmId) {
        log.info("PlaceholderVmProvider.deleteVm 被调用，使用模拟实现删除虚拟机: vmId={}", vmId);
        // 模拟删除虚拟机（不做实际操作）
        log.info("模拟虚拟机删除成功: vmId={}", vmId);
    }
    
    @Override
    public MentisVmService.CommandResult executeCommand(String vmId, String command) {
        log.info("PlaceholderVmProvider.executeCommand 被调用，使用模拟实现执行命令: vmId={}, command={}", vmId, command);
        // 模拟执行命令
        MentisVmService.CommandResult result = new MentisVmService.CommandResult();
        result.setExitCode(0);
        result.setStdout("模拟命令执行结果: " + command);
        result.setStderr("");
        return result;
    }
    
    @Override
    public String createSnapshot(String vmId) {
        log.info("PlaceholderVmProvider.createSnapshot 被调用，使用模拟实现创建快照: vmId={}", vmId);
        // 模拟创建快照
        String snapshotId = "snapshot_placeholder_" + System.currentTimeMillis();
        log.info("模拟快照创建成功: vmId={}, snapshotId={}", vmId, snapshotId);
        return snapshotId;
    }
    
    @Override
    public void restoreSnapshot(String vmId, String snapshotId) {
        log.info("PlaceholderVmProvider.restoreSnapshot 被调用，使用模拟实现恢复快照: vmId={}, snapshotId={}", vmId, snapshotId);
        // 模拟恢复快照（不做实际操作）
        log.info("模拟快照恢复成功: vmId={}, snapshotId={}", vmId, snapshotId);
    }
    
    @Override
    public String getScreenshot(String vmId) {
        log.info("PlaceholderVmProvider.getScreenshot 被调用，返回模拟截图: vmId={}", vmId);
        // 返回占位符截图
        return "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
    }
}
