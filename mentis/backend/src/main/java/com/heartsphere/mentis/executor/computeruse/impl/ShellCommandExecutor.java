package com.heartsphere.mentis.executor.computeruse.impl;

import com.heartsphere.mentis.executor.computeruse.CommandExecutor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.concurrent.*;

/**
 * Shell 命令执行器实现（Linux）
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Slf4j
@Component
public class ShellCommandExecutor implements CommandExecutor {
    
    private static final String[] DANGEROUS_COMMANDS = {
        "rm -rf /", "rm -rf /*", "format", "fdisk", "mkfs", "dd if=",
        "sudo rm", "sudo format", "chmod 777", "chown root"
    };
    
    @Override
    public CommandResult execute(String sessionId, String command, int timeout) {
        log.info("执行Shell命令: sessionId={}, command={}, timeout={}s", sessionId, command, timeout);
        
        // 安全检查
        if (!isCommandSafe(command)) {
            CommandResult result = new CommandResult();
            result.setExitCode(-1);
            result.setStderr("命令被安全策略阻止: " + command);
            return result;
        }
        
        long startTime = System.currentTimeMillis();
        CommandResult result = new CommandResult();
        
        try {
            // 创建进程
            ProcessBuilder processBuilder = new ProcessBuilder("/bin/bash", "-c", command);
            processBuilder.redirectErrorStream(false);
            Process process = processBuilder.start();
            
            // 读取输出
            StringBuilder stdout = new StringBuilder();
            StringBuilder stderr = new StringBuilder();
            
            try (BufferedReader stdoutReader = new BufferedReader(
                    new InputStreamReader(process.getInputStream()));
                 BufferedReader stderrReader = new BufferedReader(
                    new InputStreamReader(process.getErrorStream()))) {
                
                // 使用 ExecutorService 异步读取输出
                ExecutorService executor = Executors.newFixedThreadPool(2);
                Future<String> stdoutFuture = executor.submit(() -> {
                    return stdoutReader.lines().reduce("", (a, b) -> a + "\n" + b);
                });
                Future<String> stderrFuture = executor.submit(() -> {
                    return stderrReader.lines().reduce("", (a, b) -> a + "\n" + b);
                });
                
                // 等待进程完成或超时
                boolean finished = process.waitFor(timeout, TimeUnit.SECONDS);
                
                if (!finished) {
                    process.destroyForcibly();
                    result.setTimeout(true);
                    result.setExitCode(-1);
                    result.setStderr("命令执行超时");
                    executor.shutdownNow();
                    return result;
                }
                
                // 获取输出
                stdout.append(stdoutFuture.get(timeout, TimeUnit.SECONDS));
                stderr.append(stderrFuture.get(timeout, TimeUnit.SECONDS));
                
                executor.shutdown();
                
                result.setExitCode(process.exitValue());
                result.setStdout(stdout.toString());
                result.setStderr(stderr.toString());
                
            } catch (TimeoutException e) {
                process.destroyForcibly();
                result.setTimeout(true);
                result.setExitCode(-1);
                result.setStderr("读取输出超时");
            }
            
            long executionTime = System.currentTimeMillis() - startTime;
            result.setExecutionTime(executionTime);
            
            log.info("命令执行完成: sessionId={}, exitCode={}, time={}ms", 
                    sessionId, result.getExitCode(), executionTime);
            
        } catch (Exception e) {
            log.error("执行命令失败: sessionId={}, command={}", sessionId, command, e);
            result.setExitCode(-1);
            result.setStderr("执行失败: " + e.getMessage());
            result.setExecutionTime(System.currentTimeMillis() - startTime);
        }
        
        return result;
    }
    
    @Override
    public boolean isCommandSafe(String command) {
        if (command == null || command.trim().isEmpty()) {
            return false;
        }
        
        String commandLower = command.toLowerCase().trim();
        
        // 检查危险命令
        for (String dangerous : DANGEROUS_COMMANDS) {
            if (commandLower.contains(dangerous.toLowerCase())) {
                log.warn("检测到危险命令，已阻止: {}", command);
                return false;
            }
        }
        
        // TODO: 更多安全检查逻辑
        
        return true;
    }
}
