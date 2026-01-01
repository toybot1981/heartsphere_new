-- 第一阶段：为现实时代场景的物品创建资源记录（包含AI图片生成提示词）
-- 场景：我的大学、我的中学、我的工作、我的童年、我的故乡

SET NAMES utf8mb4;

-- ========== 我的大学场景 - 物品资源 ==========
INSERT INTO `system_resources` (`name`, `url`, `category`, `description`, `prompt`, `tags`, `created_by_admin_id`, `created_at`, `updated_at`) VALUES
('学生证（物品）', 'placeholder://item/item_university_student_id.jpg', 'item', '大学学生证，可以用于图书馆、食堂等场所', 'University student ID card, plastic card with photo, school logo, official design, realistic style, high quality, detailed card design, modern student identification, clean background', '大学,证件,物品', NULL, NOW(), NOW()),
('课本（物品）', 'placeholder://item/item_university_textbook.jpg', 'item', '专业课本，课堂上需要的教材', 'University textbook, thick book with cover, academic content, study material, realistic style, high quality, detailed book design, educational material, professional textbook appearance', '大学,学习,物品', NULL, NOW(), NOW()),
('笔记本（物品）', 'placeholder://item/item_university_notebook.jpg', 'item', '课堂笔记，记录了重要的知识点', 'University notebook, lined paper with handwritten notes, study notes, realistic style, high quality, detailed notebook, academic notes, clean and organized appearance', '大学,学习,物品', NULL, NOW(), NOW()),
('校园卡（物品）', 'placeholder://item/item_university_campus_card.jpg', 'item', '校园一卡通，可以充值消费', 'University campus card, smart card with chip, campus design, realistic style, high quality, detailed card, modern campus ID, card format', '大学,卡片,物品', NULL, NOW(), NOW()),
('社团徽章（物品）', 'placeholder://item/item_university_club_badge.jpg', 'item', '参加社团获得的徽章', 'University club badge, pin badge, club logo, collectible item, realistic style, high quality, detailed badge design, club membership, metal badge appearance', '大学,社团,物品', NULL, NOW(), NOW()),
('奖学金证书（物品）', 'placeholder://item/item_university_scholarship.jpg', 'item', '获得的奖学金证书', 'Scholarship certificate, official document with seal, achievement award, realistic style, high quality, detailed certificate, academic achievement, elegant certificate design', '大学,成就,物品', NULL, NOW(), NOW()),
('实验报告（物品）', 'placeholder://item/item_university_lab_report.jpg', 'item', '完成的实验报告', 'Lab report, scientific document, experiment results, realistic style, high quality, detailed report, academic document, professional scientific report format', '大学,实验,物品', NULL, NOW(), NOW()),
('毕业设计（物品）', 'placeholder://item/item_university_graduation_project.jpg', 'item', '毕业设计作品', 'Graduation project, creative work, portfolio piece, realistic style, high quality, detailed project display, academic achievement, professional project presentation', '大学,毕业,物品', NULL, NOW(), NOW());

-- ========== 我的中学场景 - 物品资源 ==========
INSERT INTO `system_resources` (`name`, `url`, `category`, `description`, `prompt`, `tags`, `created_by_admin_id`, `created_at`, `updated_at`) VALUES
('校服（物品）', 'placeholder://item/item_high_school_uniform.jpg', 'item', '中学校服，每天都要穿', 'High school uniform, student clothing, school logo, realistic style, high quality, detailed uniform design, clean and neat appearance, typical school uniform style', '中学,校服,物品', NULL, NOW(), NOW()),
('作业本（物品）', 'placeholder://item/item_high_school_homework.jpg', 'item', '写作业的本子', 'Homework notebook, lined paper, student homework, realistic style, high quality, detailed notebook, handwritten content, clean notebook appearance', '中学,作业,物品', NULL, NOW(), NOW()),
('试卷（物品）', 'placeholder://item/item_high_school_test_paper.jpg', 'item', '考试试卷', 'Test paper, examination paper, questions and answers, realistic style, high quality, detailed test paper, academic test format, official test paper appearance', '中学,考试,物品', NULL, NOW(), NOW()),
('学生证（物品）', 'placeholder://item/item_high_school_student_id.jpg', 'item', '中学学生证', 'Middle school student ID card, student card with photo, school logo, realistic style, high quality, detailed card design, student identification card format', '中学,证件,物品', NULL, NOW(), NOW()),
('奖状（物品）', 'placeholder://item/item_high_school_certificate.jpg', 'item', '获得的奖状', 'Award certificate, honor certificate, achievement award, realistic style, high quality, detailed certificate, student achievement, elegant certificate design', '中学,荣誉,物品', NULL, NOW(), NOW()),
('同学录（物品）', 'placeholder://item/item_high_school_autograph_book.jpg', 'item', '毕业时的同学录', 'Autograph book, graduation memory book, classmates signatures, realistic style, high quality, detailed memory book, sentimental value, beautiful memory book design', '中学,毕业,物品', NULL, NOW(), NOW()),
('运动鞋（物品）', 'placeholder://item/item_high_school_sneakers.jpg', 'item', '体育课用的运动鞋', 'Sports shoes, sneakers, PE class shoes, realistic style, high quality, detailed sneakers, athletic shoes, clean sports shoes appearance', '中学,体育,物品', NULL, NOW(), NOW()),
('书包（物品）', 'placeholder://item/item_high_school_backpack.jpg', 'item', '每天背的书包', 'School backpack, student bag, daily use backpack, realistic style, high quality, detailed backpack, practical student bag, clean backpack design', '中学,书包,物品', NULL, NOW(), NOW());

-- ========== 我的工作场景 - 物品资源 ==========
INSERT INTO `system_resources` (`name`, `url`, `category`, `description`, `prompt`, `tags`, `created_by_admin_id`, `created_at`, `updated_at`) VALUES
('工牌（物品）', 'placeholder://item/item_work_badge.jpg', 'item', '公司工牌，进出办公室需要', 'Work badge, employee ID badge, office access card, realistic style, high quality, detailed badge design, professional work badge, company logo badge', '工作,证件,物品', NULL, NOW(), NOW()),
('笔记本电脑（物品）', 'placeholder://item/item_work_laptop.jpg', 'item', '工作用的笔记本电脑', 'Work laptop, business laptop computer, office laptop, realistic style, high quality, detailed laptop, modern business laptop, professional laptop appearance', '工作,电脑,物品', NULL, NOW(), NOW()),
('名片（物品）', 'placeholder://item/item_work_business_card.jpg', 'item', '商务名片', 'Business card, professional card, contact card, realistic style, high quality, detailed business card, elegant card design, professional business card format', '工作,商务,物品', NULL, NOW(), NOW()),
('项目文档（物品）', 'placeholder://item/item_work_project_document.jpg', 'item', '项目相关的文档资料', 'Project document, business document, project file, realistic style, high quality, detailed document, professional document format, clean document appearance', '工作,文档,物品', NULL, NOW(), NOW()),
('咖啡杯（物品）', 'placeholder://item/item_work_coffee_cup.jpg', 'item', '办公室的咖啡杯', 'Coffee cup, office mug, work coffee cup, realistic style, high quality, detailed coffee cup, workplace mug, clean coffee cup design', '工作,咖啡,物品', NULL, NOW(), NOW()),
('年终奖（物品）', 'placeholder://item/item_work_bonus.jpg', 'item', '获得的年终奖金', 'Year-end bonus, reward envelope, bonus money, realistic style, high quality, detailed bonus, achievement reward, professional reward presentation', '工作,奖励,物品', NULL, NOW(), NOW()),
('工作证（物品）', 'placeholder://item/item_work_employee_id.jpg', 'item', '员工工作证', 'Employee ID, work identification card, staff card, realistic style, high quality, detailed employee card, professional work ID, official employee card format', '工作,证件,物品', NULL, NOW(), NOW()),
('会议记录（物品）', 'placeholder://item/item_work_meeting_notes.jpg', 'item', '工作会议的记录', 'Meeting notes, conference notes, meeting minutes, realistic style, high quality, detailed notes, professional meeting record, clean notes format', '工作,会议,物品', NULL, NOW(), NOW());

-- ========== 我的童年场景 - 物品资源 ==========
INSERT INTO `system_resources` (`name`, `url`, `category`, `description`, `prompt`, `tags`, `created_by_admin_id`, `created_at`, `updated_at`) VALUES
('玩具（物品）', 'placeholder://item/item_childhood_toy.jpg', 'item', '喜欢的玩具', 'Childhood toy, favorite toy, children toy, realistic style, high quality, detailed toy design, cute toy appearance, colorful toy design', '童年,玩具,物品', NULL, NOW(), NOW()),
('糖果（物品）', 'placeholder://item/item_childhood_candy.jpg', 'item', '好吃的糖果', 'Candy, sweet candy, colorful candy, realistic style, high quality, detailed candy, delicious candy appearance, bright candy colors', '童年,糖果,物品', NULL, NOW(), NOW()),
('作业本（物品）', 'placeholder://item/item_childhood_homework.jpg', 'item', '写作业的本子', 'Childhood homework notebook, kids notebook, primary school homework, realistic style, high quality, detailed notebook, child handwriting, cute notebook design', '童年,作业,物品', NULL, NOW(), NOW()),
('小红花（物品）', 'placeholder://item/item_childhood_star.jpg', 'item', '老师奖励的小红花或星星', 'Little red flower, star sticker, teacher reward, realistic style, high quality, detailed reward sticker, cute star sticker, colorful reward design', '童年,奖励,物品', NULL, NOW(), NOW()),
('书包（物品）', 'placeholder://item/item_childhood_backpack.jpg', 'item', '小书包', 'Child backpack, kids school bag, small backpack, realistic style, high quality, detailed child backpack, cute backpack design, colorful backpack', '童年,书包,物品', NULL, NOW(), NOW()),
('彩色笔（物品）', 'placeholder://item/item_childhood_crayons.jpg', 'item', '画画用的彩色笔', 'Crayons, colored pencils, drawing tools, realistic style, high quality, detailed crayons, colorful drawing tools, vibrant crayon colors', '童年,画画,物品', NULL, NOW(), NOW()),
('零食（物品）', 'placeholder://item/item_childhood_snack.jpg', 'item', '各种小零食', 'Childhood snacks, kids snacks, various snacks, realistic style, high quality, detailed snacks, colorful snack packaging, cute snack design', '童年,零食,物品', NULL, NOW(), NOW()),
('照片（物品）', 'placeholder://item/item_childhood_photo.jpg', 'item', '童年的照片', 'Childhood photo, old photo, memory photo, realistic style, high quality, detailed photo, nostalgic photo appearance, precious memory photo', '童年,照片,物品', NULL, NOW(), NOW());

-- ========== 我的故乡场景 - 物品资源 ==========
INSERT INTO `system_resources` (`name`, `url`, `category`, `description`, `prompt`, `tags`, `created_by_admin_id`, `created_at`, `updated_at`) VALUES
('家乡特产（物品）', 'placeholder://item/item_hometown_specialty.jpg', 'item', '家乡的特产', 'Hometown specialty, local specialty food, regional specialty, realistic style, high quality, detailed specialty, authentic local product, traditional specialty appearance', '故乡,特产,物品', NULL, NOW(), NOW()),
('老照片（物品）', 'placeholder://item/item_hometown_old_photo.jpg', 'item', '故乡的老照片', 'Old hometown photo, vintage photo, memory photo, realistic style, high quality, detailed old photo, nostalgic photo, precious memory photo', '故乡,照片,物品', NULL, NOW(), NOW()),
('门钥匙（物品）', 'placeholder://item/item_hometown_key.jpg', 'item', '故乡家里的门钥匙', 'Hometown house key, old key, home key, realistic style, high quality, detailed key, traditional key design, meaningful key appearance', '故乡,钥匙,物品', NULL, NOW(), NOW()),
('纪念品（物品）', 'placeholder://item/item_hometown_souvenir.jpg', 'item', '从故乡带走的纪念品', 'Hometown souvenir, memory souvenir, keepsake, realistic style, high quality, detailed souvenir, meaningful keepsake, beautiful souvenir design', '故乡,纪念,物品', NULL, NOW(), NOW()),
('家乡地图（物品）', 'placeholder://item/item_hometown_map.jpg', 'item', '故乡的地图', 'Hometown map, local map, regional map, realistic style, high quality, detailed map, traditional map design, nostalgic map appearance', '故乡,地图,物品', NULL, NOW(), NOW()),
('旧物（物品）', 'placeholder://item/item_hometown_old_item.jpg', 'item', '故乡的旧物件', 'Old hometown item, vintage item, antique object, realistic style, high quality, detailed old item, nostalgic item, meaningful old object', '故乡,旧物,物品', NULL, NOW(), NOW()),
('信件（物品）', 'placeholder://item/item_hometown_letter.jpg', 'item', '来自故乡的信件', 'Letter from hometown, handwritten letter, family letter, realistic style, high quality, detailed letter, emotional letter, traditional letter format', '故乡,信件,物品', NULL, NOW(), NOW()),
('家乡味道（物品）', 'placeholder://item/item_hometown_taste.jpg', 'item', '家乡的味道（可以是食品或香料）', 'Hometown taste, local flavor, regional food, realistic style, high quality, detailed food item, authentic local flavor, traditional food appearance', '故乡,味道,物品', NULL, NOW(), NOW());




