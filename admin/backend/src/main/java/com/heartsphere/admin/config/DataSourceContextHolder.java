package com.heartsphere.admin.config;

/**
 * 数据源上下文持有者
 * 使用ThreadLocal存储当前线程使用的数据源键
 */
public class DataSourceContextHolder {
    
    private static final ThreadLocal<String> contextHolder = new ThreadLocal<>();
    
    /**
     * 设置数据源键
     * @param dataSourceKey 数据源键（如 "admin", "mentis", "edu" 等）
     */
    public static void setDataSourceKey(String dataSourceKey) {
        contextHolder.set(dataSourceKey);
    }
    
    /**
     * 获取当前数据源键
     * @return 数据源键，如果未设置则返回null（将使用默认数据源）
     */
    public static String getDataSourceKey() {
        return contextHolder.get();
    }
    
    /**
     * 清除数据源键
     */
    public static void clearDataSourceKey() {
        contextHolder.remove();
    }
}
