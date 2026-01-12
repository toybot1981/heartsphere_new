import React from 'react';
import { SEOHead } from '../components/SEOHead';
import { AnimatedPage, ScrollReveal } from '../components/animations';

/**
 * 关于我们页面
 * 简化版本，详细的正心理念解释已移至首页
 */
export const AboutPage: React.FC = () => {
  return (
    <AnimatedPage>
      <SEOHead
        title="关于我们 - 正心智能"
        description="泰安正心智能科技有限公司专注于人工智能领域，以正心理念为指导，创造有温度的数字世界。"
        keywords="正心智能,公司介绍,企业文化,人工智能"
      />
      <div className="py-12">
        <ScrollReveal>
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
              关于我们
            </h1>
            <p className="text-neutral-600 text-lg max-w-2xl mx-auto">
              了解正心智能的核心理念和文化
            </p>
          </div>
        </ScrollReveal>
        
        <ScrollReveal delay={0.2}>
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="bg-white rounded-lg p-8 border border-neutral-200">
              <h2 className="text-2xl font-bold text-neutral-900 mb-4">公司简介</h2>
              <div className="space-y-4 text-neutral-700 leading-relaxed">
                <p className="text-lg">
                  泰安正心智能科技有限公司是一家专注于人工智能领域的创新企业，致力于将前沿技术与人文关怀深度融合，创造有温度、有深度的数字世界。
                </p>
                <p>
                  我们的核心理念"正心"源自《大学》八条目——"格物、致知、诚意、正心、修身、齐家、治国、平天下"。
                  "正心"在其中起到承上启下的关键作用：它承接"格物、致知、诚意"的内在修养，开启"修身、齐家、治国、平天下"的外在实践，
                  是连接内在智慧与外在行动的桥梁。这一理念指导我们在人工智能领域追求技术与人文的平衡，
                  用科技的力量传递人文的温度，让每一次技术突破都服务于人的内心需求与外在成长。
                </p>
                <p>
                  我们相信，真正有价值的人工智能产品，不仅要具备先进的技术能力，更要承载人文关怀与价值追求。
                  正心智能以"正心"为指引，在技术创新中融入人文思考，在数字世界中构建情感连接，
                  让科技成为连接人心、启迪智慧、促进成长的桥梁。
                </p>
              </div>
            </div>

            <div className="bg-white rounded-lg p-8 border border-neutral-200">
              <h2 className="text-2xl font-bold text-neutral-900 mb-4">核心产品</h2>
              <div className="space-y-4 text-neutral-700 leading-relaxed">
                <p className="text-lg">
                  心域（HeartSphere）是正心智能倾力打造的核心产品，是一个融合人工智能、情感计算与数字生命体技术的创新交互系统。
                </p>
                <p>
                  心域产品完美体现了"正心"理念：在技术层面，我们运用先进的AI对话引擎、场景管理系统、角色扮演与剧本系统等核心技术，
                  为用户提供智能、流畅、个性化的交互体验；在人文层面，我们关注用户的情感需求、成长轨迹与内心世界，
                  用技术创造有温度的数字陪伴，让每一次交互都成为连接内心与外在世界的桥梁。
                </p>
                <p>
                  心域不仅是一个产品，更是我们对"正心"理念的实践：用技术承载人文关怀，用创新连接传统智慧，
                  让数字世界成为滋养心灵、启迪思考、促进成长的温暖空间。
                </p>
                <a
                  href="/company/product"
                  className="inline-flex items-center text-primary-500 hover:text-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-300 rounded font-medium mt-4"
                >
                  了解更多产品信息
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </AnimatedPage>
  );
};
