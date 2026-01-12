# Change: Enhance Company Website Tech Style

## Why

当前公司官网虽然已经完成了扁平化设计和UX优化，但在以下方面仍有改进空间：
1. **科技感不足**：页面整体风格需要更强的科技感，以更好地体现公司作为AI技术公司的形象
2. **布局问题**：核心产品页面最下方内容被遮挡，影响用户体验
3. **缺少产品链接**：需要添加心域网站（http://heartsphere.cn）的链接，方便用户直接访问产品

### 问题现状

1. **科技感不足**：
   - 当前设计过于扁平，缺少科技感的视觉元素
   - 缺少科技感的装饰性元素和动效
   - 配色和视觉层次可以更突出科技属性

2. **布局问题**：
   - 核心产品页面底部内容可能被Footer遮挡
   - 页面间距和底部留白需要优化

3. **产品链接缺失**：
   - Footer和产品页面缺少心域网站的直达链接
   - 用户无法快速访问实际产品

## What Changes

- **增强科技感**：添加科技感的视觉元素、渐变效果、微动效
- **修复布局问题**：调整核心产品页面的底部间距，确保内容不被遮挡
- **添加产品链接**：在Footer和产品相关页面添加心域网站链接（http://heartsphere.cn）

## Impact

- **Affected specs**: `company-website` (修改现有需求，增强科技感和修复布局)
- **Affected code**:
  - `frontend/components/company/` - 添加科技感元素
  - `frontend/pages/company/ProductPage.tsx` - 修复底部布局
  - `frontend/components/company/Footer.tsx` - 添加心域网站链接
  - `frontend/components/company/ProductShowcase.tsx` - 添加产品链接
  - `frontend/components/company/ProductHighlights.tsx` - 添加产品链接
- **Migration plan**: 渐进式改进，不影响现有功能

## Dependencies

- 依赖 `optimize-company-website-ux-complete` 已完成的基础UX优化
- 依赖 `redesign-company-website-flat-style` 已完成的扁平化设计