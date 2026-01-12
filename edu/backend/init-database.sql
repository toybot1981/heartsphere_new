-- HeartSphere Edu 数据库初始化脚本
-- 创建数据库和表结构

-- 创建数据库（如果不存在）
CREATE DATABASE IF NOT EXISTS heartsphere_edu 
  CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;

-- 使用数据库
USE heartsphere_edu;

-- 注意：表的创建由 Flyway 迁移脚本自动完成
-- 本脚本仅用于创建数据库

-- 验证数据库创建
SELECT 
    SCHEMA_NAME as '数据库名称',
    DEFAULT_CHARACTER_SET_NAME as '字符集',
    DEFAULT_COLLATION_NAME as '排序规则'
FROM 
    information_schema.SCHEMATA
WHERE 
    SCHEMA_NAME = 'heartsphere_edu';

-- 显示数据库中的表（Flyway 迁移后）
SHOW TABLES;
