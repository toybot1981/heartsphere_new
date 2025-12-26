package com.heartsphere.aistudio.service;

import com.heartsphere.aistudio.model.AgentDefinition;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Arrays;

/**
 * 旅游 Agent 服务
 * 自动创建旅游出行助手 Agent
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class TravelAgentService {
    
    private final AgentService agentService;
    
    /**
     * 初始化旅游出行助手 Agent
     */
    public void initializeTravelAgent() {
        createTravelAssistantAgent();
        log.info("已初始化旅游出行助手 Agent");
    }
    
    /**
     * 创建旅游出行助手 Agent
     */
    private void createTravelAssistantAgent() {
        AgentDefinition definition = new AgentDefinition();
        definition.setId("travel-assistant-agent");
        definition.setName("旅游出行助手");
        definition.setDescription("专业的旅游出行助手，可以查询航班、预订酒店、提供出行建议、管理行程和发送航班提醒");
        definition.setType(AgentDefinition.AgentType.TEXT);
        definition.setProvider("alibaba");
        definition.setModel("qwen-max");
        definition.setSystemPrompt("你是一个专业的旅游出行助手，能够帮助用户查询航班、预订酒店、提供出行建议、管理行程。你可以使用以下工具：search_flights(查询航班)、search_hotels(查询酒店)、get_travel_advice(获取出行建议)、book_flight(预订机票)、book_hotel(预订酒店)。请根据用户需求，智能选择合适的工具并提供帮助。");
        
        // 配置工具
        AgentDefinition.ToolDefinition flightSearch = new AgentDefinition.ToolDefinition();
        flightSearch.setName("search_flights");
        flightSearch.setDescription("查询航班信息");
        
        AgentDefinition.ToolDefinition hotelSearch = new AgentDefinition.ToolDefinition();
        hotelSearch.setName("search_hotels");
        hotelSearch.setDescription("查询酒店信息");
        
        AgentDefinition.ToolDefinition travelAdvice = new AgentDefinition.ToolDefinition();
        travelAdvice.setName("get_travel_advice");
        travelAdvice.setDescription("获取出行建议");
        
        AgentDefinition.ToolDefinition flightBook = new AgentDefinition.ToolDefinition();
        flightBook.setName("book_flight");
        flightBook.setDescription("预订机票");
        
        AgentDefinition.ToolDefinition hotelBook = new AgentDefinition.ToolDefinition();
        hotelBook.setName("book_hotel");
        hotelBook.setDescription("预订酒店");
        
        definition.setTools(Arrays.asList(
            flightSearch, hotelSearch, travelAdvice, flightBook, hotelBook
        ));
        
        try {
            agentService.registerAgent(definition);
            log.info("已创建旅游出行助手 Agent");
        } catch (Exception e) {
            log.error("创建旅游出行助手 Agent 失败", e);
        }
    }
}








