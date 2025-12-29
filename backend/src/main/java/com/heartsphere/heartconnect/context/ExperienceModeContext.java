package com.heartsphere.heartconnect.context;

/**
 * 体验模式上下文
 * 使用ThreadLocal存储当前请求的体验模式信息
 */
public class ExperienceModeContext {
    
    private static final ThreadLocal<ExperienceModeInfo> context = new ThreadLocal<>();
    
    /**
     * 体验模式信息
     */
    public static class ExperienceModeInfo {
        private boolean active;
        private Long shareConfigId;
        private Long visitorId;
        private Long ownerId;
        
        public ExperienceModeInfo(boolean active, Long shareConfigId, Long visitorId, Long ownerId) {
            this.active = active;
            this.shareConfigId = shareConfigId;
            this.visitorId = visitorId;
            this.ownerId = ownerId;
        }
        
        public boolean isActive() {
            return active;
        }
        
        public Long getShareConfigId() {
            return shareConfigId;
        }
        
        public Long getVisitorId() {
            return visitorId;
        }
        
        public Long getOwnerId() {
            return ownerId;
        }
    }
    
    /**
     * 设置体验模式信息
     */
    public static void set(ExperienceModeInfo info) {
        context.set(info);
    }
    
    /**
     * 获取体验模式信息
     */
    public static ExperienceModeInfo get() {
        return context.get();
    }
    
    /**
     * 检查是否处于体验模式
     */
    public static boolean isActive() {
        ExperienceModeInfo info = context.get();
        return info != null && info.isActive();
    }
    
    /**
     * 获取共享配置ID
     */
    public static Long getShareConfigId() {
        ExperienceModeInfo info = context.get();
        return info != null ? info.getShareConfigId() : null;
    }
    
    /**
     * 获取访问者ID
     */
    public static Long getVisitorId() {
        ExperienceModeInfo info = context.get();
        return info != null ? info.getVisitorId() : null;
    }
    
    /**
     * 获取主人ID
     */
    public static Long getOwnerId() {
        ExperienceModeInfo info = context.get();
        return info != null ? info.getOwnerId() : null;
    }
    
    /**
     * 清除上下文
     */
    public static void clear() {
        context.remove();
    }
}
