import React, { useState } from 'react';

/**
 * 产品截图展示组件
 * 产品界面截图轮播或网格展示，支持点击放大查看
 */
export const ProductScreenshots: React.FC = () => {
  // 占位符：实际应使用真实的产品截图
  const screenshots = [
    { id: 1, url: '/company/images/product/screenshot1.png', alt: '产品界面截图1' },
    { id: 2, url: '/company/images/product/screenshot2.png', alt: '产品界面截图2' },
    { id: 3, url: '/company/images/product/screenshot3.png', alt: '产品界面截图3' },
  ];

  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  return (
    <div>
      <h2 className="text-3xl font-bold text-neutral-900 mb-8 text-center">产品截图</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {screenshots.map((screenshot) => (
          <div
            key={screenshot.id}
            className="bg-white rounded-lg overflow-hidden border border-neutral-200 hover:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-300 transition-all cursor-pointer"
            onClick={() => setSelectedImage(screenshot.url)}
          >
            <div className="aspect-video bg-neutral-100 flex items-center justify-center">
              <span className="text-neutral-400">截图占位符</span>
            </div>
            <div className="p-4">
              <p className="text-neutral-700 text-sm">{screenshot.alt}</p>
            </div>
          </div>
        ))}
      </div>

      {/* 放大查看模态框 */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="max-w-5xl max-h-[90vh] overflow-auto">
            <img
              src={selectedImage}
              alt="产品截图"
              className="w-full h-auto rounded-lg"
            />
          </div>
          <button
            className="absolute top-4 right-4 text-white hover:text-gray-300 text-4xl"
            onClick={() => setSelectedImage(null)}
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
};
