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
        className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all duration-200 ${
          isFocused
            ? 'border-blue-500 bg-white/15 shadow-lg'
            : 'border-white/20 bg-white/10'
        }`}
      >
        {/* 搜索图标 */}
        <svg
          className="w-5 h-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
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
          className="flex-1 bg-transparent text-white placeholder-gray-400 outline-none text-sm"
        />
        
        {/* 清除按钮 */}
        {value && (
          <button
            onClick={handleClear}
            className="text-gray-400 hover:text-white transition-colors"
            type="button"
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

