package com.heartsphere.service.video;

/**
 * 视频转动画选项配置类
 */
public class VideoToAnimationOptions {
    private AnimationFormat outputFormat;
    private Integer fps;
    private Integer width;
    private Integer height;
    private Boolean keepAspectRatio;
    private String quality; // low, medium, high
    private Double startTime; // 开始时间（秒）
    private Double duration; // 时长（秒）
    
    // 格式特定选项
    private Integer lottiePrecision; // Lottie精度
    private Boolean lottieOptimize; // Lottie优化
    private Integer pagCompressionLevel; // PAG压缩级别

    public VideoToAnimationOptions() {
    }

    public AnimationFormat getOutputFormat() {
        return outputFormat;
    }

    public void setOutputFormat(AnimationFormat outputFormat) {
        this.outputFormat = outputFormat;
    }

    public Integer getFps() {
        return fps;
    }

    public void setFps(Integer fps) {
        this.fps = fps;
    }

    public Integer getWidth() {
        return width;
    }

    public void setWidth(Integer width) {
        this.width = width;
    }

    public Integer getHeight() {
        return height;
    }

    public void setHeight(Integer height) {
        this.height = height;
    }

    public Boolean getKeepAspectRatio() {
        return keepAspectRatio;
    }

    public void setKeepAspectRatio(Boolean keepAspectRatio) {
        this.keepAspectRatio = keepAspectRatio;
    }

    public String getQuality() {
        return quality;
    }

    public void setQuality(String quality) {
        this.quality = quality;
    }

    public Double getStartTime() {
        return startTime;
    }

    public void setStartTime(Double startTime) {
        this.startTime = startTime;
    }

    public Double getDuration() {
        return duration;
    }

    public void setDuration(Double duration) {
        this.duration = duration;
    }

    public Integer getLottiePrecision() {
        return lottiePrecision;
    }

    public void setLottiePrecision(Integer lottiePrecision) {
        this.lottiePrecision = lottiePrecision;
    }

    public Boolean getLottieOptimize() {
        return lottieOptimize;
    }

    public void setLottieOptimize(Boolean lottieOptimize) {
        this.lottieOptimize = lottieOptimize;
    }

    public Integer getPagCompressionLevel() {
        return pagCompressionLevel;
    }

    public void setPagCompressionLevel(Integer pagCompressionLevel) {
        this.pagCompressionLevel = pagCompressionLevel;
    }
}
