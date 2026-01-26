import React, { useState, useEffect, useRef } from 'react';

interface SearchBoxProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onClear?: () => void;
}

/**
 * 搜索框组件
 */
export const SearchBox: React.FC<SearchBoxProps> = ({
  value,
  onChange,
  placeholder = '搜索 E-SOUL...',
  onClear,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // 防抖处理
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    
    // 清除之前的定时器
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    // 设置新的定时器（300ms防抖）
    debounceTimerRef.current = setTimeout(() => {
      onChange(newValue);
    }, 300);
  };
  
  const handleClear = () => {
    if (inputRef.current) {
      inputRef.current.value = '';
    }
    onChange('');
    if (onClear) {
      onClear();
    }
  };
  
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);
  
  return (
    <div className="relative w-full">
      <div
        className="flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all duration-200"
        style={{
          borderColor: isFocused 
            ? 'var(--color-primary, #3b82f6)' 
            : 'var(--bg-overlay, rgba(255, 255, 255, 0.2))',
          backgroundColor: isFocused 
            ? 'var(--bg-overlay, rgba(255, 255, 255, 0.15))' 
            : 'var(--bg-overlay, rgba(255, 255, 255, 0.1))',
          boxShadow: isFocused ? 'var(--shadow-lg, 0 8px 24px rgba(0, 0, 0, 0.5))' : 'none',
        }}
      >
        {/* 搜索图标 */}
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          style={{ color: 'var(--text-tertiary)' }}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        
        {/* 输入框 */}
        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          onChange={handleInputChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="flex-1 bg-transparent outline-none text-sm"
          style={{
            color: 'var(--text-primary)',
          }}
        />
        
        {/* 清除按钮 */}
        {value && (
          <button
            onClick={handleClear}
            className="transition-colors"
            style={{ color: 'var(--text-tertiary)' }}
            type="button"
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--text-primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--text-tertiary)';
            }}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};




