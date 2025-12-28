-- 为剧本物品和事件创建资源记录（包含AI图片生成提示词）
-- 注意：由于物品和事件数量较多，这里只创建第一阶段（现实时代）的资源作为示例
-- 后续可以按需为其他场景创建资源

-- ========== 我的大学场景 - 物品资源 ==========
INSERT INTO `system_resources` (`name`, `url`, `category`, `description`, `prompt`, `tags`, `created_by_admin_id`, `created_at`, `updated_at`) VALUES
('学生证', 'placeholder://item/university_student_id.jpg', 'item', '大学学生证', 'University student ID card, plastic card with photo, school logo, official design, realistic style, high quality, detailed card design, modern student identification', '大学,证件,物品', NULL, NOW(), NOW()),
('课本', 'placeholder://item/university_textbook.jpg', 'item', '专业课本', 'University textbook, thick book with cover, academic content, study material, realistic style, high quality, detailed book design, educational material', '大学,学习,物品', NULL, NOW(), NOW()),
('笔记本', 'placeholder://item/university_notebook.jpg', 'item', '课堂笔记', 'University notebook, lined paper with handwritten notes, study notes, realistic style, high quality, detailed notebook, academic notes', '大学,学习,物品', NULL, NOW(), NOW()),
('校园卡', 'placeholder://item/university_campus_card.jpg', 'item', '校园一卡通', 'University campus card, smart card with chip, campus design, realistic style, high quality, detailed card, modern campus ID', '大学,卡片,物品', NULL, NOW(), NOW()),
('社团徽章', 'placeholder://item/university_club_badge.jpg', 'item', '参加社团获得的徽章', 'University club badge, pin badge, club logo, collectible item, realistic style, high quality, detailed badge design, club membership', '大学,社团,物品', NULL, NOW(), NOW()),
('奖学金证书', 'placeholder://item/university_scholarship.jpg', 'item', '获得的奖学金证书', 'Scholarship certificate, official document with seal, achievement award, realistic style, high quality, detailed certificate, academic achievement', '大学,成就,物品', NULL, NOW(), NOW()),
('实验报告', 'placeholder://item/university_lab_report.jpg', 'item', '完成的实验报告', 'Lab report, scientific document, experiment results, realistic style, high quality, detailed report, academic document', '大学,实验,物品', NULL, NOW(), NOW()),
('毕业设计', 'placeholder://item/university_graduation_project.jpg', 'item', '毕业设计作品', 'Graduation project, creative work, portfolio piece, realistic style, high quality, detailed project display, academic achievement', '大学,毕业,物品', NULL, NOW(), NOW());

-- ========== 我的大学场景 - 事件图标 ==========
INSERT INTO `system_resources` (`name`, `url`, `category`, `description`, `prompt`, `tags`, `created_by_admin_id`, `created_at`, `updated_at`) VALUES
('上课迟到', 'placeholder://icon/event_university_late_to_class.png', 'event_icon', '上课迟到事件图标', 'Icon design, being late to class, clock, student running, minimalist icon style, clean design, event icon, university theme', '大学,事件,图标', NULL, NOW(), NOW()),
('图书馆偶遇', 'placeholder://icon/event_university_library_encounter.png', 'event_icon', '图书馆偶遇事件图标', 'Icon design, library encounter, books, two people meeting, minimalist icon style, clean design, event icon, university theme', '大学,事件,图标', NULL, NOW(), NOW()),
('社团活动', 'placeholder://icon/event_university_club_activity.png', 'event_icon', '社团活动事件图标', 'Icon design, club activity, group of people, activity symbol, minimalist icon style, clean design, event icon, university theme', '大学,事件,图标', NULL, NOW(), NOW()),
('考试前夕', 'placeholder://icon/event_university_before_exam.png', 'event_icon', '考试前夕事件图标', 'Icon design, before exam, books, night study, minimalist icon style, clean design, event icon, university theme', '大学,事件,图标', NULL, NOW(), NOW()),
('食堂偶遇', 'placeholder://icon/event_university_canteen_meet.png', 'event_icon', '食堂偶遇事件图标', 'Icon design, canteen meeting, food tray, people, minimalist icon style, clean design, event icon, university theme', '大学,事件,图标', NULL, NOW(), NOW()),
('宿舍聊天', 'placeholder://icon/event_university_dorm_chat.png', 'event_icon', '宿舍聊天事件图标', 'Icon design, dormitory chat, room, conversation bubble, minimalist icon style, clean design, event icon, university theme', '大学,事件,图标', NULL, NOW(), NOW()),
('选课成功', 'placeholder://icon/event_university_course_selection.png', 'event_icon', '选课成功事件图标', 'Icon design, course selection success, checkmark, course list, minimalist icon style, clean design, event icon, university theme', '大学,事件,图标', NULL, NOW(), NOW()),
('毕业论文', 'placeholder://icon/event_university_thesis.png', 'event_icon', '毕业论文事件图标', 'Icon design, graduation thesis, document, graduation cap, minimalist icon style, clean design, event icon, university theme', '大学,事件,图标', NULL, NOW(), NOW());

-- 注意：由于资源数量庞大（136个物品 + 136个事件 = 272个资源记录），
-- 这里只创建了第一阶段（我的大学场景）的16个资源作为示例。
-- 建议使用脚本程序批量生成剩余的256个资源记录，或者按需逐步创建。

