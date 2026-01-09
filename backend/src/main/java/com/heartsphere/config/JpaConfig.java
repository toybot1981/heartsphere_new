package com.heartsphere.config;

import org.hibernate.cfg.AvailableSettings;
import org.springframework.boot.autoconfigure.orm.jpa.HibernatePropertiesCustomizer;
import org.springframework.context.annotation.Configuration;

import java.util.Map;

/**
 * JPA/Hibernate 配置类
 * 用于完全禁用 schema 验证，避免 Hibernate 检查表结构
 */
@Configuration
public class JpaConfig implements HibernatePropertiesCustomizer {

    /**
     * 自定义 Hibernate 属性，完全禁用 schema 验证
     */
    @Override
    public void customize(Map<String, Object> hibernateProperties) {
        // 禁用所有 DDL 操作
        hibernateProperties.put(AvailableSettings.HBM2DDL_AUTO, "none");
        hibernateProperties.put("jakarta.persistence.schema-generation.database.action", "none");
        hibernateProperties.put("jakarta.persistence.schema-generation.scripts.action", "none");
        
        // 禁用 schema 验证
        hibernateProperties.put(AvailableSettings.JAKARTA_VALIDATION_MODE, "none");
        hibernateProperties.put("hibernate.validator.apply_to_ddl", false);
        
        // 禁用元数据验证
        hibernateProperties.put("hibernate.temp.use_jdbc_metadata_defaults", false);
        hibernateProperties.put("hibernate.use_jdbc_metadata_defaults", false);
        
        // 禁用 schema 更新检查
        hibernateProperties.put("hibernate.hbm2ddl.auto", "none");
        hibernateProperties.put("hibernate.hbm2ddl.validate", false);
        
        // 禁用启动时的 schema 检查
        hibernateProperties.put("hibernate.check_nullability", false);
        hibernateProperties.put("hibernate.allow_update_outside_transaction", true);
        
        // 禁用表结构验证
        hibernateProperties.put("hibernate.schema_update", false);
        hibernateProperties.put("hibernate.schema_validate", false);
        
        // 使用信息模式但不验证
        hibernateProperties.put("hibernate.use_information_schema", true);
        
        // 注意：不要禁用 autocommit，否则会导致事务提交失败
        // hibernateProperties.put("hibernate.connection.provider_disables_autocommit", true);
    }
}
