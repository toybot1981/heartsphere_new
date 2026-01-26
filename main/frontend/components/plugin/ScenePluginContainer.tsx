// 场景插件容器组件
import React, { useState, useRef, useEffect } from 'react';
import type { ScenePluginDTO } from '../../services/api/plugin/scenePlugin';
import { showConfirm, showAlert } from '../../utils/dialog';
import { userPluginApi } from '../../services/api/plugin/userPlugin';
import { PhotoAlbumPlugin } from './PhotoAlbumPlugin';
import { logger } from '../../utils/logger';

// 检测是否为移动设备
const isMobileDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
  const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
  const isSmallScreen = window.innerWidth <= 768;
  return isMobile || isSmallScreen;
};

interface ScenePluginContainerProps {
  plugin: ScenePluginDTO;
  isEditMode: boolean;
  sceneId?: string;
  onDelete: (pluginInstanceId: number) => void;
  onUpdatePosition: (pluginInstanceId: number, position: { x: number; y: number; width?: number; height?: number }) => void;
  onConfig: (pluginInstanceId: number) => void;
  onOpenJournal?: () => void; // 打开日志编辑器的回调
  onOpenAlbum?: () => void; // 打开相册的回调（可选）
}

export const ScenePluginContainer: React.FC<ScenePluginContainerProps> = ({
  plugin,
  isEditMode,
  sceneId,
  onDelete,
  onUpdatePosition,
  onConfig,
  onOpenJournal,
  onOpenAlbum,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [showAlbumView, setShowAlbumView] = useState(false); // 是否显示相册视图
  const [isMobile, setIsMobile] = useState(false); // 是否为移动设备
  // 从本地存储加载隐藏状态
  const getHiddenStateFromStorage = (): boolean => {
    try {
      const key = `plugin_hidden_${plugin.pluginInstanceId}`;
      const stored = localStorage.getItem(key);
      return stored === 'true';
    } catch {
      return false;
    }
  };

  const [isHidden, setIsHidden] = useState(getHiddenStateFromStorage()); // 是否隐藏（吸附到右边栏）

  // 保存隐藏状态到本地存储
  useEffect(() => {
    try {
      const key = `plugin_hidden_${plugin.pluginInstanceId}`;
      localStorage.setItem(key, String(isHidden));
    } catch (error) {
      // 忽略存储错误
    }
  }, [isHidden, plugin.pluginInstanceId]);
  const [position, setPosition] = useState({ x: plugin.positionX, y: plugin.positionY });
  const [size, setSize] = useState({ width: plugin.width, height: plugin.height });
  const containerRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const resizeStartRef = useRef({ x: 0, y: 0, width: 0, height: 0 });

  // 检测移动设备
  useEffect(() => {
    setIsMobile(isMobileDevice());
    const handleResize = () => {
      setIsMobile(isMobileDevice());
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    setPosition({ x: plugin.positionX, y: plugin.positionY });
    setSize({ width: plugin.width, height: plugin.height });
  }, [plugin.positionX, plugin.positionY, plugin.width, plugin.height]);

  const handleMouseDown = (e: React.MouseEvent) => {
    // PC 版本支持拖动，移动端不支持
    if (isMobile) return;
    
    // 如果点击的是表单元素（input、textarea、select、button等），不触发拖动
    const target = e.target as HTMLElement;
    if (target.tagName === 'INPUT' || 
        target.tagName === 'TEXTAREA' || 
        target.tagName === 'SELECT' || 
        target.tagName === 'BUTTON' ||
        target.closest('input') ||
        target.closest('textarea') ||
        target.closest('select') ||
        target.closest('button') ||
        target.closest('[contenteditable="true"]')) {
      return;
    }
    
    e.preventDefault();
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
  };

  const handleResizeMouseDown = (e: React.MouseEvent) => {
    // PC 版本支持调整大小，移动端不支持
    if (isMobile) return;
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    resizeStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      width: size.width,
      height: size.height,
    };
  };

  useEffect(() => {
    if (!isDragging && !isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const newX = e.clientX - dragStartRef.current.x;
        const newY = e.clientY - dragStartRef.current.y;
        // 限制在视口范围内
        const maxX = window.innerWidth - size.width;
        const maxY = window.innerHeight - size.height;
        setPosition({ 
          x: Math.max(0, Math.min(newX, maxX)), 
          y: Math.max(0, Math.min(newY, maxY)) 
        });
      } else if (isResizing) {
        const deltaX = e.clientX - resizeStartRef.current.x;
        const deltaY = e.clientY - resizeStartRef.current.y;
        const newWidth = resizeStartRef.current.width + deltaX;
        const newHeight = resizeStartRef.current.height + deltaY;
        // 限制最小和最大尺寸
        const maxWidth = Math.min(window.innerWidth - position.x, 90 * window.innerWidth / 100);
        const maxHeight = Math.min(window.innerHeight - position.y, 90 * window.innerHeight / 100);
        setSize({
          width: Math.max(200, Math.min(newWidth, maxWidth)),
          height: Math.max(150, Math.min(newHeight, maxHeight)),
        });
      }
    };

    const handleMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
        onUpdatePosition(plugin.pluginInstanceId, {
          x: position.x,
          y: position.y,
        });
      } else if (isResizing) {
        setIsResizing(false);
        onUpdatePosition(plugin.pluginInstanceId, {
          x: position.x,
          y: position.y,
          width: size.width,
          height: size.height,
        });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, position, size, plugin.pluginInstanceId, onUpdatePosition]);

  const handleDelete = async () => {
    const confirmed = await showConfirm('确定要删除此插件吗？', '删除插件', 'warning');
    if (confirmed) {
      onDelete(plugin.pluginInstanceId);
    }
  };

  const handleExecutePlugin = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (isEditMode || isExecuting) {
      return;
    }

    setIsExecuting(true);
    try {
      // 获取token（从localStorage或context）
      const token = localStorage.getItem('token') || localStorage.getItem('auth_token') || undefined;
      
      // 执行插件
      const result = await userPluginApi.executePlugin(
        plugin.pluginId,
        {
          sceneId: sceneId,
          action: 'execute',
          params: plugin.config || {},
        },
        token
      );

      // 根据插件类型处理结果，实现与日志/相册的联动
      if (result?.action === 'open_journal') {
        // 打开日志编辑器
        showAlert(result.message || '正在打开日志编辑器...', 'success');
        if (onOpenJournal) {
          // 延迟一下，确保提示显示
          setTimeout(() => {
            onOpenJournal();
          }, 500);
        }
      } else if (result?.action === 'open_album') {
        // 如果是相册插件，直接显示相册视图
        const isPhotoAlbumPlugin = plugin.pluginId === 'photo-album' || plugin.pluginName?.includes('相册');
        
        if (isPhotoAlbumPlugin) {
          setShowAlbumView(true);
          // 显示提示并自动关闭（1.5秒后）
          showAlert(result.message || '正在打开相册...', 'success', 'success', undefined, 1500);
        } else {
          if (onOpenAlbum) {
            // 其他插件类型，使用回调打开外部相册
            setTimeout(() => {
              onOpenAlbum();
            }, 500);
          }
        }
      } else {
        // 处理其他类型的插件结果
        logger.info('[ScenePluginContainer] 处理其他插件动作', {
          action: result?.action,
          message: result?.message,
        });
        
        // 兜底逻辑：如果是相册插件，即使后端没有返回 open_album action，也直接打开相册视图
        const isPhotoAlbumPlugin = plugin.pluginId === 'photo-album' || plugin.pluginName?.includes('相册');
        if (isPhotoAlbumPlugin) {
          setShowAlbumView(true);
          
          // 显示提示并自动关闭（1.5秒后）
          showAlert('正在打开相册...', 'success', 'success', undefined, 1500);
        } else {
          // 其他插件类型，显示成功消息
          showAlert(result?.message || '插件功能执行成功', 'success');
        }
      }
    } catch (error: any) {
      logger.error('[ScenePluginContainer] 执行插件失败', {
        pluginInstanceId: plugin.pluginInstanceId,
        pluginId: plugin.pluginId,
        error: error?.message || error,
        stack: error?.stack,
      });
      showAlert(error?.message || '执行插件功能失败，请稍后重试', '错误', 'error');
    } finally {
      setIsExecuting(false);
      logger.info('[ScenePluginContainer] 插件执行完成', {
        pluginInstanceId: plugin.pluginInstanceId,
      });
    }
  };

  // 处理隐藏/显示切换
  const handleToggleHide = () => {
    const newHiddenState = !isHidden;
    setIsHidden(newHiddenState);
    
    if (newHiddenState) {
      // 隐藏：吸附到右边栏，留出12px的小条
      const hiddenBarWidth = 12; // 隐藏时显示的条宽度
      const rightEdge = window.innerWidth - hiddenBarWidth;
      const newY = position.y; // 保持垂直位置
      setPosition({ x: rightEdge, y: newY });
      // 保存位置到后端
      onUpdatePosition(plugin.pluginInstanceId, {
        x: rightEdge,
        y: newY,
        width: size.width,
        height: size.height,
      });
    } else {
      // 显示：恢复到之前的位置（或默认位置）
      const defaultX = window.innerWidth - size.width - 20;
      const newX = position.x < window.innerWidth / 2 ? defaultX : position.x;
      setPosition({ x: newX, y: position.y });
      onUpdatePosition(plugin.pluginInstanceId, {
        x: newX,
        y: position.y,
        width: size.width,
        height: size.height,
      });
    }
  };

  // 处理点击边框展开
  const handleExpandFromHidden = () => {
    if (isHidden) {
      setIsHidden(false);
      const defaultX = window.innerWidth - size.width - 20;
      setPosition({ x: defaultX, y: position.y });
      onUpdatePosition(plugin.pluginInstanceId, {
        x: defaultX,
        y: position.y,
        width: size.width,
        height: size.height,
      });
    }
  };

  // 如果插件被隐藏，仍然显示但降低透明度（而不是完全不显示）
  // 移动端不显示插件
  if (isMobile) {
    return null;
  }

  // if (!plugin.visible) return null;

  // 计算隐藏时的位置（吸附到右边栏）
  const hiddenBarWidth = 12; // 隐藏时显示的条宽度
  const hiddenX = window.innerWidth - hiddenBarWidth; // 留出12px的小条
  const displayX = isHidden ? hiddenX : position.x;
  const displayWidth = isHidden ? hiddenBarWidth : size.width;
  const displayHeight = isHidden ? size.height : size.height;

  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        left: `${displayX}px`,
        top: `${position.y}px`,
        width: `${displayWidth}px`,
        height: `${displayHeight}px`,
        zIndex: (plugin.zIndex || 100) + 100, // 降低 z-index，避免遮挡其他内容
        maxWidth: '90vw', // 限制最大宽度，避免超出屏幕
        maxHeight: '90vh', // 限制最大高度，避免超出屏幕
        pointerEvents: 'auto',
        overflow: isHidden ? 'visible' : 'hidden', // 隐藏时允许边框突出
      }}
      className="border-2 rounded-xl shadow-2xl backdrop-blur-sm transition-all duration-200"
      style={{
        backgroundColor: isHidden 
          ? 'var(--bg-overlay, rgba(51, 65, 85, 0.8))' 
          : 'var(--bg-card, rgba(30, 41, 59, 0.95))',
        borderColor: isEditMode 
          ? 'var(--color-info, #06b6d4)' 
          : 'var(--bg-overlay, #475569)',
        boxShadow: isEditMode 
          ? 'var(--shadow-lg, 0 10px 15px -3px rgba(0, 0, 0, 0.1)), 0 0 0 2px var(--color-info, rgba(6, 182, 212, 0.3))' 
          : 'var(--shadow-xl, 0 20px 25px -5px rgba(0, 0, 0, 0.1))',
        cursor: isDragging ? 'move' : isHidden ? 'pointer' : 'default',
        transform: isDragging ? 'scale(1.05)' : 'scale(1)',
        opacity: !plugin.visible ? 0.5 : 1,
      }}
      onMouseEnter={(e) => {
        if (isHidden) {
          e.currentTarget.style.borderColor = 'var(--color-info, #22d3ee)';
          e.currentTarget.style.backgroundColor = 'var(--bg-hover, rgba(71, 85, 105, 0.9))';
        }
      }}
      onMouseLeave={(e) => {
        if (isHidden) {
          e.currentTarget.style.borderColor = 'var(--bg-overlay, #475569)';
          e.currentTarget.style.backgroundColor = 'var(--bg-overlay, rgba(51, 65, 85, 0.8))';
        }
      }}
      onClick={isHidden ? handleExpandFromHidden : undefined}
      onMouseDown={isHidden ? undefined : handleMouseDown}
      onMouseDownCapture={isHidden ? undefined : (e) => {
        // 如果点击的是表单元素，阻止事件冒泡到容器
        const target = e.target as HTMLElement;
        if (target.tagName === 'INPUT' || 
            target.tagName === 'TEXTAREA' || 
            target.tagName === 'SELECT' || 
            target.tagName === 'BUTTON' ||
            target.closest('input') ||
            target.closest('textarea') ||
            target.closest('select') ||
            target.closest('button') ||
            target.closest('[contenteditable="true"]')) {
          e.stopPropagation();
        }
      }}
    >
      {/* Hide Button - 始终显示在插件上方 */}
      {!isHidden && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleToggleHide();
          }}
          className="absolute -top-8 right-0 p-1.5 border rounded-t-lg transition-all z-20"
          style={{
            backgroundColor: 'var(--bg-overlay, rgba(15, 23, 42, 0.9))',
            borderColor: 'var(--bg-overlay, #475569)',
            color: 'var(--text-tertiary)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--bg-secondary, #1e293b)';
            e.currentTarget.style.borderColor = 'var(--bg-overlay, #64748b)';
            e.currentTarget.style.color = 'var(--color-warning, #fbbf24)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--bg-overlay, rgba(15, 23, 42, 0.9))';
            e.currentTarget.style.borderColor = 'var(--bg-overlay, #475569)';
            e.currentTarget.style.color = 'var(--text-tertiary)';
          }}
          title="隐藏插件"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.29 3.29m13.42 13.42l-3.29-3.29M3 3l13.42 13.42" />
          </svg>
        </button>
      )}

      {/* Edit Mode Toolbar */}
      {isEditMode && !isHidden && (
        <div
          className="absolute -top-8 left-0 flex gap-1 border rounded-t-lg px-2 py-1 z-10"
          style={{
            backgroundColor: 'var(--bg-overlay, #0f172a)',
            borderColor: 'var(--color-info, #06b6d4)',
          }}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <button
            onClick={handleDelete}
            className="p-1 transition-colors"
            style={{ color: 'var(--color-error, #f87171)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--color-error-light, #fca5a5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--color-error, #f87171)';
            }}
            title="删除插件"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
          <button
            onClick={() => onConfig(plugin.pluginInstanceId)}
            className="p-1 transition-colors"
            style={{ color: 'var(--color-info, #06b6d4)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--color-info-light, #22d3ee)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--color-info, #06b6d4)';
            }}
            title="配置插件"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      )}

      {/* 隐藏时显示的小条提示 - 可点击恢复 */}
      {isHidden && (
        <div 
          className="w-full h-full flex items-center justify-center transition-colors cursor-pointer"
          style={{
            backgroundColor: 'var(--bg-overlay, rgba(51, 65, 85, 0.8))',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--bg-hover, rgba(71, 85, 105, 0.9))';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--bg-overlay, rgba(51, 65, 85, 0.8))';
          }}
          onClick={handleExpandFromHidden}
          title={`点击恢复 ${plugin.pluginName || '插件'}`}
        >
          <div 
            className="transform -rotate-90 whitespace-nowrap text-xs font-semibold flex items-center gap-1"
            style={{ color: 'var(--text-secondary)' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span>{plugin.pluginName || '插件'}</span>
          </div>
        </div>
      )}

      {/* Plugin Content - 隐藏时不显示内容 */}
      {!isHidden && (
        <div
          className="w-full h-full p-4 overflow-auto flex flex-col"
          onMouseDown={(e) => {
            // 在编辑模式下，如果点击的是可交互元素（按钮、输入框等），不触发拖动
            const target = e.target as HTMLElement;
            if (isEditMode && !target.closest('button') && !target.closest('input') && !target.closest('textarea') && !target.closest('select')) {
              handleMouseDown(e);
            }
          }}
          style={{ cursor: 'move' }}
        >
        {/* Plugin Header */}
        <div 
          className="flex items-center justify-between mb-3 pb-2 border-b"
          style={{ borderColor: 'var(--bg-overlay, #475569)' }}
        >
          <div className="flex items-center gap-2">
            <div 
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{
                background: 'var(--gradient-primary, linear-gradient(to bottom right, #6366f1, #9333ea))',
              }}
            >
              <span className="text-lg">🔌</span>
            </div>
            <div>
              <h3 
                className="font-semibold text-sm"
                style={{ color: 'var(--text-primary)' }}
              >
                {plugin.pluginName}
              </h3>
              <span 
                className="text-xs"
                style={{ color: 'var(--text-tertiary)' }}
              >
                ID: {plugin.pluginId}
              </span>
            </div>
          </div>
          {!isEditMode && (
            <div className="flex items-center gap-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onConfig(plugin.pluginInstanceId);
                }}
                className="p-1 transition-colors"
                style={{ color: 'var(--text-tertiary)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'var(--color-info, #22d3ee)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--text-tertiary)';
                }}
                title="配置插件"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete();
                }}
                className="p-1 transition-colors"
                style={{ color: 'var(--text-tertiary)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'var(--color-error, #f87171)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--text-tertiary)';
                }}
                title="删除插件"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* Plugin Body */}
        <div className="flex-1 flex flex-col gap-3 overflow-hidden">
          {/* 如果是相册插件且已打开相册视图，显示相册组件 */}
          {(() => {
            const isPhotoAlbumPlugin = plugin.pluginId === 'photo-album' || plugin.pluginName?.includes('相册');
            // 允许在编辑模式下也显示相册视图（用于预览）
            const shouldShowAlbumView = showAlbumView && isPhotoAlbumPlugin;
            
            if (shouldShowAlbumView) {
              const token = localStorage.getItem('auth_token') || localStorage.getItem('token') || undefined;
              
              return (
                <div className="flex-1 overflow-hidden">
                  <div className="h-full flex flex-col">
                    <div 
                      className="flex items-center justify-between mb-2 pb-2 border-b"
                      style={{ borderColor: 'var(--bg-overlay, #475569)' }}
                    >
                      <h3 
                        className="text-sm font-semibold flex items-center gap-2"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        <span className="text-lg">📷</span>
                        {plugin.pluginName || '家庭温馨相册'}
                      </h3>
                      <button
                        onClick={() => {
                          setShowAlbumView(false);
                        }}
                        className="p-1 transition-colors"
                        style={{ color: 'var(--text-tertiary)' }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = 'var(--text-primary)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = 'var(--text-tertiary)';
                        }}
                        title="返回"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <PhotoAlbumPlugin
                        pluginInstanceId={plugin.pluginInstanceId}
                        token={token}
                      />
                    </div>
                  </div>
                </div>
              );
            }
            
            return (
            <>
              {/* 插件状态指示 */}
              <div className="flex items-center gap-2 text-xs">
                <div 
                  className="w-2 h-2 rounded-full animate-pulse"
                  style={{ backgroundColor: 'var(--color-success, #4ade80)' }}
                />
                <span style={{ color: 'var(--text-tertiary)' }}>插件运行中</span>
              </div>

              {/* 插件功能区域 */}
              <div 
                className="flex-1 rounded-lg p-3 border overflow-auto"
                style={{
                  backgroundColor: 'var(--bg-overlay, rgba(15, 23, 42, 0.5))',
                  borderColor: 'var(--bg-overlay, #475569)',
                }}
              >
            {!isEditMode && (
              <div 
                className="mb-3 p-2 rounded-lg border"
                style={{
                  backgroundColor: 'var(--color-primary, rgba(79, 70, 229, 0.2))',
                  borderColor: 'var(--color-primary, rgba(79, 70, 229, 0.3))',
                }}
              >
                <p 
                  className="text-xs font-semibold mb-1"
                  style={{ color: 'var(--color-primary, #c7d2fe)' }}
                >
                  ✨ 插件已就绪
                </p>
                <p 
                  className="text-[10px]"
                  style={{ color: 'var(--text-tertiary)' }}
                >
                  点击下方按钮使用插件功能
                </p>
              </div>
            )}
            
            {/* 执行按钮 - 在非编辑模式下始终显示 */}
            {!isEditMode && (
              <div className="space-y-2">
              <button
                onClick={handleExecutePlugin}
                className="w-full px-4 py-3 font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
                style={{ 
                  minHeight: '44px',
                  fontSize: '14px',
                  background: 'var(--gradient-primary, linear-gradient(to right, #4f46e5, #9333ea))',
                  color: 'var(--text-primary)',
                }}
                disabled={isEditMode || isExecuting || !plugin.visible}
                onMouseEnter={(e) => {
                  if (!isEditMode && !isExecuting && plugin.visible) {
                    e.currentTarget.style.background = 'var(--gradient-primary, linear-gradient(to right, #6366f1, #a855f7))';
                    e.currentTarget.style.transform = 'scale(1.05)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-xl, 0 20px 25px -5px rgba(0, 0, 0, 0.1))';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isEditMode && !isExecuting && plugin.visible) {
                    e.currentTarget.style.background = 'var(--gradient-primary, linear-gradient(to right, #4f46e5, #9333ea))';
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-lg, 0 10px 15px -3px rgba(0, 0, 0, 0.1))';
                  }
                }}
                onMouseDown={(e) => {
                  if (!isEditMode && !isExecuting && plugin.visible) {
                    e.currentTarget.style.transform = 'scale(0.95)';
                  }
                }}
                onMouseUp={(e) => {
                  if (!isEditMode && !isExecuting && plugin.visible) {
                    e.currentTarget.style.transform = 'scale(1.05)';
                  }
                }}
              >
                {isExecuting ? (
                  <>
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>执行中...</span>
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>执行插件功能</span>
                  </>
                )}
              </button>
              </div>
            )}
            
            {/* 编辑模式提示 */}
            {isEditMode && (
              <div className="text-center py-4">
                <p 
                  className="text-xs mb-2"
                  style={{ color: 'var(--text-tertiary)' }}
                >
                  编辑模式
                </p>
                <p 
                  className="text-[10px] mb-3"
                  style={{ color: 'var(--text-disabled)' }}
                >
                  退出编辑模式后可使用插件功能
                </p>
                {/* 编辑模式下也可以预览相册 */}
                {(plugin.pluginId === 'photo-album' || plugin.pluginName?.includes('相册')) && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowAlbumView(true);
                    }}
                    className="px-3 py-1.5 text-xs rounded-lg transition-colors border"
                    style={{
                      backgroundColor: 'var(--color-primary, rgba(79, 70, 229, 0.2))',
                      borderColor: 'var(--color-primary, rgba(79, 70, 229, 0.3))',
                      color: 'var(--color-primary, #c7d2fe)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--color-primary, rgba(79, 70, 229, 0.3))';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--color-primary, rgba(79, 70, 229, 0.2))';
                    }}
                  >
                    📷 预览相册
                  </button>
                )}
              </div>
            )}
            
            {/* 配置信息显示 */}
            {plugin.config && Object.keys(plugin.config).length > 0 && (
              <div 
                className="mt-2 p-2 rounded text-xs"
                style={{
                  backgroundColor: 'var(--bg-overlay, rgba(30, 41, 59, 0.5))',
                }}
              >
                <p 
                  className="mb-1"
                  style={{ color: 'var(--text-tertiary)' }}
                >
                  当前配置:
                </p>
                <pre 
                  className="text-[10px] overflow-x-auto"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {JSON.stringify(plugin.config, null, 2)}
                </pre>
              </div>
            )}
            
            {(!plugin.config || Object.keys(plugin.config).length === 0) && (
              <div 
                className="mt-2 p-2 rounded text-xs text-center"
                style={{
                  backgroundColor: 'var(--bg-overlay, rgba(30, 41, 59, 0.5))',
                  color: 'var(--text-disabled)',
                }}
              >
                <p>暂无配置信息</p>
                <p 
                  className="text-[10px] mt-1"
                  style={{ color: 'var(--text-disabled)' }}
                >
                  点击右上角 ⚙️ 进行配置
                </p>
              </div>
            )}
              </div>

              {/* 使用提示（编辑模式时显示） */}
              {isEditMode && (
                <div 
                  className="text-xs rounded p-2 border"
                  style={{
                    color: 'var(--color-info, #22d3ee)',
                    backgroundColor: 'var(--color-info, rgba(6, 182, 212, 0.2))',
                    borderColor: 'var(--color-info, rgba(6, 182, 212, 0.5))',
                  }}
                >
                  <p>💡 <strong>使用提示:</strong></p>
                  <ul 
                    className="list-disc list-inside mt-1 space-y-0.5"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    <li>点击并拖拽插件来移动位置</li>
                    <li>拖拽右下角调整大小</li>
                    <li>点击 ⚙️ 配置插件</li>
                    <li>点击 🗑️ 删除插件</li>
                    <li>退出编辑模式后可正常使用插件</li>
                  </ul>
                </div>
              )}
            </>
            );
          })()}
        </div>
        </div>
      )}

      {(!isMobile && !isHidden) && (
        <div
          className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize transition-colors z-50"
          style={{
            clipPath: 'polygon(100% 0, 0 100%, 100% 100%)',
            pointerEvents: 'auto',
            backgroundColor: 'var(--color-info, #06b6d4)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--color-info-light, #22d3ee)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--color-info, #06b6d4)';
          }}
          onMouseDown={handleResizeMouseDown}
          title="拖动调整大小"
        />
      )}
    </div>
  );
};
