import { useState, useEffect } from 'react';

interface Breakpoints {
  mobile: number;
  tablet: number;
  desktop: number;
  wide: number;
}

const defaultBreakpoints: Breakpoints = {
  mobile: 0,
  tablet: 768,
  desktop: 1024,
  wide: 1440,
};

export type DeviceType = 'mobile' | 'tablet' | 'desktop' | 'wide';

/**
 * 响应式Hook
 * 用于检测设备类型和屏幕尺寸
 */
export const useResponsive = (breakpoints: Breakpoints = defaultBreakpoints) => {
  const [deviceType, setDeviceType] = useState<DeviceType>('desktop');
  const [width, setWidth] = useState<number>(typeof window !== 'undefined' ? window.innerWidth : 1024);
  
  useEffect(() => {
    const handleResize = () => {
      const newWidth = window.innerWidth;
      setWidth(newWidth);
      
      if (newWidth >= breakpoints.wide) {
        setDeviceType('wide');
      } else if (newWidth >= breakpoints.desktop) {
        setDeviceType('desktop');
      } else if (newWidth >= breakpoints.tablet) {
        setDeviceType('tablet');
      } else {
        setDeviceType('mobile');
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [breakpoints]);
  
  return {
    deviceType,
    width,
    isMobile: deviceType === 'mobile',
    isTablet: deviceType === 'tablet',
    isDesktop: deviceType === 'desktop' || deviceType === 'wide',
    isWide: deviceType === 'wide',
  };
};



