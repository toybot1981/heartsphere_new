package com.heartsphere.constants;

/**
 * 应用程序常量定义
 * 集中管理系统中使用的魔法数字和常量值
 *
 * @author HeartSphere
 * @version 1.0
 * @since 1.0
 */
public class ApplicationConstants {

    private ApplicationConstants() {
        // 防止实例化
    }

    /**
     * AI服务相关常量
     */
    public static class AIConstants {
        /** 默认温度参数 */
        public static final double DEFAULT_TEMPERATURE = 0.7;

        /** 默认最大Token数 */
        public static final int DEFAULT_MAX_TOKENS = 2048;

        /** 默认Top_P参数 */
        public static final double DEFAULT_TOP_P = 0.9;

        /** 最小温度 */
        public static final double MIN_TEMPERATURE = 0.0;

        /** 最大温度 */
        public static final double MAX_TEMPERATURE = 2.0;

        private AIConstants() {
        }
    }

    /**
     * 日志和字符串相关常量
     */
    public static class LogConstants {
        /** Insight预览长度 */
        public static final int INSIGHT_PREVIEW_LENGTH = 50;

        /** 内容预览长度 */
        public static final int CONTENT_PREVIEW_LENGTH = 100;

        /** 字符串截断后缀 */
        public static final String TRUNCATE_SUFFIX = "...";

        private LogConstants() {
        }
    }

    /**
     * 数据库相关常量
     */
    public static class DatabaseConstants {
        /** 默认批次大小 */
        public static final int DEFAULT_BATCH_SIZE = 100;

        /** 查询超时时间（秒） */
        public static final int QUERY_TIMEOUT_SECONDS = 30;

        private DatabaseConstants() {
        }
    }

    /**
     * 文件上传相关常量
     */
    public static class FileConstants {
        /** 默认最大文件大小（10MB） */
        public static final long DEFAULT_MAX_FILE_SIZE = 10 * 1024 * 1024;

        /** 图片文件扩展名 */
        public static final String[] IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp"};

        /** 允许的图片MIME类型 */
        public static final String[] ALLOWED_IMAGE_TYPES = {
            "image/jpeg",
            "image/png",
            "image/gif",
            "image/webp"
        };

        private FileConstants() {
        }
    }

    /**
     * HTTP相关常量
     */
    public static class HttpConstants {
        /** 默认连接超时（毫秒） */
        public static final int DEFAULT_CONNECT_TIMEOUT = 30000;

        /** 默认读取超时（毫秒） */
        public static final int DEFAULT_READ_TIMEOUT = 60000;

        /** 默认DNS查询超时（秒） */
        public static final int DEFAULT_DNS_QUERY_TIMEOUT = 30;

        /** WebClient最大连接数 */
        public static final int WEBCLIENT_MAX_CONNECTIONS = 500;

        /** WebClient最大内存大小（10MB） */
        public static final int WEBCLIENT_MAX_IN_MEMORY_SIZE = 10 * 1024 * 1024;

        private HttpConstants() {
        }
    }

    /**
     * 分页相关常量
     */
    public static class PaginationConstants {
        /** 默认页码 */
        public static final int DEFAULT_PAGE = 0;

        /** 默认每页大小 */
        public static final int DEFAULT_PAGE_SIZE = 20;

        /** 最大每页大小 */
        public static final int MAX_PAGE_SIZE = 100;

        private PaginationConstants() {
        }
    }

    /**
     * 安全相关常量
     */
    public static class SecurityConstants {
        /** JWT Token过期时间（毫秒） - 7天 */
        public static final long JWT_TOKEN_VALIDITY = 7 * 24 * 60 * 60 * 1000;

        /** JWT Token刷新时间（毫秒） - 1天 */
        public static final long JWT_TOKEN_REFRESH_TIME = 24 * 60 * 60 * 1000;

        /** 默认管理员密码 */
        public static final String DEFAULT_ADMIN_PASSWORD = "123456";

        private SecurityConstants() {
        }
    }

    /**
     * 缓存相关常量
     */
    public static class CacheConstants {
        /** AI模型配置缓存名称 */
        public static final String AI_MODEL_CONFIG_CACHE = "aiModelConfig";

        /** 用户配置缓存名称 */
        public static final String USER_CONFIG_CACHE = "userConfig";

        /** 默认缓存过期时间（秒） - 1小时 */
        public static final long DEFAULT_CACHE_EXPIRY = 3600;

        private CacheConstants() {
        }
    }
}
