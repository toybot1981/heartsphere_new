import React from 'react';

/**
 * 页脚组件
 * 包含公司信息、联系方式、版权信息
 */
export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-neutral-50 border-t border-neutral-200 mt-auto" role="contentinfo">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* 公司信息 */}
          <div>
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">泰安正心智能科技有限公司</h3>
            <p className="text-neutral-600 text-sm mb-2">
              专注于人工智能领域，致力于将技术与人文相结合，创造有温度的数字世界。
            </p>
            <p className="text-neutral-500 text-xs mt-4">
              核心产品：心域（HeartSphere）数字生命体交互系统
            </p>
          </div>

          {/* 快速链接 */}
          <div>
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">快速链接</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="/company"
                  className="text-neutral-600 hover:text-primary-500 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary-300 rounded"
                >
                  首页
                </a>
              </li>
              <li>
                <a
                  href="/company/about"
                  className="text-neutral-600 hover:text-primary-500 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary-300 rounded"
                >
                  关于我们
                </a>
              </li>
              <li>
                <a
                  href="/company/product"
                  className="text-neutral-600 hover:text-primary-500 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary-300 rounded"
                >
                  核心产品
                </a>
              </li>
              <li>
                <a
                  href="/company/services"
                  className="text-neutral-600 hover:text-primary-500 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary-300 rounded"
                >
                  AI服务
                </a>
              </li>
              <li>
                <a
                  href="/company/contact"
                  className="text-neutral-600 hover:text-primary-500 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary-300 rounded"
                >
                  联系我们
                </a>
              </li>
            </ul>
          </div>

          {/* 联系方式 */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">联系我们</h3>
            <ul className="space-y-2 text-gray-600 text-sm">
              <li>
                <span className="text-gray-500">邮箱：</span>
                <a
                  href="mailto:contact@zhengxin.ai"
                  className="hover:text-blue-500 transition-colors"
                >
                  contact@zhengxin.ai
                </a>
              </li>
              <li>
                <span className="text-gray-500">地址：</span>
                <span>山东省泰安市</span>
              </li>
            </ul>
          </div>
        </div>

        {/* 版权信息 */}
        <div className="mt-8 pt-8 border-t border-neutral-200 text-center">
          <p className="text-neutral-500 text-sm">
            © {currentYear} 泰安正心智能科技有限公司. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
