package com.heartsphere.memory.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

/**
 * 启动完成后打印当前 HSMem 模式，便于运维确认。
 */
@Component
@Order(1)
@RequiredArgsConstructor
@Slf4j
public class HSMemModeRunner implements ApplicationRunner {

    private final MemoryProperties memoryProperties;

    @Override
    public void run(ApplicationArguments args) {
        String mode = memoryProperties.getHsmem().getMode();
        if (mode == null || mode.isEmpty()) mode = "local";
        log.info("[HSMem] mode={} (local=内置实现, remote=外部服务)", mode);
    }
}
