package com.heartsphere.heartconnect.portal.entity.converter;

import com.heartsphere.heartconnect.portal.entity.PortalConfig;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * PortalType 枚举转换器
 * 用于在数据库小写字符串和 Java 大写枚举之间转换
 */
@Converter(autoApply = true)
public class PortalTypeConverter implements AttributeConverter<PortalConfig.PortalType, String> {
    
    private static final Logger log = LoggerFactory.getLogger(PortalTypeConverter.class);
    
    @Override
    public String convertToDatabaseColumn(PortalConfig.PortalType attribute) {
        if (attribute == null) {
            return null;
        }
        String result = attribute.name().toLowerCase();
        log.debug("PortalTypeConverter: 转换到数据库 - {} -> {}", attribute, result);
        return result;
    }
    
    @Override
    public PortalConfig.PortalType convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.isEmpty()) {
            log.warn("PortalTypeConverter: 数据库值为空，返回 null");
            return null;
        }
        try {
            String upperCase = dbData.toUpperCase();
            PortalConfig.PortalType result = PortalConfig.PortalType.valueOf(upperCase);
            log.debug("PortalTypeConverter: 从数据库转换 - '{}' -> {}", dbData, result);
            return result;
        } catch (IllegalArgumentException e) {
            log.error("PortalTypeConverter: 无法转换数据库值 '{}' 到 PortalType 枚举。可用值: {}", 
                dbData, java.util.Arrays.toString(PortalConfig.PortalType.values()), e);
            throw new IllegalArgumentException("Unknown portal type: " + dbData + ". Available values: " + 
                java.util.Arrays.toString(PortalConfig.PortalType.values()), e);
        }
    }
}