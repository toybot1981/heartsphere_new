#!/bin/bash

echo "=========================================="
echo "    HeartSphere 代码统计报告"
echo "=========================================="
echo ""

echo "1. 文件类型统计"
echo "--------------------------------------"
find . -type f \( -name "*.java" -o -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" -o -name "*.vue" \) \
  -not -path "*/node_modules/*" \
  -not -path "*/target/*" \
  -not -path "*/dist/*" \
  -not -path "*/.git/*" \
  -exec basename {} \; | \
  sed 's/.*\.//' | sort | uniq -c | sort -rn

echo ""
echo "2. 总文件数"
echo "--------------------------------------"
JAVA_FILES=$(find . -name "*.java" -not -path "*/target/*" -not -path "*/.git/*" | wc -l | tr -d ' ')
TS_FILES=$(find . -name "*.ts" -o -name "*.tsx" | grep -v node_modules | grep -v dist | wc -l | tr -d ' ')
JS_FILES=$(find . -name "*.js" -o -name "*.jsx" | grep -v node_modules | grep -v dist | wc -l | tr -d ' ')
TOTAL_FILES=$((JAVA_FILES + TS_FILES + JS_FILES))
echo "Java 文件: $JAVA_FILES"
echo "TypeScript 文件: $TS_FILES"
echo "JavaScript 文件: $JS_FILES"
echo "总计: $TOTAL_FILES"

echo ""
echo "3. 各目录代码行数"
echo "--------------------------------------"
for dir in backend frontend; do
  if [ -d "$dir" ]; then
    echo ""
    echo "[$dir 目录]"
    find ./$dir -type f \( -name "*.java" -o -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) \
      -not -path "*/node_modules/*" \
      -not -path "*/target/*" \
      -not -path "*/dist/*" 2>/dev/null | xargs wc -l 2>/dev/null | tail -1
  fi
done

echo ""
echo "4. 项目概览"
echo "--------------------------------------"
echo "主要目录:"
ls -ld backend frontend docs wechat-miniprogram deploy 2>/dev/null | awk '{print "  " $9 ": " $5 " bytes"}'

echo ""
echo "5. Git 统计"
echo "--------------------------------------"
if [ -d .git ]; then
  echo "总提交数: $(git rev-list --count HEAD 2>/dev/null || echo 'N/A')"
  echo "分支数: $(git branch -a 2>/dev/null | wc -l | tr -d ' ')"
  echo "最新提交:"
  git log -1 --format='  %h - %s (%ar)' 2>/dev/null || echo "  N/A"
else
  echo "不是 Git 仓库"
fi

echo ""
echo "=========================================="
echo "    统计完成"
echo "=========================================="
