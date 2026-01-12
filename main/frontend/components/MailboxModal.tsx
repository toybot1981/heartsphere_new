
import React, { useState, useEffect } from 'react';
import { Mail } from '../types';
import { Button } from './Button';
import { chronosLetterApi } from '../services/api';
import { useGameState } from '../contexts/GameStateContext';

interface MailboxModalProps {
  mails: Mail[];
  onClose: () => void;
  onMarkAsRead: (mailId: string) => void;
  onMailAdded?: (mail: Mail) => void;
}

export const MailboxModal: React.FC<MailboxModalProps> = ({ mails, onClose, onMarkAsRead, onMailAdded }) => {
  const { state: gameState } = useGameState();
  const [selectedMail, setSelectedMail] = useState<Mail | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const [showCompose, setShowCompose] = useState(false);
  const [composeSubject, setComposeSubject] = useState('');
  const [composeContent, setComposeContent] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [mailReplies, setMailReplies] = useState<Map<string, Mail[]>>(new Map());

  const handleOpenMail = (mail: Mail) => {
    setSelectedMail(mail);
    if (!mail.isRead) {
        onMarkAsRead(mail.id);
    }
  };

  const handleBackToList = () => {
    setSelectedMail(null);
    setShowCompose(false);
  };

  // 加载信件的回复
  useEffect(() => {
    if (selectedMail && selectedMail.type === 'user_feedback') {
      const token = localStorage.getItem('auth_token');
      if (token) {
        chronosLetterApi.getLetterReplies(selectedMail.id, token)
          .then(replies => {
            setMailReplies(prev => new Map(prev).set(selectedMail.id, replies));
          })
          .catch(err => {
            console.error('加载回复失败:', err);
          });
      }
    }
  }, [selectedMail]);

  const handleComposeSubmit = async () => {
    if (!composeSubject.trim() || !composeContent.trim()) {
      alert('请填写主题和内容');
      return;
    }

    const token = localStorage.getItem('auth_token');
    if (!token) {
      alert('请先登录');
      return;
    }

    setIsSending(true);
    try {
      const newMail = await chronosLetterApi.createUserFeedback({
        subject: composeSubject.trim(),
        content: composeContent.trim(),
        senderId: 'user',
        senderName: gameState.userProfile?.nickname || '我',
        senderAvatarUrl: gameState.userProfile?.avatar || '',
        themeColor: '#8b5cf6', // 用户反馈使用紫色
      }, token);

      if (onMailAdded) {
        onMailAdded(newMail);
      }
      
      setComposeSubject('');
      setComposeContent('');
      setShowCompose(false);
      alert('信件已发送！');
    } catch (error) {
      console.error('发送信件失败:', error);
      alert('发送失败，请稍后重试');
    } finally {
      setIsSending(false);
    }
  };

  // Sort mails: Unread first, then by timestamp descending
  const sortedMails = [...mails].sort((a, b) => {
    if (a.isRead === b.isRead) {
        return b.timestamp - a.timestamp;
    }
    return a.isRead ? 1 : -1;
  });

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-4xl h-[80vh] shadow-2xl overflow-hidden flex flex-col md:flex-row relative">
        <button onClick={onClose} className="absolute top-4 right-4 z-20 text-slate-500 hover:text-white bg-black/50 rounded-full p-2 backdrop-blur-sm transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        {/* Sidebar / List View */}
        <div className={`w-full md:w-1/3 border-r border-slate-700 flex flex-col ${selectedMail ? 'hidden md:flex' : 'flex'}`}>
            <div className="p-6 bg-slate-950/50">
                <div className="flex items-center justify-between mb-3">
                    <div>
                        <h3 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400 flex items-center gap-2">
                            <span>📬</span> 跨时空信箱
                        </h3>
                        <p className="text-xs text-slate-500 mt-1">来自各个场景切片的问候</p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setShowCompose(true)}
                            className="text-xs px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center gap-1"
                            title="给管理员写信"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                            写信
                        </button>
                        <button
                            onClick={() => setShowHelp(!showHelp)}
                            className="text-slate-400 hover:text-pink-400 transition-colors p-2 rounded-lg hover:bg-slate-800"
                            title="查看说明"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide">
                {showCompose ? (
                    <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 space-y-4">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="text-lg font-bold text-purple-400">✉️ 给管理员写信</h4>
                            <button
                                onClick={() => {
                                    setShowCompose(false);
                                    setComposeSubject('');
                                    setComposeContent('');
                                }}
                                className="text-slate-500 hover:text-white"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-sm text-slate-300 mb-1">主题</label>
                                <input
                                    type="text"
                                    value={composeSubject}
                                    onChange={(e) => setComposeSubject(e.target.value)}
                                    placeholder="请输入信件主题..."
                                    className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-slate-300 mb-1">内容</label>
                                <textarea
                                    value={composeContent}
                                    onChange={(e) => setComposeContent(e.target.value)}
                                    placeholder="请输入信件内容..."
                                    rows={8}
                                    className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 resize-none"
                                />
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleComposeSubmit}
                                    disabled={isSending || !composeSubject.trim() || !composeContent.trim()}
                                    className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-lg transition-colors"
                                >
                                    {isSending ? '发送中...' : '发送'}
                                </button>
                                <button
                                    onClick={() => {
                                        setShowCompose(false);
                                        setComposeSubject('');
                                        setComposeContent('');
                                    }}
                                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                                >
                                    取消
                                </button>
                            </div>
                        </div>
                    </div>
                ) : showHelp ? (
                    <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 space-y-4 text-sm text-slate-300">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="text-lg font-bold text-pink-400">📬 跨时空信箱说明</h4>
                            <button
                                onClick={() => setShowHelp(false)}
                                className="text-slate-500 hover:text-white"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        
                        <div className="space-y-3">
                            <div>
                                <h5 className="font-semibold text-purple-400 mb-2">⏰ 什么时候会收到信件？</h5>
                                <ul className="list-disc list-inside space-y-1 text-xs text-slate-400 ml-2">
                                    <li>当你离线超过 <span className="text-pink-400 font-semibold">60秒</span> 后重新登录</li>
                                    <li>系统会自动检查并生成信件</li>
                                    <li>离线时间越长，收到信件的可能性越大</li>
                                </ul>
                            </div>
                            
                            <div>
                                <h5 className="font-semibold text-purple-400 mb-2">👤 谁会发送信件？</h5>
                                <ul className="list-disc list-inside space-y-1 text-xs text-slate-400 ml-2">
                                    <li><span className="text-pink-400 font-semibold">优先选择</span>：你最近聊过的角色</li>
                                    <li><span className="text-pink-400 font-semibold">备选方案</span>：第一个场景的第一个角色</li>
                                    <li>发件人会根据你的日记内容个性化信件内容</li>
                                </ul>
                            </div>
                            
                            <div>
                                <h5 className="font-semibold text-purple-400 mb-2">💌 信件特点</h5>
                                <ul className="list-disc list-inside space-y-1 text-xs text-slate-400 ml-2">
                                    <li>每封信都是AI根据角色性格生成的</li>
                                    <li>会提到你们之前的对话或你的日记</li>
                                    <li>充满个性和情感的真实信件</li>
                                </ul>
                            </div>
                            
                            <div className="pt-2 border-t border-slate-700">
                                <p className="text-xs text-slate-500">
                                    💡 <span className="text-slate-400">提示：</span>你可以给管理员写信反馈问题或建议，管理员会回复你！
                                </p>
                            </div>
                        </div>
                    </div>
                ) : sortedMails.length === 0 ? (
                    <div className="text-center text-slate-600 mt-10 space-y-3">
                        <div className="text-4xl mb-4">📭</div>
                        <p className="text-base">信箱是空的</p>
                        <p className="text-xs text-slate-500">去和大家聊聊天吧，也许下次会有惊喜</p>
                        <button
                            onClick={() => setShowHelp(true)}
                            className="mt-4 text-xs text-pink-400 hover:text-pink-300 underline"
                        >
                            查看详细说明
                        </button>
                    </div>
                ) : (
                    sortedMails.map(mail => (
                        <div 
                            key={mail.id}
                            onClick={() => handleOpenMail(mail)}
                            className={`p-4 rounded-xl cursor-pointer transition-all border relative overflow-hidden group ${
                                selectedMail?.id === mail.id 
                                ? 'bg-slate-800 border-pink-500/50' 
                                : mail.isRead 
                                    ? 'bg-slate-900/50 border-transparent hover:bg-slate-800' 
                                    : 'bg-gradient-to-r from-slate-800 to-indigo-900/30 border-indigo-500/30 hover:border-indigo-400'
                            }`}
                        >
                            {!mail.isRead && <div className="absolute top-2 right-2 w-2 h-2 bg-pink-500 rounded-full animate-pulse" />}
                            <div className="flex items-center gap-3">
                                <img src={mail.senderAvatarUrl} alt={mail.senderName} className="w-10 h-10 rounded-full object-cover border border-slate-600" />
                                <div className="flex-1 min-w-0">
                                    <h4 className={`font-bold truncate ${mail.isRead ? 'text-slate-400' : 'text-white'}`}>{mail.senderName}</h4>
                                    <p className="text-sm text-slate-500 truncate">{mail.subject}</p>
                                </div>
                            </div>
                            <p className="text-[10px] text-slate-600 mt-2 text-right">{new Date(mail.timestamp).toLocaleDateString()}</p>
                        </div>
                    ))
                )}
            </div>
        </div>

        {/* Reading View */}
        <div className={`flex-1 bg-[#fdfbf7] text-slate-800 flex flex-col relative ${selectedMail ? 'flex' : 'hidden md:flex'}`}>
            {!selectedMail ? (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 text-center bg-slate-900/80">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 mb-4 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                    <p>选择一封信件阅读</p>
                </div>
            ) : (
                <>
                    <div className="md:hidden absolute top-4 left-4 z-10">
                         <button onClick={handleBackToList} className="text-slate-500 hover:text-black">
                            &larr; 返回列表
                         </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-8 md:p-12 relative font-serif">
                        {/* Paper Texture Effect */}
                        <div className="absolute inset-0 opacity-5 pointer-events-none" style={{backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.5' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23noise)' opacity='0.5'/%3E%3C/svg%3E")`}}></div>
                        
                        <div className="max-w-2xl mx-auto relative z-10">
                            <div className="flex items-center gap-4 mb-8 border-b-2 border-gray-200 pb-4">
                                <img src={selectedMail.senderAvatarUrl} alt="" className="w-16 h-16 rounded-full border-4 border-white shadow-md object-cover" />
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900 leading-tight">{selectedMail.subject}</h2>
                                    <p className="text-sm text-gray-500">来自：<span className="font-bold" style={{color: selectedMail.themeColor}}>{selectedMail.senderName}</span></p>
                                    <p className="text-xs text-gray-400">{new Date(selectedMail.timestamp).toLocaleString()}</p>
                                </div>
                            </div>

                            <div className="prose prose-lg prose-slate leading-loose text-gray-800 whitespace-pre-wrap">
                                {selectedMail.content}
                            </div>

                            <div className="mt-12 pt-8 text-right font-handwriting text-xl text-gray-600">
                                — {selectedMail.senderName}
                            </div>

                            {/* 显示回复（如果是用户反馈且有管理员回复） */}
                            {selectedMail.type === 'user_feedback' && mailReplies.get(selectedMail.id) && mailReplies.get(selectedMail.id)!.length > 0 && (
                                <div className="mt-12 pt-8 border-t-2 border-gray-300">
                                    <h3 className="text-xl font-bold text-gray-900 mb-6">管理员回复</h3>
                                    {mailReplies.get(selectedMail.id)!.map((reply) => (
                                        <div key={reply.id} className="mb-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="w-12 h-12 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold">
                                                    管
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900">{reply.senderName}</p>
                                                    <p className="text-xs text-gray-500">{new Date(reply.timestamp).toLocaleString()}</p>
                                                </div>
                                            </div>
                                            <div className="prose prose-slate leading-relaxed text-gray-800 whitespace-pre-wrap">
                                                {reply.content}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
      </div>
    </div>
  );
};
