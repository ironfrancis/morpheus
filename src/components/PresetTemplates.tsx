import React from 'react';
import { ArrowRight } from 'lucide-react';

interface PresetTemplatesProps {
  onSelect: (markdown: string) => void;
  theme: 'light' | 'dark';
}

export const PresetTemplates: React.FC<PresetTemplatesProps> = ({ onSelect }) => {
  const presets = [
    {
      title: "Morpheus 引擎标准模板",
      desc: "包含项目起航、开发、CI/CD 及 Graph 依赖图谱的官方演示模板。",
      icon: "✨",
      markdown: `# Morpheus Visualizer
看山实验室出品的轻量级开源可视化引擎。专为敏捷团队、数字员工设计的实时 markdown 协作绘图与路线图展示工具。

> 💡 你可以通过在这里自由编辑 Markdown。我们会实时解析并渲染出精美的 Timeline (时间线)、看板、和关系图谱 (Graph)。

## Timeline (项目里程碑时间线)
- [2026-07-06] [record-entry] 项目启动: 看山实验室数字员工 Morpheus 确定开源选题并成功立项。 {prio=0, assignee=Morpheus, tags=morpheus|init}
- [2026-07-07] [task] 架构设计: 设计核心的数据解析层以及高颜值界面布局。 {prio=1, assignee=Morpheus, tags=arch|design}
  - [x] 定义多合一 Markdown 解析格式
  - [ ] 确定 UI 整体配色风格
- [2026-07-08] [task] 前端开发: 使用 React + TS + Tailwind V4 快速写出 Timeline、Board 和 Graph 等交互视图。 {prio=1, assignee=Morpheus, tags=code|frontend}
- [2026-07-09] [plan-item] GitHub 自动部署: 配置 GitHub Actions 自动构建，一键发布 to GitHub Pages。 {prio=2, assignee=Morpheus, tags=cicd|pages}
- [2026-07-15] [record-entry] 开源发布: 正式在 GitHub 进行推介，获取开源社区首批 Star！ {prio=0, assignee=Morpheus, tags=release|star}

## Board (敏捷开发看板)
- [x] 选题灵感收集: 深入调研 2026 年 GitHub 趋势，锁定“开发工具与可视化”方向。 {prio=urgent, assignee=Morpheus, status=completed, tags=research}
- [ ] 解析器开发: 实现对 [YYYY-MM-DD] 格式的正则匹配和图谱算法提取。 {prio=high, assignee=Morpheus, status=in_progress, tags=parser}
- [ ] 视图渲染与动效: 集成 framer-motion 实现切换 Tab 时的丝滑动画。 {prio=normal, assignee=Morpheus, status=todo, tags=ui|animation}
- [ ] 一键导出与分享: 支持将项目结构导出为 JSON 或纯图片。 {prio=low, assignee=Morpheus, status=backlog, tags=feature}

## Graph (知识图谱与依赖关系)
MorpheusVisualizer {type=project, val=22}
数据解析器 {type=document, val=12}
美观UI界面 {type=document, val=12}
自动化部署 {type=document, val=12}

- MorpheusVisualizer -> 数据解析器 : 包含
- MorpheusVisualizer -> 美观UI界面 : 包含
- MorpheusVisualizer -> 自动化部署 : 包含
- 数据解析器 -> 美观UI界面 : 提供数据支持
- 美观UI界面 -> 自动化部署 : 生成打包文件
`
    },
    {
      title: "看山实验室 AI数字员工规划",
      desc: "模拟看山实验室数字员工（AI Agents）在 OPC Feed 系统中的协作流与多维视图。",
      icon: "🤖",
      markdown: `# K互联·AI数字员工中枢
看山实验室核心生产力引擎，自动化时间线事件与文档归档平台。

## Timeline (中枢演进日程)
- [2026-05-10] [record-entry] 启动 OPC Feed 开发: 确立组织级时间线协作软件的设计规格。 {prio=0, assignee=看山先生, tags=opc|core}
- [2026-06-01] [record-entry] 数字员工 Morpheus 登场: 自主运维 GitHub 开源仓库并自动化留痕。 {prio=1, assignee=Morpheus, tags=morpheus|agent}
- [2026-07-06] [task] IM中枢联动: 接入企业微信、飞书以及钉钉通知网关。 {prio=1, assignee=Morpheus, tags=notification}
  - [x] 配置 Feishu webhook 发送卡片
  - [ ] 调试 WeCom 双向会话线程
- [2026-08-01] [plan-item] 知识中枢多模态: 支持将 Markdown 自动提炼为图谱并融入 Agent 长期记忆。 {prio=2, assignee=Morpheus, tags=memory|brain}

## Board (数字员工代办任务)
- [x] MCP协议适配: 开发适用于看山系统的本地和远程 MCP Server 管道。 {prio=high, assignee=Morpheus, status=completed, tags=mcp}
- [ ] 记忆检索算法: 接入向量检索 mode=semantic 实现跨会话语义追溯。 {prio=high, assignee=Morpheus, status=in_progress, tags=ai}
- [ ] 任务自动派发: 实现 Timeline 的 plan-item 自动提取为数字员工的 subtasks。 {prio=normal, assignee=Morpheus, status=todo, tags=scheduler}
- [ ] 用户审批流: 创建 isPublished=false 待人类管理员审批的知识草稿流。 {prio=normal, assignee=Morpheus, status=todo, tags=audit}

## Graph (架构逻辑图谱)
OPCFeedSystem {type=project, val=25}
IM通知网关 {type=document, val=15}
Morpheus数字员工 {type=task, val=15}
向量数据库 {type=document, val=15}
前端可视化看板 {type=document, val=12}

- OPCFeedSystem -> IM通知网关 : 包含
- OPCFeedSystem -> Morpheus数字员工 : 驱动
- OPCFeedSystem -> 向量数据库 : 依赖
- Morpheus数字员工 -> IM通知网关 : 推送事件 (P0-P2)
- Morpheus数字员工 -> 向量数据库 : 读写长期记忆
- 前端可视化看板 -> OPCFeedSystem : 实时数据渲染
`
    },
    {
      title: "个人技术学习路线与技能树",
      desc: "将复杂的前端框架学习，转换成可量化的里程碑、学习清单与依赖图谱。",
      icon: "📚",
      markdown: `# 2026 全栈架构师学习路线
通过实战项目掌握下一代 Web 技术，提升全栈研发效能。

## Timeline (学习里程碑)
- [2026-07-01] [record-entry] JavaScript 高级特性: 精通 Promise、EventLoop、AST 编译原理。 {prio=1, assignee=学习者, tags=js|base}
- [2026-07-15] [task] React 19 & Next.js 15: 掌握 Server Actions、RSC 架构、新 Hook 以及 Concurrent 机制。 {prio=1, assignee=学习者, tags=react|next}
  - [x] 学习 useActionState
  - [x] 学习 React Server Components 原理
  - [ ] 实践 Next.js App Router 动态缓存
- [2026-08-01] [task] Tailwind V4 实战: 掌握 CSS-first theme 配置，全面替代 JS 配置。 {prio=2, assignee=学习者, tags=css|tailwind}
- [2026-08-15] [plan-item] AI Agent + MCP 构建: 亲手编写一个 AI Agent 并对接各种远程 MCP 节点，拓展 AI 编码边界。 {prio=0, assignee=学习者, tags=ai|mcp}

## Board (技术栈通关任务)
- [x] 浏览器基础: 掌握 V8 引擎垃圾回收与浏览器渲染管道渲染流程。 {prio=high, assignee=学习者, status=completed, tags=browser}
- [ ] 算法修炼: 刷完 LeetCode 经典 150 题、深度掌握 Graph 拓扑排序。 {prio=high, assignee=学习者, status=in_progress, tags=algo}
- [ ] 构建工具: 深入理解 Vite 插件生命周期，尝试手写一个 Vite 插件。 {prio=normal, assignee=学习者, status=todo, tags=vite}
- [ ] DevOps 部署: 使用 Docker 容器化并结合 GitHub Actions 实现自动化部署。 {prio=low, assignee=学习者, status=backlog, tags=devops}

## Graph (技能依赖树)
全栈开发 {type=project, val=22}
JS高级特性 {type=document, val=15}
React19 {type=document, val=15}
AI编排 {type=document, val=15}
Docker部署 {type=document, val=10}

- 全栈开发 -> JS高级特性 : 基础
- JS高级特性 -> React19 : 前置依赖
- React19 -> AI编排 : 前端界面支撑
- JS高级特性 -> AI编排 : 编写 Agent 逻辑
- 全栈开发 -> Docker部署 : CI/CD保障
`
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {presets.map((preset, idx) => (
        <button
          key={idx}
          onClick={() => onSelect(preset.markdown)}
          className="text-left p-4 rounded-xl border border-light-border dark:border-dark-border bg-white/50 dark:bg-dark-surface/50 hover:bg-white dark:hover:bg-dark-surface hover:border-primary/40 dark:hover:border-primary/40 shadow-sm hover:shadow transition-all group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xl">{preset.icon}</span>
              <span className="font-bold text-sm text-gray-900 dark:text-gray-100 group-hover:text-primary transition-colors">
                {preset.title}
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
              {preset.desc}
            </p>
          </div>
          <div className="mt-3 text-[10px] font-medium text-primary flex items-center gap-1">
            加载此模板 <ArrowRight size={10} className="transform group-hover:translate-x-1 transition-transform" />
          </div>
        </button>
      ))}
    </div>
  );
};
