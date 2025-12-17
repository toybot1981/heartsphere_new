package com.heartsphere.aiagent.service;

import com.heartsphere.aiagent.model.AgentDefinition;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 旅游对话 Agent 服务
 * 创建多个专门的 Agent 和主对话 Agent，通过工作流协同工作
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class TravelChatAgentService {
    
    private final AgentService agentService;
    
    /**
     * 初始化所有旅游相关的对话 Agent
     */
    public void initializeTravelChatAgents() {
        createFlightSearchAgent();
        createHotelSearchAgent();
        createItineraryPlanningAgent();
        createBookingAgent();
        createMainTravelAssistantAgent();
        log.info("已初始化所有旅游对话 Agent");
    }
    
    /**
     * 创建航班查询专门 Agent
     */
    private void createFlightSearchAgent() {
        AgentDefinition definition = new AgentDefinition();
        definition.setId("flight-search-agent");
        definition.setName("航班查询专家");
        definition.setDescription("专门负责查询航班信息的 Agent");
        definition.setType(AgentDefinition.AgentType.TEXT);
        definition.setProvider("alibaba");
        definition.setModel("qwen-max");
        definition.setSystemPrompt("你是一个专业的航班查询助手。当用户询问航班信息时，你需要：1. 理解用户的出发地、目的地、日期需求；2. 调用 search_flights 工具查询航班；3. 以清晰、友好的方式向用户展示查询结果，包括航班号、时间、价格、余票等信息。");
        
        AgentDefinition.ToolDefinition tool = new AgentDefinition.ToolDefinition();
        tool.setName("search_flights");
        tool.setDescription("查询航班信息");
        definition.setTools(Arrays.asList(tool));
        
        try {
            agentService.registerAgent(definition);
            log.info("已创建航班查询 Agent");
        } catch (Exception e) {
            log.error("创建航班查询 Agent 失败", e);
        }
    }
    
    /**
     * 创建酒店查询专门 Agent
     */
    private void createHotelSearchAgent() {
        AgentDefinition definition = new AgentDefinition();
        definition.setId("hotel-search-agent");
        definition.setName("酒店查询专家");
        definition.setDescription("专门负责查询酒店信息的 Agent");
        definition.setType(AgentDefinition.AgentType.TEXT);
        definition.setProvider("alibaba");
        definition.setModel("qwen-max");
        definition.setSystemPrompt("你是一个专业的酒店查询助手。当用户询问酒店信息时，你需要：1. 理解用户的目的地、入住日期、退房日期、人数、星级偏好；2. 调用 search_hotels 工具查询酒店；3. 以清晰、友好的方式向用户展示查询结果，包括酒店名称、位置、价格、评分、设施等信息。");
        
        AgentDefinition.ToolDefinition tool = new AgentDefinition.ToolDefinition();
        tool.setName("search_hotels");
        tool.setDescription("查询酒店信息");
        definition.setTools(Arrays.asList(tool));
        
        try {
            agentService.registerAgent(definition);
            log.info("已创建酒店查询 Agent");
        } catch (Exception e) {
            log.error("创建酒店查询 Agent 失败", e);
        }
    }
    
    /**
     * 创建行程规划专门 Agent
     */
    private void createItineraryPlanningAgent() {
        AgentDefinition definition = new AgentDefinition();
        definition.setId("itinerary-planning-agent");
        definition.setName("行程规划专家");
        definition.setDescription("专门负责规划旅行行程的 Agent");
        definition.setType(AgentDefinition.AgentType.TEXT);
        definition.setProvider("alibaba");
        definition.setModel("qwen-max");
        definition.setSystemPrompt("你是一个专业的行程规划助手。当用户需要规划行程时，你需要：1. 调用 get_travel_advice 工具获取出行建议；2. 根据用户的兴趣、预算、天数，智能规划每日行程；3. 提供景点推荐、美食推荐、交通建议等；4. 以清晰、有条理的方式展示行程安排。");
        
        AgentDefinition.ToolDefinition tool = new AgentDefinition.ToolDefinition();
        tool.setName("get_travel_advice");
        tool.setDescription("获取出行建议");
        definition.setTools(Arrays.asList(tool));
        
        try {
            agentService.registerAgent(definition);
            log.info("已创建行程规划 Agent");
        } catch (Exception e) {
            log.error("创建行程规划 Agent 失败", e);
        }
    }
    
    /**
     * 创建预订处理专门 Agent
     */
    private void createBookingAgent() {
        AgentDefinition definition = new AgentDefinition();
        definition.setId("booking-agent");
        definition.setName("预订处理专家");
        definition.setDescription("专门负责处理航班和酒店预订的 Agent");
        definition.setType(AgentDefinition.AgentType.TEXT);
        definition.setProvider("alibaba");
        definition.setModel("qwen-max");
        definition.setSystemPrompt("你是一个专业的预订助手。当用户需要预订时，你需要：1. 确认预订信息（航班号/酒店ID、日期、乘客信息等）；2. 调用 book_flight 或 book_hotel 工具完成预订；3. 向用户确认预订结果和后续步骤。");
        
        AgentDefinition.ToolDefinition flightTool = new AgentDefinition.ToolDefinition();
        flightTool.setName("book_flight");
        flightTool.setDescription("预订机票");
        
        AgentDefinition.ToolDefinition hotelTool = new AgentDefinition.ToolDefinition();
        hotelTool.setName("book_hotel");
        hotelTool.setDescription("预订酒店");
        
        definition.setTools(Arrays.asList(flightTool, hotelTool));
        
        try {
            agentService.registerAgent(definition);
            log.info("已创建预订处理 Agent");
        } catch (Exception e) {
            log.error("创建预订处理 Agent 失败", e);
        }
    }
    
    /**
     * 创建主旅游助手 Agent（对话式，负责路由和协调）
     */
    private void createMainTravelAssistantAgent() {
        AgentDefinition definition = new AgentDefinition();
        definition.setId("travel-chat-assistant");
        definition.setName("旅游出行助手");
        definition.setDescription("智能旅游出行助手，通过多 Agent 协同完成复杂任务");
        definition.setType(AgentDefinition.AgentType.TEXT);
        definition.setProvider("alibaba");
        definition.setModel("qwen-max");
        definition.setSystemPrompt(
            "你是一个智能旅游出行助手，可以通过与其他专门 Agent 协同工作来帮助用户。\n\n" +
            "你的职责是：\n" +
            "1. 理解用户的旅游需求（查询航班、查询酒店、规划行程、预订等）\n" +
            "2. 根据用户意图，智能调用相应的专门 Agent：\n" +
            "   - 如果用户询问航班信息，调用 flight-search-agent\n" +
            "   - 如果用户询问酒店信息，调用 hotel-search-agent\n" +
            "   - 如果用户需要规划行程，调用 itinerary-planning-agent\n" +
            "   - 如果用户需要预订，调用 booking-agent\n" +
            "3. 整合多个 Agent 的结果，为用户提供完整的解决方案\n" +
            "4. 以自然、友好的对话方式与用户交流\n\n" +
            "你可以直接使用的工具：\n" +
            "- search_flights: 查询航班\n" +
            "- search_hotels: 查询酒店\n" +
            "- get_travel_advice: 获取出行建议\n" +
            "- book_flight: 预订机票\n" +
            "- book_hotel: 预订酒店\n\n" +
            "当用户提出复杂需求时（如：查询航班+酒店+规划行程），你可以按顺序调用多个工具，然后整合结果。"
        );
        
        // 配置工作流：根据用户意图路由到不同的专门 Agent
        AgentDefinition.WorkflowConfig workflow = new AgentDefinition.WorkflowConfig();
        workflow.setType("routing");
        
        // 节点1：意图识别
        AgentDefinition.NodeConfig intentNode = new AgentDefinition.NodeConfig();
        intentNode.setId("intent_recognition");
        intentNode.setName("意图识别");
        intentNode.setType("agent");
        Map<String, Object> intentConfig = new HashMap<>();
        intentConfig.put("prompt", "分析用户消息，识别用户意图。可能的意图：flight_search(查询航班)、hotel_search(查询酒店)、itinerary_planning(规划行程)、booking(预订)、general_question(一般问题)。返回意图类型。");
        intentNode.setConfig(intentConfig);
        
        // 节点2：航班查询路由
        AgentDefinition.NodeConfig flightRouteNode = new AgentDefinition.NodeConfig();
        flightRouteNode.setId("flight_search_route");
        flightRouteNode.setName("航班查询");
        flightRouteNode.setType("agent");
        Map<String, Object> flightConfig = new HashMap<>();
        flightConfig.put("prompt", "用户需要查询航班。调用 flight-search-agent 或直接使用 search_flights 工具。");
        flightRouteNode.setConfig(flightConfig);
        
        // 节点3：酒店查询路由
        AgentDefinition.NodeConfig hotelRouteNode = new AgentDefinition.NodeConfig();
        hotelRouteNode.setId("hotel_search_route");
        hotelRouteNode.setName("酒店查询");
        hotelRouteNode.setType("agent");
        Map<String, Object> hotelConfig = new HashMap<>();
        hotelConfig.put("prompt", "用户需要查询酒店。调用 hotel-search-agent 或直接使用 search_hotels 工具。");
        hotelRouteNode.setConfig(hotelConfig);
        
        // 节点4：行程规划路由
        AgentDefinition.NodeConfig itineraryRouteNode = new AgentDefinition.NodeConfig();
        itineraryRouteNode.setId("itinerary_planning_route");
        itineraryRouteNode.setName("行程规划");
        itineraryRouteNode.setType("agent");
        Map<String, Object> itineraryConfig = new HashMap<>();
        itineraryConfig.put("prompt", "用户需要规划行程。调用 itinerary-planning-agent 或直接使用 get_travel_advice 工具。");
        itineraryRouteNode.setConfig(itineraryConfig);
        
        // 节点5：预订路由
        AgentDefinition.NodeConfig bookingRouteNode = new AgentDefinition.NodeConfig();
        bookingRouteNode.setId("booking_route");
        bookingRouteNode.setName("预订处理");
        bookingRouteNode.setType("agent");
        Map<String, Object> bookingConfig = new HashMap<>();
        bookingConfig.put("prompt", "用户需要预订。调用 booking-agent 或直接使用 book_flight/book_hotel 工具。");
        bookingRouteNode.setConfig(bookingConfig);
        
        workflow.setNodes(Arrays.asList(intentNode, flightRouteNode, hotelRouteNode, itineraryRouteNode, bookingRouteNode));
        
        // 路由边
        AgentDefinition.EdgeConfig edge1 = new AgentDefinition.EdgeConfig();
        edge1.setFrom("intent_recognition");
        edge1.setTo("flight_search_route");
        edge1.setCondition("${intent} == 'flight_search'");
        
        AgentDefinition.EdgeConfig edge2 = new AgentDefinition.EdgeConfig();
        edge2.setFrom("intent_recognition");
        edge2.setTo("hotel_search_route");
        edge2.setCondition("${intent} == 'hotel_search'");
        
        AgentDefinition.EdgeConfig edge3 = new AgentDefinition.EdgeConfig();
        edge3.setFrom("intent_recognition");
        edge3.setTo("itinerary_planning_route");
        edge3.setCondition("${intent} == 'itinerary_planning'");
        
        AgentDefinition.EdgeConfig edge4 = new AgentDefinition.EdgeConfig();
        edge4.setFrom("intent_recognition");
        edge4.setTo("booking_route");
        edge4.setCondition("${intent} == 'booking'");
        
        workflow.setEdges(Arrays.asList(edge1, edge2, edge3, edge4));
        definition.setWorkflow(workflow);
        
        // 配置所有工具
        AgentDefinition.ToolDefinition flightSearchTool = new AgentDefinition.ToolDefinition();
        flightSearchTool.setName("search_flights");
        flightSearchTool.setDescription("查询航班信息");
        
        AgentDefinition.ToolDefinition hotelSearchTool = new AgentDefinition.ToolDefinition();
        hotelSearchTool.setName("search_hotels");
        hotelSearchTool.setDescription("查询酒店信息");
        
        AgentDefinition.ToolDefinition travelAdviceTool = new AgentDefinition.ToolDefinition();
        travelAdviceTool.setName("get_travel_advice");
        travelAdviceTool.setDescription("获取出行建议");
        
        AgentDefinition.ToolDefinition flightBookTool = new AgentDefinition.ToolDefinition();
        flightBookTool.setName("book_flight");
        flightBookTool.setDescription("预订机票");
        
        AgentDefinition.ToolDefinition hotelBookTool = new AgentDefinition.ToolDefinition();
        hotelBookTool.setName("book_hotel");
        hotelBookTool.setDescription("预订酒店");
        
        definition.setTools(Arrays.asList(
            flightSearchTool, hotelSearchTool, travelAdviceTool, 
            flightBookTool, hotelBookTool
        ));
        
        try {
            agentService.registerAgent(definition);
            log.info("已创建主旅游助手 Agent（对话式）");
        } catch (Exception e) {
            log.error("创建主旅游助手 Agent 失败", e);
        }
    }
}





