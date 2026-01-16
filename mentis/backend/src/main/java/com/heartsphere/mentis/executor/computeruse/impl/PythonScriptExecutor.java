package com.heartsphere.mentis.executor.computeruse.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.heartsphere.mentis.executor.computeruse.ScriptExecutor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardOpenOption;
import java.util.Map;
import java.util.concurrent.TimeUnit;

/**
 * Python 脚本执行器实现
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Slf4j
@Component
@ConditionalOnProperty(name = "mentis.vm.provider", havingValue = "none", matchIfMissing = false)
public class PythonScriptExecutor implements ScriptExecutor {
    
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    @Override
    public ScriptResult execute(String sessionId, String script, String language, 
                               Map<String, Object> parameters, int timeout) {
        log.info("执行Python脚本: sessionId={}, timeout={}s", sessionId, timeout);
        
        if (!"python".equalsIgnoreCase(language)) {
            ScriptResult result = new ScriptResult();
            result.setSuccess(false);
            result.setError("不支持的脚本语言: " + language);
            return result;
        }
        
        ScriptResult result = new ScriptResult();
        long startTime = System.currentTimeMillis();
        Path scriptFile = null;
        
        try {
            // 创建临时脚本文件
            scriptFile = Files.createTempFile("mentis_script_" + sessionId + "_", ".py");
            
            // 准备脚本内容（如果有参数，注入到脚本中）
            String scriptContent = prepareScript(script, parameters);
            Files.write(scriptFile, scriptContent.getBytes(), StandardOpenOption.WRITE);
            
            // 执行 Python 脚本
            ProcessBuilder processBuilder = new ProcessBuilder("python3", scriptFile.toString());
            Process process = processBuilder.start();
            
            // 读取输出
            StringBuilder output = new StringBuilder();
            StringBuilder error = new StringBuilder();
            
            try (BufferedReader stdoutReader = new BufferedReader(
                    new InputStreamReader(process.getInputStream()));
                 BufferedReader stderrReader = new BufferedReader(
                    new InputStreamReader(process.getErrorStream()))) {
                
                // 等待进程完成或超时
                boolean finished = process.waitFor(timeout, TimeUnit.SECONDS);
                
                if (!finished) {
                    process.destroyForcibly();
                    result.setTimeout(true);
                    result.setSuccess(false);
                    result.setError("脚本执行超时");
                    return result;
                }
                
                // 读取输出
                String line;
                while ((line = stdoutReader.readLine()) != null) {
                    output.append(line).append("\n");
                }
                while ((line = stderrReader.readLine()) != null) {
                    error.append(line).append("\n");
                }
                
                result.setSuccess(process.exitValue() == 0);
                result.setOutput(output.toString());
                result.setError(error.toString());
                
            }
            
            long executionTime = System.currentTimeMillis() - startTime;
            result.setExecutionTime(executionTime);
            
            log.info("Python脚本执行完成: sessionId={}, success={}, time={}ms", 
                    sessionId, result.isSuccess(), executionTime);
            
        } catch (Exception e) {
            log.error("执行Python脚本失败: sessionId={}", sessionId, e);
            result.setSuccess(false);
            result.setError("执行失败: " + e.getMessage());
            result.setExecutionTime(System.currentTimeMillis() - startTime);
        } finally {
            // 清理临时文件
            if (scriptFile != null) {
                try {
                    Files.deleteIfExists(scriptFile);
                } catch (Exception e) {
                    log.warn("删除临时脚本文件失败: {}", scriptFile, e);
                }
            }
        }
        
        return result;
    }
    
    @Override
    public boolean isLanguageSupported(String language) {
        return "python".equalsIgnoreCase(language) || 
               "python3".equalsIgnoreCase(language);
    }
    
    /**
     * 准备脚本内容（注入参数）
     */
    private String prepareScript(String script, Map<String, Object> parameters) {
        if (parameters == null || parameters.isEmpty()) {
            return script;
        }
        
        try {
            // 将参数转换为 JSON 字符串，注入到脚本中
            String paramsJson = objectMapper.writeValueAsString(parameters);
            String paramsCode = String.format(
                "\nimport json\n" +
                "params = json.loads('%s')\n" +
                "locals().update(params)\n\n", 
                paramsJson.replace("'", "\\'")
            );
            
            return paramsCode + script;
            
        } catch (Exception e) {
            log.warn("准备脚本参数失败，使用原始脚本", e);
            return script;
        }
    }
}
