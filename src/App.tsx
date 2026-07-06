import { useState, useEffect } from 'react';
import { KanbanBoard } from './components/KanbanBoard';
import { RelationshipGraph } from './components/RelationshipGraph';
import { NoteEditor } from './components/NoteEditor';
import { MorpheusAssistant } from './components/MorpheusAssistant';
import { ImportExport } from './components/ImportExport';
import { Note, buildNoteLibrary, updateNoteFrontmatter } from './utils/markdown';
import { initialNotes } from './utils/initialData';
import { LayoutDashboard, Network, Moon, Sun, Plus, Search, HelpCircle, Bot } from 'lucide-react';

type ViewMode = 'kanban' | 'graph';

function App() {
  const [notes, setNotes] = useState<Record<string, Note>>({});
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('kanban');
  const [darkMode, setDarkMode] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showAssistant, setShowAssistant] = useState<boolean>(true);

  // 初始化数据
  useEffect(() => {
    const library = buildNoteLibrary(initialNotes);
    setNotes(library);
  }, []);

  // 切换暗黑模式
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // 处理笔记更新（看板拖拽或编辑器保存）
  const handleUpdateNote = (id: string, updates: Partial<Note>) => {
    setNotes(prev => {
      const currentNote = prev[id];
      if (!currentNote) return prev;

      let updatedNote = { ...currentNote, ...updates };

      // 如果更新了 frontmatter，需要重新生成内容并解析出链
      if (updates.frontmatter) {
        updatedNote = updateNoteFrontmatter(currentNote, updates.frontmatter);
      }

      // 重新构建整个库以更新 backlinks
      const rawNotesList = Object.values(prev).map(n => ({
        id: n.id,
        content: n.id === id 
          ? `---\n${Object.entries(updatedNote.frontmatter).map(([k, v]) => Array.isArray(v) ? `${k}: [${v.join(', ')}]` : `${k}: ${v}`).join('\n')}\n---\n${updatedNote.content}` 
          : `---\n${Object.entries(n.frontmatter).map(([k, v]) => Array.isArray(v) ? `${k}: [${v.join(', ')}]` : `${k}: ${v}`).join('\n')}\n---\n${n.content}`
      }));

      return buildNoteLibrary(rawNotesList);
    });
  };

  // 编辑器保存
  const handleSaveNote = (id: string, fullContent: string) => {
    setNotes(prev => {
      const rawNotesList = Object.values(prev).map(n => {
        if (n.id === id) {
          return { id, content: fullContent };
        }
        // 重新组装其他笔记
        const fmStr = Object.entries(n.frontmatter)
          .map(([k, v]) => Array.isArray(v) ? `${k}: [${v.join(', ')}]` : `${k}: ${v}`)
          .join('\n');
        return {
          id: n.id,
          content: `---\n${fmStr}\n---\n${n.content}`
        };
      });

      return buildNoteLibrary(rawNotesList);
    });
  };

  // 添加新笔记
  const handleAddNote = (status: 'todo' | 'in_progress' | 'done' = 'todo') => {
    const title = prompt('请输入新笔记标题：');
    if (!title) return;

    const id = title.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    if (!id) {
      alert('标题无效！');
      return;
    }

    if (notes[id]) {
      alert('已存在同名笔记！');
      return;
    }

    const newRawNote = {
      id,
      content: `---
title: ${title}
status: ${status}
priority: low
tags: []
dueDate: ${new Date().toISOString().split('T')[0]}
---
# ${title}

在此处输入笔记内容...
`
    };

    setNotes(prev => {
      const rawNotesList = Object.values(prev).map(n => {
        const fmStr = Object.entries(n.frontmatter)
          .map(([k, v]) => Array.isArray(v) ? `${k}: [${v.join(', ')}]` : `${k}: ${v}`)
          .join('\n');
        return {
          id: n.id,
          content: `---\n${fmStr}\n---\n${n.content}`
        };
      });

      rawNotesList.push(newRawNote);
      const newLib = buildNoteLibrary(rawNotesList);
      return newLib;
    });

    setSelectedNoteId(id);
  };

  // Morpheus 助手创建带内容的笔记
  const handleAddNoteWithContent = (title: string, content: string) => {
    const id = title.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    if (!id || notes[id]) return;

    setNotes(prev => {
      const rawNotesList = Object.values(prev).map(n => {
        const fmStr = Object.entries(n.frontmatter)
          .map(([k, v]) => Array.isArray(v) ? `${k}: [${v.join(', ')}]` : `${k}: ${v}`)
          .join('\n');
        return {
          id: n.id,
          content: `---\n${fmStr}\n---\n${n.content}`
        };
      });

      rawNotesList.push({ id, content });
      return buildNoteLibrary(rawNotesList);
    });
  };

  // 处理批量导入笔记
  const handleImportNotes = (importedList: { id: string; content: string }[]) => {
    setNotes(prev => {
      const rawNotesList = Object.values(prev).map(n => {
        const fmStr = Object.entries(n.frontmatter)
          .map(([k, v]) => Array.isArray(v) ? `${k}: [${v.join(', ')}]` : `${k}: ${v}`)
          .join('\n');
        return {
          id: n.id,
          content: `---\n${fmStr}\n---\n${n.content}`
        };
      });

      // 避免重复导入同名笔记
      importedList.forEach(imp => {
        const existsIdx = rawNotesList.findIndex(n => n.id === imp.id);
        if (existsIdx !== -1) {
          rawNotesList[existsIdx] = imp;
        } else {
          rawNotesList.push(imp);
        }
      });

      return buildNoteLibrary(rawNotesList);
    });
  };

  // 过滤笔记
  const filteredNotes = Object.keys(notes).reduce((acc, id) => {
    const note = notes[id];
    const matchesSearch = searchQuery === '' || 
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (note.frontmatter.tags && note.frontmatter.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())));
    
    if (matchesSearch) {
      acc[id] = note;
    }
    return acc;
  }, {} as Record<string, Note>);

  const selectedNote = selectedNoteId ? notes[selectedNoteId] : null;

  return (
    <div className="flex h-screen w-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50 transition-colors duration-200 overflow-hidden">
      {/* 侧边导航栏 */}
      <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col z-10">
        {/* 品牌 Logo */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
            <span className="text-xl font-bold">M</span>
          </div>
          <div>
            <h1 className="font-bold text-slate-800 dark:text-slate-100 leading-tight">Morpheus</h1>
            <span className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold tracking-wider uppercase">Canvas</span>
          </div>
        </div>

        {/* 搜索框 */}
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="搜索笔记或标签..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-500 transition-colors"
            />
          </div>
        </div>

        {/* 视图切换 */}
        <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto">
          <button
            onClick={() => setViewMode('kanban')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-150 ${
              viewMode === 'kanban'
                ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
            }`}
          >
            <LayoutDashboard size={18} />
            <span>多维交互看板</span>
          </button>
          <button
            onClick={() => setViewMode('graph')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-150 ${
              viewMode === 'graph'
                ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
            }`}
          >
            <Network size={18} />
            <span>关系图谱引擎</span>
          </button>

          <button
            onClick={() => setShowAssistant(!showAssistant)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-150 ${
              showAssistant
                ? 'bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
            }`}
          >
            <Bot size={18} />
            <span>Morpheus AI 助手</span>
          </button>

          {/* 导入导出组件 */}
          <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800/60">
            <ImportExport notes={notes} onImportNotes={handleImportNotes} />
          </div>
        </nav>

        {/* 底部设置与关于 */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
          <button
            onClick={() => handleAddNote('todo')}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-md shadow-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/30 transition-all duration-150"
          >
            <Plus size={14} />
            <span>新建 Markdown 笔记</span>
          </button>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500 text-xs">
              <HelpCircle size={14} />
              <span>看山实验室 Morpheus</span>
            </div>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
              title={darkMode ? '浅色模式' : '深色模式'}
            >
              {darkMode ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>
        </div>
      </aside>

      {/* 主工作区 */}
      <main className="flex-1 flex overflow-hidden relative bg-slate-50 dark:bg-slate-950">
        <div className="flex-1 h-full overflow-hidden">
          {viewMode === 'kanban' ? (
            <KanbanBoard
              notes={filteredNotes}
              onUpdateNote={handleUpdateNote}
              onSelectNote={setSelectedNoteId}
              onAddNote={handleAddNote}
            />
          ) : (
            <RelationshipGraph
              notes={filteredNotes}
              onSelectNote={setSelectedNoteId}
              onUpdateNote={handleUpdateNote}
              selectedNoteId={selectedNoteId}
            />
          )}
        </div>

        {/* 侧边栏编辑器 */}
        {selectedNote && (
          <NoteEditor
            note={selectedNote}
            allNotes={notes}
            onClose={() => setSelectedNoteId(null)}
            onSave={handleSaveNote}
            onSelectNote={setSelectedNoteId}
          />
        )}

        {/* Morpheus AI 思考助手侧边栏 */}
        {showAssistant && (
          <MorpheusAssistant
            notes={notes}
            onUpdateNote={handleUpdateNote}
            onSelectNote={setSelectedNoteId}
            onAddNoteWithContent={handleAddNoteWithContent}
          />
        )}
      </main>
    </div>
  );
}

export default App;
