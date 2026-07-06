import type { ParsedData, TimelineEvent, BoardCard, GraphNode, GraphLink } from '../types';

/**
 * Parses raw Markdown text and extracts a full visual schema including:
 * 1. Timeline Events
 * 2. Board Cards
 * 3. Knowledge/Graph Relationships
 * 
 * Rules for Markdown parsing:
 * - H1 (# Project Name) defines project details.
 * - H2 (## section) defines sections.
 * - Timeline section parses lists with date, type, title, and optional subtasks.
 *   Format: `- [YYYY-MM-DD] [type] Title: Summary {prio=1, assignee=Morpheus, tags=a,b}`
 * - Board section parses lists with checkbox status, title, details, priority.
 *   Format: `- [ ] Title: Summary {prio=high, assignee=Morpheus, status=todo}`
 * - Graph section parses relationships.
 *   Format: `- NodeA -> NodeB : relationship_type`
 */
export function parseMorpheusMarkdown(markdown: string): ParsedData {
  const lines = markdown.split('\n');
  
  let projectName = 'Morpheus Open Project';
  let projectSlug = 'morpheus-project';
  let projectDescription = 'An amazing open-source project visualized in real-time.';
  
  const events: TimelineEvent[] = [];
  const cards: BoardCard[] = [];
  
  // Custom interactive graphs relationships
  const customLinks: { source: string; target: string; type: string }[] = [];
  const customNodes: { id: string; label: string; type: string; val?: number }[] = [];

  let currentSection: 'meta' | 'timeline' | 'board' | 'graph' | 'none' = 'meta';

  // Regular expressions for parsing
  const metaRegex = /^#\s+(.+)$/;
  const sectionRegex = /^##\s+(.+)$/;
  
  // Parse lines
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Check header 1 (Project Name)
    const h1Match = line.match(metaRegex);
    if (h1Match) {
      projectName = h1Match[1].trim();
      projectSlug = projectName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      // Look at next lines for description
      let descLines = [];
      let j = i + 1;
      while (j < lines.length && !lines[j].trim().startsWith('#')) {
        const nextLine = lines[j].trim();
        if (nextLine && !nextLine.startsWith('>')) {
          descLines.push(nextLine);
        }
        j++;
      }
      if (descLines.length > 0) {
        projectDescription = descLines.slice(0, 2).join(' ');
      }
      continue;
    }

    // Check section header 2
    const h2Match = line.match(sectionRegex);
    if (h2Match) {
      const secTitle = h2Match[1].trim().toLowerCase();
      if (secTitle.includes('timeline') || secTitle.includes('时间线') || secTitle.includes('日程')) {
        currentSection = 'timeline';
      } else if (secTitle.includes('board') || secTitle.includes('看板') || secTitle.includes('任务')) {
        currentSection = 'board';
      } else if (secTitle.includes('graph') || secTitle.includes('关系') || secTitle.includes('图谱')) {
        currentSection = 'graph';
      } else {
        currentSection = 'none';
      }
      continue;
    }

    // Process list items depending on current section
    if (line.startsWith('-')) {
      const content = line.substring(1).trim();

      if (currentSection === 'timeline') {
        // Parse timeline event
        // Format: [YYYY-MM-DD] [type] Title: Summary {prio=1, tags=x,y}
        // Example: - [2026-07-06] [record-entry] 项目启动: 启动看山实验室Morpheus开源可视化项目 {prio=0, assignee=Morpheus, tags=morpheus,init}
        const dateMatch = content.match(/^\[([\d-]{10})\]\s*(?:\[([^\]]+)\])?\s*([^:]+):?([^{]+)?(?:\{([^}]+)\})?/);
        if (dateMatch) {
          const date = dateMatch[1];
          const typeSlug = dateMatch[2] || 'record-entry';
          const title = dateMatch[3].trim();
          const summary = (dateMatch[4] || '').trim();
          const configStr = dateMatch[5] || '';

          // Parse extra configurations
          let importance = 3;
          let assignee = 'Morpheus';
          let tags: string[] = [];
          
          if (configStr) {
            const parts = configStr.split(',');
            parts.forEach(part => {
              const [key, val] = part.split('=').map(p => p.trim());
              if (key === 'prio' || key === 'importance') {
                importance = parseInt(val, 10);
                if (isNaN(importance)) importance = 3;
              } else if (key === 'assignee') {
                assignee = val;
              } else if (key === 'tags') {
                tags = val.split('|').map(t => t.trim());
              }
            });
          }

          // Check for subtasks on subsequent lines
          const subtasks: { title: string; completed: boolean }[] = [];
          let k = i + 1;
          while (k < lines.length && (lines[k].trim().startsWith('- [ ]') || lines[k].trim().startsWith('- [x]') || lines[k].trim().startsWith('* [ ]') || lines[k].trim().startsWith('* [x]'))) {
            const subLine = lines[k].trim();
            const isCompleted = subLine.includes('[x]');
            const subTitle = subLine.replace(/^[-*]\s*\[[ xX]\]\s*/, '').trim();
            subtasks.push({ title: subTitle, completed: isCompleted });
            k++;
          }

          events.push({
            id: `evt-${events.length + 1}`,
            date,
            title,
            summary: summary || title,
            typeSlug,
            importance,
            projectSlug,
            assignee,
            subtasks,
            tags
          });
        }
      } else if (currentSection === 'board') {
        // Parse board card
        // Format: - [ ] Title: Summary {prio=high, assignee=Morpheus, status=todo}
        // Example: - [ ] 核心分析: 进行开源项目选题 and 灵感收集 {prio=high, assignee=Morpheus, status=in_progress}
        const checkboxMatch = content.match(/^\[([ xX])\]\s*([^:]+):?([^{]+)?(?:\{([^}]+)\})?/);
        if (checkboxMatch) {
          const checked = checkboxMatch[1].toLowerCase() === 'x';
          const title = checkboxMatch[2].trim();
          const summary = (checkboxMatch[3] || '').trim();
          const configStr = checkboxMatch[4] || '';

          let priority: 'low' | 'normal' | 'high' | 'urgent' = 'normal';
          let assignee = 'Morpheus';
          let status: 'todo' | 'in_progress' | 'completed' | 'backlog' = checked ? 'completed' : 'todo';
          let tags: string[] = [];

          if (configStr) {
            const parts = configStr.split(',');
            parts.forEach(part => {
              const [key, val] = part.split('=').map(p => p.trim());
              if (key === 'prio' || key === 'priority') {
                if (['low', 'normal', 'high', 'urgent'].includes(val)) {
                  priority = val as any;
                }
              } else if (key === 'assignee') {
                assignee = val;
              } else if (key === 'status') {
                if (['todo', 'in_progress', 'completed', 'backlog'].includes(val)) {
                  status = val as any;
                }
              } else if (key === 'tags') {
                tags = val.split('|').map(t => t.trim());
              }
            });
          }

          cards.push({
            id: `card-${cards.length + 1}`,
            title,
            status,
            priority,
            summary: summary || title,
            assignee,
            tags
          });
        }
      } else if (currentSection === 'graph') {
        // Parse graph relationships
        // Format: - NodeA -> NodeB : relationship_type
        // Or NodeName {type=project, val=10}
        const relationMatch = content.match(/^([^-]+)->([^:]+)(?::\s*(.+))?/);
        const nodeMatch = content.match(/^([^{]+)(?:\{([^}]+)\})?/);

        if (relationMatch) {
          const source = relationMatch[1].trim();
          const target = relationMatch[2].trim();
          const type = (relationMatch[3] || 'related').trim();

          customLinks.push({
            source,
            target,
            type
          });
        } else if (nodeMatch && !content.includes('->')) {
          const label = nodeMatch[1].trim();
          const configStr = nodeMatch[2] || '';

          let type = 'task';
          let val = 5;

          if (configStr) {
            const parts = configStr.split(',');
            parts.forEach(part => {
              const [key, rawVal] = part.split('=').map(p => p.trim());
              if (key === 'type') {
                type = rawVal;
              } else if (key === 'val' || key === 'size') {
                val = parseInt(rawVal, 10) || 5;
              }
            });
          }

          customNodes.push({
            id: label,
            label,
            type,
            val
          });
        }
      }
    }
  }

  // Build reactive graph nodes and links
  const nodes: GraphNode[] = [];
  const links: GraphLink[] = [];
  const nodeSet = new Set<string>();

  // Add project node
  nodes.push({
    id: projectSlug,
    label: projectName,
    type: 'project',
    val: 20
  });
  nodeSet.add(projectSlug);

  // Add custom defined nodes
  customNodes.forEach(cn => {
    if (!nodeSet.has(cn.id)) {
      nodes.push({
        id: cn.id,
        label: cn.label,
        type: cn.type as any,
        val: cn.val || 8
      });
      nodeSet.add(cn.id);
    }
  });

  // Add nodes from timeline
  events.forEach(evt => {
    const evtId = evt.id;
    if (!nodeSet.has(evtId)) {
      nodes.push({
        id: evtId,
        label: evt.title,
        type: 'event',
        importance: evt.importance,
        val: 10 - evt.importance
      });
      nodeSet.add(evtId);
    }

    // Link event to project
    links.push({
      source: projectSlug,
      target: evtId,
      type: 'belongs_to'
    });

    // Link tags
    evt.tags.forEach(tag => {
      const tagId = `tag-${tag}`;
      if (!nodeSet.has(tagId)) {
        nodes.push({
          id: tagId,
          label: `#${tag}`,
          type: 'tag',
          val: 6
        });
        nodeSet.add(tagId);
      }
      links.push({
        source: evtId,
        target: tagId,
        type: 'related'
      });
    });
  });

  // Add nodes from cards
  cards.forEach(card => {
    const cardId = card.id;
    if (!nodeSet.has(cardId)) {
      nodes.push({
        id: cardId,
        label: card.title,
        type: 'task',
        val: card.priority === 'urgent' ? 12 : card.priority === 'high' ? 10 : 8
      });
      nodeSet.add(cardId);
    }

    // Link card to project
    links.push({
      source: projectSlug,
      target: cardId,
      type: 'belongs_to'
    });

    // Link tags
    card.tags.forEach(tag => {
      const tagId = `tag-${tag}`;
      if (!nodeSet.has(tagId)) {
        nodes.push({
          id: tagId,
          label: `#${tag}`,
          type: 'tag',
          val: 6
        });
        nodeSet.add(tagId);
      }
      links.push({
        source: cardId,
        target: tagId,
        type: 'related'
      });
    });
  });

  // Add custom links
  customLinks.forEach(cl => {
    // If source or target node doesn't exist, create it as a general node
    if (!nodeSet.has(cl.source)) {
      nodes.push({
        id: cl.source,
        label: cl.source,
        type: 'document',
        val: 8
      });
      nodeSet.add(cl.source);
    }
    if (!nodeSet.has(cl.target)) {
      nodes.push({
        id: cl.target,
        label: cl.target,
        type: 'document',
        val: 8
      });
      nodeSet.add(cl.target);
    }

    links.push({
      source: cl.source,
      target: cl.target,
      type: cl.type as any
    });
  });

  return {
    projectName,
    projectSlug,
    projectDescription,
    events,
    cards,
    nodes,
    links
  };
}

/**
 * Default beautiful markdown template to bootstrap the editor.
 */
export const DEFAULT_MARKDOWN_TEMPLATE = `# Morpheus Visualizer
看山实验室出品的轻量级开源可视化引擎。专为敏捷团队、数字员工设计的实时 markdown 协作绘图与路线图展示工具。

> 💡 你可以通过在这里自由编辑 Markdown。我们会实时解析并渲染出精美的 Timeline (时间线)、看板、和关系图谱 (Graph)。

## Timeline (项目里程碑时间线)
- [2026-07-06] [record-entry] 项目启动: 看山实验室数字员工 Morpheus 确定开源选题并成功立项。 {prio=0, assignee=Morpheus, tags=morpheus|init}
- [2026-07-07] [task] 架构设计: 设计核心的数据解析层以及高颜值界面布局。 {prio=1, assignee=Morpheus, tags=arch|design}
  - [x] 定义多合一 Markdown 解析格式
  - [ ] 确定 UI 整体配色风格
- [2026-07-08] [task] 前端开发: 使用 React + TS + Tailwind V4 快速写出 Timeline、Board 和 Graph 等交互视图。 {prio=1, assignee=Morpheus, tags=code|frontend}
- [2026-07-09] [plan-item] GitHub 自动部署: 配置 GitHub Actions 自动构建，一键发布到 GitHub Pages。 {prio=2, assignee=Morpheus, tags=cicd|pages}
- [2026-07-15] [record-entry] 开源发布: 正式在 GitHub 进行推介，获取开源社区首批 Star！ {prio=0, assignee=Morpheus, tags=release|star}

## Board (敏捷开发看板)
- [x] 选题灵感收集: 深入调研 2026 年 GitHub 趋势，锁定“开发工具与可视化”方向。 {prio=urgent, assignee=Morpheus, status=completed, tags=research}
- [ ] 解析器开发: 实现对 [YYYY-MM-DD] 格式的正则匹配和图谱算法提取。 {prio=high, assignee=Morpheus, status=in_progress, tags=parser}
- [ ] 视图渲染与动效: 集成 framer-motion 实现切换 Tab 时的丝滑动画。 {prio=normal, assignee=Morpheus, status=todo, tags=ui|animation}
- [ ] 一键导出与分享: 支持将项目 structure 导出为 JSON 或纯图片。 {prio=low, assignee=Morpheus, status=backlog, tags=feature}

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
`;
