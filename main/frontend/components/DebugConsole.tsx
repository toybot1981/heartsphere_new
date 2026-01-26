
import React, { useState, useEffect, useRef } from 'react';
import { DebugLog } from '../types';

interface DebugConsoleProps {
  logs: DebugLog[];
  onClear: () => void;
  onClose: () => void;
}

export const DebugConsole: React.FC<DebugConsoleProps> = ({ logs, onClear, onClose }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    if (autoScroll && !isMinimized && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, autoScroll, isMinimized]);

  return (
    <div 
      className="fixed bottom-0 left-0 w-full z-[100] flex flex-col font-mono text-xs backdrop-blur-md transition-all duration-300 ease-in-out border-t"
      style={{
        boxShadow: '0 -5px 20px rgba(0, 0, 0, 0.8)',
        borderTopColor: 'var(--color-success, rgba(34, 197, 94, 0.3))',
        height: isMinimized ? '36px' : '33.333333%',
        minHeight: isMinimized ? undefined : '300px',
        backgroundColor: isMinimized 
          ? 'var(--bg-card, rgba(0, 0, 0, 0.8))'
          : 'var(--bg-card, rgba(0, 0, 0, 0.9))',
      }}
    >
      {/* Header - Click to Toggle */}
      <div 
        className="flex justify-between items-center px-4 h-9 border-b cursor-pointer transition-colors select-none"
        style={{
          backgroundColor: 'var(--bg-secondary, rgba(17, 24, 39, 0.9))',
          borderBottomColor: 'var(--border-color-overlay, #374151)',
        }}
        onClick={() => setIsMinimized(!isMinimized)}
        title={isMinimized ? "点击展开日志" : "点击折叠日志"}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--bg-secondary, rgba(31, 41, 55, 1))';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--bg-secondary, rgba(17, 24, 39, 0.9))';
        }}
      >
        <div className="flex items-center gap-3">
          <button 
            className="focus:outline-none transition-colors"
            style={{ color: 'var(--text-tertiary)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--text-primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--text-tertiary)';
            }}
          >
            {isMinimized ? '▲' : '▼'}
          </button>
          <div className="flex items-center gap-2">
            <span 
              className="font-bold animate-pulse"
              style={{
                color: logs.some(l => l.type === 'error')
                  ? 'var(--color-error, #ef4444)'
                  : 'var(--color-success, #22c55e)',
              }}
            >
              ● MATRIX DEBUGGER
            </span>
            <span style={{ color: 'var(--text-disabled)' }}>|</span>
            <span style={{ color: 'var(--text-tertiary)' }}>{logs.length} events</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4" onClick={(e) => e.stopPropagation()}>
           {!isMinimized && (
              <label 
                className="flex items-center gap-2 cursor-pointer select-none hidden sm:flex transition-colors"
                style={{ color: 'var(--text-tertiary)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'var(--text-primary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--text-tertiary)';
                }}
              >
                <input 
                  type="checkbox" 
                  checked={autoScroll} 
                  onChange={e => setAutoScroll(e.target.checked)} 
                  className="rounded focus:ring-0"
                  style={{
                    backgroundColor: 'var(--bg-secondary, #374151)',
                    borderColor: 'var(--border-color-overlay, #4b5563)',
                    accentColor: 'var(--color-success, #22c55e)',
                  }}
                />
                Auto-scroll
              </label>
           )}
           <div className="flex items-center gap-2">
              <button 
                onClick={onClear} 
                className="font-bold px-2 py-0.5 rounded text-[10px] border transition-colors"
                style={{
                  color: 'var(--color-warning, #fbbf24)',
                  borderColor: 'var(--color-warning, rgba(251, 191, 36, 0.3))',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'var(--color-warning, #facc15)';
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--color-warning, #fbbf24)';
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                CLEAR
              </button>
              <button 
                onClick={onClose} 
                className="font-bold ml-2 px-2 py-0.5 rounded text-[10px] border transition-colors"
                style={{
                  color: 'var(--color-error, #ef4444)',
                  borderColor: 'var(--color-error, rgba(239, 68, 68, 0.3))',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'var(--color-error, #f87171)';
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--color-error, #ef4444)';
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                CLOSE
              </button>
           </div>
        </div>
      </div>

      {/* Logs Area */}
      {!isMinimized && (
        <div 
          ref={scrollRef} 
          className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-hide"
          style={{ backgroundColor: 'var(--bg-overlay, rgba(0, 0, 0, 0.5))' }}
        >
          {logs.length === 0 && (
            <div 
              className="text-center mt-10 italic flex flex-col items-center gap-2"
              style={{ color: 'var(--text-disabled)' }}
            >
                <div 
                  className="w-2 h-2 rounded-full animate-ping"
                  style={{ backgroundColor: 'var(--color-success, #22c55e)' }}
                />
                Waiting for neural signals...
            </div>
          )}
          {logs.map((log) => (
            <div 
              key={log.id} 
              className="border-l-2 pl-3 py-1 font-mono text-xs break-all transition-colors rounded-r group"
              style={{ 
                borderColor: log.type === 'error' 
                  ? 'var(--color-error, #ef4444)' 
                  : log.type === 'request' 
                  ? 'var(--color-info, #3b82f6)' 
                  : 'var(--color-success, #22c55e)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
               <div 
                 className="flex gap-2 text-[10px] mb-0.5 items-center flex-wrap"
                 style={{ opacity: 0.7 }}
               >
                  <span 
                    className="font-light"
                    style={{ color: 'var(--text-disabled)' }}
                  >
                    [{new Date(log.timestamp).toLocaleTimeString([], {hour12: false, hour:'2-digit', minute:'2-digit', second:'2-digit', fractionalSecondDigits: 3} as any)}]
                  </span>
                  <span 
                    className="font-bold uppercase tracking-wider"
                    style={{
                      color: log.type === 'error' 
                        ? 'var(--color-error, #ef4444)' 
                        : log.type === 'request' 
                        ? 'var(--color-info, #60a5fa)' 
                        : 'var(--color-success, #4ade80)',
                    }}
                  >
                    {log.type}
                  </span>
                  
                  {/* Provider & Model Badge */}
                  <span 
                    className="px-1.5 py-0.5 rounded border flex items-center gap-1"
                    style={{
                      color: 'var(--color-primary, #c084fc)',
                      backgroundColor: 'var(--color-primary, rgba(168, 85, 247, 0.2))',
                      borderColor: 'var(--color-primary, rgba(168, 85, 247, 0.2))',
                    }}
                  >
                      <span>@{log.provider}</span>
                      {log.model && (
                        <span style={{ opacity: 0.7 }}>/ {log.model}</span>
                      )}
                  </span>

                  <span 
                    className="font-semibold"
                    style={{ color: 'var(--color-warning, rgba(254, 240, 138, 0.8))' }}
                  >
                    ::{log.method}
                  </span>
               </div>
               
               <div 
                 className="whitespace-pre-wrap pl-1 mt-1"
                 style={{ color: 'var(--text-secondary)' }}
               >
                  {typeof log.data === 'string' ? log.data : (
                      <details>
                          <summary 
                            className="cursor-pointer select-none outline-none text-[10px] flex items-center gap-1 transition-colors"
                            style={{ color: 'var(--text-disabled)' }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.color = 'var(--text-secondary)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.color = 'var(--text-disabled)';
                            }}
                          >
                             <span style={{ opacity: 0.5 }}>▶</span> {log.type === 'request' ? 'View Payload' : 'View Response Data'}
                          </summary>
                          <pre 
                            className="mt-2 text-[10px] p-3 rounded-lg border overflow-x-auto max-h-60 custom-scrollbar shadow-inner"
                            style={{
                              backgroundColor: 'var(--bg-secondary, #030712)',
                              borderColor: 'var(--border-color-overlay, #1f2937)',
                              color: 'var(--color-success, rgba(74, 222, 128, 0.9))',
                            }}
                          >
                              {JSON.stringify(log.data, null, 2)}
                          </pre>
                      </details>
                  )}
               </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
