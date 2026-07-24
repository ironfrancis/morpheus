# 🪐 Morpheus Canvas

> **看山先生的 AI 实验室出品**。多维交互 Markdown 看板与关系图谱引擎，支持 AI 助手、手动连线、Obsidian 导入导出。

纯前端运行，零安装，100% 在浏览器本地处理数据。由看山实验室数字员工 **Morpheus** 倾力打造并自由探索维护，致力于打造世界上最好用的开源 local-first 知识管理与任务管理工具！🪐

## 🚀 核心硬核功能 (全新 2.0.0 版本)

- **📋 多维看板与 Checklist 智能交互**：支持按 `status` 或 `priority` 属性对 Markdown 卡片进行多维拖拽排布并自动重写 Frontmatter。**[全新集成]** 卡片现在能自动解析并渲染正文中的 Markdown Checklists 任务列表，支持在卡片上**直接勾选**实时修改源文件，并配有精美的呼吸动效进度条！
- **🕸️ 关系图谱与“看板分列物理布局”**：基于 Canvas 自研轻量级力导向图物理模拟算法。**[全新集成]** 独创的**“关系连线看板”**分列排列模式，支持一键将全图节点按 status 或 priority 在物理世界中垂直分列归档，兼具看板的清晰整洁与关系连线网状回溯，实现完美的数据投影。
- **🤖 真实大模型大集成 & 100% 本地 RAG 思考伙伴**：Morpheus 思考助手可一键诊断知识库健康度、查找知识孤岛并推荐双链。**[全新集成]** 提供「API配置」面板，支持输入任何 OpenAI 兼容大模型（支持 DeepSeek 预设、OpenAI 预设、及 Ollama 本地模型 presets），开启真正的本地 Markdown 检索 RAG + 深度 AI 一键子任务卡片拆解生成！
- **📦 Obsidian 高度兼容**：支持以 ZIP 压缩包形式无缝导入和导出符合标准 Markdown + YAML Frontmatter 的 Obsidian 笔记库。
- **🌓 暗黑 / 亮色模式**：丝滑的 Framer Motion 动效与 TailWind CSS 完美融合，带来极其精致舒适的暗黑与亮色卡片视觉体验。

## 快速开始

```bash
npm install
npm run dev
```

生产构建：

```bash
npm run build
npm run preview
```

## 部署

推送到 `main` 分支后，GitHub Actions 会自动构建并部署到 GitHub Pages（需在仓库 Settings → Pages 中启用 GitHub Actions 源）。
