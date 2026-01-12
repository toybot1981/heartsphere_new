import React from 'react';
import { ServiceCard } from './ServiceCard';

/**
 * 服务列表组件
 * 展示多个AI服务卡片
 */
export const ServiceList: React.FC = () => {
  const services = [
    {
      title: 'AI对话系统开发',
      description: '基于大语言模型的智能对话系统开发，支持多轮对话、上下文理解、个性化回复等',
      scenarios: ['智能客服', '在线助手', '教育培训', '内容创作'],
      icon: '💬',
    },
    {
      title: '自然语言处理',
      description: '文本分析、情感分析、关键词提取、文本生成等NLP服务',
      scenarios: ['内容审核', '舆情分析', '智能推荐', '文档处理'],
      icon: '📝',
    },
    {
      title: '计算机视觉',
      description: '图像识别、图像生成、图像分析等CV服务',
      scenarios: ['图像分类', '人脸识别', '图像生成', '智能监控'],
      icon: '👁️',
    },
    {
      title: 'AI模型定制',
      description: '根据业务需求定制AI模型，提供模型训练、优化、部署等服务',
      scenarios: ['行业专用模型', '私有化部署', '模型优化', '性能调优'],
      icon: '🔧',
    },
    {
      title: '智能推荐系统',
      description: '基于用户行为和内容特征的智能推荐系统',
      scenarios: ['内容推荐', '商品推荐', '个性化推送', '搜索优化'],
      icon: '🎯',
    },
    {
      title: 'AI咨询服务',
      description: '提供AI技术咨询、方案设计、技术选型等咨询服务',
      scenarios: ['技术选型', '方案设计', '架构咨询', '培训服务'],
      icon: '💡',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {services.map((service, index) => (
        <ServiceCard key={index} {...service} />
      ))}
    </div>
  );
};
