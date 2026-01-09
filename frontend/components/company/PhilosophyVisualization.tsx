import React from 'react';

/**
 * 理念可视化组件
 * 八条目的流程图或关系图，正心位置的突出显示
 */
export const PhilosophyVisualization: React.FC = () => {
  return (
    <div className="bg-white rounded-lg p-8 border border-neutral-200 mb-8" role="img" aria-label="《大学》八条目关系图">
      <h2 className="text-2xl font-bold text-neutral-900 mb-6 text-center">《大学》八条目关系图</h2>
      <div className="relative">
        {/* 上方：内在修养 */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-neutral-700 mb-4 text-center">内在修养</h3>
          <div className="flex justify-center space-x-4">
            {['格物', '致知', '诚意'].map((step, index) => (
              <div
                key={index}
                className="px-4 py-2 bg-primary-50 text-primary-600 rounded-lg font-medium border border-primary-100"
              >
                {step}
              </div>
            ))}
          </div>
        </div>

        {/* 中间：正心（承上启下） */}
        <div className="mb-8 text-center">
          <div className="inline-block px-8 py-4 bg-primary-500 text-white rounded-lg">
            <div className="text-2xl font-bold">正心</div>
            <div className="text-sm text-primary-50 mt-1">承上启下</div>
          </div>
          <div className="flex justify-center space-x-4 mt-4">
            <div className="text-xs text-neutral-500">↑ 承接内在修养</div>
            <div className="text-xs text-neutral-500">↓ 开启外在实践</div>
          </div>
        </div>

        {/* 下方：外在实践 */}
        <div>
          <h3 className="text-lg font-semibold text-neutral-700 mb-4 text-center">外在实践</h3>
          <div className="flex justify-center space-x-4 flex-wrap gap-2">
            {['修身', '齐家', '治国', '平天下'].map((step, index) => (
              <div
                key={index}
                className="px-4 py-2 bg-green-50 text-green-600 rounded-lg font-medium border border-green-100"
              >
                {step}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
