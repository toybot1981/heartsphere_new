
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Character, UserProfile } from '../types';
import { Button } from './Button';
import { heartConnectApi } from '../services/api/heartconnect';
import type { SharedHeartSphere, ShareConfig } from '../services/api/heartconnect/types';
import { useSharedMode } from '../hooks/useSharedMode';
import { getToken } from '../services/api/base/tokenStorage';
import { authApi } from '../services/api';
import { useGameState } from '../contexts/GameStateContext';
import { logger } from '../utils/logger';

interface ConnectionSpaceProps {
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
  characterId?: string; // If this star represents a character
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

export const ConnectionSpace: React.FC<ConnectionSpaceProps> = ({ characters, userProfile, onConnect, onBack }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedStar, setSelectedStar] = useState<Star | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [sharedHeartSpheres, setSharedHeartSpheres] = useState<SharedHeartSphere[]>([]);
  const [loadingSharedSpheres, setLoadingSharedSpheres] = useState(false);
  const starsRef = useRef<Star[]>([]);
  const shootingStarsRef = useRef<ShootingStar[]>([]);
  const animationFrameRef = useRef<number>(0);
  const mouseRef = useRef<{x: number, y: number}>({ x: 0, y: 0 });
  const { enterSharedMode, visitorId: currentVisitorId } = useSharedMode();
  const { dispatch } = useGameState();

  // 加载共享心域列表
  useEffect(() => {
    logger.debug('[ConnectionSpace] ========== 加载共享心域列表 ==========');
    setLoadingSharedSpheres(true);
    
    const loadSharedHeartSpheres = async () => {
      try {
        logger.debug('[ConnectionSpace] 调用heartConnectApi.getPublicSharedHeartSpheres()...');
        const data = await heartConnectApi.getPublicSharedHeartSpheres();
        logger.debug('[ConnectionSpace] getPublicSharedHeartSpheres返回:', data);
        logger.debug('[ConnectionSpace] 返回数据数量:', data?.length || 0);
        
        if (data && data.length > 0) {
          logger.debug('[ConnectionSpace] 有共享心域数据，开始处理...');
          setSharedHeartSpheres(data);
          logger.debug('[ConnectionSpace] sharedHeartSpheres状态已更新，数量:', data.length);
        } else {
          logger.debug('[ConnectionSpace] 没有共享心域数据');
          setSharedHeartSpheres([]);
        }
      } catch (err: unknown) {
        logger.error('[ConnectionSpace] ❌ 加载共享心域失败:', err);
        setSharedHeartSpheres([]);
      } finally {
        setLoadingSharedSpheres(false);
        logger.debug('[ConnectionSpace] ========== 共享心域列表加载完成 ==========');
      }
    };
    
    loadSharedHeartSpheres();
  }, []);

  // Initialize Stars
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Resize canvas
    const resize = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    // Create Background Stars
    const bgStars: Star[] = Array.from({ length: 200 }).map((_, i) => {
      const isBlue = Math.random() > 0.8;
      const color = isBlue ? '#a5f3fc' : '#ffffff';
      return {
        id: `bg_${i}`,
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 1.5,
        color: color,
        baseColor: color,
        speedX: (Math.random() - 0.5) * 0.05,
        speedY: (Math.random() - 0.5) * 0.05,
        pulseSpeed: Math.random() * 0.02,
        pulseOffset: Math.random() * Math.PI * 2,
        glow: 0
      };
    });

    // Create Soul Stars (Characters)
    const charStars: Star[] = characters.map(char => ({
      id: `soul_${char.id}`,
      x: Math.random() * (canvas.width - 100) + 50,
      y: Math.random() * (canvas.height - 100) + 50,
      size: 4 + Math.random() * 3, // Bigger
      color: char.colorAccent || '#ffffff',
      baseColor: char.colorAccent || '#ffffff',
      speedX: (Math.random() - 0.5) * 0.2,
      speedY: (Math.random() - 0.5) * 0.2,
      characterId: char.id,
      character: char,
      pulseSpeed: 0.05 + Math.random() * 0.05,
      pulseOffset: Math.random() * Math.PI * 2,
      glow: 15
    }));

    // Create Shared Heart Sphere Stars (更大、更显著的颜色)
    const sharedStars: Star[] = sharedHeartSpheres.map((shared, index) => {
      // 使用更显著的颜色：金色、紫色、青色等
      const colors = ['#fbbf24', '#a855f7', '#06b6d4', '#f59e0b', '#ec4899'];
      const color = colors[index % colors.length];
      return {
        id: `shared_${shared.shareCode}`,
        x: Math.random() * (canvas.width - 150) + 75,
        y: Math.random() * (canvas.height - 150) + 75,
        size: 18 + Math.random() * 8, // 更大的尺寸（15-26像素，比之前更大）
        color: color,
        baseColor: color,
        speedX: (Math.random() - 0.5) * 0.15,
        speedY: (Math.random() - 0.5) * 0.15,
        sharedHeartSphere: shared,
        pulseSpeed: 0.08 + Math.random() * 0.08, // 更快的脉冲速度
        pulseOffset: Math.random() * Math.PI * 2,
        glow: 40 // 更强的光晕效果
      };
    });

    starsRef.current = [...bgStars, ...charStars, ...sharedStars];

    return () => window.removeEventListener('resize', resize);
  }, [characters, sharedHeartSpheres]);

  // Handle Mouse Move for Parallax
  const handleMouseMove = (e: React.MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
  };

  // Animation Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let time = 0;

    const render = () => {
      time++;
      // Clear with trail effect for shooting stars
      ctx.fillStyle = 'rgba(5, 5, 16, 0.4)'; 
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // --- Nebula Background ---
      // Draw some large, soft radial gradients to simulate nebulae
      const drawNebula = (x: number, y: number, radius: number, color: string) => {
         const g = ctx.createRadialGradient(x, y, 0, x, y, radius);
         g.addColorStop(0, color);
         g.addColorStop(1, 'transparent');
         ctx.fillStyle = g;
         ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
      };

      // Moving nebulae
      const nebulaMoveX = Math.sin(time * 0.001) * 100;
      const nebulaMoveY = Math.cos(time * 0.001) * 50;

      ctx.globalCompositeOperation = 'screen';
      drawNebula(canvas.width * 0.2 + nebulaMoveX, canvas.height * 0.3 + nebulaMoveY, 400, 'rgba(76, 29, 149, 0.1)'); // Purple
      drawNebula(canvas.width * 0.8 - nebulaMoveX, canvas.height * 0.7 - nebulaMoveY, 500, 'rgba(13, 148, 136, 0.1)'); // Teal
      drawNebula(canvas.width * 0.5, canvas.height * 0.5, 600, 'rgba(236, 72, 153, 0.05)'); // Pink
      ctx.globalCompositeOperation = 'source-over';

      // --- Shooting Stars Logic ---
      if (Math.random() < 0.015) { // Spawn chance
         shootingStarsRef.current.push({
             id: Date.now() + Math.random(),
             x: Math.random() * canvas.width,
             y: Math.random() * canvas.height * 0.5, // Start mostly in top half
             length: 50 + Math.random() * 50,
             speed: 10 + Math.random() * 10,
             angle: Math.PI / 4 + (Math.random() - 0.5) * 0.5, // mostly diagonal down-right
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
        // Parallax slightly based on mouse
        const parallaxX = (mouseRef.current.x - canvas.width/2) * (star.size * 0.001);
        const parallaxY = (mouseRef.current.y - canvas.height/2) * (star.size * 0.001);

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
            currentSize = star.size + pulse * 1.5;
            shadowBlur = 15 + pulse * 5;
            
            // Connection Line if selected
            if (selectedStar?.id === star.id) {
               // Line to center
               const cx = canvas.width / 2;
               const cy = canvas.height / 2;
               
               const grad = ctx.createLinearGradient(drawX, drawY, cx, cy);
               grad.addColorStop(0, star.color);
               grad.addColorStop(1, 'transparent');
               
               ctx.strokeStyle = grad;
               ctx.lineWidth = 1.5;
               ctx.beginPath();
               ctx.moveTo(drawX, drawY);
               ctx.lineTo(cx, cy);
               ctx.stroke();
               
               // Rotating Reticle
               ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
               ctx.lineWidth = 1;
               ctx.beginPath();
               ctx.arc(drawX, drawY, currentSize + 15, time * 0.05, time * 0.05 + Math.PI * 1.5);
               ctx.stroke();
               
               ctx.strokeStyle = star.color;
               ctx.beginPath();
               ctx.arc(drawX, drawY, currentSize + 20, -time * 0.05, -time * 0.05 + Math.PI);
               ctx.stroke();
            }
        } else if (star.sharedHeartSphere) {
            // Pulse effect for Shared Heart Sphere Stars (更大的脉冲效果)
            currentSize = star.size + pulse * 4;
            shadowBlur = 35 + pulse * 15;
            
            // Connection Line if selected
            if (selectedStar?.id === star.id) {
               // Line to center
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
               
               // Rotating Reticle (larger for shared heart spheres)
               ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
               ctx.lineWidth = 2;
               ctx.beginPath();
               ctx.arc(drawX, drawY, currentSize + 30, time * 0.05, time * 0.05 + Math.PI * 1.5);
               ctx.stroke();
               
               ctx.strokeStyle = star.color;
               ctx.beginPath();
               ctx.arc(drawX, drawY, currentSize + 35, -time * 0.05, -time * 0.05 + Math.PI);
               ctx.stroke();
            }
        } else {
            // Twinkle bg stars
            ctx.globalAlpha = 0.3 + pulse * 0.2;
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

  const handleCanvasClick = (e: React.MouseEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      // Check collision with Stars (优先检测共享心域星辰，因为它们更大)
      let clicked: Star | null = null;
      
      // 先检测共享心域星辰（更大的hitbox）
      for (const star of starsRef.current) {
          if (star.sharedHeartSphere) {
              const dx = star.x - clickX;
              const dy = star.y - clickY;
              const dist = Math.sqrt(dx*dx + dy*dy);
              const hitbox = 80; // 更大的hitbox因为共享心域星辰更大
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
                  if (dist < 40) { // Hitbox
                      clicked = star;
                      break;
                  }
              }
          }
      }
      setSelectedStar(clicked);
  };

  // 连接共享心域
  const handleConnectSharedHeartSphere = useCallback(async () => {
    logger.debug('[ConnectionSpace] ========== 连接共享心域 ==========');
    logger.debug('[ConnectionSpace] selectedStar:', selectedStar);
    logger.debug('[ConnectionSpace] selectedStar?.sharedHeartSphere:', selectedStar?.sharedHeartSphere);
    
    if (!selectedStar?.sharedHeartSphere) {
      logger.warn('[ConnectionSpace] ❌ 没有选中的共享心域');
      return;
    }
    
    const shared = selectedStar.sharedHeartSphere;
    logger.debug('[ConnectionSpace] ✅ 开始连接共享心域流程');
    logger.debug('[ConnectionSpace] 共享心域信息:', shared);
    logger.debug('[ConnectionSpace] shareCode:', shared.shareCode);
    logger.debug('[ConnectionSpace] shareConfigId:', shared.shareConfigId);
    
    setConnecting(true);
    logger.debug('[ConnectionSpace] connecting状态已设置为true');
    
    try {
      // 获取token
      const token = getToken();
      if (!token) {
        logger.error('[ConnectionSpace] ❌ 未找到token');
        setConnecting(false);
        return;
      }
      logger.debug('[ConnectionSpace] ✅ token已获取');
      
      // 获取visitorId
      let visitorId: number | null = currentVisitorId;
      if (!visitorId) {
        logger.debug('[ConnectionSpace] currentVisitorId为空，调用getCurrentUser获取用户ID...');
        const currentUser = await authApi.getCurrentUser(token);
        logger.debug('[ConnectionSpace] getCurrentUser返回:', currentUser);
        if (currentUser && currentUser.id) {
          visitorId = currentUser.id;
          logger.debug('[ConnectionSpace] ✅ visitorId已获取:', visitorId);
        } else {
          logger.error('[ConnectionSpace] ❌ 无法获取用户ID');
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
      logger.debug('[ConnectionSpace] shareConfig已构造:', shareConfig);
      
      // 进入共享模式
      logger.debug('[ConnectionSpace] 调用enterSharedMode...');
      enterSharedMode(shareConfig, visitorId);
      logger.debug('[ConnectionSpace] enterSharedMode调用完成');
      
      // 等待一下确保共享模式上下文已设置
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // 导航到共享心域页面
      logger.debug('[ConnectionSpace] 导航到sharedHeartSphere页面');
      dispatch({ type: 'SET_CURRENT_SCREEN', payload: 'sharedHeartSphere' });
      logger.debug('[ConnectionSpace] ✅ 导航完成');
    } catch (err: unknown) {
      logger.error('[ConnectionSpace] ❌ 连接共享心域失败:', err);
      setConnecting(false);
    }
  }, [selectedStar, enterSharedMode, currentVisitorId, dispatch]);

  const handleConnect = () => {
      if (!selectedStar?.character) return;
      setConnecting(true);
      setTimeout(() => {
          onConnect(selectedStar.character!);
      }, 1500); // Animation delay
  };

  return (
    <div className="relative h-full w-full bg-black overflow-hidden font-sans">
        <canvas 
            ref={canvasRef} 
            onClick={handleCanvasClick}
            onMouseMove={handleMouseMove}
            className="absolute inset-0 cursor-crosshair"
        />
        
        {/* UI Overlay */}
        <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center pointer-events-none">
            <div>
                <h2 className="text-4xl font-bold text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
                   我的心域
                </h2>
                <div className="flex items-center gap-2 mt-1">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                    <p className="text-blue-200/70 text-xs tracking-widest font-mono">
                        DEEP SPACE LINK // ONLINE
                    </p>
                </div>
            </div>
            <button 
                onClick={onBack} 
                className="pointer-events-auto group bg-white/5 hover:bg-white/10 backdrop-blur-md px-5 py-2.5 rounded-full border border-white/10 hover:border-white/30 text-white transition-all flex items-center gap-2"
            >
                <span>✕</span> 中断连接
            </button>
        </div>

        {/* Selected Star Details - Character */}
        {selectedStar && selectedStar.character && (
            <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 w-full max-w-md pointer-events-none z-20">
                <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 text-center animate-fade-in pointer-events-auto shadow-[0_0_50px_rgba(0,0,0,0.8)] relative overflow-hidden">
                    
                    {/* Character Theme Glow */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/50 to-transparent" style={{backgroundColor: selectedStar.color}} />
                    <div className="absolute -inset-full opacity-20 pointer-events-none radial-gradient-center" style={{background: `radial-gradient(circle, ${selectedStar.color} 0%, transparent 70%)`}} />

                    <div className="mb-6 flex flex-col items-center relative z-10">
                         <div className="relative mb-3">
                             <div className="absolute inset-0 rounded-full blur-md opacity-50" style={{backgroundColor: selectedStar.color}}></div>
                             <div className="w-20 h-20 rounded-full border-2 p-1 relative bg-black/50" style={{borderColor: selectedStar.color}}>
                                <img src={selectedStar.character.avatarUrl} className="w-full h-full rounded-full object-cover opacity-90" alt="Avatar" />
                             </div>
                         </div>
                         <h3 className="text-2xl font-bold text-white tracking-widest uppercase mb-1">
                             {selectedStar.character.name}
                         </h3>
                         <span className="text-xs font-mono text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded bg-blue-500/10 mb-3">
                             {selectedStar.character.role}
                         </span>
                         <p className="text-gray-300 text-sm italic line-clamp-2 px-4">
                             "{selectedStar.character.firstMessage}"
                         </p>
                    </div>

                    {connecting ? (
                        <div className="flex flex-col items-center gap-3 relative z-10">
                             <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden">
                                 <div className="h-full bg-white animate-[width_1.5s_ease-out_forwards]" style={{width: '0%'}} />
                             </div>
                             <span className="text-xs text-green-400 font-mono animate-pulse">ESTABLISHING QUANTUM LINK...</span>
                        </div>
                    ) : (
                        <Button 
                           onClick={handleConnect}
                           className="w-full bg-white text-black hover:bg-indigo-50 font-bold tracking-widest shadow-lg hover:shadow-white/20 relative z-10 py-3"
                        >
                            请求连接 (CONNECT)
                        </Button>
                    )}
                </div>
            </div>
        )}

        {/* Selected Star Details - Shared Heart Sphere */}
        {selectedStar && selectedStar.sharedHeartSphere && (
            <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 w-full max-w-md pointer-events-none z-20">
                <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 text-center animate-fade-in pointer-events-auto shadow-[0_0_50px_rgba(0,0,0,0.8)] relative overflow-hidden">
                    
                    {/* Shared Heart Sphere Theme Glow */}
                    <div className="absolute top-0 left-0 right-0 h-2 rounded-t-3xl" style={{backgroundColor: selectedStar.color}} />
                    <div className="absolute -inset-full opacity-20 pointer-events-none radial-gradient-center" style={{background: `radial-gradient(circle, ${selectedStar.color} 0%, transparent 70%)`}} />

                    <div className="mb-6 flex flex-col items-center relative z-10">
                         <div className="relative mb-3">
                             <div className="absolute inset-0 rounded-xl blur-lg opacity-60" style={{backgroundColor: selectedStar.color}}></div>
                             <div className="w-24 h-24 rounded-xl border-2 p-1.5 relative bg-black/50 flex items-center justify-center" style={{borderWidth: '3px', borderColor: selectedStar.color}}>
                                {selectedStar.sharedHeartSphere.coverImageUrl ? (
                                    <img 
                                        src={selectedStar.sharedHeartSphere.coverImageUrl} 
                                        className="w-full h-full rounded-xl object-cover opacity-90" 
                                        alt={selectedStar.sharedHeartSphere.heartSphereName || '共享心域'}
                                    />
                                ) : (
                                    <span className="text-5xl">🌟</span>
                                )}
                             </div>
                         </div>
                         <h3 className="text-2xl font-bold text-white tracking-widest uppercase mb-1">
                             {selectedStar.sharedHeartSphere.heartSphereName || '共享心域'}
                         </h3>
                         <div className="flex items-center gap-2 mb-3">
                             <span className="text-xs font-mono text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded bg-purple-500/10">
                                 {selectedStar.sharedHeartSphere.ownerName || '未知主人'}
                             </span>
                             {selectedStar.sharedHeartSphere.characterCount && selectedStar.sharedHeartSphere.characterCount > 0 && (
                                 <span className="text-xs font-mono text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded bg-blue-500/10">
                                     {selectedStar.sharedHeartSphere.characterCount} 个角色
                                 </span>
                             )}
                         </div>
                         {selectedStar.sharedHeartSphere.description && (
                             <p className="text-gray-300 text-sm line-clamp-2 px-4">
                                 {selectedStar.sharedHeartSphere.description}
                             </p>
                         )}
                    </div>

                    {connecting ? (
                        <div className="flex flex-col items-center gap-3 relative z-10">
                             <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden">
                                 <div className="h-full animate-[width_1.5s_ease-out_forwards]" style={{width: '0%', backgroundColor: selectedStar.color}} />
                             </div>
                             <span className="text-xs font-mono animate-pulse" style={{color: selectedStar.color}}>正在连接共享心域...</span>
                        </div>
                    ) : (
                        <Button 
                           onClick={handleConnectSharedHeartSphere}
                           className="w-full font-bold tracking-widest shadow-lg hover:shadow-white/20 relative z-10 py-3"
                           style={{
                             background: `linear-gradient(135deg, ${selectedStar.color}, ${selectedStar.baseColor}dd)`,
                             color: 'white'
                           }}
                        >
                            进入共享心域 (ENTER)
                        </Button>
                    )}
                </div>
            </div>
        )}
        
        {!selectedStar && (
            <div className="absolute bottom-20 w-full text-center pointer-events-none z-10">
                <p className="text-white/40 text-xs tracking-[0.5em] animate-pulse">点击星辰以捕获信号</p>
            </div>
        )}
    </div>
  );
};
