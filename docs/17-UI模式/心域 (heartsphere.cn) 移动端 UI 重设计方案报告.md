# 心域 (heartsphere.cn) 移动端 UI 重设计方案报告

**设计理念：** **“海与天空的宁静，星辰的连接”**

本报告针对 heartsphere.cn 的移动端页面（mobile.html）进行重设计，旨在将“海与天空”的宁静风格和“星辰连接”的意境完美融合到小屏幕上，提供极致放松的移动体验。

## 一、 现有移动端分析与痛点

通过对 `http://heartsphere.cn/mobile.html` 的分析，发现现有移动端页面存在以下痛点：

1.  **视觉风格冲突：** 现有移动端采用深色背景和高对比度的元素，与用户要求的“宁静、淡泊、放松”的风格完全不符。
2.  **信息密度过高：** 底部导航栏图标和文字拥挤，缺乏呼吸感。
3.  **缺乏沉浸感：** “心域连接”页面虽然采用了星空元素，但元素过于简单，缺乏艺术性和深度，无法带来心旷神怡的感觉。

## 二、 移动端重设计策略

| 页面 | 核心策略 | 视觉表现 |
| :--- | :--- | :--- |
| **场景选择** | **卡片化、水平滚动** | 采用**浅蓝云纹背景**，场景卡片为**大圆角白色浮动卡片**。卡片采用水平滚动，让用户专注于当前场景，避免垂直列表的压迫感。 |
| **心域连接** | **全屏沉浸式星空** | 采用用户提供的**深蓝星空图**作为全屏背景，并进行艺术化柔化处理。将角色和心域具象化为**柔光星辰**，顶部和底部 UI 元素最小化，以突出沉浸感。 |
| **底部导航** | **半透明、居中突出** | 采用**半透明白色**的底部 Tab Bar，图标使用柔和的**Clear Sky Blue**。将核心功能（如“心域连接”）的图标进行放大和突出，方便单手操作。 |

## 三、 移动端视觉参考图

### 1. 场景选择页 (Scene Selection)

设计强调留白和卡片的柔和感，符合“海与天空”的宁静主题。

![移动端场景选择页重设计参考图](https://private-us-east-1.manuscdn.com/sessionFile/dZz6KJmBRnCQJf2AvUNtvk/sandbox/dhBU0W6qtA21QwM4EsZuQb-images_1768745521296_na1fn_L2hvbWUvdWJ1bnR1L2hlYXJ0c3BoZXJlX21vYmlsZV9zY2VuZV9zZWxlY3Rpb24.png?Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvZFp6NktKbUJSbkNRSmYyQXZVTnR2ay9zYW5kYm94L2RoQlUwVzZxdEEyMVF3TTRFc1p1UWItaW1hZ2VzXzE3Njg3NDU1MjEyOTZfbmExZm5fTDJodmJXVXZkV0oxYm5SMUwyaGxZWEowYzNCb1pYSmxYMjF2WW1sc1pWOXpZMlZ1WlY5elpXeGxZM1JwYjI0LnBuZyIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTc5ODc2MTYwMH19fV19&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=ozOMD0VI9ztog6anrBHzi7RVVjAJRglSYtaeDh1~cffH7ON3Fkg2GEHnC0mcCn62N1qQ55ECPgePuHnslroy1GjhXZ1KhG3LhGejXSI~SIbvwnXF5KHvt0zhFYPTkJ36zRsxr-479zLhiFwaeL2E6NJMEgIv9vYC1paCtzhtdJvhxBdcWeRGvIEwFnTrQpWVNJq9CHx3kDXBsnuKgsfoKHXjhBW92hPtSpOeRqAY2gUCJx221-5BkkzhzXv6aZntLpEePDxaGd-g2F9VmCyRtimoQCQl9MXe-dr5NJ-cjqpngEjUYsJ3wBTIPxJIAKQDUv-G7DmJLmtH9IJckeQd9g__)

### 2. 星空连接页 (Starry Connection)

设计完全沉浸在深邃而柔和的星空背景中，将角色和心域转化为发光的星辰，营造出心旷神怡的连接意境。

![移动端星空连接页重设计参考图](https://private-us-east-1.manuscdn.com/sessionFile/dZz6KJmBRnCQJf2AvUNtvk/sandbox/dhBU0W6qtA21QwM4EsZuQb-images_1768745521297_na1fn_L2hvbWUvdWJ1bnR1L2hlYXJ0c3BoZXJlX21vYmlsZV9zdGFycnlfY29ubmVjdGlvbg.png?Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvZFp6NktKbUJSbkNRSmYyQXZVTnR2ay9zYW5kYm94L2RoQlUwVzZxdEEyMVF3TTRFc1p1UWItaW1hZ2VzXzE3Njg3NDU1MjEyOTdfbmExZm5fTDJodmJXVXZkV0oxYm5SMUwyaGxZWEowYzNCb1pYSmxYMjF2WW1sc1pWOXpkR0Z5Y25sZlkyOXVibVZqZEdsdmJnLnBuZyIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTc5ODc2MTYwMH19fV19&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=RjM3JpE5EcqWRW~SHcCQPHKt5ocdiqislieingItFws90n8YdHICdJs13mAE0SRKQWpFbKLDkEicJLDXCY96peGTv-Ib5MQU--pW5Br09n6E8WITOYln4KhKHA7DwkxOPbDSNn4gr2P80CgMPdyN-oJ3tnb90PsvnZT3BE3JFi3fyk6BOr35Pr-hyv2JwXei2Xw9nSdZw57DkivEHVxeteR2IvXX3IXX9KDj03TFCl6lwvkxfok4YaoxNzc24eVLd8uqp8L~RoEuyvLoJT~ErbD-U3a5mb2C~lYeXvqbGJgTP9xM5An223NkV3qSQD~nVfxZXJvPzrzXxBfDdIND5A__)

本方案旨在通过**浅色背景、柔和元素和沉浸式星空**，为 heartsphere.cn 的移动端用户带来一个真正放松、舒适的“心灵港湾”体验。
