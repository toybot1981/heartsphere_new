package com.heartsphere.heartconnect.portal.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * 传送门功能配置
 */
@Data
@Component
@ConfigurationProperties(prefix = "heartconnect.portal")
public class PortalProperties {
    
    /**
     * 是否启用传送门功能
     */
    private boolean enabled = false;
    
    /**
     * 功能特性配置
     */
    private Features features = new Features();
    
    @Data
    public static class Features {
        /**
         * 是否启用星门传送门
         */
        private boolean stargate = true;
        
        /**
         * 是否启用虫洞传送门
         */
        private boolean wormhole = true;
        
        /**
         * 是否启用量子传送门
         */
        private boolean quantum = true;
    }
}
