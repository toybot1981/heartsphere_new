package com.heartsphere.multiagent.agentscope;

import com.heartsphere.multiagent.core.Agent;
import com.heartsphere.multiagent.core.BaseAgent;
import io.agentscope.core.ReActAgent;
import io.agentscope.core.message.Msg;
import io.agentscope.core.message.MsgRole;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import reactor.core.publisher.Mono;

import java.util.Arrays;
import java.util.Map;

/**
 * AgentScope Agent 包装器
 * 
 * 将我们的 Agent 包装为 AgentScope ReActAgent，同时保持我们的 Agent 接口
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Slf4j
@Getter
public class AgentScopeAgentWrapper extends BaseAgent {
    
    private final ReActAgent reactAgent;
    private final AgentScopeAdapter adapter;
    
    public AgentScopeAgentWrapper(Agent agent, ReActAgent reactAgent, AgentScopeAdapter adapter) {
        super(agent.getId(), agent.getName(), agent.getDescription());
        this.reactAgent = reactAgent;
        this.adapter = adapter;
        
        // 复制能力
        addCapabilities(agent.getCapabilities());
    }
    
    @Override
    protected AgentResult doExecute(String task, Map<String, Object> context) {
        try {
            log.info("Executing task via AgentScope: agentId={}, task={}", getId(), task);
            
            // 通过 AgentScope ReActAgent 执行
            Mono<String> resultMono = adapter.executeTask(reactAgent, task);
            
            // 阻塞等待结果（在实际应用中可以考虑异步处理）
            String result = resultMono.block();
            
            if (result != null) {
                return AgentResult.success(result);
            } else {
                return AgentResult.failure("AgentScope execution returned null");
            }
        } catch (Exception e) {
            log.error("AgentScope execution failed: agentId={}, error={}", getId(), e.getMessage(), e);
            return AgentResult.failure("Execution failed: " + e.getMessage());
        }
    }
}
