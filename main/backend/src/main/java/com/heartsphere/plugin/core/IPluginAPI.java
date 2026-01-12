package com.heartsphere.plugin.core;

/**
 * 插件API接口
 * 
 * 提供给插件调用的系统API
 * 
 * @author HeartSphere
 * @version 1.0
 */
public interface IPluginAPI {
    
    /**
     * 获取用户信息
     * 
     * @param userId 用户ID
     * @return 用户信息（JSON格式）
     */
    String getUserInfo(Long userId);
    
    /**
     * 获取场景信息
     * 
     * @param sceneId 场景ID
     * @return 场景信息（JSON格式）
     */
    String getSceneInfo(String sceneId);
    
    /**
     * 调用AI服务
     * 
     * @param prompt 提示词
     * @param context 上下文
     * @return AI响应
     */
    String callAIService(String prompt, String context);
    
    /**
     * 文件上传
     * 
     * @param fileData 文件数据
     * @param fileName 文件名
     * @return 文件URL
     */
    String uploadFile(byte[] fileData, String fileName);
    
    /**
     * 文件删除
     * 
     * @param fileUrl 文件URL
     */
    void deleteFile(String fileUrl);
    
    /**
     * 发送通知
     * 
     * @param userId 用户ID
     * @param message 通知消息
     */
    void sendNotification(Long userId, String message);
}
