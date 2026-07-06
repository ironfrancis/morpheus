import React, { useState } from 'react';
import { Note } from '../utils/markdown';
import { X, Save, Eye, EyeOff, Link2 } from 'lucide-react';

interface NoteEditorProps {
  note: Note;
  allNotes: Record<string, Note>;
  onClose: () => void;
  onSave: (id: string, updatedContent: string) => void;
  onSelectNote: (id: string) => void;
}

export const NoteEditor: React.FC<NoteEditorProps> = ({
  note,
  allNotes,
  onClose,
  onSave,
  onSelectNote,
}) => {
  const [content, setContent] = useState<string>(() => {
    // 重新组合 Frontmatter 和正文
    const lines = ['---'];
    Object.entries(note.frontmatter).forEach(([key, val]) => {
      if (val === undefined || val === null) return;
      if (Array.isArray(val)) {
        lines.push(`${key}: [${val.join(', ')}]`);
      } else {
        lines.push(`${key}: ${val}`);
      }
    });
    lines.push('---');
    return `${lines.join('\n')}\n${note.content}`;
  });

  const [isPreview, setIsPreview] = useState<boolean>(false);

  const handleSave = () => {
    onSave(note.id, content);
  };

  // 简单的 Markdown 预览渲染（支持双向链接高亮）
  const renderPreview = () => {
    const lines = content.split('\n');
    let inFrontmatter = false;
    const contentLines: string[] = [];

    // 过滤掉 Frontmatter 头部
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (i === 0 && line.trim() === '---') {
        inFrontmatter = true;
        continue;
      }
      if (inFrontmatter && line.trim() === '---') {
        inFrontmatter = false;
        continue;
      }
      if (!inFrontmatter) {
        contentLines.push(line);
      }
    }

    const markdownText = contentLines.join('\n');

    const wikiLinkRegex = /\[\[(.*?)\]\]/g;

    // 简单文本替换，保留换行
    const textWithLinks = markdownText.split('\n').map((line, lineIdx) => {
      const elements: React.ReactNode[] = [];
      let currentIdx = 0;
      let m;

      // 重置正则
      wikiLinkRegex.lastIndex = 0;

      while ((m = wikiLinkRegex.exec(line)) !== null) {
        // 添加匹配前的普通文本
        if (m.index > currentIdx) {
          elements.push(line.slice(currentIdx, m.index));
        }

        const fullLink = m[1];
        const pipeIndex = fullLink.indexOf('|');
        const targetId = pipeIndex !== -1 ? fullLink.slice(0, pipeIndex).trim() : fullLink.trim();
        const displayName = pipeIndex !== -1 ? fullLink.slice(pipeIndex + 1).trim() : targetId;
        const normalizedId = targetId.toLowerCase().replace(/\s+/g, '-');

        const targetExists = !!allNotes[normalizedId];

        elements.push(
          <button
            key={m.index}
            onClick={() => targetExists && onSelectNote(normalizedId)}
            className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded font-medium text-xs transition-colors ${
              targetExists
                ? 'bg-indigo-50 hover:bg-indigo-100 text-indigo-600 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/40 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/30'
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

      // 简单渲染标题和列表
      const lineStr = line.trim();
      if (lineStr.startsWith('# ')) {
        return <h1 key={lineIdx} className="text-2xl font-bold border-b border-slate-100 dark:border-slate-900 pb-2 mb-4 mt-4 text-slate-800 dark:text-slate-100">{elements.slice(1)}</h1>;
      } else if (lineStr.startsWith('## ')) {
        return <h2 key={lineIdx} className="text-xl font-bold mb-3 mt-4 text-slate-800 dark:text-slate-100">{elements.slice(1)}</h2>;
      } else if (lineStr.startsWith('### ')) {
        return <h3 key={lineIdx} className="text-lg font-bold mb-2 mt-3 text-slate-800 dark:text-slate-100">{elements.slice(1)}</h3>;
      } else if (lineStr.startsWith('- ') || lineStr.startsWith('* ')) {
        return <li key={lineIdx} className="ml-4 list-disc text-sm text-slate-600 dark:text-slate-300 mb-1">{elements.slice(1)}</li>;
      } else if (lineStr.startsWith('> ')) {
        return <blockquote key={lineIdx} className="border-l-4 border-indigo-500 bg-indigo-50/20 dark:bg-indigo-950/10 pl-4 py-1.5 my-2 text-sm italic text-slate-600 dark:text-slate-400 rounded-r">{elements.slice(1)}</blockquote>;
      }

      return <p key={lineIdx} className="text-sm text-slate-600 dark:text-slate-300 min-h-[1.5rem] leading-relaxed mb-2">{elements}</p>;
    });

    return <div className="space-y-1">{textWithLinks}</div>;
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-950 border-l border-slate-200 dark:border-slate-800 w-[450px] shadow-2xl relative z-20">
      {/* 侧边栏头部 */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
            {note.id}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsPreview(!isPreview)}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
            title={isPreview ? '编辑模式' : '预览模式'}
          >
            {isPreview ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
          <button
            onClick={handleSave}
            className="p-1.5 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 transition-colors"
            title="保存"
          >
            <Save size={18} />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
            title="关闭"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* 编辑或预览区域 */}
      <div className="flex-1 overflow-y-auto p-6">
        {isPreview ? (
          <div className="prose dark:prose-invert max-w-none">
            {renderPreview()}
          </div>
        ) : (
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full h-full resize-none bg-transparent border-0 focus:ring-0 text-sm font-mono text-slate-800 dark:text-slate-200 focus:outline-none leading-relaxed"
            placeholder="输入 Markdown 内容，支持 YAML Frontmatter 与 [[双向链接]]..."
          />
        )}
      </div>

      {/* 反向链接面板 */}
      {note.backlinks.length > 0 && (
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20">
          <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1">
            <Link2 size={12} />
            反向链接 (Backlinks)
          </h4>
          <div className="flex flex-wrap gap-2">
            {note.backlinks.map(backlinkId => {
              const backlinkNote = allNotes[backlinkId];
              return (
                <button
                  key={backlinkId}
                  onClick={() => onSelectNote(backlinkId)}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 hover:border-indigo-500 dark:hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 shadow-sm transition-all"
                >
                  {backlinkNote?.title || backlinkId}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
