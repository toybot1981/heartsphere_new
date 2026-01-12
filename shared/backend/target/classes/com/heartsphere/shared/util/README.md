# Shared Utils

共享工具类目录。

## 待提取的工具类

以下工具类可能需要提取到 shared 模块：

1. **JwtUtils** - JWT工具类（需要评估是否所有子项目都需要）
2. **DTOMapper** - DTO映射器（需要评估）
3. **FileUtils** - 文件工具（如果有通用文件操作）
4. **DateUtils** - 日期工具（如果有通用日期操作）
5. **StringUtils** - 字符串工具（如果有通用字符串操作）
6. **JsonUtils** - JSON工具（如果有通用JSON操作）
7. **ValidationUtils** - 验证工具（如果有通用验证逻辑）

## 提取原则

1. **必须共享**：三个子项目都需要的工具类
2. **可选共享**：两个子项目需要的工具类，可以考虑共享
3. **不共享**：只有一个子项目需要的工具类，不共享

## 提取步骤

1. 识别需要共享的工具类
2. 复制到 shared/backend/src/main/java/com/heartsphere/shared/util/
3. 更新包名为 `com.heartsphere.shared.util`
4. 更新各子项目的依赖配置
5. 更新各子项目中的引用
