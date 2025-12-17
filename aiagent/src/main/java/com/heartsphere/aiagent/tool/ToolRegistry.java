package com.heartsphere.aiagent.tool;

import com.heartsphere.aiagent.mcp.AmapMCPTools;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

/**
 * Tool 注册表
 * 管理和注册可用的工具函数
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class ToolRegistry {
    
    private final AmapMCPTools amapMCPTools;
    private final DataSearchTool dataSearchTool;
    private final ChartGeneratorTool chartGeneratorTool;
    private final ImageGenerationTool imageGenerationTool;
    private final VideoGenerationTool videoGenerationTool;
    private final PromptOptimizerTool promptOptimizerTool;
    private final BatchGenerationTool batchGenerationTool;
    private final VoiceSynthesisTool voiceSynthesisTool;
    private final VoiceCloneTool voiceCloneTool;
    private final FlightSearchTool flightSearchTool;
    private final HotelSearchTool hotelSearchTool;
    private final TravelAdviceTool travelAdviceTool;
    private final FlightBookingTool flightBookingTool;
    private final HotelBookingTool hotelBookingTool;
    private final Map<String, Tool> tools = new HashMap<>();
    
    /**
     * 注册工具
     */
    public void registerTool(Tool tool) {
        tools.put(tool.getName(), tool);
        log.info("注册工具: {}", tool.getName());
    }
    
    /**
     * 获取工具
     */
    public Tool getTool(String name) {
        return tools.get(name);
    }
    
    /**
     * 获取所有工具
     */
    public Map<String, Tool> getAllTools() {
        return new HashMap<>(tools);
    }
    
    /**
     * 初始化默认工具
     */
    public void initializeDefaultTools() {
        // 注册一些常用的工具
        registerTool(new SimpleTool("get_weather", "获取指定城市的天气信息", 
            params -> {
                String city = params.get("city").toString();
                log.info("获取天气: {}", city);
                return "北京：晴天，25°C";
            }));
        
        registerTool(new SimpleTool("calculate", "执行数学计算",
            params -> {
                String expression = params.get("expression").toString();
                log.info("计算表达式: {}", expression);
                // 简单的计算逻辑
                return "计算结果: " + expression;
            }));
        
        registerTool(new SimpleTool("search", "搜索信息",
            params -> {
                String query = params.get("query").toString();
                log.info("搜索: {}", query);
                return "搜索结果: " + query;
            }));
        
        // 注册高德地图 MCP 工具
        registerAmapTools();
        
        // 注册数据分析和图表生成工具
        registerTool(dataSearchTool);
        registerTool(chartGeneratorTool);
        
        // 注册视觉创作工具
        registerTool(imageGenerationTool);
        registerTool(videoGenerationTool);
        
        // 注册智能辅助工具
        registerTool(promptOptimizerTool);
        registerTool(batchGenerationTool);
        
        // 注册音频创作工具
        registerTool(voiceSynthesisTool);
        registerTool(voiceCloneTool);
        
        // 注册旅游出行工具
        registerTool(flightSearchTool);
        registerTool(hotelSearchTool);
        registerTool(travelAdviceTool);
        registerTool(flightBookingTool);
        registerTool(hotelBookingTool);
        
        log.info("已注册所有创作工具和旅游工具");
    }
    
    /**
     * 注册高德地图 MCP 工具
     */
    private void registerAmapTools() {
        registerTool(amapMCPTools.getGeocodeTool());
        registerTool(amapMCPTools.getReverseGeocodeTool());
        registerTool(amapMCPTools.getRoutePlanningTool());
        registerTool(amapMCPTools.getSearchPOITool());
        registerTool(amapMCPTools.getWeatherTool());
        log.info("已注册 {} 个高德地图 MCP 工具", 5);
    }
    
    /**
     * 简单工具实现
     */
    private static class SimpleTool implements Tool {
        private final String name;
        private final String description;
        private final java.util.function.Function<Map<String, Object>, Object> function;
        
        public SimpleTool(String name, String description, 
                         java.util.function.Function<Map<String, Object>, Object> function) {
            this.name = name;
            this.description = description;
            this.function = function;
        }
        
        @Override
        public String getName() {
            return name;
        }
        
        @Override
        public String getDescription() {
            return description;
        }
        
        @Override
        public Object execute(Map<String, Object> parameters) {
            return function.apply(parameters);
        }
    }
}
