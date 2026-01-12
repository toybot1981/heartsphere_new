package com.heartsphere.admin.config;

import com.zaxxer.hikari.HikariDataSource;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.autoconfigure.jdbc.DataSourceProperties;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.jdbc.datasource.lookup.AbstractRoutingDataSource;

import javax.sql.DataSource;
import java.util.HashMap;
import java.util.Map;

/**
 * 多数据源配置类
 * 支持admin项目访问多个数据库（admin、mentis、edu、company、main等）
 */
@Configuration
public class DataSourceConfig {
    
    /**
     * Admin主数据源配置属性
     */
    @Bean
    @Primary
    @ConfigurationProperties("spring.datasource.admin")
    public DataSourceProperties adminDataSourceProperties() {
        return new DataSourceProperties();
    }
    
    /**
     * Admin主数据源
     */
    @Bean
    @Primary
    public DataSource adminDataSource() {
        return adminDataSourceProperties()
                .initializeDataSourceBuilder()
                .type(HikariDataSource.class)
                .build();
    }
    
    /**
     * Mentis数据源配置属性
     */
    @Bean
    @ConfigurationProperties("spring.datasource.mentis")
    public DataSourceProperties mentisDataSourceProperties() {
        return new DataSourceProperties();
    }
    
    /**
     * Mentis数据源
     */
    @Bean
    public DataSource mentisDataSource() {
        return mentisDataSourceProperties()
                .initializeDataSourceBuilder()
                .type(HikariDataSource.class)
                .build();
    }
    
    /**
     * Edu数据源配置属性
     */
    @Bean
    @ConfigurationProperties("spring.datasource.edu")
    public DataSourceProperties eduDataSourceProperties() {
        return new DataSourceProperties();
    }
    
    /**
     * Edu数据源
     */
    @Bean
    public DataSource eduDataSource() {
        return eduDataSourceProperties()
                .initializeDataSourceBuilder()
                .type(HikariDataSource.class)
                .build();
    }
    
    /**
     * 动态数据源路由
     * 根据ThreadLocal中的key决定使用哪个数据源
     * 支持的数据源：admin（默认）、mentis、edu
     */
    @Bean
    @Primary
    public DataSource routingDataSource(
            @Qualifier("adminDataSource") DataSource adminDataSource,
            @Qualifier("mentisDataSource") DataSource mentisDataSource,
            @Qualifier("eduDataSource") DataSource eduDataSource) {
        
        AbstractRoutingDataSource routingDataSource = new AbstractRoutingDataSource() {
            @Override
            protected Object determineCurrentLookupKey() {
                String key = DataSourceContextHolder.getDataSourceKey();
                // 如果未设置key，返回null，将使用defaultTargetDataSource（admin）
                return key;
            }
        };
        
        // 配置目标数据源映射
        // 注意：main和company项目直接使用heartsphere数据库（admin数据源），不需要单独配置
        Map<Object, Object> targetDataSources = new HashMap<>();
        targetDataSources.put("admin", adminDataSource);
        targetDataSources.put("mentis", mentisDataSource);
        targetDataSources.put("edu", eduDataSource);
        
        routingDataSource.setTargetDataSources(targetDataSources);
        // 设置默认数据源为admin（也是main和company使用的数据源）
        routingDataSource.setDefaultTargetDataSource(adminDataSource);
        routingDataSource.afterPropertiesSet();
        
        return routingDataSource;
    }
}
