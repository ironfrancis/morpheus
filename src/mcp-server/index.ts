import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const server = new Server(
  {
    name: "morpheus-memory-consolidation",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// 定义工具
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "submit_agent_trace",
        description: "Submit raw execution trace of an agent run to consolidate into long-term memories and insights.",
        inputSchema: {
          type: "object",
          properties: {
            agentId: { type: "string", description: "CUID or unique identifier of the digital employee." },
            agentName: { type: "string", description: "Display name of the agent (e.g. 丹尼尔)." },
            projectSlug: { type: "string", description: "Slug of the project (e.g. qianshu-word-learner)." },
            rawTrace: { type: "string", description: "Full verbose trace log of the agent." },
          },
          required: ["agentId", "agentName", "projectSlug", "rawTrace"],
        },
      },
      {
        name: "query_agent_memories",
        description: "Query consolidated agent memories for a project to guide future agent runs.",
        inputSchema: {
          type: "object",
          properties: {
            projectSlug: { type: "string", description: "Filter memories by project slug." },
            query: { type: "string", description: "Semantic search or keyword query." },
            limit: { type: "number", description: "Limit number of results returned (default: 5)." },
          },
          required: ["projectSlug", "query"],
        },
      },
      {
        name: "get_morpheus_status",
        description: "Get general project metrics, resolved/unresolved technical debt, and memory counts.",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
    ],
  };
});

// 处理工具请求
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === "submit_agent_trace") {
    const { agentId, agentName, projectSlug, rawTrace } = args as any;

    // 离线记忆提炼算法（纯函数式模拟 LLM 智能分类）
    // 1. 扫描 trace 中的关键错误
    const errorCount = (rawTrace.match(/error|fail|reject/gi) || []).length;
    const healthScore = Math.max(10, 100 - errorCount * 15);

    // 2. 扫描并归纳事实
    const facts: string[] = [];
    const insights: Array<{ type: string; category: string; title: string; content: string }> = [];

    if (rawTrace.includes("lucide") || rawTrace.includes("oil-icon")) {
      facts.push(`${agentName} 重构并重绘了项目的图标体系，成功将 Lucide 图标全量替换为个性化的卡通油画立体贴纸风格 oil-icon。`);
      insights.push({
        type: "INSIGHT_ACHIEVEMENT",
        category: "REFACTOR",
        title: "成功引入 oil-icon 体系",
        content: "完成零依赖架构下的静态图片图标替换，大幅度提升了视觉统一性与可爱感。",
      });
    }

    if (rawTrace.includes("typing-game") || rawTrace.includes("memory.js")) {
      insights.push({
        type: "INSIGHT_TECH_DEBT",
        category: "ARCHITECTURE",
        title: "typing-game.js 与 memory.js 的 UI 逻辑高度耦合",
        content: "UI 渲染与核心业务逻辑深度交织，极不便于跨端移植及新模式扩展，存在隐式全局变量引用风险。",
      });
    }

    if (rawTrace.includes("waiting_input") || rawTrace.includes("blocked")) {
      insights.push({
        type: "INSIGHT_WARNING",
        category: "BLOCK",
        title: "数字员工 Daniel 在 B方案处状态阻塞",
        content: "系统定时循环空转，由于未能获得人类管理员的明确审批合并，Daniel 目前正阻塞于等待输入状态中。",
      });
    }

    if (facts.length === 0) {
      facts.push(`${agentName} 执行了一轮周期性代码扫描，确认当前 codebase 整体健康度稳定。`);
    }

    const summary = `本轮由数字员工 ${agentName} 对项目 ${projectSlug} 执行了例行维护，提炼出 ${facts.length} 个长期记忆事实及 ${insights.length} 条组织认知，项目评估得分为 ${healthScore} 分。`;

    // 3. 写入 Prisma 本地数据库
    const session = await prisma.dreamSession.create({
      data: {
        agentId,
        agentName,
        projectSlug,
        rawTrace,
        summary,
        healthScore,
        memories: {
          create: facts.map((fact) => ({
            entitySubject: agentName,
            entityObject: projectSlug,
            relation: "CONTRIBUTES_TO",
            fact,
            importance: 3,
          })),
        },
        insights: {
          create: insights,
        },
      },
      include: {
        memories: true,
        insights: true,
      },
    });

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            message: "Memory Consolidation Complete",
            sessionId: session.id,
            summary: session.summary,
            healthScore: session.healthScore,
            consolidatedFactsCount: session.memories.length,
            insightsCount: session.insights.length,
          }, null, 2),
        },
      ],
    };
  }

  if (name === "query_agent_memories") {
    const { projectSlug, query, limit = 5 } = args as any;
    const memories = await prisma.consolidatedMemory.findMany({
      where: {
        session: { projectSlug },
        fact: { contains: query },
      },
      take: limit,
      orderBy: { createdAt: "desc" },
    });

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            query,
            projectSlug,
            results: memories.map((m) => ({
              fact: m.fact,
              date: m.createdAt,
            })),
          }, null, 2),
        },
      ],
    };
  }

  if (name === "get_morpheus_status") {
    const totalSessions = await prisma.dreamSession.count();
    const totalMemories = await prisma.consolidatedMemory.count();
    const openDebts = await prisma.agentInsight.count({
      where: { type: "INSIGHT_TECH_DEBT", isResolved: false },
    });
    const openWarnings = await prisma.agentInsight.count({
      where: { type: "INSIGHT_WARNING", isResolved: false },
    });

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            morpheusEngine: "Online",
            totalConsolidationDreamSessions: totalSessions,
            totalLongtermFactsConsolidated: totalMemories,
            activeUnresolvedTechnicalDebts: openDebts,
            activeBlockingWarnings: openWarnings,
          }, null, 2),
        },
      ],
    };
  }

  throw new Error(`Tool ${name} not found`);
});

async function run() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Morpheus Memory Consolidation MCP Server is running...");
}

run().catch(console.error);
