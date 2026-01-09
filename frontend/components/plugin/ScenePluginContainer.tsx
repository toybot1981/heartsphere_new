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
  const [isHidden, setIsHidden] = useState(false); // 是否隐藏（吸附到右边栏）

  // 调试日志：组件初始化
  useEffect(() => {
    console.log('[ScenePluginContainer] 组件初始化', {
      pluginInstanceId: plugin.pluginInstanceId,
      pluginId: plugin.pluginId,
      pluginName: plugin.pluginName,
      isEditMode,
      showAlbumView,
      sceneId,
    });
  }, []);

  // 调试日志：showAlbumView 状态变化
  useEffect(() => {
    console.log('[ScenePluginContainer] showAlbumView 状态变化', {
      showAlbumView,
      pluginId: plugin.pluginId,
      pluginName: plugin.pluginName,
      isEditMode,
      pluginInstanceId: plugin.pluginInstanceId,
    });
  }, [showAlbumView, plugin.pluginId, plugin.pluginName, isEditMode]);
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

  // 调试日志：组件初始化
  useEffect(() => {
    logger.debug('[ScenePluginContainer] 组件初始化', {
      pluginInstanceId: plugin.pluginInstanceId,
      pluginId: plugin.pluginId,
      pluginName: plugin.pluginName,
      isEditMode,
      showAlbumView,
      visible: plugin.visible,
      isMobile,
    });
  }, []);

  // 调试日志：showAlbumView 状态变化
  useEffect(() => {
    logger.debug('[ScenePluginContainer] showAlbumView 状态变化', {
      pluginInstanceId: plugin.pluginInstanceId,
      pluginId: plugin.pluginId,
      pluginName: plugin.pluginName,
      showAlbumView,
      isEditMode,
    });
  }, [showAlbumView, isEditMode]);

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
    
    console.log('[ScenePluginContainer] ========== handleExecutePlugin 被调用 ==========');
    console.log('[ScenePluginContainer] 调用信息:', {
      pluginInstanceId: plugin.pluginInstanceId,
      pluginId: plugin.pluginId,
      pluginName: plugin.pluginName,
      isEditMode,
      isExecuting,
      visible: plugin.visible,
      showAlbumView: showAlbumView, // 当前状态
    });
    
    logger.debug('[ScenePluginContainer] handleExecutePlugin 被调用', {
      pluginInstanceId: plugin.pluginInstanceId,
      pluginId: plugin.pluginId,
      pluginName: plugin.pluginName,
      isEditMode,
      isExecuting,
      visible: plugin.visible,
    });

    if (isEditMode || isExecuting) {
      console.warn('[ScenePluginContainer] ⚠️ 插件执行被阻止', {
        reason: isEditMode ? '编辑模式' : '正在执行中',
        pluginInstanceId: plugin.pluginInstanceId,
      });
      logger.warn('[ScenePluginContainer] 插件执行被阻止', {
        reason: isEditMode ? '编辑模式' : '正在执行中',
        pluginInstanceId: plugin.pluginInstanceId,
      });
      return;
    }

    setIsExecuting(true);
    try {
      // 获取token（从localStorage或context）
      const token = localStorage.getItem('token') || localStorage.getItem('auth_token') || undefined;
      
      logger.debug('[ScenePluginContainer] 开始执行插件', {
        pluginInstanceId: plugin.pluginInstanceId,
        pluginId: plugin.pluginId,
        pluginName: plugin.pluginName,
        sceneId,
        hasToken: !!token,
        config: plugin.config,
      });
      
      // 执行插件
      console.log('[ScenePluginContainer] 调用 userPluginApi.executePlugin...', {
        pluginId: plugin.pluginId,
        sceneId,
        action: 'execute',
        hasConfig: !!plugin.config,
        configKeys: plugin.config ? Object.keys(plugin.config) : [],
      });
      
      const result = await userPluginApi.executePlugin(
        plugin.pluginId,
        {
          sceneId: sceneId,
          action: 'execute',
          params: plugin.config || {},
        },
        token
      );

      console.log('[ScenePluginContainer] ========== 插件执行结果 ==========');
      console.log('[ScenePluginContainer] 执行结果详情:', {
        pluginInstanceId: plugin.pluginInstanceId,
        pluginId: plugin.pluginId,
        result,
        resultAction: result?.action,
        resultMessage: result?.message,
        resultType: typeof result,
        resultKeys: result ? Object.keys(result) : [],
        resultStringified: JSON.stringify(result, null, 2),
      });
      
      logger.debug('[ScenePluginContainer] 插件执行结果', {
        pluginInstanceId: plugin.pluginInstanceId,
        pluginId: plugin.pluginId,
        result,
        resultAction: result?.action,
      });

      // 根据插件类型处理结果，实现与日志/相册的联动
      if (result?.action === 'open_journal') {
        logger.debug('[ScenePluginContainer] 处理 open_journal 动作');
        // 打开日志编辑器
        showAlert(result.message || '正在打开日志编辑器...', 'success');
        if (onOpenJournal) {
          // 延迟一下，确保提示显示
          setTimeout(() => {
            onOpenJournal();
          }, 500);
        } else {
          logger.warn('[ScenePluginContainer] onOpenJournal 回调未提供');
        }
      } else if (result?.action === 'open_album') {
        console.log('[ScenePluginContainer] ========== 处理 open_album 动作 ==========');
        console.log('[ScenePluginContainer] 插件信息:', {
          pluginInstanceId: plugin.pluginInstanceId,
          pluginId: plugin.pluginId,
          pluginName: plugin.pluginName,
          isEditMode,
          showAlbumView: showAlbumView, // 当前状态
        });
        
        logger.debug('[ScenePluginContainer] 处理 open_album 动作', {
          pluginId: plugin.pluginId,
          pluginName: plugin.pluginName,
          isPhotoAlbum: plugin.pluginId === 'photo-album',
          nameIncludesAlbum: plugin.pluginName?.includes('相册'),
        });
        
        // 如果是相册插件，直接显示相册视图
        const isPhotoAlbumPlugin = plugin.pluginId === 'photo-album' || plugin.pluginName?.includes('相册');
        
        console.log('[ScenePluginContainer] 插件匹配检查:', {
          pluginId: plugin.pluginId,
          pluginName: plugin.pluginName,
          'plugin.pluginId === "photo-album"': plugin.pluginId === 'photo-album',
          'plugin.pluginName?.includes("相册")': plugin.pluginName?.includes('相册'),
          isPhotoAlbumPlugin,
        });
        
        logger.debug('[ScenePluginContainer] 判断是否为相册插件', {
          pluginId: plugin.pluginId,
          pluginName: plugin.pluginName,
          isPhotoAlbumPlugin,
          willShowAlbumView: isPhotoAlbumPlugin,
        });
        
        if (isPhotoAlbumPlugin) {
          console.log('[ScenePluginContainer] ✅ 是相册插件，准备设置 showAlbumView = true');
          console.log('[ScenePluginContainer] 设置前 showAlbumView 状态:', showAlbumView);
          logger.info('[ScenePluginContainer] 设置 showAlbumView = true');
          setShowAlbumView(true);
          console.log('[ScenePluginContainer] 已调用 setShowAlbumView(true)');
          
          // 显示提示并自动关闭（1.5秒后）
          showAlert(result.message || '正在打开相册...', 'success', 'success', undefined, 1500);
          
          // 使用 setTimeout 确保状态更新后立即检查
          setTimeout(() => {
            console.log('[ScenePluginContainer] 设置后 showAlbumView 状态检查（延迟）:', showAlbumView);
          }, 100);
        } else {
          console.log('[ScenePluginContainer] ❌ 不是相册插件，使用外部回调');
          if (onOpenAlbum) {
            logger.debug('[ScenePluginContainer] 使用外部相册回调');
            // 其他插件类型，使用回调打开外部相册
            setTimeout(() => {
              onOpenAlbum();
            }, 500);
          } else {
            console.warn('[ScenePluginContainer] ⚠️ onOpenAlbum 回调未提供');
            logger.warn('[ScenePluginContainer] onOpenAlbum 回调未提供');
          }
        }
        console.log('[ScenePluginContainer] ========== open_album 处理完成 ==========');
      } else {
        console.log('[ScenePluginContainer] ⚠️ 进入 else 分支（未匹配 open_journal 或 open_album）');
        console.log('[ScenePluginContainer] 结果详情:', {
          action: result?.action,
          message: result?.message,
          resultType: typeof result,
          resultKeys: result ? Object.keys(result) : [],
          fullResult: result,
        });
        
        logger.debug('[ScenePluginContainer] 处理其他插件动作', {
          action: result?.action,
          message: result?.message,
        });
        
        // 兜底逻辑：如果是相册插件，即使后端没有返回 open_album action，也直接打开相册视图
        const isPhotoAlbumPlugin = plugin.pluginId === 'photo-album' || plugin.pluginName?.includes('相册');
        if (isPhotoAlbumPlugin) {
          console.log('[ScenePluginContainer] 🔄 兜底逻辑：检测到相册插件，直接打开相册视图');
          console.log('[ScenePluginContainer] 设置 showAlbumView = true (兜底逻辑)');
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
      logger.debug('[ScenePluginContainer] 插件执行完成', {
        pluginInstanceId: plugin.pluginInstanceId,
      });
    }
  };

  // 处理隐藏/显示切换
  const handleToggleHide = () => {
    const newHiddenState = !isHidden;
    setIsHidden(newHiddenState);
    
    if (newHiddenState) {
      // 隐藏：吸附到右边栏
      const rightEdge = window.innerWidth - 4; // 4px 是边框宽度的一半，让边框突出
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
  const hiddenX = window.innerWidth - 4; // 只显示4px的边框
  const displayX = isHidden ? hiddenX : position.x;
  const displayWidth = isHidden ? 4 : size.width;
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
      className={`${isHidden ? 'bg-transparent' : 'bg-slate-800/95'} border-2 rounded-xl shadow-2xl backdrop-blur-sm ${
        isEditMode ? 'border-cyan-500 shadow-cyan-500/50 ring-2 ring-cyan-500/30' : 'border-slate-600 shadow-slate-900/50'
      } ${isDragging ? 'cursor-move scale-105' : ''} ${!plugin.visible ? 'opacity-50' : 'opacity-100'} transition-all duration-200 ${
        isHidden ? 'cursor-pointer hover:border-cyan-400' : ''
      }`}
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
      {/* Edit Mode Toolbar */}
      {isEditMode && (
        <div
          className="absolute -top-8 left-0 flex gap-1 bg-slate-900 border border-cyan-500 rounded-t-lg px-2 py-1 z-10"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <button
            onClick={handleDelete}
            className="p-1 text-red-400 hover:text-red-300 transition-colors"
            title="删除插件"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
          <button
            onClick={() => onConfig(plugin.pluginInstanceId)}
            className="p-1 text-cyan-400 hover:text-cyan-300 transition-colors"
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
              handleToggleHide();
            }}
            className="p-1 text-yellow-400 hover:text-yellow-300 transition-colors"
            title={isHidden ? "显示插件" : "隐藏插件"}
          >
            {isHidden ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.29 3.29m13.42 13.42l-3.29-3.29M3 3l13.42 13.42" />
              </svg>
            )}
          </button>
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
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-700">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <span className="text-lg">🔌</span>
            </div>
            <div>
              <h3 className="font-semibold text-white text-sm">{plugin.pluginName}</h3>
              <span className="text-xs text-slate-400">ID: {plugin.pluginId}</span>
            </div>
          </div>
          {!isEditMode && (
            <div className="flex items-center gap-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onConfig(plugin.pluginInstanceId);
                }}
                className="p-1 text-slate-400 hover:text-cyan-400 transition-colors"
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
                className="p-1 text-slate-400 hover:text-red-400 transition-colors"
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
            
            console.log('[ScenePluginContainer] ========== 渲染判断 ==========');
            console.log('[ScenePluginContainer] 渲染条件检查:', {
              pluginInstanceId: plugin.pluginInstanceId,
              pluginId: plugin.pluginId,
              pluginName: plugin.pluginName,
              isEditMode,
              showAlbumView,
              isPhotoAlbumPlugin,
              shouldShowAlbumView,
            });
            
            logger.debug('[ScenePluginContainer] 渲染判断', {
              pluginInstanceId: plugin.pluginInstanceId,
              pluginId: plugin.pluginId,
              pluginName: plugin.pluginName,
              isEditMode,
              showAlbumView,
              isPhotoAlbumPlugin,
              shouldShowAlbumView,
            });
            
            if (shouldShowAlbumView) {
              console.log('[ScenePluginContainer] ✅ 条件满足，渲染相册视图');
              const token = localStorage.getItem('auth_token') || localStorage.getItem('token') || undefined;
              console.log('[ScenePluginContainer] 准备渲染 PhotoAlbumPlugin', {
                pluginInstanceId: plugin.pluginInstanceId,
                pluginId: plugin.pluginId,
                pluginName: plugin.pluginName,
                hasToken: !!token,
              });
              logger.debug('[ScenePluginContainer] 渲染 PhotoAlbumPlugin', {
                pluginInstanceId: plugin.pluginInstanceId,
                pluginId: plugin.pluginId,
                pluginName: plugin.pluginName,
                hasToken: !!token,
              });
              
              return (
                <div className="flex-1 overflow-hidden">
                  <div className="h-full flex flex-col">
                    <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-700">
                      <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                        <span className="text-lg">📷</span>
                        {plugin.pluginName || '家庭温馨相册'}
                      </h3>
                      <button
                        onClick={() => {
                          console.log('[ScenePluginContainer] 点击返回按钮，设置 showAlbumView = false');
                          setShowAlbumView(false);
                        }}
                        className="p-1 text-slate-400 hover:text-white transition-colors"
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
            
            console.log('[ScenePluginContainer] ❌ 条件不满足，渲染默认视图', {
              isEditMode,
              showAlbumView,
              isPhotoAlbumPlugin,
              reason: isEditMode ? 'isEditMode=true' : !showAlbumView ? 'showAlbumView=false' : !isPhotoAlbumPlugin ? '不是相册插件' : '未知',
            });
            
            return (
            <>
              {/* 插件状态指示 */}
              <div className="flex items-center gap-2 text-xs">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-slate-400">插件运行中</span>
              </div>

              {/* 插件功能区域 */}
              <div className="flex-1 bg-slate-900/50 rounded-lg p-3 border border-slate-700 overflow-auto">
            {!isEditMode && (
              <div className="mb-3 p-2 bg-indigo-500/20 border border-indigo-500/30 rounded-lg">
                <p className="text-xs text-indigo-300 font-semibold mb-1">✨ 插件已就绪</p>
                <p className="text-[10px] text-slate-400">点击下方按钮使用插件功能</p>
              </div>
            )}
            
            {/* 执行按钮 - 在非编辑模式下始终显示 */}
            {!isEditMode && (
              <div className="space-y-2">
              <button
                onClick={handleExecutePlugin}
                className="w-full px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
                disabled={isEditMode || isExecuting || !plugin.visible}
                style={{ 
                  minHeight: '44px',
                  fontSize: '14px'
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
                <p className="text-xs text-slate-400 mb-2">编辑模式</p>
                <p className="text-[10px] text-slate-500 mb-3">退出编辑模式后可使用插件功能</p>
                {/* 编辑模式下也可以预览相册 */}
                {(plugin.pluginId === 'photo-album' || plugin.pluginName?.includes('相册')) && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      console.log('[ScenePluginContainer] 编辑模式下点击预览相册按钮');
                      console.log('[ScenePluginContainer] 设置 showAlbumView = true (编辑模式)');
                      setShowAlbumView(true);
                    }}
                    className="px-3 py-1.5 text-xs bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 rounded-lg transition-colors border border-indigo-500/30"
                  >
                    📷 预览相册
                  </button>
                )}
              </div>
            )}
            
            {/* 配置信息显示 */}
            {plugin.config && Object.keys(plugin.config).length > 0 && (
              <div className="mt-2 p-2 bg-slate-800/50 rounded text-xs">
                <p className="text-slate-400 mb-1">当前配置:</p>
                <pre className="text-slate-300 text-[10px] overflow-x-auto">
                  {JSON.stringify(plugin.config, null, 2)}
                </pre>
              </div>
            )}
            
            {(!plugin.config || Object.keys(plugin.config).length === 0) && (
              <div className="mt-2 p-2 bg-slate-800/50 rounded text-xs text-center text-slate-500">
                <p>暂无配置信息</p>
                <p className="text-[10px] mt-1">点击右上角 ⚙️ 进行配置</p>
              </div>
            )}
              </div>

              {/* 使用提示（编辑模式时显示） */}
              {isEditMode && (
                <div className="text-xs text-cyan-400 bg-cyan-900/20 border border-cyan-700/50 rounded p-2">
                  <p>💡 <strong>使用提示:</strong></p>
                  <ul className="list-disc list-inside mt-1 space-y-0.5 text-slate-300">
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
          className="absolute bottom-0 right-0 w-4 h-4 bg-cyan-500 cursor-se-resize hover:bg-cyan-400 transition-colors z-50"
          style={{
            clipPath: 'polygon(100% 0, 0 100%, 100% 100%)',
            pointerEvents: 'auto',
          }}
          onMouseDown={handleResizeMouseDown}
          title="拖动调整大小"
        />
      )}
    </div>
  );
};
