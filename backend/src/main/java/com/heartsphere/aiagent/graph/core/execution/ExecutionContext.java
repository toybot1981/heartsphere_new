package com.heartsphere.aiagent.graph.core.execution;

import com.heartsphere.aiagent.graph.core.GraphEngine;
import lombok.Builder;
import lombok.Data;

import java.util.HashMap;
import java.util.Map;

/**
 * Graph执行上下文
 * 用于管理Graph执行过程中的上下文信息，包括执行状态、用户输入、中断点等
 *
 * @author HeartSphere
 * @version 1.0
 */
@Data
@Builder
public class ExecutionContext {
    
    /**
     * 执行ID（唯一标识一次执行）
     */
    private String executionId;
    
    /**
     * Graph ID
     */
    private Long graphId;
    
    /**
     * 当前执行状态
     */
    @Builder.Default
    private ExecutionStatus status = ExecutionStatus.RUNNING;
    
    /**
     * 当前执行的节点ID
     */
    private String currentNodeId;
    
    /**
     * Graph状态
     */
    private GraphEngine.GraphState state;
    
    /**
     * 执行步骤数
     */
    @Builder.Default
    private int stepCount = 0;
    
    /**
     * 是否已暂停
     */
    @Builder.Default
    private boolean paused = false;
    
    /**
     * 暂停原因
     */
    private String pauseReason;
    
    /**
     * 等待中的节点ID（用于WaitNode和ChoiceNode）
     */
    private String waitingNodeId;
    
    /**
     * 等待类型（WAIT, CHOICE等）
     */
    private WaitType waitType;
    
    /**
     * 用户输入缓存（用于ChoiceNode的选择）
     */
    private String userChoiceOptionId;
    
    /**
     * 自定义上下文数据
     */
    @Builder.Default
    private Map<String, Object> contextData = new HashMap<>();
    
    /**
     * 执行状态枚举
     */
    public enum ExecutionStatus {
        RUNNING,        // 运行中
        PAUSED,         // 已暂停
        WAITING,        // 等待中（等待用户输入或其他条件）
        COMPLETED,      // 已完成
        FAILED,         // 执行失败
        CANCELLED       // 已取消
    }
    
    /**
     * 等待类型枚举
     */
    public enum WaitType {
        CHOICE,         // 等待用户选择（ChoiceNode）
        WAIT,           // 等待其他条件（WaitNode）
        NONE            // 无等待
    }
    
    /**
     * 设置用户选择
     */
    public void setUserChoice(String optionId) {
        this.userChoiceOptionId = optionId;
        this.waitType = WaitType.NONE;
        this.waitingNodeId = null;
        // 如果当前状态是WAITING，恢复为RUNNING
        if (this.status == ExecutionStatus.WAITING) {
            this.status = ExecutionStatus.RUNNING;
        }
    }
    
    /**
     * 标记等待
     */
    public void setWaiting(String nodeId, WaitType type) {
        this.waitingNodeId = nodeId;
        this.waitType = type;
        this.status = ExecutionStatus.WAITING;
    }
    
    /**
     * 清除等待状态
     */
    public void clearWaiting() {
        this.waitingNodeId = null;
        this.waitType = WaitType.NONE;
        if (this.status == ExecutionStatus.WAITING) {
            this.status = ExecutionStatus.RUNNING;
        }
    }
    
    /**
     * 暂停执行
     */
    public void pause(String reason) {
        this.paused = true;
        this.pauseReason = reason;
        this.status = ExecutionStatus.PAUSED;
    }
    
    /**
     * 恢复执行
     */
    public void resume() {
        this.paused = false;
        this.pauseReason = null;
        if (this.status == ExecutionStatus.PAUSED) {
            this.status = ExecutionStatus.RUNNING;
        }
    }
    
    /**
     * 增加执行步骤数
     */
    public void incrementStepCount() {
        this.stepCount++;
    }
    
    /**
     * 设置上下文数据
     */
    public void putContextData(String key, Object value) {
        this.contextData.put(key, value);
    }
    
    /**
     * 获取上下文数据
     */
    @SuppressWarnings("unchecked")
    public <T> T getContextData(String key, Class<T> type) {
        Object value = this.contextData.get(key);
        if (value != null && type.isInstance(value)) {
            return (T) value;
        }
        return null;
    }
}
