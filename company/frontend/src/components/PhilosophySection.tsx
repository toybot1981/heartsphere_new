import React from 'react';

/**
 * 正心理念展示组件
 * 《大学》八条目图解、"正心"的承上启下作用说明、正心理念与公司业务的关联
 */
export const PhilosophySection: React.FC = () => {
  const eightSteps = [
    { id: 1, name: '格物', description: '探究事物的原理' },
    { id: 2, name: '致知', description: '获得知识和智慧' },
    { id: 3, name: '诚意', description: '使意念真诚' },
    { id: 4, name: '正心', description: '端正心思，承上启下', highlight: true },
    { id: 5, name: '修身', description: '修养自身品德' },
    { id: 6, name: '齐家', description: '整顿家庭' },
    { id: 7, name: '治国', description: '治理国家' },
    { id: 8, name: '平天下', description: '使天下太平' },
  ];

  return (
    <div className="space-y-12">
      <div>
        <h2 className="text-3xl font-bold text-neutral-900 mb-6">《大学》八条目</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {eightSteps.map((step) => (
            <div
              key={step.id}
              className={`p-6 rounded-lg border transition-all ${
                step.highlight
                  ? 'bg-primary-50 border-primary-400'
                  : 'bg-white border-neutral-200 hover:border-primary-200'
              }`}
            >
              <div className={`text-2xl font-bold mb-2 ${step.highlight ? 'text-primary-500' : 'text-neutral-900'}`}>
                {step.name}
              </div>
              <div className="text-sm text-neutral-600">{step.description}</div>
              {step.highlight && (
                <div className="mt-4 text-xs text-primary-500 font-semibold">承上启下</div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-neutral-50 rounded-lg p-8 border border-neutral-200">
        <h3 className="text-2xl font-bold text-neutral-900 mb-4">正心的承上启下作用</h3>
        <p className="text-neutral-700 text-lg mb-4 leading-relaxed">
          "正心"在《大学》八条目中起到承上启下的关键作用：
        </p>
        <ul className="list-disc list-inside space-y-2 text-neutral-700 mb-6">
          <li><strong className="text-primary-500">承上</strong>：承接"格物、致知、诚意"的内在修养，是内在智慧的体现</li>
          <li><strong className="text-primary-500">启下</strong>：开启"修身、齐家、治国、平天下"的外在实践，是行动的起点</li>
          <li><strong className="text-primary-500">桥梁</strong>：连接内在修养与外在实践，是个人修养与社会责任的纽带</li>
        </ul>
      </div>

      <div className="bg-neutral-50 rounded-lg p-8 border border-neutral-200">
        <h3 className="text-2xl font-bold text-neutral-900 mb-4">正心理念与公司业务</h3>
        <p className="text-neutral-700 text-lg leading-relaxed">
          在人工智能领域，我们以"正心"为核心理念，追求技术与人文的平衡。
          心域（HeartSphere）产品体现了这一理念：既有先进的技术支撑，又有人文的温度关怀。
          我们不仅关注技术的创新，更关注如何用技术创造有温度的数字世界，连接人的内心与外在世界。
        </p>
      </div>
    </div>
  );
};
