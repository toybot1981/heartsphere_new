package com.heartsphere.memory.config;

import org.springframework.context.annotation.Configuration;

/**
 * HSMem 实现切换由 @ConditionalOnProperty 在 HSMemLocalService / HSMemClientService 上控制，
 * 二者互斥，Controller 注入 HSMemApi 时仅有一个候选。启动时模式由 {@link HSMemModeRunner} 打印。
 */
@Configuration
public class HSMemApiConfig {
}
