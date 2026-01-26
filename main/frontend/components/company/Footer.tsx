import React from 'react';

/**
 * 页脚组件
 * 包含公司信息、联系方式、版权信息
 */
export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer 
      className="border-t mt-auto" 
      style={{
        backgroundColor: 'var(--bg-secondary)',
        borderColor: 'var(--border-color-overlay)',
      }}
      role="contentinfo"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* 公司信息 */}
          <div>
            <h3 
              className="text-lg font-semibold mb-4"
              style={{ color: 'var(--text-primary)' }}
            >
              泰安正心智能科技有限公司
            </h3>
            <p 
              className="text-sm mb-2"
              style={{ color: 'var(--text-secondary)' }}
            >
              专注于人工智能领域，致力于将技术与人文相结合，创造有温度的数字世界。
            </p>
            <p 
              className="text-xs mt-4"
              style={{ color: 'var(--text-tertiary)' }}
            >
              核心产品：心域（HeartSphere）数字生命体交互系统
            </p>
          </div>

          {/* 快速链接 */}
          <div>
            <h3 
              className="text-lg font-semibold mb-4"
              style={{ color: 'var(--text-primary)' }}
            >
              快速链接
            </h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="/company"
                  className="text-sm transition-colors focus:outline-none rounded"
                  style={{ color: 'var(--text-secondary)' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = 'var(--color-primary)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'var(--text-secondary)';
                  }}
                >
                  首页
                </a>
              </li>
              <li>
                <a
                  href="/company/about"
                  className="text-sm transition-colors focus:outline-none rounded"
                  style={{ color: 'var(--text-secondary)' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = 'var(--color-primary)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'var(--text-secondary)';
                  }}
                >
                  关于我们
                </a>
              </li>
              <li>
                <a
                  href="/company/product"
                  className="text-sm transition-colors focus:outline-none rounded"
                  style={{ color: 'var(--text-secondary)' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = 'var(--color-primary)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'var(--text-secondary)';
                  }}
                >
                  核心产品
                </a>
              </li>
              <li>
                <a
                  href="/company/services"
                  className="text-sm transition-colors focus:outline-none rounded"
                  style={{ color: 'var(--text-secondary)' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = 'var(--color-primary)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'var(--text-secondary)';
                  }}
                >
                  AI服务
                </a>
              </li>
              <li>
                <a
                  href="/company/contact"
                  className="text-sm transition-colors focus:outline-none rounded"
                  style={{ color: 'var(--text-secondary)' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = 'var(--color-primary)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'var(--text-secondary)';
                  }}
                >
                  联系我们
                </a>
              </li>
              <li>
                <a
                  href="http://heartsphere.cn"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm transition-colors focus:outline-none rounded flex items-center gap-1"
                  style={{ color: 'var(--text-secondary)' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = 'var(--color-primary)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'var(--text-secondary)';
                  }}
                >
                  访问心域
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </li>
            </ul>
          </div>

          {/* 联系方式 */}
          <div>
            <h3 
              className="text-lg font-semibold mb-4"
              style={{ color: 'var(--text-primary)' }}
            >
              联系我们
            </h3>
            <ul 
              className="space-y-2 text-sm"
              style={{ color: 'var(--text-secondary)' }}
            >
              <li>
                <span style={{ color: 'var(--text-tertiary)' }}>邮箱：</span>
                <a
                  href="mailto:contact@zhengxin.ai"
                  className="transition-colors focus:outline-none rounded"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = 'var(--color-primary)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'var(--text-secondary)';
                  }}
                >
                  contact@zhengxin.ai
                </a>
              </li>
              <li>
                <span style={{ color: 'var(--text-tertiary)' }}>地址：</span>
                <span>山东省泰安市</span>
              </li>
            </ul>
          </div>
        </div>

        {/* 版权信息 */}
        <div 
          className="mt-8 pt-8 border-t text-center"
          style={{ borderColor: 'var(--border-color-overlay)' }}
        >
          <p 
            className="text-sm"
            style={{ color: 'var(--text-tertiary)' }}
          >
            © {currentYear} 泰安正心智能科技有限公司. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
