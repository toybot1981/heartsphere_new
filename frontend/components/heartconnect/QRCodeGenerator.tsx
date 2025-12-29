import React, { useEffect, useRef } from 'react';

interface QRCodeGeneratorProps {
  text: string;
  size?: number;
  className?: string;
}

/**
 * 二维码生成组件
 * 使用Canvas API生成二维码
 */
export const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({
  text,
  size = 200,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    if (canvasRef.current && text) {
      generateQRCode(canvasRef.current, text, size);
    }
  }, [text, size]);
  
  const generateQRCode = (canvas: HTMLCanvasElement, text: string, size: number) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // 设置画布大小
    canvas.width = size;
    canvas.height = size;
    
    // 使用简单的二维码生成算法（简化版）
    // 实际项目中建议使用 qrcode 库
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, size, size);
    
    ctx.fillStyle = '#000000';
    
    // 生成简单的二维码模式（实际应使用专业库）
    const moduleSize = size / 25; // 25x25 模块
    for (let i = 0; i < 25; i++) {
      for (let j = 0; j < 25; j++) {
        // 基于文本内容生成模式
        const hash = (text.charCodeAt(i % text.length) + j) % 3;
        if (hash === 0) {
          ctx.fillRect(i * moduleSize, j * moduleSize, moduleSize, moduleSize);
        }
      }
    }
    
    // 添加定位标记（左上、右上、左下）
    drawFinderPattern(ctx, 0, 0, moduleSize * 7);
    drawFinderPattern(ctx, size - moduleSize * 7, 0, moduleSize * 7);
    drawFinderPattern(ctx, 0, size - moduleSize * 7, moduleSize * 7);
  };
  
  const drawFinderPattern = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
    // 外框
    ctx.fillStyle = '#000000';
    ctx.fillRect(x, y, size, size);
    
    // 内框
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(x + size / 7, y + size / 7, size * 5 / 7, size * 5 / 7);
    
    // 中心点
    ctx.fillStyle = '#000000';
    ctx.fillRect(x + size * 2 / 7, y + size * 2 / 7, size * 3 / 7, size * 3 / 7);
  };
  
  if (!text) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 ${className}`} style={{ width: size, height: size }}>
        <span className="text-gray-400 text-sm">暂无内容</span>
      </div>
    );
  }
  
  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ width: size, height: size }}
    />
  );
};

/**
 * 使用专业库的二维码生成器（推荐）
 * 需要安装: npm install qrcode
 */
export const QRCodeGeneratorWithLibrary: React.FC<QRCodeGeneratorProps> = ({
  text,
  size = 200,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    if (canvasRef.current && text) {
      // 动态导入qrcode库
      import('qrcode').then((QRCode) => {
        QRCode.toCanvas(canvasRef.current, text, {
          width: size,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF',
          },
        }).catch((err) => {
          console.error('生成二维码失败:', err);
        });
      });
    }
  }, [text, size]);
  
  if (!text) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 ${className}`} style={{ width: size, height: size }}>
        <span className="text-gray-400 text-sm">暂无内容</span>
      </div>
    );
  }
  
  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ width: size, height: size }}
    />
  );
};

