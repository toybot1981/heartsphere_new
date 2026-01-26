/**
 * Mobile版本全局错误边界组件
 * Phase 5优化: 添加全局错误处理，提升应用稳定性
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { MobileTouchableButton } from './MobileTouchableButton';
import { MobileSafeAreaView } from './MobileSafeAreaView';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Mobile版本全局错误边界组件
 * 捕获子组件树中的JavaScript错误，记录错误并显示降级UI
 */
export class MobileErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // 记录错误信息
    console.error('[MobileErrorBoundary] 捕获到错误:', error);
    console.error('[MobileErrorBoundary] 错误信息:', errorInfo);

    // 更新状态
    this.setState({
      error,
      errorInfo,
    });

    // 调用外部错误处理函数
    this.props.onError?.(error, errorInfo);

    // 可以在这里发送错误报告到服务器
    // errorReportingService.reportError(error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // 如果提供了自定义fallback，使用它
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // 默认错误UI
      return (
        <MobileSafeAreaView 
          className="h-full w-full flex items-center justify-center p-4"
          style={{ backgroundColor: 'var(--bg-primary, #000000)' }}
        >
          <div className="max-w-md w-full text-center">
            <div className="text-6xl mb-4">😕</div>
            <h2 
              className="text-xl font-bold mb-2"
              style={{ color: 'var(--text-primary)' }}
            >
              出现了一些问题
            </h2>
            <p 
              className="text-sm mb-6"
              style={{ color: 'var(--text-tertiary)' }}
            >
              应用遇到了一个错误。我们已经记录了这个问题，并会尽快修复。
            </p>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div 
                className="mb-6 p-4 border rounded-lg text-left"
                style={{
                  backgroundColor: 'var(--bg-error-alpha, rgba(127, 29, 29, 0.2))',
                  borderColor: 'var(--border-error-alpha, rgba(239, 68, 68, 0.3))',
                }}
              >
                <p 
                  className="text-xs font-mono mb-2"
                  style={{ color: 'var(--color-error, #f87171)' }}
                >
                  {this.state.error.toString()}
                </p>
                {this.state.errorInfo && (
                  <details 
                    className="text-xs"
                    style={{ color: 'var(--color-error, rgba(252, 165, 165, 1))' }}
                  >
                    <summary 
                      className="cursor-pointer mb-2"
                      style={{ color: 'var(--color-error, rgba(252, 165, 165, 1))' }}
                    >
                      错误堆栈
                    </summary>
                    <pre 
                      className="overflow-auto max-h-40 text-xs"
                      style={{ color: 'var(--color-error, rgba(252, 165, 165, 1))' }}
                    >
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </div>
            )}

            <div className="flex flex-col gap-3">
              <MobileTouchableButton
                onClick={this.handleReset}
                variant="primary"
                fullWidth
              >
                重试
              </MobileTouchableButton>
              <MobileTouchableButton
                onClick={this.handleReload}
                variant="outline"
                fullWidth
              >
                重新加载页面
              </MobileTouchableButton>
            </div>
          </div>
        </MobileSafeAreaView>
      );
    }

    return this.props.children;
  }
}
