package com.heartsphere.memory.dto.hsmem;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

/**
 * HSMem 通用响应DTO
 * 对应 hsmem API 的标准响应格式
 * 
 * @author HeartSphere
 * @date 2026-01-16
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class HSMemResponse<T> {
    
    /**
     * 是否成功
     */
    private Boolean success;
    
    /**
     * 响应数据
     */
    private T data;
    
    /**
     * 错误信息（如果失败）
     */
    private String error;
    
    /**
     * 记忆化响应数据
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MemorizeData {
        /**
         * 资源ID
         */
        private String resource_id;
        
        /**
         * 记忆项数量
         */
        private Integer items_count;
        
        /**
         * 新建记忆项 ID 列表（memorizeItems 时可用）
         */
        private List<String> item_ids;
        
        /**
         * 分类列表
         */
        private List<Category> categories;
        
        @Data
        @NoArgsConstructor
        @AllArgsConstructor
        public static class Category {
            /**
             * 分类名称
             */
            private String name;
            
            /**
             * 记忆项数量
             */
            private Integer item_count;
        }
    }
    
    /**
     * 检索响应数据
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RetrieveData {
        /**
         * 检索方法
         */
        private String method;
        
        /**
         * 记忆项列表
         */
        private List<Map<String, Object>> items;
    }
    
    /**
     * 统计响应数据
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StatisticsData {
        /**
         * 资源数量
         */
        private Integer resources_count;
        
        /**
         * 记忆项数量
         */
        private Integer items_count;
        
        /**
         * 分类数量
         */
        private Integer categories_count;
    }
    
    /**
     * 分类列表响应数据
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CategoriesData {
        /**
         * 分类列表
         */
        private List<Map<String, Object>> categories;
        
        /**
         * 总数
         */
        private Integer total;
    }
    
    /**
     * 记忆项列表响应数据
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ItemsData {
        /**
         * 记忆项列表
         */
        private List<Map<String, Object>> items;
        
        /**
         * 总数
         */
        private Integer total;
    }
    
    /**
     * 资源列表响应数据
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ResourcesData {
        /**
         * 资源列表
         */
        private List<Map<String, Object>> resources;
        
        /**
         * 总数
         */
        private Integer total;
    }
}
