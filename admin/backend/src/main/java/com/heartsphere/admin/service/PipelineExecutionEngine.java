package com.heartsphere.admin.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.heartsphere.admin.config.ScriptConfigLoader;
import com.heartsphere.admin.dto.ScriptInfoDTO;
import com.heartsphere.admin.entity.*;
import com.heartsphere.admin.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

/**
 * 流程执行引擎
 */
@Component
public class PipelineExecutionEngine {
    
    private static final Logger logger = LoggerFactory.getLogger(PipelineExecutionEngine.class);
    
    @Autowired
    private DeploymentPipelineRepository pipelineRepository;
    
    @Autowired
    private PipelineExecutionRepository executionRepository;
    
    @Autowired
    private PipelineStepExecutionRepository stepExecutionRepository;
    
    @Autowired
    private ScriptExecutionRepository scriptExecutionRepository;
    
    @Autowired
    private ScriptExecutionEngine scriptExecutionEngine;
    
    @Autowired
    private ScriptConfigLoader scriptConfigLoader;
    
    @Autowired
    private ObjectMapper objectMapper;
    
    @Autowired(required = false)
    private PipelineStreamService pipelineStreamService;
    
    @Autowired(required = false)
    private CodeScanResultParser codeScanResultParser;
    
    @Autowired(required = false)
    private TestResultParser testResultParser;
    
    @Autowired(required = false)
    private QualityGateService qualityGateService;
    
    @Autowired(required = false)
    private com.heartsphere.admin.service.AutoFixService autoFixService;
    
    @Autowired(required = false)
    private com.heartsphere.admin.service.CMDBPipelineIntegrationService cmdbPipelineIntegrationService;
    
    // 存储正在执行的流程
    private final ConcurrentHashMap<Long, PipelineExecution> runningExecutions = new ConcurrentHashMap<>();
    
    /**
     * 异步执行流程
     */
    @Async
    public CompletableFuture<Void> executeAsync(PipelineExecution execution, Map<String, Object> globalParameters, List<Long> skipSteps) {
        return executeAsync(execution, globalParameters, skipSteps, null);
    }
    
    /**
     * 异步执行流程（带环境变量）
     */
    @Async
    public CompletableFuture<Void> executeAsync(PipelineExecution execution, Map<String, Object> globalParameters, List<Long> skipSteps, Map<String, String> environmentVariables) {
        try {
            execute(execution, globalParameters, skipSteps, environmentVariables);
        } catch (Exception e) {
            logger.error("Pipeline execution failed", e);
            // 如果流程执行失败时还没有创建步骤执行记录，创建一个错误步骤执行记录
            // 使用事务确保能保存错误步骤执行记录
            createErrorStepExecutionIfNeeded(execution.getId(), "流程执行失败: " + e.getMessage());
            updateExecutionStatus(execution.getId(), PipelineExecution.ExecutionStatus.FAILED);
        }
        return CompletableFuture.completedFuture(null);
    }
    
    /**
     * 创建错误步骤执行记录（如果不存在任何步骤执行记录）
     * 使用事务确保能保存
     */
    @Transactional
    private void createErrorStepExecutionIfNeeded(Long executionId, String errorMessage) {
        try {
            PipelineExecution execution = executionRepository.findById(executionId).orElse(null);
            if (execution == null) {
                logger.warn("Execution not found: {}", executionId);
                return;
            }
            
            List<PipelineStepExecution> existingSteps = stepExecutionRepository
                .findByPipelineExecutionIdOrderByStartedAtAsc(executionId);
            if (existingSteps == null || existingSteps.isEmpty()) {
                // 创建一个失败的步骤执行记录，用于显示错误信息
                PipelineStepExecution errorStepExecution = new PipelineStepExecution();
                errorStepExecution.setPipelineExecution(execution);
                errorStepExecution.setStatus(PipelineStepExecution.StepStatus.FAILED);
                errorStepExecution.setError(errorMessage);
                errorStepExecution.setStartedAt(LocalDateTime.now());
                errorStepExecution.setFinishedAt(LocalDateTime.now());
                stepExecutionRepository.save(errorStepExecution);
                logger.info("Created error step execution for execution: {}", executionId);
            } else {
                logger.info("Step executions already exist for execution: {}, count: {}", executionId, existingSteps.size());
            }
        } catch (Exception ex) {
            logger.error("Failed to create error step execution for execution: {}", executionId, ex);
        }
    }
    
    /**
     * 执行流程
     */
    @Transactional
    private void execute(PipelineExecution execution, Map<String, Object> globalParameters, List<Long> skipSteps, Map<String, String> environmentVariables) {
        DeploymentPipeline pipeline;
        try {
            // 重新加载 pipeline 以确保 steps 已加载（因为 executeAsync 可能在事务外）
            pipeline = pipelineRepository.findByIdWithSteps(execution.getPipeline().getId())
                    .orElseThrow(() -> new RuntimeException("流程模板不存在: " + execution.getPipeline().getId()));
            execution.setPipeline(pipeline); // 更新为已加载 steps 的 pipeline
        } catch (RuntimeException e) {
            // 如果加载 pipeline 失败，创建错误步骤执行记录
            logger.error("Failed to load pipeline: {}", execution.getPipeline().getId(), e);
            PipelineStepExecution errorStepExecution = new PipelineStepExecution();
            errorStepExecution.setPipelineExecution(execution);
            errorStepExecution.setStatus(PipelineStepExecution.StepStatus.FAILED);
            errorStepExecution.setError("无法加载流程模板: " + e.getMessage());
            errorStepExecution.setStartedAt(LocalDateTime.now());
            errorStepExecution.setFinishedAt(LocalDateTime.now());
            stepExecutionRepository.save(errorStepExecution);
            updateExecutionStatus(execution.getId(), PipelineExecution.ExecutionStatus.FAILED);
            throw e; // 重新抛出异常，让 executeAsync 的 catch 块也能处理
        }
        
        List<PipelineStep> steps = pipeline.getSteps();
        
        if (steps == null || steps.isEmpty()) {
            logger.warn("Pipeline {} (name: {}) has no steps", pipeline.getId(), pipeline.getName());
            // 创建一个失败的步骤执行记录，用于显示错误信息
            PipelineStepExecution errorStepExecution = new PipelineStepExecution();
            errorStepExecution.setPipelineExecution(execution);
            errorStepExecution.setStatus(PipelineStepExecution.StepStatus.FAILED);
            errorStepExecution.setError(String.format("流程模板 '%s' (ID: %d) 没有定义任何步骤。请在 DevOps 工作台 -> 部署流程中编辑该流程模板，添加至少一个步骤（如：代码扫描、构建、部署等）。", 
                pipeline.getName() != null ? pipeline.getName() : "未命名", pipeline.getId()));
            errorStepExecution.setStartedAt(LocalDateTime.now());
            errorStepExecution.setFinishedAt(LocalDateTime.now());
            stepExecutionRepository.save(errorStepExecution);
            updateExecutionStatus(execution.getId(), PipelineExecution.ExecutionStatus.FAILED);
            return;
        }
        
        // 按order排序
        steps = steps.stream()
                .sorted(Comparator.comparing(PipelineStep::getOrder))
                .collect(Collectors.toList());
        
        // 构建步骤依赖图
        Map<Integer, List<Integer>> dependencyGraph = buildDependencyGraph(steps);
        
        // 初始化步骤执行记录
        Map<Integer, PipelineStepExecution> stepExecutions = new HashMap<>();
        for (PipelineStep step : steps) {
            if (skipSteps != null && skipSteps.contains(step.getId())) {
                continue;
            }
            
            PipelineStepExecution stepExecution = new PipelineStepExecution();
            stepExecution.setPipelineExecution(execution);
            stepExecution.setStep(step);
            stepExecution.setStatus(PipelineStepExecution.StepStatus.PENDING);
            stepExecution = stepExecutionRepository.save(stepExecution);
            stepExecutions.put(step.getOrder(), stepExecution);
        }
        
        // 执行步骤
        Set<Integer> completedSteps = new HashSet<>();
        Set<Integer> runningSteps = new HashSet<>();
        
        while (completedSteps.size() < stepExecutions.size()) {
            // 查找可以执行的步骤（依赖已完成的步骤）
            List<Integer> readySteps = findReadySteps(stepExecutions.keySet(), completedSteps, runningSteps, dependencyGraph);
            
            if (readySteps.isEmpty()) {
                // 检查是否有正在执行的步骤
                if (runningSteps.isEmpty()) {
                    // 所有步骤已完成或被阻塞
                    break;
                }
                // 等待正在执行的步骤完成
                try {
                    Thread.sleep(1000);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    break;
                }
                continue;
            }
            
            // 执行可并行执行的步骤
            List<CompletableFuture<Void>> futures = new ArrayList<>();
            for (Integer stepOrder : readySteps) {
                PipelineStepExecution stepExecution = stepExecutions.get(stepOrder);
                PipelineStep step = stepExecution.getStep();
                
                // 检查执行条件
                if (!checkCondition(step, stepExecutions, completedSteps)) {
                    stepExecution.setStatus(PipelineStepExecution.StepStatus.SKIPPED);
                    stepExecution.setFinishedAt(LocalDateTime.now());
                    stepExecutionRepository.save(stepExecution);
                    completedSteps.add(stepOrder);
                    continue;
                }
                
                runningSteps.add(stepOrder);
                stepExecution.setStatus(PipelineStepExecution.StepStatus.RUNNING);
                stepExecution.setStartedAt(LocalDateTime.now());
                stepExecutionRepository.save(stepExecution);
                
                // 推送步骤状态更新
                if (pipelineStreamService != null) {
                    pipelineStreamService.pushStepStatus(execution.getId(), step.getId(), 
                            "RUNNING", step.getName());
                }
                
                // 异步执行步骤
                CompletableFuture<Void> future = CompletableFuture.runAsync(() -> {
                    try {
                        executeStep(stepExecution, step, globalParameters, environmentVariables);
                    } catch (Exception e) {
                        logger.error("Step execution failed: {}", stepOrder, e);
                        stepExecution.setStatus(PipelineStepExecution.StepStatus.FAILED);
                        stepExecution.setError(e.getMessage());
                        stepExecution.setFinishedAt(LocalDateTime.now());
                        stepExecution.calculateDuration();
                        stepExecutionRepository.save(stepExecution);
                    }
                });
                
                future.thenRun(() -> {
                    runningSteps.remove(stepOrder);
                    completedSteps.add(stepOrder);
                    
                    // 检查是否需要停止流程
                    PipelineStepExecution updated = stepExecutionRepository.findById(stepExecution.getId()).orElse(stepExecution);
                    if (updated.getStatus() == PipelineStepExecution.StepStatus.FAILED && step.getRequired()) {
                        // 必需步骤失败，停止流程
                        updateExecutionStatus(execution.getId(), PipelineExecution.ExecutionStatus.FAILED);
                    }
                });
                
                futures.add(future);
                
                // 如果不是并行执行，等待当前步骤完成
                if (!step.getParallel()) {
                    try {
                        future.get();
                    } catch (Exception e) {
                        logger.error("Failed to wait for step execution", e);
                    }
                }
            }
            
            // 等待所有并行步骤完成
            if (!futures.isEmpty()) {
                CompletableFuture.allOf(futures.toArray(new CompletableFuture[0])).join();
            }
        }
        
        // 检查流程执行状态
        PipelineExecution updatedExecution = executionRepository.findById(execution.getId()).orElse(execution);
        if (updatedExecution.getStatus() == PipelineExecution.ExecutionStatus.RUNNING) {
            // 检查是否有失败的必需步骤
            boolean hasFailedRequiredStep = stepExecutions.values().stream()
                    .anyMatch(se -> se.getStatus() == PipelineStepExecution.StepStatus.FAILED 
                            && se.getStep().getRequired());
            
            if (hasFailedRequiredStep) {
                updateExecutionStatus(execution.getId(), PipelineExecution.ExecutionStatus.FAILED);
                
                // 如果流程失败，尝试自动修复
                if (autoFixService != null) {
                    try {
                        logger.info("流程执行失败，尝试自动修复: {}", execution.getId());
                        autoFixService.detectAndFix(updatedExecution);
                    } catch (Exception e) {
                        logger.error("自动修复失败", e);
                    }
                }
            } else {
                // 所有步骤都成功完成
                updateExecutionStatus(execution.getId(), PipelineExecution.ExecutionStatus.SUCCESS);
                
                // 如果部署成功，记录到 CMDB
                if (cmdbPipelineIntegrationService != null) {
                    try {
                        // TODO: 从执行参数中获取资产ID
                        // Long assetId = getAssetIdFromParameters(globalParameters);
                        // if (assetId != null) {
                        //     cmdbPipelineIntegrationService.recordDeploymentToAsset(updatedExecution, assetId);
                        // }
                        logger.info("CMDB 集成服务可用，但未配置资产ID");
                    } catch (Exception e) {
                        logger.error("记录部署到 CMDB 失败", e);
                    }
                }
            }
        }
    }
    
    /**
     * 构建依赖图
     */
    private Map<Integer, List<Integer>> buildDependencyGraph(List<PipelineStep> steps) {
        Map<Integer, List<Integer>> graph = new HashMap<>();
        
        for (PipelineStep step : steps) {
            List<Integer> dependencies = new ArrayList<>();
            if (step.getDependsOn() != null) {
                try {
                    List<Integer> dependsOn = objectMapper.readValue(step.getDependsOn(), 
                            new TypeReference<List<Integer>>() {});
                    dependencies.addAll(dependsOn);
                } catch (Exception e) {
                    logger.warn("Failed to parse dependsOn for step {}", step.getId(), e);
                }
            }
            graph.put(step.getOrder(), dependencies);
        }
        
        return graph;
    }
    
    /**
     * 查找可以执行的步骤
     */
    private List<Integer> findReadySteps(Set<Integer> allSteps, Set<Integer> completedSteps, 
                                         Set<Integer> runningSteps, Map<Integer, List<Integer>> dependencyGraph) {
        List<Integer> readySteps = new ArrayList<>();
        
        for (Integer stepOrder : allSteps) {
            if (completedSteps.contains(stepOrder) || runningSteps.contains(stepOrder)) {
                continue;
            }
            
            List<Integer> dependencies = dependencyGraph.get(stepOrder);
            if (dependencies == null || dependencies.isEmpty()) {
                // 无依赖，可以执行
                readySteps.add(stepOrder);
            } else {
                // 检查依赖是否都已完成
                boolean allDependenciesCompleted = dependencies.stream()
                        .allMatch(completedSteps::contains);
                
                if (allDependenciesCompleted) {
                    readySteps.add(stepOrder);
                }
            }
        }
        
        return readySteps;
    }
    
    /**
     * 检查执行条件
     */
    private boolean checkCondition(PipelineStep step, Map<Integer, PipelineStepExecution> stepExecutions, 
                                   Set<Integer> completedSteps) {
        if (step.getCondition() == null || step.getCondition().isEmpty()) {
            return true;
        }
        
        // 简单的条件检查：previous_step.success
        if (step.getCondition().equals("previous_step.success")) {
            // 检查前置步骤是否成功
            List<Integer> dependencies = new ArrayList<>();
            if (step.getDependsOn() != null) {
                try {
                    dependencies = objectMapper.readValue(step.getDependsOn(), 
                            new TypeReference<List<Integer>>() {});
                } catch (Exception e) {
                    logger.warn("Failed to parse dependsOn", e);
                }
            }
            
            for (Integer depOrder : dependencies) {
                PipelineStepExecution depExecution = stepExecutions.get(depOrder);
                if (depExecution != null && depExecution.getStatus() != PipelineStepExecution.StepStatus.SUCCESS) {
                    return false;
                }
            }
        }
        
        return true;
    }
    
    /**
     * 执行单个步骤（带环境变量）
     */
    private void executeStep(PipelineStepExecution stepExecution, PipelineStep step, 
                            Map<String, Object> globalParameters, Map<String, String> environmentVariables) {
        try {
            // 获取脚本信息
            ScriptInfoDTO script = scriptConfigLoader.getScript(step.getScriptId());
            if (script == null) {
                throw new RuntimeException("脚本不存在: " + step.getScriptId());
            }
            
            // 合并参数（步骤参数 + 全局参数）
            Map<String, Object> parameters = new HashMap<>();
            if (step.getParameters() != null) {
                try {
                    Map<String, Object> stepParams = objectMapper.readValue(step.getParameters(), 
                            new TypeReference<Map<String, Object>>() {});
                    parameters.putAll(stepParams);
                } catch (Exception e) {
                    logger.warn("Failed to parse step parameters", e);
                }
            }
            if (globalParameters != null) {
                parameters.putAll(globalParameters);
            }
            
            // 创建脚本执行记录
            ScriptExecution scriptExecution = new ScriptExecution();
            scriptExecution.setScriptId(step.getScriptId());
            scriptExecution.setScriptName(script.getName());
            scriptExecution.setExecutedBy(stepExecution.getPipelineExecution().getExecutedBy());
            scriptExecution.setStatus(ScriptExecution.ExecutionStatus.RUNNING);
            scriptExecution.setStartedAt(LocalDateTime.now());
            
            try {
                scriptExecution.setParameters(objectMapper.writeValueAsString(parameters));
            } catch (Exception e) {
                logger.warn("Failed to serialize parameters", e);
            }
            
            scriptExecution = scriptExecutionRepository.save(scriptExecution);
            
            // 关联脚本执行记录
            stepExecution.setScriptExecution(scriptExecution);
            stepExecutionRepository.save(stepExecution);
            
            // 执行脚本（同步执行，等待完成，传递环境变量）
            scriptExecutionEngine.executeAsync(scriptExecution, script, parameters, environmentVariables).join();
            
            // 更新步骤执行状态
            scriptExecution = scriptExecutionRepository.findById(scriptExecution.getId()).orElse(scriptExecution);
            if (scriptExecution.getStatus() == ScriptExecution.ExecutionStatus.SUCCESS) {
                stepExecution.setStatus(PipelineStepExecution.StepStatus.SUCCESS);
                
                // 解析代码扫描结果（如果步骤是代码扫描）
                if (codeScanResultParser != null && isCodeScanStep(step)) {
                    try {
                        String output = scriptExecution.getOutput();
                        if (output != null) {
                            codeScanResultParser.parseFromScriptOutput(
                                stepExecution.getPipelineExecution(),
                                step.getScriptId(),
                                output
                            );
                        }
                    } catch (Exception e) {
                        logger.warn("Failed to parse code scan result", e);
                    }
                }
                
                // 解析测试结果（如果步骤是测试）
                if (testResultParser != null && isTestStep(step)) {
                    try {
                        String output = scriptExecution.getOutput();
                        if (output != null) {
                            testResultParser.parseFromScriptOutput(
                                stepExecution.getPipelineExecution(),
                                step.getScriptId(),
                                output
                            );
                        }
                    } catch (Exception e) {
                        logger.warn("Failed to parse test result", e);
                    }
                }
                
            } else if (scriptExecution.getStatus() == ScriptExecution.ExecutionStatus.FAILED) {
                stepExecution.setStatus(PipelineStepExecution.StepStatus.FAILED);
                stepExecution.setError(scriptExecution.getError());
            } else if (scriptExecution.getStatus() == ScriptExecution.ExecutionStatus.CANCELLED) {
                stepExecution.setStatus(PipelineStepExecution.StepStatus.CANCELLED);
            }
            
            stepExecution.setFinishedAt(LocalDateTime.now());
            stepExecution.calculateDuration();
            stepExecutionRepository.save(stepExecution);
            
            // 如果是质量门禁步骤，评估质量门禁
            if (qualityGateService != null && isQualityGateStep(step) && 
                scriptExecution.getStatus() == ScriptExecution.ExecutionStatus.SUCCESS) {
                try {
                    QualityGateService.QualityGateResult gateResult = qualityGateService.evaluateQualityGate(
                        stepExecution.getPipelineExecution()
                    );
                    if (!gateResult.isPassed()) {
                        stepExecution.setStatus(PipelineStepExecution.StepStatus.FAILED);
                        stepExecution.setError("质量门禁未通过: " + String.join(", ", gateResult.getMessages()));
                        stepExecutionRepository.save(stepExecution);
                        // 如果质量门禁失败且步骤是必需的，停止流程
                        if (step.getRequired()) {
                            updateExecutionStatus(stepExecution.getPipelineExecution().getId(), PipelineExecution.ExecutionStatus.FAILED);
                        }
                    }
                } catch (Exception e) {
                    logger.error("Failed to evaluate quality gate", e);
                }
            }
            
            // 推送步骤状态更新
            if (pipelineStreamService != null) {
                PipelineExecution currentExecution = stepExecution.getPipelineExecution();
                if (currentExecution != null) {
                    pipelineStreamService.pushStepStatus(currentExecution.getId(), step.getId(), 
                            stepExecution.getStatus().name(), step.getName());
                }
            }
            
        } catch (Exception e) {
            logger.error("Failed to execute step: {}", step.getId(), e);
            stepExecution.setStatus(PipelineStepExecution.StepStatus.FAILED);
            stepExecution.setError(e.getMessage());
            stepExecution.setFinishedAt(LocalDateTime.now());
            stepExecution.calculateDuration();
            stepExecutionRepository.save(stepExecution);
            throw e;
        }
    }
    
    /**
     * 判断步骤是否为代码扫描步骤
     */
    private boolean isCodeScanStep(PipelineStep step) {
        String scriptId = step.getScriptId().toLowerCase();
        return scriptId.contains("eslint") || 
               scriptId.contains("checkstyle") || 
               scriptId.contains("sonar") ||
               scriptId.contains("scan");
    }
    
    /**
     * 判断步骤是否为测试步骤
     */
    private boolean isTestStep(PipelineStep step) {
        String scriptId = step.getScriptId().toLowerCase();
        return scriptId.contains("test") || 
               scriptId.contains("maven") ||
               scriptId.contains("jest") ||
               scriptId.contains("vitest");
    }
    
    /**
     * 判断步骤是否为质量门禁步骤
     */
    private boolean isQualityGateStep(PipelineStep step) {
        String name = step.getName().toLowerCase();
        return name.contains("quality") || 
               name.contains("gate") ||
               name.contains("质量");
    }
    
    /**
     * 更新流程执行状态
     */
    private void updateExecutionStatus(Long executionId, PipelineExecution.ExecutionStatus status) {
        PipelineExecution execution = executionRepository.findById(executionId).orElse(null);
        if (execution != null) {
            execution.setStatus(status);
            if (status != PipelineExecution.ExecutionStatus.RUNNING) {
                execution.setFinishedAt(LocalDateTime.now());
                execution.calculateDuration();
                runningExecutions.remove(executionId);
            }
            executionRepository.save(execution);
            
            // 推送流程状态更新
            if (pipelineStreamService != null) {
                pipelineStreamService.pushStatus(executionId, status.name());
                
                // 如果流程完成，推送完整执行数据
                if (status != PipelineExecution.ExecutionStatus.RUNNING) {
                    try {
                        Map<String, Object> executionData = new java.util.HashMap<>();
                        executionData.put("id", execution.getId());
                        executionData.put("status", status.name());
                        executionData.put("finishedAt", execution.getFinishedAt());
                        executionData.put("durationSeconds", execution.getDurationSeconds());
                        pipelineStreamService.pushExecutionUpdate(executionId, executionData);
                        pipelineStreamService.cleanup(executionId);
                    } catch (Exception e) {
                        logger.warn("Failed to push final execution update", e);
                    }
                }
            }
        }
    }
    
    /**
     * 取消流程执行
     */
    public void cancelExecution(Long executionId) {
        PipelineExecution execution = executionRepository.findById(executionId).orElse(null);
        if (execution != null && execution.getStatus() == PipelineExecution.ExecutionStatus.RUNNING) {
            // 取消所有正在执行的步骤
            List<PipelineStepExecution> allSteps = stepExecutionRepository
                    .findByPipelineExecutionIdOrderByStartedAtAsc(executionId);
            List<PipelineStepExecution> runningSteps = allSteps.stream()
                    .filter(se -> se.getStatus() == PipelineStepExecution.StepStatus.RUNNING)
                    .collect(Collectors.toList());
            
            for (PipelineStepExecution stepExecution : runningSteps) {
                if (stepExecution.getScriptExecution() != null) {
                    // 尝试取消脚本执行（如果 ScriptExecutionEngine 支持）
                    try {
                        // 通过更新状态来取消（ScriptExecutionEngine 会检查状态）
                        ScriptExecution scriptExecution = stepExecution.getScriptExecution();
                        if (scriptExecution.getStatus() == ScriptExecution.ExecutionStatus.RUNNING) {
                            scriptExecution.setStatus(ScriptExecution.ExecutionStatus.CANCELLED);
                            scriptExecution.setFinishedAt(LocalDateTime.now());
                            scriptExecutionRepository.save(scriptExecution);
                        }
                    } catch (Exception e) {
                        logger.warn("Failed to cancel script execution: {}", stepExecution.getScriptExecution().getId(), e);
                    }
                }
                stepExecution.setStatus(PipelineStepExecution.StepStatus.CANCELLED);
                stepExecution.setFinishedAt(LocalDateTime.now());
                stepExecutionRepository.save(stepExecution);
            }
            
            updateExecutionStatus(executionId, PipelineExecution.ExecutionStatus.CANCELLED);
        }
    }
}
