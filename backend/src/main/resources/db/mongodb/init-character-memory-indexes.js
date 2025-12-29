// 角色记忆系统MongoDB索引初始化脚本
// 执行方式: mongosh heartsphere < backend/src/main/resources/db/mongodb/init-character-memory-indexes.js

// ========== 角色自身记忆索引 ==========
db.character_self_memories.createIndex({ characterId: 1, type: 1 });
db.character_self_memories.createIndex({ characterId: 1, importance: -1 });
db.character_self_memories.createIndex({ characterId: 1, createdAt: -1 });
db.character_self_memories.createIndex({ content: "text" });

print("character_self_memories 索引创建完成");

// ========== 角色交互记忆索引 ==========
db.character_interaction_memories.createIndex({ characterId: 1, userId: 1 });
db.character_interaction_memories.createIndex({ characterId: 1, userId: 1, eraId: 1 });
db.character_interaction_memories.createIndex({ characterId: 1, userId: 1, interactionTime: -1 });
db.character_interaction_memories.createIndex({ interactionTime: -1 });
db.character_interaction_memories.createIndex({ content: "text" });

print("character_interaction_memories 索引创建完成");

// ========== 角色场景记忆索引 ==========
db.character_scene_memories.createIndex({ characterId: 1, eraId: 1 });
db.character_scene_memories.createIndex({ characterId: 1, inheritable: 1 });
db.character_scene_memories.createIndex({ characterId: 1, createdAt: -1 });
db.character_scene_memories.createIndex({ content: "text" });

print("character_scene_memories 索引创建完成");

// ========== 角色关系记忆索引 ==========
db.character_relationship_memories.createIndex({ 
    characterId: 1, 
    relatedCharacterId: 1 
}, { unique: true });
db.character_relationship_memories.createIndex({ characterId: 1, strength: -1 });
db.character_relationship_memories.createIndex({ characterId: 1, relationshipType: 1 });
db.character_relationship_memories.createIndex({ characterId: 1, lastInteractedAt: -1 });

print("character_relationship_memories 索引创建完成");

print("\n所有角色记忆索引创建完成！");

