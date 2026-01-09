package com.heartsphere.mentis.agentscope.prototype;

import com.heartsphere.mentis.vm.VmManager;
import io.agentscope.core.message.ToolResultBlock;
import io.agentscope.core.tool.AgentTool;
import io.agentscope.core.tool.ToolCallParam;
import reactor.core.publisher.Mono;

import java.time.Duration;
import java.util.List;
import java.util.Map;

/**
 * VmManagerTool 原型实现
 * 将 VmManager 包装为 AgentScope 工具
 * 
 * @author HeartSphere
 * @version 1.0
 */
public class VmManagerTool implements AgentTool {
    
    private final VmManager vmManager;
    
    public VmManagerTool(VmManager vmManager) {
        this.vmManager = vmManager;
    }
    
    @Override
    public String getName() {
        return "vm_manager";
    }
    
    @Override
    public String getDescription() {
        return "管理虚拟机的生命周期，包括创建、删除、状态查询、快照管理。所有操作都需要 sessionId 参数。";
    }
    
    @Override
    public Map<String, Object> getParameters() {
        return Map.of(
            "type", "object",
            "properties", Map.of(
                "sessionId", Map.of(
                    "type", "string",
                    "description", "会话ID，用于标识对应的虚拟机"
                ),
                "action", Map.of(
                    "type", "string",
                    "enum", List.of("create", "get_status", "delete", "create_snapshot", "restore_snapshot"),
                    "description", "要执行的操作"
                ),
                "config", Map.of(
                    "type", "object",
                    "description", "虚拟机配置（仅在 action=create 时使用）",
                    "properties", Map.of(
                        "osType", Map.of("type", "string", "description", "操作系统类型（如 ubuntu, centos）"),
                        "cpu", Map.of("type", "integer", "description", "CPU 核心数"),
                        "memory", Map.of("type", "integer", "description", "内存大小（MB）"),
                        "disk", Map.of("type", "integer", "description", "磁盘大小（GB）")
                    )
                ),
                "snapshotName", Map.of(
                    "type", "string",
                    "description", "快照名称（仅在 action=create_snapshot 或 restore_snapshot 时使用）"
                )
            ),
            "required", List.of("sessionId", "action")
        );
    }
    
    @Override
    public Mono<ToolResultBlock> callAsync(ToolCallParam param) {
        return Mono.fromCallable(() -> {
            Map<String, Object> args = param.getInput();
            String sessionId = (String) args.get("sessionId");
            String action = (String) args.get("action");
            
            if (sessionId == null || sessionId.isEmpty()) {
                return ToolResultBlock.error("sessionId is required");
            }
            
            if (action == null || action.isEmpty()) {
                return ToolResultBlock.error("action is required");
            }
            
            try {
                switch (action) {
                    case "create":
                        return handleCreateVm(sessionId, args);
                    case "get_status":
                        return handleGetStatus(sessionId);
                    case "delete":
                        return handleDeleteVm(sessionId);
                    case "create_snapshot":
                        return handleCreateSnapshot(sessionId, args);
                    case "restore_snapshot":
                        return handleRestoreSnapshot(sessionId, args);
                    default:
                        return ToolResultBlock.error("Unknown action: " + action);
                }
            } catch (Exception e) {
                return ToolResultBlock.error("Error executing action '" + action + "': " + e.getMessage());
            }
        })
        .timeout(Duration.ofMinutes(5))
        .doOnError(error -> {
            // Log error if needed
            System.err.println("VmManagerTool error: " + error.getMessage());
        })
        .onErrorReturn(ToolResultBlock.error("Timeout or error occurred"));
    }
    
    private ToolResultBlock handleCreateVm(String sessionId, Map<String, Object> args) {
        // 检查是否已存在虚拟机
        var existingVm = vmManager.getVmForSession(sessionId);
        if (existingVm != null) {
            return ToolResultBlock.text(
                String.format("VM already exists for session %s. VM ID: %s, Status: %s",
                    sessionId, existingVm.getVmId(), 
                    vmManager.getVmStatus(existingVm.getVmId()).getStatus()));
        }
        
        // 解析配置（简化版，实际应该从 args 中解析）
        // 这里先创建一个默认配置的虚拟机
        // TODO: 实际实现需要从 args 中解析 config
        
        return ToolResultBlock.text("VM creation not yet implemented in prototype");
    }
    
    private ToolResultBlock handleGetStatus(String sessionId) {
        var vm = vmManager.getVmForSession(sessionId);
        if (vm == null) {
            return ToolResultBlock.error("No VM found for session: " + sessionId + ". Please create a VM first.");
        }
        
        var status = vmManager.getVmStatus(vm.getVmId());
        return ToolResultBlock.text(
            String.format("VM Status:\n  VM ID: %s\n  Status: %s\n  Session ID: %s",
                vm.getVmId(), status.getStatus(), sessionId));
    }
    
    private ToolResultBlock handleDeleteVm(String sessionId) {
        var vm = vmManager.getVmForSession(sessionId);
        if (vm == null) {
            return ToolResultBlock.error("No VM found for session: " + sessionId);
        }
        
        vmManager.deleteVmForSession(sessionId);
        return ToolResultBlock.text("VM deleted successfully for session: " + sessionId);
    }
    
    private ToolResultBlock handleCreateSnapshot(String sessionId, Map<String, Object> args) {
        String snapshotName = (String) args.get("snapshotName");
        if (snapshotName == null || snapshotName.isEmpty()) {
            return ToolResultBlock.error("snapshotName is required for create_snapshot action");
        }
        
        var vm = vmManager.getVmForSession(sessionId);
        if (vm == null) {
            return ToolResultBlock.error("No VM found for session: " + sessionId);
        }
        
        // TODO: 实际实现快照创建
        return ToolResultBlock.text("Snapshot creation not yet implemented in prototype: " + snapshotName);
    }
    
    private ToolResultBlock handleRestoreSnapshot(String sessionId, Map<String, Object> args) {
        String snapshotName = (String) args.get("snapshotName");
        if (snapshotName == null || snapshotName.isEmpty()) {
            return ToolResultBlock.error("snapshotName is required for restore_snapshot action");
        }
        
        var vm = vmManager.getVmForSession(sessionId);
        if (vm == null) {
            return ToolResultBlock.error("No VM found for session: " + sessionId);
        }
        
        // TODO: 实际实现快照恢复
        return ToolResultBlock.text("Snapshot restore not yet implemented in prototype: " + snapshotName);
    }
}
