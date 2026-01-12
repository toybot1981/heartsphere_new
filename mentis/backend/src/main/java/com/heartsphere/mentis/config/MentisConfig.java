package com.heartsphere.mentis.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * Mentis 配置类
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Data
@Configuration
@ConfigurationProperties(prefix = "mentis")
public class MentisConfig {
    
    /**
     * 是否启用 Mentis 功能
     */
    private boolean enabled = true;
    
    /**
     * 默认虚拟机镜像
     */
    private String defaultVmImage = "ubuntu:latest";
    
    /**
     * 虚拟机默认CPU核心数
     */
    private int defaultVmCpu = 2;
    
    /**
     * 虚拟机默认内存（MB）
     */
    private int defaultVmMemory = 2048;
    
    /**
     * 虚拟机默认磁盘（GB）
     */
    private int defaultVmDisk = 20;
    
    /**
     * 任务超时时间（秒）
     */
    private int taskTimeout = 300;
    
    /**
     * 是否启用Computer-Use能力
     */
    private boolean computerUseEnabled = true;
    
    /**
     * 虚拟机提供者类型（docker, qemu, cloud）
     */
    private String vmProvider = "docker";
}
