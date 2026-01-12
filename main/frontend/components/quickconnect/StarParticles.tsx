import React, { useEffect, useRef } from 'react';

interface StarParticlesProps {
  count?: number;  // 粒子数量
  intensity?: number;  // 强度（影响大小和亮度）
  color?: string;  // 粒子颜色
}

/**
 * 星光粒子效果组件
 */
export const StarParticles: React.FC<StarParticlesProps> = ({
  count = 5,
  intensity = 1,
  color = '#60a5fa',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!containerRef.current) return;
    
    const container = containerRef.current;
    const particles: HTMLDivElement[] = [];
    
    // 创建粒子
    for (let i = 0; i < count; i++) {
      const particle = document.createElement('div');
      particle.className = 'absolute rounded-full';
      
      // 随机大小（2-4px，受强度影响）
      const size = (2 + Math.random() * 2) * intensity;
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      
      // 颜色和透明度
      particle.style.backgroundColor = color;
      particle.style.opacity = `${0.6 + Math.random() * 0.2}`;
      
      // 随机位置（围绕中心）
      const angle = (i / count) * Math.PI * 2;
      const radius = 40 + Math.random() * 20;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      
      particle.style.left = `calc(50% + ${x}px)`;
      particle.style.top = `calc(50% + ${y}px)`;
      particle.style.transform = 'translate(-50%, -50%)';
      
      // 动画
      const rotationDuration = 15 + Math.random() * 10;  // 15-25秒
      const twinkleDuration = 2 + Math.random();  // 2-3秒
      
      particle.style.animation = `
        starRotate ${rotationDuration}s linear infinite,
        starTwinkle ${twinkleDuration}s ease-in-out infinite
      `;
      
      container.appendChild(particle);
      particles.push(particle);
    }
    
    // 添加CSS动画（如果还没有）
    if (!document.getElementById('star-particles-styles')) {
      const style = document.createElement('style');
      style.id = 'star-particles-styles';
      style.textContent = `
        @keyframes starRotate {
          from {
            transform: translate(-50%, -50%) rotate(0deg);
          }
          to {
            transform: translate(-50%, -50%) rotate(360deg);
          }
        }
        @keyframes starTwinkle {
          0%, 100% {
            opacity: 0.6;
          }
          50% {
            opacity: 0.9;
          }
        }
      `;
      document.head.appendChild(style);
    }
    
    return () => {
      particles.forEach(particle => particle.remove());
    };
  }, [count, intensity, color]);
  
  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 1 }}
    />
  );
};




