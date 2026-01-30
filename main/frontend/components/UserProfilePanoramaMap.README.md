# 用户画像全景地图组件

一个具有未来科技感的用户画像全景地图可视化组件，基于 React + TypeScript + Framer Motion 构建。

## 功能特性

✨ **科技感设计**
- 深色主题背景，渐变色彩
- 动态网格和粒子效果
- 发光边框和阴影效果
- 流畅的动画过渡

📊 **数据可视化**
- 关键指标展示（行程量、消费次数等）
- 传统属性信息（用户基础信息、消费记录）
- 相关实体信息（飞机、机场、地图路线）
- 行为认知计算结果（偏好标签、出行意图）
- 实时行程阶段识别（进度条、饼图分析）
- 出行需求及场景预测（仪表盘可视化）

🎨 **交互体验**
- Framer Motion 动画效果
- 悬停状态反馈
- 响应式布局设计
- 实时时间显示

## 文件结构

```
UserProfilePanoramaMap.tsx          # 主组件
UserProfilePanoramaMap.css          # 样式文件
UserProfilePanoramaMap.example.ts    # 示例数据
UserProfilePanoramaMap.demo.tsx      # 演示组件
```

## 使用方法

### 基础使用

```tsx
import { UserProfilePanoramaMap } from './components/UserProfilePanoramaMap';
import { exampleUserProfileData } from './components/UserProfilePanoramaMap.example';

function App() {
  return (
    <UserProfilePanoramaMap 
      data={exampleUserProfileData}
      title="用户画像全景地图"
    />
  );
}
```

### 使用自定义数据

```tsx
import { UserProfilePanoramaMap } from './components/UserProfilePanoramaMap';
import type { UserProfilePanoramaData } from './components/UserProfilePanoramaMap';

const customData: UserProfilePanoramaData = {
  tripsLastYear: 100,
  consumptionCountLastYear: 20,
  futureTrips: 5,
  // ... 其他数据
};

function App() {
  return (
    <UserProfilePanoramaMap 
      data={customData}
      title="我的用户画像"
    />
  );
}
```

### 快速演示

```tsx
import { UserProfilePanoramaMapDemo } from './components/UserProfilePanoramaMap.demo';

function App() {
  return <UserProfilePanoramaMapDemo />;
}
```

## 数据接口

### UserProfilePanoramaData

```typescript
interface UserProfilePanoramaData {
  // 关键指标
  tripsLastYear: number;
  consumptionCountLastYear: number;
  futureTrips: number;
  
  // 传统属性
  basicInfo: UserBasicInfo;
  consumptionRecords: ConsumptionRecord[];
  
  // 相关实体
  aircraftInfo: AircraftInfo;
  airports: AirportInfo[];
  permanentResidence: string;
  flightRoutes: Array<{ from: string; to: string; count: number }>;
  
  // 行为认知
  preferenceTags: PreferenceTag[];
  travelIntent: TravelIntent;
  
  // 实时行程
  itineraryStages: ItineraryStage[];
  
  // 需求预测
  demandPredictions: DemandPrediction[];
}
```

详细类型定义请参考 `UserProfilePanoramaMap.tsx` 文件。

## 样式定制

组件使用 CSS 模块化样式，可以通过以下方式自定义：

1. **修改 CSS 变量**：在 `UserProfilePanoramaMap.css` 中调整颜色、间距等
2. **覆盖样式**：通过 className 或 style 属性覆盖默认样式
3. **主题切换**：修改 CSS 中的颜色值实现主题切换

## 响应式设计

组件支持多种屏幕尺寸：
- **桌面端** (>1400px)：完整网格布局
- **平板端** (1024px-1400px)：2列布局
- **移动端** (<1024px)：单列布局

## 依赖项

- `react` - React 框架
- `framer-motion` - 动画库
- CSS3 - 样式和动画

## 浏览器支持

- Chrome (最新版本)
- Firefox (最新版本)
- Safari (最新版本)
- Edge (最新版本)

## 注意事项

1. 确保已安装 `framer-motion` 依赖
2. CSS 文件需要与组件文件在同一目录
3. 地图 SVG 路径需要根据实际需求调整
4. 饼图和仪表盘的计算基于百分比数据

## 性能优化建议

1. 大数据量时考虑虚拟滚动
2. 动画数量较多时可减少动画复杂度
3. 使用 React.memo 优化组件渲染

## 示例数据

查看 `UserProfilePanoramaMap.example.ts` 获取完整示例数据。

## License

MIT
