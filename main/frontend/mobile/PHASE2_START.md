# 第二阶段启动说明

## 当前状态

### ✅ 第一阶段完成
- 目录结构完善
- 路由映射系统就绪
- 类型定义完整
- Props构建器和渲染辅助函数已创建

### 🔄 第二阶段开始
- 应用新架构到MobileApp.tsx
- 完善Screen组件功能
- 创建缺失的Modal组件

## 实施策略

由于MobileApp.tsx文件很大（1255行），包含复杂的业务逻辑，采用**渐进式重构**策略：

### 策略1：保留现有逻辑，逐步替换（推荐）
1. 先创建handlers和computed对象的组织函数
2. 保留现有的if判断，但使用handlers对象
3. 逐步替换为使用renderCurrentScreen
4. 确保每一步都功能正常

### 策略2：直接替换（更快但有风险）
1. 一次性创建完整的handlers和computed对象
2. 直接使用renderCurrentScreen替换所有if判断
3. 测试所有功能

**建议采用策略1**，更安全可靠。

## 当前问题

1. **buildScreenProps.ts的handlers接口可能不够完整**
   - 某些Screen可能需要额外的handlers
   - 需要根据实际使用情况调整

2. **MobileApp.tsx中的handlers分散在多个地方**
   - 需要收集和组织所有handlers
   - 需要确保所有依赖关系正确

3. **computed数据的计算时机**
   - allScenes, currentScene等需要在渲染前计算
   - 需要确保计算逻辑正确

## 下一步行动

### 立即执行
1. ✅ 在MobileApp.tsx中导入renderCurrentScreen（已完成）
2. ⏳ 创建handlers对象组织代码
3. ⏳ 创建computed对象
4. ⏳ 逐步替换渲染逻辑

### 后续执行
1. 完善Screen组件功能
2. 创建缺失的Modal组件
3. 测试和验证

---

**更新时间**：2025-01-02
**当前阶段**：第二阶段 - 功能完善（进行中）
