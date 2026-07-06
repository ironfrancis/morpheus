import { useState, useEffect } from 'react';
import { parseMorpheusMarkdown, DEFAULT_MARKDOWN_TEMPLATE } from './utils/parser';
import type { ParsedData } from './types';
import { TimelineView } from './components/TimelineView';
import { BoardView } from './components/BoardView';
import { SimpleForceGraph } from './components/SimpleForceGraph';
import { PresetTemplates } from './components/PresetTemplates';
import { ShareModal } from './components/ShareModal';
import { 
  Sparkles, 
  Moon, 
  Sun, 
  Milestone, 
  Kanban, 
  Network, 
  Share, 
  Edit3, 
  HelpCircle
} from 'lucide-react';

export default function App() {
  const [markdown, setMarkdown] = useState(DEFAULT_MARKDOWN_TEMPLATE);
  const [parsedData, setParsedData] = useState<ParsedData>(() => parseMorpheusMarkdown(DEFAULT_MARKDOWN_TEMPLATE));
  const [activeTab, setActiveTab] = useState<'timeline' | 'board' | 'graph'>('timeline');
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  // Initialize Theme and check Share URL query on mount
  useEffect(() => {
    // 1. Theme configuration
    const isDarkTheme = localStorage.getItem('theme') !== 'light';
    setTheme(isDarkTheme ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', isDarkTheme);

    // 2. Read state from URL query
    const params = new URLSearchParams(window.location.search);
    const compressedData = params.get('data');
    if (compressedData) {
      try {
        const decoded = decodeURIComponent(atob(compressedData));
        if (decoded && decoded.trim().startsWith('#')) {
          setMarkdown(decoded);
          setParsedData(parseMorpheusMarkdown(decoded));
        }
      } catch (e) {
        console.error('Failed to parse share URL state', e);
      }
    }
  }, []);

  // Update theme helper
  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  // Parse markdown in real-time when it changes
  const handleMarkdownChange = (val: string) => {
    setMarkdown(val);
    try {
      const parsed = parseMorpheusMarkdown(val);
      setParsedData(parsed);
    } catch (e) {
      console.error(e);
    }
  };

  // Handle status transitions on Board cards
  const handleCardStatusChange = (cardId: string, nextStatus: typeof parsedData.cards[0]['status']) => {
    // Find card and update its status in Markdown
    const updatedCards = parsedData.cards.map(c => {
      if (c.id === cardId) {
        return { ...c, status: nextStatus };
      }
      return c;
    });

    // Rebuild Markdown content with new checked/unchecked/prio/status
    setParsedData(prev => ({
      ...prev,
      cards: updatedCards
    }));

    // Find the original list line of that card in Markdown and modify status
    const lines = markdown.split('\n');
    let cardTitle = '';
    const foundCard = parsedData.cards.find(c => c.id === cardId);
    if (!foundCard) return;
    cardTitle = foundCard.title;

    const modifiedLines = lines.map(line => {
      if (line.trim().startsWith('-') && line.includes(cardTitle)) {
        // Is checkbox card
        let newLine = line;
        if (nextStatus === 'completed') {
          newLine = newLine.replace(/^(-\s*\[[ ]\])/, '- [x]');
        } else {
          newLine = newLine.replace(/^(-\s*\[[xX]\])/, '- [ ]');
        }

        // Replace status=xxx in curly braces if exists, or append it
        if (newLine.includes('status=')) {
          newLine = newLine.replace(/status=[a-zA-Z_]+/, `status=${nextStatus}`);
        } else if (newLine.includes('{')) {
          newLine = newLine.replace(/\{([^}]+)\}/, `{$1, status=${nextStatus}}`);
        } else {
          newLine = `${newLine} {status=${nextStatus}}`;
        }
        return newLine;
      }
      return line;
    });

    setMarkdown(modifiedLines.join('\n'));
  };

  return (
    <div className="min-h-screen flex flex-col bg-light-bg dark:bg-dark-bg text-gray-800 dark:text-gray-200 transition-colors">
      
      {/* HEADER / NAVIGATION BAR */}
      <header className="sticky top-0 z-40 bg-white/85 dark:bg-dark-bg/85 backdrop-blur-md border-b border-light-border dark:border-dark-border py-4 px-6">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          
          {/* Logo Brand */}
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary rounded-xl text-white shadow-lg shadow-primary/20 flex items-center justify-center animate-pulse">
              <Sparkles size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black tracking-tight text-gray-950 dark:text-white m-0">
                  Morpheus
                </h1>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-primary/10 text-primary rounded-full uppercase border border-primary/20">
                  v1.0.0
                </span>
              </div>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                看山实验室 · 多维交互 Markdown 可视化引擎
              </p>
            </div>
          </div>

          {/* Center Title or Project info parsed from Markdown */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-light-surface dark:bg-dark-surface rounded-full text-xs font-semibold border border-light-border dark:border-dark-border">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-gray-400">当前项目:</span>
            <span className="text-gray-900 dark:text-white max-w-[200px] truncate">{parsedData.projectName}</span>
          </div>

          {/* Actions on right */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowHelp(!showHelp)}
              className="p-2.5 rounded-xl border border-light-border dark:border-dark-border bg-white dark:bg-dark-surface/50 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-all active:scale-95"
              title="使用帮助"
            >
              <HelpCircle size={18} />
            </button>
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl border border-light-border dark:border-dark-border bg-white dark:bg-dark-surface/50 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-all active:scale-95"
              title="切换主题"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button
              onClick={() => setIsShareOpen(true)}
              className="flex items-center gap-2 py-2 px-4 rounded-xl bg-primary text-white hover:bg-primary/90 font-bold text-sm shadow-md shadow-primary/10 transition-all active:scale-95"
            >
              <Share size={15} />
              分享与导出
            </button>
          </div>

        </div>
      </header>

      {/* HELP INSTRUCTIONS BANNER */}
      {showHelp && (
        <div className="bg-primary/5 dark:bg-primary/10 border-b border-primary/20 py-4 px-6 animate-in slide-in-from-top-4 duration-300">
          <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed flex-1">
              <span className="font-bold text-primary text-sm block mb-1">💡 如何在这里书写属于你的可视化大屏？</span>
              Morpheus 能够识别包含二级标题的 Markdown 文件：
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2 font-mono bg-white/60 dark:bg-dark-surface/50 p-2.5 rounded-lg border border-light-border dark:border-dark-border text-[10px] text-gray-700 dark:text-gray-300">
                <div>
                  <strong className="text-primary">1. ## Timeline 视图</strong><br/>
                  - [2026-07-06] [record-entry] 标题: 摘要内容 &#123;prio=1, tags=a|b&#125;<br/>
                  &nbsp;&nbsp;- [ ] 子任务清单<br/>
                </div>
                <div>
                  <strong className="text-primary">2. ## Board 看板视图</strong><br/>
                  - [ ] 任务标题: 详情摘要 &#123;prio=high, assignee=Morpheus, status=todo&#125;
                </div>
                <div>
                  <strong className="text-primary">3. ## Graph 关系图谱</strong><br/>
                  节点名称 &#123;type=project, val=12&#125;<br/>
                  - 节点A -&gt; 节点B : 关系类型
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowHelp(false)}
              className="text-xs font-bold text-primary hover:underline self-end shrink-0"
            >
              我知道了，开始创作
            </button>
          </div>
        </div>
      )}

      {/* MAIN CONTAINER: EDITOR & PREVIEW PANELS */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* LEFT COLUMN: MARKDOWN EDITOR (5 cols) */}
        <section className="lg:col-span-5 flex flex-col gap-4">
          <div className="bg-white/80 dark:bg-dark-surface/80 rounded-2xl p-5 border border-light-border dark:border-dark-border shadow-sm flex-1 flex flex-col min-h-[500px]">
            
            <div className="flex items-center justify-between mb-3 border-b border-light-border dark:border-dark-border pb-3">
              <span className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-1.5">
                <Edit3 size={15} className="text-primary" />
                编辑器 (Markdown Editor)
              </span>
              <span className="text-[10px] text-gray-400 font-mono">
                {markdown.length} 字符
              </span>
            </div>

            {/* Main Textarea Editor */}
            <textarea
              value={markdown}
              onChange={(e) => handleMarkdownChange(e.target.value)}
              placeholder="# 输入你的 Markdown 项目概要..."
              className="flex-1 w-full p-4 rounded-xl border border-light-border dark:border-dark-border bg-light-bg/40 dark:bg-dark-bg/40 text-gray-900 dark:text-gray-100 font-mono text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all resize-none overflow-y-auto"
              style={{ minHeight: '380px' }}
            />
          </div>

          {/* Quick preset templates on bottom left */}
          <div className="flex flex-col gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 px-1">
              试试看山实验室精选模板 🎨
            </span>
            <PresetTemplates onSelect={handleMarkdownChange} theme={theme} />
          </div>
        </section>

        {/* RIGHT COLUMN: INTERACTIVE VISVIEW (7 cols) */}
        <section className="lg:col-span-7 flex flex-col gap-4">
          
          {/* Tabs for switching visual representations */}
          <div className="bg-white/85 dark:bg-dark-surface/85 backdrop-blur-md rounded-2xl p-2.5 border border-light-border dark:border-dark-border shadow-sm flex items-center justify-between">
            <div className="flex gap-1.5 w-full">
              
              <button
                onClick={() => setActiveTab('timeline')}
                className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all duration-300 ${
                  activeTab === 'timeline'
                    ? 'bg-primary text-white shadow-md shadow-primary/20'
                    : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-light-surface dark:hover:bg-dark-surface/50'
                }`}
              >
                <Milestone size={14} />
                Timeline 时间线 ({parsedData.events.length})
              </button>

              <button
                onClick={() => setActiveTab('board')}
                className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all duration-300 ${
                  activeTab === 'board'
                    ? 'bg-primary text-white shadow-md shadow-primary/20'
                    : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-light-surface dark:hover:bg-dark-surface/50'
                }`}
              >
                <Kanban size={14} />
                Board 看板 ({parsedData.cards.length})
              </button>

              <button
                onClick={() => setActiveTab('graph')}
                className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all duration-300 ${
                  activeTab === 'graph'
                    ? 'bg-primary text-white shadow-md shadow-primary/20'
                    : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-light-surface dark:hover:bg-dark-surface/50'
                }`}
              >
                <Network size={14} />
                Graph 关系网 ({parsedData.nodes.length})
              </button>

            </div>
          </div>

          {/* ACTIVE VIEW PORTAL CONTAINER */}
          <div className="flex-1 bg-white/50 dark:bg-dark-surface/30 backdrop-blur-sm rounded-3xl p-4 md:p-6 border border-light-border dark:border-dark-border shadow-sm overflow-hidden flex flex-col justify-start min-h-[450px]">
            
            {/* View Title Info */}
            <div className="mb-4 flex items-center justify-between text-xs text-gray-500 px-1 border-b border-light-border dark:border-dark-border pb-3">
              <span className="font-bold flex items-center gap-1 text-gray-800 dark:text-gray-200 uppercase">
                {activeTab === 'timeline' && <Milestone size={13} className="text-[#10b981]" />}
                {activeTab === 'board' && <Kanban size={13} className="text-[#f59e0b]" />}
                {activeTab === 'graph' && <Network size={13} className="text-[#aa3bff]" />}
                {activeTab === 'timeline' && '交互式项目时间线 / 里程碑流'}
                {activeTab === 'board' && '敏捷看板视图 / 卡片流'}
                {activeTab === 'graph' && '项目全景知识图谱 (力导向图)'}
              </span>
              <span className="text-[10px] font-semibold text-primary bg-primary-light dark:bg-primary/20 px-2 py-0.5 rounded-full capitalize">
                实时编译中
              </span>
            </div>

            {/* Dynamic Rendering Views */}
            <div className="flex-1 overflow-y-auto max-h-[650px] rounded-2xl">
              {activeTab === 'timeline' && (
                parsedData.events.length === 0 ? (
                  <div className="py-24 text-center">
                    <p className="text-sm text-gray-400 mb-1">未检测到 Timeline 格式的内容</p>
                    <p className="text-xs text-gray-400">请参照 ## Timeline 并输入带有日期 [YYYY-MM-DD] 的列表项。</p>
                  </div>
                ) : (
                  <TimelineView events={parsedData.events} />
                )
              )}

              {activeTab === 'board' && (
                parsedData.cards.length === 0 ? (
                  <div className="py-24 text-center">
                    <p className="text-sm text-gray-400 mb-1">未检测到 Board 格式的内容</p>
                    <p className="text-xs text-gray-400">请参照 ## Board 并书写带有选择框 - [ ] 的列表项。</p>
                  </div>
                ) : (
                  <BoardView cards={parsedData.cards} onCardStatusChange={handleCardStatusChange} />
                )
              )}

              {activeTab === 'graph' && (
                parsedData.nodes.length <= 1 ? (
                  <div className="py-24 text-center">
                    <p className="text-sm text-gray-400 mb-1">未检测到 Graph 格式的内容</p>
                    <p className="text-xs text-gray-400">请参照 ## Graph 书写节点及其关系，或者让系统默认生成项目关联图。</p>
                  </div>
                ) : (
                  <SimpleForceGraph nodes={parsedData.nodes} links={parsedData.links} theme={theme} />
                )
              )}
            </div>

          </div>
        </section>

      </main>

      {/* FOOTER */}
      <footer className="bg-white/40 dark:bg-dark-bg/40 border-t border-light-border dark:border-dark-border py-6 px-6 mt-12 text-center text-xs text-gray-500">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-gray-700 dark:text-gray-300">看山先生的AI实验室</span>
            <span className="text-gray-400">|</span>
            <span>Morpheus 可视化画布开源项目</span>
          </div>
          <div className="flex gap-4 items-center">
            <a 
              href="https://github.com" 
              target="_blank" 
              rel="noreferrer" 
              className="hover:text-primary transition-colors flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5 fill-current inline" viewBox="0 0 16 16">
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.93.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
              </svg>
              GitHub 仓库
            </a>
            <span className="text-gray-300">|</span>
            <span className="text-gray-400">Designed with 💜 by Morpheus Agent</span>
          </div>
        </div>
      </footer>

      {/* MODAL WINDOWS */}
      <ShareModal 
        markdown={markdown}
        projectName={parsedData.projectName}
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
      />

    </div>
  );
}
