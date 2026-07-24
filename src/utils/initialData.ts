export const initialNotes = [
  {
    id: 'morpheus-canvas',
    content: `---
title: Morpheus Canvas 核心架构
status: in_progress
priority: high
tags: [architecture, react19, canvas]
dueDate: 2026-07-15
---
# Morpheus Canvas 核心架构

Morpheus Canvas 是一款结合了 **多维看板 (Kanban)** 与 **关系图谱 (Graph)** 的 Markdown 知识管理工具。

## 开发进度
- [x] 多维看板多维分组视图
- [ ] 自研 Canvas 力导向图物理物理学算法
- [ ] 智能双向链接推荐与计算
- [x] 兼容 Obsidian 的 ZIP 导入导出

## 核心组件与依赖
- 看板视图：[[kanban-board-design|看板视图设计]]
- 关系图谱：[[relationship-graph-engine|关系图谱引擎]]
- 数据流：[[data-flow-and-parser|数据流与解析器]]

## 核心设计理念
1. **数据即文件**：所有的卡片都是标准的 Markdown 文件，带有 YAML-like 的 Frontmatter。
2. **多维投影**：同一份 Markdown 笔记，既可以在 [[kanban-board-design]] 中作为卡片拖拽，也可以在 [[relationship-graph-engine]] 中作为节点进行网状探索。
3. **双向链接**：通过 \`[[Note ID]]\` 语法构建笔记之间的网状连接，自动计算反向链接。
`
  },
  {
    id: 'kanban-board-design',
    content: `---
title: 看板视图设计
status: done
priority: medium
tags: [ui, drag-drop, framer-motion]
dueDate: 2026-07-10
---
# 看板视图设计

看板视图将 Markdown 笔记中的 Frontmatter 属性（如 \`status\` 或 \`priority\`）投影为看板的列。

## 关键特性
- **多维分组**：支持按 \`status\` (Todo, In Progress, Done) 或 \`priority\` (High, Medium, Low) 动态重组看板。
- **拖拽更新**：拖拽卡片到新列时，自动重写 Markdown 的 Frontmatter 属性。
- **流畅动画**：使用 [[framer-motion-integration|Framer Motion]] 实现丝滑的布局过渡与拖拽手感。

## 关联组件
- 核心架构：[[morpheus-canvas]]
- 编辑器：[[note-editor-component|侧边栏编辑器]]
`
  },
  {
    id: 'relationship-graph-engine',
    content: `---
title: 关系图谱引擎
status: in_progress
priority: high
tags: [canvas, force-directed, math]
dueDate: 2026-07-12
---
# 关系图谱引擎

关系图谱引擎是 Morpheus Canvas 的灵魂，基于 HTML5 Canvas 自研轻量级力导向图物理模拟算法。

## 物理力学模型
- **排斥力 (Repulsion)**：节点之间存在库仑排斥力，防止节点重叠。
- **吸引力 (Attraction)**：双向链接 [[morpheus-canvas]] 之间存在弹簧拉力。
- **向心力 (Gravity)**：将所有节点轻轻拉向画布中心，防止孤立节点飘走。

## 交互功能
- **滚轮缩放与平移**：支持画布的 Zoom & Pan 交互。
- **一阶关联高亮**：鼠标悬停节点时，高亮显示该节点及其直接关联的连线与邻居节点，降低视觉噪音。
- **节点拖拽定位**：支持拖拽节点并固定其位置。
`
  },
  {
    id: 'data-flow-and-parser',
    content: `---
title: 数据流与解析器
status: todo
priority: low
tags: [parser, markdown, regex]
dueDate: 2026-07-20
---
# 数据流与解析器

数据流与解析器负责将原始 Markdown 文本转换为结构化的内存对象，并在修改后重新序列化。

## 解析流程
1. **Frontmatter 提取**：使用正则表达式匹配顶部的 \`---\` 块，解析为键值对。
2. **双向链接提取**：扫描正文中的 \`[[Note ID]]\` 模式，提取出链。
3. **反向链接计算**：遍历所有笔记的出链，为每个目标笔记构建 \`backlinks\` 数组。

## 联动更新
当在 [[kanban-board-design]] 中拖拽卡片或在 [[note-editor-component]] 中保存编辑时，解析器会重新计算整个图谱的关联关系。
`
  },
  {
    id: 'note-editor-component',
    content: `---
title: 侧边栏编辑器
status: done
priority: low
tags: [ui, editor, preview]
dueDate: 2026-07-08
---
# 侧边栏编辑器

侧边栏编辑器提供双栏/切换式编辑与预览体验。

## 核心功能
- **实时预览**：支持将 Markdown 实时渲染为 HTML。
- **双向链接高亮与跳转**：预览中的 \`[[Note ID]]\` 会渲染为可点击的交互按钮，点击可直接切换编辑目标。
- **反向链接面板**：在底部展示所有引用了当前笔记的其它笔记，方便回溯。

## 关联设计
- 看板视图：[[kanban-board-design]]
- 关系图谱：[[relationship-graph-engine]]
`
  },
  {
    id: 'framer-motion-integration',
    content: `---
title: Framer Motion 动画集成
status: done
priority: medium
tags: [animation, framer-motion]
dueDate: 2026-07-05
---
# Framer Motion 动画集成

Framer Motion 用于为 Morpheus Canvas 提供现代、灵动的动效。

## 应用场景
- **看板卡片重排**：使用 \`layoutId\` 实现卡片跨列拖拽时的平滑过渡。
- **侧边栏滑出**：[[note-editor-component]] 侧边栏滑入与滑出动画。
- **视图切换**：看板与图谱视图切换时的淡入淡出。
`
  }
];
