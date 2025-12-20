-- 为系统预置剧本的所有节点添加AI旁白提示词（prompt字段）
-- 执行方法：mysql -u root -p123456 heartsphere --default-character-set=utf8mb4 < update_system_scripts_with_prompts.sql

SET NAMES utf8mb4;

-- 创建临时存储过程来更新剧本内容
DELIMITER $$

CREATE PROCEDURE IF NOT EXISTS UpdateScriptNodesWithPrompts()
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE script_id BIGINT;
    DECLARE script_content TEXT;
    DECLARE updated_content TEXT;
    DECLARE cur CURSOR FOR SELECT id, content FROM system_scripts WHERE content IS NOT NULL;
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;

    OPEN cur;

    read_loop: LOOP
        FETCH cur INTO script_id, script_content;
        IF done THEN
            LEAVE read_loop;
        END IF;

        -- 这里需要解析JSON并更新每个节点
        -- 由于MySQL的JSON函数限制，我们使用Python或Java来处理会更合适
        -- 暂时先跳过，使用Java服务来处理

    END LOOP;

    CLOSE cur;
END$$

DELIMITER ;

-- 由于MySQL的JSON处理能力有限，建议使用Java服务来处理
-- 这个脚本只是占位符，实际更新将通过Java服务完成

