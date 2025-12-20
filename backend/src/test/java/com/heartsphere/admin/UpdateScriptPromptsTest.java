package com.heartsphere.admin;

import com.heartsphere.admin.service.SystemDataService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

/**
 * 测试类：为所有系统预置剧本添加AI旁白提示词
 * 运行方法：mvn test -Dtest=UpdateScriptPromptsTest
 */
@SpringBootTest
@ActiveProfiles("test")
public class UpdateScriptPromptsTest {

    @Autowired
    private SystemDataService systemDataService;

    @Test
    public void updateAllScriptsWithPrompts() {
        System.out.println("========== 开始更新所有系统预置剧本的AI旁白提示词 ==========");
        int updatedCount = systemDataService.updateAllScriptsWithPrompts();
        System.out.println("========== 更新完成，共更新 " + updatedCount + " 个剧本 ==========");
    }
}

