package com.heartsphere.aistudio.mcp;

import com.heartsphere.aistudio.tool.Tool;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.Map;

/**
 * 高德地图 MCP 工具集合
 * 将高德地图服务封装为 MCP 工具
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class AmapMCPTools {
    
    private final AmapService amapService;
    
    /**
     * 地理编码工具
     */
    public Tool getGeocodeTool() {
        return new Tool() {
            @Override
            public String getName() {
                return "amap_geocode";
            }
            
            @Override
            public String getDescription() {
                return "将地址转换为经纬度坐标。参数：address(地址), city(城市，可选)";
            }
            
            @Override
            public Object execute(Map<String, Object> parameters) {
                String address = parameters.get("address").toString();
                String city = parameters.containsKey("city") ? parameters.get("city").toString() : null;
                return amapService.geocode(address, city);
            }
        };
    }
    
    /**
     * 逆地理编码工具
     */
    public Tool getReverseGeocodeTool() {
        return new Tool() {
            @Override
            public String getName() {
                return "amap_reverse_geocode";
            }
            
            @Override
            public String getDescription() {
                return "将经纬度坐标转换为地址。参数：longitude(经度), latitude(纬度)";
            }
            
            @Override
            public Object execute(Map<String, Object> parameters) {
                String longitude = parameters.get("longitude").toString();
                String latitude = parameters.get("latitude").toString();
                return amapService.reverseGeocode(longitude, latitude);
            }
        };
    }
    
    /**
     * 路径规划工具
     */
    public Tool getRoutePlanningTool() {
        return new Tool() {
            @Override
            public String getName() {
                return "amap_route_planning";
            }
            
            @Override
            public String getDescription() {
                return "计算两点之间的路径规划。参数：origin(起点坐标，格式：经度,纬度), destination(终点坐标), strategy(策略：0-速度优先, 1-费用优先, 2-距离优先)";
            }
            
            @Override
            public Object execute(Map<String, Object> parameters) {
                String origin = parameters.get("origin").toString();
                String destination = parameters.get("destination").toString();
                String strategy = parameters.containsKey("strategy") ? parameters.get("strategy").toString() : "0";
                return amapService.routePlanning(origin, destination, strategy);
            }
        };
    }
    
    /**
     * POI 搜索工具
     */
    public Tool getSearchPOITool() {
        return new Tool() {
            @Override
            public String getName() {
                return "amap_search_poi";
            }
            
            @Override
            public String getDescription() {
                return "搜索兴趣点（POI）。参数：keywords(关键词), city(城市，可选), types(POI类型，可选), page(页码，默认1), offset(每页数量，默认20)";
            }
            
            @Override
            public Object execute(Map<String, Object> parameters) {
                String keywords = parameters.get("keywords").toString();
                String city = parameters.containsKey("city") ? parameters.get("city").toString() : null;
                String types = parameters.containsKey("types") ? parameters.get("types").toString() : null;
                int page = parameters.containsKey("page") ? Integer.parseInt(parameters.get("page").toString()) : 1;
                int offset = parameters.containsKey("offset") ? Integer.parseInt(parameters.get("offset").toString()) : 20;
                return amapService.searchPOI(keywords, city, types, page, offset);
            }
        };
    }
    
    /**
     * 天气查询工具
     */
    public Tool getWeatherTool() {
        return new Tool() {
            @Override
            public String getName() {
                return "amap_weather";
            }
            
            @Override
            public String getDescription() {
                return "查询城市天气信息。参数：city(城市名称或城市编码)";
            }
            
            @Override
            public Object execute(Map<String, Object> parameters) {
                String city = parameters.get("city").toString();
                return amapService.getWeather(city);
            }
        };
    }
}

