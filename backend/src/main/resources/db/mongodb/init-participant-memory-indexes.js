// 参与者记忆系统MongoDB索引初始化脚本
// 执行方式: mongosh heartsphere < init-participant-memory-indexes.js

// ========== 参与者身份记忆索引 ==========
db.participant_identity_memories.createIndex({ participantId: 1 });
db.participant_identity_memories.createIndex({ participantId: 1, sceneId: 1 });
db.participant_identity_memories.createIndex({ sceneId: 1 });

// ========== 参与者交互记忆索引 ==========
db.participant_interaction_memories.createIndex({ participantId: 1, interactionTime: -1 });
db.participant_interaction_memories.createIndex({ participantId: 1, relatedParticipantId: 1, interactionTime: -1 });
db.participant_interaction_memories.createIndex({ participantId: 1, sceneId: 1, interactionTime: -1 });
db.participant_interaction_memories.createIndex({ sceneId: 1, interactionTime: -1 });
db.participant_interaction_memories.createIndex({ participantId: 1, interactionType: 1, interactionTime: -1 });
db.participant_interaction_memories.createIndex({ content: "text" }); // 文本搜索索引

// ========== 参与者关系索引 ==========
db.participant_relationships.createIndex({ participantId: 1, relatedParticipantId: 1 }, { unique: true });
db.participant_relationships.createIndex({ participantId: 1, strength: -1 });
db.participant_relationships.createIndex({ participantId: 1, relationshipType: 1, strength: -1 });
db.participant_relationships.createIndex({ sceneId: 1 });
db.participant_relationships.createIndex({ participantId: 1, sceneId: 1, strength: -1 });

// ========== 参与者偏好索引 ==========
db.participant_preferences.createIndex({ participantId: 1, key: 1 }, { unique: true });
db.participant_preferences.createIndex({ participantId: 1, sceneId: 1, key: 1 }, { unique: true });
db.participant_preferences.createIndex({ participantId: 1, updatedAt: -1 });
db.participant_preferences.createIndex({ participantId: 1, sceneId: 1, updatedAt: -1 });

// ========== 参与者场景记忆索引 ==========
db.participant_scene_memories.createIndex({ participantId: 1, sceneId: 1, createdAt: -1 });
db.participant_scene_memories.createIndex({ sceneId: 1, createdAt: -1 });
db.participant_scene_memories.createIndex({ participantId: 1, createdAt: -1 });
db.participant_scene_memories.createIndex({ sceneId: 1, inheritable: 1, createdAt: -1 });
db.participant_scene_memories.createIndex({ content: "text" }); // 文本搜索索引

print("参与者记忆系统索引创建完成！");



