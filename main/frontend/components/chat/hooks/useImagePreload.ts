/**
 * 图片预加载 Hook
 * 优化图片加载体验
 */

import { useState, useEffect } from 'react';

interface UseImagePreloadResult {
  loaded: boolean;
  error: boolean;
  image: HTMLImageElement | null;
}

/**
 * 图片预加载 Hook
 * 提供加载状态和错误处理
 */
export const useImagePreload = (src: string | null): UseImagePreloadResult => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [image, setImage] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    if (!src) {
      setLoaded(false);
      setError(false);
      setImage(null);
      return;
    }

    // 重置状态
    setLoaded(false);
    setError(false);

    const img = new Image();
    
    img.onload = () => {
      setLoaded(true);
      setError(false);
      setImage(img);
    };
    
    img.onerror = () => {
      setLoaded(false);
      setError(true);
      setImage(null);
    };
    
    img.src = src;

    // 清理函数
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src]);

  return { loaded, error, image };
};
