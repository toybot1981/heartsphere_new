# Figma MCP 工具说明

本文档说明 Framelink MCP for Figma 提供的两个工具的参数与典型用法，以及如何从 Figma URL 获取 `fileKey` 和 `nodeId`。

## 从 Figma URL 获取 fileKey 和 nodeId

- **fileKey**：Figma 文件链接中 `figma.com/file/` 或 `figma.com/design/` 后面的第一段字母数字串。
  - 示例：`https://www.figma.com/design/AbCdEf123/My-File` → `fileKey` = `AbCdEf123`
  - 或：`https://www.figma.com/file/xyz789/Project` → `fileKey` = `xyz789`
- **nodeId**：若链接带有节点参数，格式为 `node-id=1234-5678` 或 `node-id=1234:5678`；多节点用分号分隔，如 `1234:5678;1:10515`。工具接受格式 `1234:5678` 或 `I5666:180910;1:10515;1:10336`（带或不带 `I` 前缀，分隔符 `-` 或 `:` 均可，多节点用 `;`）。

## get_figma_data

**作用**：获取 Figma 文件/节点的布局、内容、视觉与组件信息。

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| fileKey | string | 是 | 文件 key，来自 URL 的 `figma.com/(file\|design)/<fileKey>/...`，仅字母数字 `^[a-zA-Z0-9]+$` |
| nodeId | string | 否 | 节点 ID，来自 URL 的 `node-id=<nodeId>`；单节点 `1234:5678`，多节点 `I5666:180910;1:10515;1:10336` |
| depth | number | 否 | 可选，控制遍历节点树的深度；非用户明确要求时可不传 |

**典型用法**：先根据用户提供的 Figma 链接解析出 `fileKey`，若链接指向某一帧/组件则解析出 `nodeId`，调用时传入 `fileKey`，有 `nodeId` 时一并传入。

## download_figma_images

**作用**：根据 Figma 文件中图片/图标节点的 ID 下载 SVG 或 PNG 到本地目录。

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| fileKey | string | 是 | 包含图片的 Figma 文件 key |
| nodes | array | 是 | 要导出的节点列表，每项见下表 |
| localPath | string | 是 | 保存文件的本地目录绝对路径；不存在时会创建 |
| pngScale | number | 否 | PNG 导出倍率，默认 2；仅影响 PNG |

**nodes 每项**：

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| nodeId | string | 是 | 节点 ID，格式 `1234:5678` |
| fileName | string | 是 | 本地文件名，含扩展名，如 `icon.svg`、`banner.png`，仅允许 `[a-zA-Z0-9_.-]+\.(png\|svg)` |
| imageRef | string | 否 | 若节点有 imageRef fill 则必填；导出矢量 SVG 时可留空 |
| needsCropping | boolean | 否 | 是否按变换矩阵裁剪 |
| cropTransform | array | 否 | Figma 裁剪变换矩阵 |
| requiresImageDimensions | boolean | 否 | 是否需要尺寸信息用于 CSS 变量 |
| filenameSuffix | string | 否 | 裁剪图唯一后缀（如 `abc123`） |

**典型用法**：先用 `get_figma_data` 拿到节点树，从中选出要导出的图片/图标节点，得到其 `nodeId`（及若有 `imageRef`）；再构造 `nodes` 数组并指定 `localPath`（建议与前端资源目录一致，如 `main/frontend/public/assets/icons`），调用 `download_figma_images`。
