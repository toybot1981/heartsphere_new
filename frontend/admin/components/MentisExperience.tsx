import React, { useState, useEffect, useRef } from 'react';

interface MentisExperienceProps {
    adminToken: string | null;
}

interface Message {
    id: string;
    role: 'user' | 'mentis' | 'system';
    content: string;
    timestamp: Date;
    taskId?: string;
    isStreaming?: boolean;
}

interface VmStatus {
    vmId?: string;
    status: string;
    cpuUsage?: number;
    memoryUsage?: number;
}

export const MentisExperience: React.FC<MentisExperienceProps> = ({ adminToken }) => {
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [vmStatus, setVmStatus] = useState<VmStatus | null>(null);
    const [activeTab, setActiveTab] = useState<'chat' | 'vm' | 'tasks'>('chat');
    const [error, setError] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const currentMessageRef = useRef<Message | null>(null);

    // 初始化会话
    useEffect(() => {
        if (adminToken) {
            createSession();
        }
    }, [adminToken]);

    // 自动滚动到底部
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const createSession = async () => {
        if (!adminToken) return;
        
        try {
            const response = await fetch('/api/admin/mentis/sessions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${adminToken}`
                },
                body: JSON.stringify({ title: '管理后台体验会话' })
            });
            
            if (!response.ok) {
                throw new Error('创建会话失败');
            }
            
            const data = await response.json();
            setSessionId(data.data?.sessionId || data.sessionId);
            
            // 添加欢迎消息
            setMessages([{
                id: 'welcome',
                role: 'system',
                content: '👋 欢迎体验 Mentis 超级智能体！\n\n我可以帮助你：\n• 执行系统命令\n• 运行脚本代码\n• GUI 自动化操作\n• 任务分解与执行\n\n请输入你的需求，我会为你完成！',
                timestamp: new Date()
            }]);
        } catch (err: any) {
            console.error('创建会话失败:', err);
            setError('创建会话失败: ' + (err.message || '未知错误'));
        }
    };

    const handleSend = async () => {
        if (!inputValue.trim() || isLoading || !sessionId || !adminToken) return;

        const messageText = inputValue.trim();
        const userMessage: Message = {
            id: `user_${Date.now()}`,
            role: 'user',
            content: messageText,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsLoading(true);
        setError(null);

        // 创建占位消息（使用临时ID，会在收到第一个响应时更新为实际的messageId）
        const tempMessageId = `mentis_${Date.now()}`;
        currentMessageRef.current = {
            id: tempMessageId,
            role: 'mentis',
            content: '',
            timestamp: new Date(),
            isStreaming: true
        };
        setMessages(prev => [...prev, currentMessageRef.current!]);

        try {
            const response = await fetch('/api/admin/mentis/chat/stream', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${adminToken}`
                },
                body: JSON.stringify({
                    sessionId,
                    message: messageText,
                    enableComputerUse: true
                })
            });

            if (!response.ok) {
                const errorText = await response.text().catch(() => '');
                console.error('HTTP 错误:', response.status, errorText);
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            // 检查 Content-Type 是否为 SSE
            const contentType = response.headers.get('content-type') || '';
            console.log('响应 Content-Type:', contentType);

            const reader = response.body?.getReader();
            const decoder = new TextDecoder();

            if (!reader) {
                throw new Error('无法读取响应流');
            }
            
            console.log('开始读取 SSE 流...');

            let buffer = '';
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                
                // 按双换行符分割 SSE 事件（SSE 格式中每个事件以 \n\n 分隔）
                const events = buffer.split('\n\n');
                // 保留最后一个不完整的事件（可能还在传输中）
                buffer = events.pop() || '';
                
                for (const event of events) {
                    if (!event.trim()) continue;
                    
                    console.log('处理 SSE 事件，原始内容:', event.substring(0, 300));
                    
                    const lines = event.split('\n');
                    let eventType = 'message';
                    let dataParts: string[] = [];
                    
                    // 解析 SSE 事件格式
                    // 注意：data 可能跨多行，需要合并所有 data: 行
                    for (const line of lines) {
                        if (line.startsWith('event:')) {
                            // 处理 event:complete 和 event: complete 两种情况
                            const colonIndex = line.indexOf(':');
                            if (colonIndex !== -1) {
                                eventType = line.substring(colonIndex + 1).trim();
                            }
                        } else if (line.startsWith('data:')) {
                            // 处理 data: 和 data: 两种情况（有空格或无空格）
                            const colonIndex = line.indexOf(':');
                            if (colonIndex !== -1) {
                                const dataContent = line.substring(colonIndex + 1).trimStart();
                                dataParts.push(dataContent);
                            }
                        }
                    }
                    
                    // 合并所有 data 部分（SSE 规范允许多个 data: 行）
                    const data = dataParts.join('\n').trim();
                    
                    console.log('解析结果 - eventType:', eventType, 'data 长度:', data.length, 'data 预览:', data.substring(0, 200));
                    
                    // 如果没有 event 行，但有 data，默认使用 'message' 类型
                    if (!data && dataParts.length === 0) {
                        continue; // 跳过空事件
                    }
                    
                    if (data) {
                        // complete 和 error 事件的 data 可能是字符串，不需要 JSON 解析
                        if (eventType === 'complete') {
                            // 流结束
                            setMessages(prev => {
                                const updated = [...prev];
                                const idx = updated.findIndex(m => m.id === currentMessageRef.current?.id);
                                if (idx !== -1) {
                                    updated[idx] = { ...updated[idx], isStreaming: false };
                                }
                                return updated;
                            });
                            return; // 流结束，退出循环
                        } else if (eventType === 'error') {
                            // 处理错误，去除可能的引号
                            let errorMsg = data;
                            if (errorMsg.startsWith('"') && errorMsg.endsWith('"')) {
                                errorMsg = errorMsg.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, '\\');
                            }
                            throw new Error(errorMsg);
                        } else if (eventType === 'message' || !eventType || eventType === '') {
                            // message 事件需要解析 JSON（如果没有 event 行，默认作为 message 处理）
                            try {
                                // 如果数据是字符串（被引号包裹），先去除引号
                                let jsonStr = data;
                                if (jsonStr.startsWith('"') && jsonStr.endsWith('"')) {
                                    jsonStr = jsonStr.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, '\\');
                                }
                                
                                // 尝试解析 JSON，如果失败则可能是数据不完整，跳过
                                const parsedData = JSON.parse(jsonStr);
                                const responseText = parsedData.response || '';
                                const messageId = parsedData.messageId;
                                console.log('解析的 JSON 数据，messageId:', messageId, '响应长度:', responseText.length, '预览:', responseText.substring(0, 50));
                                
                                // 如果是第一个响应，更新currentMessageRef的ID为后端返回的messageId
                                if (messageId && currentMessageRef.current && currentMessageRef.current.id !== messageId) {
                                    console.log('更新消息ID，从', currentMessageRef.current.id, '更新到', messageId);
                                    // 先更新messages中的ID
                                    setMessages(prev => {
                                        const updated = [...prev];
                                        const oldIdx = updated.findIndex(m => m.id === currentMessageRef.current?.id);
                                        if (oldIdx !== -1) {
                                            updated[oldIdx] = {
                                                ...updated[oldIdx],
                                                id: messageId
                                            };
                                        }
                                        return updated;
                                    });
                                    // 更新ref
                                    currentMessageRef.current.id = messageId;
                                }
                                
                                // 处理消息数据 - 流式更新
                                // 使用后端返回的messageId来查找消息
                                const targetMessageId = messageId || currentMessageRef.current?.id;
                                setMessages(prev => {
                                    const updated = [...prev];
                                    const idx = updated.findIndex(m => m.id === targetMessageId);
                                    if (idx !== -1) {
                                        // 更新消息内容，保留之前的流式状态
                                        const currentContent = updated[idx].content || '';
                                        const newContent = responseText || currentContent;
                                        
                                        // 只有内容真正改变时才更新，避免不必要的重新渲染
                                        if (newContent !== currentContent) {
                                            console.log('✅ 更新消息内容，messageId:', targetMessageId, '从', currentContent.length, '字符更新到', newContent.length, '字符');
                                            updated[idx] = {
                                                ...updated[idx],
                                                content: newContent,
                                                taskId: parsedData.taskId,
                                                isStreaming: true
                                            };
                                            
                                            // 自动滚动到底部以显示最新内容
                                            setTimeout(() => {
                                                messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
                                            }, 0);
                                        } else {
                                            console.log('⚠️ 内容未改变，跳过更新');
                                        }
                                    } else {
                                        console.error('❌ 找不到消息，messageId:', targetMessageId, '现有消息IDs:', updated.map(m => m.id));
                                    }
                                    return updated;
                                });
                            } catch (e) {
                                // JSON 解析失败可能是数据不完整，记录但不中断流
                                if (e instanceof SyntaxError) {
                                    console.warn('JSON 数据可能不完整，等待更多数据:', data.substring(0, 100));
                                } else {
                                    console.error('解析 SSE 数据失败:', e, data);
                                    setError('解析响应失败: ' + (e instanceof Error ? e.message : String(e)));
                                }
                            }
                        } else {
                            console.warn('未知的 SSE 事件类型:', eventType, 'data:', data.substring(0, 100));
                        }
                    }
                }
            }
            
            // 处理剩余的 buffer（最后一个不完整的事件）
            if (buffer.trim()) {
                const lines = buffer.split('\n');
                let eventType = 'message';
                let dataParts: string[] = [];
                
                for (const line of lines) {
                    if (line.startsWith('event:')) {
                        // 处理 event:complete 和 event: complete 两种情况
                        const colonIndex = line.indexOf(':');
                        if (colonIndex !== -1) {
                            eventType = line.substring(colonIndex + 1).trim();
                        }
                    } else if (line.startsWith('data:')) {
                        // 处理 data: 和 data: 两种情况（有空格或无空格）
                        const colonIndex = line.indexOf(':');
                        if (colonIndex !== -1) {
                            const dataContent = line.substring(colonIndex + 1).trimStart();
                            dataParts.push(dataContent);
                        }
                    }
                }
                
                const data = dataParts.join('\n').trim();
                if (data) {
                    // complete 和 error 事件的 data 可能是字符串，不需要 JSON 解析
                    if (eventType === 'complete') {
                        // 流结束
                        setMessages(prev => {
                            const updated = [...prev];
                            const idx = updated.findIndex(m => m.id === currentMessageRef.current?.id);
                            if (idx !== -1) {
                                updated[idx] = { ...updated[idx], isStreaming: false };
                            }
                            return updated;
                        });
                    } else if (eventType === 'error') {
                        // 处理错误，去除可能的引号
                        let errorMsg = data;
                        if (errorMsg.startsWith('"') && errorMsg.endsWith('"')) {
                            errorMsg = errorMsg.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, '\\');
                        }
                        setError(errorMsg);
                    } else if (eventType === 'message') {
                        // message 事件需要解析 JSON
                        try {
                            let jsonStr = data;
                            if (jsonStr.startsWith('"') && jsonStr.endsWith('"')) {
                                jsonStr = jsonStr.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, '\\');
                            }
                            const parsedData = JSON.parse(jsonStr);
                            
                            setMessages(prev => {
                                const updated = [...prev];
                                const idx = updated.findIndex(m => m.id === currentMessageRef.current?.id);
                                if (idx !== -1) {
                                    updated[idx] = {
                                        ...updated[idx],
                                        content: parsedData.response || updated[idx].content,
                                        taskId: parsedData.taskId,
                                        isStreaming: true
                                    };
                                }
                                return updated;
                            });
                        } catch (e) {
                            console.warn('解析剩余 buffer 的 JSON 数据失败（可能是数据不完整）:', e, data.substring(0, 100));
                        }
                    }
                }
            }

            // 标记流结束
            setMessages(prev => {
                const updated = [...prev];
                const idx = updated.findIndex(m => m.id === currentMessageRef.current?.id);
                if (idx !== -1) {
                    updated[idx] = { ...updated[idx], isStreaming: false };
                }
                return updated;
            });
        } catch (err: any) {
            console.error('发送消息失败:', err);
            setError(err.message || '发送消息失败');
            
            // 更新错误消息
            setMessages(prev => {
                const updated = [...prev];
                const idx = updated.findIndex(m => m.id === currentMessageRef.current?.id);
                if (idx !== -1) {
                    updated[idx] = {
                        ...updated[idx],
                        content: `❌ 错误: ${err.message || '发送消息失败'}`,
                        isStreaming: false
                    };
                }
                return updated;
            });
        } finally {
            setIsLoading(false);
            currentMessageRef.current = null;
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const refreshVmStatus = async () => {
        if (!sessionId || !adminToken) return;
        
        try {
            const response = await fetch(`/api/admin/mentis/vm/${sessionId}/status`, {
                headers: { 'Authorization': `Bearer ${adminToken}` }
            });
            
            if (response.ok) {
                const data = await response.json();
                setVmStatus(data.data || data);
            }
        } catch (err) {
            console.error('获取虚拟机状态失败:', err);
        }
    };

    return (
        <div className="h-full flex flex-col bg-slate-950">
            {/* 头部标签栏 */}
            <div className="flex items-center border-b border-slate-800 bg-slate-900/50">
                <button
                    onClick={() => setActiveTab('chat')}
                    className={`px-6 py-3 text-sm font-medium transition-colors ${
                        activeTab === 'chat'
                            ? 'text-indigo-400 border-b-2 border-indigo-400 bg-slate-800/50'
                            : 'text-slate-400 hover:text-slate-200'
                    }`}
                >
                    💬 对话
                </button>
                <button
                    onClick={() => { setActiveTab('vm'); refreshVmStatus(); }}
                    className={`px-6 py-3 text-sm font-medium transition-colors ${
                        activeTab === 'vm'
                            ? 'text-indigo-400 border-b-2 border-indigo-400 bg-slate-800/50'
                            : 'text-slate-400 hover:text-slate-200'
                    }`}
                >
                    🖥️ 虚拟机
                </button>
                <button
                    onClick={() => setActiveTab('tasks')}
                    className={`px-6 py-3 text-sm font-medium transition-colors ${
                        activeTab === 'tasks'
                            ? 'text-indigo-400 border-b-2 border-indigo-400 bg-slate-800/50'
                            : 'text-slate-400 hover:text-slate-200'
                    }`}
                >
                    📋 任务
                </button>
                
                <div className="flex-1" />
                
                {sessionId && (
                    <div className="px-4 text-xs text-slate-500">
                        会话: {sessionId.slice(0, 16)}...
                    </div>
                )}
            </div>

            {/* 错误提示 */}
            {error && (
                <div className="px-4 py-2 bg-red-900/30 border-b border-red-800 text-red-400 text-sm flex items-center justify-between">
                    <span>⚠️ {error}</span>
                    <button onClick={() => setError(null)} className="text-red-400 hover:text-red-300">✕</button>
                </div>
            )}

            {/* 主内容区 */}
            <div className="flex-1 overflow-hidden">
                {activeTab === 'chat' && (
                    <div className="h-full flex flex-col">
                        {/* 消息列表 */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {messages.map((message) => (
                                <div
                                    key={message.id}
                                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                                            message.role === 'user'
                                                ? 'bg-indigo-600 text-white'
                                                : message.role === 'system'
                                                ? 'bg-slate-800 text-slate-300 border border-slate-700'
                                                : 'bg-slate-800 text-slate-200'
                                        }`}
                                    >
                                        <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                                        <div className="mt-1 flex items-center gap-2 text-xs opacity-60">
                                            <span>{message.timestamp.toLocaleTimeString()}</span>
                                            {message.isStreaming && (
                                                <span className="animate-pulse">●</span>
                                            )}
                                            {message.taskId && (
                                                <span className="bg-slate-700 px-2 py-0.5 rounded">
                                                    任务: {message.taskId.slice(0, 8)}...
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* 输入区 */}
                        <div className="p-4 border-t border-slate-800 bg-slate-900/50">
                            <div className="flex gap-3">
                                <textarea
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder="输入你的需求，例如：帮我执行 ls -la 命令..."
                                    disabled={isLoading || !sessionId}
                                    className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                                    rows={2}
                                />
                                <button
                                    onClick={handleSend}
                                    disabled={!inputValue.trim() || isLoading || !sessionId}
                                    className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-900/30"
                                >
                                    {isLoading ? (
                                        <span className="flex items-center gap-2">
                                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                            </svg>
                                            处理中
                                        </span>
                                    ) : '发送'}
                                </button>
                            </div>
                            <div className="mt-2 flex gap-2">
                                <button
                                    onClick={() => setInputValue('帮我执行 ls -la 命令')}
                                    className="px-3 py-1 text-xs bg-slate-800 text-slate-400 rounded-lg hover:bg-slate-700 hover:text-slate-300 transition-colors"
                                >
                                    📁 列出文件
                                </button>
                                <button
                                    onClick={() => setInputValue('帮我查看系统信息')}
                                    className="px-3 py-1 text-xs bg-slate-800 text-slate-400 rounded-lg hover:bg-slate-700 hover:text-slate-300 transition-colors"
                                >
                                    💻 系统信息
                                </button>
                                <button
                                    onClick={() => setInputValue('帮我写一个 Python 脚本打印 Hello World')}
                                    className="px-3 py-1 text-xs bg-slate-800 text-slate-400 rounded-lg hover:bg-slate-700 hover:text-slate-300 transition-colors"
                                >
                                    🐍 Python 脚本
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'vm' && (
                    <div className="h-full p-6">
                        <div className="max-w-2xl mx-auto">
                            <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
                                <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
                                    <h3 className="text-lg font-semibold text-white">虚拟机状态</h3>
                                    <button
                                        onClick={refreshVmStatus}
                                        className="px-3 py-1 text-sm bg-slate-800 text-slate-400 rounded-lg hover:bg-slate-700 transition-colors"
                                    >
                                        🔄 刷新
                                    </button>
                                </div>
                                <div className="p-6">
                                    {vmStatus ? (
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3">
                                                <span className={`w-3 h-3 rounded-full ${
                                                    vmStatus.status === 'RUNNING' ? 'bg-green-500' :
                                                    vmStatus.status === 'STOPPED' ? 'bg-red-500' :
                                                    'bg-yellow-500'
                                                }`} />
                                                <span className="text-white font-medium">{vmStatus.status}</span>
                                            </div>
                                            {vmStatus.vmId && (
                                                <div className="text-sm text-slate-400">
                                                    VM ID: <span className="text-slate-300 font-mono">{vmStatus.vmId}</span>
                                                </div>
                                            )}
                                            {vmStatus.cpuUsage !== undefined && (
                                                <div className="space-y-2">
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-slate-400">CPU 使用率</span>
                                                        <span className="text-slate-300">{vmStatus.cpuUsage}%</span>
                                                    </div>
                                                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                                        <div 
                                                            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all"
                                                            style={{ width: `${vmStatus.cpuUsage}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                            {vmStatus.memoryUsage !== undefined && (
                                                <div className="space-y-2">
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-slate-400">内存使用率</span>
                                                        <span className="text-slate-300">{vmStatus.memoryUsage}%</span>
                                                    </div>
                                                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                                        <div 
                                                            className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all"
                                                            style={{ width: `${vmStatus.memoryUsage}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 text-slate-500">
                                            <div className="text-4xl mb-3">🖥️</div>
                                            <p>暂无虚拟机运行</p>
                                            <p className="text-sm mt-1">发送需要 Computer-Use 的任务后将自动创建</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* 功能说明 */}
                            <div className="mt-6 bg-slate-900/50 rounded-2xl border border-slate-800 p-6">
                                <h4 className="text-white font-medium mb-4">🚀 Mentis 功能说明</h4>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div className="flex items-start gap-3">
                                        <span className="text-2xl">⌨️</span>
                                        <div>
                                            <div className="text-white font-medium">命令执行</div>
                                            <div className="text-slate-400">执行系统命令并返回结果</div>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <span className="text-2xl">📝</span>
                                        <div>
                                            <div className="text-white font-medium">脚本运行</div>
                                            <div className="text-slate-400">支持 Python、JavaScript 等</div>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <span className="text-2xl">🖱️</span>
                                        <div>
                                            <div className="text-white font-medium">GUI 自动化</div>
                                            <div className="text-slate-400">模拟鼠标键盘操作</div>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <span className="text-2xl">🔄</span>
                                        <div>
                                            <div className="text-white font-medium">任务分解</div>
                                            <div className="text-slate-400">复杂任务自动拆分执行</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'tasks' && (
                    <div className="h-full p-6">
                        <div className="max-w-4xl mx-auto">
                            <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
                                <div className="px-6 py-4 border-b border-slate-800">
                                    <h3 className="text-lg font-semibold text-white">任务历史</h3>
                                </div>
                                <div className="p-6">
                                    <div className="text-center py-12 text-slate-500">
                                        <div className="text-4xl mb-3">📋</div>
                                        <p>暂无任务记录</p>
                                        <p className="text-sm mt-1">发送消息后将显示任务执行历史</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MentisExperience;
