package com.heartsphere.admin.config;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * 数据源切换注解
 * 用于指定方法或类使用的数据源
 */
@Target({ElementType.METHOD, ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
public @interface DataSource {
    /**
     * 数据源键
     * 可选值：admin（默认，也是main和company使用的数据源）, mentis, edu, agent-mind
     * @return 数据源键
     */
    String value() default "admin";
}
