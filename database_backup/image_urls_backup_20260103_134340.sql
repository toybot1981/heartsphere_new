-- ============================================
-- 图片URL数据备份
-- 备份时间: 
-- 说明: 备份包含 localhost URL 的数据，用于数据迁移前的恢复
-- ============================================

-- 备份 system_resources 表中包含 localhost 的记录
-- 只备份 id, name, url 字段，用于恢复
CREATE TABLE IF NOT EXISTS `system_resources_url_backup` (
  `id` BIGINT NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `url` VARCHAR(500) NOT NULL,
  `backup_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 备份 system_eras 表中包含 localhost 的记录
CREATE TABLE IF NOT EXISTS `system_eras_url_backup` (
  `id` BIGINT NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `image_url` VARCHAR(500) NOT NULL,
  `backup_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 备份 system_characters 表中包含 localhost 的记录
CREATE TABLE IF NOT EXISTS `system_characters_url_backup` (
  `id` BIGINT NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `avatar_url` VARCHAR(500) NOT NULL,
  `backup_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 备份 characters 表中包含 localhost 的记录
CREATE TABLE IF NOT EXISTS `characters_url_backup` (
  `id` BIGINT NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `avatar_url` VARCHAR(500) NULL,
  `background_url` VARCHAR(500) NULL,
  `backup_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 备份 eras 表中包含 localhost 的记录
CREATE TABLE IF NOT EXISTS `eras_url_backup` (
  `id` BIGINT NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `image_url` VARCHAR(500) NULL,
  `backup_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 备份 journal_entries 表中包含 localhost 的记录
CREATE TABLE IF NOT EXISTS `journal_entries_url_backup` (
  `id` VARCHAR(36) NOT NULL,
  `title` VARCHAR(200) NOT NULL,
  `image_url` VARCHAR(500) NULL,
  `backup_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 备份 users 表中包含 localhost 的记录
CREATE TABLE IF NOT EXISTS `users_url_backup` (
  `id` BIGINT NOT NULL,
  `username` VARCHAR(50) NOT NULL,
  `avatar` VARCHAR(500) NULL,
  `backup_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 备份 user_main_stories 表中包含 localhost 的记录
CREATE TABLE IF NOT EXISTS `user_main_stories_url_backup` (
  `id` BIGINT NOT NULL,
  `user_id` BIGINT NOT NULL,
  `avatar_url` VARCHAR(500) NULL,
  `background_url` VARCHAR(500) NULL,
  `backup_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- MySQL dump 10.13  Distrib 8.1.0, for macos13.3 (x86_64)
--
-- Host: localhost    Database: heartsphere
-- ------------------------------------------------------
-- Server version	8.0.43

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

-- ============================================
-- 恢复说明
-- ============================================
-- 如果需要恢复备份的数据，可以使用以下SQL：
-- 
-- UPDATE system_resources sr
-- INNER JOIN system_resources_url_backup b ON sr.id = b.id
-- SET sr.url = b.url;
-- 
-- UPDATE system_eras se
-- INNER JOIN system_eras_url_backup b ON se.id = b.id
-- SET se.image_url = b.image_url;
-- 
-- UPDATE system_characters sc
-- INNER JOIN system_characters_url_backup b ON sc.id = b.id
-- SET sc.avatar_url = b.avatar_url;
-- 
-- UPDATE characters c
-- INNER JOIN characters_url_backup b ON c.id = b.id
-- SET c.avatar_url = b.avatar_url, c.background_url = b.background_url;
-- 
-- UPDATE eras e
-- INNER JOIN eras_url_backup b ON e.id = b.id
-- SET e.image_url = b.image_url;
-- 
-- UPDATE journal_entries je
-- INNER JOIN journal_entries_url_backup b ON je.id = b.id
-- SET je.image_url = b.image_url;
-- 
-- UPDATE users u
-- INNER JOIN users_url_backup b ON u.id = b.id
-- SET u.avatar = b.avatar;
-- 
-- UPDATE user_main_stories ums
-- INNER JOIN user_main_stories_url_backup b ON ums.id = b.id
-- SET ums.avatar_url = b.avatar_url, ums.background_url = b.background_url;
-- 
-- 备份时间: 2026-01-03 13:43:40
