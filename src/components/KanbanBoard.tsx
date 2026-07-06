import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Note } from '../utils/markdown';
import { Calendar, Tag, Plus, Edit2, Link2 } from 'lucide-react';

interface KanbanBoardProps {
  notes: Record<string, Note>;
  onUpdateNote: (id: string, updates: Partial<Note>) => void;
  onSelectNote: (id: string) => void;
  onAddNote: (status: 'todo' | 'in_progress' | 'done') => void;
}

type GroupBy = 'status' | 'priority' | 'tag';

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  notes,
  onUpdateNote,
  onSelectNote,
  onAddNote,
}) => {
  const [groupBy, setGroupBy] = useState<GroupBy>('status');
  const [draggedId, setDraggedId] = useState<string | null>(null);

  const noteList = Object.values(notes);

  // 动态提取所有的 tags 列表，用于按标签分组看板
  const allTags = Array.from(
    new Set(
      noteList.flatMap(note => note.frontmatter.tags || [])
    )
  ).slice(0, 4); // 限制最多展示前 4 个热门标签，避免看板过宽

  // 定义看板列
  const columns = groupBy === 'status' 
    ? [
        { id: 'todo', title: '待办 (Todo)', color: 'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800' },
        { id: 'in_progress', title: '进行中 (In Progress)', color: 'bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-100 dark:border-indigo-900/30' },
        { id: 'done', title: '已完成 (Done)', color: 'bg-emerald-50/30 dark:bg-emerald-950/10 border-emerald-100 dark:border-emerald-900/20' }
      ]
    : groupBy === 'priority'
    ? [
        { id: 'high', title: '高优先级 (High)', color: 'bg-rose-50/30 dark:bg-rose-950/10 border-rose-100 dark:border-rose-900/20' },
        { id: 'medium', title: '中优先级 (Medium)', color: 'bg-amber-50/30 dark:bg-amber-950/10 border-amber-100 dark:border-amber-900/20' },
        { id: 'low', title: '低优先级 (Low)', color: 'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800' }
      ]
    : [
        ...allTags.map((tag, idx) => {
          const colors = [
            'bg-indigo-50/30 dark:bg-indigo-950/10 border-indigo-100 dark:border-indigo-900/20',
            'bg-purple-50/30 dark:bg-purple-950/10 border-purple-100 dark:border-purple-900/20',
            'bg-pink-50/30 dark:bg-pink-950/10 border-pink-100 dark:border-pink-900/20',
            'bg-cyan-50/30 dark:bg-cyan-950/10 border-cyan-100 dark:border-cyan-900/20',
          ];
          return {
            id: `tag-${tag}`,
            title: `# ${tag}`,
            color: colors[idx % colors.length],
            tagValue: tag
          };
        }),
        { id: 'tag-untagged', title: '无标签 (Untagged)', color: 'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800', tagValue: null }
      ];

  // 过滤出属于特定列的卡片
  const getColumnNotes = (col: typeof columns[0]) => {
    return noteList.filter(note => {
      if (groupBy === 'status') {
        const status = note.frontmatter.status || 'todo';
        return status === col.id;
      } else if (groupBy === 'priority') {
        const priority = note.frontmatter.priority || 'low';
        return priority === col.id;
      } else {
        // 按标签分组
        const noteTags = note.frontmatter.tags || [];
        const targetTag = (col as any).tagValue;
        if (targetTag === null) {
          return noteTags.length === 0;
        }
        return noteTags.includes(targetTag);
      }
    });
  };

  // 处理拖拽开始
  const handleDragStart = (id: string) => {
    setDraggedId(id);
  };

  // 处理拖拽放置
  const handleDrop = (col: typeof columns[0]) => {
    if (!draggedId) return;
    
    const note = notes[draggedId];
    if (!note) return;

    if (groupBy === 'status') {
      if (note.frontmatter.status === col.id) return;
      onUpdateNote(draggedId, {
        frontmatter: {
          ...note.frontmatter,
          status: col.id as 'todo' | 'in_progress' | 'done',
        }
      });
    } else if (groupBy === 'priority') {
      if (note.frontmatter.priority === col.id) return;
      onUpdateNote(draggedId, {
        frontmatter: {
          ...note.frontmatter,
          priority: col.id as 'high' | 'medium' | 'low',
        }
      });
    } else {
      // 按标签拖拽：如果是拖入某个标签列，则为笔记添加该标签（如果不存在）；如果是拖入无标签列，则清空标签。
      const targetTag = (col as any).tagValue;
      let updatedTags = [...(note.frontmatter.tags || [])];

      if (targetTag === null) {
        updatedTags = [];
      } else {
        if (updatedTags.includes(targetTag)) return; // 已经有该标签了
        updatedTags.push(targetTag);
      }

      onUpdateNote(draggedId, {
        frontmatter: {
          ...note.frontmatter,
          tags: updatedTags,
        }
      });
    }

    setDraggedId(null);
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high': return 'text-rose-600 bg-rose-50 border-rose-100 dark:text-rose-400 dark:bg-rose-950/30 dark:border-rose-900/30';
      case 'medium': return 'text-amber-600 bg-amber-50 border-amber-100 dark:text-amber-400 dark:bg-amber-950/30 dark:border-amber-900/30';
      default: return 'text-slate-600 bg-slate-100 border-slate-200 dark:text-slate-400 dark:bg-slate-800 dark:border-slate-700';
    }
  };

  return (
    <div className="flex flex-col h-full w-full p-6 overflow-hidden">
      {/* 顶部工具栏 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">多维交互看板</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            拖拽卡片可直接更新 Markdown 笔记的 Frontmatter 属性（支持状态、优先级、标签多维重组）
          </p>
        </div>
        
        {/* 分组切换器 */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-900 p-1 rounded-lg border border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setGroupBy('status')}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all duration-150 ${
              groupBy === 'status'
                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            按状态
          </button>
          <button
            onClick={() => setGroupBy('priority')}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all duration-150 ${
              groupBy === 'priority'
                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            按优先级
          </button>
          <button
            onClick={() => setGroupBy('tag')}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all duration-150 ${
              groupBy === 'tag'
                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            按标签
          </button>
        </div>
      </div>

      {/* 看板列容器 */}
      <div className="flex flex-1 gap-6 overflow-x-auto pb-4 no-scrollbar">
        {columns.map(col => (
          <div
            key={col.id}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop(col)}
            className={`flex flex-col flex-1 min-w-[320px] max-w-[400px] rounded-xl border p-4 transition-colors duration-200 ${col.color}`}
          >
            {/* 列头部 */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {col.title}
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                  {getColumnNotes(col).length}
                </span>
              </div>
              
              {/* 如果是按状态分组，允许在列中直接创建新卡片 */}
              {groupBy === 'status' && (
                <button
                  onClick={() => onAddNote(col.id as 'todo' | 'in_progress' | 'done')}
                  className="p-1 rounded-md hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
                  title="添加卡片"
                >
                  <Plus size={18} />
                </button>
              )}
            </div>

            {/* 卡片列表 */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              <AnimatePresence mode="popLayout">
                {getColumnNotes(col).map(note => (
                  <motion.div
                    key={note.id}
                    layoutId={`card-${note.id}`}
                    draggable
                    onDragStart={() => handleDragStart(note.id)}
                    onClick={() => onSelectNote(note.id)}
                    whileHover={{ y: -2, scale: 1.01 }}
                    whileDrag={{ scale: 1.03, rotate: 1 }}
                    className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 rounded-lg p-4 shadow-sm hover:shadow-md cursor-grab active:cursor-grabbing transition-shadow duration-150 relative group"
                  >
                    {/* 卡片标题 */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-semibold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1">
                        {note.title}
                      </h3>
                      <button 
                        className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectNote(note.id);
                        }}
                      >
                        <Edit2 size={14} />
                      </button>
                    </div>

                    {/* 卡片摘要/正文片段 */}
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">
                      {note.content.replace(/[#*`[\]]/g, '').slice(0, 100) || '无内容...'}
                    </p>

                    {/* 卡片底部元数据 */}
                    <div className="flex flex-wrap items-center gap-2 mt-auto pt-2 border-t border-slate-100 dark:border-slate-900/60 text-[10px] text-slate-500 dark:text-slate-400">
                      {/* 优先级 */}
                      {note.frontmatter.priority && (
                        <span className={`px-2 py-0.5 rounded-full border font-medium ${getPriorityColor(note.frontmatter.priority)}`}>
                          {note.frontmatter.priority.toUpperCase()}
                        </span>
                      )}

                      {/* 截止日期 */}
                      {note.frontmatter.dueDate && (
                        <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                          <Calendar size={10} />
                          {note.frontmatter.dueDate}
                        </span>
                      )}

                      {/* 标签 */}
                      {note.frontmatter.tags && note.frontmatter.tags.slice(0, 2).map(tag => (
                        <span key={tag} className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 border border-indigo-100/50 dark:border-indigo-900/20">
                          <Tag size={8} />
                          {tag}
                        </span>
                      ))}

                      {/* 双向链接计数 */}
                      {(note.links.length > 0 || note.backlinks.length > 0) && (
                        <span className="flex items-center gap-0.5 ml-auto text-slate-400 dark:text-slate-500" title="双向链接数">
                          <Link2 size={10} />
                          <span>{note.links.length + note.backlinks.length}</span>
                        </span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {getColumnNotes(col).length === 0 && (
                <div className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-lg text-slate-400 text-xs">
                  <span>拖拽卡片到此处</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
