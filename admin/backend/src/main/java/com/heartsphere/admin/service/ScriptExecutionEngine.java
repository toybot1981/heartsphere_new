package com.heartsphere.admin.service;

import com.heartsphere.admin.dto.ScriptInfoDTO;
import com.heartsphere.admin.entity.ScriptExecution;
import com.heartsphere.admin.repository.ScriptExecutionRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

import java.io.*;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

/**
 * 脚本执行引擎
 */
@Component
public class ScriptExecutionEngine {
    
    private static final Logger logger = LoggerFactory.getLogger(ScriptExecutionEngine.class);
    
    @Autowired
    private ScriptExecutionRepository scriptExecutionRepository;
    
    @Autowired(required = false)
    private LogStreamService logStreamService;
    
    @Value("${project.root:}")
    private String projectRoot;
    
    // 存储正在执行的进程
    private final java.util.concurrent.ConcurrentHashMap<Long, Process> runningProcesses = new java.util.concurrent.ConcurrentHashMap<>();
    
    @Autowired(required = false)
    private EnvironmentVariableService environmentVariableService;
    
    /**
     * 异步执行脚本
     */
    @Async
    public CompletableFuture<Void> executeAsync(ScriptExecution execution, ScriptInfoDTO script, Map<String, Object> parameters) {
        try {
            execute(execution, script, parameters, null);
        } catch (Exception e) {
            logger.error("Script execution failed", e);
            updateExecutionStatus(execution.getId(), ScriptExecution.ExecutionStatus.FAILED, null, e.getMessage(), -1);
        }
        return CompletableFuture.completedFuture(null);
    }
    
    /**
     * 异步执行脚本（带环境变量）
     */
    @Async
    public CompletableFuture<Void> executeAsync(ScriptExecution execution, ScriptInfoDTO script, Map<String, Object> parameters, Map<String, String> environmentVariables) {
        try {
            execute(execution, script, parameters, environmentVariables);
        } catch (Exception e) {
            logger.error("Script execution failed", e);
            updateExecutionStatus(execution.getId(), ScriptExecution.ExecutionStatus.FAILED, null, e.getMessage(), -1);
        }
        return CompletableFuture.completedFuture(null);
    }
    
    /**
     * 执行脚本
     */
    private void execute(ScriptExecution execution, ScriptInfoDTO script, Map<String, Object> parameters, Map<String, String> providedEnvVars) {
        String scriptPath = script.getScript();
        Path logFilePath = createLogFile(execution.getId());
        
        try {
            // 构建命令
            ProcessBuilder processBuilder = new ProcessBuilder();
            
            // 确定工作目录：自动检测项目根目录
            File workingDir;
            if (projectRoot != null && !projectRoot.isEmpty()) {
                workingDir = new File(projectRoot);
            } else {
                // 自动检测项目根目录
                // 从当前工作目录开始，向上查找包含 scripts 目录的目录
                File currentDir = new File(System.getProperty("user.dir"));
                workingDir = findProjectRoot(currentDir);
                
                // 如果找不到，尝试从当前目录向上查找（处理从 admin/backend 启动的情况）
                if (workingDir == null) {
                    File searchDir = currentDir;
                    int maxDepth = 5;
                    int depth = 0;
                    
                    while (searchDir != null && depth < maxDepth) {
                        File scriptsDir = new File(searchDir, "scripts");
                        if (scriptsDir.exists() && scriptsDir.isDirectory()) {
                            workingDir = searchDir;
                            logger.info("向上查找找到项目根目录: {}", workingDir.getAbsolutePath());
                            break;
                        }
                        searchDir = searchDir.getParentFile();
                        depth++;
                    }
                }
                
                if (workingDir == null) {
                    // 最后使用当前工作目录
                    workingDir = currentDir;
                    logger.warn("无法自动检测项目根目录，使用当前工作目录: {}", workingDir.getAbsolutePath());
                } else {
                    logger.info("使用项目根目录: {}", workingDir.getAbsolutePath());
                }
            }
            
            // 验证工作目录中是否有 scripts 目录
            File scriptsDir = new File(workingDir, "scripts");
            if (!scriptsDir.exists() || !scriptsDir.isDirectory()) {
                logger.warn("工作目录 {} 中没有找到 scripts 目录，脚本可能无法执行", workingDir.getAbsolutePath());
            }
            
            processBuilder.directory(workingDir);
            
            // 处理脚本路径：脚本统一在 scripts 目录下
            // 如果脚本路径以 scripts/ 开头，直接使用；否则添加 scripts/ 前缀
            String normalizedScriptPath = scriptPath;
            if (!scriptPath.startsWith("scripts/") && !scriptPath.startsWith("/")) {
                normalizedScriptPath = "scripts/" + scriptPath;
            } else if (scriptPath.startsWith("/")) {
                // 绝对路径，直接使用
                normalizedScriptPath = scriptPath;
            }
            
            // 从项目根目录查找脚本
            File scriptFile = new File(workingDir, normalizedScriptPath);
            
            // 如果找不到，尝试直接使用原始路径
            if (!scriptFile.exists()) {
                scriptFile = new File(workingDir, scriptPath);
            }
            
            // 如果还是找不到，尝试从当前工作目录查找
            if (!scriptFile.exists()) {
                scriptFile = new File(scriptPath);
            }
            
            // 如果还是找不到，尝试从系统属性 user.dir 查找
            if (!scriptFile.exists()) {
                File userDir = new File(System.getProperty("user.dir"));
                scriptFile = new File(userDir, normalizedScriptPath);
            }
            
            // 如果还是找不到，尝试规范化路径（处理相对路径问题）
            if (!scriptFile.exists() && !normalizedScriptPath.startsWith("/")) {
                try {
                    Path normalizedPath = Paths.get(workingDir.getAbsolutePath(), normalizedScriptPath).normalize();
                    scriptFile = normalizedPath.toFile();
                } catch (Exception e) {
                    logger.info("规范化路径失败: {}", e.getMessage());
                }
            }
            
            if (!scriptFile.exists()) {
                throw new IOException("脚本文件不存在: " + scriptFile.getAbsolutePath() + 
                        " (工作目录: " + workingDir.getAbsolutePath() + ", 脚本路径: " + scriptPath + 
                        ", 规范化路径: " + normalizedScriptPath + 
                        ", 当前工作目录: " + System.getProperty("user.dir") + ")");
            }
            
            logger.info("找到脚本文件: {} (原始路径: {}, 工作目录: {})", 
                    scriptFile.getAbsolutePath(), scriptPath, workingDir.getAbsolutePath());
            
            // 确保脚本有执行权限
            if (scriptFile.exists() && !scriptFile.canExecute()) {
                scriptFile.setExecutable(true);
            }
            
            // 设置环境变量
            Map<String, String> env = processBuilder.environment();
            
            // 1. 首先从系统解析环境变量（如果启用了环境变量服务）
            if (environmentVariableService != null) {
                try {
                    // 从参数中提取项目、模块、环境信息
                    String project = parameters != null ? (String) parameters.get("module") : null;
                    String module = parameters != null ? (String) parameters.get("module") : null;
                    String environment = script.getEnvironments() != null && !script.getEnvironments().isEmpty() 
                        ? script.getEnvironments().get(0) : "dev";
                    
                    // 解析环境变量（按作用域优先级）
                    Map<String, String> resolvedVars = environmentVariableService.resolveVariables(
                        project, module, null, environment);
                    env.putAll(resolvedVars);
                    logger.info("已解析 {} 个环境变量", resolvedVars.size());
                } catch (Exception e) {
                    logger.warn("解析环境变量失败: {}", e.getMessage());
                }
            }
            
            // 2. 然后应用用户提供的环境变量（覆盖解析的变量）
            if (providedEnvVars != null && !providedEnvVars.isEmpty()) {
                env.putAll(providedEnvVars);
                logger.info("已应用 {} 个用户提供的环境变量", providedEnvVars.size());
            }
            
            // 3. 最后设置脚本参数作为环境变量（向后兼容）
            if (parameters != null) {
                for (Map.Entry<String, Object> entry : parameters.entrySet()) {
                    env.put("SCRIPT_PARAM_" + entry.getKey().toUpperCase(), String.valueOf(entry.getValue()));
                }
            }
            
            // 构建脚本参数（按顺序传递）
            List<String> command = new ArrayList<>();
            if ("shell".equals(script.getType())) {
                command.add("bash");
                command.add(scriptFile.getAbsolutePath());
                
                // 添加位置参数（按参数定义顺序）
                if (script.getParameters() != null && parameters != null) {
                    for (ScriptInfoDTO.ScriptParameter paramDef : script.getParameters()) {
                        Object paramValue = parameters.get(paramDef.getName());
                        if (paramValue != null) {
                            command.add(String.valueOf(paramValue));
                        }
                    }
                }
            } else {
                command.add(scriptFile.getAbsolutePath());
            }
            
            processBuilder.command(command);
            
            logger.info("执行脚本: {} 工作目录: {} 命令: {}", 
                    scriptFile.getAbsolutePath(), workingDir.getAbsolutePath(), command);
            
            // 设置超时
            int timeout = script.getTimeout() != null ? script.getTimeout() : 3600;
            
            // 执行脚本
            Process process = processBuilder.start();
            
            // 存储进程引用以便取消
            runningProcesses.put(execution.getId(), process);
            
            // 收集输出
            StringBuilder output = new StringBuilder();
            StringBuilder error = new StringBuilder();
            
            try (BufferedReader stdoutReader = new BufferedReader(new InputStreamReader(process.getInputStream()));
                 BufferedReader stderrReader = new BufferedReader(new InputStreamReader(process.getErrorStream()));
                 PrintWriter logWriter = new PrintWriter(Files.newBufferedWriter(logFilePath))) {
                
                // 读取输出
                CompletableFuture<Void> stdoutFuture = CompletableFuture.runAsync(() -> {
                    try {
                        String line;
                        while ((line = stdoutReader.readLine()) != null) {
                            output.append(line).append("\n");
                            logWriter.println(line);
                            logWriter.flush();
                            
                            // 实时推送到 SSE
                            if (logStreamService != null) {
                                logStreamService.pushLog(execution.getId(), line, "INFO");
                            }
                        }
                    } catch (IOException e) {
                        logger.error("Error reading stdout", e);
                    }
                });
                
                CompletableFuture<Void> stderrFuture = CompletableFuture.runAsync(() -> {
                    try {
                        String line;
                        while ((line = stderrReader.readLine()) != null) {
                            error.append(line).append("\n");
                            logWriter.println("[ERROR] " + line);
                            logWriter.flush();
                            
                            // 实时推送到 SSE
                            if (logStreamService != null) {
                                logStreamService.pushLog(execution.getId(), line, "ERROR");
                            }
                        }
                    } catch (IOException e) {
                        logger.error("Error reading stderr", e);
                    }
                });
                
                // 等待进程完成或超时
                boolean finished = process.waitFor(timeout, java.util.concurrent.TimeUnit.SECONDS);
                
                if (!finished) {
                    process.destroyForcibly();
                    ScriptExecution.ExecutionStatus timeoutStatus = ScriptExecution.ExecutionStatus.FAILED;
                    updateExecutionStatus(execution.getId(), timeoutStatus, 
                            output.toString(), "执行超时", -1);
                    
                    // 推送超时状态并清理连接
                    if (logStreamService != null) {
                        logStreamService.pushStatus(execution.getId(), timeoutStatus.name());
                        logStreamService.cleanup(execution.getId());
                    }
                    return;
                }
                
                stdoutFuture.join();
                stderrFuture.join();
                
                int exitCode = process.exitValue();
                String outputStr = output.toString();
                String errorStr = error.toString();
                
                ScriptExecution.ExecutionStatus finalStatus;
                if (exitCode == 0) {
                    finalStatus = ScriptExecution.ExecutionStatus.SUCCESS;
                } else {
                    finalStatus = ScriptExecution.ExecutionStatus.FAILED;
                }
                
                updateExecutionStatus(execution.getId(), finalStatus, outputStr, errorStr, exitCode);
                
                // 推送最终状态并清理连接
                if (logStreamService != null) {
                    logStreamService.pushStatus(execution.getId(), finalStatus.name());
                    logStreamService.cleanup(execution.getId());
                }
            }
            
        } catch (Exception e) {
            logger.error("Failed to execute script", e);
            ScriptExecution.ExecutionStatus errorStatus = ScriptExecution.ExecutionStatus.FAILED;
            updateExecutionStatus(execution.getId(), errorStatus, 
                    null, e.getMessage(), -1);
            
            // 推送错误状态并清理连接
            if (logStreamService != null) {
                logStreamService.pushStatus(execution.getId(), errorStatus.name());
                logStreamService.cleanup(execution.getId());
            }
        } finally {
            // 移除进程引用
            runningProcesses.remove(execution.getId());
        }
    }
    
    /**
     * 取消执行
     */
    public void cancelExecution(Long executionId) {
        Process process = runningProcesses.get(executionId);
        if (process != null && process.isAlive()) {
            process.destroyForcibly();
            runningProcesses.remove(executionId);
            logger.info("Cancelled script execution: {}", executionId);
            
            // 推送取消状态并清理连接
            if (logStreamService != null) {
                logStreamService.pushStatus(executionId, "CANCELLED");
                logStreamService.cleanup(executionId);
            }
        }
    }
    
    /**
     * 创建日志文件
     */
    private Path createLogFile(Long executionId) {
        try {
            Path logsDir = Paths.get("logs", "script-executions");
            Files.createDirectories(logsDir);
            return logsDir.resolve("execution-" + executionId + ".log");
        } catch (IOException e) {
            logger.error("Failed to create log file", e);
            return null;
        }
    }
    
    /**
     * 查找项目根目录（包含 scripts 目录的目录）
     * 优先查找包含 scripts/server、scripts/scan、scripts/test 等子目录的目录
     * 这样可以确保找到的是真正的项目根目录，而不是 admin/backend 这样的子目录
     */
    private File findProjectRoot(File startDir) {
        File current = startDir;
        int maxDepth = 10; // 最多向上查找 10 层
        int depth = 0;
        
        while (current != null && depth < maxDepth) {
            File scriptsDir = new File(current, "scripts");
            if (scriptsDir.exists() && scriptsDir.isDirectory()) {
                // 验证 scripts 目录中是否有常见的子目录（server, scan, test 等）
                // 这样可以确保找到的是真正的项目根目录，而不是 admin/backend 这样的子目录
                File serverDir = new File(scriptsDir, "server");
                File scanDir = new File(scriptsDir, "scan");
                File testDir = new File(scriptsDir, "test");
                
                // 如果 scripts 目录中有这些子目录，说明这是项目根目录
                if (serverDir.exists() || scanDir.exists() || testDir.exists()) {
                    return current;
                }
            }
            current = current.getParentFile();
            depth++;
        }
        
        return null;
    }
    
    /**
     * 更新执行状态
     */
    /**
     * 最大输出/错误信息大小（5MB）
     * 超过此大小的输出不会保存到数据库，仅保存到日志文件
     */
    private static final int MAX_OUTPUT_SIZE = 5 * 1024 * 1024; // 5MB

    private void updateExecutionStatus(Long executionId, ScriptExecution.ExecutionStatus status, 
                                      String output, String error, Integer exitCode) {
        ScriptExecution execution = scriptExecutionRepository.findById(executionId)
                .orElse(null);
        
        if (execution != null) {
            execution.setStatus(status);
            execution.setFinishedAt(LocalDateTime.now());
            
            // 限制输出大小，避免数据库溢出
            if (output != null && output.length() > MAX_OUTPUT_SIZE) {
                logger.warn("Script output is too large ({}), truncating to {} bytes", 
                        output.length(), MAX_OUTPUT_SIZE);
                // 保存最后 5MB 的输出
                execution.setOutput("[...截断...]\n" + output.substring(output.length() - MAX_OUTPUT_SIZE));
            } else {
                execution.setOutput(output);
            }
            
            if (error != null && error.length() > MAX_OUTPUT_SIZE) {
                logger.warn("Script error is too large ({}), truncating to {} bytes", 
                        error.length(), MAX_OUTPUT_SIZE);
                // 保存最后 5MB 的错误信息
                execution.setError("[...截断...]\n" + error.substring(error.length() - MAX_OUTPUT_SIZE));
            } else {
                execution.setError(error);
            }
            
            execution.setExitCode(exitCode);
            execution.calculateDuration();
            scriptExecutionRepository.save(execution);
        }
    }
}
