/**
 * Mobile版本连接空间组件
 * 独立的移动端实现，复用PC版本的Canvas动画逻辑，但使用移动端优化的UI
 */

import React, { useEffect, useRef, useState, memo, useCallback } from 'react';
import { Character, UserProfile } from '../../types';
import { MobileTouchableButton } from '../components/MobileTouchableButton';
import { MobileSmoothScroll } from '../components/MobileSmoothScroll';
import { MobileEmptyState } from '../components/MobileEmptyState';
import { MobileLoadingSpinner } from '../components/MobileLoadingSpinner';
import { MobileSafeAreaView } from '../components/MobileSafeAreaView';
import { MobileLazyImage } from '../components/MobileLazyImage';
import { heartConnectApi } from '../../services/api/heartconnect';
import type { SharedHeartSphere, ShareConfig } from '../../services/api/heartconnect/types';
import { useSharedMode } from '../../hooks/useSharedMode';
import { getToken } from '../../services/api/base/tokenStorage';
import { authApi } from '../../services/api';

interface MobileConnectionSpaceScreenProps {
  characters: Character[];
  userProfile: UserProfile;
  onConnect: (character: Character) => void;
  onBack: () => void;
}

interface Star {
  id: string;
  x: number;
  y: number;
  size: number;
  color: string;
  baseColor: string;
  speedX: number;
  speedY: number;
  characterId?: string;
  character?: Character;
  sharedHeartSphere?: SharedHeartSphere; // 共享心域数据
  pulseSpeed: number;
  pulseOffset: number;
  glow: number;
}

interface ShootingStar {
  id: number;
  x: number;
  y: number;
  length: number;
  speed: number;
  angle: number;
  opacity: number;
  color: string;
}

/**
 * Mobile版本连接空间页面组件
 * 独立的移动端实现，优化触摸交互和UI布局
 * Phase 5优化: 使用React.memo优化渲染性能
 */
export const MobileConnectionSpaceScreen: React.FC<MobileConnectionSpaceScreenProps> = memo(({
  characters,
  userProfile,
  onConnect,
  onBack,
  gameState,
  dispatch,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedStar, setSelectedStar] = useState<Star | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [sharedHeartSpheres, setSharedHeartSpheres] = useState<SharedHeartSphere[]>([]);
  const [loadingSharedSpheres, setLoadingSharedSpheres] = useState(false);
  const starsRef = useRef<Star[]>([]);
  const shootingStarsRef = useRef<ShootingStar[]>([]);
  const animationFrameRef = useRef<number>(0);
  const touchRef = useRef<{x: number, y: number}>({ x: 0, y: 0 });
  const { enterSharedMode, visitorId: currentVisitorId } = useSharedMode();

  // 加载共享心域列表
  useEffect(() => {
    setLoadingSharedSpheres(true);
    
    const loadSharedHeartSpheres = async () => {
      try {
        const data = await heartConnectApi.getPublicSharedHeartSpheres();
        
        if (data && data.length > 0) {
          setSharedHeartSpheres(data);
        } else {
          setSharedHeartSpheres([]);
        }
      } catch (err: any) {
        console.error('[MobileConnectionSpaceScreen] ❌ 加载共享心域失败:', err);
        setSharedHeartSpheres([]);
      } finally {
        setLoadingSharedSpheres(false);
      }
    };
    
    loadSharedHeartSpheres();
  }, []);

  // Initialize Stars
  useEffect(() => {
    
    const canvas = canvasRef.current;
    if (!canvas) {
      console.warn('[MobileConnectionSpaceScreen] ❌ canvas不存在');
      return;
    }
    
    // Resize canvas for mobile
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    // 获取当前主题ID的辅助函数（在整个useEffect中共享）
    const getThemeId = () => {
      if (typeof window !== 'undefined') {
        return document.documentElement.getAttribute('data-theme') || 'tech';
      }
      return 'tech';
    };
    const currentTheme = getThemeId();
    const isBlueSkyTheme = currentTheme === 'blue-sky-white-cloud';

    // Create Background Stars (fewer for mobile performance)
    
    // 蓝白主题下大幅增加星辰数量（移动端适当优化性能）
    const baseStarCount = 150;  // 增加基础星辰
    const starCount = isBlueSkyTheme 
      ? Math.floor(baseStarCount * 2.5) // 蓝白主题下增加2.5倍（移动端平衡性能）
      : baseStarCount;
    
    const bgStars: Star[] = Array.from({ length: starCount }).map((_, i) => {
      // 使用主题变量获取颜色
      const getThemeColor = (varName: string, fallback: string) => {
        if (typeof window !== 'undefined') {
          const value = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
          return value || fallback;
        }
        return fallback;
      };
      
      // 蓝白主题下使用多层次星辰：白色、淡蓝色、淡青色、淡粉色
      let color: string;
      let size: number;
      if (isBlueSkyTheme) {
        const colorType = Math.random();
        if (colorType < 0.45) {
          // 45% 白色星辰（主要）
          color = getThemeColor('--star-color-white', 'rgba(255, 255, 255, 0.95)');
          size = Math.random() * 1.5;
        } else if (colorType < 0.65) {
          // 20% 淡蓝色星辰
          color = getThemeColor('--star-color-blue', 'rgba(173, 216, 230, 0.85)');
          size = Math.random() * 1.2;
        } else if (colorType < 0.8) {
          // 15% 淡青色星辰（参考图中的青色点缀）
          color = 'rgba(0, 212, 255, 0.8)';
          size = Math.random() * 1;
        } else {
          // 20% 淡粉色星辰（心域色）
          color = getThemeColor('--star-color-pink', 'rgba(255, 182, 193, 0.8)');
          size = Math.random() * 0.8;
        }
      } else {
        // 其他主题使用原有逻辑
        const isBlue = Math.random() > 0.8;
        color = isBlue 
          ? getThemeColor('--color-info', '#a5f3fc')
          : getThemeColor('--text-primary', '#ffffff');
        size = Math.random() * 1.5;
      }
      
      return {
        id: `bg_${i}`,
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: size,
        color: color,
        baseColor: color,
        speedX: (Math.random() - 0.5) * 0.05,
        speedY: (Math.random() - 0.5) * 0.05,
        pulseSpeed: isBlueSkyTheme ? 0.02 + Math.random() * 0.03 : Math.random() * 0.02,
        pulseOffset: Math.random() * Math.PI * 2,
        glow: isBlueSkyTheme ? 0.2 + Math.random() * 0.3 : 0 // 蓝白主题下极轻微光晕
      };
    });

    // Create Soul Stars (Characters)
    const charStars: Star[] = characters.map(char => {
      // 蓝白主题下使用主题颜色
      const getThemeColor = (varName: string, fallback: string) => {
        if (typeof window !== 'undefined') {
          const value = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
          return value || fallback;
        }
        return fallback;
      };
      
      const color = isBlueSkyTheme 
        ? getThemeColor('--star-color-pink', 'rgba(255, 182, 193, 0.9)') // 心域色
        : (char.colorAccent || '#ffffff');
      
      const star = {
        id: `soul_${char.id}`,
        x: Math.random() * (canvas.width - 100) + 50,
        y: Math.random() * (canvas.height - 100) + 50,
        size: 5 + Math.random() * 4, // Bigger for mobile touch
        color: color,
        baseColor: color,
        speedX: (Math.random() - 0.5) * 0.2,
        speedY: (Math.random() - 0.5) * 0.2,
        characterId: char.id,
        character: char,
        pulseSpeed: isBlueSkyTheme ? 0.08 + Math.random() * 0.08 : 0.05 + Math.random() * 0.05, // 蓝白主题下更快的闪烁
        pulseOffset: Math.random() * Math.PI * 2,
        glow: isBlueSkyTheme ? 30 : 20 // 蓝白主题下更强的光晕
      };
      return star;
    });

    
    // Create Shared Heart Sphere Stars (更大、更显著的颜色)
    const sharedStars: Star[] = sharedHeartSpheres.map((shared, index) => {
      // 使用主题变量获取颜色
      const getThemeColor = (varName: string, fallback: string) => {
        if (typeof window !== 'undefined') {
          const value = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
          return value || fallback;
        }
        return fallback;
      };
      // 使用主题变量：警告色、主色、信息色等
      const colors = [
        getThemeColor('--color-warning', '#fbbf24'),
        getThemeColor('--color-primary', '#a855f7'),
        getThemeColor('--color-info', '#06b6d4'),
        getThemeColor('--color-warning', '#f59e0b'),
        getThemeColor('--color-primary', '#ec4899'),
      ];
      const color = colors[index % colors.length];
      const star = {
        id: `shared_${shared.shareCode}`,
        x: Math.random() * (canvas.width - 150) + 75,
        y: Math.random() * (canvas.height - 150) + 75,
        size: 12 + Math.random() * 6, // 更大的尺寸（比角色星辰大）
        color: color,
        baseColor: color,
        speedX: (Math.random() - 0.5) * 0.15,
        speedY: (Math.random() - 0.5) * 0.15,
        sharedHeartSphere: shared,
        pulseSpeed: 0.08 + Math.random() * 0.08, // 更快的脉冲速度
        pulseOffset: Math.random() * Math.PI * 2,
        glow: 40 // 更强的光晕效果
      };
      return star;
    });

starsRef.current = [...bgStars, ...charStars, ...sharedStars];

    return () => {
      window.removeEventListener('resize', resize);
    };
  }, [characters, sharedHeartSpheres]);

  // Handle Touch Move for Parallax (mobile optimized)
  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    if (touch) {
      touchRef.current = { x: touch.clientX, y: touch.clientY };
    }
  }, []);

  // Animation Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let time = 0;

    // 获取当前主题ID的辅助函数（在render函数中共享）
    const getThemeId = () => {
      if (typeof window !== 'undefined') {
        return document.documentElement.getAttribute('data-theme') || 'tech';
      }
      return 'tech';
    };

    const render = () => {
      time++;
      
      // 检查当前主题
      const currentTheme = getThemeId();
      const isBlueSkyTheme = currentTheme === 'blue-sky-white-cloud';
      
      // Clear with trail effect for shooting stars
      // 使用主题背景色，但需要从 CSS 变量中获取实际颜色值
      const getThemeColor = (varName: string, fallback: string) => {
        if (typeof window !== 'undefined') {
          const value = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
          return value || fallback;
        }
        return fallback;
      };
      
      if (isBlueSkyTheme) {
        // 蓝白主题：绘制梦幻星空背景（移动端版本）
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, '#1a1f4f');      // 顶部：深紫蓝
        gradient.addColorStop(0.3, '#1e3a8a');    // 上中：深蓝
        gradient.addColorStop(0.6, '#0369a1');    // 下中：亮蓝
        gradient.addColorStop(1, '#00a3e0');      // 底部：青色（能量感）
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // 移动端：添加底部光晕效果（简化版，减少计算量）
        const bottomGlowGradient = ctx.createLinearGradient(0, canvas.height * 0.75, 0, canvas.height);
        bottomGlowGradient.addColorStop(0, 'rgba(0, 163, 224, 0)');
        bottomGlowGradient.addColorStop(1, 'rgba(0, 212, 255, 0.15)');
        ctx.fillStyle = bottomGlowGradient;
        ctx.fillRect(0, canvas.height * 0.75, canvas.width, canvas.height * 0.25);
      } else {
        // 其他主题：使用原有逻辑
        // 将十六进制颜色转换为 rgba
        const hexToRgba = (hex: string, alpha: number) => {
          const r = parseInt(hex.slice(1, 3), 16);
          const g = parseInt(hex.slice(3, 5), 16);
          const b = parseInt(hex.slice(5, 7), 16);
          return `rgba(${r}, ${g}, ${b}, ${alpha})`;
        };
        const bgColor = getThemeColor('--bg-primary', '#050510');
        ctx.fillStyle = hexToRgba(bgColor.length === 7 ? bgColor : '#050510', 0.4);
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      // --- Nebula Background (simplified for mobile) ---
      const drawNebula = (x: number, y: number, radius: number, color: string) => {
         const g = ctx.createRadialGradient(x, y, 0, x, y, radius);
         g.addColorStop(0, color);
         g.addColorStop(1, 'transparent');
         ctx.fillStyle = g;
         ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
      };

      const nebulaMoveX = Math.sin(time * 0.001) * 100;
      const nebulaMoveY = Math.cos(time * 0.001) * 50;

      ctx.globalCompositeOperation = 'screen';
      drawNebula(canvas.width * 0.2 + nebulaMoveX, canvas.height * 0.3 + nebulaMoveY, 300, 'rgba(76, 29, 149, 0.1)');
      drawNebula(canvas.width * 0.8 - nebulaMoveX, canvas.height * 0.7 - nebulaMoveY, 400, 'rgba(13, 148, 136, 0.1)');
      ctx.globalCompositeOperation = 'source-over';

      // --- Shooting Stars (less frequent for mobile) ---
      if (Math.random() < 0.01) {
         shootingStarsRef.current.push({
             id: Date.now() + Math.random(),
             x: Math.random() * canvas.width,
             y: Math.random() * canvas.height * 0.5,
             length: 40 + Math.random() * 40,
             speed: 8 + Math.random() * 8,
             angle: Math.PI / 4 + (Math.random() - 0.5) * 0.5,
             opacity: 1,
             color: Math.random() > 0.5 ? '#ffffff' : '#a5f3fc'
         });
      }

      // Update and Draw Shooting Stars
      shootingStarsRef.current.forEach((star, index) => {
          star.x += Math.cos(star.angle) * star.speed;
          star.y += Math.sin(star.angle) * star.speed;
          star.opacity -= 0.02;

          if (star.opacity <= 0) {
              shootingStarsRef.current.splice(index, 1);
              return;
          }

          const tailX = star.x - Math.cos(star.angle) * star.length;
          const tailY = star.y - Math.sin(star.angle) * star.length;

          const grad = ctx.createLinearGradient(star.x, star.y, tailX, tailY);
          grad.addColorStop(0, `rgba(255, 255, 255, ${star.opacity})`);
          grad.addColorStop(1, 'transparent');

          ctx.strokeStyle = grad;
          ctx.lineWidth = 2;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(star.x, star.y);
          ctx.lineTo(tailX, tailY);
          ctx.stroke();
      });

      // --- Main Stars ---
      starsRef.current.forEach(star => {
        // Parallax based on touch (mobile optimized)
        const parallaxX = (touchRef.current.x - canvas.width/2) * (star.size * 0.0005);
        const parallaxY = (touchRef.current.y - canvas.height/2) * (star.size * 0.0005);

        // Update Position
        star.x += star.speedX;
        star.y += star.speedY;

        // Wrap around screen
        if (star.x < 0) star.x = canvas.width;
        if (star.x > canvas.width) star.x = 0;
        if (star.y < 0) star.y = canvas.height;
        if (star.y > canvas.height) star.y = 0;

        const drawX = star.x + parallaxX;
        const drawY = star.y + parallaxY;

        // Draw
        ctx.beginPath();
        const pulse = Math.sin(time * star.pulseSpeed + star.pulseOffset);
        
        let currentSize = star.size;
        let shadowBlur = 0;

        if (star.character) {
            // Pulse effect for Soul Stars
            const currentTheme = getThemeId();
            const isBlueSkyTheme = currentTheme === 'blue-sky-white-cloud';
            
            if (isBlueSkyTheme) {
              // 蓝白主题下增强脉冲效果和光晕
              currentSize = star.size + pulse * 3; // 更大的脉冲
              shadowBlur = 30 + pulse * 10; // 更强的光晕
              
              // 添加心域星辰的特殊光晕（蓝色和粉色）
              const getThemeColor = (varName: string, fallback: string) => {
                if (typeof window !== 'undefined') {
                  const value = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
                  return value || fallback;
                }
                return fallback;
              };
              
              // 使用粉色光晕（心域色）
              const pinkGlow = getThemeColor('--star-glow-pink', 'rgba(236, 64, 122, 0.6)');
              const blueGlow = getThemeColor('--star-glow-blue', 'rgba(33, 150, 243, 0.6)');
              
              // 绘制双重光晕效果
              ctx.shadowBlur = shadowBlur * 1.5;
              ctx.shadowColor = pinkGlow;
              ctx.fillStyle = star.color;
              ctx.arc(drawX, drawY, currentSize * 0.8, 0, Math.PI * 2);
              ctx.fill();
              
              ctx.shadowBlur = shadowBlur;
              ctx.shadowColor = blueGlow;
            } else {
              currentSize = star.size + pulse * 2;
              shadowBlur = 20 + pulse * 5;
            }
            
            // Connection Line if selected
            if (selectedStar?.id === star.id) {
               const cx = canvas.width / 2;
               const cy = canvas.height / 2;
               
               const grad = ctx.createLinearGradient(drawX, drawY, cx, cy);
               grad.addColorStop(0, star.color);
               grad.addColorStop(1, 'transparent');
               
               ctx.strokeStyle = grad;
               ctx.lineWidth = 2;
               ctx.beginPath();
               ctx.moveTo(drawX, drawY);
               ctx.lineTo(cx, cy);
               ctx.stroke();
               
               // Rotating Reticle
               ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
               ctx.lineWidth = 1.5;
               ctx.beginPath();
               ctx.arc(drawX, drawY, currentSize + 20, time * 0.05, time * 0.05 + Math.PI * 1.5);
               ctx.stroke();
               
               ctx.strokeStyle = star.color;
               ctx.beginPath();
               ctx.arc(drawX, drawY, currentSize + 25, -time * 0.05, -time * 0.05 + Math.PI);
               ctx.stroke();
            }
        } else {
            ctx.globalAlpha = 0.3 + pulse * 0.2;
            
            // 蓝白主题下为背景星辰添加光晕效果
            const currentTheme = getThemeId();
            const isBlueSkyTheme = currentTheme === 'blue-sky-white-cloud';
            
            if (isBlueSkyTheme && star.glow > 0) {
              // 根据星辰颜色选择光晕颜色
              const getThemeColor = (varName: string, fallback: string) => {
                if (typeof window !== 'undefined') {
                  const value = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
                  return value || fallback;
                }
                return fallback;
              };
              
              // 判断星辰颜色类型，应用相应的光晕
              const starColor = star.color.toLowerCase();
              let glowColor: string;
              if (starColor.includes('255, 182, 193') || starColor.includes('pink')) {
                // 粉色星辰使用粉色光晕
                glowColor = getThemeColor('--star-glow-pink', 'rgba(236, 64, 122, 0.6)');
              } else if (starColor.includes('173, 216, 230') || starColor.includes('blue')) {
                // 蓝色星辰使用蓝色光晕
                glowColor = getThemeColor('--star-glow-blue', 'rgba(33, 150, 243, 0.6)');
              } else {
                // 白色星辰使用蓝色光晕
                glowColor = getThemeColor('--star-glow-blue', 'rgba(33, 150, 243, 0.4)');
              }
              
              shadowBlur = star.glow + pulse * 3;
              ctx.shadowBlur = shadowBlur;
              ctx.shadowColor = glowColor;
            }
        }

        ctx.shadowBlur = shadowBlur;
        ctx.shadowColor = star.color;
        ctx.fillStyle = star.color;
        ctx.arc(drawX, drawY, currentSize, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;
      });

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrameRef.current);
  }, [selectedStar]);

  // 处理点击的通用函数（支持触摸和鼠标）
  const handleCanvasClick = useCallback((clientX: number, clientY: number, eventType: string) => {
    
    const canvas = canvasRef.current;
    if (!canvas) {
      console.warn('[MobileConnectionSpaceScreen] ❌ canvas不存在');
      return;
    }
    
    const rect = canvas.getBoundingClientRect();
    const clickX = clientX - rect.left;
    const clickY = clientY - rect.top;

    // Check collision with Stars (优先检测共享心域星辰，因为它们更大)
    let clicked: Star | null = null;
    
    // 先检测共享心域星辰（更大的hitbox）
    for (const star of starsRef.current) {
        if (star.sharedHeartSphere) {
            const dx = star.x - clickX;
            const dy = star.y - clickY;
            const dist = Math.sqrt(dx*dx + dy*dy);
            const hitbox = 70; // 更大的hitbox因为共享心域星辰更大
            if (dist < hitbox) {
                clicked = star;
                break;
            }
        }
    }
    // 如果没点击到共享心域，再检测角色星辰
    if (!clicked) {
        for (const star of starsRef.current) {
            if (star.character) {
                const dx = star.x - clickX;
                const dy = star.y - clickY;
                const dist = Math.sqrt(dx*dx + dy*dy);
                if (dist < 50) { // Larger hitbox for mobile
                    clicked = star;
                    break;
                }
            }
        }
    }
    
    if (clicked) {
      setSelectedStar(clicked);
    } else {
      setSelectedStar(null);
    }
  }, []);

  // Handle Touch/Click
  const handleCanvasTouch = useCallback((e: React.TouchEvent) => {
    
    e.preventDefault();
    const touch = e.touches[0] || e.changedTouches[0];
    if (!touch) {
      console.warn('[MobileConnectionSpaceScreen] ❌ 无法获取touch对象');
      return;
    }
    
    handleCanvasClick(touch.clientX, touch.clientY, `touch-${e.type}`);
  }, [handleCanvasClick]);

  // Handle Mouse Click (for testing in browser)
  const handleCanvasMouseClick = useCallback((e: React.MouseEvent) => {
    
    e.preventDefault();
    handleCanvasClick(e.clientX, e.clientY, `mouse-${e.type}`);
  }, [handleCanvasClick]);

  // 连接共享心域
  const handleConnectSharedHeartSphere = useCallback(async () => {
    
    if (!selectedStar?.sharedHeartSphere) {
      console.warn('[MobileConnectionSpaceScreen] ❌ 没有选中的共享心域');
      return;
    }
    
    const shared = selectedStar.sharedHeartSphere;
    
    setConnecting(true);
    
    try {
      // 获取token
      const token = getToken();
      if (!token) {
        console.error('[MobileConnectionSpaceScreen] ❌ 未找到token');
        setConnecting(false);
        return;
      }
      
      // 获取visitorId
      let visitorId: number | null = currentVisitorId;
      if (!visitorId) {
        const currentUser = await authApi.getCurrentUser(token);
        if (currentUser && currentUser.id) {
          visitorId = currentUser.id;
        } else {
          console.error('[MobileConnectionSpaceScreen] ❌ 无法获取用户ID');
          setConnecting(false);
          return;
        }
      }
      
      // 构造shareConfig
      const shareConfig: ShareConfig = {
        id: shared.shareConfigId,
        userId: shared.ownerId,
        ownerName: shared.ownerName,
        shareCode: shared.shareCode,
        shareType: shared.shareType,
        shareStatus: 'active',
        accessPermission: shared.accessPermission,
        description: shared.description,
        coverImageUrl: shared.coverImageUrl,
        viewCount: shared.viewCount,
        requestCount: shared.requestCount,
        approvedCount: shared.approvedCount,
        createdAt: 0,
        updatedAt: 0,
        worldCount: shared.worldCount,
        eraCount: shared.eraCount,
        characterCount: shared.characterCount,
      };
      
      // 进入共享模式
      enterSharedMode(shareConfig, visitorId);
      
      // 等待一下确保共享模式上下文已设置
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // 导航到共享心域页面
      dispatch({ type: 'SET_CURRENT_SCREEN', payload: 'sharedHeartSphere' });
    } catch (err: any) {
      console.error('[MobileConnectionSpaceScreen] ❌ 连接共享心域失败:', err);
      setConnecting(false);
    }
  }, [selectedStar, enterSharedMode, currentVisitorId, dispatch]);

  const handleConnect = useCallback(() => {
    
    if (!selectedStar?.character) {
      console.warn('[MobileConnectionSpaceScreen] ❌ 没有选中的星辰或角色');
      return;
    }
    
    
    setConnecting(true);
    
    setTimeout(() => {
      onConnect(selectedStar.character!);
      setConnecting(false);
    }, 1500);
  }, [selectedStar, onConnect]);

  // Empty state
  if (characters.length === 0) {
    return (
      <MobileSafeAreaView 
        className="h-full w-full"
        style={{ backgroundColor: 'var(--bg-primary, #000000)' }}
      >
        <div className="h-full flex flex-col">
          <div className="p-4 pt-[calc(1rem+env(safe-area-inset-top))]">
            <MobileTouchableButton
              onClick={onBack}
              variant="ghost"
              size="sm"
              style={{ color: 'var(--text-secondary)' }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
              </svg>
              返回
            </MobileTouchableButton>
          </div>
          <MobileEmptyState
            icon="✨"
            title="暂无角色"
            description="还没有可连接的角色，先去心域探索吧"
            action={{
              label: "前往心域",
              onClick: () => onBack()
            }}
          />
        </div>
      </MobileSafeAreaView>
    );
  }

  return (
    <MobileSafeAreaView 
      className="h-full w-full relative overflow-hidden"
      style={{ backgroundColor: 'var(--bg-primary, #000000)' }}
    >
      <canvas 
        ref={canvasRef} 
        onTouchStart={handleCanvasTouch}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleCanvasTouch}
        onClick={handleCanvasMouseClick}
        onMouseDown={handleCanvasMouseClick}
        className="absolute inset-0 touch-none cursor-pointer"
        style={{ touchAction: 'none' }}
      />
      
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-4 pt-[calc(1rem+env(safe-area-inset-top))] flex justify-between items-center pointer-events-none z-20">
        <div>
          <h2 
            className="text-2xl font-bold drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]"
            style={{ color: 'var(--text-primary)' }}
          >
            心域连接
          </h2>
          <div className="flex items-center gap-2 mt-1">
            <span 
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ backgroundColor: 'var(--color-success)' }}
            ></span>
            <p 
              className="text-xs tracking-widest font-mono"
              style={{ color: 'var(--text-secondary)' }}
            >
              DEEP SPACE LINK
            </p>
          </div>
        </div>
        <MobileTouchableButton
          onClick={onBack}
          variant="ghost"
          size="sm"
          className="pointer-events-auto backdrop-blur-md"
          style={{
            backgroundColor: 'var(--bg-overlay, rgba(255, 255, 255, 0.1))',
            color: 'var(--text-secondary)',
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </MobileTouchableButton>
      </div>

      {/* Selected Star Details (Mobile Optimized) - Character */}
      {selectedStar && selectedStar.character && (
        <div className="absolute bottom-0 left-0 right-0 p-4 pb-[calc(4rem+env(safe-area-inset-bottom))] pointer-events-none z-30">
          <div 
            className="backdrop-blur-xl border rounded-2xl p-4 text-center animate-fade-in pointer-events-auto shadow-2xl"
            style={{
              backgroundColor: 'var(--bg-overlay-alpha)',
              borderColor: 'var(--border-color-overlay)',
            }}
          >
            {/* Character Theme Glow */}
            <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl" style={{backgroundColor: selectedStar.color}} />
            
            <div className="mb-4 flex flex-col items-center">
              <div className="relative mb-3">
                <div className="absolute inset-0 rounded-full blur-md opacity-50" style={{backgroundColor: selectedStar.color}}></div>
                <div 
                  className="w-16 h-16 rounded-full border-2 p-1 relative" 
                  style={{
                    borderColor: selectedStar.color,
                    backgroundColor: 'var(--bg-overlay, rgba(0, 0, 0, 0.5))',
                  }}
                >
                  <MobileLazyImage 
                    src={selectedStar.character.avatarUrl} 
                    className="w-full h-full rounded-full object-cover opacity-90" 
                    alt={selectedStar.character.name}
                  />
                </div>
              </div>
              <h3 
                className="text-xl font-bold tracking-wide mb-1"
                style={{ color: 'var(--text-primary)' }}
              >
                {selectedStar.character.name}
              </h3>
              {selectedStar.character.role && (
                <span 
                  className="text-xs font-mono border px-2 py-0.5 rounded mb-2"
                  style={{
                    color: 'var(--color-info)',
                    borderColor: 'var(--border-info-alpha)',
                    backgroundColor: 'var(--bg-info-alpha)',
                  }}
                >
                  {selectedStar.character.role}
                </span>
              )}
              <p 
                className="text-sm italic line-clamp-2 px-2"
                style={{ color: 'var(--text-secondary)' }}
              >
                "{selectedStar.character.firstMessage}"
              </p>
            </div>

            {connecting ? (
              <div className="flex flex-col items-center gap-3">
                <div 
                  className="w-full h-1 rounded-full overflow-hidden"
                  style={{ backgroundColor: 'var(--bg-secondary)' }}
                >
                  <div 
                    className="h-full animate-[width_1.5s_ease-out_forwards]" 
                    style={{
                      width: '0%',
                      backgroundColor: 'var(--color-primary)',
                    }}
                  />
                </div>
                <span 
                  className="text-xs font-mono animate-pulse"
                  style={{ color: 'var(--color-success)' }}
                >
                  正在建立连接...
                </span>
              </div>
            ) : (
              <MobileTouchableButton
                onClick={handleConnect}
                variant="primary"
                size="lg"
                fullWidth
                className="font-bold tracking-wide shadow-lg"
                style={{
                  backgroundColor: 'var(--bg-card)',
                  color: 'var(--text-primary)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--bg-card)';
                }}
              >
                请求连接
              </MobileTouchableButton>
            )}
          </div>
        </div>
      )}


      {/* Selected Star Details (Mobile Optimized) - Shared Heart Sphere */}
      {selectedStar && selectedStar.sharedHeartSphere && (
        <div className="absolute bottom-0 left-0 right-0 p-4 pb-[calc(4rem+env(safe-area-inset-bottom))] pointer-events-none z-30">
          <div 
            className="backdrop-blur-xl border rounded-2xl p-4 text-center animate-fade-in pointer-events-auto shadow-2xl"
            style={{
              backgroundColor: 'var(--bg-overlay-alpha)',
              borderColor: 'var(--border-color-overlay)',
            }}
          >
            {/* Shared Heart Sphere Theme Glow */}
            <div className="absolute top-0 left-0 right-0 h-2 rounded-t-2xl" style={{backgroundColor: selectedStar.color}} />
            
            <div className="mb-4 flex flex-col items-center">
              <div className="relative mb-3">
                <div className="absolute inset-0 rounded-xl blur-lg opacity-60" style={{backgroundColor: selectedStar.color}}></div>
                <div className="w-20 h-20 rounded-xl border-2 p-1.5 relative bg-black/50 flex items-center justify-center" style={{borderWidth: '3px', borderColor: selectedStar.color}}>
                  {selectedStar.sharedHeartSphere.coverImageUrl ? (
                    <MobileLazyImage 
                      src={selectedStar.sharedHeartSphere.coverImageUrl} 
                      className="w-full h-full rounded-xl object-cover opacity-90" 
                      alt={selectedStar.sharedHeartSphere.heartSphereName || '共享心域'}
                    />
                  ) : (
                    <span className="text-4xl">🌟</span>
                  )}
                </div>
              </div>
              <h3 
                className="text-xl font-bold tracking-wide mb-1"
                style={{ color: 'var(--text-primary)' }}
              >
                {selectedStar.sharedHeartSphere.heartSphereName || '共享心域'}
              </h3>
              <div className="flex items-center gap-2 mb-2">
                <span 
                  className="text-xs font-mono border px-2 py-0.5 rounded"
                  style={{
                    color: 'var(--color-primary)',
                    borderColor: 'var(--border-color-overlay)',
                    backgroundColor: 'var(--bg-secondary-alpha)',
                  }}
                >
                  {selectedStar.sharedHeartSphere.ownerName || '未知主人'}
                </span>
                {selectedStar.sharedHeartSphere.characterCount && selectedStar.sharedHeartSphere.characterCount > 0 && (
                  <span 
                    className="text-xs font-mono border px-2 py-0.5 rounded"
                    style={{
                      color: 'var(--color-info)',
                      borderColor: 'var(--border-info-alpha)',
                      backgroundColor: 'var(--bg-info-alpha)',
                    }}
                  >
                    {selectedStar.sharedHeartSphere.characterCount} 个角色
                  </span>
                )}
              </div>
              {selectedStar.sharedHeartSphere.description && (
                <p 
                  className="text-sm line-clamp-2 px-2"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {selectedStar.sharedHeartSphere.description}
                </p>
              )}
            </div>

            {connecting ? (
              <div className="flex flex-col items-center gap-3">
                <div 
                  className="w-full h-1 rounded-full overflow-hidden"
                  style={{ backgroundColor: 'var(--bg-secondary)' }}
                >
                  <div 
                    className="h-full animate-[width_1.5s_ease-out_forwards]" 
                    style={{
                      width: '0%',
                      backgroundColor: selectedStar.color || 'var(--color-primary)',
                    }}
                  />
                </div>
                <span 
                  className="text-xs font-mono animate-pulse"
                  style={{ color: selectedStar.color || 'var(--color-primary)' }}
                >
                  正在连接共享心域...
                </span>
              </div>
            ) : (
              <MobileTouchableButton
                onClick={handleConnectSharedHeartSphere}
                variant="primary"
                size="lg"
                fullWidth
                className="font-bold tracking-wide shadow-lg"
                style={{
                  background: `linear-gradient(135deg, ${selectedStar.color}, ${selectedStar.baseColor}dd)`,
                  color: 'white'
                }}
              >
                进入共享心域
              </MobileTouchableButton>
            )}
          </div>
        </div>
      )}
      
      {/* Hint (only when no selection) */}
      {!selectedStar && (
        <div className="absolute bottom-24 left-0 right-0 text-center pointer-events-none z-10">
          <p 
            className="text-xs tracking-widest animate-pulse"
            style={{ color: 'var(--text-tertiary)' }}
          >
            触摸星辰以捕获信号
          </p>
    </div>
      )}
    </MobileSafeAreaView>
  );
});

MobileConnectionSpaceScreen.displayName = 'MobileConnectionSpaceScreen';
