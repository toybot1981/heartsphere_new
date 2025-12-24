package com.heartsphere.billing.annotation;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * 需要Token配额检查的注解
 * 标注在需要计费的AI服务方法上
 */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface RequiresTokenQuota {
    /**
     * 配额类型：text_token, image, audio, video
     */
    String quotaType() default "text_token";
    
    /**
     * 使用类型：text_generation, image_generation, audio_tts, audio_stt, video_generation
     */
    String usageType() default "text_generation";
}

