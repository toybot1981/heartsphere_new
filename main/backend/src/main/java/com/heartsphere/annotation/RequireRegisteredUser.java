package com.heartsphere.annotation;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * 要求注册用户注解
 * 标记需要正式用户（非体验会员）才能访问的接口
 */
@Target({ElementType.METHOD, ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
public @interface RequireRegisteredUser {
    /**
     * 错误消息
     */
    String message() default "此功能需要注册正式用户，请先注册";
}
