/**
 * 主题切换测试工具
 * 用于在浏览器控制台中执行主题测试
 */

/**
 * 测试主题切换功能
 */
export async function testThemeSwitching(): Promise<void> {
  console.log('🎨 开始主题切换测试...\n');
  
  const themes = ['tech', 'serene-horizon'];
  const results: Array<{ theme: string; success: boolean; error?: string }> = [];
  
  for (const theme of themes) {
    try {
      console.log(`📌 切换到主题: ${theme}`);
      
      // 应用主题
      document.documentElement.setAttribute('data-theme', theme);
      
      // 等待 CSS 应用
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // 验证主题已应用
      const currentTheme = document.documentElement.getAttribute('data-theme');
      if (currentTheme !== theme) {
        throw new Error(`主题未正确应用: 期望 ${theme}, 实际 ${currentTheme}`);
      }
      
      // 验证 CSS 变量
      const bgPrimary = getComputedStyle(document.documentElement)
        .getPropertyValue('--bg-primary').trim();
      const textPrimary = getComputedStyle(document.documentElement)
        .getPropertyValue('--text-primary').trim();
      
      if (!bgPrimary || !textPrimary) {
        throw new Error('CSS 变量未定义');
      }
      
      console.log(`  ✅ 主题应用成功`);
      console.log(`  📊 背景色: ${bgPrimary}`);
      console.log(`  📊 文字色: ${textPrimary}`);
      
      results.push({ theme, success: true });
    } catch (error: any) {
      console.error(`  ❌ 测试失败: ${error.message}`);
      results.push({ theme, success: false, error: error.message });
    }
    
    console.log('');
  }
  
  // 总结
  const successCount = results.filter(r => r.success).length;
  const totalCount = results.length;
  
  console.log('📊 测试总结:');
  console.log(`  通过: ${successCount}/${totalCount}`);
  
  if (successCount === totalCount) {
    console.log('✅ 所有主题切换测试通过！');
  } else {
    console.log('❌ 部分测试失败，请检查错误信息');
  }
  
  return;
}

/**
 * 检查颜色对比度（简化版，需要手动验证）
 */
export function checkTextContrast(): void {
  console.log('🔍 开始文字对比度检查...\n');
  
  const textElements = document.querySelectorAll('p, span, h1, h2, h3, h4, h5, h6, button, a, label');
  const issues: Array<{
    element: string;
    bgColor: string;
    textColor: string;
    warning: string;
  }> = [];
  
  textElements.forEach((el, index) => {
    if (index > 100) return; // 限制检查数量
    
    const style = getComputedStyle(el);
    const bgColor = style.backgroundColor;
    const textColor = style.color;
    
    // 检查是否为透明或无效颜色
    if (bgColor === 'rgba(0, 0, 0, 0)' || bgColor === 'transparent') {
      // 尝试获取父元素背景色
      const parent = el.parentElement;
      if (parent) {
        const parentStyle = getComputedStyle(parent);
        const parentBg = parentStyle.backgroundColor;
        if (parentBg && parentBg !== 'rgba(0, 0, 0, 0)' && parentBg !== 'transparent') {
          // 这里应该计算对比度，但需要颜色库
          // 简化处理：只记录信息
        }
      }
    }
    
    // 检查文字颜色是否为默认值（可能表示未使用主题变量）
    if (textColor === 'rgb(0, 0, 0)' || textColor === 'rgb(255, 255, 255)') {
      const className = el.className || '';
      const tagName = el.tagName.toLowerCase();
      
      // 跳过可能故意使用纯色的元素
      if (!className.includes('var(--') && !el.getAttribute('style')?.includes('var(--')) {
        issues.push({
          element: `${tagName}${className ? '.' + className.split(' ')[0] : ''}`,
          bgColor,
          textColor,
          warning: '可能未使用主题变量',
        });
      }
    }
  });
  
  if (issues.length > 0) {
    console.log(`⚠️  发现 ${issues.length} 个潜在问题:\n`);
    issues.slice(0, 10).forEach(issue => {
      console.log(`  - ${issue.element}`);
      console.log(`    背景: ${issue.bgColor}, 文字: ${issue.textColor}`);
      console.log(`    警告: ${issue.warning}\n`);
    });
    
    if (issues.length > 10) {
      console.log(`  ... 还有 ${issues.length - 10} 个问题未显示\n`);
    }
  } else {
    console.log('✅ 未发现明显的对比度问题');
    console.log('💡 提示: 建议使用专业工具（如 WebAIM Contrast Checker）进行详细检查\n');
  }
}

/**
 * 验证 Canvas 主题颜色
 */
export function verifyCanvasThemeColors(): void {
  console.log('🎨 开始 Canvas 主题颜色验证...\n');
  
  const canvas = document.querySelector('canvas');
  if (!canvas) {
    console.log('ℹ️  未找到 Canvas 元素');
    return;
  }
  
  const root = document.documentElement;
  const currentTheme = root.getAttribute('data-theme') || 'tech';
  
  // 获取主题颜色
  const bgPrimary = getComputedStyle(root).getPropertyValue('--bg-primary').trim();
  const colorPrimary = getComputedStyle(root).getPropertyValue('--color-primary').trim();
  
  console.log(`📌 当前主题: ${currentTheme}`);
  console.log(`📊 背景色变量: ${bgPrimary}`);
  console.log(`📊 主色变量: ${colorPrimary}`);
  console.log('');
  console.log('💡 提示:');
  console.log('  1. 检查 Canvas 绘制代码是否使用 getComputedStyle 获取主题颜色');
  console.log('  2. 检查 Canvas 背景色是否使用 --bg-primary 变量');
  console.log('  3. 检查星星颜色是否从主题变量获取');
  console.log('  4. 切换主题时观察 Canvas 是否正确重绘');
}

/**
 * 检查 SVG 渐变颜色
 */
export function verifySVGGradientColors(): void {
  console.log('🎨 开始 SVG 渐变颜色验证...\n');
  
  const gradients = document.querySelectorAll('linearGradient, radialGradient');
  
  if (gradients.length === 0) {
    console.log('ℹ️  未找到 SVG 渐变元素');
    return;
  }
  
  console.log(`📊 找到 ${gradients.length} 个渐变元素\n`);
  
  gradients.forEach((gradient, index) => {
    const stops = gradient.querySelectorAll('stop');
    console.log(`渐变 ${index + 1} (${gradient.id || '未命名'}):`);
    
    stops.forEach((stop, stopIndex) => {
      const stopColor = stop.getAttribute('stop-color');
      const stopOpacity = stop.getAttribute('stop-opacity') || '1';
      
      console.log(`  停止点 ${stopIndex + 1}:`);
      console.log(`    颜色: ${stopColor}`);
      console.log(`    透明度: ${stopOpacity}`);
      
      // 检查是否使用 CSS 变量
      if (stopColor && stopColor.startsWith('var(')) {
        console.log(`    ✅ 使用 CSS 变量`);
      } else if (stopColor && (stopColor.startsWith('#') || stopColor.startsWith('rgb'))) {
        console.log(`    ⚠️  使用硬编码颜色，建议改为 CSS 变量`);
      }
    });
    
    console.log('');
  });
}

/**
 * 测试主题切换性能
 */
export async function testThemeSwitchingPerformance(): Promise<void> {
  console.log('⚡ 开始主题切换性能测试...\n');
  
  const themes = ['tech', 'serene-horizon'];
  const iterations = 10;
  const times: number[] = [];
  
  console.log(`📊 执行 ${iterations} 次主题切换...\n`);
  
  for (let i = 0; i < iterations; i++) {
    const startTime = performance.now();
    
    // 切换主题
    const theme = themes[i % themes.length];
    document.documentElement.setAttribute('data-theme', theme);
    
    // 等待重绘
    await new Promise(resolve => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          resolve(null);
        });
      });
    });
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    times.push(duration);
    
    console.log(`  切换 ${i + 1}: ${duration.toFixed(2)}ms`);
  }
  
  // 计算统计信息
  const avg = times.reduce((a, b) => a + b, 0) / times.length;
  const min = Math.min(...times);
  const max = Math.max(...times);
  
  console.log('\n📊 性能统计:');
  console.log(`  平均时间: ${avg.toFixed(2)}ms`);
  console.log(`  最短时间: ${min.toFixed(2)}ms`);
  console.log(`  最长时间: ${max.toFixed(2)}ms`);
  
  if (avg < 100) {
    console.log('✅ 性能优秀（< 100ms）');
  } else if (avg < 200) {
    console.log('⚠️  性能良好（< 200ms）');
  } else {
    console.log('❌ 性能需要优化（> 200ms）');
  }
}

/**
 * 检查所有 CSS 变量是否定义
 */
export function checkCSSVariables(): void {
  console.log('🔍 开始 CSS 变量检查...\n');
  
  const requiredVariables = [
    '--bg-primary',
    '--bg-secondary',
    '--bg-card',
    '--text-primary',
    '--text-secondary',
    '--text-tertiary',
    '--color-primary',
    '--color-success',
    '--color-warning',
    '--color-error',
    '--color-info',
  ];
  
  const root = document.documentElement;
  const currentTheme = root.getAttribute('data-theme') || 'tech';
  const computedStyle = getComputedStyle(root);
  
  console.log(`📌 当前主题: ${currentTheme}\n`);
  
  const missing: string[] = [];
  const defined: string[] = [];
  
  requiredVariables.forEach(varName => {
    const value = computedStyle.getPropertyValue(varName).trim();
    if (!value) {
      missing.push(varName);
    } else {
      defined.push(varName);
    }
  });
  
  console.log(`✅ 已定义的变量 (${defined.length}/${requiredVariables.length}):`);
  defined.forEach(varName => {
    const value = computedStyle.getPropertyValue(varName).trim();
    console.log(`  ${varName}: ${value}`);
  });
  
  if (missing.length > 0) {
    console.log(`\n❌ 缺失的变量 (${missing.length}):`);
    missing.forEach(varName => {
      console.log(`  ${varName}`);
    });
  } else {
    console.log('\n✅ 所有必需的 CSS 变量都已定义');
  }
}

/**
 * 运行所有测试
 */
export async function runAllTests(): Promise<void> {
  console.log('🚀 开始运行所有主题测试...\n');
  console.log('='.repeat(50));
  console.log('');
  
  // 1. CSS 变量检查
  checkCSSVariables();
  console.log('\n' + '-'.repeat(50) + '\n');
  
  // 2. 主题切换测试
  await testThemeSwitching();
  console.log('\n' + '-'.repeat(50) + '\n');
  
  // 3. 性能测试
  await testThemeSwitchingPerformance();
  console.log('\n' + '-'.repeat(50) + '\n');
  
  // 4. 文字对比度检查
  checkTextContrast();
  console.log('\n' + '-'.repeat(50) + '\n');
  
  // 5. Canvas 颜色验证
  verifyCanvasThemeColors();
  console.log('\n' + '-'.repeat(50) + '\n');
  
  // 6. SVG 渐变验证
  verifySVGGradientColors();
  
  console.log('\n' + '='.repeat(50));
  console.log('✅ 所有测试完成！');
  console.log('💡 提示: 请手动检查视觉表现和交互功能');
}

// 导出到全局对象，方便在控制台使用
if (typeof window !== 'undefined') {
  (window as any).themeTestUtils = {
    testThemeSwitching,
    checkTextContrast,
    verifyCanvasThemeColors,
    verifySVGGradientColors,
    testThemeSwitchingPerformance,
    checkCSSVariables,
    runAllTests,
  };
  
  console.log('🎨 主题测试工具已加载！');
  console.log('💡 使用方法:');
  console.log('  - themeTestUtils.runAllTests() - 运行所有测试');
  console.log('  - themeTestUtils.testThemeSwitching() - 测试主题切换');
  console.log('  - themeTestUtils.checkCSSVariables() - 检查 CSS 变量');
  console.log('  - themeTestUtils.testThemeSwitchingPerformance() - 性能测试');
}
