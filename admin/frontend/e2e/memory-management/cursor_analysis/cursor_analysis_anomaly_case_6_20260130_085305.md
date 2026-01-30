# Cursor 分析：页面内容异常

**用例 ID:** case_6
**用例名称:** Tab 资源管理
**时间:** 2026-01-30T08:53:05.121216

## 说明

验证步骤已通过，但检测到页面内容可能存在异常，建议人工确认。

## 相关步骤

```
verify text=资源管理
```

## 异常项

- **error_keyword**: Page contains keyword: 404

## 页面上下文

- **URL:** http://localhost:3005/admin?section=memory
- **标题:** HeartSphere - 统一管理后台

### 可见文本摘要

```
HEARTSPHERE
📊
概览 Dashboard
📚
内容管理
👥
用户管理
🔌
AI 接入与计费
🤖
AI 智能体
⚙️
系统配置
🔧
DEVOPS 工作台
🔗
连接服务
🔗
心域连接
🧠
记忆系统
🎓
教育版管理

Administrator

System Root

记忆系统管理
Admin Mode
退出登录
📊
系统概览
🧠
记忆系统管理
关闭其他
关闭所有
系统概览
记忆测试
用户记忆
短时记忆
长时记忆
统计分析
数据维护
用户记忆管理
用户记忆（ADMIN API）
HSMEM查询
记忆提取追溯
资源管理（RESOURCE LAYER）
记忆项管理（ITEM LAYER）
类别管理（CATEGORY LAYER）
资源管理（Resource Layer）

管理多模态资源：对话（Conversation）、文本（Text）、文档（Document）、音频（Audio）等

模态类型筛选
全部
模态类型筛选
刷新资源列表
37

对话

3

文本

4

文档

0

音频

资源ID	模态类型	创建时间	操作
08e0ec6f-012e-42c8-b093-920d190c11de	
document
	1/16/2026, 12:24:26 AM	查看详情
f46e33c5-c862-4ce3-88bd-9ee8304d5191	
document
	1/29/2026, 11:33:54 PM	查看详情
9aec514a-2374-4c63-9622-13b9651bdf81	
document
	1/29/2026, 11:35:59 PM	查看详情
3695e979-af62-41e6-92cd-24f0dabfa35d	
document
	1/29/2026, 11:20:52 PM	查看详情
7c99d725-16fa-4255-a814-e27da7467e58	
text
	1/29/2026, 11:35:59 PM	查看详情
f9a96198-83cb-4901-9a5a-24aa49d001f2	
text
	1/29/2026, 11:20:52 PM	查看详情
45023a16-a2fa-486f-bbb6-3f2e05c712ff	
text
	1/29/2026, 11:33:54 PM	查看详情
84313cbf-2474-4939-b886-80b37861bda7	
conversation
	1/22/2026, 1:54:21 PM	查看详情
cbea79b5-ba2a-4344-919b-453a4b7950aa	
conversation
	1/26/2026, 1:34:38 PM	查看详情
db554729-d1f3-4f00-88e3-5c26ea4bb653	
conversation
	1/26/2026, 1:34:34 PM	查看详情
d396539c-3b6b-41a1-8894-3ccdec26b56a	
conversation
	1/26/2026, 1:53:01 AM	查看详情
33269e30-babb-4689-af78-97babb766f57	
conversation
	1/15/2026, 11:21:06 PM	查看详情
7c0ad81f-cf88-47ef-ac56-85a86ec73213	
conversation
	1/26/2026, 2:37:11 PM	查看详情
2dfaa630-a11e-48ac-9dc3-668ff2f4b12b	
conversation
	1/26/2026, 1:19:20 PM	查看详情
811488bf-506c-4ab0-9639-38dce1438da5	
conversation
	1/11/2026, 12:52:37 PM	查看详情
9d6ce45d-ce2a-4d7a-8eb3-d4e496634363	
conversation
	1/23/2026, 6:34:21 AM	查看详情
109c1de2-1b32-4f9f-956e-b329901eff6f	
conversation
	1/29/2026, 11:35:59 PM	查看详情
47462d46-a97d-4d0c-91c2-a8a90b813503	
conversation
	1/11/2026, 12:37:32 PM	查看详情
9cec47b4-b052-4504-ba26-1dd00663c171	
conversation
	1/26/2026, 3:33:59 AM	查看详情
b80d301c-5f9c-4026-8048-6de0b0186fbc	
conversation
	1/
...[truncated]
```

## 使用说明

可将本文件在 Cursor 中打开，或复制内容到对话中，便于 AI 分析是否为误报或真实问题。
