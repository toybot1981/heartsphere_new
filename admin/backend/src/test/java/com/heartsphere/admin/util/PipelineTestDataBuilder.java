package com.heartsphere.admin.util;

import com.heartsphere.admin.entity.DeploymentPipeline;
import com.heartsphere.admin.entity.PipelineStep;
import com.heartsphere.admin.entity.SystemAdmin;

import java.util.ArrayList;
import java.util.List;

/**
 * 测试数据构建器
 * 用于快速创建测试数据
 */
public class PipelineTestDataBuilder {
    
    /**
     * 创建测试用的系统管理员
     */
    public static SystemAdmin createTestAdmin() {
        SystemAdmin admin = new SystemAdmin();
        admin.setUsername("test-admin");
        admin.setPassword("test-password");
        admin.setEmail("test@example.com");
        admin.setRole("ADMIN");
        admin.setIsActive(true);
        return admin;
    }
    
    /**
     * 创建测试用的流程模板
     */
    public static DeploymentPipeline createTestPipeline() {
        DeploymentPipeline pipeline = new DeploymentPipeline();
        pipeline.setName("测试流程");
        pipeline.setDescription("这是一个测试流程");
        pipeline.setEnvironment("test");
        pipeline.setProject("main");
        pipeline.setIsTemplate(false);
        return pipeline;
    }
    
    /**
     * 创建测试用的流程模板（指定环境）
     */
    public static DeploymentPipeline createTestPipeline(String environment) {
        DeploymentPipeline pipeline = createTestPipeline();
        pipeline.setEnvironment(environment);
        return pipeline;
    }
    
    /**
     * 创建测试用的流程模板（指定项目和环境）
     */
    public static DeploymentPipeline createTestPipeline(String project, String environment) {
        DeploymentPipeline pipeline = createTestPipeline();
        pipeline.setProject(project);
        pipeline.setEnvironment(environment);
        return pipeline;
    }
    
    /**
     * 创建测试用的流程步骤
     */
    public static PipelineStep createTestStep(DeploymentPipeline pipeline, String name, String scriptId, Integer order) {
        PipelineStep step = new PipelineStep();
        step.setPipeline(pipeline);
        step.setName(name);
        step.setScriptId(scriptId);
        step.setOrder(order);
        step.setParallel(false);
        step.setRequired(true);
        return step;
    }
    
    /**
     * 创建包含步骤的测试流程
     */
    public static DeploymentPipeline createTestPipelineWithSteps() {
        DeploymentPipeline pipeline = createTestPipeline();
        
        List<PipelineStep> steps = new ArrayList<>();
        steps.add(createTestStep(pipeline, "代码扫描", "code-scan-eslint", 1));
        steps.add(createTestStep(pipeline, "构建项目", "build-backend", 2));
        steps.add(createTestStep(pipeline, "部署应用", "deploy-backend-dev", 3));
        
        pipeline.setSteps(steps);
        return pipeline;
    }
    
    /**
     * 创建包含步骤的测试流程（指定项目和环境）
     */
    public static DeploymentPipeline createTestPipelineWithSteps(String project, String environment) {
        DeploymentPipeline pipeline = createTestPipeline(project, environment);
        
        List<PipelineStep> steps = new ArrayList<>();
        steps.add(createTestStep(pipeline, "代码扫描", "code-scan-eslint", 1));
        steps.add(createTestStep(pipeline, "构建项目", "build-backend", 2));
        steps.add(createTestStep(pipeline, "部署应用", "deploy-backend-dev", 3));
        
        pipeline.setSteps(steps);
        return pipeline;
    }
    
    /**
     * 创建测试用的流程执行记录
     */
    public static com.heartsphere.admin.entity.PipelineExecution createTestExecution(
            com.heartsphere.admin.entity.DeploymentPipeline pipeline,
            com.heartsphere.admin.entity.SystemAdmin executedBy) {
        com.heartsphere.admin.entity.PipelineExecution execution = new com.heartsphere.admin.entity.PipelineExecution();
        execution.setPipeline(pipeline);
        execution.setExecutedBy(executedBy);
        execution.setStatus(com.heartsphere.admin.entity.PipelineExecution.ExecutionStatus.RUNNING);
        execution.setStartedAt(java.time.LocalDateTime.now());
        return execution;
    }
}
