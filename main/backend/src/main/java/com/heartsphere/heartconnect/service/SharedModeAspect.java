package com.heartsphere.heartconnect.service;

import com.heartsphere.heartconnect.context.SharedModeContext;
import com.heartsphere.heartconnect.storage.TemporaryDataStorage;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

/**
 * 共享模式切面
 * 拦截数据保存操作，在共享模式下将数据保存到临时存储
 */
@Aspect
@Component
public class SharedModeAspect {
    
    private static final Logger log = LoggerFactory.getLogger(SharedModeAspect.class);
    
    @Autowired
    private TemporaryDataStorage temporaryDataStorage;
    
    /**
     * 拦截对话保存操作
     * 如果处于共享模式，保存到临时存储
     */
    @Around("execution(* com.heartsphere.memory.service.*.saveMessage(..)) || " +
            "execution(* com.heartsphere.memory.service.*.save*(..))")
    public Object interceptMemorySave(ProceedingJoinPoint joinPoint) throws Throwable {
        if (SharedModeContext.isActive()) {
            Long shareConfigId = SharedModeContext.getShareConfigId();
            Long visitorId = SharedModeContext.getVisitorId();
            
            if (shareConfigId != null && visitorId != null) {
                // 获取方法参数
                Object[] args = joinPoint.getArgs();
                
                // 保存到临时存储
                if (args.length > 0) {
                    Object data = args[args.length - 1]; // 最后一个参数通常是数据对象
                    temporaryDataStorage.save(
                        shareConfigId.toString(),
                        visitorId.toString(),
                        "memory",
                        data
                    );
                    log.debug("共享模式：保存记忆到临时存储: shareConfigId={}, visitorId={}", 
                        shareConfigId, visitorId);
                }
                
                // 不执行原始方法（不保存到主人的心域）
                return null;
            }
        }
        
        // 正常模式，执行原始方法
        return joinPoint.proceed();
    }
    
    /**
     * 拦截情绪记录保存操作
     */
    @Around("execution(* com.heartsphere.emotion.service.*.save*(..)) || " +
            "execution(* com.heartsphere.emotion.service.*.record*(..))")
    public Object interceptEmotionSave(ProceedingJoinPoint joinPoint) throws Throwable {
        if (SharedModeContext.isActive()) {
            Long shareConfigId = SharedModeContext.getShareConfigId();
            Long visitorId = SharedModeContext.getVisitorId();
            
            if (shareConfigId != null && visitorId != null) {
                Object[] args = joinPoint.getArgs();
                if (args.length > 0) {
                    Object data = args[args.length - 1];
                    temporaryDataStorage.save(
                        shareConfigId.toString(),
                        visitorId.toString(),
                        "emotion",
                        data
                    );
                    log.debug("共享模式：保存情绪到临时存储: shareConfigId={}, visitorId={}", 
                        shareConfigId, visitorId);
                }
                return null;
            }
        }
        
        return joinPoint.proceed();
    }
}


