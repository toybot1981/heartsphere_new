import React, { useState } from 'react';

interface FooterProps {
  className?: string;
}

export const Footer: React.FC<FooterProps> = ({ className = '' }) => {
  const [logoError, setLogoError] = useState(false);
  const [logoSrc, setLogoSrc] = useState('/logo.jpg');

  return (
    <footer 
      className={`w-full py-4 px-4 border-t backdrop-blur-sm ${className}`}
      style={{
        backgroundColor: 'var(--bg-overlay, rgba(15, 23, 42, 0.5))',
        borderColor: 'var(--bg-overlay, rgba(30, 41, 59, 0.5))',
      }}
    >
      <div className="max-w-7xl mx-auto">
        <div 
          className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm"
          style={{ color: 'var(--text-tertiary)' }}
        >
          {/* 左侧：链接 */}
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
            <a
              href="/privacy-policy.html"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors"
              style={{ color: 'var(--text-tertiary)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--color-primary, #818cf8)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--text-tertiary)';
              }}
            >
              隐私政策
            </a>
            <span style={{ color: 'var(--text-disabled)' }}>|</span>
            <a
              href="/terms-of-service.html"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors"
              style={{ color: 'var(--text-tertiary)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--color-primary, #818cf8)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--text-tertiary)';
              }}
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
                  if (logoSrc.includes('.jpg')) {
                    setLogoSrc('/logo.png');
                  } else {
                    console.error('[Footer] Logo加载失败，隐藏图片');
                    setLogoError(true);
                  }
                }}
                onLoad={() => {
                }}
              />
            )}
            {/* 备案信息 */}
            <div 
              className="flex items-center gap-2 flex-wrap justify-center"
              style={{ color: 'var(--text-tertiary)' }}
            >
              <span>心域-心灵安放的港湾</span>
              <span style={{ color: 'var(--text-disabled)' }}>|</span>
              <span>heartsphere.cn</span>
              <span style={{ color: 'var(--text-disabled)' }}>|</span>
              <a
                href="https://beian.miit.gov.cn/"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors"
                style={{ color: 'var(--text-tertiary)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'var(--color-primary, #818cf8)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--text-tertiary)';
                }}
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


