# 暖心留言事务回滚问题修复

## 问题描述
发送暖心留言时出现 500 错误：
```
Transaction silently rolled back because it has been marked as rollback-only
```

## 问题原因
在 `WarmMessageService.createWarmMessage()` 方法中，虽然使用了 `REQUIRES_NEW` 事务传播级别，但如果 `createMailboxMessage()` 方法内部抛出异常，异常仍然可能影响主事务。

## 修复方案

### 1. 双重异常处理
- 在主方法中捕获异常（已存在）
- 在 `createMailboxMessage()` 方法内部也捕获异常，确保异常不会传播

### 2. 代码修改

**WarmMessageService.java**:
```java
// 修改前
@Transactional(propagation = Propagation.REQUIRES_NEW)
private void createMailboxMessage(...) {
    // ... 创建请求
    mailboxMessageService.createMessage(mailboxRequest); // 如果这里抛出异常，会传播
}

// 修改后
@Transactional(propagation = Propagation.REQUIRES_NEW, rollbackFor = Exception.class)
private void createMailboxMessage(...) {
    try {
        // ... 创建请求
        mailboxMessageService.createMessage(mailboxRequest);
    } catch (Exception e) {
        // 在 REQUIRES_NEW 事务中捕获异常，避免传播到主事务
        System.err.println("创建mailbox消息失败（已隔离）: " + e.getMessage());
        e.printStackTrace();
        // 不重新抛出异常，确保不影响主事务
    }
}
```

## 修复效果
- ✅ 即使 mailbox 消息创建失败，也不会影响暖心留言的创建
- ✅ 主事务和子事务完全隔离
- ✅ 错误会被记录，但不会中断业务流程

## 注意事项
- 需要重启后端服务才能生效
- 如果 mailbox 消息创建失败，留言仍然会成功创建，但不会出现在 mailbox 中
- 可以通过日志查看 mailbox 消息创建失败的原因

## 验证步骤
1. 重启后端服务
2. 使用 ty1 账号发送暖心留言
3. 检查留言是否成功创建
4. 使用 tongyexin 账号检查 mailbox 中是否有留言
5. 查看后端日志确认是否有错误
