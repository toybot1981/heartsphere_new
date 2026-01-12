package com.heartsphere.service.video;

/**
 * 视频信息类
 * 包含视频的元数据信息
 */
public class VideoInfo {
    private final int width;
    private final int height;
    private final long fileSize;
    private final double duration; // 秒
    private final double frameRate; // FPS
    private final String format;
    private final String codec;

    public VideoInfo(int width, int height, long fileSize, double duration, 
                     double frameRate, String format, String codec) {
        this.width = width;
        this.height = height;
        this.fileSize = fileSize;
        this.duration = duration;
        this.frameRate = frameRate;
        this.format = format;
        this.codec = codec;
    }

    public int getWidth() {
        return width;
    }

    public int getHeight() {
        return height;
    }

    public long getFileSize() {
        return fileSize;
    }

    public double getDuration() {
        return duration;
    }

    public double getFrameRate() {
        return frameRate;
    }

    public String getFormat() {
        return format;
    }

    public String getCodec() {
        return codec;
    }

    @Override
    public String toString() {
        return String.format("VideoInfo{width=%d, height=%d, size=%d, duration=%.2fs, fps=%.2f, format='%s', codec='%s'}", 
                width, height, fileSize, duration, frameRate, format, codec);
    }
}
