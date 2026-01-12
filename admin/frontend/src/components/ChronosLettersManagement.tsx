import React, { useState, useEffect } from 'react';
import { adminApi } from '../services/api';
import { showAlert } from "../utils/dialog";
import { Button } from "../components/Button";
import { InputGroup, TextInput, TextArea } from './AdminUIComponents';

interface ChronosLettersManagementProps {
    adminToken: string | null;
    onRefresh?: () => void;
}

interface ChronosLetter {
    id: string;
    user: {
        id: number;
        username: string;
        nickname: string | null;
        email: string | null;
    };
    senderId: string;
    senderName: string;
    senderAvatarUrl: string | null;
    subject: string;
    content: string;
    timestamp: number;
    isRead: boolean;
    themeColor: string | null;
    type: 'user_feedback' | 'admin_reply' | 'ai_generated';
    parentLetterId: string | null;
    createdAt: string;
    updatedAt: string;
}

export const ChronosLettersManagement: React.FC<ChronosLettersManagementProps> = ({
    adminToken,
    onRefresh
}) => {
    const [letters, setLetters] = useState<ChronosLetter[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedLetter, setSelectedLetter] = useState<ChronosLetter | null>(null);
    const [replyContent, setReplyContent] = useState('');
    const [replying, setReplying] = useState(false);

    const loadUserFeedbacks = async () => {
        if (!adminToken) return;
        setLoading(true);
        try {
            const feedbacks = await adminApi.chronosLetters.getUserFeedbacks(adminToken);
            setLetters(feedbacks);
        } catch (error: any) {
            console.error('加载用户反馈失败:', error);
            showAlert('加载用户反馈失败: ' + (error.message || '未知错误'), '加载失败', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUserFeedbacks();
    }, [adminToken]);

    const formatTimestamp = (timestamp: number) => {
        const date = new Date(timestamp);
        return date.toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const handleLetterClick = async (letter: ChronosLetter) => {
        setSelectedLetter(letter);
        setReplyContent('');
        
        // 加载信件详情（如果需要）
        if (adminToken) {
            try {
                const detail = await adminApi.chronosLetters.getLetterById(letter.id, adminToken);
                setSelectedLetter(detail);
            } catch (error: any) {
                console.error('加载信件详情失败:', error);
            }
        }
    };

    const handleReply = async () => {
        if (!adminToken || !selectedLetter || !replyContent.trim()) {
            showAlert('请输入回复内容', '提示', 'warning');
            return;
        }

        setReplying(true);
        try {
            await adminApi.chronosLetters.replyToUserFeedback(
                selectedLetter.id,
                { content: replyContent.trim() },
                adminToken
            );
            showAlert('回复成功', '成功', 'success');
            setReplyContent('');
            setSelectedLetter(null);
            loadUserFeedbacks();
            if (onRefresh) onRefresh();
        } catch (error: any) {
            console.error('回复失败:', error);
            showAlert('回复失败: ' + (error.message || '未知错误'), '回复失败', 'error');
        } finally {
            setReplying(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-lg">
                <h2 className="text-lg font-bold text-slate-100 mb-5">超时空信箱管理 - 用户反馈</h2>
                
                {loading ? (
                    <div className="text-center py-8 text-slate-400">加载中...</div>
                ) : letters.length === 0 ? (
                    <div className="text-center py-8 text-slate-400">暂无用户反馈</div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* 左侧：信件列表 */}
                        <div className="space-y-3">
                            <h3 className="text-md font-semibold text-slate-200 mb-3">
                                用户反馈列表 ({letters.length})
                            </h3>
                            <div className="space-y-2 max-h-[600px] overflow-y-auto">
                                {letters.map((letter) => (
                                    <div
                                        key={letter.id}
                                        onClick={() => handleLetterClick(letter)}
                                        className={`p-4 rounded-lg border cursor-pointer transition-all ${
                                            selectedLetter?.id === letter.id
                                                ? 'bg-slate-800 border-indigo-500'
                                                : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
                                        }`}
                                    >
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex-1">
                                                <div className="text-sm font-semibold text-slate-100 mb-1">
                                                    {letter.subject}
                                                </div>
                                                <div className="text-xs text-slate-400 mb-2">
                                                    来自: {letter.user.nickname || letter.user.username}
                                                    {letter.user.email && ` (${letter.user.email})`}
                                                </div>
                                            </div>
                                            {!letter.isRead && (
                                                <span className="ml-2 px-2 py-1 text-xs bg-indigo-500/20 text-indigo-300 rounded">
                                                    未读
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-sm text-slate-300 line-clamp-2 mb-2">
                                            {letter.content}
                                        </div>
                                        <div className="text-xs text-slate-500">
                                            {formatTimestamp(letter.timestamp)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* 右侧：信件详情和回复 */}
                        {selectedLetter && (
                            <div className="space-y-4">
                                <h3 className="text-md font-semibold text-slate-200 mb-3">信件详情</h3>
                                <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                                    <div className="mb-4">
                                        <div className="text-xs text-slate-400 mb-1">主题</div>
                                        <div className="text-sm font-semibold text-slate-100">
                                            {selectedLetter.subject}
                                        </div>
                                    </div>
                                    <div className="mb-4">
                                        <div className="text-xs text-slate-400 mb-1">发件人</div>
                                        <div className="text-sm text-slate-200">
                                            {selectedLetter.user.nickname || selectedLetter.user.username}
                                            {selectedLetter.user.email && ` (${selectedLetter.user.email})`}
                                        </div>
                                    </div>
                                    <div className="mb-4">
                                        <div className="text-xs text-slate-400 mb-1">时间</div>
                                        <div className="text-sm text-slate-200">
                                            {formatTimestamp(selectedLetter.timestamp)}
                                        </div>
                                    </div>
                                    <div className="mb-4">
                                        <div className="text-xs text-slate-400 mb-1">内容</div>
                                        <div className="text-sm text-slate-200 whitespace-pre-wrap bg-slate-900/50 p-3 rounded border border-slate-700">
                                            {selectedLetter.content}
                                        </div>
                                    </div>
                                </div>

                                {/* 回复区域 */}
                                <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                                    <h4 className="text-sm font-semibold text-slate-200 mb-3">回复用户</h4>
                                    <TextArea
                                        placeholder="输入回复内容..."
                                        value={replyContent}
                                        onChange={(e) => setReplyContent(e.target.value)}
                                        rows={6}
                                        className="mb-3"
                                    />
                                    <Button
                                        onClick={handleReply}
                                        disabled={replying || !replyContent.trim()}
                                        className="w-full bg-indigo-600 hover:bg-indigo-500"
                                    >
                                        {replying ? '回复中...' : '发送回复'}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
