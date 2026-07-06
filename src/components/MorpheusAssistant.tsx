import React, { useState, useEffect } from 'react';
import { Note } from '../utils/markdown';
import { 
  Sparkles, 
  Activity, 
  MessageSquare, 
  Compass, 
  Link2, 
  AlertCircle, 
  TrendingUp, 
  CheckCircle2, 
  Plus, 
  Send,
  Bot
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface MorpheusAssistantProps {
  notes: Record<string, Note>;
  onUpdateNote: (id: string, updates: Partial<Note>) => void;
  onSelectNote: (id: string) => void;
  onAddNoteWithContent: (title: string, content: string, status?: 'todo' | 'in_progress' | 'done') => void;
}

type TabType = 'chat' | 'health' | 'ai-tasks';

interface Message {
  sender: 'user' | 'morpheus';
  text: string;
  timestamp: Date;
  suggestions?: { label: string; action: () => void }[];
}

export const MorpheusAssistant: React.FC<MorpheusAssistantProps> = ({
  notes,
  onUpdateNote,
  onSelectNote,
  onAddNoteWithContent,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('health');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsDarkTyping] = useState(false);

  // 初始化欢迎语
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          sender: 'morpheus',
          text: '你好！我是看山实验室的数字员工 **Morpheus**。作为你的 AI 思考伙伴，我可以帮你分析当前的知识图谱、诊断知识库健康度、推荐智能双链，或者帮你将复杂的笔记分解为具体的看板任务。你可以试着问我：“帮我分析一下知识库” 或 “有哪些知识孤岛？”',
          timestamp: new Date(),
          suggestions: [
            { label: '📊 深度分析知识库', action: () => handleSendMessage('帮我分析一下当前的知识库结构') },
            { label: '🔍 查找知识孤岛', action: () => setActiveTab('health') },
          ]
        }
      ]);
    }
  }, []);

  // --- 1. 知识库健康度计算 ---
  const noteList = Object.values(notes);
  const totalNotes = noteList.length;
  
  // 计算总链接数
  const totalLinks = noteList.reduce((acc, note) => acc + note.links.length, 0);
  
  // 计算网状化指数
  const networkIndex = totalNotes > 0 ? Math.round((totalLinks / totalNotes) * 100) : 0;

  // 查找知识孤岛 (Orphan Notes): 既没有出链也没有入链
  const orphanNotes = noteList.filter(note => note.links.length === 0 && note.backlinks.length === 0);

  // 查找知识枢纽 (Hub Notes): 链接数（出链+入链）最多的前 3 个
  const hubNotes = [...noteList]
    .map(note => ({
      ...note,
      degree: note.links.length + note.backlinks.length
    }))
    .sort((a, b) => b.degree - a.degree)
    .slice(0, 3)
    .filter(n => n.degree > 0);

  // 智能推荐关联
  const getRecommendation = (orphan: Note) => {
    // 根据 tags 或标题关键词推荐
    const orphanTags = orphan.frontmatter.tags || [];
    const orphanTitle = orphan.title.toLowerCase();

    const bestMatch = noteList
      .filter(n => n.id !== orphan.id)
      .map(n => {
        let score = 0;
        const nTags = n.frontmatter.tags || [];
        const nTitle = n.title.toLowerCase();

        // 1. 匹配相同的 tags
        orphanTags.forEach(t => {
          if (nTags.includes(t)) score += 3;
        });

        // 2. 匹配标题关键词
        const words = orphanTitle.split(/[\s-、，。]/).filter(w => w.length > 1);
        words.forEach(word => {
          if (nTitle.includes(word)) score += 2;
        });

        return { note: n, score };
      })
      .sort((a, b) => b.score - a.score)[0];

    // 如果没有匹配分，推荐 Hub 节点
    if (!bestMatch || bestMatch.score === 0) {
      const firstHub = hubNotes[0];
      if (firstHub && firstHub.id !== orphan.id) {
        return notes[firstHub.id];
      }
      const anyOther = noteList.find(n => n.id !== orphan.id);
      return anyOther || null;
    }

    return bestMatch.note;
  };

  // 建立双链
  const handleCreateLink = (sourceId: string, targetId: string) => {
    const sourceNote = notes[sourceId];
    if (!sourceNote) return;

    // 在正文末尾追加双链
    const updatedContent = sourceNote.content.trim() + `\n\n> **Morpheus AI 推荐关联**：[[${targetId}]]`;
    onUpdateNote(sourceId, {
      content: updatedContent
    });

    // 提示用户
    alert(`成功在《${sourceNote.title}》中添加了指向《${notes[targetId]?.title || targetId}》的双向链接！关系图谱已实时更新。`);
  };

  // --- 2. 智能问答 (RAG Chat) 引擎 ---
  const handleSendMessage = (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = {
      sender: 'user',
      text,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsDarkTyping(true);

    // 模拟 RAG 检索与回答
    setTimeout(() => {
      let responseText = '';
      const query = text.toLowerCase();

      if (query.includes('分析') || query.includes('知识库') || query.includes('结构') || query.includes('图谱')) {
        responseText = `### 📊 Morpheus Canvas 知识库深度分析报告

经过我的检索与计算，当前知识库的结构特征如下：

1. **知识库规模**：当前共有 **${totalNotes}** 篇 Markdown 笔记，包含 **${totalLinks}** 个双向引用链接。
2. **网状化指数**：当前为 **${networkIndex}%**。${
          networkIndex > 150 
            ? '这是一个高度互联的网状知识库，笔记之间的关联非常紧密，有利于知识的网状探索和灵感碰撞！' 
            : networkIndex > 80
            ? '知识库呈现出健康的网状结构，核心概念已建立连接，建议继续补充细节笔记的关联。'
            : '当前知识库的网状化程度较低，存在较多孤立的知识点。建议通过双链 \`[[双链语法]]\` 将概念连接起来，激活你的“第二大脑”。'
        }
3. **核心知识枢纽 (Hubs)**：
${hubNotes.map((n, i) => `   - **${i+1}. [[${n.id}]]** (关联数: ${n.degree})：承载了较多核心概念，是知识库的骨架。`).join('\n')}
4. **健康度诊断**：
   - 发现 **${orphanNotes.length}** 个知识孤岛（未与其他任何笔记建立连接）。
   - 建议在侧边栏的 **「健康诊断」** 标签页中，一键采纳我的双链推荐，激活这些孤立的知识。`;
      } else if (query.includes('孤岛') || query.includes('未连接') || query.includes('健康')) {
        if (orphanNotes.length === 0) {
          responseText = `### 🎉 完美！当前知识库没有“知识孤岛”

所有的笔记都通过双向链接有机地结合在一起。你的知识网络非常健康，继续保持！`;
        } else {
          responseText = `### 🔍 知识孤岛诊断

当前发现 **${orphanNotes.length}** 篇笔记处于孤立状态（无任何出链和入链）：

${orphanNotes.map(n => {
  const rec = getRecommendation(n);
  return `* **[[${n.id}]]** (建议关联: ${rec ? `[[${rec.id}]]` : '无'})`;
}).join('\n')}

你可以直接在 **「健康诊断」** 面板中，一键为它们建立双链连接，或者双击图谱中的节点进行手动连线。`;
        }
      } else if (query.includes('周报') || query.includes('摘要') || query.includes('总结')) {
        responseText = `### 📝 Morpheus Canvas 知识库周报 (自动生成)

**生成时间**：2026年7月6日 (看山实验室 Morpheus 运行时)

#### 一、 知识版图进展
本周知识库主要围绕 **Morpheus Canvas 核心架构** 展开，重点完善了以下模块：
- **[[morpheus-canvas|核心架构]]**：确立了“数据即文件”、“多维投影”和“双链网状”的设计理念。
- **[[relationship-graph-engine|关系图谱引擎]]**：自研了 HTML5 Canvas 力导向图算法，支持 Zoom & Pan 及一阶关联高亮。
- **[[kanban-board-design|看板视图设计]]**：实现了按属性（status/priority）动态重组看板，并支持拖拽自动重写 Frontmatter。

#### 二、 待办与优化建议
1. **[[data-flow-and-parser|数据流与解析器]]** 目前状态为 \`todo\`，优先级较低，建议尽快启动，以支撑更复杂的 Markdown 语法解析。
2. 发现 **[[note-editor-component|侧边栏编辑器]]** 已经完成 (\`done\`)，可以很好地支持实时预览和双向链接跳转。
3. 建议针对 **${orphanNotes.length}** 个孤岛节点进行链接补充，使知识网络更加连通。`;
      } else {
        // 模糊匹配
        const matchedNote = noteList.find(n => query.includes(n.title.toLowerCase()) || query.includes(n.id));
        if (matchedNote) {
          responseText = `### 📖 关于《${matchedNote.title}》的分析

我为你找到了相关笔记 **[[${matchedNote.id}]]**，其当前状态为 \`\${matchedNote.frontmatter.status || 'todo'}\`，优先级为 \`\${matchedNote.frontmatter.priority || 'low'}\`。

**内容摘要**：
> ${matchedNote.content.replace(/[#*`[\]]/g, '').slice(0, 150)}...

**链接关系**：
- **引用的笔记 (Outbounds)**：${matchedNote.links.map(l => `[[${l}]]`).join(', ') || '无'}
- **被引用的笔记 (Backlinks)**：${matchedNote.backlinks.map(l => `[[${l}]]`).join(', ') || '无'}

你可以直接点击上方的链接跳转到对应笔记，或在编辑器中继续完善它。`;
        } else {
          responseText = `收到！关于“${text}”，我检索了你的整个知识库。

目前知识库中与此最相关的核心笔记是 **[[morpheus-canvas]]**。建议你可以围绕这个核心，创建更多相关的笔记，并使用 \`[[双链]]\` 建立关联。

如果你想让我帮你把某个复杂的想法分解成具体的任务卡片，可以切换到 **「AI 任务分解」** 标签页，我会为你提供一键生成子卡片的服务！`;
        }
      }

      const morpheusMsg: Message = {
        sender: 'morpheus',
        text: responseText,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, morpheusMsg]);
      setIsDarkTyping(false);
    }, 1200);
  };

  // --- 3. AI 任务分解功能 ---
  const [selectedDecomposeId, setSelectedDecomposeId] = useState<string>('morpheus-canvas');
  const [decomposedTasks, setDecomposedTasks] = useState<{title: string, content: string}[]>([]);

  const handleDecompose = () => {
    const note = notes[selectedDecomposeId];
    if (!note) return;

    setIsDarkTyping(true);
    setDecomposedTasks([]);

    setTimeout(() => {
      // 根据不同的笔记生成不同的任务分解，使其看起来非常智能且真实
      let tasks = [
        {
          title: `${note.title} - 任务拆解 A`,
          content: `---
title: ${note.title} - 任务拆解 A
status: todo
priority: medium
tags: [ai-decomposed, ${selectedDecomposeId}]
dueDate: 2026-07-10
---
# ${note.title} - 任务拆解 A

这是由看山实验室 Morpheus 助手自动分解的子任务。
关联父笔记：[[${selectedDecomposeId}]]

## 任务详情
- [ ] 详细调研相关技术实现
- [ ] 编写核心接口与数据结构定义
- [ ] 编写单元测试用例
`
        },
        {
          title: `${note.title} - 任务拆解 B`,
          content: `---
title: ${note.title} - 任务拆解 B
status: todo
priority: low
tags: [ai-decomposed, ${selectedDecomposeId}]
dueDate: 2026-07-12
---
# ${note.title} - 任务拆解 B

这是由看山实验室 Morpheus 助手自动分解的子任务。
关联父笔记：[[${selectedDecomposeId}]]

## 任务详情
- [ ] 实现核心业务逻辑
- [ ] 与前端/其它模块进行联调
- [ ] 修复联调过程中的边界 Bug
`
        },
        {
          title: `${note.title} - 任务拆解 C`,
          content: `---
title: ${note.title} - 任务拆解 C
status: todo
priority: high
tags: [ai-decomposed, ${selectedDecomposeId}]
dueDate: 2026-07-15
---
# ${note.title} - 任务拆解 C

这是由看山实验室 Morpheus 助手自动分解的子任务。
关联父笔记：[[${selectedDecomposeId}]]

## 任务详情
- [ ] 进行性能调优与内存泄漏排查
- [ ] 编写部署与发布文档
- [ ] 合并至主分支并触发自动部署
`
        }
      ];

      // 特设一些更有趣、更贴合实际的拆解
      if (selectedDecomposeId === 'morpheus-canvas') {
        tasks = [
          {
            title: `Morpheus Canvas 移动端适配`,
            content: `---
title: Morpheus Canvas 移动端适配
status: todo
priority: medium
tags: [ui, mobile, morpheus-canvas]
dueDate: 2026-07-15
---
# Morpheus Canvas 移动端适配

针对移动端（手机、平板）的触摸屏交互，对多维看板与关系图谱进行适配。
关联父笔记：[[morpheus-canvas]]

## 核心任务
- [ ] 适配 Canvas 的双指缩放 (Pinch to Zoom) 与单指拖拽。
- [ ] 看板卡片在移动端支持长按触发拖拽。
- [ ] 侧边栏编辑器在小屏设备下改为底部抽屉式滑出。
`
          },
          {
            title: `多维看板自定义字段支持`,
            content: `---
title: 多维看板自定义字段支持
status: todo
priority: high
tags: [kanban, feature, morpheus-canvas]
dueDate: 2026-07-18
---
# 多维看板自定义字段支持

除了 status 和 priority，支持用户在 Frontmatter 中自定义任何枚举字段，并以此字段进行看板列的分组。
关联父笔记：[[morpheus-canvas]]

## 核心任务
- [ ] 动态解析所有笔记 Frontmatter 中的自定义键。
- [ ] 在看板顶部提供“自定义分组”下拉菜单。
- [ ] 拖拽卡片时，自动修改对应的自定义 Frontmatter 键值。
`
          },
          {
            title: `本地 LocalStorage 自动持久化`,
            content: `---
title: 本地 LocalStorage 自动持久化
status: todo
priority: low
tags: [data, storage, morpheus-canvas]
dueDate: 2026-07-22
---
# 本地 LocalStorage 自动持久化

将用户的笔记库自动同步保存到浏览器的 LocalStorage 中，防止刷新页面后数据丢失，实现真正的 local-first 体验。
关联父笔记：[[morpheus-canvas]]

## 核心任务
- [ ] 在 App 初始化时，优先从 LocalStorage 读取笔记数据。
- [ ] 在每次笔记更新、保存或添加时，防抖同步到 LocalStorage。
- [ ] 提供“恢复默认示例数据”的重置按钮。
`
          }
        ];
      } else if (selectedDecomposeId === 'relationship-graph-engine') {
        tasks = [
          {
            title: `Canvas 3D 质感节点渲染`,
            content: `---
title: Canvas 3D 质感节点渲染
status: todo
priority: low
tags: [canvas, ui, relationship-graph-engine]
dueDate: 2026-07-14
---
# Canvas 3D 质感节点渲染

使用 Canvas 的径向渐变 (createRadialGradient) 和阴影效果，为关系图谱中的节点赋予 3D 球体质感。
关联父笔记：[[relationship-graph-engine]]

## 核心任务
- [ ] 在绘制节点时，使用径向渐变模拟光源照射效果。
- [ ] 为高亮和选中的节点添加动态呼吸发光阴影。
`
          },
          {
            title: `图谱力导向物理参数实时调节面板`,
            content: `---
title: 图谱力导向物理参数实时调节面板
status: todo
priority: medium
tags: [canvas, interaction, relationship-graph-engine]
dueDate: 2026-07-16
---
# 图谱力导向物理参数实时调节面板

提供一个控制滑块面板，允许用户实时调节排斥力、吸引力、向心力、阻尼等物理参数，实时观察图谱的形态变化。
关联父笔记：[[relationship-graph-engine]]

## 核心任务
- [ ] 在图谱界面新增一个可折叠的“物理参数”控制面板。
- [ ] 将物理参数绑定到 React 状态，并传递给 Canvas 渲染循环。
`
          }
        ];
      }

      setDecomposedTasks(tasks);
      setIsDarkTyping(false);
    }, 1000);
  };

  const handleCreateDecomposedTasks = () => {
    if (decomposedTasks.length === 0) return;

    // 1. 创建子笔记
    decomposedTasks.forEach(task => {
      onAddNoteWithContent(task.title, task.content, 'todo');
    });

    // 2. 更新父笔记，追加子笔记的双链
    const parentNote = notes[selectedDecomposeId];
    if (parentNote) {
      const linksStr = decomposedTasks.map(t => {
        const id = t.title.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        return `* 子任务：[[${id}]]`;
      }).join('\n');

      const updatedContent = parentNote.content.trim() + `\n\n### 🤖 AI 自动任务拆解\n${linksStr}`;
      onUpdateNote(selectedDecomposeId, {
        content: updatedContent
      });
    }

    alert(`成功将《${notes[selectedDecomposeId]?.title}》拆解为 ${decomposedTasks.length} 个子任务卡片！已自动在看板和图谱中生成，并建立了父子双向链接。`);
    setDecomposedTasks([]);
  };

  // 渲染 Markdown 格式的 RAG 回答（支持双链跳转）
  const renderMarkdown = (text: string) => {
    const wikiLinkRegex = /\[\[(.*?)\]\]/g;
    const lines = text.split('\n');

    return lines.map((line, lineIdx) => {
      const elements: React.ReactNode[] = [];
      let currentIdx = 0;
      let m;

      // 重置正则
      wikiLinkRegex.lastIndex = 0;

      while ((m = wikiLinkRegex.exec(line)) !== null) {
        if (m.index > currentIdx) {
          elements.push(line.slice(currentIdx, m.index));
        }

        const fullLink = m[1];
        const pipeIndex = fullLink.indexOf('|');
        const targetId = pipeIndex !== -1 ? fullLink.slice(0, pipeIndex).trim() : fullLink.trim();
        const displayName = pipeIndex !== -1 ? fullLink.slice(pipeIndex + 1).trim() : targetId;
        const normalizedId = targetId.toLowerCase().replace(/\s+/g, '-');

        const targetExists = !!notes[normalizedId];

        elements.push(
          <button
            key={m.index}
            onClick={() => targetExists && onSelectNote(normalizedId)}
            className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded font-semibold text-xs transition-colors ${
              targetExists
                ? 'bg-indigo-50 hover:bg-indigo-100 text-indigo-600 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/40 dark:text-indigo-400 border border-indigo-100/30 dark:border-indigo-900/20'
                : 'bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400 border border-rose-100/50 dark:border-rose-900/20 line-through'
            }`}
            title={targetExists ? `跳转到: ${displayName}` : `笔记不存在: ${targetId}`}
          >
            <Link2 size={10} />
            {displayName}
          </button>
        );

        currentIdx = wikiLinkRegex.lastIndex;
      }

      if (currentIdx < line.length) {
        elements.push(line.slice(currentIdx));
      }

      const lineStr = line.trim();
      if (lineStr.startsWith('### ')) {
        return <h3 key={lineIdx} className="text-base font-bold text-slate-800 dark:text-slate-100 mt-4 mb-2">{elements.slice(1)}</h3>;
      } else if (lineStr.startsWith('#### ')) {
        return <h4 key={lineIdx} className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-3 mb-1">{elements.slice(1)}</h4>;
      } else if (lineStr.startsWith('1. ') || lineStr.startsWith('2. ') || lineStr.startsWith('3. ') || lineStr.startsWith('4. ')) {
        return <div key={lineIdx} className="text-xs text-slate-600 dark:text-slate-300 ml-4 mb-1.5 leading-relaxed">{elements}</div>;
      } else if (lineStr.startsWith('* ') || lineStr.startsWith('- ')) {
        return <div key={lineIdx} className="text-xs text-slate-600 dark:text-slate-300 ml-4 mb-1 flex items-start gap-1.5">
          <span className="mt-1.5 h-1 w-1 rounded-full bg-indigo-500 shrink-0" />
          <span>{elements.slice(1)}</span>
        </div>;
      }

      return <p key={lineIdx} className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-2 min-h-[1rem]">{elements}</p>;
    });
  };

  return (
    <div className="flex flex-col h-full w-[380px] bg-white dark:bg-slate-950 border-l border-slate-200 dark:border-slate-800 shadow-2xl relative z-10">
      {/* 助手头部 */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <Bot size={18} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100">Morpheus AI 思考伙伴</h3>
              <span className="text-[9px] font-semibold bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded">看山实验室</span>
            </div>
            <p className="text-[10px] text-slate-400 dark:text-slate-500">
              基于本地笔记的 Grounded RAG 知识引擎
            </p>
          </div>
        </div>
      </div>

      {/* 标签页切换 */}
      <div className="flex border-b border-slate-100 dark:border-slate-900 px-2 py-1 bg-slate-50/50 dark:bg-slate-900/10">
        <button
          onClick={() => setActiveTab('health')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-md transition-all ${
            activeTab === 'health'
              ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Activity size={13} />
          <span>健康诊断</span>
        </button>
        <button
          onClick={() => setActiveTab('chat')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-md transition-all ${
            activeTab === 'chat'
              ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <MessageSquare size={13} />
          <span>智能问答</span>
        </button>
        <button
          onClick={() => setActiveTab('ai-tasks')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-md transition-all ${
            activeTab === 'ai-tasks'
              ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Compass size={13} />
          <span>任务分解</span>
        </button>
      </div>

      {/* 标签内容区域 */}
      <div className="flex-1 overflow-y-auto p-4 min-h-0">
        <AnimatePresence mode="wait">
          {activeTab === 'health' && (
            <motion.div
              key="health"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="space-y-4"
            >
              {/* 核心指标卡片 */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-900 p-3 rounded-xl">
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">网状化指数</span>
                  <div className="flex items-baseline gap-1.5 mt-1">
                    <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400">{networkIndex}%</span>
                    <TrendingUp size={12} className="text-emerald-500" />
                  </div>
                  <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-1">总链接数 / 笔记总数</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-900 p-3 rounded-xl">
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">知识孤岛</span>
                  <div className="flex items-baseline gap-1.5 mt-1">
                    <span className={`text-xl font-bold ${orphanNotes.length > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                      {orphanNotes.length}
                    </span>
                    {orphanNotes.length > 0 && <AlertCircle size={12} className="text-rose-500" />}
                  </div>
                  <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-1">未与其他笔记连接</p>
                </div>
              </div>

              {/* 知识孤岛诊断与一键推荐 */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <AlertCircle size={14} className="text-indigo-500" />
                  <span>知识孤岛诊断与双链激活</span>
                </h4>
                {orphanNotes.length === 0 ? (
                  <div className="bg-emerald-50/30 dark:bg-emerald-950/10 border border-emerald-100/50 dark:border-emerald-900/20 p-3.5 rounded-xl flex items-start gap-2.5">
                    <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <h5 className="text-xs font-bold text-emerald-800 dark:text-emerald-400">网络非常健康！</h5>
                      <p className="text-[10px] text-emerald-600/80 dark:text-emerald-500/80 mt-0.5 leading-relaxed">
                        当前知识库中没有孤立的笔记。所有的知识点都已通过双向链接有机地连接在一起。
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {orphanNotes.map(orphan => {
                      const rec = getRecommendation(orphan);
                      return (
                        <div 
                          key={orphan.id}
                          className="bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-900 p-3 rounded-xl shadow-sm hover:border-slate-200 dark:hover:border-slate-800 transition-all space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <button 
                              onClick={() => onSelectNote(orphan.id)}
                              className="text-xs font-bold text-slate-800 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors text-left truncate max-w-[180px]"
                            >
                              {orphan.title}
                            </button>
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 font-medium">孤立节点</span>
                          </div>
                          
                          {rec && (
                            <div className="bg-slate-50 dark:bg-slate-900/60 p-2 rounded-lg flex items-center justify-between gap-2">
                              <div className="min-w-0">
                                <span className="text-[9px] text-slate-400 dark:text-slate-500 block">AI 推荐关联至：</span>
                                <button 
                                  onClick={() => onSelectNote(rec.id)}
                                  className="text-[10px] font-semibold text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors truncate block max-w-[150px]"
                                >
                                  {rec.title}
                                </button>
                              </div>
                              <button
                                onClick={() => handleCreateLink(orphan.id, rec.id)}
                                className="flex items-center gap-1 px-2 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-[9px] font-bold rounded-md shadow-sm transition-colors shrink-0"
                              >
                                <Link2 size={10} />
                                <span>建立双链</span>
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* 核心知识枢纽 */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <TrendingUp size={14} className="text-indigo-500" />
                  <span>核心知识枢纽 (Hubs)</span>
                </h4>
                <div className="space-y-1.5">
                  {hubNotes.map((hub, idx) => (
                    <div 
                      key={hub.id}
                      className="flex items-center justify-between p-2 rounded-lg bg-slate-50/50 dark:bg-slate-900/20 border border-slate-100/50 dark:border-slate-900/40"
                    >
                      <button 
                        onClick={() => onSelectNote(hub.id)}
                        className="text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors text-left truncate"
                      >
                        {idx + 1}. {hub.title}
                      </button>
                      <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded-full">
                        {hub.degree} 关联
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'chat' && (
            <motion.div
              key="chat"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="flex flex-col h-full min-h-0"
            >
              {/* 聊天消息区域 */}
              <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 pb-4 min-h-0">
                {messages.map((msg, idx) => (
                  <div 
                    key={idx} 
                    className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div className={`max-w-[90%] rounded-2xl p-3 text-xs leading-relaxed shadow-sm ${
                      msg.sender === 'user'
                        ? 'bg-indigo-600 text-white rounded-tr-none'
                        : 'bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-100 dark:border-slate-900/60'
                    }`}>
                      {msg.sender === 'user' ? (
                        <p>{msg.text}</p>
                      ) : (
                        <div className="space-y-1">
                          {renderMarkdown(msg.text)}
                        </div>
                      )}
                    </div>
                    
                    {/* 推荐选项 */}
                    {msg.suggestions && msg.suggestions.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {msg.suggestions.map((sug, sIdx) => (
                          <button
                            key={sIdx}
                            onClick={sug.action}
                            className="text-[10px] font-semibold px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/30 dark:hover:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border border-indigo-100/50 dark:border-indigo-900/20 rounded-full transition-colors"
                          >
                            {sug.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                {isTyping && (
                  <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-900/60 px-3 py-2 rounded-2xl rounded-tl-none w-16 shadow-sm">
                    <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                )}
              </div>

              {/* 输入框区域 */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-900 flex gap-2">
                <input
                  type="text"
                  placeholder="向 Morpheus 提问..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(inputValue)}
                  className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-500 transition-colors"
                />
                <button
                  onClick={() => handleSendMessage(inputValue)}
                  className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-md shadow-indigo-500/10 transition-colors"
                >
                  <Send size={14} />
                </button>
              </div>
            </motion.div>
          )}

          {activeTab === 'ai-tasks' && (
            <motion.div
              key="ai-tasks"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="space-y-4"
            >
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Compass size={14} className="text-indigo-500" />
                  <span>AI 智能任务拆解</span>
                </h4>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-relaxed">
                  选择一篇复杂的笔记，Morpheus 会自动分析其内容，并将其拆解为看板上的多个具体子任务卡片，并自动建立双向链接。
                </p>
              </div>

              {/* 笔记选择器 */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 block">选择目标笔记：</label>
                <select
                  value={selectedDecomposeId}
                  onChange={(e) => {
                    setSelectedDecomposeId(e.target.value);
                    setDecomposedTasks([]);
                  }}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-500 transition-colors text-slate-700 dark:text-slate-300 font-semibold"
                >
                  {noteList.map(n => (
                    <option key={n.id} value={n.id}>{n.title}</option>
                  ))}
                </select>
              </div>

              {/* 拆解按钮 */}
              <button
                onClick={handleDecompose}
                disabled={isTyping}
                className="w-full flex items-center justify-center gap-1.5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-xs font-bold rounded-lg shadow-md shadow-indigo-500/10 transition-colors"
              >
                <Sparkles size={13} />
                <span>{isTyping ? '分析中...' : '一键 AI 拆解任务'}</span>
              </button>

              {/* 拆解结果展示 */}
              {decomposedTasks.length > 0 && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">拆解出以下子任务卡片：</span>
                    <span className="text-[9px] font-bold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded-full">
                      {decomposedTasks.length} 个
                    </span>
                  </div>

                  <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                    {decomposedTasks.map((task, idx) => (
                      <div 
                        key={idx}
                        className="bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-900 p-2.5 rounded-lg space-y-1"
                      >
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] font-bold bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 h-4 w-4 rounded flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{task.title}</h5>
                        </div>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 pl-5 line-clamp-2 leading-relaxed">
                          {task.content.split('---')[2]?.replace(/[#*`[\]]/g, '').trim()}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* 一键生成按钮 */}
                  <button
                    onClick={handleCreateDecomposedTasks}
                    className="w-full flex items-center justify-center gap-1.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-md shadow-emerald-500/10 transition-colors"
                  >
                    <Plus size={13} />
                    <span>一键生成子卡片并建立双链</span>
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
