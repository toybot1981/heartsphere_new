import React from 'react';

/**
 * 理念可视化组件
 * 八条目的流程图或关系图，正心位置的突出显示
 */
export const PhilosophyVisualization: React.FC = () => {
  return (
    <div 
      className="rounded-lg p-8 border mb-8" 
      style={{
        backgroundColor: 'var(--bg-card)',
        borderColor: 'var(--border-color-overlay)',
      }}
      role="img" 
      aria-label="《大学》八条目关系图"
    >
      <h2 
        className="text-2xl font-bold mb-6 text-center"
        style={{ color: 'var(--text-primary)' }}
      >
        《大学》八条目关系图
      </h2>
      <div className="relative space-y-6">
        {/* 上方：内在修养 */}
        <div>
          <h3 
            className="text-lg font-semibold mb-4 text-center"
            style={{ color: 'var(--text-secondary)' }}
          >
            内在修养
          </h3>
          <div className="flex justify-center space-x-4 flex-wrap gap-2">
            {['格物', '致知', '诚意'].map((step, index) => (
              <div
                key={index}
                className="px-4 py-2 rounded-lg font-medium border"
                style={{
                  backgroundColor: 'var(--bg-secondary-alpha)',
                  color: 'var(--color-primary)',
                  borderColor: 'var(--border-color-overlay)',
                }}
              >
                {step}
              </div>
            ))}
          </div>
        </div>

        {/* 中间：正心（承上启下） - 突出显示 */}
        <div className="text-center py-4">
          <div 
            className="inline-block px-8 py-4 rounded-lg shadow-lg relative z-10 min-w-[200px]"
            style={{
              backgroundColor: 'var(--color-primary)',
              color: 'var(--text-primary)',
            }}
          >
            <div 
              className="text-2xl font-bold mb-1"
              style={{ color: 'var(--text-primary)' }}
            >
              正心
            </div>
            <div 
              className="text-sm opacity-90"
              style={{ color: 'var(--text-primary)' }}
            >
              承上启下
            </div>
          </div>
          <div 
            className="flex justify-center items-center gap-4 mt-4 text-xs"
            style={{ color: 'var(--text-tertiary)' }}
          >
            <span>↑ 承接内在修养</span>
            <span>↓ 开启外在实践</span>
          </div>
        </div>

        {/* 下方：外在实践 */}
        <div>
          <h3 
            className="text-lg font-semibold mb-4 text-center"
            style={{ color: 'var(--text-secondary)' }}
          >
            外在实践
          </h3>
          <div className="flex justify-center space-x-4 flex-wrap gap-2">
            {['修身', '齐家', '治国', '平天下'].map((step, index) => (
              <div
                key={index}
                className="px-4 py-2 rounded-lg font-medium border"
                style={{
                  backgroundColor: 'var(--bg-success-alpha)',
                  color: 'var(--color-success)',
                  borderColor: 'var(--border-color-overlay)',
                }}
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
