# Mentis 测试快速参考

**日期**：2026-01-13  
**版本**：1.0

---

## 快速开始

### 1. 启动服务
```bash
./scripts/start-mentis.sh
```

### 2. 运行自动化测试
```bash
./scripts/test-mentis-comprehensive.sh
```

### 3. 手动测试
访问：http://localhost:3002/mentis/manus

---

## COMPUTER_USE 测试话术（重点）

### ⭐⭐⭐ 必测场景

#### 1. 查询天气
```
帮我查一下明天北京的天气
```
**预期**：识别为 COMPUTER_USE，分解为多个步骤，执行浏览器操作

#### 2. 搜索信息
```
搜索一下Python的最新版本信息
```
**预期**：识别为 COMPUTER_USE，打开浏览器搜索

#### 3. 查询资料
```
查询一下人工智能的发展历史
```
**预期**：识别为 COMPUTER_USE，执行浏览器查询

---

## 其他任务类型测试

### CHAT 类型
```
你好，请介绍一下自己
什么是人工智能？
```

### COMMAND 类型
```
帮我执行 ls -la
执行 pwd 命令
```

### SCRIPT 类型
```
帮我执行一个Python脚本：print('Hello')
执行Python脚本计算1到10的和
```

---

## 检查要点

### ✅ 意图识别
- [ ] 查询类任务识别为 **COMPUTER_USE**（不是 CHAT）

### ✅ 任务分解
- [ ] COMPUTER_USE 任务被分解为多个步骤
- [ ] 步骤包括：打开浏览器、访问网站、搜索、提取信息

### ✅ 执行结果
- [ ] 任务状态正确更新
- [ ] GUI 操作正确执行
- [ ] 信息正确提取和返回

---

## 详细文档

- **完整测试话术**：`docs/TESTING_DIALOGUES.md`
- **测试脚本**：`scripts/test-mentis-comprehensive.sh`
- **测试方案**：`docs/需求分析/Mentis详细测试方案.md`

---

**最后更新**：2026-01-13
