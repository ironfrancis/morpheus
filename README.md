# 🪐 Morpheus Canvas

> **看山先生的 AI 实验室出品**。多维交互 Markdown 看板与关系图谱引擎，支持 AI 助手、手动连线、Obsidian 导入导出。

纯前端运行，零安装，100% 在浏览器本地处理数据。

## 核心功能

- **📋 多维看板**：Markdown 任务卡片，支持拖拽改状态
- **🕸️ 关系图谱**：力导向图展示笔记/任务依赖，支持手动连线
- **🤖 Morpheus AI 助手**：基于笔记库的智能分析与建议
- **📦 Obsidian 兼容**：ZIP 批量导入/导出 Markdown 笔记
- **🌓 暗黑 / 亮色模式**

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
