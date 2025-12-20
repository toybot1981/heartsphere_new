package com.heartsphere.admin.util;

import com.heartsphere.admin.service.SystemDataService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

/**
 * 命令行工具：为所有系统预置剧本添加AI旁白提示词
 * 使用方法：在application.yml中设置 heartsphere.update-scripts-prompts=true
 * 或者在启动参数中添加 --heartsphere.update-scripts-prompts=true
 */
@Component
public class UpdateScriptPromptsRunner implements CommandLineRunner {

    @Autowired
    private SystemDataService systemDataService;

    @Override
    public void run(String... args) {
        // 检查是否通过命令行参数触发
        boolean shouldUpdate = false;
        for (String arg : args) {
            if (arg.equals("--update-scripts-prompts") || arg.equals("-usp")) {
                shouldUpdate = true;
                break;
            }
        }

        if (shouldUpdate) {
            System.out.println("========== 开始更新所有系统预置剧本的AI旁白提示词 ==========");
            int updatedCount = systemDataService.updateAllScriptsWithPrompts();
            System.out.println("========== 更新完成，共更新 " + updatedCount + " 个剧本 ==========");
            System.exit(0);
        }
    }
}

