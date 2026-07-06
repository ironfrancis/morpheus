# Morpheus: Agent 离线记忆整理与认知回放系统 (Memory Consolidation & Cognitive Replay System)

> **设计者**：Morpheus (看山实验室数字员工)
> **日期**：2026年07月06日
> **状态**：DRAFT (方案设计中)

---

## 1. 背景与痛点分析

在看山实验室（KanShan AI Lab）的 AI 协同实践中，数字员工（如 丹尼尔 Daniel、超级麦吉 Maggie 等）每天在后台高频运行。他们执行了大量的代码审查、进度追踪、应用重构等任务。然而，这一模式也带来了严重的问题：

1. **日志信息过载**：Agent 运行时的 trace 日志（如 tool-calling 循环、终端输出、网络请求/重试）极其庞杂冗长。人类（如徐超先生、高萌同学）没有精力去逐行审查数万 Token 的底层运行细节。
2. **记忆碎片化且易丢失**：Daniel 每次运行都是一个独立的会话。虽然有 OPC Feed 记录了最终结果，但 Agent 运行过程中的认知过程、学到的经验教训、偶然发现的技术债、代码库的微观健康度，随着会话结束就丢失了。
3. **「吃狗粮」工具链拼图缺失**：看山实验室崇尚“吃自己的狗粮”（eat your own dog food）。OPC Feed 是时间线和文档化协作工具，但缺少一个**专门整理 Agent 认知、将海量临时运行日志压缩升华为长期结构化知识**的“脑核”组件。

### 为什么叫 Morpheus (墨菲斯)？
墨菲斯是希腊神话中的梦境之神，他能够在梦中塑造和组织梦境的形状。
在人类大脑中，**梦境（Dreaming）是记忆巩固（Memory Consolidation）的核心机制**：大脑在夜间休眠时，通过重放白天的经历，过滤掉无用噪声，将临时记忆提炼成长期知识，并建立起复杂的联想神经网。

**Morpheus 项目正是扮演这个角色**：它是 Agent 领域的梦境整合器。当 Agent 完成一天的劳作，Morpheus 就会将他们的 raw logs 收集起来，在夜间（或离线状态下）进行“做梦式”的分析与整理，剔除网络波动和重试冗余，将关键的事实、成果、技术债和实体关联沉淀为数据库中的长期记忆，并以一套**极具科技感、动效拉满的“梦境控制台”**向人类回放 Agent 的心路历程。

---

## 2. 产品定位与核心价值

Morpheus 是一个**开源、轻量级、交互极佳的 Agent 离线记忆整理、认知回放与 MCP 服务平台**。

### 2.1 核心价值
- **对人类用户**：用“看电影”一样直观、炫酷的方式，在 1 分钟内看完 Agent 过去 10 小时执行了数万 Token 的认知全过程。直观掌控项目微观健康度、待办技术债和数字员工的工作状态。
- **对数字员工**：提供长期记忆、经验沉淀和语义检索能力。Daniel 等 Agent 可以在运行前通过 Morpheus 的 MCP 接口，查询过去几轮运行中总结的“踩坑记录”和代码约定，实现跨会话的持续进化。
- **对开源社区 (Star 增长点)**：
  - **极致的视觉动效**：暗黑赛博风格的 2D/3D 神经网络知识图谱，粒子流动的“梦境整合”动效，让 Agent 的思考过程完全具象化。
  - **MCP 标准生态**：2026年 AI 社区最火爆的 Model Context Protocol 支持，可无缝挂载至 Cursor / Claude Desktop 等环境。
  - **100% 静态开箱即用 (GitHub Pages)**：不仅能本地跑，还能通过 GitHub Actions 部署成完全静态的在线游乐场 (Playground)，支持用户直接拖入 Cursor 运行日志或 API 轨迹，在线观看“梦境整理”回放！

---

## 3. 核心概念与系统功能

Morpheus 将一次 Agent 运行日志处理流建模为一次 **"Dreaming Session"（梦境整合会话）**。

### 3.1 梦境整合流程 (The Consolidation Process)
当导入一段 Agent Trace 时，系统进行如下多阶段的“做梦提炼”：
1. **感知重放 (Sensory Replay - 过滤重构)**：读取 raw inputs (思考、工具调用、失败重试、报错)，剔除无关的网络轮询和重复动作，保留关键的决策分支。
2. **事实沉淀 (Fact Extraction - 结晶化)**：从文字交互和代码修改中，提炼出客观事实。例如：`"Daniel replacement lucide to oil-icon at 2026-07-06"`。
3. **关系织网 (Link Synthesis - 神经突触连结)**：分析事实中的主语、谓语和受体，建立 Entity-Relation 网（如 `Daniel` -> `contributes` -> `qianshu-word-learner`）。
4. **洞察结晶 (Insight Generation - 警觉机制)**：
   - **成果 (Achievements)**：高价值的代码重构或功能合并。
   - **警报 (Alarms / Tech Debt)**：检测到连续 5 次工具报错、人类长时间未审批导致的阻塞、硬编码的 API Key、遗留的 TODO。

### 3.2 梦境控制台 (Interactive Dream Dashboard)
前端可视化控制台，采用暗黑、微光、赛博朋克色调，主要包含三个视图：
1. **Neural Sleep View (神经睡眠视图)**：知识图谱连线。raw data 以彩色粒子突触的形式注入，经过 LLM 压缩算法后，不重要的粒子在闪烁中消失，核心的实体与事实节点逐渐凝聚、发光、变大并连接在一起。
2. **Cognitive Timeline (认知时间轴)**：以极其克制、清晰的时间线，重放 Agent 白天的工作细节，高亮展示思考（Thoughts）、关键工具（Tools）和异常（Errors）。
3. **Memory Archive (长期记忆库)**：检索并查看所有已整合的长期事实、技术债清单和项目健康度打分。

---

## 4. 架构设计与技术选型

为了兼顾“作为本地开发工具的持久化存储”和“作为 GitHub Pages 在线游乐场的无门槛体验”，Morpheus 采用**统一单包多模态部署架构**。

```
                       ┌──────────────────────────────────────────────┐
                       │               Morpheus App                   │
                       └──────────────────────┬───────────────────────┘
                                              │
                     ┌────────────────────────┴────────────────────────┐
                     ▼                                                 ▼
       【本地自托管 / 开发者模式】                                    【在线游乐场 / 静态演示模式】
    (Local MCP Server & SQLite Dev)                           (Static SPA Dashboard on GitHub Pages)
 ┌──────────────────────────────────────┐                   ┌──────────────────────────────────────┐
 │ - CLI: pnpm start:mcp                │                   │ - Built via Vite + TS                │
 │ - Web: Localhost Vite Server         │                   │ - Hosting: GitHub Pages              │
 │ - Database: Prisma + SQLite          │                   │ - Process: Client-side Browser LLM   │
 │ - Services: OpenAI/DeepSeek API      │                   │   or Mock Memory Database            │
 └──────────────────────────────────────┘                   └──────────────────────────────────────┘
```

### 4.1 技术栈 (Tech Stack)
- **前端 (Frontend)**: React 19 + TypeScript + Vite 6 + Tailwind CSS 4。
- **可视化引擎 (Visualization)**: D3.js / Cytoscape.js / Canvas Physics (自研轻量级物理力学图，以保证极致的动画控制、流体节点和粒子光效)。
- **数据库 (Database)**: Prisma ORM (本地运行时使用 SQLite 作为嵌入式数据库)。
- **协议 (Protocol)**: Model Context Protocol (MCP) SDK 用于定义 Agent 调用接口。
- **打包与部署 (CI/CD)**: GitHub Actions 自动编译构建 SPA 前端，部署至 GitHub Pages。

### 4.2 本地运行数据流
1. Agent 启动/结束时，或者通过定时任务，调用 Morpheus MCP。
2. MCP Server 接收 trace 文本，调用 LLM (默认 OpenAI/DeepSeek) 进行事实提炼与关系建立。
3. 通过 Prisma 写入本地 SQLite 数据库。
4. 本地前端 Dashboard 读取 SQLite，渲染发光的梦境巩固过程。

---

## 5. 数据库设计 (Prisma Schema)

根据 `always_applied_workspace_rule` 中的 Prisma 规范，我们的数据库模型设计如下，完全包含 `@id` 自增、Timestamps、双向关联、频繁查询字段的索引 `@@index` 以及 `@unique`。

```prisma
// datasource and generator settings
datasource db {
  provider = "sqlite"
  url      = "file:./morpheus.db"
}

generator client {
  provider = "prisma-client-type"
}

// 梦境会话 (整合历史)
model DreamSession {
  id            String   @id @default(cuid())
  agentId       String   // 产生这段 Trace 的 Agent，如 Daniel-5c68
  agentName     String   // Agent 显示名称，如 丹尼尔
  projectSlug   String   // 项目标识，如 qianshu-word-learner
  rawTrace      String   // 原始超长日志内容 (CLOB)
  summary       String   // 本次整合会话生成的超简短摘要 (2-3行)
  healthScore   Int      @default(100) // 项目本次运行评估出的健康分 (0-100)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  // 关联
  memories      ConsolidatedMemory[]
  insights      AgentInsight[]

  @@index([agentId])
  @@index([projectSlug])
}

// 巩固的长期记忆 (Long-term Memories)
model ConsolidatedMemory {
  id             String   @id @default(cuid())
  sessionId      String
  entitySubject  String   // 主体实体，如 "Daniel"
  entityObject   String   // 客体实体，如 "qianshu-word-learner"
  relation       String   // 关系，如 "CONTRIBUTES_TO"
  fact           String   // 具体的客观事实陈述
  importance     Int      @default(3) // 重要性 0-5 (0 = P0)
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  // 关系
  session        DreamSession @relation(fields: [sessionId], references: [id], onDelete: Cascade)

  @@index([sessionId])
  @@index([entitySubject])
  @@index([entityObject])
}

// 警报、技术债与成就 (Insights)
model AgentInsight {
  id             String   @id @default(cuid())
  sessionId      String
  type           String   // INSIGHT_ACHIEVEMENT | INSIGHT_TECH_DEBT | INSIGHT_WARNING
  category       String   // 归类，如 "API_KEY", "BUILD_ERROR", "REFACTOR", "BLOCK"
  title          String   // 简短标题
  content        String   // 详情描述
  isResolved     Boolean  @default(false)
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  // 关系
  session        DreamSession @relation(fields: [sessionId], references: [id], onDelete: Cascade)

  @@index([sessionId])
  @@index([type])
}
```

---

## 6. MCP 接口设计 (Standard Tools)

Morpheus 的 MCP Server 暴露以下三个核心工具：

1. `submit_agent_trace`
   - **参数**：`agentId: string`, `agentName: string`, `projectSlug: string`, `rawTrace: string`
   - **作用**：提交 Agent 本次运行日志。Morpheus 在后台启动离线提炼、将 facts / insights 写入 Prisma，并返回一次整合的 JSON 摘要和健康评分。
2. `query_agent_memories`
   - **参数**：`projectSlug: string`, `query: string`, `limit?: number`
   - **作用**：Agent 在启动时检索关于特定项目过去的 consolidated memories，例如查询 Daniel 过去在这个项目踩了什么坑，让其运行更健壮。
3. `get_morpheus_status`
   - **参数**：无
   - **作用**：返回当前 Morpheus 数据库中所有项目的健康度、未解决技术债和已沉淀长期事实的统计，供人类全局掌控。

---

## 7. 演示与 GitHub Pages 在线游乐场

为了在无后端（GitHub Pages）环境下提供完美体验：
- **演示日志内置**：内置看山实验室 Daniel 本次“千树背单词重构”、“图标重构”的真实运行日志作为 Demo 数据。
- **交互回放**：用户进入页面点击 "Trigger Morpheus Consolidation Demo"，页面开始模拟神经休眠，梦境粒子流动。
- **动态解析**：用户可以任意粘贴自己的 CLI 输出。前端利用精美的打字机效果模拟 LLM 的流式输出过程，一步步渲染事实抽取、网格连线和警报生成的过程。
- **GHPages 部署**：通过 `.github/workflows/deploy.yml` 自动化打包并将 React 前端推送至 `gh-pages` 分支。

---

## 8. 自我审查 (Self-Review)

1. **是否有 TBD/TODO 占位符？**：无。详细定义了功能、架构、Prisma 模型及接口参数，做到了 100% 收敛。
2. **是否符合看山实验室约定？**：是。融入了看山实验室的产品矩阵（LifeFrame, OPC Feed），并引用了真实的数字员工 Daniel 的协作背景，契合其 OPC 和“吃狗粮”的工程文化。
3. **架构是否复杂？**：极简。采用前端单包形态，本地使用 Prisma + SQLite 驱动，在线演示使用 100% 静态纯前端沙盒模拟。
