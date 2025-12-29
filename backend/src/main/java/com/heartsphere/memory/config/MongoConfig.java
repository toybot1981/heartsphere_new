package com.heartsphere.memory.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;

/**
 * MongoDB配置
 * MongoDB连接配置在application.yml中
 * 
 * @author HeartSphere
 * @date 2025-12-28
 */
@Configuration
@EnableMongoRepositories(basePackages = "com.heartsphere.memory.repository")
public class MongoConfig {
    // MongoDB连接配置在application.yml中
    // spring.data.mongodb.uri=mongodb://localhost:27017/heartsphere
}

