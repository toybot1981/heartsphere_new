import React, { useState, useRef, useMemo, useEffect, useCallback } from 'react';
import { UserProfile as UserProfileType, JournalEntry, Character, Mail, WorldScene, GameState } from '../types';
import { constructUserAvatarPrompt } from '../utils/promptConstructors';
import { showAlert } from '../utils/dialog';
import { authApi, wechatApi, userProfileApi } from '../services/api';
import { ShareConfigModal } from './heartconnect/ShareConfigModal';
import { ShareCodeDisplay } from './heartconnect/ShareCodeDisplay';
import { heartConnectApi } from '../services/api/heartconnect';
import type { ShareConfig } from '../services/api/heartconnect/types';
import { mailboxApi } from '../services/api/mailbox';

interface UserProfileProps {
  userProfile: UserProfileType;
  journalEntries: JournalEntry[];
  mailbox: Mail[];
  history: Record<string, any[]>;
  gameState: GameState;
  onOpenSettings: () => void;
  onLogout: () => void;
  onUpdateProfile?: (profile: UserProfileType) => void;
  onNavigateToScene?: (sceneId: string) => void;
  onNavigateToCharacter?: (characterId: string, sceneId: string) => void;
  onNavigateToJournal?: () => void;
  onBack?: () => void; // 返回按钮回调（可选，PC端需要，移动端可能不需要）
}

interface UserStatistics {
  // 心域探索统计
  scenesCount: number;
  charactersCount: number;
  totalMessages: number;
  activeDays: number;
  
  // 内容创作统计
  journalEntriesCount: number;
  customCharactersCount: number;
  customScenesCount: number;
  customScriptsCount: number;
  
  // 社交互动统计
  totalMails: number;
  unreadMails: number;
}

export const UserProfile: React.FC<UserProfileProps> = ({ 
  userProfile, 
  journalEntries, 
  mailbox,
  history,
  gameState,
  onOpenSettings,
  onLogout,
  onUpdateProfile,
  onNavigateToScene,
  onNavigateToCharacter,
  onNavigateToJournal,
  onBack,
}) => {
  const [isEditingNickname, setIsEditingNickname] = useState(false);
  const [editedNickname, setEditedNickname] = useState(userProfile.nickname);
  const [isUpdatingAvatar, setIsUpdatingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    profile: true,
    statistics: false, // 默认折叠，只显示入口
    myContent: false,
  });
  const [showShareConfigModal, setShowShareConfigModal] = useState(false);
  const [showShareDisplay, setShowShareDisplay] = useState(false);
  const [shareConfig, setShareConfig] = useState<ShareConfig | null>(null);
  
  // 微信绑定相关状态
  const [showWechatBindModal, setShowWechatBindModal] = useState(false);
  const [wechatBindQrCodeUrl, setWechatBindQrCodeUrl] = useState<string>('');
  const [wechatBindState, setWechatBindState] = useState<string>('');
  const [wechatBindStatus, setWechatBindStatus] = useState<'waiting' | 'scanned' | 'confirmed' | 'expired' | 'error'>('waiting');
  const [wechatBindPollingInterval, setWechatBindPollingInterval] = useState<NodeJS.Timeout | null>(null);
  
  // 检查用户是否已绑定微信（从userProfile中获取，如果后端返回了wechatOpenid字段）
  const isWechatBound = useMemo(() => {
    // 如果userProfile中有wechatOpenid字段且不为空，说明已绑定
    return userProfile.wechatOpenid != null && userProfile.wechatOpenid !== '';
  }, [userProfile]);

  // 新系统未读数量状态
  const [newSystemUnreadCount, setNewSystemUnreadCount] = useState<number>(0);
  
  // 从新系统获取未读数量
  const loadUnreadCount = useCallback(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      mailboxApi.getUnreadCount(token)
        .then(count => {
          const total = count.totalUnread || count.total || 0;
          setNewSystemUnreadCount(total);
        })
        .catch(err => {
          console.error('[UserProfile] 获取新系统未读数量失败:', err);
          // 失败时使用旧系统数据
          setNewSystemUnreadCount(mailbox.filter(m => !m.isRead).length);
        });
    } else {
      // 未登录时使用旧系统数据
      setNewSystemUnreadCount(mailbox.filter(m => !m.isRead).length);
    }
  }, [mailbox]);

  useEffect(() => {
    loadUnreadCount();
    
    // 监听未读数量更新事件
    const handleUnreadUpdate = () => {
      loadUnreadCount();
    };
    
    window.addEventListener('mailbox:unread-updated', handleUnreadUpdate);
    
    return () => {
      window.removeEventListener('mailbox:unread-updated', handleUnreadUpdate);
    };
  }, [loadUnreadCount]); // 当mailbox变化时也更新

  // 计算统计数据
  const statistics = useMemo<UserStatistics>(() => {
    // 统计访问过的场景
    const sceneIds = new Set(Object.keys(history));
    const userScenes = gameState.userWorldScenes || [];
    const customScenes = gameState.customScenes || [];
    const allScenes = [...userScenes, ...customScenes];
    const scenesCount = allScenes.filter(s => sceneIds.has(s.id) || history[s.id]).length;

    // 统计互动过的角色数
    let charactersCount = 0;
    Object.keys(history).forEach(sceneId => {
      if (history[sceneId] && history[sceneId].length > 0) {
        charactersCount++;
      }
    });

    // 统计总消息数
    const totalMessages = Object.values(history).reduce((sum, messages) => {
      return sum + (messages?.length || 0);
    }, 0);

    // 统计自定义角色
    const customCharactersCount = Object.values(gameState.customCharacters || {}).reduce((sum, chars) => {
      return sum + (chars?.length || 0);
    }, 0);

    // 统计自定义场景
    const customScenesCount = gameState.customScenes?.length || 0;

    // 统计自定义剧本
    const customScriptsCount = gameState.customScenarios?.length || 0;

    // 活跃天数（简化计算：基于注册时间或首次对话时间）
    const firstInteractionTime = Object.values(history).flat().find(m => m?.timestamp)?.timestamp;
    const activeDays = firstInteractionTime 
      ? Math.floor((Date.now() - firstInteractionTime) / (1000 * 60 * 60 * 24)) + 1
      : 1;

    return {
      scenesCount,
      charactersCount,
      totalMessages,
      activeDays,
      journalEntriesCount: journalEntries.length,
      customCharactersCount,
      customScenesCount,
      customScriptsCount,
      totalMails: mailbox.length,
      // 优先使用新系统的未读数量，如果没有则使用旧系统
      unreadMails: newSystemUnreadCount > 0 ? newSystemUnreadCount : mailbox.filter(m => !m.isRead).length,
    };
  }, [history, journalEntries, mailbox, gameState, newSystemUnreadCount]);

  // 获取我的内容列表
  const myContent = useMemo(() => {
    const customScenes = gameState.customScenes || [];
    const allCustomCharacters: Array<{ character: Character; sceneId: string }> = [];
    
    Object.entries(gameState.customCharacters || {}).forEach(([sceneId, characters]) => {
      characters.forEach(char => {
        allCustomCharacters.push({ character: char, sceneId });
      });
    });

    const recentJournalEntries = [...journalEntries]
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 5);

    return {
      customScenes,
      customCharacters: allCustomCharacters,
      recentJournalEntries,
      customScripts: gameState.customScenarios || [],
    };
  }, [gameState, journalEntries]);

  // 处理昵称编辑
  const handleNicknameSave = async () => {
    if (editedNickname.trim() === '') {
      showAlert('昵称不能为空', '错误', 'error');
      return;
    }

    if (editedNickname !== userProfile.nickname && onUpdateProfile) {
      const token = localStorage.getItem('auth_token');
      if (token && !userProfile.isGuest) {
        try {
          // 检查 userProfileApi 是否已定义
          if (!userProfileApi || !userProfileApi.updateNickname) {
            throw new Error('userProfileApi 未正确初始化');
          }
          const updatedUser = await userProfileApi.updateNickname(token, editedNickname.trim());
          onUpdateProfile({ 
            ...userProfile, 
            nickname: updatedUser.nickname,
            wechatOpenid: updatedUser.wechatOpenid
          });
          showAlert('昵称更新成功', '成功', 'success');
        } catch (error: any) {
          console.error('更新昵称失败:', error);
          const errorMessage = error?.message || error?.toString() || '未知错误';
          showAlert(`更新昵称失败: ${errorMessage}`, '错误', 'error');
          setEditedNickname(userProfile.nickname); // 恢复原值
          return;
        }
      } else {
        // 游客模式，只更新本地状态
        onUpdateProfile({ ...userProfile, nickname: editedNickname });
      }
    }
    setIsEditingNickname(false);
  };

  // 处理头像上传
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      showAlert('请选择图片文件', '错误', 'error');
      return;
    }

    // 验证文件大小（限制为5MB）
    if (file.size > 5 * 1024 * 1024) {
      showAlert('图片大小不能超过5MB', '错误', 'error');
      return;
    }

    setIsUpdatingAvatar(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const newAvatarUrl = reader.result as string;
      if (onUpdateProfile) {
        const token = localStorage.getItem('auth_token');
        if (token && !userProfile.isGuest) {
          try {
            // 检查 userProfileApi 是否已定义
            if (!userProfileApi || !userProfileApi.updateAvatar) {
              throw new Error('userProfileApi 未正确初始化');
            }
            // 调用后端API更新头像
            const updatedUser = await userProfileApi.updateAvatar(token, newAvatarUrl);
            onUpdateProfile({ 
              ...userProfile, 
              avatarUrl: updatedUser.avatar,
              wechatOpenid: updatedUser.wechatOpenid
            });
            showAlert('头像更新成功', '成功', 'success');
          } catch (error: any) {
            console.error('更新头像失败:', error);
            const errorMessage = error?.message || error?.toString() || '未知错误';
            showAlert(`更新头像失败: ${errorMessage}`, '错误', 'error');
            setIsUpdatingAvatar(false);
            return;
          }
        } else {
          // 游客模式，只更新本地状态
          onUpdateProfile({ ...userProfile, avatarUrl: newAvatarUrl });
        }
      }
      setIsUpdatingAvatar(false);
    };
    reader.onerror = () => {
      showAlert('读取图片失败', '错误', 'error');
      setIsUpdatingAvatar(false);
    };
    reader.readAsDataURL(file);
  };

  // 复制头像Prompt
  const handleCopyPrompt = async () => {
    const prompt = constructUserAvatarPrompt(userProfile.nickname);
    try {
      await navigator.clipboard.writeText(prompt);
      showAlert('提示词已复制！', '提示', 'success');
    } catch (e) {
      showAlert('复制失败', '错误', 'error');
    }
  };

  // 切换区域展开/折叠
  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // 开始微信绑定流程
  const handleStartWechatBind = async () => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      showAlert('请先登录', '错误', 'error');
      return;
    }

    try {
      const result = await wechatApi.getBindQrCodeUrl(token);
      setWechatBindQrCodeUrl(result.qrCodeUrl);
      setWechatBindState(result.state);
      setWechatBindStatus('waiting');
      setShowWechatBindModal(true);
      
      // 开始轮询绑定状态
      startWechatBindPolling(result.state);
    } catch (error: any) {
      showAlert('获取绑定二维码失败: ' + (error.message || '未知错误'), '错误', 'error');
    }
  };

  // 开始轮询绑定状态
  const startWechatBindPolling = (state: string) => {
    if (wechatBindPollingInterval) {
      clearInterval(wechatBindPollingInterval);
    }

    const interval = setInterval(async () => {
      try {
        const status = await wechatApi.checkStatus(state);
        
        if (status.status === 'confirmed') {
          // 绑定成功
          clearInterval(interval);
          setWechatBindPollingInterval(null);
          setWechatBindStatus('confirmed');
          
          showAlert('微信绑定成功！', '成功', 'success');
          
          // 更新用户信息（如果后端返回了更新后的用户信息）
          if (onUpdateProfile) {
            // 这里可以从后端重新获取用户信息，或者直接标记为已绑定
            const token = localStorage.getItem('auth_token');
            if (token) {
              try {
                const userInfo = await authApi.getCurrentUser(token);
                onUpdateProfile({
                  ...userProfile,
                  ...(userInfo as any),
                });
              } catch (error) {
                console.error('获取用户信息失败:', error);
              }
            }
          }
          
          // 3秒后关闭对话框
          setTimeout(() => {
            setShowWechatBindModal(false);
            setWechatBindQrCodeUrl('');
            setWechatBindState('');
            setWechatBindStatus('waiting');
          }, 3000);
        } else if (status.status === 'scanned') {
          setWechatBindStatus('scanned');
        } else if (status.status === 'expired' || status.status === 'error') {
          clearInterval(interval);
          setWechatBindPollingInterval(null);
          setWechatBindStatus(status.status === 'expired' ? 'expired' : 'error');
          if (status.error) {
            showAlert(status.error, '绑定失败', 'error');
          }
        }
      } catch (error: any) {
        console.error('轮询绑定状态失败:', error);
        clearInterval(interval);
        setWechatBindPollingInterval(null);
        setWechatBindStatus('error');
      }
    }, 2000); // 每2秒轮询一次

    setWechatBindPollingInterval(interval);
  };

  // 清理轮询（组件卸载时）
  useEffect(() => {
    return () => {
      if (wechatBindPollingInterval) {
        clearInterval(wechatBindPollingInterval);
      }
    };
  }, [wechatBindPollingInterval]);

  // 关闭绑定对话框
  const handleCloseWechatBindModal = () => {
    if (wechatBindPollingInterval) {
      clearInterval(wechatBindPollingInterval);
      setWechatBindPollingInterval(null);
    }
    setShowWechatBindModal(false);
    setWechatBindQrCodeUrl('');
    setWechatBindState('');
    setWechatBindStatus('waiting');
  };

  // 统计卡片组件 - 扁平清新风格
  const StatCard: React.FC<{ 
    title: string; 
    value: number | string; 
    icon: string; 
    color: string;
    onClick?: () => void;
  }> = ({ title, value, icon, color, onClick }) => {
    // 将Tailwind颜色类转换为CSS变量（移除fallback值）
    const getColorStyle = (colorClass: string) => {
      const colorMap: Record<string, string> = {
        'text-pink-600': 'var(--color-primary)',
        'text-indigo-600': 'var(--color-primary)',
        'text-emerald-600': 'var(--color-success)',
        'text-blue-600': 'var(--color-info)',
        'text-purple-600': 'var(--color-primary)',
        'text-yellow-600': 'var(--color-warning)',
        'text-cyan-600': 'var(--color-info)',
        'text-green-600': 'var(--color-success)',
        'text-red-600': 'var(--color-error)',
      };
      return colorMap[colorClass] || 'var(--text-primary)';
    };

    return (
      <div 
        className="rounded-lg p-2.5 flex items-center justify-between border transition-colors cursor-pointer"
        style={{
          backgroundColor: 'var(--bg-card, #f9fafb)',
          borderColor: 'var(--border-color-overlay, #e5e7eb)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--bg-hover, #f3f4f6)';
          e.currentTarget.style.borderColor = 'var(--border-color-hover, #d1d5db)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--bg-card, #f9fafb)';
          e.currentTarget.style.borderColor = 'var(--border-color-overlay, #e5e7eb)';
        }}
        onClick={onClick}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {icon && <div className="text-base flex-shrink-0">{icon}</div>}
          <div 
            className="text-xs truncate"
            style={{ color: 'var(--text-secondary, #4b5563)' }}
          >
            {title}
          </div>
        </div>
        <div 
          className="text-base font-semibold flex-shrink-0 ml-1"
          style={{ color: getColorStyle(color) }}
        >
          {value}
        </div>
      </div>
    );
  };

  return (
    <div 
      className="h-full pb-32 overflow-y-auto"
      style={{ backgroundColor: 'var(--bg-card, #f9fafb)' }}
    >
      {/* Header Profile Card */}
      <div 
        className="p-4 pt-[calc(1rem+env(safe-area-inset-top))] border-b"
        style={{
          backgroundColor: 'var(--bg-primary, #ffffff)',
          borderColor: 'var(--border-color-overlay, #e5e7eb)',
        }}
      >
        {/* 返回按钮（在Header内部，避免遮挡头像） */}
        {onBack && (
          <div className="mb-3">
            <button
              onClick={onBack}
              className="p-2 rounded-lg transition-all border"
              style={{
                color: 'var(--text-secondary, #4b5563)',
                backgroundColor: 'var(--bg-card, #f9fafb)',
                borderColor: 'var(--border-color-overlay, #e5e7eb)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--text-primary, #111827)';
                e.currentTarget.style.backgroundColor = 'var(--bg-hover, #f3f4f6)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--text-secondary, #4b5563)';
                e.currentTarget.style.backgroundColor = 'var(--bg-card, #f9fafb)';
              }}
              title="返回"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
            </button>
          </div>
        )}
        
        <div className="flex items-center gap-3 mb-4">
          <div className="relative group" onClick={() => fileInputRef.current?.click()}>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept="image/*" 
              className="hidden" 
            />
            <div 
              className="w-16 h-16 rounded-full border-2 flex items-center justify-center overflow-hidden"
              style={{
                backgroundColor: 'var(--bg-secondary, #e5e7eb)',
                borderColor: 'var(--border-color-overlay, #d1d5db)',
              }}
            >
              {isUpdatingAvatar ? (
                <div 
                  className="animate-spin rounded-full h-8 w-8 border-2 border-t-transparent"
                  style={{
                    borderColor: 'var(--color-primary, #3b82f6)',
                    borderTopColor: 'transparent',
                  }}
                />
              ) : userProfile.avatarUrl ? (
                <UserAvatarImage src={userProfile.avatarUrl} />
              ) : (
                <span 
                  className="text-2xl font-semibold"
                  style={{ color: 'var(--text-secondary, #4b5563)' }}
                >
                  {userProfile.nickname[0]?.toUpperCase()}
                </span>
              )}
            </div>
            <div 
              className="absolute -bottom-1 -right-1 rounded-full p-1.5 border-2 cursor-pointer transition-colors shadow-sm"
              style={{
                backgroundColor: 'var(--bg-primary, #ffffff)',
                borderColor: 'var(--border-color-overlay, #d1d5db)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--bg-card, #f9fafb)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--bg-primary, #ffffff)';
              }}
            >
              <span className="text-xs">📷</span>
            </div>
          </div>
          
          <div className="flex-1">
            {isEditingNickname ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={editedNickname}
                  onChange={(e) => setEditedNickname(e.target.value)}
                  onBlur={handleNicknameSave}
                  onKeyPress={(e) => e.key === 'Enter' && handleNicknameSave()}
                  className="border-2 rounded-lg px-3 py-1 text-base font-semibold focus:outline-none"
                  style={{
                    backgroundColor: 'var(--bg-primary, #ffffff)',
                    borderColor: 'var(--color-primary, #3b82f6)',
                    color: 'var(--text-primary, #111827)',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.outline = '2px solid var(--color-primary, rgba(59, 130, 246, 0.3))';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.outline = 'none';
                    handleNicknameSave();
                  }}
                  autoFocus
                />
                <button
                  onClick={handleNicknameSave}
                  className="text-lg"
                  style={{ color: 'var(--color-success, #16a34a)' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = 'var(--color-success, #15803d)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'var(--color-success, #16a34a)';
                  }}
                >
                  ✓
                </button>
                <button
                  onClick={() => {
                    setEditedNickname(userProfile.nickname);
                    setIsEditingNickname(false);
                  }}
                  className="text-lg"
                  style={{ color: 'var(--color-error, #ef4444)' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = 'var(--color-error, #dc2626)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'var(--color-error, #ef4444)';
                  }}
                >
                  ✕
                </button>
              </div>
            ) : (
              <h2 
                className="text-xl font-semibold cursor-pointer transition-colors"
                style={{ color: 'var(--text-primary, #111827)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'var(--color-primary, #3b82f6)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--text-primary, #111827)';
                }}
                onClick={() => setIsEditingNickname(true)}
              >
                {userProfile.nickname}
              </h2>
            )}
            <p 
              className="text-xs mt-1"
              style={{ color: 'var(--text-disabled, #6b7280)' }}
            >
              {userProfile.isGuest ? '访客身份 (未绑定)' : '已连接至心域网络'}
            </p>
            {userProfile.phoneNumber && (
              <p 
                className="text-xs mt-0.5"
                style={{ color: 'var(--text-tertiary, #9ca3af)' }}
              >
                {userProfile.phoneNumber}
              </p>
            )}
            <div className="flex gap-2 mt-2">
              {userProfile.isGuest && (
                <button 
                  onClick={onOpenSettings} 
                  className="text-xs px-2.5 py-1 rounded-lg border transition-colors"
                  style={{
                    backgroundColor: 'var(--color-primary, rgba(236, 72, 153, 0.1))',
                    color: 'var(--color-primary, #ec4899)',
                    borderColor: 'var(--color-primary, rgba(236, 72, 153, 0.2))',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--color-primary, rgba(236, 72, 153, 0.15))';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--color-primary, rgba(236, 72, 153, 0.1))';
                  }}
                >
                  绑定账号
                </button>
              )}
              <button 
                onClick={handleCopyPrompt} 
                className="text-xs px-2.5 py-1 rounded-lg border transition-colors"
                style={{
                  backgroundColor: 'var(--color-info, rgba(59, 130, 246, 0.1))',
                  color: 'var(--color-info, #3b82f6)',
                  borderColor: 'var(--color-info, rgba(59, 130, 246, 0.2))',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--color-info, rgba(59, 130, 246, 0.15))';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--color-info, rgba(59, 130, 246, 0.1))';
                }}
              >
                复制头像 Prompt
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid - 扁平清新风格 */}
        <div className="grid grid-cols-3 gap-2 mt-3">
          <StatCard 
            title="日记碎片" 
            value={statistics.journalEntriesCount} 
            icon="📔"
            color="text-pink-600"
            onClick={onNavigateToJournal}
          />
          <StatCard 
            title="遇见灵魂" 
            value={statistics.charactersCount} 
            icon="👥"
            color="text-indigo-600"
          />
          <StatCard 
            title="时光信件" 
            value={statistics.totalMails} 
            icon={statistics.unreadMails > 0 ? '📬' : '📭'}
            color="text-emerald-600"
          />
        </div>
      </div>

        {/* 详细统计区域 - 扁平清新风格 */}
        <div className="p-4">
          <div 
            className="rounded-lg border mb-3 cursor-pointer transition-colors"
            style={{
              backgroundColor: 'var(--bg-primary, #ffffff)',
              borderColor: 'var(--border-color-overlay, #e5e7eb)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-color-hover, #d1d5db)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-color-overlay, #e5e7eb)';
            }}
            onClick={() => toggleSection('statistics')}
          >
            <div className="p-3 flex items-center justify-between">
              <h3 
                className="text-sm font-semibold"
                style={{ color: 'var(--text-primary, #111827)' }}
              >
                📊 数据统计
              </h3>
              <span 
                className="text-sm"
                style={{ color: 'var(--text-tertiary, #9ca3af)' }}
              >
                {expandedSections.statistics ? '▼' : '▶'}
              </span>
            </div>
          
          {expandedSections.statistics && (
            <div className="p-3 pt-0 space-y-3">
              {/* 心域探索统计 */}
              <div>
                <h4 
                  className="text-xs font-semibold uppercase tracking-wider mb-2"
                  style={{ color: 'var(--text-secondary, #4b5563)' }}
                >
                  心域探索
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  <StatCard title="访问场景" value={statistics.scenesCount} icon="🌍" color="text-blue-600" />
                  <StatCard title="对话轮数" value={statistics.totalMessages} icon="💬" color="text-purple-600" />
                  <StatCard title="活跃天数" value={statistics.activeDays} icon="📅" color="text-yellow-600" />
                  <StatCard title="互动角色" value={statistics.charactersCount} icon="👤" color="text-pink-600" />
                </div>
              </div>

              {/* 内容创作统计 */}
              <div>
                <h4 
                  className="text-xs font-semibold uppercase tracking-wider mb-2"
                  style={{ color: 'var(--text-secondary, #4b5563)' }}
                >
                  内容创作
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  <StatCard title="自定义角色" value={statistics.customCharactersCount} icon="🎭" color="text-indigo-600" />
                  <StatCard title="自定义场景" value={statistics.customScenesCount} icon="🎬" color="text-cyan-600" />
                  <StatCard title="剧本创作" value={statistics.customScriptsCount} icon="📝" color="text-green-600" />
                  <StatCard title="日记条目" value={statistics.journalEntriesCount} icon="📔" color="text-pink-600" />
                </div>
              </div>

              {/* 社交互动统计 */}
              <div>
                <h4 
                  className="text-xs font-semibold uppercase tracking-wider mb-2"
                  style={{ color: 'var(--text-secondary, #4b5563)' }}
                >
                  社交互动
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  <div className="relative">
                    <StatCard title="时光信件" value={statistics.totalMails} icon="📭" color="text-emerald-600" />
                    {statistics.unreadMails > 0 && (
                      <span 
                        className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: 'var(--color-error, #ef4444)' }}
                      />
                    )}
                  </div>
                  <StatCard title="未读信件" value={statistics.unreadMails} icon="📬" color="text-red-600" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 我的内容区域 */}
        <div 
          className="rounded-lg border mb-3 cursor-pointer transition-colors"
          style={{
            backgroundColor: 'var(--bg-primary, #ffffff)',
            borderColor: 'var(--border-color-overlay, #e5e7eb)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--border-color-hover, #d1d5db)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--border-color-overlay, #e5e7eb)';
          }}
          onClick={() => toggleSection('myContent')}
        >
          <div className="p-3 flex items-center justify-between">
            <h3 
              className="text-sm font-semibold"
              style={{ color: 'var(--text-primary, #111827)' }}
            >
              📚 我的内容
            </h3>
            <span 
              className="text-sm"
              style={{ color: 'var(--text-tertiary, #9ca3af)' }}
            >
              {expandedSections.myContent ? '▼' : '▶'}
            </span>
          </div>
          
          {expandedSections.myContent && (
            <div 
              className="p-3 pt-0 space-y-3 border-t"
              style={{ borderColor: 'var(--border-color-overlay, #e5e7eb)' }}
            >
              {/* 我的场景 */}
              {myContent.customScenes.length > 0 && (
                <div>
                  <h4 
                    className="text-xs font-semibold uppercase tracking-wider mb-2"
                    style={{ color: 'var(--text-secondary, #4b5563)' }}
                  >
                    我的场景 ({myContent.customScenes.length})
                  </h4>
                  <div className="space-y-2">
                    {myContent.customScenes.slice(0, 5).map(scene => (
                      <div
                        key={scene.id}
                        className="rounded-lg p-3 border flex items-center justify-between transition-colors cursor-pointer"
                        style={{
                          backgroundColor: 'var(--bg-card, #f9fafb)',
                          borderColor: 'var(--border-color-overlay, #e5e7eb)',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--bg-hover, #f3f4f6)';
                          e.currentTarget.style.borderColor = 'var(--border-color-hover, #d1d5db)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--bg-card, #f9fafb)';
                          e.currentTarget.style.borderColor = 'var(--border-color-overlay, #e5e7eb)';
                        }}
                        onClick={() => onNavigateToScene?.(scene.id)}
                      >
                        <div className="flex items-center gap-3">
                          {scene.imageUrl && (
                            <img src={scene.imageUrl} alt={scene.name} className="w-10 h-10 rounded-lg object-cover" />
                          )}
                          <div>
                            <p 
                              className="text-sm font-medium"
                              style={{ color: 'var(--text-primary, #111827)' }}
                            >
                              {scene.name}
                            </p>
                            <p 
                              className="text-xs"
                              style={{ color: 'var(--text-disabled, #6b7280)' }}
                            >
                              {scene.description?.slice(0, 30)}...
                            </p>
                          </div>
                        </div>
                        <span style={{ color: 'var(--text-secondary, #4b5563)' }}>→</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 我的角色 */}
              {myContent.customCharacters.length > 0 && (
                <div>
                  <h4 
                    className="text-xs font-semibold uppercase tracking-wider mb-2"
                    style={{ color: 'var(--text-secondary, #4b5563)' }}
                  >
                    我的角色 ({myContent.customCharacters.length})
                  </h4>
                  <div className="space-y-2">
                    {myContent.customCharacters.slice(0, 5).map(({ character, sceneId }) => (
                      <div
                        key={character.id}
                        className="rounded-lg p-3 border flex items-center justify-between transition-colors cursor-pointer"
                        style={{
                          backgroundColor: 'var(--bg-card, #f9fafb)',
                          borderColor: 'var(--border-color-overlay, #e5e7eb)',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--bg-hover, #f3f4f6)';
                          e.currentTarget.style.borderColor = 'var(--border-color-hover, #d1d5db)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--bg-card, #f9fafb)';
                          e.currentTarget.style.borderColor = 'var(--border-color-overlay, #e5e7eb)';
                        }}
                        onClick={() => onNavigateToCharacter?.(character.id, sceneId)}
                      >
                        <div className="flex items-center gap-3">
                          {character.avatarUrl && (
                            <CharacterAvatarSmallImage src={character.avatarUrl} alt={character.name} className="w-10 h-10 rounded-full object-cover" />
                          )}
                          <div>
                            <p 
                              className="text-sm font-medium"
                              style={{ color: 'var(--text-primary, #111827)' }}
                            >
                              {character.name}
                            </p>
                            <p 
                              className="text-xs"
                              style={{ color: 'var(--text-disabled, #6b7280)' }}
                            >
                              {character.bio?.slice(0, 30)}...
                            </p>
                          </div>
                        </div>
                        <span style={{ color: 'var(--text-tertiary, #9ca3af)' }}>→</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 最近日记 */}
              {myContent.recentJournalEntries.length > 0 && (
                <div>
                  <h4 
                    className="text-xs font-semibold uppercase tracking-wider mb-2"
                    style={{ color: 'var(--text-secondary, #4b5563)' }}
                  >
                    最近日记
                  </h4>
                  <div className="space-y-2">
                    {myContent.recentJournalEntries.map(entry => (
                      <div
                        key={entry.id}
                        className="rounded-lg p-3 border transition-colors cursor-pointer"
                        style={{
                          backgroundColor: 'var(--bg-card, #f9fafb)',
                          borderColor: 'var(--border-color-overlay, #e5e7eb)',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--bg-hover, #f3f4f6)';
                          e.currentTarget.style.borderColor = 'var(--border-color-hover, #d1d5db)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--bg-card, #f9fafb)';
                          e.currentTarget.style.borderColor = 'var(--border-color-overlay, #e5e7eb)';
                        }}
                        onClick={onNavigateToJournal}
                      >
                        <p 
                          className="text-sm font-medium"
                          style={{ color: 'var(--text-primary, #111827)' }}
                        >
                          {entry.title}
                        </p>
                        <p 
                          className="text-xs mt-1"
                          style={{ color: 'var(--text-disabled, #6b7280)' }}
                        >
                          {new Date(entry.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 心域共享区域 */}
        <div className="mb-4">
          <button
            onClick={() => setShowShareConfigModal(true)}
            className="w-full font-semibold py-4 px-4 rounded-lg flex flex-col items-center justify-center gap-2 border-2 transition-all"
            style={{
              backgroundColor: 'var(--color-info, rgba(59, 130, 246, 0.1))',
              color: 'var(--color-info, #1d4ed8)',
              borderColor: 'var(--color-info, rgba(59, 130, 246, 0.2))',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-info, rgba(59, 130, 246, 0.15))';
              e.currentTarget.style.borderColor = 'var(--color-info, rgba(59, 130, 246, 0.3))';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-info, rgba(59, 130, 246, 0.1))';
              e.currentTarget.style.borderColor = 'var(--color-info, rgba(59, 130, 246, 0.2))';
            }}
          >
            <span className="text-2xl">🔗</span>
            <span className="text-sm">心域共享</span>
            <span 
              className="text-xs"
              style={{ color: 'var(--color-info, #3b82f6)' }}
            >
              分享你的心域
            </span>
          </button>
        </div>
        
        {/* 共享配置模态框 */}
        <ShareConfigModal
          isOpen={showShareConfigModal}
          onClose={() => setShowShareConfigModal(false)}
          onSuccess={() => {
            setShowShareConfigModal(false);
          }}
        />

        {/* 快捷操作 */}
        <div className="space-y-2">
          <h3 
            className="text-xs font-semibold uppercase tracking-wider px-1 mb-2"
            style={{ color: 'var(--text-secondary, #4b5563)' }}
          >
            系统选项
          </h3>
          
          <button 
            onClick={onOpenSettings} 
            className="w-full border-2 p-3 rounded-lg flex items-center justify-between group transition-all"
            style={{
              backgroundColor: 'var(--bg-primary, #ffffff)',
              borderColor: 'var(--border-color-overlay, #e5e7eb)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-color-hover, #d1d5db)';
              e.currentTarget.style.backgroundColor = 'var(--bg-card, #f9fafb)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-color-overlay, #e5e7eb)';
              e.currentTarget.style.backgroundColor = 'var(--bg-primary, #ffffff)';
            }}
          >
            <div className="flex items-center gap-3">
              <span 
                className="p-1.5 rounded-lg text-sm transition-colors"
                style={{
                  backgroundColor: 'var(--color-primary, rgba(99, 102, 241, 0.1))',
                  color: 'var(--color-primary, #6366f1)',
                }}
              >
                ⚙️
              </span>
              <span 
                className="font-medium text-sm"
                style={{ color: 'var(--text-primary, #111827)' }}
              >
                设置与模型配置
              </span>
            </div>
            <span style={{ color: 'var(--text-tertiary, #9ca3af)' }}>→</span>
          </button>
        </div>

        {/* 退出登录 */}
        <div className="pt-4">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onLogout();
            }} 
            className="w-full py-3 font-semibold text-sm rounded-lg border-2 transition-all cursor-pointer"
            style={{
              color: 'var(--color-error, #dc2626)',
              backgroundColor: 'var(--color-error, rgba(239, 68, 68, 0.1))',
              borderColor: 'var(--color-error, rgba(239, 68, 68, 0.2))',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-error, rgba(239, 68, 68, 0.15))';
              e.currentTarget.style.borderColor = 'var(--color-error, rgba(239, 68, 68, 0.3))';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-error, rgba(239, 68, 68, 0.1))';
              e.currentTarget.style.borderColor = 'var(--color-error, rgba(239, 68, 68, 0.2))';
            }}
          >
            退出登录
          </button>
          <p 
            className="text-center text-xs mt-3"
            style={{ color: 'var(--text-tertiary, #9ca3af)' }}
          >
            HeartSphere v1.0.3
          </p>
        </div>
      </div>

      {/* 微信绑定对话框 */}
      {showWechatBindModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm p-4"
          style={{
            backgroundColor: 'var(--bg-modal-backdrop, rgba(0, 0, 0, 0.8))',
          }}
        >
          <div 
            className="rounded-2xl border p-6 max-w-sm w-full shadow-2xl"
            style={{
              backgroundColor: 'var(--bg-secondary, #1f2937)',
              borderColor: 'var(--border-color-overlay, #374151)',
            }}
          >
            <h3 
              className="text-xl font-bold mb-4"
              style={{ color: 'var(--text-primary)' }}
            >
              绑定微信账号
            </h3>
            
            {wechatBindStatus === 'waiting' && (
              <>
                <p 
                  className="text-sm mb-4"
                  style={{ color: 'var(--text-tertiary)' }}
                >
                  请使用微信扫码绑定
                </p>
                <div className="flex justify-center mb-4">
                  {wechatBindQrCodeUrl && (
                    <img src={wechatBindQrCodeUrl} alt="微信绑定二维码" className="w-64 h-64" />
                  )}
                </div>
                <p 
                  className="text-xs text-center"
                  style={{ color: 'var(--text-disabled)' }}
                >
                  等待扫码...
                </p>
              </>
            )}
            
            {wechatBindStatus === 'scanned' && (
              <>
                <div className="flex justify-center mb-4">
                  <div 
                    className="w-64 h-64 flex items-center justify-center rounded-lg"
                    style={{ backgroundColor: 'var(--bg-overlay, rgba(31, 41, 55, 1))' }}
                  >
                    <div className="text-center">
                      <div 
                        className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4"
                        style={{
                          borderColor: 'var(--color-success, #4ade80)',
                        }}
                      />
                      <p 
                        className="font-medium"
                        style={{ color: 'var(--color-success, #4ade80)' }}
                      >
                        已扫码，等待确认...
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}
            
            {wechatBindStatus === 'confirmed' && (
              <>
                <div className="flex justify-center mb-4">
                  <div 
                    className="w-64 h-64 flex items-center justify-center rounded-lg"
                    style={{ backgroundColor: 'var(--bg-overlay, rgba(31, 41, 55, 1))' }}
                  >
                    <div className="text-center">
                      <div className="text-6xl mb-4">✓</div>
                      <p 
                        className="font-medium text-lg"
                        style={{ color: 'var(--color-success, #4ade80)' }}
                      >
                        绑定成功！
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}
            
            {wechatBindStatus === 'expired' && (
              <>
                <div className="flex justify-center mb-4">
                  <div 
                    className="w-64 h-64 flex items-center justify-center rounded-lg"
                    style={{ backgroundColor: 'var(--bg-overlay, rgba(31, 41, 55, 1))' }}
                  >
                    <div className="text-center">
                      <p 
                        className="font-medium mb-4"
                        style={{ color: 'var(--color-error, #f87171)' }}
                      >
                        二维码已过期
                      </p>
                      <button
                        onClick={handleStartWechatBind}
                        className="px-4 py-2 rounded-lg transition-colors"
                        style={{
                          backgroundColor: 'var(--color-success, #16a34a)',
                          color: 'var(--text-primary)',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--color-success, #15803d)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--color-success, #16a34a)';
                        }}
                      >
                        重新生成
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
            
            {wechatBindStatus === 'error' && (
              <>
                <div className="flex justify-center mb-4">
                  <div 
                    className="w-64 h-64 flex items-center justify-center rounded-lg"
                    style={{ backgroundColor: 'var(--bg-overlay, rgba(31, 41, 55, 1))' }}
                  >
                    <div className="text-center">
                      <p 
                        className="font-medium mb-4"
                        style={{ color: 'var(--color-error, #f87171)' }}
                      >
                        绑定失败
                      </p>
                      <button
                        onClick={handleStartWechatBind}
                        className="px-4 py-2 rounded-lg transition-colors"
                        style={{
                          backgroundColor: 'var(--color-success, #16a34a)',
                          color: 'var(--text-primary)',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--color-success, #15803d)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--color-success, #16a34a)';
                        }}
                      >
                        重试
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleCloseWechatBindModal}
                className="flex-1 py-2.5 rounded-lg font-bold transition-colors"
                style={{
                  backgroundColor: 'var(--bg-overlay, rgba(55, 65, 81, 1))',
                  color: 'var(--text-primary)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--bg-hover, rgba(75, 85, 99, 1))';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--bg-overlay, rgba(55, 65, 81, 1))';
                }}
              >
                {wechatBindStatus === 'confirmed' ? '关闭' : '取消'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * 用户头像图片组件（使用缩略图）
 */
const UserAvatarImage: React.FC<{ src: string }> = ({ src }) => {
    const imageVariants: ImageVariants | undefined = React.useMemo(() => {
        if (!src || !src.trim()) return undefined;
        
        return {
            original: src,
            thumbnail: generateVariantUrl(src, 200, 200),
            medium: generateVariantUrl(src, 800, 600),
            highQuality: generateVariantUrl(src, 1920, 1080),
        };
    }, [src]);

    return (
        <LazyImage
            src={src}
            alt="Avatar"
            className="w-full h-full object-cover"
            variants={imageVariants}
            purpose="thumbnail"
        />
    );
};

/**
 * 角色头像小图组件（使用缩略图）
 */
const CharacterAvatarSmallImage: React.FC<{ src: string; alt: string; className?: string }> = ({ src, alt, className }) => {
    const imageVariants: ImageVariants | undefined = React.useMemo(() => {
        if (!src || !src.trim()) return undefined;
        
        return {
            original: src,
            thumbnail: generateVariantUrl(src, 200, 200),
            medium: generateVariantUrl(src, 800, 600),
            highQuality: generateVariantUrl(src, 1920, 1080),
        };
    }, [src]);

    return (
        <LazyImage
            src={src}
            alt={alt}
            className={className || ''}
            variants={imageVariants}
            purpose="thumbnail"
        />
    );
};