package com.heartsphere.aistudio.workflow;

import lombok.Data;
import java.time.LocalDateTime;

/**
 * 工作流进度信息
 */
@Data
public class WorkflowProgress {
    /**
     * 工作流 ID
     */
    private String workflowId;
    
    /**
     * 当前步骤编号（从1开始）
     */
    private int currentStep;
    
    /**
     * 总步骤数
     */
    private int totalSteps;
    
    /**
     * 当前步骤名称
     */
    private String currentStepName;
    
    /**
     * 进度百分比（0-100）
     */
    private int progress;
    
    /**
     * 步骤状态：running, completed, failed
     */
    private String status;
    
    /**
     * 步骤结果
     */
    private Object stepResult;
    
    /**
     * 错误信息
     */
    private String error;
    
    /**
     * 更新时间
     */
    private LocalDateTime updateTime;
    
    /**
     * 是否完成
     */
    private boolean completed;
    
    /**
     * 最终结果
     */
    private Object finalResult;
    
    public WorkflowProgress() {
        this.updateTime = LocalDateTime.now();
        this.status = "running";
        this.completed = false;
    }
    
    public static WorkflowProgress create(String workflowId, int totalSteps) {
        WorkflowProgress progress = new WorkflowProgress();
        progress.setWorkflowId(workflowId);
        progress.setTotalSteps(totalSteps);
        progress.setCurrentStep(0);
        progress.setProgress(0);
        return progress;
    }
    
    public void updateStep(int step, String stepName, String status) {
        this.currentStep = step;
        this.currentStepName = stepName;
        this.status = status;
        // 计算进度：已完成步骤数 / 总步骤数 * 100
        if (totalSteps > 0) {
            this.progress = (int) ((step * 100.0) / totalSteps);
        } else {
            this.progress = 0;
        }
        this.updateTime = LocalDateTime.now();
    }
    
    public void complete(Object finalResult) {
        this.completed = true;
        this.status = "completed";
        this.progress = 100;
        this.finalResult = finalResult;
        this.updateTime = LocalDateTime.now();
    }
    
    public void fail(String error) {
        this.completed = true;
        this.status = "failed";
        this.error = error;
        this.updateTime = LocalDateTime.now();
    }
}

