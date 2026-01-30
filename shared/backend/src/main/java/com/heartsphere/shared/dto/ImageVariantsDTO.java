package com.heartsphere.shared.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 图片多分辨率版本DTO
 * 用于前端根据展示场景选择合适的分辨率
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ImageVariantsDTO {
    /**
     * 原图URL
     */
    private String original;
    
    /**
     * 缩略图URL (200×200)
     * 用于列表、卡片等场景
     */
    private String thumbnail;
    
    /**
     * 中等质量图URL (800×600)
     * 用于详情页、对话框等场景
     */
    private String medium;
    
    /**
     * 高质量背景图URL (1920×1080)
     * 用于PC端背景、大图展示等场景
     */
    private String highQuality;
}
