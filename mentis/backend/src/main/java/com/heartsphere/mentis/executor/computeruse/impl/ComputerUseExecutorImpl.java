package com.heartsphere.mentis.executor.computeruse.impl;

import com.heartsphere.mentis.executor.ComputerUseExecutor;
import com.heartsphere.mentis.executor.computeruse.CommandExecutor;
import com.heartsphere.mentis.executor.computeruse.GuiAutomationExecutor;
import com.heartsphere.mentis.executor.computeruse.ScriptExecutor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

/**
 * Computer-Use 执行器实现
 * 整合所有执行器
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Slf4j
@Component
public class ComputerUseExecutorImpl implements ComputerUseExecutor {
    
    private final CommandExecutor commandExecutor;
    private final List<ScriptExecutor> scriptExecutors;
    private final Optional<GuiAutomationExecutor> guiAutomationExecutor; // 可选注入 GUI 自动化执行器
    
    @Autowired
    public ComputerUseExecutorImpl(
            CommandExecutor commandExecutor,
            List<ScriptExecutor> scriptExecutors,
            @Autowired(required = false) GuiAutomationExecutor guiAutomationExecutor) {
        this.commandExecutor = commandExecutor;
        this.scriptExecutors = scriptExecutors;
        this.guiAutomationExecutor = Optional.ofNullable(guiAutomationExecutor);
    }
    
    @Override
    public ComputerUseExecutor.CommandResult executeCommand(String sessionId, String command) {
        log.info("Computer-Use执行命令: sessionId={}, command={}", sessionId, command);
        
        CommandExecutor.CommandResult result = commandExecutor.execute(sessionId, command);
        
        // 转换为 ComputerUseExecutor.CommandResult
        ComputerUseExecutor.CommandResult cmdResult = new ComputerUseExecutor.CommandResult();
        cmdResult.setExitCode(result.getExitCode());
        cmdResult.setStdout(result.getStdout());
        cmdResult.setStderr(result.getStderr());
        
        return cmdResult;
    }
    
    @Override
    public ComputerUseExecutor.ScriptResult executeScript(String sessionId, String script, String language) {
        log.info("Computer-Use执行脚本: sessionId={}, language={}", sessionId, language);
        
        // 查找支持该语言的脚本执行器
        for (ScriptExecutor executor : scriptExecutors) {
            if (executor.isLanguageSupported(language)) {
                ScriptExecutor.ScriptResult result = executor.execute(sessionId, script, language);
                
                // 转换为 ComputerUseExecutor.ScriptResult
                ComputerUseExecutor.ScriptResult scriptResult = new ComputerUseExecutor.ScriptResult();
                scriptResult.setSuccess(result.isSuccess());
                scriptResult.setOutput(result.getOutput());
                scriptResult.setError(result.getError());
                
                return scriptResult;
            }
        }
        
        // 没有找到支持的执行器
        ComputerUseExecutor.ScriptResult result = new ComputerUseExecutor.ScriptResult();
        result.setSuccess(false);
        result.setError("不支持的语言: " + language);
        return result;
    }
    
    @Override
    public ComputerUseExecutor.GuiActionResult performGuiAction(String sessionId, ComputerUseExecutor.GuiAction action) {
        log.info("Computer-Use执行GUI操作: sessionId={}, actionType={}", sessionId, action.getActionType());
        
        if (!guiAutomationExecutor.isPresent()) {
            log.warn("GUI自动化执行器未配置，无法执行GUI操作");
            ComputerUseExecutor.GuiActionResult result = new ComputerUseExecutor.GuiActionResult();
            result.setSuccess(false);
            result.setMessage("GUI自动化功能未配置。请配置 mentis.gui.provider 属性（selenium 或 playwright）");
            return result;
        }
        
        return guiAutomationExecutor.get().performAction(sessionId, action);
    }
}
