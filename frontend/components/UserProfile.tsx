import React, { useState, useRef, useMemo, useEffect } from 'react';
import { UserProfile as UserProfileType, JournalEntry, Character, Mail, WorldScene, GameState } from '../types';
import { constructUserAvatarPrompt } from '../utils/promptConstructors';
import { showAlert } from '../utils/dialog';
import { authApi, wechatApi, userProfileApi } from '../services/api';
import { ShareButton } from './heartconnect/ShareButton';
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
    share: false, // 心域共享区域，默认折叠
  });
  
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
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      mailboxApi.getUnreadCount(token)
        .then(count => {
          const total = count.totalUnread || count.total || 0;
          setNewSystemUnreadCount(total);
          console.log('[UserProfile] 新系统未读数量:', total);
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
  }, [mailbox]); // 当mailbox变化时也更新

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

  // 统计卡片组件 - Compact (水平布局)
  const StatCard: React.FC<{ 
    title: string; 
    value: number | string; 
    icon: string; 
    color: string;
    onClick?: () => void;
  }> = ({ title, value, icon, color, onClick }) => (
    <div 
      className={`bg-white/5 rounded-lg p-2 flex items-center justify-between border border-white/5 hover:bg-white/10 transition-all cursor-pointer ${onClick ? 'hover:scale-105' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center gap-1.5 flex-1 min-w-0">
        {icon && <div className="text-base flex-shrink-0">{icon}</div>}
        <div className="text-[9px] text-gray-400 truncate">{title}</div>
      </div>
      <div className={`text-base font-bold ${color} flex-shrink-0 ml-1`}>{value}</div>
    </div>
  );

  return (
    <div className="h-full bg-black pb-32 overflow-y-auto">
      {/* 返回按钮（PC端显示） */}
      {onBack && (
        <div className="fixed top-6 left-6 z-20">
          <button
            onClick={onBack}
            className="p-3 text-slate-400 hover:text-white bg-slate-900/30 hover:bg-slate-800/50 rounded-full transition-all backdrop-blur-sm hover:scale-105"
            title="返回"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
          </button>
        </div>
      )}
      
      {/* Header Profile Card */}
      <div className="p-3 pt-[calc(0.75rem+env(safe-area-inset-top))] bg-gradient-to-br from-gray-900 via-gray-900 to-indigo-900/40 rounded-b-xl shadow-2xl border-b border-white/5">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="relative group" onClick={() => fileInputRef.current?.click()}>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept="image/*" 
              className="hidden" 
            />
            <div className="w-14 h-14 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 p-[2px]">
              <div className="w-full h-full rounded-full bg-black flex items-center justify-center overflow-hidden">
                {isUpdatingAvatar ? (
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                ) : userProfile.avatarUrl ? (
                  <img src={userProfile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl font-bold text-white">{userProfile.nickname[0]?.toUpperCase()}</span>
                )}
              </div>
            </div>
            <div className="absolute -bottom-1 -right-1 bg-gray-800 rounded-full p-1.5 border border-white/10 shadow-lg cursor-pointer hover:bg-gray-700 transition-colors">
              <span className="text-xs">📷</span>
            </div>
          </div>
          
          <div className="flex-1">
            {isEditingNickname ? (
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={editedNickname}
                  onChange={(e) => setEditedNickname(e.target.value)}
                  onBlur={handleNicknameSave}
                  onKeyPress={(e) => e.key === 'Enter' && handleNicknameSave()}
                  className="bg-gray-800 border border-pink-500 rounded px-2.5 py-0.5 text-base font-bold text-white focus:outline-none"
                  autoFocus
                />
                <button
                  onClick={handleNicknameSave}
                  className="text-green-400 hover:text-green-300"
                >
                  ✓
                </button>
                <button
                  onClick={() => {
                    setEditedNickname(userProfile.nickname);
                    setIsEditingNickname(false);
                  }}
                  className="text-red-400 hover:text-red-300"
                >
                  ✕
                </button>
              </div>
            ) : (
              <h2 
                className="text-lg font-bold text-white cursor-pointer hover:text-pink-400 transition-colors"
                onClick={() => setIsEditingNickname(true)}
              >
                {userProfile.nickname}
              </h2>
            )}
            <p className="text-[10px] text-gray-400 mt-0.5">
              {userProfile.isGuest ? '访客身份 (未绑定)' : '已连接至心域网络'}
            </p>
            {userProfile.phoneNumber && (
              <p className="text-[10px] text-gray-500 mt-0.5">{userProfile.phoneNumber}</p>
            )}
            <div className="flex gap-1 mt-1">
              {userProfile.isGuest && (
                <button 
                  onClick={onOpenSettings} 
                  className="text-[9px] bg-pink-600/20 text-pink-400 px-1.5 py-0.5 rounded-full border border-pink-600/30 hover:bg-pink-600/30 transition-colors"
                >
                  绑定账号
                </button>
              )}
              <button 
                onClick={handleCopyPrompt} 
                className="text-[9px] bg-indigo-600/20 text-indigo-400 px-1.5 py-0.5 rounded-full border border-indigo-600/30 hover:bg-indigo-600/30 transition-colors"
              >
                复制头像 Prompt
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid - Compact */}
        <div className="grid grid-cols-3 gap-1.5 mt-2">
          <StatCard 
            title="日记碎片" 
            value={statistics.journalEntriesCount} 
            icon="📔"
            color="text-pink-400"
            onClick={onNavigateToJournal}
          />
          <StatCard 
            title="遇见灵魂" 
            value={statistics.charactersCount} 
            icon="👥"
            color="text-indigo-400"
          />
          <StatCard 
            title="时光信件" 
            value={statistics.totalMails} 
            icon={statistics.unreadMails > 0 ? '📬' : '📭'}
            color="text-emerald-400"
          />
        </div>
      </div>

      {/* 详细统计区域 - Compact */}
      <div className="p-3">
        <div 
          className="bg-gray-900/50 rounded-lg border border-gray-800 mb-2 cursor-pointer"
          onClick={() => toggleSection('statistics')}
        >
          <div className="p-2 flex items-center justify-between">
            <h3 className="text-xs font-bold text-white">📊 数据统计</h3>
            <span className="text-gray-500 text-xs">{expandedSections.statistics ? '▼' : '▶'}</span>
          </div>
          
          {expandedSections.statistics && (
            <div className="p-2 pt-0 space-y-2">
              {/* 心域探索统计 */}
              <div>
                <h4 className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">心域探索</h4>
                <div className="grid grid-cols-2 gap-1.5">
                  <StatCard title="访问场景" value={statistics.scenesCount} icon="🌍" color="text-blue-400" />
                  <StatCard title="对话轮数" value={statistics.totalMessages} icon="💬" color="text-purple-400" />
                  <StatCard title="活跃天数" value={statistics.activeDays} icon="📅" color="text-yellow-400" />
                  <StatCard title="互动角色" value={statistics.charactersCount} icon="👤" color="text-pink-400" />
                </div>
              </div>

              {/* 内容创作统计 */}
              <div>
                <h4 className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">内容创作</h4>
                <div className="grid grid-cols-2 gap-1.5">
                  <StatCard title="自定义角色" value={statistics.customCharactersCount} icon="🎭" color="text-indigo-400" />
                  <StatCard title="自定义场景" value={statistics.customScenesCount} icon="🎬" color="text-cyan-400" />
                  <StatCard title="剧本创作" value={statistics.customScriptsCount} icon="📝" color="text-green-400" />
                  <StatCard title="日记条目" value={statistics.journalEntriesCount} icon="📔" color="text-pink-400" />
                </div>
              </div>

              {/* 社交互动统计 */}
              <div>
                <h4 className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">社交互动</h4>
                <div className="grid grid-cols-2 gap-1.5">
                  <div className="relative">
                    <StatCard title="时光信件" value={statistics.totalMails} icon="📭" color="text-emerald-400" />
                    {statistics.unreadMails > 0 && (
                      <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"></span>
                    )}
                  </div>
                  <StatCard title="未读信件" value={statistics.unreadMails} icon="📬" color="text-red-400" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 我的内容区域 */}
        <div 
          className="bg-gray-900/50 rounded-xl border border-gray-800 mb-3 cursor-pointer"
          onClick={() => toggleSection('myContent')}
        >
          <div className="p-3 flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">📚 我的内容</h3>
            <span className="text-gray-500">{expandedSections.myContent ? '▼' : '▶'}</span>
          </div>
          
          {expandedSections.myContent && (
            <div className="p-3 pt-0 space-y-3">
              {/* 我的场景 */}
              {myContent.customScenes.length > 0 && (
                <div>
                  <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">我的场景 ({myContent.customScenes.length})</h4>
                  <div className="space-y-1.5">
                    {myContent.customScenes.slice(0, 5).map(scene => (
                      <div
                        key={scene.id}
                        className="bg-gray-800/50 rounded-lg p-2.5 flex items-center justify-between hover:bg-gray-800 transition-colors cursor-pointer"
                        onClick={() => onNavigateToScene?.(scene.id)}
                      >
                        <div className="flex items-center gap-2.5">
                          {scene.imageUrl && (
                            <img src={scene.imageUrl} alt={scene.name} className="w-9 h-9 rounded-lg object-cover" />
                          )}
                          <div>
                            <p className="text-sm font-medium text-white">{scene.name}</p>
                            <p className="text-xs text-gray-400">{scene.description?.slice(0, 30)}...</p>
                          </div>
                        </div>
                        <span className="text-gray-600">→</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 我的角色 */}
              {myContent.customCharacters.length > 0 && (
                <div>
                  <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">我的角色 ({myContent.customCharacters.length})</h4>
                  <div className="space-y-1.5">
                    {myContent.customCharacters.slice(0, 5).map(({ character, sceneId }) => (
                      <div
                        key={character.id}
                        className="bg-gray-800/50 rounded-lg p-2.5 flex items-center justify-between hover:bg-gray-800 transition-colors cursor-pointer"
                        onClick={() => onNavigateToCharacter?.(character.id, sceneId)}
                      >
                        <div className="flex items-center gap-2.5">
                          {character.avatarUrl && (
                            <img src={character.avatarUrl} alt={character.name} className="w-9 h-9 rounded-full object-cover" />
                          )}
                          <div>
                            <p className="text-sm font-medium text-white">{character.name}</p>
                            <p className="text-xs text-gray-400">{character.bio?.slice(0, 30)}...</p>
                          </div>
                        </div>
                        <span className="text-gray-600">→</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 最近日记 */}
              {myContent.recentJournalEntries.length > 0 && (
                <div>
                  <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">最近日记</h4>
                  <div className="space-y-1.5">
                    {myContent.recentJournalEntries.map(entry => (
                      <div
                        key={entry.id}
                        className="bg-gray-800/50 rounded-lg p-2.5 hover:bg-gray-800 transition-colors cursor-pointer"
                        onClick={onNavigateToJournal}
                      >
                        <p className="text-sm font-medium text-white">{entry.title}</p>
                        <p className="text-xs text-gray-400 mt-1">{new Date(entry.timestamp).toLocaleDateString()}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 心域共享区域 */}
        <div 
          className="bg-gray-900/50 rounded-xl border border-gray-800 mb-3"
        >
          <div 
            className="p-3 flex items-center justify-between cursor-pointer"
            onClick={() => toggleSection('share')}
          >
            <h3 className="text-sm font-bold text-white">🔗 心域共享</h3>
            <span className="text-gray-500">{expandedSections.share ? '▼' : '▶'}</span>
          </div>
          
          {expandedSections.share && (
            <div className="p-3 pt-0" onClick={(e) => e.stopPropagation()}>
              <p className="text-xs text-gray-400 mb-3">
                分享你的心域，让其他人可以体验你的世界和场景
              </p>
              <ShareButton variant="button" className="w-full" />
            </div>
          )}
        </div>

        {/* 快捷操作 */}
        <div className="space-y-1.5">
          <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-1 mb-2">系统选项</h3>
          
          <button 
            onClick={onOpenSettings} 
            className="w-full bg-gray-900 border border-gray-800 p-3 rounded-xl flex items-center justify-between group hover:bg-gray-800 active:scale-95 transition-all"
          >
            <div className="flex items-center gap-2.5">
              <span className="p-1.5 bg-indigo-500/10 rounded-lg text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-colors text-sm">⚙️</span>
              <span className="text-gray-200 font-medium text-sm">设置与模型配置</span>
            </div>
            <span className="text-gray-600">→</span>
          </button>
        </div>

        {/* 退出登录 */}
        <div className="pt-4">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onLogout();
            }} 
            className="w-full py-3 text-red-500/80 font-bold text-sm bg-red-900/10 rounded-xl border border-red-900/20 hover:bg-red-900/20 hover:text-red-400 active:scale-95 transition-all cursor-pointer"
          >
            退出登录
          </button>
          <p className="text-center text-[10px] text-gray-700 mt-3">
            HeartSphere v1.0.3
          </p>
        </div>
      </div>

      {/* 微信绑定对话框 */}
      {showWechatBindModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-gray-900 rounded-2xl border border-gray-700 p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-4">绑定微信账号</h3>
            
            {wechatBindStatus === 'waiting' && (
              <>
                <p className="text-sm text-gray-400 mb-4">请使用微信扫码绑定</p>
                <div className="flex justify-center mb-4">
                  {wechatBindQrCodeUrl && (
                    <img src={wechatBindQrCodeUrl} alt="微信绑定二维码" className="w-64 h-64" />
                  )}
                </div>
                <p className="text-xs text-gray-500 text-center">等待扫码...</p>
              </>
            )}
            
            {wechatBindStatus === 'scanned' && (
              <>
                <div className="flex justify-center mb-4">
                  <div className="w-64 h-64 flex items-center justify-center bg-gray-800 rounded-lg">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400 mx-auto mb-4"></div>
                      <p className="text-green-400 font-medium">已扫码，等待确认...</p>
                    </div>
                  </div>
                </div>
              </>
            )}
            
            {wechatBindStatus === 'confirmed' && (
              <>
                <div className="flex justify-center mb-4">
                  <div className="w-64 h-64 flex items-center justify-center bg-gray-800 rounded-lg">
                    <div className="text-center">
                      <div className="text-6xl mb-4">✓</div>
                      <p className="text-green-400 font-medium text-lg">绑定成功！</p>
                    </div>
                  </div>
                </div>
              </>
            )}
            
            {wechatBindStatus === 'expired' && (
              <>
                <div className="flex justify-center mb-4">
                  <div className="w-64 h-64 flex items-center justify-center bg-gray-800 rounded-lg">
                    <div className="text-center">
                      <p className="text-red-400 font-medium mb-4">二维码已过期</p>
                      <button
                        onClick={handleStartWechatBind}
                        className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg transition-colors"
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
                  <div className="w-64 h-64 flex items-center justify-center bg-gray-800 rounded-lg">
                    <div className="text-center">
                      <p className="text-red-400 font-medium mb-4">绑定失败</p>
                      <button
                        onClick={handleStartWechatBind}
                        className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg transition-colors"
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
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2.5 rounded-lg font-bold transition-colors"
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

