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
    <div className="fixed inset-0 z-[99999] bg-gradient-to-b from-black/95 via-purple-900/80 to-black/95 flex items-center justify-center overflow-hidden">
      {/* 粒子背景 */}
      {showParticles && particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 opacity-50 animate-pulse"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            animationDelay: `${particle.delay}s`,
          }}
        />
      ))}

      {/* 网格背景 */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,255,0.15)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.15)_1px,transparent_1px)] bg-[size:50px_50px]"></div>

      {/* 中心内容 */}
      <div className="relative z-10 text-center max-w-2xl px-4">
        {/* 标题 */}
        <div className={`transform transition-all duration-1000 ${showContent ? 'scale-100 opacity-100' : 'scale-75 opacity-0'}`}>
          <h1 className="text-6xl md:text-8xl font-bold mb-6">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 animate-pulse">
              欢迎来到心域
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-cyan-200 mb-8 opacity-90">
            一个探索心灵与创造的世界
          </p>
        </div>

        {/* 副标题 */}
        <div className={`transform transition-all duration-1000 delay-300 ${showContent ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <p className="text-lg text-cyan-100 mb-12 max-w-xl mx-auto leading-relaxed">
            在这里，你可以记录内心的声音，探索不同的人生故事，
            与虚拟角色建立深厚的情感连接。
          </p>
        </div>

        {/* 按钮 */}
        <div className={`transform transition-all duration-1000 delay-500 ${showContent ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <button
            onClick={onClose}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 px-10 rounded-full text-lg shadow-lg shadow-purple-500/50 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-purple-500/70"
          >
            开始探索
          </button>
        </div>

        {/* 底部装饰 */}
        <div className={`mt-16 transform transition-all duration-1000 delay-700 ${showContent ? 'opacity-100' : 'opacity-0'}`}>
          <div className="w-32 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent mx-auto"></div>
        </div>
      </div>
      
      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 z-10">
        <Footer />
      </div>

      {/* 动态光效 */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 right-1/2 transform translate-x-1/2 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse"></div>
    </div>
  );
};
