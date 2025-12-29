// MongoDB索引初始化脚本
// 用于记忆系统的MongoDB集合索引

// 切换到heartsphere数据库
use heartsphere;

// ========== user_facts 集合索引 ==========
print("创建 user_facts 索引...");
db.user_facts.createIndex({ userId: 1, category: 1 });
db.user_facts.createIndex({ userId: 1, importance: -1 });
db.user_facts.createIndex({ fact: "text" });
db.user_facts.createIndex({ userId: 1, lastAccessedAt: -1 });
db.user_facts.createIndex({ userId: 1, createdAt: -1 });
print("user_facts 索引创建完成");

// ========== user_preferences 集合索引 ==========
print("创建 user_preferences 索引...");
db.user_preferences.createIndex({ userId: 1, key: 1 }, { unique: true });
db.user_preferences.createIndex({ userId: 1, updatedAt: -1 });
db.user_preferences.createIndex({ userId: 1, lastAccessedAt: -1 });
print("user_preferences 索引创建完成");

// ========== user_memories 集合索引 ==========
print("创建 user_memories 索引...");
db.user_memories.createIndex({ userId: 1, type: 1 });
db.user_memories.createIndex({ userId: 1, importance: 1 });
db.user_memories.createIndex({ userId: 1, lastAccessedAt: -1 });
db.user_memories.createIndex({ content: "text" });
db.user_memories.createIndex({ userId: 1, createdAt: -1 });
print("user_memories 索引创建完成");

print("所有索引创建完成！");

