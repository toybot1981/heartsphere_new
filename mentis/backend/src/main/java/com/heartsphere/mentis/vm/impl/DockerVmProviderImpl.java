package com.heartsphere.mentis.vm.impl;

import com.heartsphere.mentis.service.MentisVmService;
import com.heartsphere.mentis.vm.VmProvider;
import com.heartsphere.mentis.vm.VmScreenshotService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Component;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Docker 虚拟机提供者实现
 * 使用 Docker 命令行工具实现虚拟机管理
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Slf4j
@Lazy
@Component
@RequiredArgsConstructor
@ConditionalOnProperty(name = "mentis.vm.provider", havingValue = "docker", matchIfMissing = false)
public class DockerVmProviderImpl implements VmProvider {
    
    private final VmScreenshotService screenshotService;
    
    @Value("${mentis.docker.host:tcp://localhost:2375}")
    private String dockerHost;
    
    @Value("${mentis.default-vm-image:ubuntu:latest}")
    private String defaultImage;
    
    /**
     * 执行 Docker 命令
     */
    private String executeDockerCommand(String... command) {
        try {
            List<String> cmd = new ArrayList<>();
            cmd.add("docker");
            for (String arg : command) {
                cmd.add(arg);
            }
            
            ProcessBuilder processBuilder = new ProcessBuilder(cmd);
            processBuilder.redirectErrorStream(true);
            Process process = processBuilder.start();
            
            StringBuilder output = new StringBuilder();
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    output.append(line).append("\n");
                }
            }
            
            int exitCode = process.waitFor();
            if (exitCode != 0) {
                log.error("Docker 命令执行失败: exitCode={}, command={}", exitCode, String.join(" ", command));
                throw new RuntimeException("Docker command failed with exit code: " + exitCode);
            }
            
            return output.toString().trim();
        } catch (Exception e) {
            log.error("执行 Docker 命令失败: command={}", String.join(" ", command), e);
            throw new RuntimeException("Failed to execute Docker command", e);
        }
    }
    
    @Override
    public VmInstance createVm(MentisVmService.VmConfig config) {
        log.info("创建 Docker 容器: imageId={}, cpu={}, memory={}MB", 
                config.getImageId(), config.getCpu(), config.getMemory());
        
        String imageId = config.getImageId() != null && !config.getImageId().isEmpty() 
                ? config.getImageId() : defaultImage;
        String containerName = "mentis_vm_" + UUID.randomUUID().toString().substring(0, 8);
        
        try {
            // 创建 Docker 容器
            // docker run -d --name <containerName> --memory <memory>m --cpus <cpu> <image>
            List<String> runCmd = new ArrayList<>();
            runCmd.add("run");
            runCmd.add("-d");
            runCmd.add("--name");
            runCmd.add(containerName);
            runCmd.add("--memory");
            runCmd.add(config.getMemory() + "m");
            runCmd.add("--cpus");
            runCmd.add(String.valueOf(config.getCpu()));
            runCmd.add(imageId);
            
            String containerId = executeDockerCommand(runCmd.toArray(new String[0]));
            if (containerId.isEmpty()) {
                // 如果没有输出，尝试通过容器名称获取 ID
                containerId = executeDockerCommand("ps", "-aqf", "name=" + containerName);
            }
            
            log.info("Docker 容器创建成功: containerId={}, containerName={}", containerId, containerName);
            
            VmInstance instance = new VmInstance();
            instance.setVmId(containerId);
            instance.setStatus("RUNNING");
            
            return instance;
        } catch (Exception e) {
            log.error("创建 Docker 容器失败: containerName={}", containerName, e);
            throw new RuntimeException("Failed to create Docker container", e);
        }
    }
    
    @Override
    public MentisVmService.VmStatus getVmStatus(String vmId) {
        log.debug("获取 Docker 容器状态: vmId={}", vmId);
        
        try {
            // docker ps --filter id=<vmId> --format "{{.Status}}"
            String statusOutput = executeDockerCommand("ps", "--filter", "id=" + vmId, "--format", "{{.Status}}");
            
            MentisVmService.VmStatus status = new MentisVmService.VmStatus();
            status.setVmId(vmId);
            
            if (statusOutput.isEmpty()) {
                // 容器不存在或已停止
                status.setStatus("STOPPED");
            } else if (statusOutput.contains("Up")) {
                status.setStatus("RUNNING");
            } else {
                status.setStatus("STOPPED");
            }
            
            // 获取资源使用情况（CPU 和内存）
            try {
                String statsOutput = executeDockerCommand("stats", "--no-stream", "--format", 
                        "{{.CPUPerc}}\t{{.MemUsage}}", vmId);
                if (!statsOutput.isEmpty() && statsOutput.contains("\t")) {
                    String[] parts = statsOutput.split("\t");
                    if (parts.length >= 2) {
                        status.setCpuUsage(parts[0].trim());
                        status.setMemoryUsage(parts[1].trim());
                    }
                }
            } catch (Exception e) {
                log.warn("获取容器统计信息失败: vmId={}", vmId, e);
                status.setCpuUsage("N/A");
                status.setMemoryUsage("N/A");
            }
            
            return status;
        } catch (Exception e) {
            log.error("获取 Docker 容器状态失败: vmId={}", vmId, e);
            // 返回错误状态
            MentisVmService.VmStatus status = new MentisVmService.VmStatus();
            status.setVmId(vmId);
            status.setStatus("ERROR");
            return status;
        }
    }
    
    @Override
    public void deleteVm(String vmId) {
        log.info("删除 Docker 容器: vmId={}", vmId);
        
        try {
            // docker rm -f <vmId>
            executeDockerCommand("rm", "-f", vmId);
            log.info("Docker 容器删除成功: vmId={}", vmId);
        } catch (Exception e) {
            log.error("删除 Docker 容器失败: vmId={}", vmId, e);
            throw new RuntimeException("Failed to delete Docker container", e);
        }
    }
    
    @Override
    public MentisVmService.CommandResult executeCommand(String vmId, String command) {
        log.info("在 Docker 容器中执行命令: vmId={}, command={}", vmId, command);
        
        try {
            // docker exec <vmId> sh -c "<command>"
            String output = executeDockerCommand("exec", vmId, "sh", "-c", command);
            
            MentisVmService.CommandResult result = new MentisVmService.CommandResult();
            result.setExitCode(0);
            result.setStdout(output);
            result.setStderr("");
            
            return result;
        } catch (Exception e) {
            log.error("在 Docker 容器中执行命令失败: vmId={}, command={}", vmId, command, e);
            MentisVmService.CommandResult result = new MentisVmService.CommandResult();
            result.setExitCode(1);
            result.setStdout("");
            result.setStderr(e.getMessage());
            return result;
        }
    }
    
    @Override
    public String createSnapshot(String vmId) {
        log.info("创建 Docker 镜像快照: vmId={}", vmId);
        
        try {
            // docker commit <vmId> mentis_snapshot_<timestamp>
            String snapshotTag = "mentis_snapshot_" + System.currentTimeMillis();
            executeDockerCommand("commit", vmId, snapshotTag);
            
            log.info("Docker 镜像快照创建成功: vmId={}, snapshotTag={}", vmId, snapshotTag);
            return snapshotTag;
        } catch (Exception e) {
            log.error("创建 Docker 镜像快照失败: vmId={}", vmId, e);
            throw new RuntimeException("Failed to create Docker snapshot", e);
        }
    }
    
    @Override
    public void restoreSnapshot(String vmId, String snapshotId) {
        log.info("恢复 Docker 镜像快照: vmId={}, snapshotId={}", vmId, snapshotId);
        
        try {
            // 先停止并删除现有容器
            executeDockerCommand("stop", vmId);
            executeDockerCommand("rm", vmId);
            
            // 使用快照镜像创建新容器
            String containerName = "mentis_vm_" + UUID.randomUUID().toString().substring(0, 8);
            executeDockerCommand("run", "-d", "--name", containerName, snapshotId);
            
            log.info("Docker 镜像快照恢复成功: vmId={}, snapshotId={}", vmId, snapshotId);
        } catch (Exception e) {
            log.error("恢复 Docker 镜像快照失败: vmId={}, snapshotId={}", vmId, snapshotId, e);
            throw new RuntimeException("Failed to restore Docker snapshot", e);
        }
    }
    
    @Override
    public String getScreenshot(String vmId) {
        log.debug("获取 Docker 容器截图（已禁用）: vmId={}", vmId);
        // 截图功能已禁用，直接返回 null
        return null;
        
        /* 截图功能已注释
        try {
            // 使用 VmScreenshotService 获取截图
            return screenshotService.captureScreenshotFromDocker(vmId);
        } catch (Exception e) {
            log.error("获取 Docker 容器截图失败: vmId={}", vmId, e);
            return null;
        }
        */
    }
}