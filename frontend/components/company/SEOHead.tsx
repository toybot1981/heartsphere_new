import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  ogUrl?: string;
}

/**
 * SEO Head组件
 * 为每个页面提供SEO优化支持
 */
export const SEOHead: React.FC<SEOHeadProps> = ({
  title = '泰安正心智能科技有限公司 - 心域（HeartSphere）数字生命体交互系统',
  description = '泰安正心智能科技有限公司专注于人工智能领域，核心产品心域（HeartSphere）是一个数字生命体交互系统。正心理念来自《大学》八条目，连接内在修养与外在实践。',
  keywords = '正心智能,心域,HeartSphere,数字生命体,AI对话,人工智能,泰安',
  ogImage = '/company/images/og-image.jpg',
  ogUrl,
}) => {
  const fullTitle = title.includes('正心智能') ? title : `${title} - 正心智能`;
  const currentUrl = ogUrl || window.location.href;

  return (
    <Helmet>
      {/* 基础SEO标签 */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content="泰安正心智能科技有限公司" />

      {/* Open Graph标签（社交媒体分享） */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="正心智能" />

      {/* Twitter Card标签 */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {/* 结构化数据（JSON-LD） */}
      <script type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: '泰安正心智能科技有限公司',
          alternateName: '正心智能',
          url: 'https://heartsphere.cn',
          logo: 'https://heartsphere.cn/company/images/logo.png',
          description: description,
          address: {
            '@type': 'PostalAddress',
            addressLocality: '泰安',
            addressRegion: '山东',
            addressCountry: 'CN',
          },
          contactPoint: {
            '@type': 'ContactPoint',
            contactType: 'customer service',
            email: 'contact@zhengxin.ai',
          },
          sameAs: [
            // 可以添加社交媒体链接
          ],
        })}
      </script>
    </Helmet>
  );
};
