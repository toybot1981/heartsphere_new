package com.heartsphere.service.video;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import ws.schild.jave.Encoder;
import ws.schild.jave.EncoderException;
import ws.schild.jave.MultimediaObject;
import ws.schild.jave.encode.EncodingAttributes;
import ws.schild.jave.encode.VideoAttributes;
import ws.schild.jave.info.MultimediaInfo;
import ws.schild.jave.info.VideoSize;
// 注意：使用完整限定名避免与自定义 VideoInfo 类冲突
// ws.schild.jave.info.VideoInfo 是 JAVE 库的类
// com.heartsphere.service.video.VideoInfo 是本项目的自定义类

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Arrays;
import java.util.List;
import java.util.logging.Logger;

/**
 * 视频处理服务
 * 提供视频转换和元数据提取功能
 * 
 * <p>主要功能：
 * <ul>
 *   <li>视频格式验证</li>
 *   <li>视频元数据提取（时长、尺寸、帧率等）</li>
 *   <li>视频转GIF动画（已实现）</li>
 *   <li>视频转Lottie动画（已实现，使用FFmpeg提取帧并生成JSON）</li>
 *   <li>视频转PAG动画（已实现，需要PAGConvertor工具）</li>
 * </ul>
 * 
 * <p>当前支持的动画格式：
 * <ul>
 *   <li>GIF：完整支持，使用FFmpeg进行转换</li>
 *   <li>Lottie：完整支持，通过FFmpeg提取帧并生成Lottie JSON格式</li>
 *   <li>PAG：完整支持，需要安装PAGConvertor工具（可从 https://pag.io 获取）</li>
 * </ul>
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Service
public class VideoProcessingService {

    private static final Logger logger = Logger.getLogger(VideoProcessingService.class.getName());

    @Autowired
    private com.heartsphere.util.VideoUrlUtils videoUrlUtils;

    @Value("${app.video.storage.local.path:./uploads/videos}")
    private String localStoragePath;

    @Value("${app.video.storage.max-size:104857600}")
    private long maxFileSize;

    @Value("${app.video.storage.supported-formats:mp4,mov,avi,webm}")
    private String supportedFormatsStr;

    @Value("${app.video.processing.animation.default-fps:10}")
    private int defaultFps;

    @Value("${app.video.processing.animation.max-fps:30}")
    private int maxFps;

    @Value("${app.video.processing.animation.default-width:640}")
    private int defaultWidth;

    @Value("${app.video.processing.animation.default-height:480}")
    private int defaultHeight;

    @Value("${app.video.processing.animation.max-duration:30}")
    private int maxDuration;

    @Value("${app.video.processing.animation.default-quality:medium}")
    private String defaultQuality;

    @Value("${app.video.processing.ffmpeg-path:}")
    private String configuredFfmpegPath;

    @Value("${app.video.processing.animation.pag.convertor-path:}")
    private String configuredPagConvertorPath;

    private List<String> supportedFormats;
    private String ffmpegPath; // 实际使用的 FFmpeg 路径
    private String pagConvertorPath; // 实际使用的 PAGConvertor 路径

    @jakarta.annotation.PostConstruct
    public void init() {
        // 解析支持的格式列表
        supportedFormats = Arrays.asList(supportedFormatsStr.toLowerCase().split(","));
        logger.info("支持的视频格式: " + supportedFormats);
        
        // 确保视频存储目录存在
        try {
            Path videoPath = Paths.get(localStoragePath);
            if (!Files.exists(videoPath)) {
                Files.createDirectories(videoPath);
                logger.info("视频存储目录已创建: " + videoPath.toAbsolutePath());
            }
        } catch (IOException e) {
            logger.severe("创建视频存储目录失败: " + e.getMessage());
        }
        
        // 初始化 FFmpeg 路径
        ffmpegPath = detectFfmpegPath();
        logger.info("FFmpeg 路径: " + ffmpegPath);
        
        // 初始化 PAGConvertor 路径
        logger.info("开始检测 PAGConvertor 工具...");
        logger.info("当前工作目录: " + System.getProperty("user.dir"));
        pagConvertorPath = detectPagConvertorPath();
        if (pagConvertorPath != null) {
            logger.info("✓ PAGConvertor 已找到，路径: " + pagConvertorPath);
            // 验证路径是否真的可用
            File pagConvertorFile = new File(pagConvertorPath);
            if (!pagConvertorFile.exists() || !pagConvertorFile.canExecute()) {
                logger.warning("⚠ PAGConvertor 路径存在但不可执行: " + pagConvertorPath);
                logger.warning("  文件存在: " + pagConvertorFile.exists() + ", 可执行: " + (pagConvertorFile.exists() ? pagConvertorFile.canExecute() : false));
                pagConvertorPath = null;
            }
        }
        if (pagConvertorPath == null) {
            logger.warning("✗ 未找到 PAGConvertor 工具，PAG 转换功能将不可用。");
            logger.warning("  请检查以下位置之一：");
            logger.warning("  1. backend/tools/bin/PAGConvertor (当前工作目录: " + System.getProperty("user.dir") + ")");
            logger.warning("  2. 环境变量 PAG_CONVERTOR_PATH");
            logger.warning("  3. 系统 PATH 中的 PAGConvertor");
        }
    }
    
    /**
     * 检测并返回 FFmpeg 可执行文件的路径
     * 优先级：配置的路径 > 环境变量 FFMPEG_PATH > 系统 PATH > 本地工具目录
     */
    private String detectFfmpegPath() {
        // 1. 检查配置的路径
        if (configuredFfmpegPath != null && !configuredFfmpegPath.trim().isEmpty()) {
            File ffmpegFile = new File(configuredFfmpegPath);
            if (ffmpegFile.exists() && ffmpegFile.canExecute()) {
                logger.info("使用配置的 FFmpeg 路径: " + configuredFfmpegPath);
                return configuredFfmpegPath;
            } else {
                logger.warning("配置的 FFmpeg 路径不可用: " + configuredFfmpegPath);
            }
        }
        
        // 2. 检查环境变量
        String envPath = System.getenv("FFMPEG_PATH");
        if (envPath != null && !envPath.trim().isEmpty()) {
            File ffmpegFile = new File(envPath);
            if (ffmpegFile.exists() && ffmpegFile.canExecute()) {
                logger.info("使用环境变量的 FFmpeg 路径: " + envPath);
                return envPath;
            }
        }
        
        // 3. 检查系统 PATH
        try {
            ProcessBuilder pb = new ProcessBuilder("ffmpeg", "-version");
            pb.redirectErrorStream(true);
            Process process = pb.start();
            int exitCode = process.waitFor();
            if (exitCode == 0) {
                logger.info("使用系统 PATH 中的 FFmpeg");
                return "ffmpeg";
            }
        } catch (Exception e) {
            // 系统 PATH 中没有 ffmpeg，继续检查本地工具目录
        }
        
        // 4. 检查本地工具目录（backend/tools/bin/ffmpeg）
        try {
            // 尝试多种可能的路径：相对于当前目录、相对于工作目录、绝对路径
            String[] possiblePaths = {
                "tools/bin/ffmpeg",
                "./tools/bin/ffmpeg",
                "../tools/bin/ffmpeg",
                System.getProperty("user.dir") + "/tools/bin/ffmpeg",
                System.getProperty("user.dir") + "/backend/tools/bin/ffmpeg"
            };
            
            for (String pathStr : possiblePaths) {
                try {
                    Path localFfmpegPath = Paths.get(pathStr).toAbsolutePath().normalize();
                    File localFfmpegFile = localFfmpegPath.toFile();
                    if (localFfmpegFile.exists() && localFfmpegFile.canExecute()) {
                        logger.info("使用本地工具目录的 FFmpeg: " + localFfmpegPath);
                        return localFfmpegPath.toString();
                    }
                } catch (Exception ignored) {
                    // 继续尝试下一个路径
                }
            }
        } catch (Exception e) {
            logger.warning("无法访问本地工具目录的 FFmpeg: " + e.getMessage());
        }
        
        // 5. 如果都找不到，返回默认值（会在使用时尝试）
        logger.warning("未找到 FFmpeg，将使用默认路径 'ffmpeg'（如果系统 PATH 中有）");
        return "ffmpeg";
    }
    
    /**
     * 检测并返回 PAGConvertor 可执行文件的路径
     * 优先级：配置的路径 > 环境变量 PAG_CONVERTOR_PATH > 系统 PATH > 本地工具目录
     */
    private String detectPagConvertorPath() {
        // 1. 检查配置的路径
        if (configuredPagConvertorPath != null && !configuredPagConvertorPath.trim().isEmpty()) {
            File pagConvertorFile = new File(configuredPagConvertorPath);
            if (pagConvertorFile.exists() && pagConvertorFile.canExecute()) {
                logger.info("使用配置的 PAGConvertor 路径: " + configuredPagConvertorPath);
                return configuredPagConvertorPath;
            } else {
                logger.warning("配置的 PAGConvertor 路径不可用: " + configuredPagConvertorPath);
            }
        }
        
        // 2. 检查环境变量
        String envPath = System.getenv("PAG_CONVERTOR_PATH");
        if (envPath != null && !envPath.trim().isEmpty()) {
            File pagConvertorFile = new File(envPath);
            if (pagConvertorFile.exists() && pagConvertorFile.canExecute()) {
                logger.info("使用环境变量的 PAGConvertor 路径: " + envPath);
                return envPath;
            }
        }
        
        // 3. 检查系统 PATH
        try {
            ProcessBuilder pb = new ProcessBuilder("PAGConvertor", "--version");
            pb.redirectErrorStream(true);
            Process process = pb.start();
            int exitCode = process.waitFor();
            if (exitCode == 0 || exitCode == 1) { // 某些工具即使成功也可能返回非0
                logger.info("使用系统 PATH 中的 PAGConvertor");
                return "PAGConvertor";
            }
        } catch (Exception e) {
            // 系统 PATH 中没有 PAGConvertor，继续检查本地工具目录
        }
        
        // 4. 检查本地工具目录（backend/tools/bin/PAGConvertor）
        try {
            // 获取当前工作目录和类路径
            String userDir = System.getProperty("user.dir");
            String classPath = VideoProcessingService.class.getProtectionDomain()
                    .getCodeSource().getLocation().getPath();
            
            // 构建可能的路径列表
            java.util.List<String> possiblePaths = new java.util.ArrayList<>();
            
            // 相对于当前工作目录
            possiblePaths.add("tools/bin/PAGConvertor");
            possiblePaths.add("./tools/bin/PAGConvertor");
            possiblePaths.add("../tools/bin/PAGConvertor");
            
            // 使用 user.dir
            if (userDir != null && !userDir.isEmpty()) {
                possiblePaths.add(userDir + "/tools/bin/PAGConvertor");
                possiblePaths.add(userDir + "/backend/tools/bin/PAGConvertor");
                // 如果是 backend 目录
                if (userDir.endsWith("backend")) {
                    possiblePaths.add(userDir + "/tools/bin/PAGConvertor");
                } else {
                    possiblePaths.add(userDir + "/backend/tools/bin/PAGConvertor");
                }
            }
            
            // 从类路径推导（通常 target/classes），需要处理 URL 编码和路径问题
            try {
                if (classPath != null) {
                    // 处理 URL 编码
                    if (classPath.startsWith("file:")) {
                        classPath = classPath.substring(5);
                    }
                    // 处理 URL 编码的路径
                    try {
                        classPath = java.net.URLDecoder.decode(classPath, "UTF-8");
                    } catch (Exception ignored) {}
                    
                    if (classPath.contains("target/classes")) {
                        String projectRoot = classPath.substring(0, classPath.indexOf("target/classes"));
                        if (!projectRoot.endsWith("/") && !projectRoot.endsWith("\\")) {
                            projectRoot += "/";
                        }
                        possiblePaths.add(projectRoot + "backend/tools/bin/PAGConvertor");
                        possiblePaths.add(projectRoot + "tools/bin/PAGConvertor");
                    }
                }
            } catch (Exception e) {
                logger.warning("从类路径推导项目根目录失败: " + e.getMessage());
            }
            
            // 尝试所有路径
            for (String pathStr : possiblePaths) {
                try {
                    Path localPagConvertorPath = Paths.get(pathStr).toAbsolutePath().normalize();
                    File localPagConvertorFile = localPagConvertorPath.toFile();
                    
                    logger.info("检查 PAGConvertor 路径: " + localPagConvertorPath + 
                               " (存在: " + localPagConvertorFile.exists() + 
                               ", 可执行: " + (localPagConvertorFile.exists() ? localPagConvertorFile.canExecute() : false) + ")");
                    
                    if (localPagConvertorFile.exists() && localPagConvertorFile.canExecute()) {
                        logger.info("✓ 找到并使用本地工具目录的 PAGConvertor: " + localPagConvertorPath);
                        return localPagConvertorPath.toString();
                    }
                } catch (Exception e) {
                    logger.warning("检查路径失败: " + pathStr + " - " + e.getMessage());
                    // 继续尝试下一个路径
                }
            }
            
            // 如果以上都失败，尝试直接使用已知的绝对路径（如果 user.dir 是项目根目录）
            if (userDir != null && !userDir.isEmpty()) {
                try {
                    // 假设 user.dir 可能是项目根目录或 backend 目录
                    String[] testPaths = {
                        userDir + "/backend/tools/bin/PAGConvertor",
                        userDir + "/tools/bin/PAGConvertor"
                    };
                    
                    for (String testPath : testPaths) {
                        Path testPathObj = Paths.get(testPath).toAbsolutePath().normalize();
                        File testFile = testPathObj.toFile();
                        if (testFile.exists() && testFile.canExecute()) {
                            logger.info("✓ 通过绝对路径找到 PAGConvertor: " + testPathObj);
                            return testPathObj.toString();
                        }
                    }
                } catch (Exception e) {
                    logger.warning("绝对路径检测失败: " + e.getMessage());
                }
            }
        } catch (Exception e) {
            logger.warning("无法访问本地工具目录的 PAGConvertor: " + e.getMessage());
        }
        
        // 5. 如果都找不到，返回 null（PAG 转换功能将不可用）
        return null;
    }
    
    /**
     * 检查 PAG 转换功能是否可用
     * @return true 如果 PAGConvertor 工具可用，false 否则
     */
    public boolean isPagConversionAvailable() {
        return pagConvertorPath != null && !pagConvertorPath.trim().isEmpty();
    }

    /**
     * 验证视频文件格式
     */
    public boolean validateVideoFormat(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return false;
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("video/")) {
            return false;
        }

        // 检查文件扩展名
        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null) {
            return false;
        }

        String extension = getFileExtension(originalFilename).toLowerCase();
        return supportedFormats.contains(extension);
    }

    /**
     * 获取视频信息
     */
    public VideoInfo getVideoInfo(String videoPath) throws IOException {
        if (videoPath == null || videoPath.isEmpty()) {
            throw new IllegalArgumentException("视频路径不能为空");
        }

        // 如果是URL，转换为相对路径
        String relativePath = videoPath;
        if (videoPath.startsWith("http://") || videoPath.startsWith("https://")) {
            relativePath = videoUrlUtils.toRelativePath(videoPath);
            if (relativePath == null || relativePath.startsWith("http://") || relativePath.startsWith("https://")) {
                throw new IllegalArgumentException("无法处理外部URL: " + videoPath);
            }
        }

        // 构建文件路径
        Path filePath = Paths.get(localStoragePath, relativePath);

        if (!Files.exists(filePath)) {
            throw new IOException("视频文件不存在: " + filePath.toAbsolutePath());
        }

        try {
            File videoFile = filePath.toFile();
            MultimediaObject multimediaObject = new MultimediaObject(videoFile);
            MultimediaInfo info = multimediaObject.getInfo();

            // 使用完整限定名避免与自定义 VideoInfo 类冲突
            ws.schild.jave.info.VideoInfo javeVideoInfo = info.getVideo();

            int width = 0;
            int height = 0;
            double frameRate = 0.0;
            String codec = "unknown";

            if (javeVideoInfo != null) {
                VideoSize size = javeVideoInfo.getSize();
                if (size != null) {
                    width = size.getWidth();
                    height = size.getHeight();
                }
                frameRate = javeVideoInfo.getFrameRate();
                codec = javeVideoInfo.getDecoder();
            }

            long fileSize = Files.size(filePath);
            double duration = info.getDuration() / 1000.0; // 转换为秒
            String format = info.getFormat();

            logger.info("提取视频信息: " + filePath.toAbsolutePath() + " - " + 
                       width + "x" + height + ", " + duration + "s, " + frameRate + "fps");

            // 使用完整限定名，返回自定义的 VideoInfo 类
            return new com.heartsphere.service.video.VideoInfo(width, height, fileSize, duration, frameRate, format, codec);
        } catch (EncoderException e) {
            throw new IOException("无法读取视频信息: " + e.getMessage(), e);
        }
    }

    /**
     * 转换视频为动画格式（通用方法）
     */
    public String convertToAnimation(String videoPath, VideoToAnimationOptions options) throws IOException {
        if (options == null || options.getOutputFormat() == null) {
            throw new IllegalArgumentException("输出格式不能为空");
        }

        AnimationFormat format = options.getOutputFormat();
        switch (format) {
            case GIF:
                return convertToGif(videoPath, options);
            case LOTTIE:
                return convertToLottie(videoPath, options);
            case PAG:
                return convertToPag(videoPath, options);
            default:
                throw new IllegalArgumentException("不支持的动画格式: " + format);
        }
    }

    /**
     * 转换视频为GIF
     */
    public String convertToGif(String videoPath, VideoToAnimationOptions options) throws IOException {
        logger.info("开始转换视频为GIF: " + videoPath);

        // 如果是URL，转换为相对路径
        String relativePath = videoPath;
        if (videoPath.startsWith("http://") || videoPath.startsWith("https://")) {
            relativePath = videoUrlUtils.toRelativePath(videoPath);
            if (relativePath == null || relativePath.startsWith("http://") || relativePath.startsWith("https://")) {
                throw new IllegalArgumentException("无法处理外部URL: " + videoPath);
            }
        }

        Path videoFilePath = Paths.get(localStoragePath, relativePath);
        if (!Files.exists(videoFilePath)) {
            throw new IOException("视频文件不存在: " + videoFilePath.toAbsolutePath());
        }

        try {
            // 获取视频信息（返回自定义的 VideoInfo 类）
            com.heartsphere.service.video.VideoInfo videoInfoObj = getVideoInfo(videoPath);

            // 应用默认值
            int fps = (options.getFps() != null && options.getFps() > 0) ? 
                    Math.min(options.getFps(), maxFps) : defaultFps;
            int width = (options.getWidth() != null && options.getWidth() > 0) ? 
                    options.getWidth() : defaultWidth;
            int height = (options.getHeight() != null && options.getHeight() > 0) ? 
                    options.getHeight() : defaultHeight;
            boolean keepAspectRatio = (options.getKeepAspectRatio() != null) ? 
                    options.getKeepAspectRatio() : true;
            String quality = (options.getQuality() != null) ? options.getQuality() : defaultQuality;

            // 计算实际尺寸（保持宽高比）
            if (keepAspectRatio && videoInfoObj.getWidth() > 0 && videoInfoObj.getHeight() > 0) {
                double aspectRatio = (double) videoInfoObj.getWidth() / videoInfoObj.getHeight();
                if (width > 0 && height > 0) {
                    if (width * aspectRatio <= height) {
                        height = (int) (width / aspectRatio);
                    } else {
                        width = (int) (height * aspectRatio);
                    }
                }
            }

            // 处理时长限制
            double duration = videoInfoObj.getDuration();
            if (options.getStartTime() != null && options.getStartTime() > 0) {
                duration -= options.getStartTime();
            }
            if (options.getDuration() != null && options.getDuration() > 0) {
                duration = Math.min(duration, options.getDuration());
            }
            duration = Math.min(duration, maxDuration);

            // 生成输出文件名
            Path videoDir = videoFilePath.getParent();
            String originalName = videoFilePath.getFileName().toString();
            String nameWithoutExt = originalName.substring(0, originalName.lastIndexOf('.'));
            String outputFilename = nameWithoutExt + "_animation_" + width + "x" + height + "_" + fps + "fps.gif";
            Path outputPath = videoDir.resolve(outputFilename);

            // 使用FFmpeg转换（通过JAVE库）
            File inputFile = videoFilePath.toFile();
            File outputFile = outputPath.toFile();

            // 设置视频属性
            VideoAttributes videoAttributes = new VideoAttributes();
            videoAttributes.setCodec("gif");
            videoAttributes.setBitRate(calculateGifBitrate(quality, width, height, fps));

            // 设置编码属性
            EncodingAttributes encodingAttributes = new EncodingAttributes();
            encodingAttributes.setOutputFormat("gif");  // 使用 setOutputFormat 而不是 setFormat
            encodingAttributes.setVideoAttributes(videoAttributes);
            // 尺寸和帧率在 VideoAttributes 中设置
            if (width > 0 && height > 0) {
                videoAttributes.setSize(new ws.schild.jave.info.VideoSize(width, height));
            }
            if (fps > 0) {
                videoAttributes.setFrameRate(fps);
            }

            // 设置开始时间和时长（JAVE 3.5.0 API 使用 Float 类型，单位是秒）
            if (options.getStartTime() != null && options.getStartTime() > 0) {
                encodingAttributes.setOffset(options.getStartTime().floatValue()); // 秒
            }
            if (duration > 0) {
                encodingAttributes.setDuration((float) duration); // 秒（Float类型）
            }

            // 执行转换
            Encoder encoder = new Encoder();
            encoder.encode(new MultimediaObject(inputFile), outputFile, encodingAttributes);

            // 返回相对路径
            Path localStoragePathObj = Paths.get(localStoragePath);
            Path relativeOutputPath = localStoragePathObj.relativize(outputPath);
            String result = relativeOutputPath.toString().replace("\\", "/");

            logger.info("GIF转换成功: " + result);
            return result;

        } catch (EncoderException e) {
            throw new IOException("GIF转换失败: " + e.getMessage(), e);
        }
    }

    /**
     * 转换视频为Lottie JSON动画
     * 
     * 实现策略：
     * 1. 使用FFmpeg提取视频帧为图片序列
     * 2. 将图片序列转换为Base64编码
     * 3. 生成Lottie JSON格式，包含图片序列动画
     * 
     * @param videoPath 视频路径或URL
     * @param options 转换选项
     * @return Lottie JSON文件相对路径
     * @throws IOException 如果转换失败
     */
    public String convertToLottie(String videoPath, VideoToAnimationOptions options) throws IOException {
        logger.info("开始转换视频为Lottie: " + videoPath);
        
        // 获取视频文件路径
        String relativePath = videoPath;
        if (videoPath.startsWith("http://") || videoPath.startsWith("https://")) {
            relativePath = videoUrlUtils.toRelativePath(videoPath);
            if (relativePath == null || relativePath.startsWith("http://") || relativePath.startsWith("https://")) {
                throw new IllegalArgumentException("无法处理外部URL: " + videoPath);
            }
        }
        Path videoFilePath = Paths.get(localStoragePath, relativePath);
        if (!Files.exists(videoFilePath)) {
            throw new IOException("视频文件不存在: " + videoFilePath.toAbsolutePath());
        }
        
        // 获取视频信息
        VideoInfo videoInfoObj = getVideoInfo(videoPath);
        
        // 确定转换参数
        int fps = options.getFps() != null ? Math.min(options.getFps(), maxFps) : defaultFps;
        int width = options.getWidth() != null ? options.getWidth() : defaultWidth;
        int height = options.getHeight() != null ? options.getHeight() : defaultHeight;
        boolean keepAspectRatio = options.getKeepAspectRatio() != null ? options.getKeepAspectRatio() : true;
        int precision = options.getLottiePrecision() != null ? options.getLottiePrecision() : 3;
        boolean optimize = options.getLottieOptimize() != null ? options.getLottieOptimize() : true;
        
        // 计算实际尺寸（保持宽高比）
        if (keepAspectRatio && videoInfoObj.getWidth() > 0 && videoInfoObj.getHeight() > 0) {
            double aspectRatio = (double) videoInfoObj.getWidth() / videoInfoObj.getHeight();
            if (width > 0 && height > 0) {
                if (width * aspectRatio <= height) {
                    height = (int) (width / aspectRatio);
                } else {
                    width = (int) (height * aspectRatio);
                }
            }
        }
        
        // 处理时长限制
        double duration = videoInfoObj.getDuration();
        if (options.getStartTime() != null && options.getStartTime() > 0) {
            duration -= options.getStartTime();
        }
        if (options.getDuration() != null && options.getDuration() > 0) {
            duration = Math.min(duration, options.getDuration());
        }
        duration = Math.min(duration, maxDuration);
        
        // 创建临时目录用于存储提取的帧
        Path tempFramesDir = Files.createTempDirectory("lottie-frames-");
        try {
            // 1. 使用FFmpeg提取视频帧为图片序列
            logger.info("提取视频帧: " + fps + " fps, 尺寸: " + width + "x" + height);
            extractVideoFrames(videoFilePath.toFile(), tempFramesDir.toFile(), fps, width, height, 
                              options.getStartTime(), duration);
            
            // 2. 读取所有帧图片
            List<Path> frameFiles = Files.list(tempFramesDir)
                    .filter(Files::isRegularFile)
                    .filter(p -> p.toString().toLowerCase().endsWith(".png"))
                    .sorted()
                    .collect(java.util.stream.Collectors.toList());
            
            if (frameFiles.isEmpty()) {
                throw new IOException("未能提取视频帧");
            }
            
            logger.info("提取了 " + frameFiles.size() + " 帧");
            
            // 3. 生成Lottie JSON
            String lottieJson = generateLottieJson(frameFiles, fps, width, height, precision, optimize);
            
            // 4. 保存Lottie JSON文件
            Path videoDir = videoFilePath.getParent();
            String originalName = videoFilePath.getFileName().toString();
            String nameWithoutExt = originalName.substring(0, originalName.lastIndexOf('.'));
            String outputFilename = nameWithoutExt + "_animation_" + width + "x" + height + "_" + fps + "fps.json";
            Path outputPath = videoDir.resolve(outputFilename);
            
            Files.write(outputPath, lottieJson.getBytes(java.nio.charset.StandardCharsets.UTF_8));
            
            // 返回相对路径
            Path localStoragePathObj = Paths.get(localStoragePath);
            Path relativeOutputPath = localStoragePathObj.relativize(outputPath);
            String result = relativeOutputPath.toString().replace("\\", "/");
            
            logger.info("Lottie转换成功: " + result);
            return result;
            
        } finally {
            // 清理临时目录
            try {
                java.nio.file.Files.walkFileTree(tempFramesDir, new java.nio.file.SimpleFileVisitor<Path>() {
                    @Override
                    public java.nio.file.FileVisitResult visitFile(Path file, java.nio.file.attribute.BasicFileAttributes attrs) throws IOException {
                        Files.delete(file);
                        return java.nio.file.FileVisitResult.CONTINUE;
                    }
                    @Override
                    public java.nio.file.FileVisitResult postVisitDirectory(Path dir, IOException exc) throws IOException {
                        Files.delete(dir);
                        return java.nio.file.FileVisitResult.CONTINUE;
                    }
                });
            } catch (IOException e) {
                logger.warning("清理临时目录失败: " + e.getMessage());
            }
        }
    }
    
    /**
     * 提取视频帧为图片序列
     */
    private void extractVideoFrames(File videoFile, File outputDir, int fps, int width, int height,
                                     Double startTime, double duration) throws IOException {
        // 直接使用ProcessBuilder调用FFmpeg命令行
        extractFramesWithFFmpeg(videoFile, outputDir, fps, width, height, startTime, duration);
    }
    
    /**
     * 使用ProcessBuilder直接调用FFmpeg提取帧
     */
    private void extractFramesWithFFmpeg(File videoFile, File outputDir, int fps, int width, int height,
                                          Double startTime, double duration) throws IOException {
        java.util.List<String> command = new java.util.ArrayList<>();
        command.add(ffmpegPath != null ? ffmpegPath : "ffmpeg");
        
        if (startTime != null && startTime > 0) {
            command.add("-ss");
            command.add(String.format("%.3f", startTime));
        }
        
        command.add("-i");
        command.add(videoFile.getAbsolutePath());
        
        if (duration > 0) {
            command.add("-t");
            command.add(String.format("%.3f", duration));
        }
        
        command.add("-vf");
        String filter = "fps=" + fps;
        if (width > 0 && height > 0) {
            filter += ",scale=" + width + ":" + height;
        }
        command.add(filter);
        
        command.add("-y"); // 覆盖输出文件
        command.add(Paths.get(outputDir.getAbsolutePath(), "frame_%04d.png").toString());
        
        logger.info("执行FFmpeg命令: " + String.join(" ", command));
        
        ProcessBuilder processBuilder = new ProcessBuilder(command);
        processBuilder.redirectErrorStream(true);
        Process process = processBuilder.start();
        
        try {
            int exitCode = process.waitFor();
            if (exitCode != 0) {
                // 读取错误输出
                java.io.BufferedReader reader = new java.io.BufferedReader(
                    new java.io.InputStreamReader(process.getInputStream()));
                StringBuilder errorOutput = new StringBuilder();
                String line;
                while ((line = reader.readLine()) != null) {
                    errorOutput.append(line).append("\n");
                }
                throw new IOException("FFmpeg提取帧失败 (exit code: " + exitCode + "): " + errorOutput.toString());
            }
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new IOException("FFmpeg提取帧被中断", e);
        }
    }
    
    /**
     * 生成Lottie JSON格式
     */
    private String generateLottieJson(List<Path> frameFiles, int fps, int width, int height, 
                                       int precision, boolean optimize) throws IOException {
        // Lottie JSON基本结构
        java.util.Map<String, Object> lottie = new java.util.HashMap<>();
        lottie.put("v", "5.7.4"); // Lottie版本
        lottie.put("fr", fps); // 帧率
        lottie.put("ip", 0); // 起始帧
        lottie.put("op", frameFiles.size() * fps / fps); // 结束帧（总帧数）
        lottie.put("w", width);
        lottie.put("h", height);
        lottie.put("nm", "Video Animation");
        lottie.put("ddd", 0);
        
        // 资源（图片）
        java.util.List<java.util.Map<String, Object>> assets = new java.util.ArrayList<>();
        for (int i = 0; i < frameFiles.size(); i++) {
            Path frameFile = frameFiles.get(i);
            byte[] imageData = Files.readAllBytes(frameFile);
            String base64Image = java.util.Base64.getEncoder().encodeToString(imageData);
            
            java.util.Map<String, Object> asset = new java.util.HashMap<>();
            asset.put("id", "image_" + i);
            asset.put("w", width);
            asset.put("h", height);
            asset.put("u", ""); // 图片路径（空，因为使用Base64）
            asset.put("p", "data:image/png;base64," + base64Image);
            assets.add(asset);
        }
        lottie.put("assets", assets);
        
        // 图层（每一帧作为一个图层）
        java.util.List<java.util.Map<String, Object>> layers = new java.util.ArrayList<>();
        double frameDuration = 1.0 / fps; // 每帧持续时间（秒）
        
        for (int i = 0; i < frameFiles.size(); i++) {
            java.util.Map<String, Object> layer = new java.util.HashMap<>();
            layer.put("ddd", 0);
            layer.put("ind", i + 1);
            layer.put("ty", 2); // 图片图层类型
            layer.put("nm", "Frame " + (i + 1));
            layer.put("sr", 1);
            layer.put("ks", createTransformObject(0, 0, 0, 0, 100, 100, precision));
            layer.put("ao", 0);
            
            // 图片资源引用
            java.util.Map<String, Object> refId = new java.util.HashMap<>();
            refId.put("a", false);
            refId.put("k", "image_" + i);
            layer.put("refId", refId);
            
            // 时间范围
            java.util.Map<String, Object> timeRemap = new java.util.HashMap<>();
            timeRemap.put("a", false);
            timeRemap.put("k", i * frameDuration * fps);
            layer.put("tm", timeRemap);
            
            // 开始和结束时间
            layer.put("ip", i * fps / fps); // 开始帧
            layer.put("op", (i + 1) * fps / fps); // 结束帧
            layer.put("st", 0);
            layer.put("bm", 0);
            
            layers.add(layer);
        }
        lottie.put("layers", layers);
        
        // 转换为JSON字符串
        try {
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            mapper.enable(com.fasterxml.jackson.databind.SerializationFeature.INDENT_OUTPUT);
            return mapper.writeValueAsString(lottie);
        } catch (com.fasterxml.jackson.core.JsonProcessingException e) {
            throw new IOException("生成Lottie JSON失败", e);
        }
    }
    
    /**
     * 创建变换对象（位置、旋转、缩放等）
     */
    private java.util.Map<String, Object> createTransformObject(double x, double y, double rotation, 
                                                                  double opacity, double scaleX, double scaleY, 
                                                                  int precision) {
        java.util.Map<String, Object> transform = new java.util.HashMap<>();
        
        // 位置
        java.util.Map<String, Object> position = new java.util.HashMap<>();
        position.put("a", false);
        double[] posValues = {round(x, precision), round(y, precision)};
        position.put("k", posValues);
        transform.put("p", position);
        
        // 锚点
        java.util.Map<String, Object> anchor = new java.util.HashMap<>();
        anchor.put("a", false);
        double[] anchorValues = {0.0, 0.0};
        anchor.put("k", anchorValues);
        transform.put("a", anchor);
        
        // 缩放
        java.util.Map<String, Object> scale = new java.util.HashMap<>();
        scale.put("a", false);
        double[] scaleValues = {round(scaleX, precision), round(scaleY, precision)};
        scale.put("k", scaleValues);
        transform.put("s", scale);
        
        // 旋转
        java.util.Map<String, Object> rot = new java.util.HashMap<>();
        rot.put("a", false);
        rot.put("k", round(rotation, precision));
        transform.put("r", rot);
        
        // 透明度
        java.util.Map<String, Object> op = new java.util.HashMap<>();
        op.put("a", false);
        op.put("k", round(opacity, precision));
        transform.put("o", op);
        
        return transform;
    }
    
    /**
     * 四舍五入到指定精度
     */
    private double round(double value, int precision) {
        double factor = Math.pow(10, precision);
        return Math.round(value * factor) / factor;
    }

    /**
     * 转换视频为PAG格式
     * 
     * 实现策略：
     * 1. 尝试使用PAGConvertor工具（如果可用）直接转换视频
     * 2. 如果PAGConvertor不可用，先转换为GIF，再尝试转换
     * 3. 或者先提取视频帧，然后使用PAG工具转换
     * 
     * 注意：PAGConvertor是腾讯提供的命令行工具，需要单独安装
     * 
     * @param videoPath 视频路径或URL
     * @param options 转换选项
     * @return PAG文件相对路径
     * @throws IOException 如果转换失败
     */
    public String convertToPag(String videoPath, VideoToAnimationOptions options) throws IOException {
        logger.info("开始转换视频为PAG: " + videoPath);
        
        // 获取视频文件路径
        String relativePath = videoPath;
        if (videoPath.startsWith("http://") || videoPath.startsWith("https://")) {
            relativePath = videoUrlUtils.toRelativePath(videoPath);
            if (relativePath == null || relativePath.startsWith("http://") || relativePath.startsWith("https://")) {
                throw new IllegalArgumentException("无法处理外部URL: " + videoPath);
            }
        }
        Path videoFilePath = Paths.get(localStoragePath, relativePath);
        if (!Files.exists(videoFilePath)) {
            throw new IOException("视频文件不存在: " + videoFilePath.toAbsolutePath());
        }
        
        // 获取视频信息
        VideoInfo videoInfoObj = getVideoInfo(videoPath);
        
        // 确定转换参数
        int fps = options.getFps() != null ? Math.min(options.getFps(), maxFps) : defaultFps;
        int width = options.getWidth() != null ? options.getWidth() : defaultWidth;
        int height = options.getHeight() != null ? options.getHeight() : defaultHeight;
        boolean keepAspectRatio = options.getKeepAspectRatio() != null ? options.getKeepAspectRatio() : true;
        int compressionLevel = options.getPagCompressionLevel() != null ? options.getPagCompressionLevel() : 6;
        
        // 计算实际尺寸（保持宽高比）
        if (keepAspectRatio && videoInfoObj.getWidth() > 0 && videoInfoObj.getHeight() > 0) {
            double aspectRatio = (double) videoInfoObj.getWidth() / videoInfoObj.getHeight();
            if (width > 0 && height > 0) {
                if (width * aspectRatio <= height) {
                    height = (int) (width / aspectRatio);
                } else {
                    width = (int) (height * aspectRatio);
                }
            }
        }
        
        // 处理时长限制
        double duration = videoInfoObj.getDuration();
        if (options.getStartTime() != null && options.getStartTime() > 0) {
            duration -= options.getStartTime();
        }
        if (options.getDuration() != null && options.getDuration() > 0) {
            duration = Math.min(duration, options.getDuration());
        }
        duration = Math.min(duration, maxDuration);
        
        // 生成输出文件名
        Path videoDir = videoFilePath.getParent();
        String originalName = videoFilePath.getFileName().toString();
        String nameWithoutExt = originalName.substring(0, originalName.lastIndexOf('.'));
        String outputFilename = nameWithoutExt + "_animation_" + width + "x" + height + "_" + fps + "fps.pag";
        Path outputPath = videoDir.resolve(outputFilename);
        
        // 使用检测到的 PAGConvertor 路径
        if (pagConvertorPath != null && !pagConvertorPath.trim().isEmpty()) {
            // 使用PAGConvertor转换
            try {
                convertToPagWithTool(videoFilePath.toFile(), outputPath.toFile(), pagConvertorPath, 
                                    fps, width, height, options.getStartTime(), duration, compressionLevel);
                
                // 返回相对路径
                Path localStoragePathObj = Paths.get(localStoragePath);
                Path relativeOutputPath = localStoragePathObj.relativize(outputPath);
                String result = relativeOutputPath.toString().replace("\\", "/");
                
                logger.info("PAG转换成功: " + result);
                return result;
            } catch (IOException e) {
                logger.warning("PAGConvertor直接转换失败: " + e.getMessage());
                logger.info("尝试备用方案：提取帧后转换");
                // 继续尝试备用方案
                try {
                    return convertToPagWithFrames(videoFilePath, outputPath, fps, width, height, 
                                                  options.getStartTime(), duration, compressionLevel);
                } catch (Exception e2) {
                    logger.severe("PAG转换备用方案也失败: " + e2.getMessage());
                    // 抛出原始的 IOException，而不是 UnsupportedOperationException
                    throw new IOException("PAG转换失败: " + e.getMessage() + "; 备用方案失败: " + e2.getMessage(), e);
                }
            }
        } else {
            // PAGConvertor 工具不可用
            throw new IOException("PAG转换功能需要安装PAGConvertor工具。请安装PAGConvertor工具（可从 https://pag.io 获取），" +
                                "或设置环境变量 PAG_CONVERTOR_PATH 指向工具路径，然后重试。");
        }
    }
    
    /**
     * 使用PAGConvertor工具转换视频
     */
    private void convertToPagWithTool(File videoFile, File outputFile, String pagConvertorPath,
                                      int fps, int width, int height, Double startTime, 
                                      double duration, int compressionLevel) throws IOException {
        java.util.List<String> command = new java.util.ArrayList<>();
        command.add(pagConvertorPath);
        command.add(videoFile.getAbsolutePath());
        
        // PAGConvertor参数：<video filePath> [frame_rate]
        // frame_rate 是可选参数，但我们传入以确保帧率正确
        command.add(String.valueOf(fps));
        
        logger.info("执行PAGConvertor命令: " + String.join(" ", command));
        
        ProcessBuilder processBuilder = new ProcessBuilder(command);
        processBuilder.redirectErrorStream(true);
        // 设置工作目录为视频文件所在目录，而不是输出文件所在目录
        // 这样可以避免 PAGConvertor 尝试访问不存在的目录
        File workDir = videoFile.getParentFile();
        if (workDir == null || !workDir.exists()) {
            // 如果视频文件没有父目录，使用系统临时目录
            workDir = new File(System.getProperty("java.io.tmpdir"));
        }
        processBuilder.directory(workDir);
        logger.info("PAGConvertor工作目录: " + workDir.getAbsolutePath());
        
        Process process = processBuilder.start();
        
        try {
            // 读取输出（包括错误输出）
            java.io.BufferedReader reader = new java.io.BufferedReader(
                new java.io.InputStreamReader(process.getInputStream()));
            StringBuilder output = new StringBuilder();
            String line;
            while ((line = reader.readLine()) != null) {
                output.append(line).append("\n");
                logger.info("PAGConvertor输出: " + line);
            }
            
            int exitCode = process.waitFor();
            if (exitCode != 0) {
                logger.warning("PAGConvertor退出码: " + exitCode);
                logger.warning("PAGConvertor输出: " + output.toString());
                throw new IOException("PAGConvertor转换失败 (exit code: " + exitCode + "): " + output.toString());
            }
            
            // PAGConvertor 会在视频文件所在目录生成 .pag 文件
            // 文件名为视频文件名（不含扩展名）+ ".pag"
            String videoNameWithoutExt = videoFile.getName();
            int lastDotIndex = videoNameWithoutExt.lastIndexOf('.');
            if (lastDotIndex > 0) {
                videoNameWithoutExt = videoNameWithoutExt.substring(0, lastDotIndex);
            }
            File generatedPagFile = new File(workDir, videoNameWithoutExt + ".pag");
            
            // 如果生成的文件存在，移动到目标位置
            if (generatedPagFile.exists()) {
                logger.info("找到生成的PAG文件: " + generatedPagFile.getAbsolutePath());
                // 确保输出目录存在
                File outputDir = outputFile.getParentFile();
                if (outputDir != null && !outputDir.exists()) {
                    outputDir.mkdirs();
                }
                // 复制或移动文件
                java.nio.file.Files.copy(generatedPagFile.toPath(), outputFile.toPath(), 
                    java.nio.file.StandardCopyOption.REPLACE_EXISTING);
                logger.info("PAG文件已复制到: " + outputFile.getAbsolutePath());
            } else {
                // 也检查输出目录
                File[] pagFiles = workDir.listFiles((dir, name) -> name.endsWith(".pag"));
                if (pagFiles != null && pagFiles.length > 0) {
                    logger.info("找到PAG文件（从目录列表）: " + pagFiles[0].getAbsolutePath());
                    java.nio.file.Files.copy(pagFiles[0].toPath(), outputFile.toPath(), 
                        java.nio.file.StandardCopyOption.REPLACE_EXISTING);
                } else if (!outputFile.exists()) {
                    throw new IOException("PAGConvertor未生成输出文件。检查目录: " + workDir.getAbsolutePath());
                }
            }
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new IOException("PAGConvertor转换被中断", e);
        }
    }
    
    /**
     * 通过提取帧的方式转换为PAG
     */
    private String convertToPagWithFrames(Path videoFilePath, Path outputPath, int fps, int width, int height,
                                          Double startTime, double duration, int compressionLevel) throws IOException {
        // 创建临时目录用于存储提取的帧
        Path tempFramesDir = Files.createTempDirectory("pag-frames-");
        try {
            // 1. 提取视频帧
            logger.info("提取视频帧: " + fps + " fps, 尺寸: " + width + "x" + height);
            extractVideoFrames(videoFilePath.toFile(), tempFramesDir.toFile(), fps, width, height, 
                              startTime, duration);
            
            // 2. 使用检测到的 PAGConvertor 路径转换图片序列
            if (pagConvertorPath != null && !pagConvertorPath.trim().isEmpty()) {
                // 使用PAGConvertor转换图片序列
                try {
                    java.util.List<String> command = new java.util.ArrayList<>();
                    command.add(pagConvertorPath);
                    command.add(tempFramesDir.toAbsolutePath().toString());
                    command.add(String.valueOf(fps));
                    
                    logger.info("使用PAGConvertor转换图片序列: " + String.join(" ", command));
                    
                    ProcessBuilder processBuilder = new ProcessBuilder(command);
                    processBuilder.redirectErrorStream(true);
                    Process process = processBuilder.start();
                    
                    int exitCode = process.waitFor();
                    if (exitCode == 0) {
                        // 查找生成的PAG文件
                        java.nio.file.Path[] pagFiles = Files.list(tempFramesDir)
                                .filter(p -> p.toString().endsWith(".pag"))
                                .toArray(java.nio.file.Path[]::new);
                        
                        if (pagFiles.length > 0) {
                            Files.copy(pagFiles[0], outputPath, java.nio.file.StandardCopyOption.REPLACE_EXISTING);
                            
                            // 返回相对路径
                            Path localStoragePathObj = Paths.get(localStoragePath);
                            Path relativeOutputPath = localStoragePathObj.relativize(outputPath);
                            String result = relativeOutputPath.toString().replace("\\", "/");
                            
                            logger.info("PAG转换成功（通过图片序列）: " + result);
                            return result;
                        }
                    }
                } catch (Exception e) {
                    logger.warning("PAGConvertor转换图片序列失败: " + e.getMessage());
                }
            }
            
            // 如果PAGConvertor不可用，抛出 IOException（而不是 UnsupportedOperationException）
            throw new IOException(
                "PAG转换功能需要安装PAGConvertor工具。当前版本无法完成PAG转换。" +
                "请安装PAGConvertor工具（可从 https://pag.io 获取），" +
                "或设置环境变量 PAG_CONVERTOR_PATH 指向工具路径，然后重试。");
            
        } finally {
            // 清理临时目录
            try {
                java.nio.file.Files.walkFileTree(tempFramesDir, new java.nio.file.SimpleFileVisitor<Path>() {
                    @Override
                    public java.nio.file.FileVisitResult visitFile(Path file, java.nio.file.attribute.BasicFileAttributes attrs) throws IOException {
                        Files.delete(file);
                        return java.nio.file.FileVisitResult.CONTINUE;
                    }
                    @Override
                    public java.nio.file.FileVisitResult postVisitDirectory(Path dir, IOException exc) throws IOException {
                        Files.delete(dir);
                        return java.nio.file.FileVisitResult.CONTINUE;
                    }
                });
            } catch (IOException e) {
                logger.warning("清理临时目录失败: " + e.getMessage());
            }
        }
    }

    /**
     * 计算GIF比特率（根据质量）
     */
    private int calculateGifBitrate(String quality, int width, int height, int fps) {
        // 基础比特率计算：像素数 * 帧率 * 颜色深度因子
        int baseBitrate = width * height * fps;
        
        switch (quality.toLowerCase()) {
            case "low":
                return baseBitrate / 8; // 较低比特率
            case "high":
                return baseBitrate * 2; // 较高比特率
            case "medium":
            default:
                return baseBitrate; // 中等比特率
        }
    }

    /**
     * 获取文件扩展名
     */
    private String getFileExtension(String filename) {
        int lastDotIndex = filename.lastIndexOf('.');
        if (lastDotIndex > 0 && lastDotIndex < filename.length() - 1) {
            return filename.substring(lastDotIndex + 1);
        }
        return "";
    }
}
