package com.heartsphere.heartconnect.context;

/**
 * 共享模式上下文
 * 使用ThreadLocal存储当前请求的共享模式信息
 */
public class SharedModeContext {
    
    private static final ThreadLocal<SharedModeInfo> context = new ThreadLocal<>();
    
    /**
     * 共享模式信息
     */
    public static class SharedModeInfo {
        private boolean active;
        private Long shareConfigId;
        private Long visitorId;
        private Long ownerId;
        
        public SharedModeInfo(boolean active, Long shareConfigId, Long visitorId, Long ownerId) {
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
     * 设置共享模式信息
     */
    public static void set(SharedModeInfo info) {
        context.set(info);
    }
    
    /**
     * 获取共享模式信息
     */
    public static SharedModeInfo get() {
        return context.get();
    }
    
    /**
     * 检查是否处于共享模式
     */
    public static boolean isActive() {
        SharedModeInfo info = context.get();
        return info != null && info.isActive();
    }
    
    /**
     * 获取共享配置ID
     */
    public static Long getShareConfigId() {
        SharedModeInfo info = context.get();
        return info != null ? info.getShareConfigId() : null;
    }
    
    /**
     * 获取访问者ID
     */
    public static Long getVisitorId() {
        SharedModeInfo info = context.get();
        return info != null ? info.getVisitorId() : null;
    }
    
    /**
     * 获取主人ID
     */
    public static Long getOwnerId() {
        SharedModeInfo info = context.get();
        return info != null ? info.getOwnerId() : null;
    }
    
    /**
     * 清除上下文
     */
    public static void clear() {
        context.remove();
    }
}


