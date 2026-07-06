# 🪐 Morpheus Visualizer
> **看山先生的 AI 实验室出品**。一个纯前端运行、零安装、超高颜值的 Markdown-to-Timeline & Board & Graph 多维交互协作与大屏展示引擎。
> 
> *A highly interactive, zero-install, beautiful Markdown-to-Timeline, Kanban Board & Force-Directed Graph visualizer for AI agents & modern agile teams.*

<p align="center">
  <img src="./public/favicon.svg" width="120" height="120" alt="Morpheus Logo" />
</p>

---

## 🌟 项目简介 (Project Profile)
在 AI 爆发的 2026 年，大语言模型 (LLMs) 和数字员工 (AI Agents) 每天为我们输出成千上万行的结构化 Markdown。然而，长篇大论的文字列表不仅难看，也让团队难以一眼掌握核心里程碑和依赖关系。

**Morpheus** 就是为了解决这一痛点而生的开源神器！它**无需数据库、无需任何后端服务，100% 运行在浏览器中**。你只需要贴入最普通的 Markdown 文件，Morpheus 就会实时编译并为你一键渲染出：
1. **📅 Timeline (交互式项目时间线 / 里程碑流)**：根据日期和重要级别 (P0-P5)，展示带有子任务清单的高颜值时间轴，支持标记子任务完成度。
2. **📋 Board (敏捷看板视图 / 卡片流)**：将 `- [ ]` 列表项转换成“待规划、待开始、进行中、已完成”的自适应卡片。你可以直接在卡片上操作状态，系统会实时反馈并双向重构左侧的 Markdown 源码！
3. **🕸️ Graph (项目全景知识图谱)**：纯 Canvas 实现的高性能 2D 力导向关系仿真图。支持将节点（项目、任务、文档、标签）抽象并直观展示它们之间的依赖与包含关系，支持拖拽、交互和实时力学演进。

---

## 🚀 核心特性 (Key Features)
- **🎨 极致的美学体验**：看山实验室精心调配的专属紫色 (`#aa3bff`) 主题，支持丝滑的暗黑模式 (Dark Mode) 与日间模式 (Light Mode) 切换。
- **📦 零后端与极致安全隐私**：100% 静态应用，所有的解析、图谱计算、拖拽状态均在你的浏览器本地进行，数据绝不上载，安全无忧。
- **🔗 专属加密分享状态**：支持将当前的 Markdown 编辑内容打包，经过压缩和 Base64 编码，直接转换成一个独一无二的 URL。你可以直接将链接发给同事，他们打开即是和你一模一样的可视化看板！
- **🧠 数字员工友好 (Agent-Friendly)**：Morpheus 的格式标准对 AI 极其友好。你可以非常简单地给 AI 发送 Prompt：*“请使用 Morpheus 格式为我规划该项目的里程碑和看板任务。”*，随后将 AI 的产出贴入 Morpheus 即可一键成图。

---

## 📝 语法规范与示例 (Markdown Syntax & Examples)
Morpheus 通过普通的 Markdown 结构自动区分各个视图：

### 1. 时间轴 (## Timeline)
```markdown
## Timeline (项目里程碑时间线)
- [2026-07-06] [record-entry] 项目启动: 看山实验室数字员工 Morpheus 确定开源选题。 {prio=0, assignee=Morpheus, tags=morpheus|init}
- [2026-07-07] [task] 架构设计: 设计核心数据结构。 {prio=1, assignee=Morpheus}
  - [x] 定义多合一 Markdown 解析格式
  - [ ] 确定 UI 整体配色风格
```

### 2. 看板 (## Board)
```markdown
## Board (敏捷开发看板)
- [x] 选题灵感收集: 深入调研 2026 年 GitHub 趋势。 {prio=urgent, assignee=Morpheus, status=completed}
- [ ] 解析器开发: 实现对 [YYYY-MM-DD] 格式的正则匹配。 {prio=high, assignee=Morpheus, status=in_progress}
```

### 3. 关系拓扑图谱 (## Graph)
```markdown
## Graph (知识图谱与依赖关系)
MorpheusVisualizer {type=project, val=22}
数据解析器 {type=document, val=12}

- MorpheusVisualizer -> 数据解析器 : 包含
```

---

## 🛠 开发与构建指引 (Development & Build Guide)

本项目的代码结构极度清晰、无冗余，采用现代前端顶级技术栈构建：

*   **Vite 8** + **React 19** + **TypeScript 6** (极速打包体验与强类型约束)
-   **Tailwind CSS v4** (下一代 CSS-first 现代样式体系)
-   **Lucide React** (高颜值矢量图标库)
-   **Canvas + Force Simulation** (高灵活性、流畅的力学图交互)

### 快速开始 (Quick Start)
1.  **克隆本仓库并安装依赖**：
    ```bash
    npm install
    ```
2.  **启动本地开发服务器**：
    ```bash
    npm run dev
    ```
3.  **生产环境打包编译**：
    ```bash
    npm run build
    ```
    *构建产物将输出在 `dist/` 目录下，均为纯静态 HTML/JS/CSS，可直接部署在任意托管平台上。*

### 💡 自动构建与部署 (GitHub Actions Deploy)
本项目已内置了配置完备的 `.github/workflows/deploy.yml`。
当你每次向 `main` 分支推送（或触发 `workflow_dispatch`）时，GitHub Actions 会自动触发构建，并将最新的 `dist/` 产物无缝发布至本仓库对应的 **GitHub Pages** 静态页面上，供人类用户和开源社区进行实时在线预览！

---

## 💜 致谢与 Star 支持 (Support us)
Morpheus 看板是由**看山先生的 AI 实验室**数字员工 **Morpheus** 在 Cursor 环境中自主设计、编码、测试和留痕发布的。
如果你喜欢这个项目，或者它在团队协作、AI 辅助规划中对你有所启发，请点击右上角为我们点一个 **⭐ Star**！这也是对我们看山实验室数字员工团队最大的鼓舞！

*Designed, coded and deployed with 💜 by Morpheus Agent.*
