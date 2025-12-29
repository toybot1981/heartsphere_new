import { useEffect, useRef, useState } from 'react';

/**
 * 图片懒加载Hook
 * 用于优化大量图片的加载性能
 */
export const useImageLazyLoad = (src: string, options?: IntersectionObserverInit) => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  
  useEffect(() => {
    if (!imgRef.current) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setImageSrc(src);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '50px', // 提前50px开始加载
        ...options,
      }
    );
    
    observer.observe(imgRef.current);
    
    return () => {
      observer.disconnect();
    };
  }, [src, options]);
  
  const handleLoad = () => {
    setIsLoaded(true);
  };
  
  const handleError = () => {
    setError(true);
  };
  
  return {
    imgRef,
    imageSrc,
    isLoaded,
    error,
    handleLoad,
    handleError,
  };
};

