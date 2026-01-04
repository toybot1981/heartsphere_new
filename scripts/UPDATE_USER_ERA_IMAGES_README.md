# 更新用户场景图片脚本说明

## 功能说明

此脚本用于更新用户已创建场景的图片URL。当用户场景的图片URL为空、无效或丢失时，脚本会：

1. 通过 `system_era_id` 关联到系统预置场景（`system_eras` 表）
2. 如果系统预置场景有有效的图片URL，则更新用户场景的图片URL
3. 显示更新前后的统计信息

## 文件说明

- `update_user_era_images_from_system.sql` - SQL更新脚本
- `update_user_era_images_from_system.sh` - Shell执行脚本

## 使用方法

### 本地数据库

```bash
./scripts/update_user_era_images_from_system.sh
```

### 远程数据库

```bash
./scripts/update_user_era_images_from_system.sh remote
```

执行远程脚本时，会提示输入：
- 数据库主机
- 数据库端口（默认：3306）
- 数据库用户名
- 数据库密码
- 数据库名称

## 更新条件

脚本只会更新满足以下条件的用户场景：

1. `is_deleted = 0`（未删除）
2. `system_era_id IS NOT NULL`（有关联的系统预置场景）
3. 图片URL为空、null、placeholder或无效：
   - `image_url IS NULL`
   - `image_url = ''`
   - `image_url LIKE 'placeholder://%'`
   - `image_url NOT LIKE 'http://%'` 或 `image_url NOT LIKE 'https://%'`
4. 系统预置场景有有效的图片URL：
   - `se.image_url IS NOT NULL`
   - `se.image_url != ''`
   - `se.image_url NOT LIKE 'placeholder://%'`
   - `se.image_url LIKE 'http://%'` 或 `se.image_url LIKE 'https://%'` 或 `se.image_url LIKE 'images/%'`

## 输出信息

脚本会显示：

1. **更新前统计**：
   - 用户场景总数
   - 没有图片的场景数量
   - 有关联系统预置场景的数量
   - 可以更新的场景数量

2. **更新结果**：
   - 实际更新的场景数量

3. **更新后统计**：
   - 用户场景总数
   - 没有图片的场景数量
   - 有关联系统预置场景的数量
   - 有有效图片的场景数量

4. **更新详情**（最近1分钟内更新的场景，最多20条）：
   - 场景ID和名称
   - 系统预置场景ID和名称
   - 更新后的图片URL
   - 更新时间

## 注意事项

1. **备份数据**：执行前建议备份数据库
2. **确认操作**：脚本会要求输入 `YES` 确认操作
3. **安全更新**：只更新图片URL为空或无效的场景，不会覆盖已有的有效图片
4. **关联要求**：只有有关联系统预置场景（`system_era_id`）的用户场景才会被更新

## 示例输出

```
========================================
  更新用户场景图片（本地数据库）
========================================
数据库: localhost:3306/heartsphere
用户: root

即将更新本地数据库中的用户场景图片
确认继续？(输入 YES 继续): YES
正在执行SQL更新...

更新前统计
total_user_eras: 50
eras_without_image: 15
eras_with_system_era_id: 45
eras_can_be_updated: 12

更新结果
updated_count: 12

更新后统计
total_user_eras: 50
eras_without_image: 3
eras_with_system_era_id: 45
eras_with_valid_image: 42

✅ 更新完成！
========================================
```

## 故障排查

如果更新失败，请检查：

1. 数据库连接是否正常
2. 数据库用户是否有更新权限
3. SQL语法是否正确
4. `eras` 表和 `system_eras` 表是否存在
5. `system_era_id` 字段是否正确关联
