package com.heartsphere.admin.util;

import com.heartsphere.admin.service.PresetScriptGeneratorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.logging.Logger;

/**
 * 预置剧本生成器
 * 在应用启动时自动为所有预置场景生成剧本
 * 使用方法：在启动参数中添加 --generate-preset-scripts
 */
@Component
public class PresetScriptGeneratorRunner implements CommandLineRunner {

    private static final Logger logger = Logger.getLogger(PresetScriptGeneratorRunner.class.getName());

    @Autowired
    private PresetScriptGeneratorService generatorService;

    @Override
    public void run(String... args) {
        // 检查是否通过命令行参数触发
        boolean shouldGenerate = false;
        for (String arg : args) {
            if (arg.equals("--generate-preset-scripts") || arg.equals("-gps")) {
                shouldGenerate = true;
                break;
            }
        }

        if (shouldGenerate) {
            logger.info("========== 开始为所有预置场景生成剧本 ==========");
            try {
                int count = generatorService.generateScriptsForAllEras();
                logger.info("========== 生成完成，共生成 " + count + " 个剧本 ==========");
            } catch (Exception e) {
                logger.severe("生成剧本失败: " + e.getMessage());
                e.printStackTrace();
            }
            System.exit(0);
        }
    }
}




