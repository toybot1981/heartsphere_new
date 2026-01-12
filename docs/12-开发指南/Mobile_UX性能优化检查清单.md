# Mobile UX性能优化检查清单

**创建日期**: 2025-01-08  
**版本**: 1.0  
**适用对象**: 所有Mobile页面和组件开发

---

## 📋 概述

本检查清单用于确保Mobile应用达到很高的性能水平，包括滚动性能、加载性能、渲染性能等。

## 🎯 性能指标

### 核心指标
- **首屏加载时间**: < 1.5s (First Contentful Paint)
- **可交互时间**: < 3s (Time to Interactive)
- **滚动帧率**: 60fps
- **内存使用**: 合理范围内（无内存泄漏）

### 推荐指标
- **Largest Contentful Paint (LCP)**: < 2.5s
- **First Input Delay (FID)**: < 100ms
- **Cumulative Layout Shift (CLS)**: < 0.1

## ✅ 滚动性能优化

### 检查项
- [ ] 使用 `MobileSmoothScroll` 组件进行滚动容器
- [ ] 添加 `will-change: scroll-position` 提示浏览器优化
- [ ] 使用 `transform: translateZ(0)` 启用GPU加速
- [ ] 使用 `WebkitOverflowScrolling: touch` 启用iOS平滑滚动
- [ ] 避免在滚动时执行复杂计算
- [ ] 使用防抖（debounce）和节流（throttle）优化滚动事件处理

### 实现示例
```tsx
// ✅ 正确：使用MobileSmoothScroll组件
<MobileSmoothScroll className="flex-1">
  {/* 内容 */}
</MobileSmoothScroll>

// ✅ 正确：使用CSS优化滚动性能
style={{
  WebkitOverflowScrolling: 'touch',
  scrollBehavior: 'smooth',
  willChange: 'scroll-position',
  transform: 'translateZ(0)', // GPU加速
}}

// ❌ 错误：没有优化滚动性能
<div className="overflow-y-auto">
  {/* 内容 */}
</div>
```

## ✅ 图片加载优化

### 检查项
- [ ] 使用 `MobileLazyImage` 组件进行图片懒加载
- [ ] 图片使用WebP格式（如果支持）
- [ ] 使用响应式图片（srcset）
- [ ] 使用骨架屏（`MobileSkeleton`）作为占位符
- [ ] 图片有适当的alt文本
- [ ] 图片加载失败时有回退处理

### 实现示例
```tsx
// ✅ 正确：使用MobileLazyImage和骨架屏
{isLoading ? (
  <MobileSkeleton variant="image" />
) : (
  <MobileLazyImage
    src={imageUrl}
    alt="描述"
    enableWebP={true}
    enableResponsive={true}
  />
)}

// ❌ 错误：直接使用img标签
<img src={imageUrl} alt="描述" />
```

## ✅ 渲染性能优化

### 检查项
- [ ] 使用 `React.memo` 优化组件渲染
- [ ] 使用 `useMemo` 缓存计算结果
- [ ] 使用 `useCallback` 缓存回调函数
- [ ] 避免在render方法中创建新对象/数组
- [ ] 避免在render方法中执行复杂计算
- [ ] 使用 `key` 属性优化列表渲染
- [ ] 对于长列表，考虑使用虚拟滚动

### 实现示例
```tsx
// ✅ 正确：使用React.memo优化组件
export const MobileTouchableButton: React.FC<MobileTouchableButtonProps> = memo(({
  variant = 'primary',
  size = 'md',
  ...props
}) => {
  // 组件实现
});

// ✅ 正确：使用useMemo缓存计算结果
const filteredItems = useMemo(() => {
  return items.filter(item => item.visible);
}, [items]);

// ✅ 正确：使用useCallback缓存回调函数
const handleClick = useCallback(() => {
  // 处理点击
}, [dependencies]);

// ❌ 错误：没有优化渲染性能
export const MyComponent = ({ items }) => {
  const filtered = items.filter(item => item.visible); // 每次渲染都重新计算
  return <div>{filtered.map(...)}</div>;
};
```

## ✅ 首屏加载优化

### 检查项
- [ ] 使用代码分割（React.lazy、Suspense）
- [ ] 使用资源预加载（preload、prefetch）
- [ ] 优化关键CSS（Critical CSS）
- [ ] 减少初始JavaScript bundle大小
- [ ] 使用骨架屏提升感知性能
- [ ] 避免阻塞渲染的资源

### 实现示例
```tsx
// ✅ 正确：使用懒加载
const MobileChatWindowScreen = React.lazy(() => import('./screens/MobileChatWindowScreen'));

<Suspense fallback={<MobileLoadingSpinner />}>
  <MobileChatWindowScreen {...props} />
</Suspense>

// ✅ 正确：使用骨架屏
{isLoading ? (
  <MobileSceneCardSkeleton />
) : (
  <SceneCard scene={scene} />
)}
```

## ✅ 列表渲染优化

### 检查项
- [ ] 对于长列表（100+项），考虑使用虚拟滚动
- [ ] 使用 `key` 属性优化列表渲染
- [ ] 使用 `React.memo` 优化列表项组件
- [ ] 避免在列表项中创建新对象/数组
- [ ] 使用防抖和节流优化列表滚动事件

### 实现示例
```tsx
// ✅ 正确：使用React.memo优化列表项
const ListItem = memo(({ item }) => {
  return <div>{item.name}</div>;
});

// ✅ 正确：使用key属性
{items.map(item => (
  <ListItem key={item.id} item={item} />
))}

// ❌ 错误：使用index作为key（不推荐）
{items.map((item, index) => (
  <ListItem key={index} item={item} />
))}
```

## ✅ 动画性能优化

### 检查项
- [ ] 使用CSS动画而非JavaScript动画
- [ ] 使用 `transform` 和 `opacity` 进行动画（GPU加速）
- [ ] 避免动画 `width`、`height`、`top`、`left` 等属性
- [ ] 使用 `will-change` 提示浏览器优化
- [ ] 避免在动画期间执行复杂计算

### 实现示例
```tsx
// ✅ 正确：使用CSS动画和transform
<div className="transition-transform duration-200 ease-out active:scale-95">
  {/* 内容 */}
</div>

// ✅ 正确：使用will-change提示浏览器
style={{
  willChange: 'transform',
  transform: 'translateZ(0)',
}}

// ❌ 错误：使用JavaScript动画
<div style={{ left: animatedLeft }} />
```

## ✅ 内存管理优化

### 检查项
- [ ] 清理事件监听器（useEffect cleanup）
- [ ] 清理定时器（setTimeout、setInterval）
- [ ] 清理订阅（subscriptions）
- [ ] 避免内存泄漏（circular references）
- [ ] 使用WeakMap/WeakSet存储弱引用
- [ ] 避免在全局作用域存储大量数据

### 实现示例
```tsx
// ✅ 正确：清理事件监听器
useEffect(() => {
  const handleResize = () => {
    // 处理resize
  };
  window.addEventListener('resize', handleResize);
  return () => {
    window.removeEventListener('resize', handleResize);
  };
}, []);

// ✅ 正确：清理定时器
useEffect(() => {
  const timer = setTimeout(() => {
    // 处理
  }, 1000);
  return () => {
    clearTimeout(timer);
  };
}, []);
```

## ✅ 网络请求优化

### 检查项
- [ ] 使用请求去重（deduplication）
- [ ] 使用请求缓存（caching）
- [ ] 使用请求取消（cancellation）
- [ ] 避免重复请求
- [ ] 使用请求合并（batching）
- [ ] 优化请求时机（延迟、预加载）

### 实现示例
```tsx
// ✅ 正确：使用请求缓存
const cachedData = useMemo(() => {
  return api.getData();
}, [dependencies]);

// ✅ 正确：取消请求
useEffect(() => {
  const controller = new AbortController();
  fetch(url, { signal: controller.signal });
  return () => {
    controller.abort();
  };
}, []);
```

## ✅ 性能监控

### 检查项
- [ ] 添加性能监控代码（FPS、加载时间、交互延迟）
- [ ] 使用Performance API监控性能指标
- [ ] 记录性能数据到日志或监控系统
- [ ] 定期进行性能测试
- [ ] 使用Chrome DevTools进行性能分析
- [ ] 使用Lighthouse进行性能评分

### 实现示例
```tsx
// ✅ 正确：监控FPS
const measureFPS = () => {
  let lastTime = performance.now();
  let frames = 0;
  const tick = () => {
    frames++;
    const currentTime = performance.now();
    if (currentTime >= lastTime + 1000) {
      const fps = Math.round((frames * 1000) / (currentTime - lastTime));
      console.log('FPS:', fps);
      frames = 0;
      lastTime = currentTime;
    }
    requestAnimationFrame(tick);
  };
  tick();
};

// ✅ 正确：监控加载时间
const measureLoadTime = () => {
  const perfData = performance.timing;
  const loadTime = perfData.loadEventEnd - perfData.navigationStart;
  console.log('Load Time:', loadTime);
};
```

## 📊 性能检查清单总结

### 必须项
- [ ] 滚动性能保持60fps
- [ ] 首屏加载时间 < 1.5s
- [ ] 可交互时间 < 3s
- [ ] 使用懒加载和骨架屏
- [ ] 使用React.memo优化组件渲染
- [ ] 清理事件监听器和定时器

### 推荐项
- [ ] LCP < 2.5s
- [ ] FID < 100ms
- [ ] CLS < 0.1
- [ ] 使用虚拟滚动优化长列表
- [ ] 添加性能监控代码
- [ ] 定期进行性能测试

## 📚 参考文档

- **Mobile UX设计规范**: `docs/12-开发指南/开发规范/心域开发指南.md` 第3.5.9.7节（性能标准）
- **Mobile组件库使用指南**: `docs/12-开发指南/Mobile组件库使用指南.md`
- **React性能优化**: [React性能优化文档](https://react.dev/learn/render-and-commit)
- **Web性能最佳实践**: [Web.dev性能指南](https://web.dev/performance/)

---

**最后更新**: 2025-01-08  
**维护者**: HeartSphere开发团队
