package com.heartsphere.admin.service;

import com.heartsphere.shared.util.ImageUrlUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.*;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.logging.Logger;

/**
 * 视频转换服务
 * 提供视频转GIF、Lottie、PAG等功能
 */
@Service
public class VideoConversionService {

    private static final Logger logger = Logger.getLogger(VideoConversionService.class.getName());

    @Value("${app.video.storage.local.path:./uploads/videos}")
    private String videoStoragePath;

    @Value("${app.image.storage.local.path:./uploads/images}")
    private String imageStoragePath;

    // ImageUrlUtils 暂时未使用，保留以备将来需要
    // @Autowired
    // private ImageUrlUtils imageUrlUtils;

    // 工具路径配置（从配置文件读取，如果未配置则使用默认相对路径）
    @Value("${app.video.tools.ffmpeg.path:}")
    private String configuredFfmpegPath;
    
    @Value("${app.video.tools.pag.path:}")
    private String configuredPagPath;
    
    // 默认相对路径（作为后备）
    private static final String TOOLS_BASE_PATH = "admin/backend/tools/bin";
    private static final String FFMPEG_PATH = TOOLS_BASE_PATH + "/ffmpeg";
    private static final String PAG_CONVERTOR_PATH = TOOLS_BASE_PATH + "/PAGConvertor";

    /**
     * 将视频转换为GIF
     * 注意：GIF转换需要视频处理工具，如果FFmpeg不可用，将返回错误
     */
    public String convertToGif(String videoPath, int fps, Integer width, Integer height, 
                               String quality, boolean keepAspectRatio, 
                               double startTime, Double duration) throws IOException, InterruptedException {
        logger.info("开始转换视频为GIF: " + videoPath);
        
        // 构建输出路径
        // videoPath 应该是相对于 videoStoragePath 的路径，例如：zhengxin/2026/01/file.mp4
        // 如果 videoPath 以 / 开头，需要移除
        String normalizedPath = videoPath.startsWith("/") ? videoPath.substring(1) : videoPath;
        Path videoFilePath = Paths.get(videoStoragePath, normalizedPath);
        
        logger.info("视频文件完整路径: " + videoFilePath.toAbsolutePath());
        if (!Files.exists(videoFilePath)) {
            throw new IOException("视频文件不存在: " + videoFilePath.toAbsolutePath());
        }

        // 生成输出文件名
        String outputFileName = UUID.randomUUID().toString() + ".gif";
        Path outputDir = Paths.get(imageStoragePath, "animations", "gif");
        Files.createDirectories(outputDir);
        Path outputPath = outputDir.resolve(outputFileName);

        // 获取FFmpeg路径，如果找不到则抛出异常
        String ffmpegPath = getToolPath("ffmpeg", configuredFfmpegPath, FFMPEG_PATH);
        if (ffmpegPath == null || !Files.exists(Paths.get(ffmpegPath))) {
            throw new IOException("FFmpeg工具未找到，无法转换GIF。请确保FFmpeg已安装并配置在正确路径。");
        }

        // 构建FFmpeg命令
        List<String> command = new ArrayList<>();
        command.add(ffmpegPath);
        command.add("-i");
        command.add(videoFilePath.toAbsolutePath().toString());
        
        // 设置起始时间
        if (startTime > 0) {
            command.add("-ss");
            command.add(String.valueOf(startTime));
        }
        
        // 设置时长
        if (duration != null && duration > 0) {
            command.add("-t");
            command.add(String.valueOf(duration));
        }
        
        // 设置FPS
        command.add("-r");
        command.add(String.valueOf(fps));
        
        // 设置尺寸
        if (width != null && height != null) {
            if (keepAspectRatio) {
                command.add("-vf");
                command.add(String.format("scale=%d:%d:force_original_aspect_ratio=decrease,pad=%d:%d:(ow-iw)/2:(oh-ih)/2", 
                        width, height, width, height));
            } else {
                command.add("-vf");
                command.add(String.format("scale=%d:%d", width, height));
            }
        }
        
        // 设置GIF质量
        String paletteQuality = "medium";
        if (quality.equals("low")) {
            paletteQuality = "low";
        } else if (quality.equals("high")) {
            paletteQuality = "high";
        }
        
        // 使用调色板优化GIF质量
        Path palettePath = outputDir.resolve(UUID.randomUUID().toString() + "_palette.png");
        List<String> paletteCommand = new ArrayList<>();
        paletteCommand.add(ffmpegPath);
        paletteCommand.add("-i");
        paletteCommand.add(videoFilePath.toAbsolutePath().toString());
        if (startTime > 0) {
            paletteCommand.add("-ss");
            paletteCommand.add(String.valueOf(startTime));
        }
        if (duration != null && duration > 0) {
            paletteCommand.add("-t");
            paletteCommand.add(String.valueOf(duration));
        }
        paletteCommand.add("-vf");
        if (width != null && height != null) {
            if (keepAspectRatio) {
                paletteCommand.add(String.format("fps=%d,scale=%d:%d:flags=lanczos:force_original_aspect_ratio=decrease,pad=%d:%d:(ow-iw)/2:(oh-ih)/2,palettegen", 
                        fps, width, height, width, height));
            } else {
                paletteCommand.add(String.format("fps=%d,scale=%d:%d:flags=lanczos,palettegen", fps, width, height));
            }
        } else {
            paletteCommand.add(String.format("fps=%d,palettegen", fps));
        }
        paletteCommand.add("-y");
        paletteCommand.add(palettePath.toAbsolutePath().toString());

        // 执行调色板生成
        ProcessBuilder paletteBuilder = new ProcessBuilder(paletteCommand);
        paletteBuilder.redirectErrorStream(true);
        Process paletteProcess = paletteBuilder.start();
        int paletteExitCode = paletteProcess.waitFor();
        
        if (paletteExitCode != 0) {
            // 如果调色板生成失败，使用简单方式
            Files.deleteIfExists(palettePath);
            command.add("-vf");
            if (width != null && height != null) {
                if (keepAspectRatio) {
                    command.add(String.format("fps=%d,scale=%d:%d:force_original_aspect_ratio=decrease,pad=%d:%d:(ow-iw)/2:(oh-ih)/2", 
                            fps, width, height, width, height));
                } else {
                    command.add(String.format("fps=%d,scale=%d:%d", fps, width, height));
                }
            } else {
                command.add(String.format("fps=%d", fps));
            }
        } else {
            // 使用调色板生成GIF
            command.add("-i");
            command.add(palettePath.toAbsolutePath().toString());
            command.add("-lavfi");
            if (width != null && height != null) {
                if (keepAspectRatio) {
                    command.add(String.format("fps=%d,scale=%d:%d:flags=lanczos:force_original_aspect_ratio=decrease,pad=%d:%d:(ow-iw)/2:(oh-ih)/2[x];[x][1:v]paletteuse", 
                            fps, width, height, width, height));
                } else {
                    command.add(String.format("fps=%d,scale=%d:%d:flags=lanczos[x];[x][1:v]paletteuse", fps, width, height));
                }
            } else {
                command.add(String.format("fps=%d[x];[x][1:v]paletteuse", fps));
            }
        }
        
        command.add("-y");
        command.add(outputPath.toAbsolutePath().toString());

        // 执行转换
        ProcessBuilder builder = new ProcessBuilder(command);
        builder.redirectErrorStream(true);
        Process process = builder.start();
        
        // 读取输出
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
            String line;
            while ((line = reader.readLine()) != null) {
                logger.fine("FFmpeg输出: " + line);
            }
        }
        
        int exitCode = process.waitFor();
        
        // 清理临时文件
        Files.deleteIfExists(palettePath);
        
        if (exitCode != 0) {
            throw new IOException("FFmpeg转换失败，退出码: " + exitCode);
        }

        if (!Files.exists(outputPath)) {
            throw new IOException("转换后的文件不存在: " + outputPath);
        }

        // 返回相对路径
        Path relativePath = Paths.get(imageStoragePath).relativize(outputPath);
        String relativePathStr = relativePath.toString().replace("\\", "/");
        logger.info("GIF转换成功: " + relativePathStr);
        
        return relativePathStr;
    }

    /**
     * 将视频转换为Lottie（JSON格式）
     */
    public String convertToLottie(String videoPath, int fps, Integer width, Integer height,
                                  Integer precision, boolean optimize,
                                  double startTime, Double duration) throws IOException, InterruptedException {
        logger.info("开始转换视频为Lottie: " + videoPath);
        
        // Lottie转换通常需要先将视频转换为序列帧，然后使用工具转换为Lottie
        // 这里先使用FFmpeg提取关键帧，然后转换为Lottie格式
        
        // videoPath 应该是相对于 videoStoragePath 的路径
        String normalizedPath = videoPath.startsWith("/") ? videoPath.substring(1) : videoPath;
        Path videoFilePath = Paths.get(videoStoragePath, normalizedPath);
        
        logger.info("视频文件完整路径: " + videoFilePath.toAbsolutePath());
        if (!Files.exists(videoFilePath)) {
            throw new IOException("视频文件不存在: " + videoFilePath.toAbsolutePath());
        }

        // 生成输出文件名
        String outputFileName = UUID.randomUUID().toString() + ".json";
        Path outputDir = Paths.get(imageStoragePath, "animations", "lottie");
        Files.createDirectories(outputDir);
        Path outputPath = outputDir.resolve(outputFileName);

        // 创建临时目录存放序列帧
        Path tempDir = outputDir.resolve("temp_" + UUID.randomUUID().toString());
        Files.createDirectories(tempDir);

        try {
            // 使用FFmpeg提取序列帧
            List<String> extractCommand = new ArrayList<>();
            extractCommand.add(getAbsolutePath(FFMPEG_PATH));
            extractCommand.add("-i");
            extractCommand.add(videoFilePath.toAbsolutePath().toString());
            
            if (startTime > 0) {
                extractCommand.add("-ss");
                extractCommand.add(String.valueOf(startTime));
            }
            
            if (duration != null && duration > 0) {
                extractCommand.add("-t");
                extractCommand.add(String.valueOf(duration));
            }
            
            extractCommand.add("-r");
            extractCommand.add(String.valueOf(fps));
            
            if (width != null && height != null) {
                extractCommand.add("-vf");
                extractCommand.add(String.format("scale=%d:%d", width, height));
            }
            
            extractCommand.add("-y");
            extractCommand.add(tempDir.resolve("frame_%04d.png").toAbsolutePath().toString());

            ProcessBuilder extractBuilder = new ProcessBuilder(extractCommand);
            extractBuilder.redirectErrorStream(true);
            Process extractProcess = extractBuilder.start();
            int extractExitCode = extractProcess.waitFor();
            
            if (extractExitCode != 0) {
                throw new IOException("提取序列帧失败，退出码: " + extractExitCode);
            }

            // TODO: 将序列帧转换为Lottie JSON
            // 这里需要调用Lottie转换工具（如果有的话）
            // 目前先创建一个简单的占位JSON
            String lottieJson = createSimpleLottieJson(tempDir, fps, width != null ? width : 512, height != null ? height : 512);
            
            Files.write(outputPath, lottieJson.getBytes("UTF-8"));
            
            // 返回相对路径
            Path relativePath = Paths.get(imageStoragePath).relativize(outputPath);
            String relativePathStr = relativePath.toString().replace("\\", "/");
            logger.info("Lottie转换成功: " + relativePathStr);
            
            return relativePathStr;
        } finally {
            // 清理临时目录
            deleteDirectory(tempDir);
        }
    }

    /**
     * 将视频转换为PAG
     */
    public String convertToPag(String videoPath, int fps, Integer width, Integer height,
                              Integer compressionLevel,
                              double startTime, Double duration) throws IOException, InterruptedException {
        logger.info("开始转换视频为PAG: " + videoPath);
        
        // videoPath 应该是相对于 videoStoragePath 的路径
        String normalizedPath = videoPath.startsWith("/") ? videoPath.substring(1) : videoPath;
        Path videoFilePath = Paths.get(videoStoragePath, normalizedPath);
        
        logger.info("视频文件完整路径: " + videoFilePath.toAbsolutePath());
        if (!Files.exists(videoFilePath)) {
            throw new IOException("视频文件不存在: " + videoFilePath.toAbsolutePath());
        }

        // 生成输出文件名
        String outputFileName = UUID.randomUUID().toString() + ".pag";
        Path outputDir = Paths.get(imageStoragePath, "animations", "pag");
        Files.createDirectories(outputDir);
        Path outputPath = outputDir.resolve(outputFileName);

        // 获取PAG转换器路径
        String pagPath = getToolPath("PAGConvertor", configuredPagPath, PAG_CONVERTOR_PATH);
        if (pagPath == null || !Files.exists(Paths.get(pagPath))) {
            throw new IOException("PAG转换器未找到，无法转换PAG。请确保PAGConvertor已安装并配置在正确路径。");
        }
        
        // 构建PAG转换命令
        List<String> command = new ArrayList<>();
        command.add(pagPath);
        command.add("-i");
        command.add(videoFilePath.toAbsolutePath().toString());
        command.add("-o");
        command.add(outputPath.toAbsolutePath().toString());
        
        if (fps > 0) {
            command.add("-fps");
            command.add(String.valueOf(fps));
        }
        
        if (width != null && height != null) {
            command.add("-w");
            command.add(String.valueOf(width));
            command.add("-h");
            command.add(String.valueOf(height));
        }
        
        if (compressionLevel != null) {
            command.add("-c");
            command.add(String.valueOf(compressionLevel));
        }
        
        if (startTime > 0) {
            command.add("-ss");
            command.add(String.valueOf(startTime));
        }
        
        if (duration != null && duration > 0) {
            command.add("-t");
            command.add(String.valueOf(duration));
        }

        // 执行转换
        ProcessBuilder builder = new ProcessBuilder(command);
        builder.redirectErrorStream(true);
        Process process = builder.start();
        
        // 读取输出
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
            String line;
            while ((line = reader.readLine()) != null) {
                logger.fine("PAG转换输出: " + line);
            }
        }
        
        int exitCode = process.waitFor();
        
        if (exitCode != 0) {
            throw new IOException("PAG转换失败，退出码: " + exitCode);
        }

        if (!Files.exists(outputPath)) {
            throw new IOException("转换后的文件不存在: " + outputPath);
        }

        // 返回相对路径
        Path relativePath = Paths.get(imageStoragePath).relativize(outputPath);
        String relativePathStr = relativePath.toString().replace("\\", "/");
        logger.info("PAG转换成功: " + relativePathStr);
        
        return relativePathStr;
    }

    /**
     * 获取工具的绝对路径
     * @param toolName 工具名称（用于日志）
     * @param configuredPath 配置的路径（如果已配置）
     * @param defaultRelativePath 默认相对路径（作为后备）
     * @return 工具的绝对路径
     */
    private String getToolPath(String toolName, String configuredPath, String defaultRelativePath) {
        // 如果配置了绝对路径，优先使用
        if (configuredPath != null && !configuredPath.trim().isEmpty()) {
            Path configPath = Paths.get(configuredPath.trim());
            if (configPath.isAbsolute() && Files.exists(configPath) && Files.isExecutable(configPath)) {
                logger.info("使用配置的工具路径 [" + toolName + "]: " + configPath);
                return configPath.toString();
            }
        }
        
        // 使用默认相对路径查找
        return getAbsolutePath(defaultRelativePath);
    }
    
    /**
     * 获取工具的绝对路径（从相对路径）
     * 优先使用绝对路径，确保能找到工具
     * 支持从项目根目录或 admin/backend 目录启动的情况
     */
    private String getAbsolutePath(String relativePath) {
        try {
            Path toolsPath = Paths.get(relativePath);
            if (toolsPath.isAbsolute()) {
                if (Files.exists(toolsPath) && Files.isExecutable(toolsPath)) {
                    logger.info("找到工具（绝对路径）: " + toolsPath);
                    return toolsPath.toString();
                }
            }
            
            // 从当前工作目录获取
            Path currentDir = Paths.get(System.getProperty("user.dir"));
            logger.info("当前工作目录: " + currentDir.toAbsolutePath());
            
            // 首先尝试直接解析（如果 relativePath 已经包含 admin/backend）
            Path fullPath = currentDir.resolve(relativePath);
            if (Files.exists(fullPath) && Files.isExecutable(fullPath)) {
                String absolutePath = fullPath.toAbsolutePath().toString();
                logger.info("找到工具（直接路径）: " + absolutePath);
                return absolutePath;
            }
            
            // 如果当前目录是 admin/backend，尝试从当前目录获取 tools/bin/xxx
            if (currentDir.getFileName().toString().equals("backend")) {
                Path parentDir = currentDir.getParent();
                if (parentDir != null && parentDir.getFileName().toString().equals("admin")) {
                    // 当前目录是 admin/backend，直接使用 tools/bin/xxx
                    String pathWithoutPrefix = relativePath.replace("admin/backend/", "");
                    fullPath = currentDir.resolve(pathWithoutPrefix);
                    if (Files.exists(fullPath) && Files.isExecutable(fullPath)) {
                        String absolutePath = fullPath.toAbsolutePath().toString();
                        logger.info("找到工具（从 backend 目录）: " + absolutePath);
                        return absolutePath;
                    }
                }
            }
            
            // 尝试从 admin/backend 目录获取（如果当前目录是项目根目录）
            Path backendDir = currentDir.resolve("admin/backend");
            if (Files.exists(backendDir)) {
                // 移除 admin/backend 前缀（如果存在）
                String pathWithoutPrefix = relativePath.replace("admin/backend/", "");
                fullPath = backendDir.resolve(pathWithoutPrefix);
                if (Files.exists(fullPath) && Files.isExecutable(fullPath)) {
                    String absolutePath = fullPath.toAbsolutePath().toString();
                    logger.info("找到工具（从项目根目录）: " + absolutePath);
                    return absolutePath;
                }
            }
            
            // 尝试从 tools/bin 目录获取（如果 relativePath 是 tools/bin/xxx）
            if (relativePath.contains("tools/bin/")) {
                String toolName = relativePath.substring(relativePath.lastIndexOf("/") + 1);
                // 先尝试从当前目录的 tools/bin
                fullPath = currentDir.resolve("tools/bin/" + toolName);
                if (Files.exists(fullPath) && Files.isExecutable(fullPath)) {
                    String absolutePath = fullPath.toAbsolutePath().toString();
                    logger.info("找到工具（当前目录的 tools/bin）: " + absolutePath);
                    return absolutePath;
                }
                // 再尝试从 admin/backend/tools/bin
                Path toolsBinDir = currentDir.resolve("admin/backend/tools/bin");
                fullPath = toolsBinDir.resolve(toolName);
                if (Files.exists(fullPath) && Files.isExecutable(fullPath)) {
                    String absolutePath = fullPath.toAbsolutePath().toString();
                    logger.info("找到工具（admin/backend/tools/bin）: " + absolutePath);
                    return absolutePath;
                }
            }
            
            // 如果都找不到，尝试使用规范化的绝对路径
            Path normalizedPath = currentDir.resolve(relativePath).normalize().toAbsolutePath();
            if (Files.exists(normalizedPath) && Files.isExecutable(normalizedPath)) {
                String absolutePath = normalizedPath.toString();
                logger.info("找到工具（规范化路径）: " + absolutePath);
                return absolutePath;
            }
            
            // 如果都找不到，记录警告并返回相对路径（让调用者处理）
            logger.warning("工具路径未找到: " + relativePath + "，当前目录: " + currentDir.toAbsolutePath());
            return relativePath;
        } catch (Exception e) {
            logger.warning("获取工具路径失败: " + relativePath + " - " + e.getMessage());
            return relativePath;
        }
    }
    
    /**
     * 检查PAG转换器是否可用
     */
    public boolean isPagAvailable() {
        try {
            String pagPath = getToolPath("PAGConvertor", configuredPagPath, PAG_CONVERTOR_PATH);
            return pagPath != null && Files.exists(Paths.get(pagPath)) && Files.isExecutable(Paths.get(pagPath));
        } catch (Exception e) {
            logger.warning("检查PAG可用性失败: " + e.getMessage());
            return false;
        }
    }

    /**
     * 创建简单的Lottie JSON（占位实现）
     */
    private String createSimpleLottieJson(Path framesDir, int fps, int width, int height) {
        // 这是一个简化的Lottie JSON结构
        // 实际实现需要将序列帧转换为Lottie格式
        return String.format(
            "{\"v\":\"5.7.4\",\"fr\":%d,\"ip\":0,\"op\":60,\"w\":%d,\"h\":%d,\"nm\":\"Video Animation\",\"ddd\":0,\"assets\":[],\"layers\":[]}",
            fps, width, height
        );
    }

    /**
     * 删除目录
     */
    private void deleteDirectory(Path dir) {
        try {
            if (Files.exists(dir)) {
                Files.walk(dir)
                    .sorted((a, b) -> -a.compareTo(b))
                    .forEach(path -> {
                        try {
                            Files.delete(path);
                        } catch (IOException e) {
                            logger.warning("删除文件失败: " + path + " - " + e.getMessage());
                        }
                    });
            }
        } catch (IOException e) {
            logger.warning("删除目录失败: " + dir + " - " + e.getMessage());
        }
    }
}
