package com.heartsphere.admin.config;

import jakarta.persistence.EntityManagerFactory;
import org.hibernate.cfg.AvailableSettings;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.autoconfigure.orm.jpa.HibernatePropertiesCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.orm.jpa.JpaTransactionManager;
import org.springframework.orm.jpa.LocalContainerEntityManagerFactoryBean;
import org.springframework.orm.jpa.vendor.HibernateJpaVendorAdapter;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.annotation.EnableTransactionManagement;

import javax.sql.DataSource;
import java.util.HashMap;
import java.util.Map;

/**
 * JPA配置类
 * 配置EntityManagerFactory和TransactionManager以支持多数据源
 */
@Configuration
@EnableTransactionManagement
@EnableJpaRepositories(
    basePackages = {"com.heartsphere.admin.repository", "com.heartsphere.shared.repository"},
    entityManagerFactoryRef = "entityManagerFactory",
    transactionManagerRef = "transactionManager"
)
public class JpaConfig implements HibernatePropertiesCustomizer {

    /**
     * 配置EntityManagerFactory
     * 使用routingDataSource作为数据源
     */
    @Bean
    @Primary
    public LocalContainerEntityManagerFactoryBean entityManagerFactory(
            @Qualifier("routingDataSource") DataSource dataSource) {
        
        LocalContainerEntityManagerFactoryBean em = new LocalContainerEntityManagerFactoryBean();
        em.setDataSource(dataSource);
        em.setPackagesToScan("com.heartsphere.admin.entity", "com.heartsphere.shared.entity", "com.heartsphere.admin.entity.agentmind");
        
        HibernateJpaVendorAdapter vendorAdapter = new HibernateJpaVendorAdapter();
        em.setJpaVendorAdapter(vendorAdapter);
        
        Map<String, Object> properties = new HashMap<>();
        properties.put("hibernate.hbm2ddl.auto", "none");
        properties.put("hibernate.dialect", "org.hibernate.dialect.MySQLDialect");
        properties.put("hibernate.format_sql", true);
        properties.put("hibernate.use_sql_comments", true);
        properties.put("hibernate.use_jdbc_metadata_defaults", false);
        properties.put("hibernate.temp.use_jdbc_metadata_defaults", false);
        properties.put("hibernate.validator.apply_to_ddl", false);
        properties.put("hibernate.check_nullability", false);
        properties.put("hibernate.allow_update_outside_transaction", true);
        properties.put("hibernate.schema_update", false);
        properties.put("hibernate.schema_validate", false);
        properties.put("hibernate.use_information_schema", true);
        
        em.setJpaPropertyMap(properties);
        
        return em;
    }

    /**
     * 配置TransactionManager
     */
    @Bean
    @Primary
    public PlatformTransactionManager transactionManager(
            @Qualifier("entityManagerFactory") EntityManagerFactory entityManagerFactory) {
        return new JpaTransactionManager(entityManagerFactory);
    }

    /**
     * 配置JdbcTemplate
     * 使用routingDataSource作为数据源
     */
    @Bean
    @Primary
    public JdbcTemplate jdbcTemplate(@Qualifier("routingDataSource") DataSource dataSource) {
        return new JdbcTemplate(dataSource);
    }

    /**
     * 自定义Hibernate属性
     */
    @Override
    public void customize(Map<String, Object> hibernateProperties) {
        // 禁用所有DDL操作
        hibernateProperties.put(AvailableSettings.HBM2DDL_AUTO, "none");
        hibernateProperties.put("jakarta.persistence.schema-generation.database.action", "none");
        hibernateProperties.put("jakarta.persistence.schema-generation.scripts.action", "none");
        
        // 禁用schema验证
        hibernateProperties.put(AvailableSettings.JAKARTA_VALIDATION_MODE, "none");
        hibernateProperties.put("hibernate.validator.apply_to_ddl", false);
        
        // 禁用元数据验证
        hibernateProperties.put("hibernate.temp.use_jdbc_metadata_defaults", false);
        hibernateProperties.put("hibernate.use_jdbc_metadata_defaults", false);
        
        // 禁用schema更新检查
        hibernateProperties.put("hibernate.hbm2ddl.auto", "none");
        hibernateProperties.put("hibernate.hbm2ddl.validate", false);
        
        // 禁用启动时的schema检查
        hibernateProperties.put("hibernate.check_nullability", false);
        hibernateProperties.put("hibernate.allow_update_outside_transaction", true);
        
        // 禁用表结构验证
        hibernateProperties.put("hibernate.schema_update", false);
        hibernateProperties.put("hibernate.schema_validate", false);
        
        // 使用信息模式但不验证
        hibernateProperties.put("hibernate.use_information_schema", true);
    }
}
