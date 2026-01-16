package com.heartsphere.heartconnect.portal.entity.converter;

import com.heartsphere.heartconnect.portal.entity.PortalConfig;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * PermissionType 枚举转换器
 * 用于在数据库小写字符串和 Java 大写枚举之间转换
 */
@Converter(autoApply = true)
public class PermissionTypeConverter implements AttributeConverter<PortalConfig.PermissionType, String> {
    
    private static final Logger log = LoggerFactory.getLogger(PermissionTypeConverter.class);
    
    @Override
    public String convertToDatabaseColumn(PortalConfig.PermissionType attribute) {
        if (attribute == null) {
            return null;
        }
        String result = attribute.name().toLowerCase();
        log.debug("PermissionTypeConverter: 转换到数据库 - {} -> {}", attribute, result);
        return result;
    }
    
    @Override
    public PortalConfig.PermissionType convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.isEmpty()) {
            log.warn("PermissionTypeConverter: 数据库值为空，返回 null");
            return null;
        }
        try {
            String upperCase = dbData.toUpperCase();
            PortalConfig.PermissionType result = PortalConfig.PermissionType.valueOf(upperCase);
            log.debug("PermissionTypeConverter: 从数据库转换 - '{}' -> {}", dbData, result);
            return result;
        } catch (IllegalArgumentException e) {
            log.error("PermissionTypeConverter: 无法转换数据库值 '{}' 到 PermissionType 枚举。可用值: {}", 
                dbData, java.util.Arrays.toString(PortalConfig.PermissionType.values()), e);
            throw new IllegalArgumentException("Unknown permission type: " + dbData + ". Available values: " + 
                java.util.Arrays.toString(PortalConfig.PermissionType.values()), e);
        }
    }
}