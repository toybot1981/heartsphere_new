import React, { useState } from 'react';

interface FooterProps {
  className?: string;
}

export const Footer: React.FC<FooterProps> = ({ className = '' }) => {
  const [logoError, setLogoError] = useState(false);
  const [logoSrc, setLogoSrc] = useState('/logo.jpg');

  return (
    <footer className={`w-full py-4 px-4 border-t border-slate-800/50 bg-slate-950/50 backdrop-blur-sm ${className}`}>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-400">
          {/* 左侧：链接 */}
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
            <a
              href="/privacy-policy.html"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-indigo-400 transition-colors"
            >
              隐私政策
            </a>
            <span className="text-slate-600">|</span>
            <a
              href="/terms-of-service.html"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-indigo-400 transition-colors"
            >
              服务条款
            </a>
          </div>
          
          {/* 右侧：Logo + 备案信息（同一行） */}
          <div className="flex items-center gap-3 text-xs flex-wrap justify-center md:justify-end">
            {/* Logo */}
            {!logoError && (
              <img 
                src={logoSrc} 
                alt="心域 Logo" 
                className="h-8 md:h-10 w-auto object-contain flex-shrink-0"
                style={{ maxHeight: '40px', display: 'block' }}
                onError={(e) => {
                  const img = e.target as HTMLImageElement;
                  console.log('[Footer] Logo加载失败，当前src:', img.src);
                  if (logoSrc.includes('.jpg')) {
                    console.log('[Footer] 尝试加载PNG版本');
                    setLogoSrc('/logo.png');
                  } else {
                    console.error('[Footer] Logo加载失败，隐藏图片');
                    setLogoError(true);
                  }
                }}
                onLoad={() => {
                  console.log('[Footer] Logo加载成功:', logoSrc);
                }}
              />
            )}
            {/* 备案信息 */}
            <div className="flex items-center gap-2 text-slate-500 flex-wrap justify-center">
              <span>心域-心灵安放的港湾</span>
              <span className="text-slate-600">|</span>
              <span>heartsphere.cn</span>
              <span className="text-slate-600">|</span>
              <a
                href="https://beian.miit.gov.cn/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-indigo-400 transition-colors"
              >
                京ICP备2025156149号-1
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};


