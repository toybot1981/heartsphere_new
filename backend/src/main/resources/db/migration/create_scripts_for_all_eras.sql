-- 为每个场景创建2个剧本，自动更新到数据库
-- 参与的角色人物随机选定
-- 执行方法：mysql -u root -p123456 heartsphere --default-character-set=utf8mb4 < create_scripts_for_all_eras.sql

SET NAMES utf8mb4;

-- 创建临时存储过程来生成剧本
DELIMITER $$

DROP PROCEDURE IF EXISTS create_scripts_for_eras$$

CREATE PROCEDURE create_scripts_for_eras()
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE era_id BIGINT;
    DECLARE era_name VARCHAR(200);
    DECLARE char_count INT;
    DECLARE char_ids_json TEXT;
    DECLARE char_id1 BIGINT;
    DECLARE char_id2 BIGINT;
    DECLARE char_id3 BIGINT;
    DECLARE char_name1 VARCHAR(200);
    DECLARE char_name2 VARCHAR(200);
    DECLARE char_name3 VARCHAR(200);
    DECLARE script_num INT;
    DECLARE script_title VARCHAR(200);
    DECLARE script_desc TEXT;
    DECLARE script_content TEXT;
    DECLARE max_sort_order INT;
    DECLARE char_list TEXT;
    
    -- 游标：遍历所有激活的场景
    DECLARE era_cursor CURSOR FOR 
        SELECT id, name 
        FROM system_eras 
        WHERE is_active = 1 
        ORDER BY id;
    
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    
    OPEN era_cursor;
    
    era_loop: LOOP
        FETCH era_cursor INTO era_id, era_name;
        IF done THEN
            LEAVE era_loop;
        END IF;
        
        -- 获取该场景的角色数量
        SELECT COUNT(*) INTO char_count
        FROM system_characters
        WHERE system_era_id = era_id AND is_active = 1;
        
        -- 如果该场景没有角色，跳过
        IF char_count = 0 THEN
            ITERATE era_loop;
        END IF;
        
        -- 获取该场景的最大sort_order，用于设置新剧本的sort_order
        SELECT COALESCE(MAX(sort_order), 0) INTO max_sort_order
        FROM system_scripts
        WHERE system_era_id = era_id;
        
        -- 为每个场景创建2个剧本
        SET script_num = 1;
        WHILE script_num <= 2 DO
            -- 重置变量
            SET char_id1 = NULL;
            SET char_id2 = NULL;
            SET char_id3 = NULL;
            SET char_name1 = NULL;
            SET char_name2 = NULL;
            SET char_name3 = NULL;
            
            -- 随机选择第一个角色
            SELECT id, name INTO char_id1, char_name1
            FROM system_characters
            WHERE system_era_id = era_id AND is_active = 1
            ORDER BY RAND()
            LIMIT 1;
            
            -- 如果有多个角色，随机选择第二个角色（确保不同）
            IF char_count >= 2 THEN
                SELECT id, name INTO char_id2, char_name2
                FROM system_characters
                WHERE system_era_id = era_id AND is_active = 1 AND id != IFNULL(char_id1, 0)
                ORDER BY RAND()
                LIMIT 1;
            END IF;
            
            -- 如果有3个或更多角色，50%概率选择第三个角色
            IF char_count >= 3 AND RAND() > 0.5 THEN
                SELECT id, name INTO char_id3, char_name3
                FROM system_characters
                WHERE system_era_id = era_id AND is_active = 1 
                    AND id != IFNULL(char_id1, 0) AND id != IFNULL(char_id2, 0)
                ORDER BY RAND()
                LIMIT 1;
            END IF;
            
            -- 构建角色ID的JSON数组
            IF char_id3 IS NOT NULL THEN
                SET char_ids_json = JSON_ARRAY(char_id1, char_id2, char_id3);
                SET char_list = CONCAT(IFNULL(char_name1, ''), '、', IFNULL(char_name2, ''), '、', IFNULL(char_name3, ''));
            ELSEIF char_id2 IS NOT NULL THEN
                SET char_ids_json = JSON_ARRAY(char_id1, char_id2);
                SET char_list = CONCAT(IFNULL(char_name1, ''), '、', IFNULL(char_name2, ''));
            ELSE
                SET char_ids_json = JSON_ARRAY(char_id1);
                SET char_list = IFNULL(char_name1, '');
            END IF;
            
            -- 生成剧本标题和描述
            IF script_num = 1 THEN
                SET script_title = CONCAT(era_name, '的故事');
                SET script_desc = CONCAT('一个发生在', era_name, '的精彩故事，讲述了', char_list, '等角色之间的互动与冒险。');
            ELSE
                SET script_title = CONCAT(era_name, '的冒险');
                SET script_desc = CONCAT('在', era_name, '中展开的冒险之旅，', char_list, '等角色将与你一起探索这个世界的奥秘。');
            END IF;
            
            -- 生成基本的剧本JSON内容
            SET script_content = CONCAT('{"startNodeId": "start", "nodes": {',
                '"start": {"id": "start", "text": "欢迎来到', era_name, '！你在这里遇到了', char_list, '。", "backgroundHint": "', era_name, '的场景", "options": [',
                '{"text": "开始对话", "nextNodeId": "conversation"}, ',
                '{"text": "探索环境", "nextNodeId": "explore"}]}, ',
                '"conversation": {"id": "conversation", "text": "你与', char_list, '展开了深入的对话，了解了更多关于', era_name, '的信息。", "backgroundHint": "', era_name, '的对话场景", "options": [',
                '{"text": "继续探索", "nextNodeId": "explore"}, ',
                '{"text": "结束", "nextNodeId": "end"}]}, ',
                '"explore": {"id": "explore", "text": "你在', era_name, '中探索，发现了许多有趣的事物和秘密。", "backgroundHint": "', era_name, '的探索场景", "options": [',
                '{"text": "继续对话", "nextNodeId": "conversation"}, ',
                '{"text": "结束", "nextNodeId": "end"}]}, ',
                '"end": {"id": "end", "text": "故事结束了，但', era_name, '的冒险还在继续。", "backgroundHint": "', era_name, '的结束场景", "options": []}}',
                '}');
            
            -- 插入剧本
            INSERT INTO system_scripts (
                title, 
                description, 
                content, 
                scene_count, 
                system_era_id, 
                character_ids, 
                tags, 
                is_active, 
                sort_order
            ) VALUES (
                script_title,
                script_desc,
                script_content,
                3,
                era_id,
                char_ids_json,
                CONCAT(era_name, ',故事,冒险'),
                TRUE,
                max_sort_order + script_num
            );
            
            SET script_num = script_num + 1;
        END WHILE;
        
    END LOOP;
    
    CLOSE era_cursor;
END$$

DELIMITER ;

-- 执行存储过程
CALL create_scripts_for_eras();

-- 删除临时存储过程
DROP PROCEDURE IF EXISTS create_scripts_for_eras;

-- 显示创建结果
SELECT 
    se.id AS era_id,
    se.name AS era_name,
    COUNT(ss.id) AS script_count,
    GROUP_CONCAT(ss.title ORDER BY ss.sort_order SEPARATOR ', ') AS script_titles
FROM system_eras se
LEFT JOIN system_scripts ss ON ss.system_era_id = se.id AND ss.is_active = 1
WHERE se.is_active = 1
GROUP BY se.id, se.name
ORDER BY se.id;
