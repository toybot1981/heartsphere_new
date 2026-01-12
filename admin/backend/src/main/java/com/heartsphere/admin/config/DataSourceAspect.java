package com.heartsphere.admin.config;

import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.lang.reflect.Method;

/**
 * 数据源切换AOP切面
 * 拦截@DataSource注解，动态切换数据源
 */
@Aspect
@Component
@Order(1)
public class DataSourceAspect {
    
    /**
     * 拦截所有使用@DataSource注解的方法和类
     */
    @Pointcut("@annotation(com.heartsphere.admin.config.DataSource) || " +
              "@within(com.heartsphere.admin.config.DataSource)")
    public void dataSourcePointcut() {
    }
    
    /**
     * 环绕通知：在方法执行前切换数据源，执行后恢复
     */
    @Around("dataSourcePointcut()")
    public Object switchDataSource(ProceedingJoinPoint joinPoint) throws Throwable {
        String dataSourceKey = determineDataSource(joinPoint);
        
        try {
            // 设置数据源键
            if (dataSourceKey != null) {
                DataSourceContextHolder.setDataSourceKey(dataSourceKey);
            }
            
            // 执行方法
            return joinPoint.proceed();
        } finally {
            // 清除数据源键，恢复默认数据源
            DataSourceContextHolder.clearDataSourceKey();
        }
    }
    
    /**
     * 确定使用的数据源
     * 优先使用方法级别的注解，其次使用类级别的注解
     */
    private String determineDataSource(ProceedingJoinPoint joinPoint) {
        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        Method method = signature.getMethod();
        
        // 检查方法级别的注解
        DataSource methodAnnotation = method.getAnnotation(DataSource.class);
        if (methodAnnotation != null) {
            return methodAnnotation.value();
        }
        
        // 检查类级别的注解
        DataSource classAnnotation = joinPoint.getTarget().getClass().getAnnotation(DataSource.class);
        if (classAnnotation != null) {
            return classAnnotation.value();
        }
        
        // 默认返回null，使用默认数据源
        return null;
    }
}
