import React, { useState, useEffect } from 'react';
import { adminApi } from '../services/api';
import { showAlert } from "../utils/dialog";
import { Button } from "../components/Button";
import { InputGroup, TextInput, TextArea } from './AdminUIComponents';
import type { ContactForm } from '../services/api/admin/contactForms';

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
    const [activeTab, setActiveTab] = useState<'letters' | 'contactForms'>('letters');
    const [letters, setLetters] = useState<ChronosLetter[]>([]);
    const [contactForms, setContactForms] = useState<ContactForm[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedLetter, setSelectedLetter] = useState<ChronosLetter | null>(null);
    const [selectedContactForm, setSelectedContactForm] = useState<ContactForm | null>(null);
    const [replyContent, setReplyContent] = useState('');
    const [replying, setReplying] = useState(false);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [unprocessedOnly, setUnprocessedOnly] = useState(true);

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
        if (activeTab === 'letters') {
            loadUserFeedbacks();
        } else {
            loadContactForms();
        }
    }, [adminToken, activeTab, page, unprocessedOnly]);

    const loadContactForms = async () => {
        if (!adminToken) return;
        setLoading(true);
        try {
            const result = await adminApi.contactForms.getAllContactForms(
                page,
                20,
                unprocessedOnly ? true : undefined,
                adminToken
            );
            setContactForms(result.content);
            setTotalPages(result.totalPages);
        } catch (error: any) {
            console.error('加载联系表单失败:', error);
            showAlert('加载联系表单失败: ' + (error.message || '未知错误'), '加载失败', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleContactFormClick = async (contactForm: ContactForm) => {
        setSelectedContactForm(contactForm);
        if (adminToken) {
            try {
                const detail = await adminApi.contactForms.getContactFormById(contactForm.id, adminToken);
                setSelectedContactForm(detail);
            } catch (error: any) {
                console.error('加载联系表单详情失败:', error);
            }
        }
    };

    const handleMarkAsProcessed = async () => {
        if (!adminToken || !selectedContactForm) {
            showAlert('请选择要处理的联系表单', '提示', 'warning');
            return;
        }

        setReplying(true);
        try {
            await adminApi.contactForms.markAsProcessed(
                selectedContactForm.id,
                '已处理',
                adminToken
            );
            showAlert('标记成功', '成功', 'success');
            setSelectedContactForm(null);
            loadContactForms();
            if (onRefresh) onRefresh();
        } catch (error: any) {
            console.error('标记失败:', error);
            showAlert('标记失败: ' + (error.message || '未知错误'), '标记失败', 'error');
        } finally {
            setReplying(false);
        }
    };

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
                <div className="flex items-center justify-between mb-5">
                    <h2 className="text-lg font-bold text-slate-100">超时空信箱管理</h2>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setActiveTab('letters')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                activeTab === 'letters'
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                            }`}
                        >
                            用户反馈
                        </button>
                        <button
                            onClick={() => setActiveTab('contactForms')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                activeTab === 'contactForms'
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                            }`}
                        >
                            联系表单
                        </button>
                    </div>
                </div>
                
                {activeTab === 'letters' ? (
                    <>
                
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
                    </>
                ) : (
                    <>
                        <div className="mb-4 flex items-center gap-4">
                            <label className="flex items-center gap-2 text-sm text-slate-300">
                                <input
                                    type="checkbox"
                                    checked={unprocessedOnly}
                                    onChange={(e) => {
                                        setUnprocessedOnly(e.target.checked);
                                        setPage(0);
                                    }}
                                    className="rounded"
                                />
                                仅显示未处理
                            </label>
                        </div>
                        
                        {loading ? (
                            <div className="text-center py-8 text-slate-400">加载中...</div>
                        ) : contactForms.length === 0 ? (
                            <div className="text-center py-8 text-slate-400">暂无联系表单</div>
                        ) : (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* 左侧：联系表单列表 */}
                                <div className="space-y-3">
                                    <h3 className="text-md font-semibold text-slate-200 mb-3">
                                        联系表单列表 ({contactForms.length})
                                    </h3>
                                    <div className="space-y-2 max-h-[600px] overflow-y-auto">
                                        {contactForms.map((form) => (
                                            <div
                                                key={form.id}
                                                onClick={() => handleContactFormClick(form)}
                                                className={`p-4 rounded-lg border cursor-pointer transition-all ${
                                                    selectedContactForm?.id === form.id
                                                        ? 'bg-slate-800 border-indigo-500'
                                                        : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
                                                }`}
                                            >
                                                <div className="flex items-start justify-between mb-2">
                                                    <div className="flex-1">
                                                        <div className="text-sm font-semibold text-slate-100 mb-1">
                                                            {form.name}
                                                        </div>
                                                        <div className="text-xs text-slate-400 mb-2">
                                                            {form.email} | {form.phone}
                                                            {form.company && ` | ${form.company}`}
                                                        </div>
                                                    </div>
                                                    {!form.isProcessed && (
                                                        <span className="ml-2 px-2 py-1 text-xs bg-red-500/20 text-red-300 rounded">
                                                            未处理
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-sm text-slate-300 line-clamp-2 mb-2">
                                                    {form.message}
                                                </div>
                                                <div className="text-xs text-slate-500">
                                                    {new Date(form.createdAt).toLocaleString('zh-CN')}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    
                                    {/* 分页 */}
                                    {totalPages > 1 && (
                                        <div className="flex items-center justify-center gap-2 mt-4">
                                            <button
                                                onClick={() => setPage(Math.max(0, page - 1))}
                                                disabled={page === 0}
                                                className="px-3 py-1 rounded bg-slate-800 text-slate-300 disabled:opacity-50"
                                            >
                                                上一页
                                            </button>
                                            <span className="text-sm text-slate-400">
                                                {page + 1} / {totalPages}
                                            </span>
                                            <button
                                                onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                                                disabled={page >= totalPages - 1}
                                                className="px-3 py-1 rounded bg-slate-800 text-slate-300 disabled:opacity-50"
                                            >
                                                下一页
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* 右侧：联系表单详情 */}
                                {selectedContactForm && (
                                    <div className="space-y-4">
                                        <h3 className="text-md font-semibold text-slate-200 mb-3">联系表单详情</h3>
                                        <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                                            <div className="mb-4">
                                                <div className="text-xs text-slate-400 mb-1">姓名</div>
                                                <div className="text-sm font-semibold text-slate-100">
                                                    {selectedContactForm.name}
                                                </div>
                                            </div>
                                            <div className="mb-4">
                                                <div className="text-xs text-slate-400 mb-1">邮箱</div>
                                                <div className="text-sm text-slate-200">
                                                    {selectedContactForm.email}
                                                </div>
                                            </div>
                                            <div className="mb-4">
                                                <div className="text-xs text-slate-400 mb-1">电话</div>
                                                <div className="text-sm text-slate-200">
                                                    {selectedContactForm.phone}
                                                </div>
                                            </div>
                                            {selectedContactForm.company && (
                                                <div className="mb-4">
                                                    <div className="text-xs text-slate-400 mb-1">公司</div>
                                                    <div className="text-sm text-slate-200">
                                                        {selectedContactForm.company}
                                                    </div>
                                                </div>
                                            )}
                                            <div className="mb-4">
                                                <div className="text-xs text-slate-400 mb-1">时间</div>
                                                <div className="text-sm text-slate-200">
                                                    {new Date(selectedContactForm.createdAt).toLocaleString('zh-CN')}
                                                </div>
                                            </div>
                                            <div className="mb-4">
                                                <div className="text-xs text-slate-400 mb-1">咨询内容</div>
                                                <div className="text-sm text-slate-200 whitespace-pre-wrap bg-slate-900/50 p-3 rounded border border-slate-700">
                                                    {selectedContactForm.message}
                                                </div>
                                            </div>
                                            {selectedContactForm.processNotes && (
                                                <div className="mb-4">
                                                    <div className="text-xs text-slate-400 mb-1">处理备注</div>
                                                    <div className="text-sm text-slate-200">
                                                        {selectedContactForm.processNotes}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* 处理按钮 */}
                                        {!selectedContactForm.isProcessed && (
                                            <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                                                <Button
                                                    onClick={handleMarkAsProcessed}
                                                    disabled={replying}
                                                    className="w-full bg-indigo-600 hover:bg-indigo-500"
                                                >
                                                    {replying ? '处理中...' : '标记为已处理'}
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};
