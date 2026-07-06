export interface RawDemoTrace {
  id: string;
  agentId: string;
  agentName: string;
  projectSlug: string;
  projectName: string;
  date: string;
  rawTrace: string;
  summary: string;
  healthScore: number;
  facts: string[];
  insights: Array<{ type: 'ACHIEVEMENT' | 'TECH_DEBT' | 'WARNING'; category: string; title: string; content: string }>;
}

export const demoTraces: RawDemoTrace[] = [
  {
    id: "demo-1",
    agentId: "daniel-5c68-v1",
    agentName: "丹尼尔 (Daniel)",
    projectSlug: "qianshu-word-learner",
    projectName: "千树背单词",
    date: "2026-07-06 14:00",
    rawTrace: `
---
INFO | Agent daniel-5c68 starts task: replace lucide icons with generated oil-icon style set
INFO | Repository path: /workspace/qianshu-word-learner
INFO | Reading current code... Found hardcoded HTML element <i data-lucide="book"></i>
INFO | Found 24 lucide icons across memory.js, typing-game.js, index.html.
INFO | Searching for icon replacement skill... Found oil-icon integration pattern.
INFO | Action: replace <i data-lucide="book"></i> to <img src="assets/oil-icons/book.png" class="oil-icon" />
INFO | Writing icons resources to assets/oil-icons/... Complete 24 cartoon icons generated!
SUCCESS| Replacement complete! Total 24 hardcoded icons refactored.
INFO | Building the static index.html... Success! Zero dependencies preserved.
INFO | Checking visual health score... Visual layout verification PASSED.
INFO | Executing 'git add . && git commit -m "feat: replace lucide with oil-icon stickers" && git push'
    `,
    summary: "数字员工丹尼尔成功完成了千树背单词项目的图标重构体系，将 24 处 Lucide 图标彻底转换为个性化卡通油画立体贴纸风格 oil-icon，视觉一致性达到 100%。",
    healthScore: 95,
    facts: [
      "丹尼尔利用 oil-icon 技能重绘了全套 24 枚个性化立体卡通贴纸图标。",
      "全量重构了 index.html, memory.js, typing-game.js 内部所有的 Lucide 硬编码节点。",
      "坚持了千树背单词零构建、零依赖的极简工程规范，以 <img> 标签兼容了现有静态渲染体系。"
    ],
    insights: [
      {
        type: "ACHIEVEMENT",
        category: "REFACTOR",
        title: "完美达成卡通图标一致性",
        content: "告别了单调扁平的 Lucide 矢量图标，替换为契合2年级小学生千树视觉喜好的立体卡通贴纸，极富趣味。"
      },
      {
        type: "TECH_DEBT",
        category: "PERFORMANCE",
        title: "零碎图片网络并发闪烁风险",
        content: "未来随着背单词模块扩充，大量 <img> 并发加载可能发生局部空白。建议后续重构打包时，引入 CSS 雪碧图（Sprite）或 Base64 内联合并。"
      }
    ]
  },
  {
    id: "demo-2",
    agentId: "daniel-5c68-v2",
    agentName: "丹尼尔 (Daniel)",
    projectSlug: "qianshu-word-learner",
    projectName: "千树背单词",
    date: "2026-07-06 15:30",
    rawTrace: `
---
INFO | Server Cron triggered daniel-5c68 for technical debt scan
INFO | Project: qianshu-word-learner
INFO | Reading typing-game.js and memory.js...
WARN | Severe coupling found! UI render logic (e.g. document.getElementById('card').innerHTML) is tightly combined with memory algorithm state.
INFO | Proposed Solution B: separate core state game logic into CoreGameEngine and leave DOM manipulation in UIBridge.
WARN | Awaiting human approval for B scheme...
WARN | Attempting events_comments_create in OPC... Failed! Method not found.
WARN | Attempting events_update in OPC... Failed! Method not found.
INFO | Falling back to events_create for heartbeat reporting: [Daniel] 定时执行：状态阻塞与继续等待确认.
WARN | No human reply found on comment feed. State is BLOCKED. Waiting for approval.
    `,
    summary: "系统定时例行扫描时，丹尼尔识别到核心业务逻辑与 DOM 渲染高度耦合，提交了将其彻底分离重构的B方案。由于目前尚未得到徐超先生的批准，任务流正处于 BLOCKED 状态，持续空转等待中。此外反馈了 OPC 评论接口的系统级 Bug。",
    healthScore: 68,
    facts: [
      "丹尼尔完成了对 typing-game.js 和 memory.js 的模块耦合性技术债排查。",
      "提出了逻辑与渲染解耦的 B 重构方案，正持续阻塞等待人类批准中。"
    ],
    insights: [
      {
        type: "WARNING",
        category: "BLOCK",
        title: "重构B方案挂悬，状态持续阻塞",
        content: "自7月5日至今，Daniel 经历 16 次定时扫描轮次全部空转，受制于审批流机制，技术债消构无法自行推进。"
      },
      {
        type: "WARNING",
        category: "SYSTEM_BUG",
        title: "OPC Feed 评论/状态更新组件报错",
        content: "在汇报任务状态时，由于 events_comments_create 与 events_update API 离线报错，Daniel 只能创建 events_create 冗余事件做变通汇报。需要实验室排查 OPC 平台接口定义。"
      }
    ]
  }
];
