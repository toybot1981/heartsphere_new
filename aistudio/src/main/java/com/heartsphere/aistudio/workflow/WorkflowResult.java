package com.heartsphere.aistudio.workflow;

import lombok.Data;
import java.util.HashMap;
import java.util.Map;

/**
 * 工作流执行结果
 */
@Data
public class WorkflowResult {
    private String workflowId;
    private String workflowType;
    private boolean success;
    private String error;
    private Map<String, Object> stepResults = new HashMap<>();
    private Object finalResult;
    
    public void addStepResult(String stepId, Object result) {
        stepResults.put(stepId, result);
    }
}

