/**
 * Mobile版本类型定义增强
 * Phase 5: 完善TypeScript类型定义
 */

/**
 * 设备类型
 */
export type DeviceType = 'mobile' | 'tablet' | 'desktop';

/**
 * 图片用途类型
 */
export type ImagePurpose = 'thumbnail' | 'small' | 'medium' | 'large' | 'xlarge';

/**
 * 响应式图片配置
 */
export interface ResponsiveImageConfig {
  src: string;
  srcSet: string;
  sizes: string;
  recommendedSize: number;
  devicePixelRatio: number;
}

/**
 * 图片尺寸配置
 */
export interface ImageSizeConfig {
  mobile: {
    thumbnail: number;
    small: number;
    medium: number;
    large: number;
    xlarge: number;
  };
  tablet: {
    thumbnail: number;
    small: number;
    medium: number;
    large: number;
    xlarge: number;
  };
}

/**
 * 网络请求优化配置
 */
export interface RequestCacheOptions {
  enabled?: boolean;
  ttl?: number;
  key?: string;
}

export interface RequestRetryOptions {
  maxRetries?: number;
  retryDelay?: number;
  retryDelayMultiplier?: number;
  retryableStatuses?: number[];
  retryableErrors?: string[];
}

export interface EnhancedRequestOptions {
  cache?: RequestCacheOptions;
  deduplicate?: boolean;
  retry?: RequestRetryOptions | boolean;
  skipOptimization?: boolean;
}

/**
 * 性能指标类型
 */
export interface PerformanceMetrics {
  fcp: number; // First Contentful Paint (ms)
  lcp: number; // Largest Contentful Paint (ms)
  tti: number; // Time to Interactive (ms)
  tbt: number; // Total Blocking Time (ms)
  cls: number; // Cumulative Layout Shift
}

/**
 * Bundle大小统计
 */
export interface BundleSizeStats {
  totalJSSize: number;
  totalCSSSize: number;
  totalSize: number;
  initialLoadSize: number;
  maxChunkSize: number;
  jsSizes: Array<{ file: string; size: number }>;
  cssSizes: Array<{ file: string; size: number }>;
}

/**
 * 内存使用统计
 */
export interface MemoryStats {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

/**
 * 组件性能统计
 */
export interface ComponentPerformanceStats {
  componentName: string;
  renderTime: number;
  renderCount: number;
  averageRenderTime: number;
}
