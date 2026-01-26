import React, { useEffect, useState } from 'react';
import { Footer } from './Footer';

interface WelcomeOverlayProps {
  onClose: () => void;
}

export const WelcomeOverlay: React.FC<WelcomeOverlayProps> = ({ onClose }) => {
  const [showContent, setShowContent] = useState(false);
  const [showParticles, setShowParticles] = useState(false);

  useEffect(() => {
    // 粒子效果延迟出现
    const particleTimer = setTimeout(() => setShowParticles(true), 500);
    // 内容延迟出现
    const contentTimer = setTimeout(() => setShowContent(true), 1000);

    return () => {
      clearTimeout(particleTimer);
      clearTimeout(contentTimer);
    };
  }, []);

  // 生成随机粒子位置
  const particles = Array.from({ length: 100 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1,
    delay: Math.random() * 2,
  }));

  return (
    <div 
      className="fixed inset-0 z-[99999] flex items-center justify-center overflow-hidden"
      style={{
        background: 'var(--gradient-bg, linear-gradient(to bottom, rgba(0, 0, 0, 0.95), rgba(147, 51, 234, 0.8), rgba(0, 0, 0, 0.95)))',
      }}
    >
      {/* 粒子背景 */}
      {showParticles && particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute rounded-full opacity-50 animate-pulse"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            animationDelay: `${particle.delay}s`,
            background: 'var(--gradient-primary, linear-gradient(to right, #06b6d4, #9333ea))',
          }}
        />
      ))}

      {/* 网格背景 */}
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: `linear-gradient(rgba(6, 182, 212, 0.15) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(6, 182, 212, 0.15) 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
        }}
      />

      {/* 中心内容 */}
      <div className="relative z-10 text-center max-w-2xl px-4">
        {/* 标题 */}
        <div className={`transform transition-all duration-1000 ${showContent ? 'scale-100 opacity-100' : 'scale-75 opacity-0'}`}>
          <h1 className="text-6xl md:text-8xl font-bold mb-6">
            <span 
              className="bg-clip-text text-transparent animate-pulse"
              style={{
                background: 'var(--gradient-text, linear-gradient(to right, #22d3ee, #a855f7, #ec4899))',
              }}
            >
              欢迎来到心域
            </span>
          </h1>
          <p 
            className="text-xl md:text-2xl mb-8 opacity-90"
            style={{ color: 'var(--color-info, rgba(34, 211, 238, 0.9))' }}
          >
            一个探索心灵与创造的世界
          </p>
        </div>

        {/* 副标题 */}
        <div className={`transform transition-all duration-1000 delay-300 ${showContent ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <p 
            className="text-lg mb-12 max-w-xl mx-auto leading-relaxed"
            style={{ color: 'var(--color-info, rgba(165, 243, 252, 1))' }}
          >
            在这里，你可以记录内心的声音，探索不同的人生故事，
            与虚拟角色建立深厚的情感连接。
          </p>
        </div>

        {/* 按钮 */}
        <div className={`transform transition-all duration-1000 delay-500 ${showContent ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <button
            onClick={onClose}
            className="font-bold py-4 px-10 rounded-full text-lg shadow-lg transition-all duration-300"
            style={{
              background: 'var(--gradient-primary, linear-gradient(to right, #9333ea, #ec4899))',
              color: 'var(--text-primary)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--gradient-primary, linear-gradient(to right, #7c3aed, #db2777))';
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.boxShadow = 'var(--shadow-xl, 0 20px 25px -5px rgba(0, 0, 0, 0.1))';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--gradient-primary, linear-gradient(to right, #9333ea, #ec4899))';
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = 'var(--shadow-lg, 0 10px 15px -3px rgba(0, 0, 0, 0.1))';
            }}
          >
            开始探索
          </button>
        </div>

        {/* 底部装饰 */}
        <div className={`mt-16 transform transition-all duration-1000 delay-700 ${showContent ? 'opacity-100' : 'opacity-0'}`}>
          <div 
            className="w-32 h-1 mx-auto"
            style={{
              background: 'var(--gradient-bg, linear-gradient(to right, transparent, #22d3ee, transparent))',
            }}
          />
        </div>
      </div>
      
      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 z-10">
        <Footer />
      </div>

      {/* 动态光效 */}
      <div 
        className="absolute top-0 left-1/2 transform -translate-x-1/2 w-96 h-96 rounded-full blur-3xl animate-pulse"
        style={{
          backgroundColor: 'var(--color-primary, rgba(147, 51, 234, 0.2))',
        }}
      />
      <div 
        className="absolute bottom-0 right-1/2 transform translate-x-1/2 w-96 h-96 rounded-full blur-3xl animate-pulse"
        style={{
          backgroundColor: 'var(--color-info, rgba(6, 182, 212, 0.2))',
        }}
      />
    </div>
  );
};
