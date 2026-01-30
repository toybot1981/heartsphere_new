---
name: ui-design-figma
description: "UI design and implementation from Figma. Use when the user wants to implement UI from Figma, parse design files, export assets (icons, images), or align code with Figma designs. Delivered via Figma MCP (e.g. Framelink MCP for Figma) or other Figma tools; requires Figma app key or token to be configured."
---

# UI Design from Figma

This skill guides **UI design, design-to-code, and asset export** using Figma. Use it when the user wants to implement interfaces from Figma, parse design files, export icons/images, or keep code aligned with Figma designs. Delivered via **Figma MCP** (e.g. Framelink MCP for Figma) or other Figma tools.

## When to Use

- User asks to implement UI from a Figma design or design link
- User wants to export assets (icons, images, SVG/PNG) from Figma into the project
- User wants to extract layout, styles, or component info from a Figma file
- User mentions Figma, design稿, 设计稿, 界面还原, 资源导出 in the context of UI design

**Prerequisite**: Figma MCP (e.g. Framelink MCP for Figma) must be enabled in Cursor, and Figma app key or Personal Access Token must be configured (see [Figma 访问凭证](#figma-访问凭证) below). Do not store the actual key or token in the skill or repo.

## Workflow (Figma → Code / Spec)

1. **Get fileKey and nodeId** from the Figma URL (see `references/figma-mcp-tools.md`).
2. **Fetch design data**: Use MCP tool `get_figma_data` with `fileKey` (and optionally `nodeId`, `depth`) to get layout, content, and component information.
3. **Export assets**: Use MCP tool `download_figma_images` with `fileKey`, `nodes`, and `localPath` to export SVG/PNG into the project (e.g. under frontend `assets` or `public`).
4. **Align with project UX**: When implementing or reviewing, follow `openspec/project.md` **UX Design Guidelines** and theme/token conventions (colors as CSS variables, spacing, typography). See `references/figma-to-ux-checklist.md` for a short checklist.

## Figma MCP Tools (Preferred)

- **get_figma_data**: Get file/node structure, layout, content, and component info. Required: `fileKey`. Optional: `nodeId`, `depth`.
- **download_figma_images**: Export SVG/PNG from given nodes to a local directory. Required: `fileKey`, `nodes`, `localPath`. Optional: `pngScale`.

Details, parameter formats, and how to derive `fileKey`/`nodeId` from Figma URLs are in `references/figma-mcp-tools.md`.

## Figma 访问凭证

Figma app key (or the MCP’s required Personal Access Token) must be configured **outside** this repo:

- **Cursor**: Enable the Figma MCP (e.g. “Framelink MCP for Figma”) in Cursor MCP settings and set the token there, or via the environment variable the MCP expects.
- **Location**: Do not put the key or token in the skill or in version control. Document only *where* to configure it (e.g. “Figma MCP settings in Cursor” or “env var FIGMA_ACCESS_TOKEN”).

If the MCP is not configured or the token is invalid, you can still describe the workflow and point the user to configure the Figma app key / token.

## Alignment with Project UX

When turning Figma into code or specs, align with:

- **openspec/project.md** → “UX Design Guidelines”, “多风格支持” / theme system
- Use **CSS variables** for colors and theme; match spacing and typography to the design system
- Use `references/figma-to-ux-checklist.md` for a quick design-to-ux check before implementation
