#!/usr/bin/env node

/**
 * Bundle大小检查脚本
 * Phase 5: 性能测试和验证
 * 
 * 使用方法:
 *   npm run build
 *   node scripts/check-bundle-size.js
 */

const fs = require('fs');
const path = require('path');

const DIST_DIR = path.resolve(__dirname, '../dist');
const ASSETS_DIR = path.join(DIST_DIR, 'assets');

// 性能目标（字节）
const TARGETS = {
  // 初始加载（所有关键chunk的总和）
  initialLoad: 500 * 1024, // 500KB
  // 单个chunk最大大小
  maxChunkSize: 300 * 1024, // 300KB
  // 总bundle大小
  totalSize: 2 * 1024 * 1024, // 2MB
};

// 格式化文件大小
function formatSize(bytes) {
  if (bytes < 1024) {
    return `${bytes} B`;
  } else if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(2)} KB`;
  } else {
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }
}

// 获取文件大小
function getFileSize(filePath) {
  try {
    const stats = fs.statSync(filePath);
    return stats.size;
  } catch (error) {
    return 0;
  }
}

// 分析bundle大小
function analyzeBundleSize() {
  console.log('📦 Bundle大小分析\n');
  console.log('='.repeat(60));

  if (!fs.existsSync(DIST_DIR)) {
    console.error('❌ dist目录不存在，请先运行 npm run build');
    process.exit(1);
  }

  if (!fs.existsSync(ASSETS_DIR)) {
    console.error('❌ dist/assets目录不存在，请先运行 npm run build');
    process.exit(1);
  }

  const files = fs.readdirSync(ASSETS_DIR);
  const jsFiles = files.filter(f => f.endsWith('.js'));
  const cssFiles = files.filter(f => f.endsWith('.css'));

  console.log(`\n📊 文件统计:`);
  console.log(`  - JS文件: ${jsFiles.length}个`);
  console.log(`  - CSS文件: ${cssFiles.length}个`);

  // 分析JS文件
  console.log(`\n📦 JS Bundle分析:`);
  console.log('-'.repeat(60));

  const jsSizes = jsFiles.map(file => {
    const filePath = path.join(ASSETS_DIR, file);
    const size = getFileSize(filePath);
    return { file, size, path: filePath };
  }).sort((a, b) => b.size - a.size);

  let totalJSSize = 0;
  let initialLoadSize = 0;
  const criticalChunks = ['mobile-core', 'vendor-react', 'main'];

  jsSizes.forEach(({ file, size }) => {
    totalJSSize += size;
    const isCritical = criticalChunks.some(chunk => file.includes(chunk));
    if (isCritical) {
      initialLoadSize += size;
    }

    const sizeStr = formatSize(size);
    const status = size > TARGETS.maxChunkSize ? '⚠️' : '✅';
    const isCriticalMark = criticalChunks.some(chunk => file.includes(chunk)) ? '🔑' : '  ';
    console.log(`${status} ${isCriticalMark} ${file.padEnd(50)} ${sizeStr.padStart(10)}`);
  });

  // 分析CSS文件
  console.log(`\n🎨 CSS Bundle分析:`);
  console.log('-'.repeat(60));

  const cssSizes = cssFiles.map(file => {
    const filePath = path.join(ASSETS_DIR, file);
    const size = getFileSize(filePath);
    return { file, size };
  }).sort((a, b) => b.size - a.size);

  let totalCSSSize = 0;
  cssSizes.forEach(({ file, size }) => {
    totalCSSSize += size;
    const sizeStr = formatSize(size);
    console.log(`✅   ${file.padEnd(50)} ${sizeStr.padStart(10)}`);
  });

  // 总大小
  const totalSize = totalJSSize + totalCSSSize;
  initialLoadSize += totalCSSSize; // CSS也是初始加载的一部分

  console.log(`\n📊 总结:`);
  console.log('='.repeat(60));
  console.log(`总JS大小:     ${formatSize(totalJSSize).padStart(10)}`);
  console.log(`总CSS大小:    ${formatSize(totalCSSSize).padStart(10)}`);
  console.log(`总Bundle大小: ${formatSize(totalSize).padStart(10)}`);
  console.log(`初始加载大小: ${formatSize(initialLoadSize).padStart(10)} (关键chunk)`);

  // 性能评估
  console.log(`\n🎯 性能评估:`);
  console.log('='.repeat(60));

  const checks = [
    {
      name: '初始加载大小',
      value: initialLoadSize,
      target: TARGETS.initialLoad,
      unit: 'KB',
    },
    {
      name: '最大chunk大小',
      value: Math.max(...jsSizes.map(f => f.size), 0),
      target: TARGETS.maxChunkSize,
      unit: 'KB',
    },
    {
      name: '总bundle大小',
      value: totalSize,
      target: TARGETS.totalSize,
      unit: 'MB',
    },
  ];

  let allPassed = true;
  checks.forEach(({ name, value, target, unit }) => {
    const passed = value <= target;
    const status = passed ? '✅' : '❌';
    const valueStr = unit === 'KB' 
      ? `${(value / 1024).toFixed(2)} KB`
      : `${(value / (1024 * 1024)).toFixed(2)} MB`;
    const targetStr = unit === 'KB'
      ? `${(target / 1024).toFixed(2)} KB`
      : `${(target / (1024 * 1024)).toFixed(2)} MB`;
    
    console.log(`${status} ${name.padEnd(20)} ${valueStr.padStart(12)} / ${targetStr.padStart(12)}`);
    if (!passed) {
      allPassed = false;
    }
  });

  // 建议
  console.log(`\n💡 优化建议:`);
  console.log('='.repeat(60));

  if (initialLoadSize > TARGETS.initialLoad) {
    console.log('⚠️  初始加载大小超过目标，建议:');
    console.log('   - 进一步代码分割');
    console.log('   - 使用懒加载');
    console.log('   - 移除未使用的依赖');
  }

  if (jsSizes[0]?.size > TARGETS.maxChunkSize) {
    console.log('⚠️  最大chunk超过目标，建议:');
    console.log('   - 拆分大chunk');
    console.log('   - 使用动态导入');
  }

  if (totalSize > TARGETS.totalSize) {
    console.log('⚠️  总bundle大小超过目标，建议:');
    console.log('   - 移除未使用的代码');
    console.log('   - 使用tree-shaking');
    console.log('   - 压缩资源');
  }

  if (allPassed) {
    console.log('✅ 所有性能目标都已达成！');
  }

  console.log('\n');

  // 返回结果
  return {
    totalJSSize,
    totalCSSSize,
    totalSize,
    initialLoadSize,
    allPassed,
    jsSizes,
    cssSizes,
  };
}

// 运行分析
try {
  const result = analyzeBundleSize();
  process.exit(result.allPassed ? 0 : 1);
} catch (error) {
  console.error('❌ 分析失败:', error);
  process.exit(1);
}
