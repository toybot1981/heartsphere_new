/**
 * 主题测试页面
 * 用于快速测试主题切换和组件在不同主题下的表现
 */

import React, { useState } from 'react';
import { useTheme } from '../hooks/useTheme';
import { Button } from './Button';
import { MobileTouchableButton } from '../mobile/components/MobileTouchableButton';
import { MobileFormField } from '../mobile/components/MobileFormField';

/**
 * 主题测试页面组件
 */
export const ThemeTestPage: React.FC = () => {
  const { currentTheme, themes, setTheme, themeId } = useTheme();
  const [inputValue, setInputValue] = useState('');
  const [textareaValue, setTextareaValue] = useState('');

  return (
    <div className="min-h-screen p-8" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* 头部 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
            主题测试页面
          </h1>
          <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
            测试组件在不同主题下的表现
          </p>
        </div>

        {/* 主题选择器 */}
        <div className="bg-card rounded-lg p-6 border" style={{ 
          backgroundColor: 'var(--bg-card)',
          borderColor: 'var(--border-color-overlay)',
        }}>
          <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
            主题选择
          </h2>
          <div className="flex gap-4">
            {themes.map((theme) => (
              <button
                key={theme.id}
                onClick={() => setTheme(theme.id)}
                className={`px-6 py-3 rounded-lg border-2 transition-all ${
                  themeId === theme.id ? 'border-[var(--color-primary)]' : 'border-[var(--border-color-overlay)]'
                }`}
                style={{
                  backgroundColor: themeId === theme.id ? 'var(--bg-hover)' : 'var(--bg-secondary)',
                }}
              >
                <span style={{ color: 'var(--text-primary)' }}>{theme.name}</span>
              </button>
            ))}
          </div>
          <div className="mt-4 text-sm" style={{ color: 'var(--text-tertiary)' }}>
            当前主题: {currentTheme.name} ({currentTheme.id})
          </div>
        </div>

        {/* 颜色展示 */}
        <div className="bg-card rounded-lg p-6 border" style={{ 
          backgroundColor: 'var(--bg-card)',
          borderColor: 'var(--border-color-overlay)',
        }}>
          <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
            颜色变量展示
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <ColorSwatch name="主背景" varName="--bg-primary" />
            <ColorSwatch name="次要背景" varName="--bg-secondary" />
            <ColorSwatch name="卡片背景" varName="--bg-card" />
            <ColorSwatch name="主文字" varName="--text-primary" />
            <ColorSwatch name="次要文字" varName="--text-secondary" />
            <ColorSwatch name="第三级文字" varName="--text-tertiary" />
            <ColorSwatch name="主色" varName="--color-primary" />
            <ColorSwatch name="成功色" varName="--color-success" />
            <ColorSwatch name="警告色" varName="--color-warning" />
            <ColorSwatch name="错误色" varName="--color-error" />
            <ColorSwatch name="信息色" varName="--color-info" />
          </div>
        </div>

        {/* 按钮测试 */}
        <div className="bg-card rounded-lg p-6 border" style={{ 
          backgroundColor: 'var(--bg-card)',
          borderColor: 'var(--border-color-overlay)',
        }}>
          <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
            按钮组件测试
          </h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg mb-2" style={{ color: 'var(--text-secondary)' }}>PC 端按钮</h3>
              <div className="flex gap-4 flex-wrap">
                <Button variant="primary">Primary 按钮</Button>
                <Button variant="secondary">Secondary 按钮</Button>
                <Button variant="ghost">Ghost 按钮</Button>
              </div>
            </div>
            <div>
              <h3 className="text-lg mb-2" style={{ color: 'var(--text-secondary)' }}>移动端按钮</h3>
              <div className="flex gap-4 flex-wrap">
                <MobileTouchableButton variant="primary">Primary</MobileTouchableButton>
                <MobileTouchableButton variant="secondary">Secondary</MobileTouchableButton>
                <MobileTouchableButton variant="outline">Outline</MobileTouchableButton>
                <MobileTouchableButton variant="ghost">Ghost</MobileTouchableButton>
                <MobileTouchableButton variant="danger">Danger</MobileTouchableButton>
              </div>
            </div>
          </div>
        </div>

        {/* 卡片测试 */}
        <div className="bg-card rounded-lg p-6 border" style={{ 
          backgroundColor: 'var(--bg-card)',
          borderColor: 'var(--border-color-overlay)',
        }}>
          <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
            卡片组件测试
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <TestCard title="卡片 1" description="这是一个测试卡片" />
            <TestCard title="卡片 2" description="用于测试主题颜色" />
            <TestCard title="卡片 3" description="检查文字对比度" />
          </div>
        </div>

        {/* 输入框测试 */}
        <div className="bg-card rounded-lg p-6 border" style={{ 
          backgroundColor: 'var(--bg-card)',
          borderColor: 'var(--border-color-overlay)',
        }}>
          <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
            输入框组件测试
          </h2>
          <div className="space-y-4">
            <MobileFormField
              label="文本输入框"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="请输入文本"
            />
            <MobileFormField
              label="文本域"
              type="textarea"
              value={textareaValue}
              onChange={(e) => setTextareaValue(e.target.value)}
              placeholder="请输入多行文本"
              rows={4}
            />
          </div>
        </div>

        {/* 语义色测试 */}
        <div className="bg-card rounded-lg p-6 border" style={{ 
          backgroundColor: 'var(--bg-card)',
          borderColor: 'var(--border-color-overlay)',
        }}>
          <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
            语义色测试
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <SemanticBadge type="success" label="成功" />
            <SemanticBadge type="warning" label="警告" />
            <SemanticBadge type="error" label="错误" />
            <SemanticBadge type="info" label="信息" />
          </div>
        </div>

        {/* 测试工具提示 */}
        <div className="bg-card rounded-lg p-6 border" style={{ 
          backgroundColor: 'var(--bg-card)',
          borderColor: 'var(--border-color-overlay)',
        }}>
          <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
            测试工具
          </h2>
          <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>
            打开浏览器控制台，运行以下命令进行自动化测试：
          </p>
          <div className="bg-secondary rounded p-4 font-mono text-sm" style={{ 
            backgroundColor: 'var(--bg-secondary)',
            color: 'var(--text-primary)',
          }}>
            <div className="mb-2">// 运行所有测试</div>
            <div className="mb-4">themeTestUtils.runAllTests()</div>
            <div className="mb-2">// 单独测试</div>
            <div className="mb-2">themeTestUtils.testThemeSwitching()</div>
            <div className="mb-2">themeTestUtils.checkCSSVariables()</div>
            <div className="mb-2">themeTestUtils.testThemeSwitchingPerformance()</div>
            <div>themeTestUtils.checkTextContrast()</div>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * 颜色样本组件
 */
const ColorSwatch: React.FC<{ name: string; varName: string }> = ({ name, varName }) => {
  const color = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
  
  return (
    <div className="space-y-2">
      <div
        className="w-full h-16 rounded border"
        style={{
          backgroundColor: color || '#000',
          borderColor: 'var(--border-color-overlay)',
        }}
      />
      <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
        <div className="font-semibold">{name}</div>
        <div className="font-mono text-xs opacity-70">{varName}</div>
        <div className="font-mono text-xs opacity-70">{color || '未定义'}</div>
      </div>
    </div>
  );
};

/**
 * 测试卡片组件
 */
const TestCard: React.FC<{ title: string; description: string }> = ({ title, description }) => {
  return (
    <div
      className="p-4 rounded-lg border"
      style={{
        backgroundColor: 'var(--bg-card)',
        borderColor: 'var(--border-color-overlay)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--bg-card)';
      }}
    >
      <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
        {title}
      </h3>
      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
        {description}
      </p>
    </div>
  );
};

/**
 * 语义色徽章组件
 */
const SemanticBadge: React.FC<{ type: 'success' | 'warning' | 'error' | 'info'; label: string }> = ({ type, label }) => {
  const colorMap = {
    success: {
      bg: 'var(--bg-success-alpha)',
      text: 'var(--color-success)',
      border: 'var(--border-success-alpha)',
    },
    warning: {
      bg: 'var(--bg-warning-alpha)',
      text: 'var(--color-warning)',
      border: 'var(--border-warning-alpha)',
    },
    error: {
      bg: 'var(--bg-error-alpha)',
      text: 'var(--color-error)',
      border: 'var(--border-error-alpha)',
    },
    info: {
      bg: 'var(--bg-info-alpha)',
      text: 'var(--color-info)',
      border: 'var(--border-info-alpha)',
    },
  };

  const colors = colorMap[type];

  return (
    <div
      className="p-4 rounded-lg border text-center"
      style={{
        backgroundColor: colors.bg,
        borderColor: colors.border,
        color: colors.text,
      }}
    >
      <div className="font-semibold">{label}</div>
    </div>
  );
};
